<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitController extends Controller
{
    public function page()
    {
        return Inertia::render('Satuan/Index');
    }

    public function index()
    {
        $units = Unit::withCount('items')->latest()->get();

        return response()->json([
            'data' => $units,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'symbol' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $unit = Unit::create([
            'name' => $validated['name'],
            'symbol' => $validated['symbol'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Satuan barang berhasil ditambahkan.',
            'data' => $unit,
        ]);
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'symbol' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $unit->update([
            'name' => $validated['name'],
            'symbol' => $validated['symbol'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Satuan barang berhasil diperbarui.',
            'data' => $unit,
        ]);
    }

    public function destroy(Unit $unit)
    {
        $itemCount = $unit->items()->count();

        if ($itemCount > 0) {
            return response()->json([
                'message' => "Satuan '{$unit->name}' tidak dapat dihapus karena masih digunakan oleh {$itemCount} data barang.",
            ], 422);
        }

        $unit->delete();

        return response()->json([
            'message' => 'Satuan barang berhasil dihapus.',
        ]);
    }
}
