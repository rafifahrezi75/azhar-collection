<?php

use App\Http\Controllers\AuthUserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HakAksesController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceItemProductionStepController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductionAssignmentController;
use App\Http\Controllers\ProductionProgressController;
use App\Http\Controllers\ProductionStepController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'page'])
        ->middleware('permission:dashboard.view')
        ->name('dashboard');

    // Transaksi & Invoice
    Route::get('/dashboard/invoice', [InvoiceController::class, 'page'])
        ->middleware('permission:invoice.view')
        ->name('invoice.index');

    Route::get('/dashboard/invoice/create', [InvoiceController::class, 'createPage'])
        ->middleware('permission:invoice.create')
        ->name('invoice.create');

    Route::get('/dashboard/invoice/input-lama', [InvoiceController::class, 'createHistoricalPage'])
        ->middleware('permission:invoice.create')
        ->name('invoice.input-lama');

    Route::get('/dashboard/invoice/{invoice}', [InvoiceController::class, 'showPage'])
        ->name('invoice.show')
        ->middleware('permission:invoice.view');

    Route::get('/dashboard/invoice/{invoice}/print', [InvoiceController::class, 'print'])
        ->middleware('permission:invoice.view')
        ->name('invoice.print');

    Route::get('/dashboard/invoice/{invoice}/production-pdf', [InvoiceController::class, 'printProductionPDF'])
        ->middleware('permission:invoice.view')
        ->name('invoice.production-pdf');

    // Pembelian
    Route::get('/dashboard/purchases', [PurchaseController::class, 'index'])->name('purchases.index');
    Route::get('/dashboard/purchases/create', [PurchaseController::class, 'create'])->name('purchases.create');
    Route::post('/dashboard/purchases', [PurchaseController::class, 'store'])->name('purchases.store');
    Route::get('/dashboard/purchases/{purchase}', [PurchaseController::class, 'show'])->name('purchases.show');
    Route::get('/dashboard/purchases/{purchase}/pdf', [PurchaseController::class, 'printPdf'])->name('purchases.pdf');

    // Master Data
    Route::get('/dashboard/kategori', [CategoryController::class, 'page'])
        ->middleware('permission:kategori.view')
        ->name('kategori.index');

    Route::get('/dashboard/satuan', [UnitController::class, 'page'])
        ->middleware('permission:satuan.view')
        ->name('satuan.index');

    Route::get('/dashboard/barang', [ItemController::class, 'page'])
        ->middleware('permission:barang.view')
        ->name('barang.index');

    Route::get('/dashboard/produk', [ProductController::class, 'page'])
        ->middleware('permission:produk.view')
        ->name('produk.index');

    Route::get('/dashboard/produk/create', [ProductController::class, 'createPage'])
        ->middleware('permission:produk.create')
        ->name('produk.create');

    Route::get('/dashboard/produk/{product}/edit', [ProductController::class, 'editPage'])
        ->middleware('permission:produk.update')
        ->name('produk.edit');

    Route::get('/dashboard/produk/{product}', [ProductController::class, 'showPage'])
        ->middleware('permission:produk.view')
        ->name('produk.show');

    Route::get('/dashboard/kategori-produk', [ProductCategoryController::class, 'indexPage'])
        ->middleware('permission:kategori-produk.view')
        ->name('kategori-produk.index');

    Route::get('/dashboard/pelanggan', [CustomerController::class, 'page'])
        ->middleware('permission:pelanggan.view')
        ->name('pelanggan.index');

    Route::get('/dashboard/langkah-produksi', [ProductionStepController::class, 'page'])
        ->middleware('permission:produk.view')
        ->name('langkah-produksi.index');

    Route::get('/dashboard/ukuran', [SizeController::class, 'page'])
        ->middleware('permission:produk.view')
        ->name('ukuran.index');

    Route::get('/dashboard/sekolah', function () {
        return redirect('/dashboard/pelanggan');
    });

    Route::get('/dashboard/hak-akses', [HakAksesController::class, 'page'])
        ->middleware('permission:hak_akses.view')
        ->name('hak-akses.index');

    Route::get('/dashboard/users', [UserManagementController::class, 'page'])
        ->middleware('permission:user.view')
        ->name('users.index');

    // Production Progress
    Route::get('/dashboard/production-progress', [ProductionProgressController::class, 'index'])->name('production-progress.index');
    Route::get('/dashboard/production-progress/invoice/{invoice}', [ProductionProgressController::class, 'show'])->name('production-progress.show');
    Route::get('/dashboard/production-progress/invoice/{invoice}/input', [ProductionProgressController::class, 'input'])->name('production-progress.input');
    Route::post('/dashboard/production-progress', [ProductionProgressController::class, 'store'])->name('production-progress.store');
    Route::delete('/dashboard/production-progress/{productionProgressLog}', [ProductionProgressController::class, 'destroy'])->name('production-progress.destroy');
});

// API Routes guarded by Web Session Auth
Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/me', [AuthUserController::class, 'me']);
    Route::get('/dashboard/summary', [DashboardController::class, 'summaryApi'])
        ->middleware('permission:dashboard.view');
    Route::get('/dashboard/order-analytics', [DashboardController::class, 'orderAnalyticsApi'])
        ->middleware('permission:dashboard.analytics.view');
    Route::get('/dashboard/customer-yearly-trend', [DashboardController::class, 'customerYearlyTrendApi'])
        ->middleware('permission:dashboard.analytics.view');
    Route::get('/dashboard/customer-orders', [DashboardController::class, 'customerOrdersApi'])
        ->middleware('permission:dashboard.analytics.view');

    // Generic Reorder
    Route::post('/master/reorder', function (Request $request) {
        $table = $request->input('table');
        $ids = $request->input('ids');
        if (! is_array($ids)) {
            return response()->json(['message' => 'Invalid IDs'], 400);
        }
        if (! in_array($table, ['units', 'categories', 'product_categories', 'production_steps', 'sizes'])) {
            return response()->json(['message' => 'Invalid table'], 400);
        }
        foreach ($ids as $index => $id) {
            DB::table($table)->where('id', $id)->update(['sort_order' => $index + 1]);
        }

        return response()->json(['message' => 'Reordered successfully']);
    });

    // Invoice Item Production Steps Assignment (Legacy - to be removed later)
    Route::post('/invoice-item-production-steps/{invoice}/generate', [InvoiceItemProductionStepController::class, 'generateForInvoice']);
    Route::put('/invoice-item-production-steps/{step}/assign', [InvoiceItemProductionStepController::class, 'assignUser']);
    Route::put('/invoice-item-production-steps/{step}/status', [InvoiceItemProductionStepController::class, 'toggleStatus']);

    // SPK Production Assignments
    Route::post('/production-assignments', [ProductionAssignmentController::class, 'store']);
    Route::put('/production-assignments/steps/{step}/status', [ProductionAssignmentController::class, 'toggleStepStatus']);
    Route::delete('/production-assignments/{assignment}', [ProductionAssignmentController::class, 'destroy']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index'])
        ->middleware('permission:kategori.view');

    Route::post('/categories', [CategoryController::class, 'store'])
        ->middleware('permission:kategori.create');

    Route::put('/categories/{category}', [CategoryController::class, 'update'])
        ->middleware('permission:kategori.update');

    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->middleware('permission:kategori.delete');

    // Units (Satuan)
    Route::get('/units', [UnitController::class, 'index'])
        ->middleware('permission:satuan.view');

    Route::post('/units', [UnitController::class, 'store'])
        ->middleware('permission:satuan.create');

    Route::put('/units/{unit}', [UnitController::class, 'update'])
        ->middleware('permission:satuan.update');

    Route::delete('/units/{unit}', [UnitController::class, 'destroy'])
        ->middleware('permission:satuan.delete');

    // Items (Barang / Bahan Baku)
    Route::get('/items', [ItemController::class, 'index'])
        ->middleware('permission:barang.view');

    Route::get('/items/form-data', [ItemController::class, 'formData'])
        ->middleware('permission:barang.view');

    Route::get('/items/{item}', [ItemController::class, 'show'])
        ->middleware('permission:barang.view');

    Route::post('/items', [ItemController::class, 'store'])
        ->middleware('permission:barang.create');

    Route::post('/items/{item}/adjust-stock', [ItemController::class, 'adjustStock'])
        ->middleware('permission:barang.update');

    Route::post('/items/{item}', [ItemController::class, 'update'])
        ->middleware('permission:barang.update');

    Route::put('/items/{item}', [ItemController::class, 'update'])
        ->middleware('permission:barang.update');

    Route::delete('/items/{item}', [ItemController::class, 'destroy'])
        ->middleware('permission:barang.delete');

    // Customers (Master Pelanggan / Pemesan)
    Route::get('/customers', [CustomerController::class, 'index'])
        ->middleware('permission:pelanggan.view');

    Route::get('/customers/next-code', [CustomerController::class, 'nextCode'])
        ->middleware('permission:pelanggan.create');

    Route::post('/customers', [CustomerController::class, 'store'])
        ->middleware('permission:pelanggan.create');

    Route::put('/customers/{customer}', [CustomerController::class, 'update'])
        ->middleware('permission:pelanggan.update');

    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])
        ->middleware('permission:pelanggan.delete');

    // Products (Master Produk Jadi & Resep BOM)
    Route::get('/products', [ProductController::class, 'index'])
        ->middleware('permission:produk.view');

    Route::get('/products/next-code', [ProductController::class, 'nextCode'])
        ->middleware('permission:produk.create');

    Route::get('/products/{product}', [ProductController::class, 'show'])
        ->middleware('permission:produk.view');

    Route::post('/products', [ProductController::class, 'store'])
        ->middleware('permission:produk.create');

    Route::put('/products/{product}', [ProductController::class, 'update'])
        ->middleware('permission:produk.update');

    Route::delete('/products/{product}', [ProductController::class, 'destroy'])
        ->middleware('permission:produk.delete');

    // Product Categories (Master Kategori Produk Jadi)
    Route::get('/product-categories', [ProductCategoryController::class, 'index'])
        ->middleware('permission:kategori-produk.view');

    Route::post('/product-categories', [ProductCategoryController::class, 'store'])
        ->middleware('permission:kategori-produk.create');

    Route::put('/product-categories/{productCategory}', [ProductCategoryController::class, 'update'])
        ->middleware('permission:kategori-produk.update');

    Route::delete('/product-categories/{productCategory}', [ProductCategoryController::class, 'destroy'])
        ->middleware('permission:kategori-produk.delete');

    // Production Steps (Master Langkah Produksi / Jahit)
    Route::get('/production-steps', [ProductionStepController::class, 'index'])
        ->middleware('permission:produk.view');

    Route::post('/production-steps', [ProductionStepController::class, 'store'])
        ->middleware('permission:produk.create');

    Route::put('/production-steps/{productionStep}', [ProductionStepController::class, 'update'])
        ->middleware('permission:produk.update');

    Route::delete('/production-steps/{productionStep}', [ProductionStepController::class, 'destroy'])
        ->middleware('permission:produk.delete');

    // Sizes (Master Ukuran)
    Route::get('/sizes', [SizeController::class, 'index'])
        ->middleware('permission:produk.view');

    Route::post('/sizes', [SizeController::class, 'store'])
        ->middleware('permission:produk.create');

    Route::put('/sizes/{size}', [SizeController::class, 'update'])
        ->middleware('permission:produk.update');

    Route::delete('/sizes/{size}', [SizeController::class, 'destroy'])
        ->middleware('permission:produk.delete');

    // Invoices (Transaksi & Input Invoice Lama)
    Route::get('/invoices', [InvoiceController::class, 'index'])
        ->middleware('permission:invoice.view');

    Route::get('/invoices/next-number', [InvoiceController::class, 'nextNumber'])
        ->middleware('permission:invoice.create');

    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])
        ->middleware('permission:invoice.view');

    Route::post('/invoices', [InvoiceController::class, 'store'])
        ->middleware('permission:invoice.create');

    Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])
        ->middleware('permission:invoice.delete');

    // Hak Akses
    Route::get('/hak-akses', [HakAksesController::class, 'index'])
        ->middleware('permission:hak_akses.view');

    Route::put('/hak-akses/{role}', [HakAksesController::class, 'update'])
        ->middleware('permission:hak_akses.update');

    Route::put('/hak-akses/user/{user}', [HakAksesController::class, 'updateUser'])
        ->middleware('permission:hak_akses.update');

    // Users Management
    Route::get('/users-management', [UserManagementController::class, 'index'])
        ->middleware('permission:user.view');

    Route::put('/users-management/{user}/roles', [UserManagementController::class, 'updateRole'])
        ->middleware('permission:user.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::fallback(function () {
    return Inertia::render('Error', [
        'status' => 404,
        'message' => 'Halaman atau rute yang Anda tuju tidak ditemukan.',
    ])->toResponse(request())->setStatusCode(404);
});
