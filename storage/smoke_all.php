<?php

$_ENV['APP_ENV'] = $_SERVER['APP_ENV'] = 'testing';
putenv('APP_ENV=testing');
$_ENV['SESSION_DRIVER'] = $_SERVER['SESSION_DRIVER'] = 'array';
putenv('SESSION_DRIVER=array');
$_ENV['CACHE_STORE'] = $_SERVER['CACHE_STORE'] = 'array';
putenv('CACHE_STORE=array');
$_ENV['MAIL_MAILER'] = $_SERVER['MAIL_MAILER'] = 'array';
putenv('MAIL_MAILER=array');

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$results = [];

function call(string $method, string $uri, array $data = []): array
{
    global $kernel;
    if ($method === 'GET') {
        $request = Illuminate\Http\Request::create($uri, 'GET', [], [], [], ['HTTP_ACCEPT' => 'application/json']);
    } else {
        $request = Illuminate\Http\Request::create(
            $uri,
            $method,
            [],
            [],
            [],
            ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json'],
            json_encode($data)
        );
    }
    try {
        $res = $kernel->handle($request);
        return [
            $res->getStatusCode(),
            (string) $res->headers->get('Content-Type'),
            substr($res->getContent() ?: '', 0, 200),
        ];
    } catch (Throwable $e) {
        return [500, 'exception', get_class($e) . ': ' . $e->getMessage()];
    }
}

function check(string $group, string $label, string $method, string $uri, array $expect, array $data = [], ?callable $post = null): void
{
    [$status, $ctype, $body] = call($method, $uri, $data);
    $ok = in_array($status, $expect) && (!$post || $post($status, $ctype, $body));
    $GLOBALS['results'][] = compact('group', 'label', 'method', 'uri', 'expect') + [
        'status' => $status,
        'pass'   => $ok,
        'note'   => $ok ? '' : "got=$status ctype=$ctype body=" . str_replace("\n", ' ', $body),
    ];
}

Illuminate\Support\Facades\DB::beginTransaction();

try {
    $admin     = App\Models\User::where('email', 'admin@example.com')->first();
    $roleUser  = App\Models\Role::where('name', 'user')->first();
    $roleStaff = App\Models\Role::where('name', 'staff')->first();
    if (!$admin || !$roleUser || !$roleStaff) {
        throw new RuntimeException('Seeder dasar tidak lengkap (admin/roles).');
    }

    $suffix = substr((string) time(), -6);
    $tailorA = App\Models\User::create(['name' => 'Penjahit A', 'email' => "smoke-a{$suffix}@test.local", 'password' => Illuminate\Support\Facades\Hash::make('password'), 'email_verified_at' => now()]);
    $tailorB = App\Models\User::create(['name' => 'Penjahit B', 'email' => "smoke-b{$suffix}@test.local", 'password' => Illuminate\Support\Facades\Hash::make('password'), 'email_verified_at' => now()]);
    $tailorA->roles()->sync([$roleUser->id]);
    $tailorB->roles()->sync([$roleUser->id]);

    $inv      = App\Models\Invoice::whereHas('items')->with('items')->orderBy('id')->first();
    $invItem  = $inv->items->first();
    $otherInv = App\Models\Invoice::whereHas('items')->where('id', '!=', $inv->id)->orderBy('id')->first();
    $purchase = App\Models\Purchase::orderBy('id')->first();
    $cat      = App\Models\Category::first();
    $unitIds  = App\Models\Unit::orderBy('id')->limit(3)->pluck('id')->all();
    $sizeId   = App\Models\Size::first()?->id;

    Illuminate\Support\Facades\DB::table('product_production_steps')->insert([
        'product_id'         => $invItem->product_id ?? 1,
        'production_step_id' => App\Models\ProductionStep::first()->id,
        'wage'               => 1000,
        'sort_order'         => 99,
        'created_at'         => now(),
        'updated_at'         => now(),
    ]);
    $ppsId = (int) Illuminate\Support\Facades\DB::table('product_production_steps')->where('sort_order', 99)->latest('id')->value('id');

    // ===== SPK untuk tailorA & tailorB (dibuat via controller saat login admin) =====
    auth()->login($admin);
    check('SPK', 'buat assignment tailorA', 'POST', '/api/production-assignments',
        [200, 201],
        ['invoice_item_id' => $invItem->id, 'user_id' => $tailorA->id, 'qty' => 10, 'target_date' => '2026-09-30', 'steps' => [['id' => $ppsId, 'qty' => 10]]],
        function ($s, $c, $b) { return str_contains($b, 'SPK'); });
    $assignA = App\Models\ProductionAssignment::where('user_id', $tailorA->id)->latest('id')->first();
    $stepA   = $assignA->steps->first();
    check('SPK', 'toggle step SELESAI', 'PUT', "/api/production-assignments/steps/{$stepA->id}/status", [200], ['status' => 'SELESAI']);
    $assignAStatus = $assignA->fresh()->status;
    $results[] = ['group' => 'SPK', 'label' => 'assignment ikut SELESAI setelah semua toggle', 'method' => '-', 'uri' => '-', 'expect' => [], 'status' => $assignAStatus, 'pass' => strtolower((string)$assignAStatus) === 'selesai', 'note' => "status={$assignAStatus}"];
    check('SPK', 'toggle kembali PENDING', 'PUT', "/api/production-assignments/steps/{$stepA->id}/status", [200], ['status' => 'PENDING']);

    auth()->login($tailorB);
    check('SPK', 'non-admin buat assignment sendiri', 'POST', '/api/production-assignments',
        [200, 201],
        ['invoice_item_id' => $invItem->id, 'user_id' => $tailorB->id, 'qty' => 5, 'target_date' => '2026-09-30', 'steps' => [['id' => $ppsId, 'qty' => 5]]]);
    $assignB = App\Models\ProductionAssignment::where('user_id', $tailorB->id)->latest('id')->first();
    $stepB   = $assignB->steps->first();

    // ================= GUEST =================
    auth()->logout();
    check('Guest', 'GET / redirect', 'GET', '/', [302]);
    check('Guest', 'GET /dashboard redirect login', 'GET', '/dashboard', [302]);
    check('Guest', 'API /api/me unauthorized', 'GET', '/api/me', [401]);

    // ================= ADMIN: HALAMAN =================
    auth()->login($admin);
    $pages = [
        ['Dashboard', '/dashboard'],
        ['Invoice', '/dashboard/invoice'],
        ['Invoice create', '/dashboard/invoice/create'],
        ['Invoice detail', "/dashboard/invoice/{$inv->id}"],
        ['Input invoice lama', '/dashboard/invoice/input-lama'],
        ['Purchases', '/dashboard/purchases'],
        ['Purchase create', '/dashboard/purchases/create'],
        ['Purchase detail', "/dashboard/purchases/{$purchase->id}"],
        ['Kategori', '/dashboard/kategori'],
        ['Satuan', '/dashboard/satuan'],
        ['Barang', '/dashboard/barang'],
        ['Produk', '/dashboard/produk'],
        ['Kategori produk', '/dashboard/kategori-produk'],
        ['Pelanggan', '/dashboard/pelanggan'],
        ['Langkah produksi', '/dashboard/langkah-produksi'],
        ['Ukuran', '/dashboard/ukuran'],
        ['Hak akses', '/dashboard/hak-akses'],
        ['User management', '/dashboard/users'],
        ['Profile', '/profile'],
        ['Progress index', '/dashboard/production-progress'],
        ['Progress detail invoice', "/dashboard/production-progress/invoice/{$inv->id}"],
    ];
    foreach ($pages as [$g, $u]) {
        check("Halaman/$g", "GET $u", 'GET', $u, [200]);
    }
    check('Halaman/PDF', 'invoice print PDF', 'GET', "/dashboard/invoice/{$inv->id}/print", [200], [], fn($s, $c) => str_contains($c, 'pdf'));
    check('Halaman/PDF', 'invoice production PDF', 'GET', "/dashboard/invoice/{$inv->id}/production-pdf", [200], [], fn($s, $c) => str_contains($c, 'pdf'));
    check('Halaman/PDF', 'purchase PDF', 'GET', "/dashboard/purchases/{$purchase->id}/pdf", [200], [], fn($s, $c) => str_contains($c, 'pdf'));

    // ================= ADMIN: API GET =================
    $apis = [
        ['/api/me'], ['/api/dashboard/summary'], ['/api/dashboard/order-analytics'], ['/api/dashboard/customer-yearly-trend'],
        ['/api/categories'], ['/api/units'], ['/api/items'], ['/api/items/form-data'], ['/api/customers'],
        ['/api/customers/next-code'], ['/api/products'], ['/api/products/next-code'], ['/api/product-categories'],
        ['/api/production-steps'], ['/api/sizes'], ['/api/invoices'], ['/api/invoices/next-number'],
        ['/api/hak-akses'], ['/api/users-management'],
    ];
    foreach ($apis as [$u]) {
        check('API GET', "GET $u", 'GET', $u, [200]);
    }
    $firstItem = App\Models\Item::first();
    $firstProd = App\Models\Product::first();
    check('API GET', 'GET items/{id}', 'GET', "/api/items/{$firstItem->id}", [200]);
    check('API GET', 'GET products/{id}', 'GET', "/api/products/{$firstProd->id}", [200]);
    check('API GET', 'GET invoices/{id}', 'GET', "/api/invoices/{$inv->id}", [200]);

    // ================= ADMIN: MUTASI CRUD MASTER =================
    check('Master/Kategori', 'create valid', 'POST', '/api/categories', [200, 201], ['name' => 'Smoke Kat', 'description' => 'tes']);
    check('Master/Kategori', 'create invalid (tanpa nama)', 'POST', '/api/categories', [422], []);
    $kat = App\Models\Category::where('name', 'Smoke Kat')->latest('id')->first();
    check('Master/Kategori', 'update', 'PUT', "/api/categories/{$kat->id}", [200], ['name' => 'Smoke Kat Edit']);
    check('Master/Kategori', 'delete', 'DELETE', "/api/categories/{$kat->id}", [200, 204]);

    check('Master/Satuan', 'create', 'POST', '/api/units', [200, 201], ['name' => 'Smoke Satuan']);
    $unit = App\Models\Unit::where('name', 'Smoke Satuan')->latest('id')->first();
    check('Master/Satuan', 'update', 'PUT', "/api/units/{$unit->id}", [200], ['name' => 'Smoke Satuan Edit']);
    check('Master/Satuan', 'delete', 'DELETE', "/api/units/{$unit->id}", [200, 204]);

    check('Master/KatProduk', 'create', 'POST', '/api/product-categories', [200, 201], ['name' => 'Smoke PC']);
    $pc = App\Models\ProductCategory::where('name', 'Smoke PC')->latest('id')->first();
    check('Master/KatProduk', 'update', 'PUT', "/api/product-categories/{$pc->id}", [200], ['name' => 'Smoke PC Edit']);
    check('Master/KatProduk', 'delete', 'DELETE', "/api/product-categories/{$pc->id}", [200, 204]);

    check('Master/Langkah', 'create', 'POST', '/api/production-steps', [200, 201], ['name' => 'Smoke Step', 'default_wage' => 2500]);
    $pstep = App\Models\ProductionStep::where('name', 'Smoke Step')->latest('id')->first();
    check('Master/Langkah', 'update', 'PUT', "/api/production-steps/{$pstep->id}", [200], ['name' => 'Smoke Step Edit', 'default_wage' => 3000]);
    check('Master/Langkah', 'delete', 'DELETE', "/api/production-steps/{$pstep->id}", [200, 204]);

    check('Master/Ukuran', 'create', 'POST', '/api/sizes', [200, 201], ['category' => 'Seragam Olahraga', 'size_name' => 'SMOKE']);
    $sz = App\Models\Size::where('size_name', 'SMOKE')->latest('id')->first();
    check('Master/Ukuran', 'update', 'PUT', "/api/sizes/{$sz->id}", [200], ['category' => 'Seragam Olahraga', 'size_name' => 'SMOKE2']);
    check('Master/Ukuran', 'delete', 'DELETE', "/api/sizes/{$sz->id}", [200, 204]);

    check('Master/Pelanggan', 'next-code', 'GET', '/api/customers/next-code', [200]);
    check('Master/Pelanggan', 'create', 'POST', '/api/customers', [200, 201], ['code' => "SMK{$suffix}", 'name' => 'Pelanggan Smoke', 'type' => 'Individu', 'phone' => '081234567890']);
    $cust = App\Models\Customer::where('code', "SMK{$suffix}")->first();
    check('Master/Pelanggan', 'update', 'PUT', "/api/customers/{$cust->id}", [200], ['code' => "SMK{$suffix}", 'name' => 'Pelanggan Smoke Edit', 'type' => 'Instansi']);
    check('Master/Pelanggan', 'delete', 'DELETE', "/api/customers/{$cust->id}", [200, 204]);

    check('Master/Barang', 'create', 'POST', '/api/items', [200, 201],
        ['code' => "SMKITM{$suffix}", 'name' => 'Bahan Smoke', 'category_id' => $cat->id, 'unit_id' => $unitIds[0], 'price' => 15000, 'stock' => 0]);
    $item = App\Models\Item::where('code', "SMKITM{$suffix}")->first();
    check('Master/Barang', 'adjust-stock masuk', 'POST', "/api/items/{$item->id}/adjust-stock", [200, 201],
        ['type' => 'in', 'quantity' => 7, 'unit_id' => $item->unit_id, 'notes' => 'smoke']);
    check('Master/Barang', 'update', 'POST', "/api/items/{$item->id}", [200],
        ['code' => "SMKITM{$suffix}", 'name' => 'Bahan Smoke Edit', 'category_id' => $cat->id, 'unit_id' => $item->unit_id]);
    check('Master/Barang', 'delete', 'DELETE', "/api/items/{$item->id}", [200, 204]);

    check('Master/Produk', 'create', 'POST', '/api/products', [200, 201],
        ['code' => "SMKPRD{$suffix}", 'name' => 'Produk Smoke', 'default_unit' => 'Stel', 'base_price' => 120000,
         'sizes' => [['size_id' => $sizeId, 'price' => 125000]]]);
    $prod = App\Models\Product::where('code', "SMKPRD{$suffix}")->first();
    check('Master/Produk', 'update', 'PUT', "/api/products/{$prod->id}", [200],
        ['code' => "SMKPRD{$suffix}", 'name' => 'Produk Smoke Edit', 'default_unit' => 'Stel']);
    check('Master/Produk', 'delete', 'DELETE', "/api/products/{$prod->id}", [200, 204]);

    // ================= ADMIN: TRANSAKSI =================
    check('Transaksi/Invoice', 'store valid', 'POST', '/api/invoices', [200, 201],
        ['invoice_number' => "INV-SMK-{$suffix}", 'customer_id' => null, 'customer_name' => 'Pelanggan Smoke', 'order_date' => '2026-08-23',
         'type' => 'REGULAR', 'subtotal' => 500000, 'total_amount' => 500000, 'paid_amount' => 200000,
         'payment_status' => 'DP', 'production_status' => 'PROSES', 'cut_stock' => false,
         'items' => [['product_id' => $firstProd->id, 'item_name' => 'Seragam Smoke', 'unit' => 'Stel', 'qty' => 5, 'unit_price' => 100000, 'subtotal' => 500000]]]);
    $smokeInv = App\Models\Invoice::where('invoice_number', "INV-SMK-{$suffix}")->first();
    $results[] = ['group' => 'Transaksi/Invoice', 'label' => 'invoice + item tersimpan', 'method' => '-', 'uri' => '-', 'expect' => [], 'status' => $smokeInv?->items->count(), 'pass' => $smokeInv && $smokeInv->items->count() === 1, 'note' => ''];
    check('Transaksi/Invoice', 'store invalid payment_status', 'POST', '/api/invoices', [422],
        ['invoice_number' => "INV-SMK-X{$suffix}", 'customer_name' => 'X', 'order_date' => '2026-08-23', 'type' => 'REGULAR',
         'subtotal' => 1, 'total_amount' => 1, 'payment_status' => 'NGACO', 'items' => []]);
    check('Transaksi/Invoice', 'delete', 'DELETE', "/api/invoices/{$smokeInv->id}", [200, 204]);

    check('Transaksi/Purchase', 'store valid', 'POST', '/dashboard/purchases', [302],
        ['date' => '2026-08-23', 'supplier_name' => 'Supplier Smoke',
         'items' => [['item_id' => App\Models\Item::first()->id, 'unit_id' => App\Models\Item::first()->unit_id, 'quantity' => 3, 'unit_price' => 9000]]]);
    $results[] = ['group' => 'Transaksi/Purchase', 'label' => 'purchase tersimpan + stock mutasi', 'method' => '-', 'uri' => '-',
        'expect' => [], 'status' => '', 'pass' => App\Models\Purchase::whereHas('items', fn($q) => $q->where('quantity', 3))->where('supplier_name', 'Supplier Smoke')->exists(), 'note' => ''];

    check('Lainnya', 'reorder units', 'POST', '/api/master/reorder', [200], ['table' => 'units', 'ids' => array_reverse($unitIds)]);
    check('Lainnya', 'reorder table invalid', 'POST', '/api/master/reorder', [400], ['table' => 'users', 'ids' => [1]]);
    check('Lainnya', 'hak-akses update role staff', 'PUT', "/api/hak-akses/{$roleStaff->id}", [200],
        ['permission_ids' => $roleStaff->permissions->pluck('id')->all()]);
    check('Lainnya', 'hak-akses update user', 'PUT', "/api/hak-akses/user/{$tailorB->id}", [200], ['permission_ids' => []]);
    check('Lainnya', 'users-management update roles', 'PUT', "/api/users-management/{$tailorB->id}/roles", [200], ['role_ids' => [$roleStaff->id]]);
    check('Lainnya', 'profile update', 'PATCH', '/profile', [302], ['name' => 'Admin', 'email' => 'admin@example.com']);

    // ================= PROGRESS PRODUKSI =================
    check('Progress', 'index admin', 'GET', '/dashboard/production-progress', [200]);
    check('Progress', 'detail invoice admin', 'GET', "/dashboard/production-progress/invoice/{$inv->id}", [200]);
    check('Progress', 'store log (admin, step tailorA)', 'POST', '/dashboard/production-progress', [302],
        ['production_assignment_step_id' => $stepA->id, 'date' => '2026-08-23', 'qty' => 4, 'notes' => 'smoke log']);
    $logA = App\Models\ProductionProgressLog::where('production_assignment_step_id', $stepA->id)->latest('id')->first();
    $results[] = ['group' => 'Progress', 'label' => 'log tersimpan user_id penjahit', 'method' => '-', 'uri' => '-',
        'expect' => [], 'status' => $logA?->user_id, 'pass' => $logA && (int)$logA->user_id === $tailorA->id, 'note' => ''];
    check('Progress', 'destroy log', 'DELETE', "/dashboard/production-progress/{$logA->id}", [302]);
    check('Progress', 'validation qty<1 ditolak (redirect, tanpa menyimpan)', 'POST', '/dashboard/production-progress', [302],
        ['production_assignment_step_id' => $stepA->id, 'date' => '2026-08-23', 'qty' => 0]);
    $results[] = ['group' => 'Progress', 'label' => 'tidak ada log qty=0 tersimpan', 'method' => '-', 'uri' => '-',
        'expect' => [], 'status' => '', 'pass' => !App\Models\ProductionProgressLog::where('production_assignment_step_id', $stepA->id)->where('qty', 0)->exists(), 'note' => ''];

    // selesaikan semua langkah via progress -> assignment completed
    foreach ($assignA->steps as $st) {
        call('POST', '/dashboard/production-progress', ['production_assignment_step_id' => $st->id, 'date' => '2026-08-23', 'qty' => $st->qty]);
    }
    $assignA->refresh();
    $results[] = ['group' => 'Progress', 'label' => 'assignment otomatis COMPLETED saat semua step penuh', 'method' => '-', 'uri' => '-',
        'expect' => [], 'status' => $assignA->status, 'pass' => strtolower((string)$assignA->status) === 'completed', 'note' => "status={$assignA->status}"];

    // ================= NON-ADMIN SCOPE (tailorA) =================
    auth()->login($tailorA);
    check('Scope/A', 'dashboard boleh', 'GET', '/dashboard', [200]);
    check('Scope/A', 'invoice DILARANG', 'GET', '/dashboard/invoice', [403]);
    check('Scope/A', 'progress index boleh', 'GET', '/dashboard/production-progress', [200]);
    check('Scope/A', 'progress detail invoice miliknya', 'GET', "/dashboard/production-progress/invoice/{$inv->id}", [200]);
    check('Scope/A', 'progress detail invoice lain DILARANG', 'GET', "/dashboard/production-progress/invoice/{$otherInv->id}", [403]);
    check('Scope/A', 'store log step sendiri', 'POST', '/dashboard/production-progress', [302],
        ['production_assignment_step_id' => $stepA->id, 'date' => '2026-08-23', 'qty' => 1]);
    $results[] = ['group' => 'Scope/A', 'label' => 'log step sendiri tersimpan', 'method' => '-', 'uri' => '-',
        'expect' => [], 'status' => '', 'pass' => App\Models\ProductionProgressLog::where('production_assignment_step_id', $stepA->id)->where('qty', 1)->exists(), 'note' => ''];
    check('Scope/A', 'store log step ORANG lain ditolak', 'POST', '/dashboard/production-progress', [403],
        ['production_assignment_step_id' => $stepB->id, 'date' => '2026-08-23', 'qty' => 1]);
    $ownLogId = App\Models\ProductionProgressLog::where('production_assignment_step_id', $stepA->id)->latest('id')->value('id');
    check('Scope/A', 'hapus log DILARANG utk non-admin', 'DELETE', "/dashboard/production-progress/{$ownLogId}", [403]);

    // selesaikan semua langkah via progress -> assignment completed
    auth()->login($admin);
    foreach ($assignA->steps as $st) {
        call('POST', '/dashboard/production-progress', ['production_assignment_step_id' => $st->id, 'date' => '2026-08-23', 'qty' => $st->qty]);
    }
} finally {
    Illuminate\Support\Facades\DB::rollBack();
}

$pass = count(array_filter($results, fn($r) => $r['pass']));
$fail = count($results) - $pass;
echo "\n================ HASIL SMOKE TEST ================\n";
foreach ($results as $r) {
    echo sprintf("[%s] %-24s %s\n", $r['pass'] ? 'PASS' : 'FAIL', $r['group'], $r['label']);
    if (!$r['pass'] && $r['note']) echo "       {$r['note']}\n";
}
echo "==================================================\n";
echo "TOTAL: " . count($results) . " | PASS: {$pass} | FAIL: {$fail}\n";

