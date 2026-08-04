<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Permission;
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
                'kategori.view',
                'kategori.create',
                'kategori.update',
                'satuan.view',
                'satuan.create',
                'satuan.update',
                'barang.view',
                'barang.create',
                'barang.update',
            ])->pluck('id')->toArray()
        );

        $userRole->permissions()->sync(
            Permission::whereIn('name', [
                'dashboard.view',
            ])->pluck('id')->toArray()
        );

        Menu::updateOrCreate(
            ['path' => '/dashboard'],
            [
                'parent_id' => null,
                'title' => 'Dashboard',
                'icon' => 'Dashboard',
                'permission_name' => 'dashboard.view',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        Menu::updateOrCreate(
            ['path' => '/dashboard/kategori'],
            [
                'parent_id' => null,
                'title' => 'Kategori',
                'icon' => 'Category',
                'permission_name' => 'kategori.view',
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        Menu::updateOrCreate(
            ['path' => '/dashboard/satuan'],
            [
                'parent_id' => null,
                'title' => 'Satuan',
                'icon' => 'Scale',
                'permission_name' => 'satuan.view',
                'sort_order' => 3,
                'is_active' => true,
            ]
        );

        Menu::updateOrCreate(
            ['path' => '/dashboard/barang'],
            [
                'parent_id' => null,
                'title' => 'Barang',
                'icon' => 'Package',
                'permission_name' => 'barang.view',
                'sort_order' => 4,
                'is_active' => true,
            ]
        );

        Menu::updateOrCreate(
            ['path' => '/dashboard/hak-akses'],
            [
                'parent_id' => null,
                'title' => 'Hak Akses',
                'icon' => 'Security',
                'permission_name' => 'hak_akses.view',
                'sort_order' => 5,
                'is_active' => true,
            ]
        );

        Menu::updateOrCreate(
            ['path' => '/dashboard/users'],
            [
                'parent_id' => null,
                'title' => 'User',
                'icon' => 'People',
                'permission_name' => 'user.view',
                'sort_order' => 6,
                'is_active' => true,
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $admin->roles()->sync([$adminRole->id]);
    }
}
