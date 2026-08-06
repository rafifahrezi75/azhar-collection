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

        // 1. Master Categories
        $categoriesData = [
            [
                'name' => 'Kain & Tekstil Utama',
                'slug' => 'kain-tekstil-utama',
                'description' => 'Bahan baku kain gulungan dan potongan untuk produksi pakaian gamis, koko, kemeja, dan celana.'
            ],
            [
                'name' => 'Benang Jahit, Obras & Bordir',
                'slug' => 'benang-jahit-obras-bordir',
                'description' => 'Aneka benang jahit spun polyester, benang obras, dan benang bordir berbagai nomor warna.'
            ],
            [
                'name' => 'Kancing & Fastener',
                'slug' => 'kancing-fastener',
                'description' => 'Aneka kancing kemeja 4 lubang, kancing batok kelapa klasik, dan kancing cetek snap button.'
            ],
            [
                'name' => 'Ritsleting & Zipper',
                'slug' => 'ritsleting-zipper',
                'description' => 'Zipper invisible YKK busana wanita, zipper coil, dan ritsleting logam celana.'
            ],
            [
                'name' => 'Kain Keras & Pelapis (Interfacing)',
                'slug' => 'kain-keras-pelapis',
                'description' => 'Kain keras kerah staplek, vislin berperekat, tricot, dan furing pelapis pakaian.'
            ],
            [
                'name' => 'Karet Elastis & Webbing',
                'slug' => 'karet-elastis-webbing',
                'description' => 'Karet ban pinggang elastis celana sarung, sirwal, dan manset pergelangan tangan.'
            ],
            [
                'name' => 'Renda, Pita & Label Brand',
                'slug' => 'renda-pita-label-brand',
                'description' => 'Label woven damask merk Azhar Collection, renda gipper, pita satin, dan hangtag.'
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[$c['name']] = Category::updateOrCreate(
                ['slug' => $c['slug']],
                ['name' => $c['name'], 'description' => $c['description'], 'is_active' => true]
            );
        }

        // 2. Master Units
        $unitsData = [
            ['name' => 'Meter', 'symbol' => 'm', 'description' => 'Satuan panjang kain, renda, dan karet'],
            ['name' => 'Roll', 'symbol' => 'roll', 'description' => 'Satuan gulungan besar kain atau karet elastis'],
            ['name' => 'Pieces', 'symbol' => 'pcs', 'description' => 'Satuan buah/biji untuk benang, kancing, zipper, dan label'],
            ['name' => 'Lusin', 'symbol' => 'lsn', 'description' => 'Satuan kemasan 12 buah'],
            ['name' => 'Gross', 'symbol' => 'grs', 'description' => 'Satuan kemasan 144 buah (12 lusin)'],
            ['name' => 'Pack', 'symbol' => 'pack', 'description' => 'Satuan kemasan pak / bungkus'],
            ['name' => 'Box', 'symbol' => 'box', 'description' => 'Satuan kemasan kardus / kotak besar'],
            ['name' => 'Pasang', 'symbol' => 'psg', 'description' => 'Satuan pasang untuk kancing snap / kancing jepret'],
            ['name' => 'Gulung', 'symbol' => 'glg', 'description' => 'Satuan gulungan kecil pita / benang bordir'],
        ];

        $units = [];
        foreach ($unitsData as $u) {
            $units[$u['symbol']] = Unit::updateOrCreate(
                ['symbol' => $u['symbol']],
                ['name' => $u['name'], 'description' => $u['description'], 'is_active' => true]
            );
        }

        // 3. Realistic Raw Materials with Discrete Physical Unit Breakdown
        $itemsData = [
            // --- KAIN UTAMA ---
            [
                'code' => 'KAIN-TOY-NVY',
                'name' => 'Kain Katun Toyobo Fodu Import (Navy Blue)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'min_stock' => 30,
                'description' => 'Katun Toyobo Fodu grade A serat rapat halus, adem & jatuh elegan. Warna Navy Blue (Biru Dongker) Lebar 150cm.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 50, 'real_stock' => 4, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 0,
                'base_estimated_stock' => 35, // 35 meter sisa potongan meja potong
            ],
            [
                'code' => 'KAIN-RAY-SGE',
                'name' => 'Kain Rayon Viscose Twill 30s (Sage Green)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'min_stock' => 25,
                'description' => 'Bahan rayon viscose twill sangat dingin dan lembut, cocok untuk gamis printing dan kemeja santai. Warna Sage Green.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 50, 'real_stock' => 3, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 15,
                'base_estimated_stock' => 10,
            ],
            [
                'code' => 'KAIN-LNN-WHT',
                'name' => 'Kain Pure Linen Rami Organik 100% (Broken White)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'min_stock' => 20,
                'description' => 'Linen rami natural tekstur serat tegas mewah, sangat diminati untuk baju koko modern dan kemeja santai. Warna Broken White.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 40, 'real_stock' => 2, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 12,
                'base_estimated_stock' => 8,
            ],
            [
                'code' => 'KAIN-STN-MRN',
                'name' => 'Kain Satin Silk Maxmara Premium (Maroon Red)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'min_stock' => 15,
                'description' => 'Satin maxmara kilau doff lembut mewah tidak gerah, untuk gamis pesta, abaya, dan kombinasi aksen busana wanita.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 50, 'real_stock' => 1, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 24,
                'base_estimated_stock' => 0,
            ],
            [
                'code' => 'KAIN-DNM-BLU',
                'name' => 'Kain Denim Cotton Chambray 6.5 oz (Indigo Blue)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'min_stock' => 30,
                'description' => 'Chambray denim katun ringan dan breathable untuk kemeja kasual koko denim dan outerwear.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 60, 'real_stock' => 2, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 38,
                'base_estimated_stock' => 0,
            ],
            [
                'code' => 'KAIN-WLF-BLK',
                'name' => 'Kain Woolpeach / Wolfis Grade A (Jet Black)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'min_stock' => 40,
                'description' => 'Kain wolfis hitam pekat tebal tidak tembus pandang, tekstur lembut jatuh untuk abaya, khimar, dan jilbab syari.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 50, 'real_stock' => 5, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 0,
                'base_estimated_stock' => 18,
            ],

            // --- BENANG JAHIT, OBRAS & BORDIR ---
            [
                'code' => 'BNG-AST-BLK',
                'name' => 'Benang Jahit Spun Polyester 40/2 Astra (Hitam No. 000)',
                'category' => 'Benang Jahit, Obras & Bordir',
                'unit' => 'pcs',
                'min_stock' => 24,
                'description' => 'Benang jahit Astra 5000 yards kualitas industri garmen, kuat, licin, dan tidak gampang putus di mesin high-speed.',
                'conversions' => [
                    ['unit' => 'box', 'multiplier' => 120, 'real_stock' => 2, 'estimated_stock' => 0],
                    ['unit' => 'lsn', 'multiplier' => 12, 'real_stock' => 2, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 6,
                'base_estimated_stock' => 0,
            ],
            [
                'code' => 'BNG-AST-WHT',
                'name' => 'Benang Jahit Spun Polyester 40/2 Astra (Putih No. 100)',
                'category' => 'Benang Jahit, Obras & Bordir',
                'unit' => 'pcs',
                'min_stock' => 24,
                'description' => 'Benang jahit Astra 5000 yards putih bersih untuk produksi baju koko putih dan kemeja polos.',
                'conversions' => [
                    ['unit' => 'box', 'multiplier' => 120, 'real_stock' => 2, 'estimated_stock' => 0],
                    ['unit' => 'lsn', 'multiplier' => 12, 'real_stock' => 4, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 8,
                'base_estimated_stock' => 0,
            ],
            [
                'code' => 'BNG-OBR-NAT',
                'name' => 'Benang Obras Tekstur Polyester 20/2 (Natural Off-White)',
                'category' => 'Benang Jahit, Obras & Bordir',
                'unit' => 'pcs',
                'min_stock' => 12,
                'description' => 'Benang obras elastis padat untuk mesin obras 4 benang dan 5 benang jahitan tepi kain.',
                'conversions' => [
                    ['unit' => 'lsn', 'multiplier' => 12, 'real_stock' => 3, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 4,
                'base_estimated_stock' => 2,
            ],
            [
                'code' => 'BNG-BRD-GLD',
                'name' => 'Benang Bordir Rayon Filament Shiny (Gold Emas No. 902)',
                'category' => 'Benang Jahit, Obras & Bordir',
                'unit' => 'pcs',
                'min_stock' => 10,
                'description' => 'Benang bordir kilap tinggi untuk bordir komputer motif dada baju koko dan manset lengan.',
                'conversions' => [
                    ['unit' => 'lsn', 'multiplier' => 12, 'real_stock' => 3, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 6,
                'base_estimated_stock' => 0,
            ],

            // --- KANCING & FASTENER ---
            [
                'code' => 'KNC-KMJ-WHT',
                'name' => 'Kancing Kemeja 4 Lubang Polyester 18L (Putih Mutiara)',
                'category' => 'Kancing & Fastener',
                'unit' => 'pcs',
                'min_stock' => 288,
                'description' => 'Kancing kemeja ukuran 11.5mm (18L) finishing mutiara mengkilap tahan setrika panas.',
                'conversions' => [
                    ['unit' => 'pack', 'multiplier' => 720, 'real_stock' => 2, 'estimated_stock' => 0],
                    ['unit' => 'grs', 'multiplier' => 144, 'real_stock' => 2, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 80,
                'base_estimated_stock' => 0,
            ],
            [
                'code' => 'KNC-BTK-COK',
                'name' => 'Kancing Batok Kelapa 2 Lubang 24L (Natural Coconut Shell)',
                'category' => 'Kancing & Fastener',
                'unit' => 'pcs',
                'min_stock' => 144,
                'description' => 'Kancing batok kelapa estetik bernuansa etnik alami untuk kemeja koko rami dan kemeja kasual.',
                'conversions' => [
                    ['unit' => 'pack', 'multiplier' => 576, 'real_stock' => 1, 'estimated_stock' => 0],
                    ['unit' => 'grs', 'multiplier' => 144, 'real_stock' => 1, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 65,
                'base_estimated_stock' => 0,
            ],
            [
                'code' => 'KNC-SNP-SLV',
                'name' => 'Kancing Snap Cetek Logam Stainless 15mm (Silver Chrome)',
                'category' => 'Kancing & Fastener',
                'unit' => 'psg',
                'min_stock' => 100,
                'description' => 'Kancing jepret logam anti karat kualitas ekspor untuk manset abaya, kemeja, dan jaket.',
                'conversions' => [
                    ['unit' => 'box', 'multiplier' => 500, 'real_stock' => 1, 'estimated_stock' => 0],
                    ['unit' => 'pack', 'multiplier' => 50, 'real_stock' => 3, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 25,
                'base_estimated_stock' => 0,
            ],

            // --- RITSLETING & ZIPPER ---
            [
                'code' => 'ZIP-YKK-INV',
                'name' => 'Ritsleting Invisible Zipper YKK 50cm / 20 inch (Hitam No. 580)',
                'category' => 'Ritsleting & Zipper',
                'unit' => 'pcs',
                'min_stock' => 24,
                'description' => 'Resleting jepang YKK original gigi halus presisi untuk bukaan punggung / dada gamis muslimah.',
                'conversions' => [
                    ['unit' => 'box', 'multiplier' => 120, 'real_stock' => 1, 'estimated_stock' => 0],
                    ['unit' => 'lsn', 'multiplier' => 12, 'real_stock' => 2, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 10,
                'base_estimated_stock' => 0,
            ],
            [
                'code' => 'ZIP-CLM-SLV',
                'name' => 'Ritsleting Celana Logam Brass No. 4 YKK 15cm (Antik Gold)',
                'category' => 'Ritsleting & Zipper',
                'unit' => 'pcs',
                'min_stock' => 24,
                'description' => 'Ritsleting logam kuningan antik kuat tahan lama untuk golbi celana panjang chino dan celana formal.',
                'conversions' => [
                    ['unit' => 'lsn', 'multiplier' => 12, 'real_stock' => 4, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 7,
                'base_estimated_stock' => 0,
            ],

            // --- KAIN KERAS & PELAPIS ---
            [
                'code' => 'KRS-VIS-STP',
                'name' => 'Kain Keras Interfacing Kerah Staplek M33 (Kaku Berperekat)',
                'category' => 'Kain Keras & Pelapis (Interfacing)',
                'unit' => 'm',
                'min_stock' => 20,
                'description' => 'Kain keras kerah lem panas tebal untuk kerah kemeja, kerah koko sanghai, dan manset agar tegak kokoh rapi.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 100, 'real_stock' => 1, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 28,
                'base_estimated_stock' => 15,
            ],
            [
                'code' => 'KRS-VSL-TIP',
                'name' => 'Kain Vislin Perekat Tipis 1025HF (Putih Bersih)',
                'category' => 'Kain Keras & Pelapis (Interfacing)',
                'unit' => 'm',
                'min_stock' => 25,
                'description' => 'Kain vislin lem halus untuk melapisi belahan dada, saku paspol, dan lapisan leher gamis.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 100, 'real_stock' => 1, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 42,
                'base_estimated_stock' => 0,
            ],

            // --- KARET ELASTIS ---
            [
                'code' => 'KRT-ELS-25M',
                'name' => 'Karet Kolor Elastis Elastic Band 2.5cm Grade A (Putih)',
                'category' => 'Karet Elastis & Webbing',
                'unit' => 'm',
                'min_stock' => 30,
                'description' => 'Karet elastis rajut rapat daya regang stabil tidak cepat kendor untuk pinggang celana panjang sirwal.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 30, 'real_stock' => 3, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 12,
                'base_estimated_stock' => 8,
            ],

            // --- LABEL & AKSESORIS ---
            [
                'code' => 'LBL-WVN-AZH',
                'name' => 'Label Woven Damask Bordir Merk "Azhar Collection" (Gold/Black)',
                'category' => 'Renda, Pita & Label Brand',
                'unit' => 'pcs',
                'min_stock' => 500,
                'description' => 'Label leher woven damask halus tidak membuat gatal di leher. Desain eksklusif merk Azhar Collection.',
                'conversions' => [
                    ['unit' => 'box', 'multiplier' => 1000, 'real_stock' => 2, 'estimated_stock' => 0],
                    ['unit' => 'pack', 'multiplier' => 100, 'real_stock' => 4, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 85,
                'base_estimated_stock' => 0,
            ],
            [
                'code' => 'RND-GIP-PUT',
                'name' => 'Renda Bordir Gipper / Guipure Lace 3.5cm (Broken White)',
                'category' => 'Renda, Pita & Label Brand',
                'unit' => 'm',
                'min_stock' => 15,
                'description' => 'Renda gipper bordir benang timbul mewah untuk aksen ujung lengan dan bawah gamis abaya.',
                'conversions' => [
                    ['unit' => 'glg', 'multiplier' => 15, 'real_stock' => 4, 'estimated_stock' => 0],
                ],
                'base_real_stock' => 7,
                'base_estimated_stock' => 4,
            ],
        ];

        // Process item insertion & exact math calculations
        foreach ($itemsData as $data) {
            $catId = $categories[$data['category']]->id;
            $unitId = $units[$data['unit']]->id;

            $baseReal = (float)($data['base_real_stock'] ?? 0);
            $baseEst = (float)($data['base_estimated_stock'] ?? 0);

            $item = Item::updateOrCreate(
                ['code' => $data['code']],
                [
                    'name' => $data['name'],
                    'category_id' => $catId,
                    'unit_id' => $unitId,
                    'real_stock' => $baseReal,
                    'estimated_stock' => $baseEst,
                    'stock' => $baseReal + $baseEst,
                    'is_estimated_stock' => ($baseEst > 0 && $baseReal == 0),
                    'min_stock' => $data['min_stock'],
                    'description' => $data['description'],
                    'is_active' => true,
                ]
            );

            // Sync discrete conversions
            $convIds = [];
            if (!empty($data['conversions'])) {
                foreach ($data['conversions'] as $convData) {
                    $convUnitId = $units[$convData['unit']]->id;
                    $cReal = (float)($convData['real_stock'] ?? 0);
                    $cEst = (float)($convData['estimated_stock'] ?? 0);
                    $cTotal = $cReal + $cEst;

                    $conv = ItemConversion::updateOrCreate(
                        [
                            'item_id' => $item->id,
                            'unit_id' => $convUnitId,
                        ],
                        [
                            'multiplier' => $convData['multiplier'],
                            'real_stock' => $cReal,
                            'estimated_stock' => $cEst,
                            'stock' => $cTotal,
                        ]
                    );
                    $convIds[] = $conv->id;
                }
            }

            ItemConversion::where('item_id', $item->id)
                ->whereNotIn('id', $convIds)
                ->delete();

            $item->recalculateTotalStock();
            $item->save();

            $totalStock = $item->stock;

            // Create initial stock mutation if none exists
            if (!StockMutation::where('item_id', $item->id)->exists() && $totalStock > 0) {
                StockMutation::create([
                    'item_id' => $item->id,
                    'user_id' => $adminId,
                    'type' => 'in',
                    'quantity' => $totalStock,
                    'unit_id' => $item->unit_id,
                    'multiplier' => 1,
                    'total_base_quantity' => $totalStock,
                    'previous_stock' => 0,
                    'current_stock' => $totalStock,
                    'notes' => 'Penerimaan stok awal gudang bahan baku',
                    'reference_no' => 'RCV-INIT-' . $item->code,
                    'mutation_date' => now()->subDays(rand(4, 10)),
                ]);
            }
        }

        // 4. Create Realistic Production Outflow Mutations
        $kainToyobo = Item::where('code', 'KAIN-TOY-NVY')->first();
        if ($kainToyobo && StockMutation::where('item_id', $kainToyobo->id)->where('type', 'out')->count() === 0) {
            StockMutation::create([
                'item_id' => $kainToyobo->id,
                'user_id' => $adminId,
                'type' => 'out',
                'quantity' => 15,
                'unit_id' => $kainToyobo->unit_id,
                'multiplier' => 1,
                'total_base_quantity' => 15,
                'previous_stock' => $kainToyobo->stock + 15,
                'current_stock' => $kainToyobo->stock,
                'notes' => 'Pemotongan kain sampel Koko Navy Lengan Panjang batch #12',
                'reference_no' => 'SPK-CUT-2026-001',
                'mutation_date' => now()->subDays(2),
            ]);
        }

        $benangAstra = Item::where('code', 'BNG-AST-BLK')->first();
        if ($benangAstra && StockMutation::where('item_id', $benangAstra->id)->where('type', 'out')->count() === 0) {
            StockMutation::create([
                'item_id' => $benangAstra->id,
                'user_id' => $adminId,
                'type' => 'out',
                'quantity' => 2,
                'unit_id' => $benangAstra->unit_id,
                'multiplier' => 1,
                'total_base_quantity' => 2,
                'previous_stock' => $benangAstra->stock + 2,
                'current_stock' => $benangAstra->stock,
                'notes' => 'Distribusi 2 cones benang untuk lini jahit workshop 1',
                'reference_no' => 'OUT-LN-0041',
                'mutation_date' => now()->subDays(1),
            ]);
        }

        $kancingKemeja = Item::where('code', 'KNC-KMJ-WHT')->first();
        if ($kancingKemeja && StockMutation::where('item_id', $kancingKemeja->id)->where('type', 'out')->count() === 0) {
            StockMutation::create([
                'item_id' => $kancingKemeja->id,
                'user_id' => $adminId,
                'type' => 'out',
                'quantity' => 120,
                'unit_id' => $kancingKemeja->unit_id,
                'multiplier' => 1,
                'total_base_quantity' => 120,
                'previous_stock' => $kancingKemeja->stock + 120,
                'current_stock' => $kancingKemeja->stock,
                'notes' => 'Pemasangan kancing pada 15 lusin kemeja koko putih',
                'reference_no' => 'SPK-BTN-2026-088',
                'mutation_date' => now()->subHours(8),
            ]);
        }
    }
}
