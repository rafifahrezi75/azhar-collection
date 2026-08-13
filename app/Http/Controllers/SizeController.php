<?php

namespace App\Http\Controllers;

use App\Models\Size;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SizeController extends Controller
{
    public function page()
    {
        return Inertia::render('Master/Size');
    }

    public function index()
    {
        return response()->json([
            'data' => Size::orderBy('sort_order', 'asc')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:255'],
            'size_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $size = Size::create([
            'category' => $validated['category'],
            'size_name' => $validated['size_name'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Ukuran berhasil ditambahkan.',
            'data' => $size,
        ]);
    }

    public function update(Request $request, Size $size)
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:255'],
            'size_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $size->update([
            'category' => $validated['category'],
            'size_name' => $validated['size_name'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Ukuran berhasil diperbarui.',
            'data' => $size,
        ]);
    }

    public function destroy(Size $size)
    {
        $inUse = DB::table('product_sizes')->where('size_id', $size->id)->exists() ||
                 DB::table('product_materials')->where('size_id', $size->id)->exists();

        if ($inUse) {
            return response()->json([
                'message' => "Ukuran '{$size->size_name}' tidak dapat dihapus karena masih digunakan oleh produk.",
            ], 422);
        }

        $size->delete();

        return response()->json([
            'message' => 'Ukuran berhasil dihapus.',
        ]);
    }
}
