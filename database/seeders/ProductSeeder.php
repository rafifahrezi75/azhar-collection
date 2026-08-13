<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Item;
use App\Models\ProductionStep;
use App\Models\Size;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('products')->delete();

        // Get raw materials
        $kainOxfPutih = Item::where('code', 'KAIN-OXF-WHT')->first();
        $kainFamMerah = Item::where('code', 'KAIN-FAM-RED')->first();
        $kainFamBiru = Item::where('code', 'KAIN-FAM-BLU')->first();
        $kainFamAbu = Item::where('code', 'KAIN-FAM-GRY')->first();
        $kainOxfPramuka = Item::where('code', 'KAIN-OXF-PRM')->first();
        $kainFamPramuka = Item::where('code', 'KAIN-FAM-PRM')->first();

        $benangPutih = Item::where('code', 'BNG-WHT')->first();
        $kancingPutih = Item::where('code', 'KNC-WHT')->first();
        $kancingPramuka = Item::where('code', 'KNC-PRM')->first();
        $karet = Item::where('code', 'KRT-ELS-3CM')->first();
        $zipper = Item::where('code', 'ZIP-YKK-N1')->first();
        $kainKeras = Item::where('code', 'KAIN-KRS-KRH')->first();

        $badgeSD = Item::where('code', 'BADGE-SD')->first();
        $badgeSMP = Item::where('code', 'BADGE-SMP')->first();
        $badgeSMA = Item::where('code', 'BADGE-SMA')->first();
        $badgePramuka = Item::where('code', 'BADGE-PRM')->first();

        // Get production steps
        $potong = ProductionStep::where('name', 'Potong Kain (Cutting)')->first();
        $obras = ProductionStep::where('name', 'Jahit Obras')->first();
        $jahit = ProductionStep::where('name', 'Jahit Lurus (Assembling)')->first();
        $kerah = ProductionStep::where('name', 'Pasang Kerah & Manset')->first();
        $lubang = ProductionStep::where('name', 'Lubang Kancing')->first();
        $pasangKancing = ProductionStep::where('name', 'Pasang Kancing')->first();
        $gosok = ProductionStep::where('name', 'Gosok / Setrika (Ironing)')->first();
        $packing = ProductionStep::where('name', 'Lipat & Packing')->first();
        $resleting = ProductionStep::where('name', 'Pasang Resleting / Zipper')->first();

        // =============================================================
        // Product 1: Setelan Seragam SD Merah Putih
        // =============================================================
        $sdMerahPutih = Product::create([
            'code' => 'PRD-SD-MP-01',
            'name' => 'Setelan Seragam SD Merah Putih',
            'category' => 'Seragam Sekolah',
            'default_unit' => 'Stel',
            'base_price' => 110000,
            'description' => 'Setelan seragam SD lengkap (Kemeja Oxford Putih + Celana/Rok Famatex Merah).',
            'is_active' => true,
        ]);

        // Sizes for SD product
        $sdS = Size::where('category', 'SD')->where('size_name', 'S')->first();
        $sdM = Size::where('category', 'SD')->where('size_name', 'M')->first();
        $sdL = Size::where('category', 'SD')->where('size_name', 'L')->first();
        $sdXL = Size::where('category', 'SD')->where('size_name', 'XL')->first();

        if ($sdS && $sdM && $sdL && $sdXL) {
            $sdMerahPutih->sizes()->createMany([
                ['size_id' => $sdS->id, 'price' => 100000, 'sort_order' => 1],
                ['size_id' => $sdM->id, 'price' => 110000, 'sort_order' => 2],
                ['size_id' => $sdL->id, 'price' => 115000, 'sort_order' => 3],
                ['size_id' => $sdXL->id, 'price' => 120000, 'sort_order' => 4],
            ]);
        }

        // Global materials (aksesoris & pelengkap — sama untuk semua ukuran)
        if ($benangPutih && $kancingPutih && $badgeSD && $kainKeras && $karet) {
            $sdMerahPutih->materials()->createMany([
                ['item_id' => $benangPutih->id, 'size_id' => null, 'required_qty' => 0.1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kancingPutih->id, 'size_id' => null, 'required_qty' => 6, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $badgeSD->id, 'size_id' => null, 'required_qty' => 1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kainKeras->id, 'size_id' => null, 'required_qty' => 0.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $karet->id, 'size_id' => null, 'required_qty' => 0.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        // Per-size materials (kain — beda kebutuhan per ukuran)
        if ($kainOxfPutih && $kainFamMerah && $sdS && $sdM && $sdL && $sdXL) {
            $sdMerahPutih->materials()->createMany([
                // Kain Oxford Putih (atasan) per ukuran
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdS->id, 'required_qty' => 0.9, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdM->id, 'required_qty' => 1.0, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdL->id, 'required_qty' => 1.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdXL->id, 'required_qty' => 1.4, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                // Kain Famatex Merah (bawahan) per ukuran
                ['item_id' => $kainFamMerah->id, 'size_id' => $sdS->id, 'required_qty' => 0.7, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamMerah->id, 'size_id' => $sdM->id, 'required_qty' => 0.8, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamMerah->id, 'size_id' => $sdL->id, 'required_qty' => 1.0, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamMerah->id, 'size_id' => $sdXL->id, 'required_qty' => 1.1, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($potong && $obras && $jahit && $kerah && $lubang && $pasangKancing && $gosok && $packing) {
            $sdMerahPutih->productionSteps()->createMany([
                ['production_step_id' => $potong->id, 'sort_order' => 1, 'wage' => 2000],
                ['production_step_id' => $obras->id, 'sort_order' => 2, 'wage' => 2000],
                ['production_step_id' => $jahit->id, 'sort_order' => 3, 'wage' => 8000],
                ['production_step_id' => $kerah->id, 'sort_order' => 4, 'wage' => 3000],
                ['production_step_id' => $lubang->id, 'sort_order' => 5, 'wage' => 1000],
                ['production_step_id' => $pasangKancing->id, 'sort_order' => 6, 'wage' => 1000],
                ['production_step_id' => $gosok->id, 'sort_order' => 7, 'wage' => 1500],
                ['production_step_id' => $packing->id, 'sort_order' => 8, 'wage' => 1000],
            ]);
        }

        // =============================================================
        // Product 2: Setelan Seragam SMP OSIS
        // =============================================================
        $smpOsis = Product::create([
            'code' => 'PRD-SMP-OS-01',
            'name' => 'Setelan Seragam SMP OSIS',
            'category' => 'Seragam Sekolah',
            'default_unit' => 'Stel',
            'base_price' => 135000,
            'description' => 'Setelan seragam SMP (Kemeja Putih + Celana/Rok Biru Dongker).',
            'is_active' => true,
        ]);

        $smpS = Size::where('category', 'SMP')->where('size_name', 'S')->first();
        $smpM = Size::where('category', 'SMP')->where('size_name', 'M')->first();
        $smpL = Size::where('category', 'SMP')->where('size_name', 'L')->first();
        $smpXL = Size::where('category', 'SMP')->where('size_name', 'XL')->first();

        if ($smpS && $smpM && $smpL && $smpXL) {
            $smpOsis->sizes()->createMany([
                ['size_id' => $smpS->id, 'price' => 130000, 'sort_order' => 1],
                ['size_id' => $smpM->id, 'price' => 135000, 'sort_order' => 2],
                ['size_id' => $smpL->id, 'price' => 145000, 'sort_order' => 3],
                ['size_id' => $smpXL->id, 'price' => 150000, 'sort_order' => 4],
            ]);
        }

        // Global materials
        if ($badgeSMP && $zipper && $benangPutih && $kancingPutih) {
            $smpOsis->materials()->createMany([
                ['item_id' => $badgeSMP->id, 'size_id' => null, 'required_qty' => 1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $zipper->id, 'size_id' => null, 'required_qty' => 1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $benangPutih->id, 'size_id' => null, 'required_qty' => 0.15, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kancingPutih->id, 'size_id' => null, 'required_qty' => 7, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
            ]);
        }

        // Per-size materials
        if ($kainOxfPutih && $kainFamBiru && $smpS && $smpM && $smpL && $smpXL) {
            $smpOsis->materials()->createMany([
                // Kain Oxford Putih (atasan) per ukuran
                ['item_id' => $kainOxfPutih->id, 'size_id' => $smpS->id, 'required_qty' => 1.1, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $smpM->id, 'required_qty' => 1.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $smpL->id, 'required_qty' => 1.5, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $smpXL->id, 'required_qty' => 1.7, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                // Kain Famatex Biru (bawahan) per ukuran
                ['item_id' => $kainFamBiru->id, 'size_id' => $smpS->id, 'required_qty' => 0.9, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamBiru->id, 'size_id' => $smpM->id, 'required_qty' => 1.0, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamBiru->id, 'size_id' => $smpL->id, 'required_qty' => 1.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamBiru->id, 'size_id' => $smpXL->id, 'required_qty' => 1.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($potong && $jahit && $resleting && $obras && $gosok && $packing) {
            $smpOsis->productionSteps()->createMany([
                ['production_step_id' => $potong->id, 'sort_order' => 1, 'wage' => 2500],
                ['production_step_id' => $obras->id, 'sort_order' => 2, 'wage' => 2500],
                ['production_step_id' => $jahit->id, 'sort_order' => 3, 'wage' => 9000],
                ['production_step_id' => $resleting->id, 'sort_order' => 4, 'wage' => 2000],
                ['production_step_id' => $gosok->id, 'sort_order' => 5, 'wage' => 1500],
                ['production_step_id' => $packing->id, 'sort_order' => 6, 'wage' => 1000],
            ]);
        }

        // =============================================================
        // Product 3: Setelan Seragam Pramuka SMA
        // =============================================================
        $pramukaSma = Product::create([
            'code' => 'PRD-SMA-PRM-01',
            'name' => 'Setelan Seragam Pramuka SMA',
            'category' => 'Seragam Sekolah',
            'default_unit' => 'Stel',
            'base_price' => 165000,
            'description' => 'Setelan seragam Pramuka SMA Penegak (Kemeja Coklat Muda + Celana/Rok Coklat Tua).',
            'is_active' => true,
        ]);

        $smaM = Size::where('category', 'SMA')->where('size_name', 'M')->first();
        $smaL = Size::where('category', 'SMA')->where('size_name', 'L')->first();
        $smaXL = Size::where('category', 'SMA')->where('size_name', 'XL')->first();

        if ($smaM && $smaL && $smaXL) {
            $pramukaSma->sizes()->createMany([
                ['size_id' => $smaM->id, 'price' => 165000, 'sort_order' => 1],
                ['size_id' => $smaL->id, 'price' => 175000, 'sort_order' => 2],
                ['size_id' => $smaXL->id, 'price' => 180000, 'sort_order' => 3],
            ]);
        }

        // Global materials
        if ($badgePramuka && $kancingPramuka && $benangPutih && $karet) {
            $pramukaSma->materials()->createMany([
                ['item_id' => $badgePramuka->id, 'size_id' => null, 'required_qty' => 2, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kancingPramuka->id, 'size_id' => null, 'required_qty' => 8, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $benangPutih->id, 'size_id' => null, 'required_qty' => 0.15, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $karet->id, 'size_id' => null, 'required_qty' => 0.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        // Per-size materials
        if ($kainOxfPramuka && $kainFamPramuka && $smaM && $smaL && $smaXL) {
            $pramukaSma->materials()->createMany([
                // Kain Oxford Coklat Muda (atasan) per ukuran
                ['item_id' => $kainOxfPramuka->id, 'size_id' => $smaM->id, 'required_qty' => 1.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPramuka->id, 'size_id' => $smaL->id, 'required_qty' => 1.5, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPramuka->id, 'size_id' => $smaXL->id, 'required_qty' => 1.7, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                // Kain Famatex Coklat Tua (bawahan) per ukuran
                ['item_id' => $kainFamPramuka->id, 'size_id' => $smaM->id, 'required_qty' => 1.1, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamPramuka->id, 'size_id' => $smaL->id, 'required_qty' => 1.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamPramuka->id, 'size_id' => $smaXL->id, 'required_qty' => 1.5, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($potong && $jahit && $kerah && $pasangKancing && $obras && $gosok && $packing) {
            $pramukaSma->productionSteps()->createMany([
                ['production_step_id' => $potong->id, 'sort_order' => 1, 'wage' => 3000],
                ['production_step_id' => $obras->id, 'sort_order' => 2, 'wage' => 2500],
                ['production_step_id' => $jahit->id, 'sort_order' => 3, 'wage' => 12000],
                ['production_step_id' => $kerah->id, 'sort_order' => 4, 'wage' => 3500],
                ['production_step_id' => $pasangKancing->id, 'sort_order' => 5, 'wage' => 1500],
                ['production_step_id' => $gosok->id, 'sort_order' => 6, 'wage' => 1500],
                ['production_step_id' => $packing->id, 'sort_order' => 7, 'wage' => 1000],
            ]);
        }
    }
}
