<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Item;
use App\Models\Product;
use App\Models\StockMutation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function page(): Response
    {
        return Inertia::render('Invoice/Index');
    }

    public function createPage(Request $request): Response
    {
        return Inertia::render('Invoice/Create', [
            'initialType' => $request->query('type', 'REGULAR'),
        ]);
    }

    public function createHistoricalPage(): Response
    {
        return Inertia::render('Invoice/Create', [
            'initialType' => 'HISTORICAL',
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['customer', 'items.product.productionSteps.productionStep', 'items.product.sizes.size', 'items.product.materials.item', 'creator']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($c) use ($search) {
                      $c->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('order_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('order_date', '<=', $request->end_date);
        }

        $invoices = $query->latest('order_date')->latest('id')->get();

        // Summary statistics
        $totalInvoices = $invoices->count();
        $totalOmset = $invoices->sum('total_amount');
        $totalPaid = $invoices->sum('paid_amount');
        $totalUnpaid = $totalOmset - $totalPaid;

        return response()->json([
            'data' => $invoices,
            'summary' => [
                'total_invoices' => $totalInvoices,
                'total_omset' => $totalOmset,
                'total_paid' => $totalPaid,
                'total_unpaid' => max(0, $totalUnpaid),
            ],
        ]);
    }

    public function nextNumber(Request $request): JsonResponse
    {
        $year = $request->input('year', date('Y'));
        $prefix = "INV-{$year}-";

        $invoices = Invoice::where('invoice_number', 'like', "{$prefix}%")->pluck('invoice_number')->toArray();
        $maxNum = 0;

        foreach ($invoices as $invNum) {
            $clean = str_replace($prefix, '', $invNum);
            if (is_numeric($clean)) {
                $num = (int)$clean;
                if ($num > $maxNum) {
                    $maxNum = $num;
                }
            }
        }

        $nextNumber = $prefix . str_pad($maxNum + 1, 3, '0', STR_PAD_LEFT);

        return response()->json([
            'invoice_number' => $nextNumber,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_number' => 'required|string|max:50|unique:invoices,invoice_number',
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'required|string|max:255',
            'order_date' => 'required|date',
            'completion_date' => 'nullable|date',
            'type' => 'required|string|in:HISTORICAL,REGULAR',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'payment_status' => 'required|string|in:LUNAS,DP,BELUM_LUNAS',
            'production_status' => 'nullable|string|in:SELESAI,PROSES,PENDING',
            'cut_stock' => 'boolean',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.unit' => 'required|string|max:50',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.subtotal' => 'required|numeric|min:0',
            'items.*.size_breakdown' => 'nullable|array',
            'items.*.description' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $invoice = Invoice::create([
                'invoice_number' => $validated['invoice_number'],
                'customer_id' => $validated['customer_id'] ?? null,
                'customer_name' => $validated['customer_name'],
                'order_date' => $validated['order_date'],
                'completion_date' => $validated['completion_date'] ?? null,
                'type' => $validated['type'],
                'subtotal' => $validated['subtotal'],
                'discount' => $validated['discount'] ?? 0,
                'total_amount' => $validated['total_amount'],
                'paid_amount' => $validated['paid_amount'] ?? 0,
                'payment_status' => $validated['payment_status'],
                'production_status' => $validated['production_status'] ?? 'SELESAI',
                'cut_stock' => $request->boolean('cut_stock', false),
                'notes' => $validated['notes'] ?? null,
                'created_by' => Auth::id(),
            ]);

            foreach ($validated['items'] as $itemData) {
                $invoiceItem = InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $itemData['product_id'] ?? null,
                    'item_name' => $itemData['item_name'],
                    'unit' => $itemData['unit'],
                    'qty' => $itemData['qty'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['subtotal'],
                    'size_breakdown' => $itemData['size_breakdown'] ?? null,
                    'description' => $itemData['description'] ?? null,
                ]);

                // If cut_stock is active and item is linked to a Product, deduct raw materials
                if ($invoice->cut_stock && !empty($itemData['product_id'])) {
                    $product = Product::with('materials.item')->find($itemData['product_id']);
                    if ($product && $product->materials->isNotEmpty()) {
                        // Parse size breakdown
                        $breakdownMap = [];
                        $rawBreakdown = $itemData['size_breakdown'] ?? null;
                        if (!empty($rawBreakdown)) {
                            if (is_string($rawBreakdown)) {
                                $rawBreakdown = json_decode($rawBreakdown, true);
                            }
                            if (is_array($rawBreakdown)) {
                                foreach ($rawBreakdown as $k => $v) {
                                    if (is_array($v) && isset($v['size']) && isset($v['qty'])) {
                                        $breakdownMap[trim($v['size'])] = (float)$v['qty'];
                                    } elseif (is_numeric($v)) {
                                        $breakdownMap[trim($k)] = (float)$v;
                                    }
                                }
                            }
                        }

                        // Calculate total needed per raw item using Two-Stage Formula:
                        // Stage 1: Usage Qty (Meter) = (Size Qty / Yield Qty) * Required Qty
                        // Stage 2: Warehouse Qty (Kg) = Usage Qty / Conversion Rate
                        $deductions = []; // [item_id => ['item' => Item, 'total_usage_qty' => float, 'total_warehouse_qty' => float, 'usage_unit' => string, 'warehouse_unit' => string]]

                        if (!empty($breakdownMap)) {
                            // Calculate per size
                            foreach ($breakdownMap as $sizeName => $sizeQty) {
                                if ($sizeQty <= 0) continue;

                                // Get materials specifically configured for this size
                                $sizeMaterials = $product->materials->filter(function ($m) use ($sizeName) {
                                    return $m->size_name === $sizeName;
                                });

                                // Fallback to universal materials if this size has no specific BOM
                                if ($sizeMaterials->isEmpty()) {
                                    $sizeMaterials = $product->materials->filter(function ($m) {
                                        return empty($m->size_name) || $m->size_name === 'ALL';
                                    });
                                }

                                foreach ($sizeMaterials as $sizeRule) {
                                    if ($sizeRule && $sizeRule->item) {
                                        $rawItem = $sizeRule->item;
                                        $matItemId = $sizeRule->item_id;
                                        $requiredQty = (float)($sizeRule->required_qty ?: 0);
                                        $yieldQty = max(0.0001, (float)($sizeRule->yield_qty ?: 1.0));
                                        $conversionRate = max(0.0001, (float)($sizeRule->conversion_rate ?: ($rawItem->conversion_rate ?: 1.0)));

                                        // Stage 1: Kebutuhan pola pakai
                                        $usageQty = ($sizeQty / $yieldQty) * $requiredQty;
                                        // Stage 2: Potongan stok gudang
                                        $warehouseQty = $usageQty / $conversionRate;

                                        if (!isset($deductions[$matItemId])) {
                                            $deductions[$matItemId] = [
                                                'item' => $rawItem,
                                                'total_usage_qty' => 0,
                                                'total_warehouse_qty' => 0,
                                                'usage_unit' => $sizeRule->unit_name ?: ($rawItem->unit?->name ?: 'Meter'),
                                                'warehouse_unit' => $rawItem->unit?->name ?: 'Pcs',
                                            ];
                                        }
                                        $deductions[$matItemId]['total_usage_qty'] += $usageQty;
                                        $deductions[$matItemId]['total_warehouse_qty'] += $warehouseQty;
                                    }
                                }
                            }
                        } else {
                            // Fallback if no size breakdown: use default recipes with total line qty
                            $totalLineQty = (float)($itemData['qty'] ?? 0);
                            $defaultMaterials = $product->materials->filter(function ($m) {
                                return empty($m->size_name) || $m->size_name === 'ALL';
                            });

                            foreach ($defaultMaterials as $mat) {
                                if ($mat->item) {
                                    $rawItem = $mat->item;
                                    $matItemId = $mat->item_id;
                                    $requiredQty = (float)($mat->required_qty ?: 0);
                                    $yieldQty = max(0.0001, (float)($mat->yield_qty ?: 1.0));
                                    $conversionRate = max(0.0001, (float)($mat->conversion_rate ?: ($rawItem->conversion_rate ?: 1.0)));

                                    // Stage 1: Kebutuhan pola pakai
                                    $usageQty = ($totalLineQty / $yieldQty) * $requiredQty;
                                    // Stage 2: Potongan stok gudang
                                    $warehouseQty = $usageQty / $conversionRate;

                                    if (!isset($deductions[$matItemId])) {
                                        $deductions[$matItemId] = [
                                            'item' => $rawItem,
                                            'total_usage_qty' => 0,
                                            'total_warehouse_qty' => 0,
                                            'usage_unit' => $mat->unit_name ?: ($rawItem->unit?->name ?: 'Meter'),
                                            'warehouse_unit' => $rawItem->unit?->name ?: 'Pcs',
                                        ];
                                    }
                                    $deductions[$matItemId]['total_usage_qty'] += $usageQty;
                                    $deductions[$matItemId]['total_warehouse_qty'] += $warehouseQty;
                                }
                            }
                        }

                        // Apply deductions & stock mutations
                        foreach ($deductions as $d) {
                            $rawItem = $d['item'];
                            $warehouseDeduction = round($d['total_warehouse_qty'], 4);
                            $usageTotal = round($d['total_usage_qty'], 4);
                            $usageUnit = $d['usage_unit'] ?? 'Meter';
                            $warehouseUnit = $d['warehouse_unit'] ?? 'Pcs';

                            if ($rawItem && $warehouseDeduction > 0) {
                                $stockBefore = (float)($rawItem->real_stock ?? 0);
                                $stockAfter = max(0, $stockBefore - $warehouseDeduction);

                                $rawItem->update([
                                    'real_stock' => $stockAfter,
                                    'stock' => max(0, ($rawItem->stock ?? 0) - $warehouseDeduction),
                                ]);

                                $note = "Pemotongan bahan: {$usageTotal} {$usageUnit} (setara {$warehouseDeduction} {$warehouseUnit}) untuk Invoice #{$invoice->invoice_number} ({$invoiceItem->item_name} x {$invoiceItem->qty})";

                                StockMutation::create([
                                    'item_id' => $rawItem->id,
                                    'user_id' => Auth::id(),
                                    'type' => 'out',
                                    'quantity' => $warehouseDeduction,
                                    'unit_id' => $rawItem->unit_id,
                                    'multiplier' => 1,
                                    'total_base_quantity' => $warehouseDeduction,
                                    'previous_stock' => $stockBefore,
                                    'current_stock' => $stockAfter,
                                    'notes' => $note,
                                    'reference_no' => $invoice->invoice_number,
                                    'mutation_date' => now(),
                                ]);
                            }
                        }
                    }
                }
            }

            $invoice->load(['customer', 'items.product.images', 'items.product.sizes', 'items.product.productionSteps.productionStep', 'creator']);

            return response()->json([
                'message' => 'Invoice berhasil disimpan',
                'data' => $invoice,
            ], 201);
        });
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load([
            'customer',
            'items.product.images',
            'items.product.sizes',
            'items.product.productionSteps.productionStep',
            'items.product.materials.item.unit',
            'creator',
        ]);

        return response()->json([
            'data' => $invoice,
        ]);
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();

        return response()->json([
            'message' => 'Invoice berhasil dihapus',
        ]);
    }
}
