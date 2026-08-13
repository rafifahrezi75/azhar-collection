<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Item;
use App\Models\ItemConversion;
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

        // Categories
        $categoriesData = [
            ['name' => 'Kain & Tekstil Utama', 'slug' => 'kain-tekstil-utama', 'description' => 'Bahan kain utama'],
            ['name' => 'Benang Jahit & Obras', 'slug' => 'benang-jahit-obras', 'description' => 'Benang jahit'],
            ['name' => 'Aksesoris Seragam', 'slug' => 'aksesoris-seragam', 'description' => 'Bet, topi, dasi'],
            ['name' => 'Kancing & Ritsleting', 'slug' => 'kancing-ritsleting', 'description' => 'Kancing seragam, zipper'],
            ['name' => 'Karet & Pelapis', 'slug' => 'karet-pelapis', 'description' => 'Karet elastis celana, kain keras kerah'],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[$c['name']] = Category::firstOrCreate(['slug' => $c['slug']], $c);
        }

        // Units
        $unitsData = [
            ['name' => 'Meter', 'symbol' => 'm'],
            ['name' => 'Roll', 'symbol' => 'roll'],
            ['name' => 'Yard', 'symbol' => 'yd'],
            ['name' => 'Pcs', 'symbol' => 'pcs'],
            ['name' => 'Gross', 'symbol' => 'grs'],
            ['name' => 'Lusin', 'symbol' => 'lsn'],
        ];

        $units = [];
        foreach ($unitsData as $u) {
            $units[$u['symbol']] = Unit::firstOrCreate(['symbol' => $u['symbol']], $u);
        }

        $itemsData = [
            // Kain
            [
                'code' => 'KAIN-OXF-WHT', 'name' => 'Kain Oxford Putih (Atasan)',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id, 'price' => 28000,
                'is_active' => true, 'description' => 'Bahan kemeja SD, SMP, SMA',
            ],
            [
                'code' => 'KAIN-FAM-RED', 'name' => 'Kain Famatex Merah Hati (Bawahan SD)',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id, 'price' => 35000,
                'is_active' => true, 'description' => 'Bahan celana/rok SD',
            ],
            [
                'code' => 'KAIN-FAM-BLU', 'name' => 'Kain Famatex Biru Dongker (Bawahan SMP)',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id, 'price' => 35000,
                'is_active' => true, 'description' => 'Bahan celana/rok SMP',
            ],
            [
                'code' => 'KAIN-FAM-GRY', 'name' => 'Kain Famatex Abu-Abu (Bawahan SMA)',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id, 'price' => 35000,
                'is_active' => true, 'description' => 'Bahan celana/rok SMA',
            ],
            [
                'code' => 'KAIN-OXF-PRM', 'name' => 'Kain Oxford Coklat Muda (Pramuka)',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id, 'price' => 30000,
                'is_active' => true, 'description' => 'Atasan pramuka',
            ],
            [
                'code' => 'KAIN-FAM-PRM', 'name' => 'Kain Famatex Coklat Tua (Pramuka)',
                'category_id' => $categories['Kain & Tekstil Utama']->id,
                'unit_id' => $units['m']->id, 'price' => 35000,
                'is_active' => true, 'description' => 'Bawahan pramuka',
            ],
            // Benang
            [
                'code' => 'BNG-WHT', 'name' => 'Benang Jahit Putih',
                'category_id' => $categories['Benang Jahit & Obras']->id,
                'unit_id' => $units['pcs']->id, 'price' => 2000,
                'is_active' => true, 'description' => 'Benang jahit atasan',
            ],
            [
                'code' => 'BNG-OBR-WHT', 'name' => 'Benang Obras Putih',
                'category_id' => $categories['Benang Jahit & Obras']->id,
                'unit_id' => $units['pcs']->id, 'price' => 15000,
                'is_active' => true, 'description' => 'Benang obras dalam',
            ],
            // Aksesoris
            [
                'code' => 'BADGE-SD', 'name' => 'Badge / Bet SD',
                'category_id' => $categories['Aksesoris Seragam']->id,
                'unit_id' => $units['pcs']->id, 'price' => 1500,
                'is_active' => true, 'description' => 'Logo SD di saku',
            ],
            [
                'code' => 'BADGE-SMP', 'name' => 'Badge / Bet SMP',
                'category_id' => $categories['Aksesoris Seragam']->id,
                'unit_id' => $units['pcs']->id, 'price' => 1500,
                'is_active' => true, 'description' => 'Logo SMP di saku',
            ],
            [
                'code' => 'BADGE-SMA', 'name' => 'Badge / Bet SMA',
                'category_id' => $categories['Aksesoris Seragam']->id,
                'unit_id' => $units['pcs']->id, 'price' => 1500,
                'is_active' => true, 'description' => 'Logo SMA di saku',
            ],
            [
                'code' => 'BADGE-PRM', 'name' => 'Badge / Bet Tunas Kelapa Pramuka',
                'category_id' => $categories['Aksesoris Seragam']->id,
                'unit_id' => $units['pcs']->id, 'price' => 1000,
                'is_active' => true, 'description' => 'Tanda Pramuka',
            ],
            // Kancing & Karet
            [
                'code' => 'KNC-WHT', 'name' => 'Kancing Kemeja Putih (14L)',
                'category_id' => $categories['Kancing & Ritsleting']->id,
                'unit_id' => $units['pcs']->id, 'price' => 50,
                'is_active' => true, 'description' => 'Kancing atasan putih',
            ],
            [
                'code' => 'KNC-PRM', 'name' => 'Kancing Kemeja Coklat (14L)',
                'category_id' => $categories['Kancing & Ritsleting']->id,
                'unit_id' => $units['pcs']->id, 'price' => 50,
                'is_active' => true, 'description' => 'Kancing atasan pramuka',
            ],
            [
                'code' => 'ZIP-YKK-N1', 'name' => 'Ritsleting YKK Celana (Besi)',
                'category_id' => $categories['Kancing & Ritsleting']->id,
                'unit_id' => $units['pcs']->id, 'price' => 2500,
                'is_active' => true, 'description' => 'Ritsleting celana sekolah',
            ],
            [
                'code' => 'KRT-ELS-3CM', 'name' => 'Karet Elastis Celana 3cm',
                'category_id' => $categories['Karet & Pelapis']->id,
                'unit_id' => $units['m']->id, 'price' => 2000,
                'is_active' => true, 'description' => 'Karet pinggang celana/rok',
            ],
            [
                'code' => 'KAIN-KRS-KRH', 'name' => 'Kain Keras Kerah (Staplek)',
                'category_id' => $categories['Karet & Pelapis']->id,
                'unit_id' => $units['m']->id, 'price' => 8000,
                'is_active' => true, 'description' => 'Pengeras kerah kemeja',
            ],
        ];

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
                'estimated_stock' => rand(500, 2000),
                'real_stock' => rand(480, 2000),
            ]);

            StockMutation::create([
                'item_id' => $item->id,
                'user_id' => $adminId,
                'type' => 'in',
                'quantity' => $item->real_stock,
                'unit_id' => $item->unit_id,
                'multiplier' => 1,
                'total_base_quantity' => $item->real_stock,
                'previous_stock' => 0,
                'current_stock' => $item->real_stock,
                'notes' => 'Initial stock setup via seeder',
            ]);
        }
    }
}
