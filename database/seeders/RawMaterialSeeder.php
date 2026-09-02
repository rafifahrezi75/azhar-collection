<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Item;
use App\Models\StockMutation;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RawMaterialSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::first();
        $adminId = $adminUser ? $adminUser->id : 1;

        $categoriesData = [
            ['name' => 'Kain & Tekstil Utama', 'slug' => 'kain-tekstil-utama', 'description' => 'Bahan kain utama'],
            ['name' => 'Benang Jahit & Obras', 'slug' => 'benang-jahit-obras', 'description' => 'Benang jahit dan obras'],
            ['name' => 'Aksesoris Seragam', 'slug' => 'aksesoris-seragam', 'description' => 'Bet logo, bordir, aksesoris'],
            ['name' => 'Kancing & Ritsleting', 'slug' => 'kancing-ritsleting', 'description' => 'Kancing kemeja dan zipper'],
            ['name' => 'Karet & Pelapis', 'slug' => 'karet-pelapis', 'description' => 'Karet celana dan kain keras kerah'],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[$c['name']] = Category::firstOrCreate(['slug' => $c['slug']], $c);
        }

        $unitsData = [
            ['name' => 'Meter', 'symbol' => 'm'],
            ['name' => 'Roll', 'symbol' => 'roll'],
            ['name' => 'Pcs', 'symbol' => 'pcs'],
            ['name' => 'Gross', 'symbol' => 'grs'],
            ['name' => 'Lusin', 'symbol' => 'lsn'],
        ];

        $units = [];
        foreach ($unitsData as $u) {
            $units[$u['symbol']] = Unit::firstOrCreate(['symbol' => $u['symbol']], $u);
        }

        $itemsData = [
            [
                'code' => 'KAIN-OXF-WHT',
                'name' => 'Kain Oxford Super Putih',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id,
                'price' => 28000,
                'is_active' => true,
                'description' => 'Bahan kemeja seragam SD, SMP, SMA',
                'stock' => 350,
            ],
            [
                'code' => 'KAIN-FAM-RED',
                'name' => 'Kain Famatex Merah SD',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id,
                'price' => 35000,
                'is_active' => true,
                'description' => 'Bahan celana dan rok seragam SD',
                'stock' => 220,
            ],
            [
                'code' => 'KAIN-FAM-BLU',
                'name' => 'Kain Famatex Biru Dongker SMP',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id,
                'price' => 35000,
                'is_active' => true,
                'description' => 'Bahan celana dan rok seragam SMP',
                'stock' => 280,
            ],
            [
                'code' => 'KAIN-FAM-GRY',
                'name' => 'Kain Famatex Abu SMA',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id,
                'price' => 35000,
                'is_active' => true,
                'description' => 'Bahan celana dan rok seragam SMA',
                'stock' => 190,
            ],
            [
                'code' => 'KAIN-FAM-PRM',
                'name' => 'Kain Famatex Coklat Tua Pramuka',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id,
                'price' => 36000,
                'is_active' => true,
                'description' => 'Bahan seragam pramuka penegak dan penggalang',
                'stock' => 160,
            ],
            [
                'code' => 'BNG-WHT',
                'name' => 'Benang Jahit Astra Putih',
                'category_id' => $categories['Benang Jahit & Obras']->id,
                'unit_id' => $units['pcs']->id,
                'price' => 2000,
                'is_active' => true,
                'description' => 'Benang jahit kemeja putih',
                'stock' => 85,
            ],
            [
                'code' => 'BNG-OBR-WHT',
                'name' => 'Benang Obras Putih',
                'category_id' => $categories['Benang Jahit & Obras']->id,
                'unit_id' => $units['pcs']->id,
                'price' => 15000,
                'is_active' => true,
                'description' => 'Benang obras sambungan kain',
                'stock' => 25,
            ],
            [
                'code' => 'BADGE-SD',
                'name' => 'Badge Bordir Logo SD',
                'category_id' => $categories['Aksesoris Seragam']->id,
                'unit_id' => $units['pcs']->id,
                'price' => 1500,
                'is_active' => true,
                'description' => 'Logo saku kemeja SD',
                'stock' => 450,
            ],
            [
                'code' => 'BADGE-SMP',
                'name' => 'Badge Bordir Logo SMP',
                'category_id' => $categories['Aksesoris Seragam']->id,
                'unit_id' => $units['pcs']->id,
                'price' => 1500,
                'is_active' => true,
                'description' => 'Logo saku kemeja SMP',
                'stock' => 380,
            ],
            [
                'code' => 'BADGE-SMA',
                'name' => 'Badge Bordir Logo SMA',
                'category_id' => $categories['Aksesoris Seragam']->id,
                'unit_id' => $units['pcs']->id,
                'price' => 1500,
                'is_active' => true,
                'description' => 'Logo saku kemeja SMA',
                'stock' => 260,
            ],
            [
                'code' => 'BADGE-PRM',
                'name' => 'Badge Tunas Kelapa Pramuka',
                'category_id' => $categories['Aksesoris Seragam']->id,
                'unit_id' => $units['pcs']->id,
                'price' => 1000,
                'is_active' => true,
                'description' => 'Bet tanda pramuka',
                'stock' => 320,
            ],
            [
                'code' => 'KNC-WHT',
                'name' => 'Kancing Kemeja Putih 14L',
                'category_id' => $categories['Kancing & Ritsleting']->id,
                'unit_id' => $units['pcs']->id,
                'price' => 50,
                'is_active' => true,
                'description' => 'Kancing 4 lubang putih kemeja',
                'stock' => 2500,
            ],
            [
                'code' => 'KNC-PRM',
                'name' => 'Kancing Kemeja Coklat 14L',
                'category_id' => $categories['Kancing & Ritsleting']->id,
                'unit_id' => $units['pcs']->id,
                'price' => 50,
                'is_active' => true,
                'description' => 'Kancing seragam pramuka',
                'stock' => 1200,
            ],
            [
                'code' => 'ZIP-YKK-N1',
                'name' => 'Ritsleting YKK Celana',
                'category_id' => $categories['Kancing & Ritsleting']->id,
                'unit_id' => $units['pcs']->id,
                'price' => 2500,
                'is_active' => true,
                'description' => 'Zipper celana sekolah',
                'stock' => 300,
            ],
            [
                'code' => 'KRT-ELS-3CM',
                'name' => 'Karet Elastis Celana 3cm',
                'category_id' => $categories['Karet & Pelapis']->id,
                'unit_id' => $units['m']->id,
                'price' => 2000,
                'is_active' => true,
                'description' => 'Karet pinggang elastis celana dan rok',
                'stock' => 180,
            ],
            [
                'code' => 'KAIN-KRS-KRH',
                'name' => 'Kain Keras Kerah Staplek',
                'category_id' => $categories['Karet & Pelapis']->id,
                'unit_id' => $units['m']->id,
                'price' => 8000,
                'is_active' => true,
                'description' => 'Pelapis keras kerah kemeja',
                'stock' => 75,
            ],
        ];

        DB::table('stock_mutations')->delete();
        DB::table('items')->delete();

        foreach ($itemsData as $data) {
            $item = Item::create([
                'code' => $data['code'],
                'name' => $data['name'],
                'category_id' => $data['category_id'],
                'unit_id' => $data['unit_id'],
                'price' => $data['price'],
                'is_active' => $data['is_active'],
                'description' => $data['description'],
                'estimated_stock' => $data['stock'],
                'real_stock' => $data['stock'],
            ]);

            StockMutation::create([
                'item_id' => $item->id,
                'user_id' => $adminId,
                'type' => 'in',
                'quantity' => $data['stock'],
                'unit_id' => $item->unit_id,
                'multiplier' => 1,
                'total_base_quantity' => $data['stock'],
                'previous_stock' => 0,
                'current_stock' => $data['stock'],
                'notes' => 'Setup saldo awal stok bahan baku',
            ]);
        }
    }
}
