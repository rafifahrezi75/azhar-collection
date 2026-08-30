<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductMaterial;
use App\Models\ProductProductionStep;
use App\Models\ProductSize;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function page(): Response
    {
        return Inertia::render('Produk/Index');
    }

    public function createPage(): Response
    {
        return Inertia::render('Produk/Create');
    }

    public function editPage(Product $product): Response
    {
        $product->load([
            'images',
            'sizes.size',
            'materials.item.unit',
            'materials.item.category',
            'materials.size',
            'productionSteps.productionStep',
        ]);

        return Inertia::render('Produk/Edit', [
            'product' => $product,
        ]);
    }

    public function showPage(Product $product): Response
    {
        $product->load([
            'images',
            'sizes.size',
            'materials.item.unit',
            'materials.item.category',
            'materials.size',
            'productionSteps.productionStep',
        ]);

        return Inertia::render('Produk/Show', [
            'product' => $product,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Product::with([
            'images',
            'sizes.size',
            'materials.item.unit',
            'materials.item.category',
            'productionSteps.productionStep',
        ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        $products = $query->latest()->get();

        return response()->json([
            'data' => $products,
        ]);
    }

    public function nextCode(): JsonResponse
    {
        $codes = Product::pluck('code')->toArray();
        $maxNum = 0;

        foreach ($codes as $code) {
            if (preg_match('/PRD-(\d+)/', $code, $matches)) {
                $num = (int) $matches[1];
                if ($num > $maxNum) {
                    $maxNum = $num;
                }
            }
        }

        $nextCode = 'PRD-'.str_pad($maxNum + 1, 3, '0', STR_PAD_LEFT);

        return response()->json([
            'code' => $nextCode,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // Parse JSON inputs if sent via FormData
        $this->parseJsonInputs($request);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:products,code',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'default_unit' => 'required|string|max:50',
            'base_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'production_wage_mode' => 'required|in:manual,steps',
            'production_wage' => 'nullable|numeric|min:0',
            'sizes' => 'nullable|array',
            'sizes.*.size_id' => 'required_with:sizes|exists:sizes,id',
            'sizes.*.price' => 'nullable|numeric|min:0',
            'sizes.*.notes' => 'nullable|string|max:255',
            'materials' => 'nullable|array',
            'materials.*.item_id' => 'required_with:materials|exists:items,id',
            'materials.*.size_id' => 'nullable|exists:sizes,id',
            'materials.*.required_qty' => 'required_with:materials|numeric|min:0.0001',
            'materials.*.yield_qty' => 'nullable|numeric|min:0.0001',
            'materials.*.conversion_rate' => 'nullable|numeric|min:0.0001',
            'materials.*.unit_name' => 'nullable|string|max:50',
            'materials.*.notes' => 'nullable|string|max:255',
            'production_steps' => 'nullable|array',
            'production_steps.*.production_step_id' => 'nullable|exists:production_steps,id',
            'production_steps.*.custom_name' => 'nullable|string|max:255',
            'production_steps.*.wage' => 'nullable|numeric|min:0',
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'primary_image_index' => 'nullable|integer|min:0',
        ]);

        $productionWageMode = $validated['production_wage_mode'] ?? 'steps';
        $productionSteps = $validated['production_steps'] ?? [];

        if ($productionWageMode === 'steps' && empty($productionSteps)) {
            return response()->json([
                'message' => 'Langkah produksi wajib diisi.',
                'errors' => [
                    'production_steps' => ['Tambahkan minimal satu langkah produksi atau pilih upah produksi manual.'],
                ],
            ], 422);
        }

        $productionWage = $productionWageMode === 'manual'
            ? (float) ($validated['production_wage'] ?? 0)
            : collect($productionSteps)->sum(fn ($step) => (float) ($step['wage'] ?? 0));

        return DB::transaction(function () use ($validated, $request, $productionWageMode, $productionWage) {
            $product = new Product();
            $product->code = $validated['code'];
            $product->name = $validated['name'];
            $product->category = $validated['category'] ?? null;
            $product->default_unit = $validated['default_unit'] ?? 'Stel';
            $product->base_price = $validated['base_price'] ?? 0;
            $product->description = $validated['description'] ?? null;
            $product->is_active = $request->boolean('is_active', true);
            $product->production_wage_mode = $productionWageMode;
            $product->production_wage = $productionWage;
            $product->save();

            // Save Sizes
            if (! empty($validated['sizes'])) {
                foreach ($validated['sizes'] as $idx => $s) {
                    if (! empty($s['size_id'])) {
                        ProductSize::create([
                            'product_id' => $product->id,
                            'size_id' => $s['size_id'],
                            'price' => isset($s['price']) && $s['price'] !== '' ? $s['price'] : ($validated['base_price'] ?? 0),
                            'sort_order' => $idx,
                            'notes' => $s['notes'] ?? null,
                        ]);
                    }
                }
            }

            // Save Materials (BOM)
            if (! empty($validated['materials'])) {
                foreach ($validated['materials'] as $mat) {
                    if (! empty($mat['item_id'])) {
                        ProductMaterial::create([
                            'product_id' => $product->id,
                            'item_id' => $mat['item_id'],
                            'size_id' => ! empty($mat['size_id']) ? $mat['size_id'] : null,
                            'required_qty' => $mat['required_qty'],
                            'yield_qty' => ! empty($mat['yield_qty']) ? (float) $mat['yield_qty'] : 1.0,
                            'conversion_rate' => ! empty($mat['conversion_rate']) ? (float) $mat['conversion_rate'] : 1.0,
                            'unit_name' => $mat['unit_name'] ?? null,
                            'notes' => $mat['notes'] ?? null,
                        ]);
                    }
                }
            }

            // Save Production Steps
            if ($productionWageMode === 'steps' && ! empty($validated['production_steps'])) {
                foreach ($validated['production_steps'] as $idx => $step) {
                    if (! empty($step['production_step_id']) || ! empty($step['custom_name'])) {
                        ProductProductionStep::create([
                            'product_id' => $product->id,
                            'production_step_id' => ! empty($step['production_step_id']) ? $step['production_step_id'] : null,
                            'custom_name' => $step['custom_name'] ?? null,
                            'wage' => $step['wage'] ?? 0,
                            'sort_order' => $idx,
                        ]);
                    }
                }
            }

            // Save Uploaded Images
            if ($request->hasFile('images')) {
                $primaryIndex = (int) $request->input('primary_image_index', 0);
                $files = $request->file('images');
                if (is_array($files)) {
                    foreach ($files as $idx => $file) {
                        if ($file->isValid()) {
                            $path = $file->store('products', 'public');
                            ProductImage::create([
                                'product_id' => $product->id,
                                'image_path' => $path,
                                'is_primary' => ($idx === $primaryIndex),
                                'sort_order' => $idx,
                            ]);
                        }
                    }
                }
            }

            $product->load([
                'images',
                'sizes.size',
                'materials.item.unit',
                'materials.item.category',
                'productionSteps.productionStep',
            ]);

            return response()->json([
                'message' => 'Produk berhasil ditambahkan',
                'data' => $product,
            ], 201);
        });
    }

    public function show(Product $product): JsonResponse
    {
        $product->load([
            'images',
            'sizes.size',
            'materials.item.unit',
            'materials.item.category',
            'materials.size',
            'productionSteps.productionStep',
        ]);

        return response()->json([
            'data' => $product,
        ]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        // Parse JSON inputs if sent via FormData
        $this->parseJsonInputs($request);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:products,code,'.$product->id,
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'default_unit' => 'required|string|max:50',
            'base_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'production_wage_mode' => 'required|in:manual,steps',
            'production_wage' => 'nullable|numeric|min:0',
            'sizes' => 'nullable|array',
            'sizes.*.size_id' => 'required_with:sizes|exists:sizes,id',
            'sizes.*.price' => 'nullable|numeric|min:0',
            'sizes.*.notes' => 'nullable|string|max:255',
            'materials' => 'nullable|array',
            'materials.*.item_id' => 'required_with:materials|exists:items,id',
            'materials.*.size_id' => 'nullable|exists:sizes,id',
            'materials.*.required_qty' => 'required_with:materials|numeric|min:0.0001',
            'materials.*.yield_qty' => 'nullable|numeric|min:0.0001',
            'materials.*.conversion_rate' => 'nullable|numeric|min:0.0001',
            'materials.*.unit_name' => 'nullable|string|max:50',
            'materials.*.notes' => 'nullable|string|max:255',
            'production_steps' => 'nullable|array',
            'production_steps.*.production_step_id' => 'nullable|exists:production_steps,id',
            'production_steps.*.custom_name' => 'nullable|string|max:255',
            'production_steps.*.wage' => 'nullable|numeric|min:0',
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'deleted_image_ids' => 'nullable|array',
            'deleted_image_ids.*' => 'integer',
            'primary_image_id' => 'nullable|integer',
            'primary_image_index' => 'nullable|integer|min:0',
        ]);

        $productionWageMode = $validated['production_wage_mode'] ?? 'steps';
        $productionSteps = $validated['production_steps'] ?? [];

        if ($productionWageMode === 'steps' && empty($productionSteps)) {
            return response()->json([
                'message' => 'Langkah produksi wajib diisi.',
                'errors' => [
                    'production_steps' => ['Tambahkan minimal satu langkah produksi atau pilih upah produksi manual.'],
                ],
            ], 422);
        }

        $productionWage = $productionWageMode === 'manual'
            ? (float) ($validated['production_wage'] ?? 0)
            : collect($productionSteps)->sum(fn ($step) => (float) ($step['wage'] ?? 0));

        return DB::transaction(function () use ($validated, $request, $product, $productionWageMode, $productionWage) {
            $product->code = $validated['code'];
            $product->name = $validated['name'];
            $product->category = $validated['category'] ?? null;
            $product->default_unit = $validated['default_unit'] ?? 'Stel';
            $product->base_price = $validated['base_price'] ?? 0;
            $product->description = $validated['description'] ?? null;
            $product->is_active = $request->boolean('is_active', true);
            $product->production_wage_mode = $productionWageMode;
            $product->production_wage = $productionWage;
            $product->save();

            // Sync sizes
            $product->sizes()->delete();
            if (! empty($validated['sizes'])) {
                foreach ($validated['sizes'] as $idx => $s) {
                    if (! empty($s['size_id'])) {
                        ProductSize::create([
                            'product_id' => $product->id,
                            'size_id' => $s['size_id'],
                            'price' => isset($s['price']) && $s['price'] !== '' ? $s['price'] : ($validated['base_price'] ?? 0),
                            'sort_order' => $idx,
                            'notes' => $s['notes'] ?? null,
                        ]);
                    }
                }
            }

            // Sync materials (BOM)
            $product->materials()->delete();
            if (! empty($validated['materials'])) {
                foreach ($validated['materials'] as $mat) {
                    if (! empty($mat['item_id'])) {
                        ProductMaterial::create([
                            'product_id' => $product->id,
                            'item_id' => $mat['item_id'],
                            'size_id' => ! empty($mat['size_id']) ? $mat['size_id'] : null,
                            'required_qty' => $mat['required_qty'],
                            'yield_qty' => ! empty($mat['yield_qty']) ? (float) $mat['yield_qty'] : 1.0,
                            'conversion_rate' => ! empty($mat['conversion_rate']) ? (float) $mat['conversion_rate'] : 1.0,
                            'unit_name' => $mat['unit_name'] ?? null,
                            'notes' => $mat['notes'] ?? null,
                        ]);
                    }
                }
            }

            // Sync Production Steps
            $product->productionSteps()->delete();
            if ($productionWageMode === 'steps' && ! empty($validated['production_steps'])) {
                foreach ($validated['production_steps'] as $idx => $step) {
                    if (! empty($step['production_step_id']) || ! empty($step['custom_name'])) {
                        ProductProductionStep::create([
                            'product_id' => $product->id,
                            'production_step_id' => ! empty($step['production_step_id']) ? $step['production_step_id'] : null,
                            'custom_name' => $step['custom_name'] ?? null,
                            'wage' => $step['wage'] ?? 0,
                            'sort_order' => $idx,
                        ]);
                    }
                }
            }

            // Delete removed images
            if (! empty($validated['deleted_image_ids'])) {
                $imagesToDelete = ProductImage::where('product_id', $product->id)
                    ->whereIn('id', $validated['deleted_image_ids'])
                    ->get();

                foreach ($imagesToDelete as $img) {
                    if ($img->image_path) {
                        Storage::disk('public')->delete($img->image_path);
                    }
                    $img->delete();
                }
            }

            // Set primary image among existing
            $primaryImageId = $request->input('primary_image_id');
            if ($primaryImageId) {
                ProductImage::where('product_id', $product->id)->update(['is_primary' => false]);
                ProductImage::where('product_id', $product->id)->where('id', $primaryImageId)->update(['is_primary' => true]);
            }

            // Add newly uploaded images
            if ($request->hasFile('images')) {
                $existingCount = $product->images()->count();
                $primaryIndex = $request->input('primary_image_index');
                $files = $request->file('images');
                if (is_array($files)) {
                    foreach ($files as $idx => $file) {
                        if ($file->isValid()) {
                            $path = $file->store('products', 'public');
                            $isPrimary = ($primaryIndex !== null && (int) $primaryIndex === $idx);

                            // If marked primary or if there's no primary yet
                            if ($isPrimary) {
                                ProductImage::where('product_id', $product->id)->update(['is_primary' => false]);
                            }

                            ProductImage::create([
                                'product_id' => $product->id,
                                'image_path' => $path,
                                'is_primary' => $isPrimary || ($existingCount === 0 && $idx === 0),
                                'sort_order' => $existingCount + $idx,
                            ]);
                        }
                    }
                }
            }

            // Ensure at least one image is primary if images exist
            $hasPrimary = ProductImage::where('product_id', $product->id)->where('is_primary', true)->exists();
            if (! $hasPrimary) {
                ProductImage::where('product_id', $product->id)->orderBy('sort_order')->limit(1)->update(['is_primary' => true]);
            }

            $product->load([
                'images',
                'sizes.size',
                'materials.item.unit',
                'materials.item.category',
                'productionSteps.productionStep',
            ]);

            return response()->json([
                'message' => 'Produk berhasil diperbarui',
                'data' => $product,
            ]);
        });
    }

    public function destroy(Product $product): JsonResponse
    {
        // Delete all physical images from storage
        $images = $product->images()->get();
        foreach ($images as $img) {
            if ($img->image_path) {
                Storage::disk('public')->delete($img->image_path);
            }
        }

        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus',
        ]);
    }

    /**
     * Parse JSON fields if sent via multipart/form-data
     */
    private function parseJsonInputs(Request $request): void
    {
        if (is_string($request->input('sizes'))) {
            $decoded = json_decode($request->input('sizes'), true);
            if (is_array($decoded)) {
                $request->merge(['sizes' => $decoded]);
            }
        }

        if (is_string($request->input('materials'))) {
            $decoded = json_decode($request->input('materials'), true);
            if (is_array($decoded)) {
                $request->merge(['materials' => $decoded]);
            }
        }

        if (is_string($request->input('production_steps'))) {
            $decoded = json_decode($request->input('production_steps'), true);
            if (is_array($decoded)) {
                $request->merge(['production_steps' => $decoded]);
            }
        }

        if (is_string($request->input('deleted_image_ids'))) {
            $decoded = json_decode($request->input('deleted_image_ids'), true);
            if (is_array($decoded)) {
                $request->merge(['deleted_image_ids' => $decoded]);
            }
        }
    }
}
