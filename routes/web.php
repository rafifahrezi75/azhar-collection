<?php

use App\Http\Controllers\AuthUserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HakAksesController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserManagementController;
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

    Route::get('/dashboard/kategori-produk', [ProductCategoryController::class, 'indexPage'])
        ->middleware('permission:kategori-produk.view')
        ->name('kategori-produk.index');

    Route::get('/dashboard/pelanggan', [CustomerController::class, 'page'])
        ->middleware('permission:pelanggan.view')
        ->name('pelanggan.index');

    Route::get('/dashboard/sekolah', function () {
        return redirect('/dashboard/pelanggan');
    });

    Route::get('/dashboard/hak-akses', [HakAksesController::class, 'page'])
        ->middleware('permission:hak_akses.view')
        ->name('hak-akses.index');

    Route::get('/dashboard/users', [UserManagementController::class, 'page'])
        ->middleware('permission:user.view')
        ->name('users.index');
});

// API Routes guarded by Web Session Auth
Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/me', [AuthUserController::class, 'me']);
    Route::get('/dashboard/summary', [DashboardController::class, 'summaryApi'])
        ->middleware('permission:dashboard.view');

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
