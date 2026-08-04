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
            ['name' => 'Kain & Tekstil Utama', 'slug' => 'kain-tekstil-utama', 'description' => 'Bahan baku kain gulungan dan potongan untuk produksi pakaian.'],
            ['name' => 'Benang Jahit & Obras', 'slug' => 'benang-jahit-obras', 'description' => 'Aneka benang jahit spun polyester, obras, dan bordir berbagai warna.'],
            ['name' => 'Kancing & Snap Button', 'slug' => 'kancing-snap-button', 'description' => 'Aneka kancing kemeja, kancing jas, batok kelapa, dan kancing cetek logam.'],
            ['name' => 'Ritsleting & Zipper', 'slug' => 'ritsleting-zipper', 'description' => 'Zipper invisible, zipper logam, dan zipper coil untuk baju & celana.'],
            ['name' => 'Kain Keras & Pelapis (Interfacing)', 'slug' => 'kain-keras-pelapis', 'description' => 'Kain keras kerah, vislin, tricot, dan padding pelapis busana.'],
            ['name' => 'Karet Elastis & Webbing', 'slug' => 'karet-elastis-webbing', 'description' => 'Karet kolor elastis pinggang celana dan ban pinggang.'],
            ['name' => 'Label, Renda & Aksesoris', 'slug' => 'label-renda-aksesoris', 'description' => 'Label woven merk, pita renda bordir, hangtag, dan aksesoris garment.'],
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
            ['name' => 'Meter', 'symbol' => 'm', 'description' => 'Satuan panjang kain dan pita'],
            ['name' => 'Roll', 'symbol' => 'roll', 'description' => 'Satuan gulungan besar kain atau karet'],
            ['name' => 'Pieces / Cones', 'symbol' => 'pcs', 'description' => 'Satuan buah / cones satuan dasar'],
            ['name' => 'Lusin', 'symbol' => 'lsn', 'description' => 'Satuan isi 12 buah'],
            ['name' => 'Gross', 'symbol' => 'grs', 'description' => 'Satuan isi 144 buah (12 lusin)'],
            ['name' => 'Pack', 'symbol' => 'pack', 'description' => 'Satuan kemasan pak / bungkus'],
            ['name' => 'Box', 'symbol' => 'box', 'description' => 'Satuan kemasan kardus / kotak besar'],
            ['name' => 'Pasang', 'symbol' => 'psg', 'description' => 'Satuan pasang untuk kancing snap / kancing jepret'],
            ['name' => 'Gulung', 'symbol' => 'glg', 'description' => 'Satuan gulungan kecil / sedang'],
        ];

        $units = [];
        foreach ($unitsData as $u) {
            $units[$u['symbol']] = Unit::updateOrCreate(
                ['symbol' => $u['symbol']],
                ['name' => $u['name'], 'description' => $u['description'], 'is_active' => true]
            );
        }

        // 3. Raw Material Items
        $itemsData = [
            // Kain
            [
                'code' => 'KAIN-TOY-NVY',
                'name' => 'Kain Katun Toyobo Fodu Premium (Navy Blue)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'stock' => 235, // 4 Roll (@50m) + 35m
                'min_stock' => 30,
                'description' => 'Katun Toyobo import serat padat, adem, tidak menerawang. Warna Navy Blue pekat. Lebar 150cm.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 50],
                    ['unit' => 'glg', 'multiplier' => 10],
                ],
            ],
            [
                'code' => 'KAIN-RAY-SGE',
                'name' => 'Kain Katun Rayon Viscose Twill (Sage Green)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'stock' => 178, // 3 Roll (@50m) + 28m
                'min_stock' => 25,
                'description' => 'Bahan rayon viscose adem jatuh lembut untuk gamis dan kemeja santai. Warna Sage Green.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 50],
                    ['unit' => 'glg', 'multiplier' => 10],
                ],
            ],
            [
                'code' => 'KAIN-LNN-WHT',
                'name' => 'Kain Linen Pure Rami Organik (Broken White)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'stock' => 125, // 3 Roll (@40m) + 5m
                'min_stock' => 20,
                'description' => 'Linen rami natural bertekstur serat tegas mewah. Warna Broken White / Putih Tulang.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 40],
                ],
            ],
            [
                'code' => 'KAIN-STN-MRN',
                'name' => 'Kain Satin Maxmara Velvet Silk (Maroon)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'stock' => 85, // 1 Roll (@50m) + 35m
                'min_stock' => 15,
                'description' => 'Satin maxmara glossy doff elegan, licin lembut untuk kombinasi busana muslim pesta.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 50],
                ],
            ],
            [
                'code' => 'KAIN-DNM-BLU',
                'name' => 'Kain Denim Cotton Chambray 6.5 oz (Indigo Blue)',
                'category' => 'Kain & Tekstil Utama',
                'unit' => 'm',
                'stock' => 180, // 3 Roll (@60m)
                'min_stock' => 30,
                'description' => 'Bahan chambray katun ringan untuk kemeja casual koko denim. Warna Indigo Blue.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 60],
                ],
            ],

            // Benang Jahit
            [
                'code' => 'BNG-AST-BLK',
                'name' => 'Benang Jahit Spun Polyester 40/2 Astra (Hitam No. 000)',
                'category' => 'Benang Jahit & Obras',
                'unit' => 'pcs',
                'stock' => 268, // 2 Box (@120) + 2 Lusin (@12) + 4 Pcs
                'min_stock' => 24,
                'description' => 'Benang jahit kualitas tinggi merk Astra 5000 yards. Kuat dan tidak mudah putus pada mesin industri.',
                'conversions' => [
                    ['unit' => 'box', 'multiplier' => 120],
                    ['unit' => 'lsn', 'multiplier' => 12],
                ],
            ],
            [
                'code' => 'BNG-AST-WHT',
                'name' => 'Benang Jahit Spun Polyester 40/2 Astra (Putih No. 100)',
                'category' => 'Benang Jahit & Obras',
                'unit' => 'pcs',
                'stock' => 310, // 2 Box (@120) + 5 Lusin (@12) + 10 Pcs
                'min_stock' => 24,
                'description' => 'Benang jahit Astra 5000 yards putih bersih untuk jahit baju koko dan kemeja.',
                'conversions' => [
                    ['unit' => 'box', 'multiplier' => 120],
                    ['unit' => 'lsn', 'multiplier' => 12],
                ],
            ],
            [
                'code' => 'BNG-OBR-NAT',
                'name' => 'Benang Obras Polyester 20/2 (Putih Natural)',
                'category' => 'Benang Jahit & Obras',
                'unit' => 'pcs',
                'stock' => 38, // 3 Lusin (@12) + 2 Pcs
                'min_stock' => 8,
                'description' => 'Benang obras lentur padat untuk mesin obras 4 benang / 5 benang.',
                'conversions' => [
                    ['unit' => 'lsn', 'multiplier' => 12],
                ],
            ],
            [
                'code' => 'BNG-BRD-GLD',
                'name' => 'Benang Bordir Rayon Filament Shiny (Gold Emas No. 902)',
                'category' => 'Benang Jahit & Obras',
                'unit' => 'pcs',
                'stock' => 42, // 3 Lusin (@12) + 6 Pcs
                'min_stock' => 10,
                'description' => 'Benang bordir kilap premium untuk bordir kerah, dada, dan manset busana muslim.',
                'conversions' => [
                    ['unit' => 'lsn', 'multiplier' => 12],
                ],
            ],

            // Kancing
            [
                'code' => 'KNC-KMJ-WHT',
                'name' => 'Kancing Kemeja 4 Lubang Polyester 18L (Putih Mutiara)',
                'category' => 'Kancing & Snap Button',
                'unit' => 'pcs',
                'stock' => 1850, // 2 Pack (@720) + 2 Gross (@144) + 122 Pcs
                'min_stock' => 288,
                'description' => 'Kancing kemeja 11mm / 18L finishing pearl gloss elegan tahan cuci dan setrika panas.',
                'conversions' => [
                    ['unit' => 'pack', 'multiplier' => 720],
                    ['unit' => 'grs', 'multiplier' => 144],
                ],
            ],
            [
                'code' => 'KNC-BTK-COK',
                'name' => 'Kancing Batok Kelapa Asli 2 Lubang 24L (Cokelat Natural)',
                'category' => 'Kancing & Snap Button',
                'unit' => 'pcs',
                'stock' => 820, // 1 Pack (@576) + 1 Gross (@144) + 100 Pcs
                'min_stock' => 144,
                'description' => 'Kancing batok kelapa estetik klasik ramah lingkungan untuk kemeja koko etnik.',
                'conversions' => [
                    ['unit' => 'pack', 'multiplier' => 576],
                    ['unit' => 'grs', 'multiplier' => 144],
                ],
            ],
            [
                'code' => 'KNC-SNP-SLV',
                'name' => 'Kancing Cetek Snap Button Logam 15mm (Silver Chrome)',
                'category' => 'Kancing & Snap Button',
                'unit' => 'psg',
                'stock' => 675, // 1 Box (@500) + 3 Pack (@50) + 25 Pasang
                'min_stock' => 100,
                'description' => 'Kancing snap jepret logam anti karat untuk jaket, gamis, dan manset tangan.',
                'conversions' => [
                    ['unit' => 'box', 'multiplier' => 500],
                    ['unit' => 'pack', 'multiplier' => 50],
                ],
            ],

            // Perlengkapan & Aksesoris Lainnya
            [
                'code' => 'ZIP-YKK-INV',
                'name' => 'Ritsleting Invisible Zipper YKK 50cm / 20 inch (Hitam)',
                'category' => 'Ritsleting & Zipper',
                'unit' => 'pcs',
                'stock' => 155, // 1 Box (@120) + 2 Lusin (@12) + 11 Pcs
                'min_stock' => 24,
                'description' => 'Resleting jepang merk YKK original gigi halus tahan lama untuk punggung gamis.',
                'conversions' => [
                    ['unit' => 'box', 'multiplier' => 120],
                    ['unit' => 'lsn', 'multiplier' => 12],
                ],
            ],
            [
                'code' => 'KRT-ELS-25M',
                'name' => 'Karet Kolor Elastis Elastic Band 2.5cm (Putih)',
                'category' => 'Karet Elastis & Webbing',
                'unit' => 'm',
                'stock' => 110, // 3 Roll (@30m) + 20m
                'min_stock' => 30,
                'description' => 'Karet pinggang elastis rajut rapat daya regang tinggi untuk celana sarung / sirwal.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 30],
                ],
            ],
            [
                'code' => 'KRS-VIS-STP',
                'name' => 'Kain Keras Interfacing Staplek Kerah M33 (Tebal Kaku)',
                'category' => 'Kain Keras & Pelapis (Interfacing)',
                'unit' => 'm',
                'stock' => 145, // 1 Roll (@100m) + 45m
                'min_stock' => 20,
                'description' => 'Kain keras lem berperekat panas untuk kerah kemeja koko dan manset agar tegak rapi.',
                'conversions' => [
                    ['unit' => 'roll', 'multiplier' => 100],
                ],
            ],
            [
                'code' => 'LBL-WVN-AZH',
                'name' => 'Label Woven Damask Bordir Merk Azhar Collection',
                'category' => 'Label, Renda & Aksesoris',
                'unit' => 'pcs',
                'stock' => 2450, // 2 Box (@1000) + 4 Pack (@100) + 50 Pcs
                'min_stock' => 300,
                'description' => 'Label merk woven damask halus tidak gatal di leher. Desain hitam emas.',
                'conversions' => [
                    ['unit' => 'box', 'multiplier' => 1000],
                    ['unit' => 'pack', 'multiplier' => 100],
                ],
            ],
        ];

        foreach ($itemsData as $data) {
            $catId = $categories[$data['category']]->id;
            $unitId = $units[$data['unit']]->id;

            $item = Item::updateOrCreate(
                ['code' => $data['code']],
                [
                    'name' => $data['name'],
                    'category_id' => $catId,
                    'unit_id' => $unitId,
                    'stock' => $data['stock'],
                    'min_stock' => $data['min_stock'],
                    'description' => $data['description'],
                    'is_active' => true,
                ]
            );

            // Sync conversions
            $convIds = [];
            foreach ($data['conversions'] as $convData) {
                $convUnitId = $units[$convData['unit']]->id;
                $conv = ItemConversion::updateOrCreate(
                    [
                        'item_id' => $item->id,
                        'unit_id' => $convUnitId,
                    ],
                    [
                        'multiplier' => $convData['multiplier'],
                    ]
                );
                $convIds[] = $conv->id;
            }

            ItemConversion::where('item_id', $item->id)
                ->whereNotIn('id', $convIds)
                ->delete();

            // Create initial mutation if none exists
            if (! StockMutation::where('item_id', $item->id)->exists() && $item->stock > 0) {
                StockMutation::create([
                    'item_id' => $item->id,
                    'user_id' => $adminId,
                    'type' => 'in',
                    'quantity' => $item->stock,
                    'unit_id' => $item->unit_id,
                    'multiplier' => 1,
                    'total_base_quantity' => $item->stock,
                    'previous_stock' => 0,
                    'current_stock' => $item->stock,
                    'notes' => 'Stok awal bahan baku masuk gudang',
                    'reference_no' => 'INIT-' . $item->code,
                    'mutation_date' => now()->subDays(rand(2, 6)),
                ]);
            }
        }

        // Add some realistic recent mutations for visual dashboard
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
                'notes' => 'Pengambilan kain untuk potongan sample gamis batch #1',
                'reference_no' => 'OUT-991201',
                'mutation_date' => now()->subDays(1),
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
                'notes' => 'Pengambilan 2 pcs benang untuk lini jahit workshop A',
                'reference_no' => 'OUT-991202',
                'mutation_date' => now()->subHours(5),
            ]);
        }
    }
}
