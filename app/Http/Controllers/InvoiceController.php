<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceItemMaterial;
use App\Models\InvoiceItemProductionStep;
use App\Models\Item;
use App\Models\Product;
use App\Models\Size;
use App\Models\StockMutation;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
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

    public function showPage(Invoice $invoice): Response
    {
        $invoice->load([
            'customer',
            'items.product.images',
            'items.product.sizes',
            'items.product.productionSteps.productionStep',
            'items.productionSteps.assignee',
            'items.productionAssignments.assignee',
            'items.productionAssignments.steps',
            'items.product.materials.item.unit',
            'creator',
        ]);

        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Invoice/Show', [
            'invoice' => $invoice,
            'users' => $users,
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
                $num = (int) $clean;
                if ($num > $maxNum) {
                    $maxNum = $num;
                }
            }
        }

        $nextNumber = $prefix.str_pad($maxNum + 1, 3, '0', STR_PAD_LEFT);

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
                // Normalize size_breakdown: support both old format {size: qty} and new {size: {qty, price}}
                $sizeBreakdown = $itemData['size_breakdown'] ?? null;
                $normalizedBreakdown = null;
                if (! empty($sizeBreakdown)) {
                    if (is_string($sizeBreakdown)) {
                        $sizeBreakdown = json_decode($sizeBreakdown, true);
                    }
                    if (is_array($sizeBreakdown)) {
                        $normalizedBreakdown = [];
                        foreach ($sizeBreakdown as $sizeKey => $sizeData) {
                            if (is_array($sizeData) && isset($sizeData['qty'])) {
                                // New format: {size: {qty: X, price: Y}}
                                $normalizedBreakdown[$sizeKey] = [
                                    'qty' => (int) $sizeData['qty'],
                                    'price' => isset($sizeData['price']) ? (float) $sizeData['price'] : (float) $itemData['unit_price'],
                                ];
                            } elseif (is_numeric($sizeData)) {
                                // Old format: {size: qty}
                                $normalizedBreakdown[$sizeKey] = [
                                    'qty' => (int) $sizeData,
                                    'price' => (float) $itemData['unit_price'],
                                ];
                            }
                        }
                    }
                }

                $invoiceItem = InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $itemData['product_id'] ?? null,
                    'item_name' => $itemData['item_name'],
                    'unit' => $itemData['unit'],
                    'qty' => $itemData['qty'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['subtotal'],
                    'size_breakdown' => $normalizedBreakdown,
                    'description' => $itemData['description'] ?? null,
                ]);

                $this->syncProductionSteps($invoiceItem);

                // If cut_stock is active and item is linked to a Product, deduct raw materials
                if ($invoice->cut_stock && ! empty($itemData['product_id'])) {
                    $product = Product::with('materials.item')->find($itemData['product_id']);
                    if ($product && $product->materials->isNotEmpty()) {
                        // Parse size breakdown (extract qty only for BOM calculation)
                        $breakdownMap = [];
                        $rawBreakdown = $itemData['size_breakdown'] ?? null;
                        if (! empty($rawBreakdown)) {
                            if (is_string($rawBreakdown)) {
                                $rawBreakdown = json_decode($rawBreakdown, true);
                            }
                            if (is_array($rawBreakdown)) {
                                foreach ($rawBreakdown as $k => $v) {
                                    if (is_array($v) && isset($v['qty'])) {
                                        // New format: {size: {qty, price}}
                                        $breakdownMap[trim($k)] = (float) $v['qty'];
                                    } elseif (is_array($v) && isset($v['size']) && isset($v['qty'])) {
                                        // Alternative format: {size: {size: "M", qty: 10}}
                                        $breakdownMap[trim($v['size'])] = (float) $v['qty'];
                                    } elseif (is_numeric($v)) {
                                        // Old format: {size: qty}
                                        $breakdownMap[trim($k)] = (float) $v;
                                    }
                                }
                            }
                        }

                        // Calculate total needed per raw item using Two-Stage Formula:
                        // Stage 1: Usage Qty (Meter) = (Size Qty / Yield Qty) * Required Qty
                        // Stage 2: Warehouse Qty (Kg) = Usage Qty / Conversion Rate
                        $deductions = []; // [item_id => ['item' => Item, 'total_usage_qty' => float, 'total_warehouse_qty' => float, 'usage_unit' => string, 'warehouse_unit' => string]]

                        if (! empty($breakdownMap)) {
                            // Calculate per size
                            foreach ($breakdownMap as $sizeName => $sizeQty) {
                                if ($sizeQty <= 0) {
                                    continue;
                                }

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
                                        $requiredQty = (float) ($sizeRule->required_qty ?: 0);
                                        $yieldQty = max(0.0001, (float) ($sizeRule->yield_qty ?: 1.0));
                                        $conversionRate = max(0.0001, (float) ($sizeRule->conversion_rate ?: ($rawItem->conversion_rate ?: 1.0)));

                                        // Stage 1: Kebutuhan pola pakai
                                        $usageQty = ($sizeQty / $yieldQty) * $requiredQty;
                                        // Stage 2: Potongan stok gudang
                                        $warehouseQty = $usageQty / $conversionRate;

                                        if (! isset($deductions[$matItemId])) {
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

                                        // Snapshot parameter BOM per item+size ke invoice_item_materials
                                        $sizeId = null;
                                        if (! empty($sizeName)) {
                                            $matchedSize = Size::where('size_name', $sizeName)->first();
                                            if ($matchedSize) {
                                                $sizeId = $matchedSize->id;
                                            }
                                        }

                                        $materialSnapshot = new InvoiceItemMaterial;
                                        $materialSnapshot->invoice_item_id = $invoiceItem->id;
                                        $materialSnapshot->item_id = $rawItem->id;
                                        $materialSnapshot->item_name = $rawItem->name;
                                        $materialSnapshot->required_qty = $requiredQty;
                                        $materialSnapshot->yield_qty = $yieldQty;
                                        $materialSnapshot->conversion_rate = $conversionRate;
                                        $materialSnapshot->unit_name = $sizeRule->unit_name ?: ($rawItem->unit?->name ?: 'Meter');
                                        $materialSnapshot->qty_used = $warehouseQty;
                                        $materialSnapshot->size_id = $sizeId;
                                        $materialSnapshot->save();
                                    }
                                }
                            }
                        } else {
                            // Fallback if no size breakdown: use default recipes with total line qty
                            $totalLineQty = (float) ($itemData['qty'] ?? 0);
                            $defaultMaterials = $product->materials->filter(function ($m) {
                                return empty($m->size_name) || $m->size_name === 'ALL';
                            });

                            foreach ($defaultMaterials as $mat) {
                                if ($mat->item) {
                                    $rawItem = $mat->item;
                                    $matItemId = $mat->item_id;
                                    $requiredQty = (float) ($mat->required_qty ?: 0);
                                    $yieldQty = max(0.0001, (float) ($mat->yield_qty ?: 1.0));
                                    $conversionRate = max(0.0001, (float) ($mat->conversion_rate ?: ($rawItem->conversion_rate ?: 1.0)));

                                    // Stage 1: Kebutuhan pola pakai
                                    $usageQty = ($totalLineQty / $yieldQty) * $requiredQty;
                                    // Stage 2: Potongan stok gudang
                                    $warehouseQty = $usageQty / $conversionRate;

                                    if (! isset($deductions[$matItemId])) {
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

                                    // Snapshot parameter BOM per item (tanpa size spesifik) ke invoice_item_materials
                                    $materialSnapshot = new InvoiceItemMaterial;
                                    $materialSnapshot->invoice_item_id = $invoiceItem->id;
                                    $materialSnapshot->item_id = $rawItem->id;
                                    $materialSnapshot->item_name = $rawItem->name;
                                    $materialSnapshot->required_qty = $requiredQty;
                                    $materialSnapshot->yield_qty = $yieldQty;
                                    $materialSnapshot->conversion_rate = $conversionRate;
                                    $materialSnapshot->unit_name = $mat->unit_name ?: ($rawItem->unit?->name ?: 'Meter');
                                    $materialSnapshot->qty_used = $warehouseQty;
                                    $materialSnapshot->size_id = null;
                                    $materialSnapshot->save();
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
                                $stockBefore = (float) ($rawItem->real_stock ?? 0);
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
            'items.productionSteps.assignee',
            'items.productionAssignments.assignee',
            'items.productionAssignments.steps',
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

    public function print(Invoice $invoice)
    {
        $invoice->load([
            'customer',
            'items.product.sizes',
            'creator',
        ]);

        // F4 landscape is roughly 215.9mm x 330.2mm (or we can just use standard a4 landscape)
        // dompdf accepts standard named sizes like 'a4', 'legal', 'letter', or array of points.
        // F4 is often (0,0, 609.448, 935.433).
        $pdf = Pdf::loadView('invoice-pdf', compact('invoice'))
            ->setPaper('a5', 'landscape');

        return $pdf->stream('Struk-'.$invoice->invoice_number.'.pdf');
    }

    public function printProductionPDF(Invoice $invoice)
    {
        $invoice->load([
            'customer',
            'items.product.images',
            'items.product.sizes',
            'items.product.productionSteps.productionStep',
            'items.productionSteps.assignee',
            'items.product.materials.item.unit',
            'creator',
        ]);

        $pdf = Pdf::loadView('production-pdf', compact('invoice'))
            ->setPaper('a4', 'portrait');

        return $pdf->stream('SPK-'.$invoice->invoice_number.'.pdf');
    }

    private function syncProductionSteps(InvoiceItem $invoiceItem)
    {
        // Check if steps already exist. If we are updating and product hasn't changed, we might not want to wipe them
        // to preserve assigned workers and status. Let's only create if they don't exist, or if product changed.
        // For simplicity, let's say if count == 0, we create them. If product changed, we wipe and recreate.
        $existingCount = $invoiceItem->productionSteps()->count();
        if ($existingCount === 0 && $invoiceItem->product_id) {
            $product = Product::with('productionSteps.productionStep')->find($invoiceItem->product_id);
            if ($product) {
                foreach ($product->productionSteps as $step) {
                    InvoiceItemProductionStep::create([
                        'invoice_item_id' => $invoiceItem->id,
                        'production_step_id' => $step->production_step_id,
                        'step_name' => $step->custom_name ?: ($step->productionStep->name ?? 'Tahap Produksi'),
                        'wage' => $step->wage,
                        'step_order' => $step->sort_order,
                        'status' => 'PENDING',
                    ]);
                }
            }
        }
    }
}
