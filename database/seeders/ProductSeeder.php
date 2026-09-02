<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Product;
use App\Models\ProductionStep;
use App\Models\Size;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('products')->delete();

        $kainOxfPutih = Item::where('code', 'KAIN-OXF-WHT')->first();
        $kainFamMerah = Item::where('code', 'KAIN-FAM-RED')->first();
        $kainFamBiru = Item::where('code', 'KAIN-FAM-BLU')->first();
        $kainFamAbu = Item::where('code', 'KAIN-FAM-GRY')->first();
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

        $potong = ProductionStep::where('name', 'Potong Kain (Cutting)')->first();
        $obras = ProductionStep::where('name', 'Jahit Obras')->first();
        $jahit = ProductionStep::where('name', 'Jahit Lurus (Assembling)')->first();
        $kerah = ProductionStep::where('name', 'Pasang Kerah & Manset')->first();
        $lubang = ProductionStep::where('name', 'Lubang Kancing')->first();
        $pasangKancing = ProductionStep::where('name', 'Pasang Kancing')->first();
        $gosok = ProductionStep::where('name', 'Gosok / Setrika (Ironing)')->first();
        $packing = ProductionStep::where('name', 'Lipat & Packing')->first();
        $resleting = ProductionStep::where('name', 'Pasang Resleting / Zipper')->first();

        $sdS = Size::where('category', 'SD')->where('size_name', 'S')->first();
        $sdM = Size::where('category', 'SD')->where('size_name', 'M')->first();
        $sdL = Size::where('category', 'SD')->where('size_name', 'L')->first();
        $sdXL = Size::where('category', 'SD')->where('size_name', 'XL')->first();

        $smpS = Size::where('category', 'SMP')->where('size_name', 'S')->first();
        $smpM = Size::where('category', 'SMP')->where('size_name', 'M')->first();
        $smpL = Size::where('category', 'SMP')->where('size_name', 'L')->first();
        $smpXL = Size::where('category', 'SMP')->where('size_name', 'XL')->first();

        $smaS = Size::where('category', 'SMA')->where('size_name', 'S')->first();
        $smaM = Size::where('category', 'SMA')->where('size_name', 'M')->first();
        $smaL = Size::where('category', 'SMA')->where('size_name', 'L')->first();
        $smaXL = Size::where('category', 'SMA')->where('size_name', 'XL')->first();

        $cln28 = Size::where('category', 'Celana')->where('size_name', '28')->first();
        $cln30 = Size::where('category', 'Celana')->where('size_name', '30')->first();
        $cln32 = Size::where('category', 'Celana')->where('size_name', '32')->first();
        $cln34 = Size::where('category', 'Celana')->where('size_name', '34')->first();

        $sdMerahPutih = Product::create([
            'code' => 'PRD-SD-MP-01',
            'name' => 'Setelan Seragam SD Merah Putih',
            'category' => 'Seragam Sekolah',
            'default_unit' => 'Stel',
            'base_price' => 110000,
            'description' => 'Setelan seragam SD lengkap (Kemeja Oxford Putih + Celana/Rok Famatex Merah).',
            'is_active' => true,
        ]);

        if ($sdS && $sdM && $sdL && $sdXL) {
            $sdMerahPutih->sizes()->createMany([
                ['size_id' => $sdS->id, 'price' => 100000, 'sort_order' => 1],
                ['size_id' => $sdM->id, 'price' => 110000, 'sort_order' => 2],
                ['size_id' => $sdL->id, 'price' => 115000, 'sort_order' => 3],
                ['size_id' => $sdXL->id, 'price' => 120000, 'sort_order' => 4],
            ]);
        }

        if ($benangPutih && $kancingPutih && $badgeSD && $kainKeras && $karet) {
            $sdMerahPutih->materials()->createMany([
                ['item_id' => $benangPutih->id, 'size_id' => null, 'required_qty' => 0.1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kancingPutih->id, 'size_id' => null, 'required_qty' => 6, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $badgeSD->id, 'size_id' => null, 'required_qty' => 1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kainKeras->id, 'size_id' => null, 'required_qty' => 0.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $karet->id, 'size_id' => null, 'required_qty' => 0.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($kainOxfPutih && $kainFamMerah && $sdS && $sdM && $sdL && $sdXL) {
            $sdMerahPutih->materials()->createMany([
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdS->id, 'required_qty' => 0.9, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdM->id, 'required_qty' => 1.0, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdL->id, 'required_qty' => 1.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdXL->id, 'required_qty' => 1.4, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],

                ['item_id' => $kainFamMerah->id, 'size_id' => $sdS->id, 'required_qty' => 0.7, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamMerah->id, 'size_id' => $sdM->id, 'required_qty' => 0.8, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamMerah->id, 'size_id' => $sdL->id, 'required_qty' => 1.0, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamMerah->id, 'size_id' => $sdXL->id, 'required_qty' => 1.1, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($potong && $obras && $jahit && $kerah && $pasangKancing && $gosok && $packing) {
            $sdMerahPutih->productionSteps()->createMany([
                ['production_step_id' => $potong->id, 'wage' => 1500, 'sort_order' => 1],
                ['production_step_id' => $obras->id, 'wage' => 2000, 'sort_order' => 2],
                ['production_step_id' => $jahit->id, 'wage' => 5000, 'sort_order' => 3],
                ['production_step_id' => $kerah->id, 'wage' => 3000, 'sort_order' => 4],
                ['production_step_id' => $pasangKancing->id, 'wage' => 700, 'sort_order' => 5],
                ['production_step_id' => $gosok->id, 'wage' => 1000, 'sort_order' => 6],
                ['production_step_id' => $packing->id, 'wage' => 500, 'sort_order' => 7],
            ]);
        }

        $smpBiruPutih = Product::create([
            'code' => 'PRD-SMP-OS-01',
            'name' => 'Setelan Seragam SMP Biru Putih',
            'category' => 'Seragam Sekolah',
            'default_unit' => 'Stel',
            'base_price' => 130000,
            'description' => 'Setelan seragam SMP lengkap (Kemeja Oxford Putih + Celana/Rok Famatex Biru Dongker).',
            'is_active' => true,
        ]);

        if ($smpS && $smpM && $smpL && $smpXL) {
            $smpBiruPutih->sizes()->createMany([
                ['size_id' => $smpS->id, 'price' => 120000, 'sort_order' => 1],
                ['size_id' => $smpM->id, 'price' => 130000, 'sort_order' => 2],
                ['size_id' => $smpL->id, 'price' => 135000, 'sort_order' => 3],
                ['size_id' => $smpXL->id, 'price' => 140000, 'sort_order' => 4],
            ]);
        }

        if ($benangPutih && $kancingPutih && $badgeSMP && $zipper && $kainKeras) {
            $smpBiruPutih->materials()->createMany([
                ['item_id' => $benangPutih->id, 'size_id' => null, 'required_qty' => 0.1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kancingPutih->id, 'size_id' => null, 'required_qty' => 6, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $badgeSMP->id, 'size_id' => null, 'required_qty' => 1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $zipper->id, 'size_id' => null, 'required_qty' => 1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kainKeras->id, 'size_id' => null, 'required_qty' => 0.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($kainOxfPutih && $kainFamBiru && $smpS && $smpM && $smpL && $smpXL) {
            $smpBiruPutih->materials()->createMany([
                ['item_id' => $kainOxfPutih->id, 'size_id' => $smpS->id, 'required_qty' => 1.1, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $smpM->id, 'required_qty' => 1.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $smpL->id, 'required_qty' => 1.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $smpXL->id, 'required_qty' => 1.5, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],

                ['item_id' => $kainFamBiru->id, 'size_id' => $smpS->id, 'required_qty' => 1.0, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamBiru->id, 'size_id' => $smpM->id, 'required_qty' => 1.1, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamBiru->id, 'size_id' => $smpL->id, 'required_qty' => 1.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamBiru->id, 'size_id' => $smpXL->id, 'required_qty' => 1.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($potong && $obras && $jahit && $kerah && $resleting && $gosok && $packing) {
            $smpBiruPutih->productionSteps()->createMany([
                ['production_step_id' => $potong->id, 'wage' => 1500, 'sort_order' => 1],
                ['production_step_id' => $obras->id, 'wage' => 2000, 'sort_order' => 2],
                ['production_step_id' => $jahit->id, 'wage' => 5500, 'sort_order' => 3],
                ['production_step_id' => $kerah->id, 'wage' => 3000, 'sort_order' => 4],
                ['production_step_id' => $resleting->id, 'wage' => 2500, 'sort_order' => 5],
                ['production_step_id' => $gosok->id, 'wage' => 1000, 'sort_order' => 6],
                ['production_step_id' => $packing->id, 'wage' => 500, 'sort_order' => 7],
            ]);
        }

        $smaPramuka = Product::create([
            'code' => 'PRD-SMA-PRM-01',
            'name' => 'Setelan Seragam Pramuka Lengkap',
            'category' => 'Seragam Sekolah',
            'default_unit' => 'Stel',
            'base_price' => 140000,
            'description' => 'Setelan seragam Pramuka Famatex Coklat lengkap dengan atribut bordir.',
            'is_active' => true,
        ]);

        if ($smaS && $smaM && $smaL && $smaXL) {
            $smaPramuka->sizes()->createMany([
                ['size_id' => $smaS->id, 'price' => 130000, 'sort_order' => 1],
                ['size_id' => $smaM->id, 'price' => 140000, 'sort_order' => 2],
                ['size_id' => $smaL->id, 'price' => 145000, 'sort_order' => 3],
                ['size_id' => $smaXL->id, 'price' => 150000, 'sort_order' => 4],
            ]);
        }

        if ($benangPutih && $kancingPramuka && $badgePramuka && $zipper && $kainKeras) {
            $smaPramuka->materials()->createMany([
                ['item_id' => $benangPutih->id, 'size_id' => null, 'required_qty' => 0.12, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kancingPramuka->id, 'size_id' => null, 'required_qty' => 8, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $badgePramuka->id, 'size_id' => null, 'required_qty' => 1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $zipper->id, 'size_id' => null, 'required_qty' => 1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kainKeras->id, 'size_id' => null, 'required_qty' => 0.25, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($kainFamPramuka && $smaS && $smaM && $smaL && $smaXL) {
            $smaPramuka->materials()->createMany([
                ['item_id' => $kainFamPramuka->id, 'size_id' => $smaS->id, 'required_qty' => 2.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamPramuka->id, 'size_id' => $smaM->id, 'required_qty' => 2.4, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamPramuka->id, 'size_id' => $smaL->id, 'required_qty' => 2.6, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamPramuka->id, 'size_id' => $smaXL->id, 'required_qty' => 2.8, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($potong && $obras && $jahit && $kerah && $resleting && $gosok && $packing) {
            $smaPramuka->productionSteps()->createMany([
                ['production_step_id' => $potong->id, 'wage' => 1800, 'sort_order' => 1],
                ['production_step_id' => $obras->id, 'wage' => 2200, 'sort_order' => 2],
                ['production_step_id' => $jahit->id, 'wage' => 6000, 'sort_order' => 3],
                ['production_step_id' => $kerah->id, 'wage' => 3500, 'sort_order' => 4],
                ['production_step_id' => $resleting->id, 'wage' => 2500, 'sort_order' => 5],
                ['production_step_id' => $gosok->id, 'wage' => 1000, 'sort_order' => 6],
                ['production_step_id' => $packing->id, 'wage' => 500, 'sort_order' => 7],
            ]);
        }

        $kemejaPutih = Product::create([
            'code' => 'PRD-KMJ-PUTIH',
            'name' => 'Kemeja Putih Lengan Pendek',
            'category' => 'Atasan',
            'default_unit' => 'Pcs',
            'base_price' => 60000,
            'description' => 'Kemeja seragam putih lengan pendek bahan Katun Oxford.',
            'is_active' => true,
        ]);

        if ($sdS && $sdM && $sdL && $sdXL) {
            $kemejaPutih->sizes()->createMany([
                ['size_id' => $sdS->id, 'price' => 55000, 'sort_order' => 1],
                ['size_id' => $sdM->id, 'price' => 60000, 'sort_order' => 2],
                ['size_id' => $sdL->id, 'price' => 65000, 'sort_order' => 3],
                ['size_id' => $sdXL->id, 'price' => 70000, 'sort_order' => 4],
            ]);
        }

        if ($benangPutih && $kancingPutih && $kainKeras) {
            $kemejaPutih->materials()->createMany([
                ['item_id' => $benangPutih->id, 'size_id' => null, 'required_qty' => 0.08, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kancingPutih->id, 'size_id' => null, 'required_qty' => 6, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $kainKeras->id, 'size_id' => null, 'required_qty' => 0.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($kainOxfPutih && $sdS && $sdM && $sdL && $sdXL) {
            $kemejaPutih->materials()->createMany([
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdS->id, 'required_qty' => 0.9, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdM->id, 'required_qty' => 1.0, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdL->id, 'required_qty' => 1.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainOxfPutih->id, 'size_id' => $sdXL->id, 'required_qty' => 1.4, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($potong && $obras && $jahit && $kerah && $pasangKancing && $gosok && $packing) {
            $kemejaPutih->productionSteps()->createMany([
                ['production_step_id' => $potong->id, 'wage' => 1200, 'sort_order' => 1],
                ['production_step_id' => $obras->id, 'wage' => 1500, 'sort_order' => 2],
                ['production_step_id' => $jahit->id, 'wage' => 4000, 'sort_order' => 3],
                ['production_step_id' => $kerah->id, 'wage' => 2500, 'sort_order' => 4],
                ['production_step_id' => $pasangKancing->id, 'wage' => 600, 'sort_order' => 5],
                ['production_step_id' => $gosok->id, 'wage' => 800, 'sort_order' => 6],
                ['production_step_id' => $packing->id, 'wage' => 400, 'sort_order' => 7],
            ]);
        }

        $celanaSMP = Product::create([
            'code' => 'PRD-CLN-SMP',
            'name' => 'Celana Panjang Famatex Biru SMP',
            'category' => 'Bawahan',
            'default_unit' => 'Pcs',
            'base_price' => 70000,
            'description' => 'Celana panjang sekolah SMP bahan Famatex warna biru dongker.',
            'is_active' => true,
        ]);

        if ($cln28 && $cln30 && $cln32 && $cln34) {
            $celanaSMP->sizes()->createMany([
                ['size_id' => $cln28->id, 'price' => 65000, 'sort_order' => 1],
                ['size_id' => $cln30->id, 'price' => 70000, 'sort_order' => 2],
                ['size_id' => $cln32->id, 'price' => 75000, 'sort_order' => 3],
                ['size_id' => $cln34->id, 'price' => 80000, 'sort_order' => 4],
            ]);
        }

        if ($benangPutih && $zipper && $karet) {
            $celanaSMP->materials()->createMany([
                ['item_id' => $benangPutih->id, 'size_id' => null, 'required_qty' => 0.08, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $zipper->id, 'size_id' => null, 'required_qty' => 1, 'yield_qty' => 1, 'unit_name' => 'Pcs', 'conversion_rate' => 1],
                ['item_id' => $karet->id, 'size_id' => null, 'required_qty' => 0.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($kainFamBiru && $cln28 && $cln30 && $cln32 && $cln34) {
            $celanaSMP->materials()->createMany([
                ['item_id' => $kainFamBiru->id, 'size_id' => $cln28->id, 'required_qty' => 1.0, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamBiru->id, 'size_id' => $cln30->id, 'required_qty' => 1.1, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamBiru->id, 'size_id' => $cln32->id, 'required_qty' => 1.2, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
                ['item_id' => $kainFamBiru->id, 'size_id' => $cln34->id, 'required_qty' => 1.3, 'yield_qty' => 1, 'unit_name' => 'Meter', 'conversion_rate' => 1],
            ]);
        }

        if ($potong && $obras && $jahit && $resleting && $gosok && $packing) {
            $celanaSMP->productionSteps()->createMany([
                ['production_step_id' => $potong->id, 'wage' => 1000, 'sort_order' => 1],
                ['production_step_id' => $obras->id, 'wage' => 1500, 'sort_order' => 2],
                ['production_step_id' => $jahit->id, 'wage' => 4500, 'sort_order' => 3],
                ['production_step_id' => $resleting->id, 'wage' => 2000, 'sort_order' => 4],
                ['production_step_id' => $gosok->id, 'wage' => 800, 'sort_order' => 5],
                ['production_step_id' => $packing->id, 'wage' => 400, 'sort_order' => 6],
            ]);
        }
    }
}
