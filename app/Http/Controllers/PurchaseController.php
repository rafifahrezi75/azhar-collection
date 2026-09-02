<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Models\ItemConversion;
use App\Models\Purchase;
use App\Models\StockMutation;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $query = Purchase::query()->with('creator');

        if ($request->has('search')) {
            $query->where('reference_no', 'like', '%'.$request->search.'%')
                ->orWhere('supplier_name', 'like', '%'.$request->search.'%');
        }

        $purchases = $query->latest('date')->get();

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
        ]);
    }

    public function create()
    {
        $items = Item::with(['unit', 'conversions.unit'])->where('is_active', true)->orderBy('name')->get();
        $categories = Category::where('is_active', true)->orderBy('name')->get();
        $units = Unit::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Purchases/Create', [
            'items' => $items,
            'categories' => $categories,
            'units' => $units,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'supplier_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.unit_id' => 'required|exists:units,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request) {
            $totalAmount = 0;

            foreach ($request->items as $item) {
                $totalAmount += ($item['quantity'] * $item['unit_price']);
            }

            $lastPurchase = Purchase::latest('id')->first();
            $nextId = $lastPurchase ? $lastPurchase->id + 1 : 1;
            $referenceNo = 'PUR-'.date('Ymd').'-'.str_pad($nextId, 4, '0', STR_PAD_LEFT);

            $purchase = Purchase::create([
                'reference_no' => $referenceNo,
                'supplier_name' => $request->supplier_name,
                'date' => $request->date,
                'total_amount' => $totalAmount,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            foreach ($request->items as $index => $itemData) {
                $item = Item::where('id', $itemData['item_id'])->lockForUpdate()->first();
                $unitId = (int) $itemData['unit_id'];
                $quantity = (int) $itemData['quantity'];
                $isBaseUnit = $unitId === (int) $item->unit_id;
                $conv = null;
                $multiplier = 1;

                if (! $isBaseUnit) {
                    $conv = ItemConversion::where('item_id', $item->id)
                        ->where('unit_id', $unitId)
                        ->first();

                    if (! $conv) {
                        throw ValidationException::withMessages([
                            "items.{$index}.unit_id" => 'Satuan yang dipilih tidak terdaftar untuk barang ini.',
                        ]);
                    }

                    $multiplier = max(1, (int) $conv->multiplier);
                }

                $subtotal = $quantity * $itemData['unit_price'];
                $previousStock = (int) $item->stock;
                $baseQty = $quantity * $multiplier;

                $purchase->items()->create([
                    'item_id' => $item->id,
                    'unit_id' => $unitId,
                    'quantity' => $quantity,
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $subtotal,
                ]);

                if ($conv) {
                    $conv->real_stock = ((int) ($conv->real_stock ?? 0)) + $quantity;
                    $conv->save();
                } else {
                    $item->real_stock = ((int) ($item->real_stock ?? 0)) + $quantity;
                }

                $item->recalculateTotalStock();
                $item->save();

                StockMutation::create([
                    'item_id' => $item->id,
                    'user_id' => auth()->id(),
                    'type' => 'in',
                    'quantity' => $quantity,
                    'unit_id' => $unitId,
                    'multiplier' => $multiplier,
                    'total_base_quantity' => $baseQty,
                    'previous_stock' => $previousStock,
                    'current_stock' => (int) $item->stock,
                    'notes' => 'Pembelian/Restock: '.$referenceNo,
                    'reference_no' => $referenceNo,
                    'mutation_date' => $request->date,
                ]);
            }
        });

        return redirect()->route('purchases.index')->with('success', 'Transaksi pembelian berhasil disimpan.');
    }

    public function show(Purchase $purchase)
    {
        $purchase->load(['items.item.unit', 'items.item.conversions.unit', 'items.unit', 'creator']);

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase,
        ]);
    }

    public function previewPage(Purchase $purchase)
    {
        $purchase->load(['items.item.unit', 'items.item.conversions.unit', 'items.unit', 'creator']);

        return Inertia::render('Purchases/PdfPreview', [
            'purchase' => $purchase,
        ]);
    }

    public function printPdf(Purchase $purchase)
    {
        $purchase->load(['items.item.unit', 'items.item.conversions.unit', 'items.unit', 'creator']);

        $pdf = Pdf::loadView('pdf.purchase', compact('purchase'));

        return $pdf->stream('Nota_Pembelian_'.$purchase->reference_no.'.pdf');
    }
}
