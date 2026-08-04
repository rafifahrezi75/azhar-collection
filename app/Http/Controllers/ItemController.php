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
            'stock' => ['required', 'integer', 'min:0'],
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

        return DB::transaction(function () use ($validated, $imagePath, $isActive, $request) {
            $item = Item::create([
                'code' => strtoupper(trim($validated['code'])),
                'name' => $validated['name'],
                'category_id' => $validated['category_id'],
                'unit_id' => $validated['unit_id'],
                'stock' => $validated['stock'],
                'min_stock' => $validated['min_stock'] ?? 0,
                'image' => $imagePath,
                'description' => $validated['description'] ?? null,
                'is_active' => $isActive,
            ]);

            // Save initial stock mutation if stock > 0
            if ((int) $validated['stock'] > 0) {
                StockMutation::create([
                    'item_id' => $item->id,
                    'user_id' => auth()->id(),
                    'type' => 'in',
                    'quantity' => (int) $validated['stock'],
                    'unit_id' => $item->unit_id,
                    'multiplier' => 1,
                    'total_base_quantity' => (int) $validated['stock'],
                    'previous_stock' => 0,
                    'current_stock' => (int) $validated['stock'],
                    'notes' => 'Stok awal barang baru',
                    'reference_no' => 'INIT-' . $item->code,
                    'mutation_date' => now(),
                ]);
            }

            // Handle conversions
            $this->syncConversions($item, $request->input('conversions'));

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
            'stock' => ['required', 'integer', 'min:0'],
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

        return DB::transaction(function () use ($validated, $imagePath, $isActive, $request, $item) {
            $previousStock = $item->stock;
            $newStock = (int) $validated['stock'];

            $item->update([
                'code' => strtoupper(trim($validated['code'])),
                'name' => $validated['name'],
                'category_id' => $validated['category_id'],
                'unit_id' => $validated['unit_id'],
                'stock' => $newStock,
                'min_stock' => $validated['min_stock'] ?? 0,
                'image' => $imagePath,
                'description' => $validated['description'] ?? null,
                'is_active' => $isActive,
            ]);

            // If stock directly changed in edit form, log adjustment mutation
            if ($previousStock !== $newStock) {
                $diff = $newStock - $previousStock;
                StockMutation::create([
                    'item_id' => $item->id,
                    'user_id' => auth()->id(),
                    'type' => $diff > 0 ? 'in' : 'adjustment',
                    'quantity' => abs($diff),
                    'unit_id' => $item->unit_id,
                    'multiplier' => 1,
                    'total_base_quantity' => abs($diff),
                    'previous_stock' => $previousStock,
                    'current_stock' => $newStock,
                    'notes' => 'Penyesuaian stok manual saat edit barang',
                    'reference_no' => 'ADJ-' . time(),
                    'mutation_date' => now(),
                ]);
            }

            // Sync conversions
            $this->syncConversions($item, $request->input('conversions'));

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
            'notes' => ['nullable', 'string'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'mutation_date' => ['nullable', 'date'],
        ]);

        $unitId = (int) $validated['unit_id'];
        $quantity = (int) $validated['quantity'];
        $type = $validated['type'];

        // Determine multiplier
        $multiplier = 1;
        if ($unitId !== (int) $item->unit_id) {
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

        if ($type === 'out') {
            if ($previousStock < $totalBaseQuantity) {
                return response()->json([
                    'message' => "Stok tidak mencukupi untuk diambil. Stok saat ini: {$item->stock_breakdown_text} ({$previousStock} {$baseUnitName}), sedangkan yang ingin diambil: {$totalBaseQuantity} {$baseUnitName}.",
                ], 422);
            }
            $currentStock = $previousStock - $totalBaseQuantity;
        } elseif ($type === 'in') {
            $currentStock = $previousStock + $totalBaseQuantity;
        } else {
            // adjustment
            $currentStock = $totalBaseQuantity;
        }

        return DB::transaction(function () use (
            $item,
            $type,
            $quantity,
            $unitId,
            $multiplier,
            $totalBaseQuantity,
            $previousStock,
            $currentStock,
            $validated
        ) {
            $item->update(['stock' => $currentStock]);

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
                'message' => "{$actionText}. Sisa stok sekarang: {$item->stock_breakdown_text} ({$item->stock} {$item->unit->symbol}).",
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

            // Do not allow conversion to base unit or multiplier <= 1
            if ($unitId > 0 && $unitId !== (int) $item->unit_id && $multiplier > 1) {
                $conv = ItemConversion::updateOrCreate(
                    [
                        'item_id' => $item->id,
                        'unit_id' => $unitId,
                    ],
                    [
                        'multiplier' => $multiplier,
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
}
