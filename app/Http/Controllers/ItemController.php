<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Models\ItemConversion;
use App\Models\StockMutation;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function page()
    {
        return Inertia::render('Barang/Index');
    }

    public function index()
    {
        $items = Item::with(['category', 'unit', 'conversions.unit'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }

    public function show(Item $item)
    {
        $item->load([
            'category',
            'unit',
            'conversions.unit',
            'mutations' => function ($q) {
                $q->with(['unit', 'user'])->latest('mutation_date')->limit(50);
            },
        ]);

        return response()->json([
            'data' => $item,
        ]);
    }

    public function formData()
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get();
        $units = Unit::where('is_active', true)->orderBy('name')->get();

        return response()->json([
            'categories' => $categories,
            'units' => $units,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100', 'unique:items,code'],
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'unit_id' => ['required', 'integer', 'exists:units,id'],
            'usage_unit' => ['nullable', 'string', 'max:50'],
            'conversion_rate' => ['nullable', 'numeric', 'min:0.0001'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'real_stock' => ['nullable', 'integer', 'min:0'],
            'estimated_stock' => ['nullable', 'integer', 'min:0'],
            'is_estimated_stock' => ['nullable'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:3072'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable'],
            'conversions' => ['nullable'],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('items', 'public');
        }

        $isActive = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);
        $isEstimatedStock = filter_var($request->input('is_estimated_stock', false), FILTER_VALIDATE_BOOLEAN);

        $realStock = 0;
        $estimatedStock = 0;
        if ($request->has('real_stock') || $request->has('estimated_stock')) {
            $realStock = max(0, (int) $request->input('real_stock', 0));
            $estimatedStock = max(0, (int) $request->input('estimated_stock', 0));
            $totalStock = $realStock + $estimatedStock;
        } else {
            $totalStock = max(0, (int) ($validated['stock'] ?? 0));
            if ($isEstimatedStock) {
                $estimatedStock = $totalStock;
                $realStock = 0;
            } else {
                $realStock = $totalStock;
                $estimatedStock = 0;
            }
        }
        $isEstimatedStock = $estimatedStock > 0;

        return DB::transaction(function () use ($validated, $imagePath, $isActive, $realStock, $estimatedStock, $totalStock, $isEstimatedStock, $request) {
            $item = Item::create([
                'code' => strtoupper(trim($validated['code'])),
                'name' => $validated['name'],
                'category_id' => $validated['category_id'],
                'unit_id' => $validated['unit_id'],
                'usage_unit' => !empty($validated['usage_unit']) ? trim($validated['usage_unit']) : null,
                'conversion_rate' => !empty($validated['conversion_rate']) ? (float)$validated['conversion_rate'] : 1.0,
                'price' => !empty($validated['price']) ? (float)$validated['price'] : 0,
                'stock' => $totalStock,
                'real_stock' => $realStock,
                'estimated_stock' => $estimatedStock,
                'is_estimated_stock' => $isEstimatedStock,
                'min_stock' => $validated['min_stock'] ?? 0,
                'image' => $imagePath,
                'description' => $validated['description'] ?? null,
                'is_active' => $isActive,
            ]);

            // Save initial stock mutation if stock > 0
            if ($totalStock > 0) {
                $note = 'Stok awal barang baru';
                if ($realStock > 0 && $estimatedStock > 0) {
                    $note = "Stok awal ({$realStock} nyata + {$estimatedStock} estimasi/sisaan)";
                } elseif ($estimatedStock > 0) {
                    $note = 'Stok awal (Estimasi/Sisaan)';
                }

                StockMutation::create([
                    'item_id' => $item->id,
                    'user_id' => auth()->id(),
                    'type' => 'in',
                    'quantity' => $totalStock,
                    'unit_id' => $item->unit_id,
                    'multiplier' => 1,
                    'total_base_quantity' => $totalStock,
                    'previous_stock' => 0,
                    'current_stock' => $totalStock,
                    'notes' => $note,
                    'reference_no' => 'INIT-' . $item->code,
                    'mutation_date' => now(),
                ]);
            }

            // Handle conversions first so recalculateTotalStock knows about them
            $this->syncConversions($item, $request->input('conversions'));
            $item->recalculateTotalStock();
            $item->save();

            $item->load(['category', 'unit', 'conversions.unit']);

            return response()->json([
                'message' => 'Data barang/bahan berhasil ditambahkan.',
                'data' => $item,
            ]);
        });
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100', Rule::unique('items', 'code')->ignore($item->id)],
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'unit_id' => ['required', 'integer', 'exists:units,id'],
            'usage_unit' => ['nullable', 'string', 'max:50'],
            'conversion_rate' => ['nullable', 'numeric', 'min:0.0001'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'real_stock' => ['nullable', 'integer', 'min:0'],
            'estimated_stock' => ['nullable', 'integer', 'min:0'],
            'is_estimated_stock' => ['nullable'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable'],
            'remove_image' => ['nullable'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable'],
            'conversions' => ['nullable'],
        ]);

        $imagePath = $item->image;

        $shouldRemoveImage = filter_var($request->input('remove_image', false), FILTER_VALIDATE_BOOLEAN);

        if ($shouldRemoveImage && $item->image) {
            Storage::disk('public')->delete($item->image);
            $imagePath = null;
        }

        if ($request->hasFile('image')) {
            $request->validate([
                'image' => ['image', 'mimes:jpeg,png,jpg,webp,gif', 'max:3072'],
            ]);

            if ($item->image) {
                Storage::disk('public')->delete($item->image);
            }
            $imagePath = $request->file('image')->store('items', 'public');
        }

        $isActive = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);
        $isEstimatedStock = filter_var($request->input('is_estimated_stock', false), FILTER_VALIDATE_BOOLEAN);

        $realStock = 0;
        $estimatedStock = 0;
        if ($request->has('real_stock') || $request->has('estimated_stock')) {
            $realStock = max(0, (int) $request->input('real_stock', 0));
            $estimatedStock = max(0, (int) $request->input('estimated_stock', 0));
            $newStock = $realStock + $estimatedStock;
        } else {
            $newStock = max(0, (int) ($validated['stock'] ?? 0));
            if ($isEstimatedStock) {
                $estimatedStock = $newStock;
                $realStock = 0;
            } else {
                $realStock = $newStock;
                $estimatedStock = 0;
            }
        }
        $isEstimatedStock = $estimatedStock > 0;

        return DB::transaction(function () use ($validated, $imagePath, $isActive, $realStock, $estimatedStock, $newStock, $isEstimatedStock, $request, $item) {
            $previousStock = $item->stock;

            $item->update([
                'code' => strtoupper(trim($validated['code'])),
                'name' => $validated['name'],
                'category_id' => $validated['category_id'],
                'unit_id' => $validated['unit_id'],
                'usage_unit' => !empty($validated['usage_unit']) ? trim($validated['usage_unit']) : null,
                'conversion_rate' => !empty($validated['conversion_rate']) ? (float)$validated['conversion_rate'] : 1.0,
                'price' => !empty($validated['price']) ? (float)$validated['price'] : 0,
                'stock' => $newStock,
                'real_stock' => $realStock,
                'estimated_stock' => $estimatedStock,
                'is_estimated_stock' => $isEstimatedStock,
                'min_stock' => $validated['min_stock'] ?? 0,
                'image' => $imagePath,
                'description' => $validated['description'] ?? null,
                'is_active' => $isActive,
            ]);

            // Sync conversions with their distinct stock amounts
            $this->syncConversions($item, $request->input('conversions'));
            $item->recalculateTotalStock();
            $item->save();

            // If total stock directly changed in edit form, log adjustment mutation
            if ($previousStock !== $item->stock) {
                $diff = $item->stock - $previousStock;
                StockMutation::create([
                    'item_id' => $item->id,
                    'user_id' => auth()->id(),
                    'type' => $diff > 0 ? 'in' : 'adjustment',
                    'quantity' => abs($diff),
                    'unit_id' => $item->unit_id,
                    'multiplier' => 1,
                    'total_base_quantity' => abs($diff),
                    'previous_stock' => $previousStock,
                    'current_stock' => $item->stock,
                    'notes' => 'Penyesuaian stok saat edit barang',
                    'reference_no' => 'ADJ-' . time(),
                    'mutation_date' => now(),
                ]);
            }

            $item->load(['category', 'unit', 'conversions.unit']);

            return response()->json([
                'message' => 'Data barang/bahan berhasil diperbarui.',
                'data' => $item,
            ]);
        });
    }

    public function adjustStock(Request $request, Item $item)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:in,out,adjustment'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_id' => ['required', 'integer', 'exists:units,id'],
            'stock_target' => ['nullable', 'in:auto,real,estimated'],
            'notes' => ['nullable', 'string'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'mutation_date' => ['nullable', 'date'],
        ]);

        $unitId = (int) $validated['unit_id'];
        $quantity = (int) $validated['quantity'];
        $type = $validated['type'];
        $target = $request->input('stock_target', 'auto');

        // Determine multiplier and conversion model
        $multiplier = 1;
        $conv = null;
        $isBaseUnit = ($unitId === (int) $item->unit_id);

        if (! $isBaseUnit) {
            $conv = ItemConversion::where('item_id', $item->id)
                ->where('unit_id', $unitId)
                ->first();

            if (! $conv) {
                return response()->json([
                    'message' => 'Satuan yang dipilih tidak terdaftar sebagai satuan konversi barang ini.',
                ], 422);
            }
            $multiplier = (int) $conv->multiplier;
        }

        $totalBaseQuantity = $quantity * $multiplier;
        $previousStock = (int) $item->stock;
        $baseUnitName = $item->unit ? ($item->unit->symbol ?: $item->unit->name) : 'pcs';

        return DB::transaction(function () use (
            $item,
            $conv,
            $isBaseUnit,
            $type,
            $quantity,
            $unitId,
            $multiplier,
            $totalBaseQuantity,
            $previousStock,
            $target,
            $validated,
            $baseUnitName
        ) {
            if ($type === 'out') {
                if ($previousStock < $totalBaseQuantity) {
                    return response()->json([
                        'message' => "Stok tidak mencukupi untuk diambil. Total stok saat ini setara: {$previousStock} {$baseUnitName}, sedangkan yang ingin diambil: {$totalBaseQuantity} {$baseUnitName}.",
                    ], 422);
                }

                $this->performStockDeduction($item, $conv, $quantity, $multiplier, $target);
            } elseif ($type === 'in') {
                if ($conv) {
                    if ($target === 'estimated') {
                        $conv->estimated_stock = ((int) ($conv->estimated_stock ?? 0)) + $quantity;
                    } else {
                        $conv->real_stock = ((int) ($conv->real_stock ?? 0)) + $quantity;
                    }
                    $conv->stock = $conv->real_stock + $conv->estimated_stock;
                    $conv->save();
                } else {
                    if ($target === 'estimated') {
                        $item->estimated_stock = ((int) ($item->estimated_stock ?? 0)) + $quantity;
                    } else {
                        $item->real_stock = ((int) ($item->real_stock ?? 0)) + $quantity;
                    }
                }
            } else {
                // Adjustment
                if ($conv) {
                    $conv->real_stock = $quantity;
                    $conv->estimated_stock = 0;
                    $conv->stock = $quantity;
                    $conv->save();
                } else {
                    $item->real_stock = $quantity;
                    $item->estimated_stock = 0;
                }
            }

            $item->recalculateTotalStock();
            $item->save();

            $currentStock = (int) $item->stock;

            $mutation = StockMutation::create([
                'item_id' => $item->id,
                'user_id' => auth()->id(),
                'type' => $type,
                'quantity' => $quantity,
                'unit_id' => $unitId,
                'multiplier' => $multiplier,
                'total_base_quantity' => $totalBaseQuantity,
                'previous_stock' => $previousStock,
                'current_stock' => $currentStock,
                'notes' => $validated['notes'] ?? ($type === 'out' ? 'Pengambilan stok barang' : 'Penambahan stok barang'),
                'reference_no' => $validated['reference_no'] ?? null,
                'mutation_date' => $validated['mutation_date'] ?? now(),
            ]);

            $item->load(['category', 'unit', 'conversions.unit']);

            $actionText = match ($type) {
                'out' => 'Pengambilan stok berhasil',
                'in' => 'Penambahan stok berhasil',
                default => 'Penyesuaian stok berhasil',
            };

            return response()->json([
                'message' => "{$actionText}. Rincian stok fisik: {$item->dual_stock_breakdown_text} (Total setara: {$item->stock} {$baseUnitName}).",
                'data' => $item,
                'mutation' => $mutation->load(['unit', 'user']),
            ]);
        });
    }

    public function destroy(Item $item)
    {
        if ($item->image) {
            Storage::disk('public')->delete($item->image);
        }

        $item->delete();

        return response()->json([
            'message' => 'Data barang/bahan berhasil dihapus.',
        ]);
    }

    private function syncConversions(Item $item, $conversionsInput): void
    {
        if (is_string($conversionsInput)) {
            $conversionsInput = json_decode($conversionsInput, true);
        }

        if (! is_array($conversionsInput)) {
            return;
        }

        $existingIds = [];

        foreach ($conversionsInput as $c) {
            $unitId = (int) ($c['unit_id'] ?? 0);
            $multiplier = (int) ($c['multiplier'] ?? 1);
            $convReal = max(0, (int) ($c['real_stock'] ?? 0));
            $convEst = max(0, (int) ($c['estimated_stock'] ?? 0));

            // Do not allow conversion to base unit or multiplier <= 1
            if ($unitId > 0 && $unitId !== (int) $item->unit_id && $multiplier > 1) {
                $conv = ItemConversion::updateOrCreate(
                    [
                        'item_id' => $item->id,
                        'unit_id' => $unitId,
                    ],
                    [
                        'multiplier' => $multiplier,
                        'real_stock' => $convReal,
                        'estimated_stock' => $convEst,
                        'stock' => $convReal + $convEst,
                    ]
                );
                $existingIds[] = $conv->id;
            }
        }

        // Delete conversions not present in input
        ItemConversion::where('item_id', $item->id)
            ->whereNotIn('id', $existingIds)
            ->delete();
    }

    private function performStockDeduction(Item $item, ?ItemConversion $conv, int $quantity, int $multiplier, string $target): void
    {
        if ($conv) {
            $cReal = (int) ($conv->real_stock ?? 0);
            $cEst = (int) ($conv->estimated_stock ?? 0);
            $cTotal = $cReal + $cEst;

            if ($cTotal >= $quantity) {
                if ($target === 'estimated') {
                    $deductEst = min($cEst, $quantity);
                    $rem = $quantity - $deductEst;
                    $conv->estimated_stock = max(0, $cEst - $deductEst);
                    $conv->real_stock = max(0, $cReal - $rem);
                } elseif ($target === 'real') {
                    $deductReal = min($cReal, $quantity);
                    $rem = $quantity - $deductReal;
                    $conv->real_stock = max(0, $cReal - $deductReal);
                    $conv->estimated_stock = max(0, $cEst - $rem);
                } else {
                    // Auto: prioritize estimated
                    $deductEst = min($cEst, $quantity);
                    $rem = $quantity - $deductEst;
                    $conv->estimated_stock = max(0, $cEst - $deductEst);
                    $conv->real_stock = max(0, $cReal - $rem);
                }
                $conv->stock = max(0, $conv->real_stock + $conv->estimated_stock);
                $conv->save();
            } else {
                // Not enough full container units, deduct all available in conv
                $neededFromOther = $quantity - $cTotal;
                $conv->real_stock = 0;
                $conv->estimated_stock = 0;
                $conv->stock = 0;
                $conv->save();

                // Deduct remaining equivalent base quantity from loose/cascading stock
                $this->deductBaseQuantityCascading($item, $neededFromOther * $multiplier, $target);
            }
        } else {
            // Requested in base unit
            $this->deductBaseQuantityCascading($item, $quantity, $target);
        }
    }

    private function deductBaseQuantityCascading(Item $item, int $baseQtyNeeded, string $target): void
    {
        $itemReal = (int) ($item->real_stock ?? 0);
        $itemEst = (int) ($item->estimated_stock ?? 0);
        $itemBaseTotal = $itemReal + $itemEst;

        if ($itemBaseTotal >= $baseQtyNeeded) {
            if ($target === 'estimated') {
                $deductEst = min($itemEst, $baseQtyNeeded);
                $rem = $baseQtyNeeded - $deductEst;
                $item->estimated_stock = max(0, $itemEst - $deductEst);
                $item->real_stock = max(0, $itemReal - $rem);
            } elseif ($target === 'real') {
                $deductReal = min($itemReal, $baseQtyNeeded);
                $rem = $baseQtyNeeded - $deductReal;
                $item->real_stock = max(0, $itemReal - $deductReal);
                $item->estimated_stock = max(0, $itemEst - $rem);
            } else {
                $deductEst = min($itemEst, $baseQtyNeeded);
                $rem = $baseQtyNeeded - $deductEst;
                $item->estimated_stock = max(0, $itemEst - $deductEst);
                $item->real_stock = max(0, $itemReal - $rem);
            }
        } else {
            // Loose base stock is insufficient: consume all loose base stock first
            $remNeeded = $baseQtyNeeded - $itemBaseTotal;
            $item->real_stock = 0;
            $item->estimated_stock = 0;

            // Cascade unpack higher units (starting from smallest multiplier > 1 up to largest)
            $conversions = $item->conversions()->orderBy('multiplier', 'asc')->get();

            foreach ($conversions as $c) {
                if ($remNeeded <= 0) {
                    break;
                }

                $mult = (int) $c->multiplier;
                $cReal = (int) ($c->real_stock ?? 0);
                $cEst = (int) ($c->estimated_stock ?? 0);
                $cTotal = $cReal + $cEst;

                if ($cTotal <= 0 || $mult <= 1) {
                    continue;
                }

                $containersNeeded = (int) ceil($remNeeded / $mult);
                $containersToUnpack = min($cTotal, $containersNeeded);

                $fromEst = min($cEst, $containersToUnpack);
                $fromReal = $containersToUnpack - $fromEst;
                $c->estimated_stock = max(0, $cEst - $fromEst);
                $c->real_stock = max(0, $cReal - $fromReal);
                $c->stock = max(0, $c->real_stock + $c->estimated_stock);
                $c->save();

                $yieldBase = $containersToUnpack * $mult;

                if ($yieldBase >= $remNeeded) {
                    $surplus = $yieldBase - $remNeeded;
                    if ($fromReal > 0) {
                        $item->real_stock += $surplus;
                    } else {
                        $item->estimated_stock += $surplus;
                    }
                    $remNeeded = 0;
                } else {
                    $remNeeded -= $yieldBase;
                }
            }
        }
    }
}
