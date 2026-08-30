<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Permission;
use App\Models\ProductCategory;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AccessSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'dashboard.view', 'label' => 'Lihat Dashboard', 'group_name' => 'Dashboard'],
            ['name' => 'dashboard.analytics.view', 'label' => 'Lihat Analitik Penjualan', 'group_name' => 'Dashboard'],

            ['name' => 'kategori.view', 'label' => 'Lihat Kategori', 'group_name' => 'Kategori Produk'],
            ['name' => 'kategori.create', 'label' => 'Tambah Kategori', 'group_name' => 'Kategori Produk'],
            ['name' => 'kategori.update', 'label' => 'Edit Kategori', 'group_name' => 'Kategori Produk'],
            ['name' => 'kategori.delete', 'label' => 'Hapus Kategori', 'group_name' => 'Kategori Produk'],

            ['name' => 'satuan.view', 'label' => 'Lihat Satuan', 'group_name' => 'Satuan Barang'],
            ['name' => 'satuan.create', 'label' => 'Tambah Satuan', 'group_name' => 'Satuan Barang'],
            ['name' => 'satuan.update', 'label' => 'Edit Satuan', 'group_name' => 'Satuan Barang'],
            ['name' => 'satuan.delete', 'label' => 'Hapus Satuan', 'group_name' => 'Satuan Barang'],

            ['name' => 'barang.view', 'label' => 'Lihat Barang', 'group_name' => 'Barang & Bahan'],
            ['name' => 'barang.create', 'label' => 'Tambah Barang', 'group_name' => 'Barang & Bahan'],
            ['name' => 'barang.update', 'label' => 'Edit Barang', 'group_name' => 'Barang & Bahan'],
            ['name' => 'barang.delete', 'label' => 'Hapus Barang', 'group_name' => 'Barang & Bahan'],

            ['name' => 'produk.view', 'label' => 'Lihat Produk & BOM', 'group_name' => 'Produk & BOM'],
            ['name' => 'produk.create', 'label' => 'Tambah Produk & BOM', 'group_name' => 'Produk & BOM'],
            ['name' => 'produk.update', 'label' => 'Edit Produk & BOM', 'group_name' => 'Produk & BOM'],
            ['name' => 'produk.delete', 'label' => 'Hapus Produk & BOM', 'group_name' => 'Produk & BOM'],

            ['name' => 'kategori-produk.view', 'label' => 'Lihat Kategori Produk', 'group_name' => 'Kategori Produk'],
            ['name' => 'kategori-produk.create', 'label' => 'Tambah Kategori Produk', 'group_name' => 'Kategori Produk'],
            ['name' => 'kategori-produk.update', 'label' => 'Edit Kategori Produk', 'group_name' => 'Kategori Produk'],
            ['name' => 'kategori-produk.delete', 'label' => 'Hapus Kategori Produk', 'group_name' => 'Kategori Produk'],

            ['name' => 'pelanggan.view', 'label' => 'Lihat Data Pelanggan', 'group_name' => 'Data Pelanggan'],
            ['name' => 'pelanggan.create', 'label' => 'Tambah Data Pelanggan', 'group_name' => 'Data Pelanggan'],
            ['name' => 'pelanggan.update', 'label' => 'Edit Data Pelanggan', 'group_name' => 'Data Pelanggan'],
            ['name' => 'pelanggan.delete', 'label' => 'Hapus Data Pelanggan', 'group_name' => 'Data Pelanggan'],

            ['name' => 'invoice.view', 'label' => 'Lihat Invoice', 'group_name' => 'Transaksi & Invoice'],
            ['name' => 'invoice.create', 'label' => 'Buat / Input Invoice', 'group_name' => 'Transaksi & Invoice'],
            ['name' => 'invoice.update', 'label' => 'Edit Invoice', 'group_name' => 'Transaksi & Invoice'],
            ['name' => 'invoice.delete', 'label' => 'Hapus Invoice', 'group_name' => 'Transaksi & Invoice'],

            ['name' => 'role.view', 'label' => 'Lihat Role', 'group_name' => 'Role'],
            ['name' => 'role.create', 'label' => 'Tambah Role', 'group_name' => 'Role'],
            ['name' => 'role.update', 'label' => 'Edit Role', 'group_name' => 'Role'],
            ['name' => 'role.delete', 'label' => 'Hapus Role', 'group_name' => 'Role'],

            ['name' => 'permission.view', 'label' => 'Lihat Permission', 'group_name' => 'Permission'],
            ['name' => 'permission.create', 'label' => 'Tambah Permission', 'group_name' => 'Permission'],
            ['name' => 'permission.update', 'label' => 'Edit Permission', 'group_name' => 'Permission'],
            ['name' => 'permission.delete', 'label' => 'Hapus Permission', 'group_name' => 'Permission'],

            ['name' => 'hak_akses.view', 'label' => 'Lihat Hak Akses', 'group_name' => 'Hak Akses'],
            ['name' => 'hak_akses.update', 'label' => 'Ubah Hak Akses', 'group_name' => 'Hak Akses'],

            ['name' => 'user.view', 'label' => 'Lihat User', 'group_name' => 'User Management'],
            ['name' => 'user.update', 'label' => 'Ubah User', 'group_name' => 'User Management'],

            ['name' => 'menu.view', 'label' => 'Lihat Menu', 'group_name' => 'Menu'],
            ['name' => 'menu.create', 'label' => 'Tambah Menu', 'group_name' => 'Menu'],
            ['name' => 'menu.update', 'label' => 'Edit Menu', 'group_name' => 'Menu'],
            ['name' => 'menu.delete', 'label' => 'Hapus Menu', 'group_name' => 'Menu'],
        ];

        // Clean up obsolete 'sekolah' permissions if they exist
        Permission::where('name', 'like', 'sekolah.%')->delete();

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        $adminRole = Role::updateOrCreate(
            ['name' => 'admin'],
            ['label' => 'Admin', 'is_active' => true]
        );

        $staffRole = Role::updateOrCreate(
            ['name' => 'staff'],
            ['label' => 'Staff', 'is_active' => true]
        );

        $userRole = Role::updateOrCreate(
            ['name' => 'user'],
            ['label' => 'User', 'is_active' => true]
        );

        $adminRole->permissions()->sync(Permission::pluck('id')->toArray());

        $staffRole->permissions()->sync(
            Permission::whereIn('name', [
                'dashboard.view',
                'dashboard.analytics.view',
                'kategori.view',
                'kategori.create',
                'kategori.update',
                'satuan.view',
                'satuan.create',
                'satuan.update',
                'barang.view',
                'barang.create',
                'barang.update',
                'produk.view',
                'produk.create',
                'produk.update',
                'kategori-produk.view',
                'kategori-produk.create',
                'kategori-produk.update',
                'pelanggan.view',
                'pelanggan.create',
                'pelanggan.update',
                'invoice.view',
                'invoice.create',
                'invoice.update',
            ])->pluck('id')->toArray()
        );

        $userRole->permissions()->sync(
            Permission::whereIn('name', [
                'dashboard.view',
            ])->pluck('id')->toArray()
        );

        // Reset old menus and build structured parent-child menus
        Menu::truncate();

        // 1. Dashboard (Direct Top Menu)
        Menu::create([
            'parent_id' => null,
            'title' => 'Dashboard',
            'icon' => 'Dashboard',
            'path' => '/dashboard',
            'permission_name' => 'dashboard.view',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // 2. Transaksi & Invoice (Direct Top Menu)
        Menu::create([
            'parent_id' => null,
            'title' => 'Transaksi & Invoice',
            'icon' => 'Receipt',
            'path' => '/dashboard/invoice',
            'permission_name' => 'invoice.view',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // 3. Progress Penjahit (Direct Top Menu)
        Menu::create([
            'parent_id' => null,
            'title' => 'Progress Penjahit',
            'icon' => 'Scissors',
            'path' => '/dashboard/production-progress',
            'permission_name' => null,
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // 4. Pembelian (Direct Top Menu)
        Menu::create([
            'parent_id' => null,
            'title' => 'Pembelian',
            'icon' => 'ShoppingBag',
            'path' => '/dashboard/purchases',
            'permission_name' => null,
            'sort_order' => 4,
            'is_active' => true,
        ]);

        // 5. Master Data (Parent Menu with Collapsible Submenu)
        $masterDataParent = Menu::create([
            'parent_id' => null,
            'title' => 'Master Data',
            'icon' => 'Boxes',
            'path' => null,
            'permission_name' => null,
            'sort_order' => 5,
            'is_active' => true,
        ]);

        // Master Data Children — ordered by prerequisites first
        // 1. Kategori Bahan (harus ada sebelum Bahan Baku)
        Menu::create([
            'parent_id' => $masterDataParent->id,
            'title' => 'Kategori Bahan',
            'icon' => 'Category',
            'path' => '/dashboard/kategori',
            'permission_name' => 'kategori.view',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // 2. Satuan Bahan (harus ada sebelum Bahan Baku)
        Menu::create([
            'parent_id' => $masterDataParent->id,
            'title' => 'Satuan Bahan',
            'icon' => 'Scale',
            'path' => '/dashboard/satuan',
            'permission_name' => 'satuan.view',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // 3. Bahan Baku (butuh Kategori & Satuan)
        Menu::create([
            'parent_id' => $masterDataParent->id,
            'title' => 'Bahan Baku',
            'icon' => 'Package',
            'path' => '/dashboard/barang',
            'permission_name' => 'barang.view',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // 4. Kategori Produk
        Menu::create([
            'parent_id' => $masterDataParent->id,
            'title' => 'Kategori Produk',
            'icon' => 'Tags',
            'path' => '/dashboard/kategori-produk',
            'permission_name' => 'kategori-produk.view',
            'sort_order' => 4,
            'is_active' => true,
        ]);

        // 5. Ukuran (harus ada sebelum Produk)
        Menu::create([
            'parent_id' => $masterDataParent->id,
            'title' => 'Ukuran',
            'icon' => 'Ruler',
            'path' => '/dashboard/ukuran',
            'permission_name' => 'produk.view',
            'sort_order' => 5,
            'is_active' => true,
        ]);

        // 6. Langkah Produksi (harus ada sebelum Produk)
        Menu::create([
            'parent_id' => $masterDataParent->id,
            'title' => 'Langkah Produksi',
            'icon' => 'Scissors',
            'path' => '/dashboard/langkah-produksi',
            'permission_name' => 'produk.view',
            'sort_order' => 6,
            'is_active' => true,
        ]);

        // 7. Produk & Resep BOM (butuh semua master di atas)
        Menu::create([
            'parent_id' => $masterDataParent->id,
            'title' => 'Produk & Resep BOM',
            'icon' => 'Shirt',
            'path' => '/dashboard/produk',
            'permission_name' => 'produk.view',
            'sort_order' => 7,
            'is_active' => true,
        ]);

        // 8. Data Pelanggan
        Menu::create([
            'parent_id' => $masterDataParent->id,
            'title' => 'Data Pelanggan',
            'icon' => 'Users',
            'path' => '/dashboard/pelanggan',
            'permission_name' => 'pelanggan.view',
            'sort_order' => 8,
            'is_active' => true,
        ]);

        // 6. Pengaturan Sistem (Parent Menu with Collapsible Submenu)
        $settingsParent = Menu::create([
            'parent_id' => null,
            'title' => 'Pengaturan',
            'icon' => 'Settings',
            'path' => null,
            'permission_name' => null,
            'sort_order' => 6,
            'is_active' => true,
        ]);

        // Settings Children
        Menu::create([
            'parent_id' => $settingsParent->id,
            'title' => 'Hak Akses',
            'icon' => 'Security',
            'path' => '/dashboard/hak-akses',
            'permission_name' => 'hak_akses.view',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Menu::create([
            'parent_id' => $settingsParent->id,
            'title' => 'User Management',
            'icon' => 'People',
            'path' => '/dashboard/users',
            'permission_name' => 'user.view',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $admin->roles()->sync([$adminRole->id]);

        // Seed default product categories
        $defaultProductCategories = [
            ['name' => 'Seragam Olahraga', 'slug' => 'seragam-olahraga', 'description' => 'Seragam olahraga sekolah & instansi (Stel)', 'is_active' => true],
            ['name' => 'Seragam Batik Sekolah', 'slug' => 'seragam-batik-sekolah', 'description' => 'Batik identitas sekolah & seragam khusus', 'is_active' => true],
            ['name' => 'Kemeja PDH / PDL', 'slug' => 'kemeja-pdh-pdl', 'description' => 'Pakaian dinas harian / lapangan instansi & kantor', 'is_active' => true],
            ['name' => 'Jas Almamater', 'slug' => 'jas-almamater', 'description' => 'Jas almamater kampus, sekolah, dan organisasi', 'is_active' => true],
            ['name' => 'Kaos & Polo Shirt', 'slug' => 'kaos-dan-polo-shirt', 'description' => 'Kaos event, kaos promosi, dan polo bordir', 'is_active' => true],
            ['name' => 'Busana Muslim & Gamis', 'slug' => 'busana-muslim-dan-gamis', 'description' => 'Gamis seragam, kerudung, dan jilbab instansi', 'is_active' => true],
            ['name' => 'Celana & Rok Seragam', 'slug' => 'celana-dan-rok-seragam', 'description' => 'Bawahan seragam sekolah & celana dinas', 'is_active' => true],
        ];

        foreach ($defaultProductCategories as $pc) {
            ProductCategory::firstOrCreate(
                ['slug' => $pc['slug']],
                $pc
            );
        }
    }
}
