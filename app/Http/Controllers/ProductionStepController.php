<?php

namespace App\Http\Controllers;

use App\Models\ProductionStep;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductionStepController extends Controller
{
    public function page()
    {
        return Inertia::render('Master/ProductionStep');
    }

    public function index()
    {
        $steps = ProductionStep::orderBy('sort_order', 'asc')->get();

        return response()->json([
            'data' => $steps,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'default_wage' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $step = ProductionStep::create([
            'name' => $validated['name'],
            'default_wage' => $validated['default_wage'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Langkah produksi berhasil ditambahkan.',
            'data' => $step,
        ]);
    }

    public function update(Request $request, ProductionStep $productionStep)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'default_wage' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $productionStep->update([
            'name' => $validated['name'],
            'default_wage' => $validated['default_wage'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Langkah produksi berhasil diperbarui.',
            'data' => $productionStep,
        ]);
    }

    public function destroy(ProductionStep $productionStep)
    {
        $inUse = DB::table('product_production_steps')->where('production_step_id', $productionStep->id)->exists();

        if ($inUse) {
            return response()->json([
                'message' => "Langkah produksi '{$productionStep->name}' tidak dapat dihapus karena masih digunakan oleh produk.",
            ], 422);
        }

        $productionStep->delete();

        return response()->json([
            'message' => 'Langkah produksi berhasil dihapus.',
        ]);
    }
}
