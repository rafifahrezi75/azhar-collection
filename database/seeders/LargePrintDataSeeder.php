<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Item;
use App\Models\Product;
use App\Models\ProductionAssignment;
use App\Models\ProductionAssignmentStep;
use App\Models\ProductionStep;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LargePrintDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        $adminId = $admin ? $admin->id : 1;

        $targetTailor = User::where('email', 'ahmad@azhar.test')->first()
            ?? User::where('id', '>', 1)->first()
            ?? $admin;

        $unitMeter = Unit::where('name', 'Meter')->first() ?? Unit::first();
        $unitRoll = Unit::where('name', 'Roll')->first() ?? $unitMeter;
        $unitPcs = Unit::where('name', 'Pcs')->first() ?? $unitMeter;
        $unitGross = Unit::where('name', 'Gross')->first() ?? $unitMeter;
        $unitLusin = Unit::where('name', 'Lusin')->first() ?? $unitMeter;

        $catKain = Category::where('name', 'like', '%Kain%')->first() ?? Category::first();
        $catBenang = Category::where('name', 'like', '%Benang%')->first() ?? Category::first();
        $catAksesoris = Category::where('name', 'like', '%Aksesoris%')->first() ?? Category::first();
        $catKancing = Category::where('name', 'like', '%Kancing%')->first() ?? Category::first();
        $catKaret = Category::where('name', 'like', '%Karet%')->first() ?? Category::first();

        $extraMaterials = [
            ['code' => 'KAIN-KTN-CMB30', 'name' => 'Kain Katun Combed 30s Reaktif', 'category_id' => $catKain->id, 'unit_id' => $unitRoll->id, 'price' => 115000, 'stock' => 150],
            ['code' => 'KAIN-DRL-NGT', 'name' => 'Kain Drill Nagata Japan Grade A', 'category_id' => $catKain->id, 'unit_id' => $unitRoll->id, 'price' => 42000, 'stock' => 200],
            ['code' => 'KAIN-TC-PUTIH', 'name' => 'Kain Tetoron Cotton (TC) Putih', 'category_id' => $catKain->id, 'unit_id' => $unitMeter->id, 'price' => 18000, 'stock' => 300],
            ['code' => 'KAIN-BATIK-SD', 'name' => 'Kain Motif Batik SD Tut Wuri', 'category_id' => $catKain->id, 'unit_id' => $unitMeter->id, 'price' => 28000, 'stock' => 250],
            ['code' => 'KAIN-BATIK-SMP', 'name' => 'Kain Motif Batik Nasional SMP', 'category_id' => $catKain->id, 'unit_id' => $unitMeter->id, 'price' => 32000, 'stock' => 250],
            ['code' => 'KAIN-LAKOS-CVC', 'name' => 'Kain Pique Lacoste CVC Katun', 'category_id' => $catKain->id, 'unit_id' => $unitMeter->id, 'price' => 65000, 'stock' => 120],
            ['code' => 'KAIN-DIADORA-NVY', 'name' => 'Kain Diadora Training Navy', 'category_id' => $catKain->id, 'unit_id' => $unitMeter->id, 'price' => 35000, 'stock' => 180],
            ['code' => 'BNG-BLK-ASTRA', 'name' => 'Benang Jahit Hitam Astra 5000Y', 'category_id' => $catBenang->id, 'unit_id' => $unitRoll->id, 'price' => 2200, 'stock' => 500],
            ['code' => 'BNG-OBRAS-WHT', 'name' => 'Benang Obras Polyester Putih', 'category_id' => $catBenang->id, 'unit_id' => $unitRoll->id, 'price' => 25000, 'stock' => 80],
            ['code' => 'KNC-JAS-BLK', 'name' => 'Kancing Jas Hitam Doff 4 Lubang', 'category_id' => $catKancing->id, 'unit_id' => $unitGross->id, 'price' => 45000, 'stock' => 50],
            ['code' => 'KNC-JAMUR-GLD', 'name' => 'Kancing Jamur Emas Seragam PDU', 'category_id' => $catKancing->id, 'unit_id' => $unitGross->id, 'price' => 65000, 'stock' => 40],
            ['code' => 'ZIP-JKT-YKK', 'name' => 'Ritsleting Jaket Besi YKK 65cm', 'category_id' => $catKancing->id, 'unit_id' => $unitLusin->id, 'price' => 72000, 'stock' => 100],
            ['code' => 'KRT-ELS-5CM', 'name' => 'Karet Kolor Elastis Lebar 5cm', 'category_id' => $catKaret->id, 'unit_id' => $unitMeter->id, 'price' => 4500, 'stock' => 400],
            ['code' => 'FURING-ASAHI-BLK', 'name' => 'Kain Furing Asahi Hitam', 'category_id' => $catKaret->id, 'unit_id' => $unitMeter->id, 'price' => 9500, 'stock' => 350],
            ['code' => 'KAIN-KRS-M33', 'name' => 'Kain Keras Interlining Kerah M33', 'category_id' => $catKaret->id, 'unit_id' => $unitMeter->id, 'price' => 14000, 'stock' => 300],
            ['code' => 'PLST-PACK-AZHAR', 'name' => 'Plastik Packing Sablon Azhar', 'category_id' => $catAksesoris->id, 'unit_id' => $unitPcs->id, 'price' => 450, 'stock' => 5000],
            ['code' => 'BADGE-BORDIR-LOK', 'name' => 'Badge Lokasi Sekolah Bordir', 'category_id' => $catAksesoris->id, 'unit_id' => $unitPcs->id, 'price' => 1500, 'stock' => 2000],
        ];

        foreach ($extraMaterials as $mat) {
            Item::updateOrCreate(
                ['code' => $mat['code']],
                [
                    'name' => $mat['name'],
                    'category_id' => $mat['category_id'],
                    'unit_id' => $mat['unit_id'],
                    'price' => $mat['price'],
                    'stock' => $mat['stock'],
                    'real_stock' => $mat['stock'],
                    'estimated_stock' => $mat['stock'],
                    'min_stock' => 10,
                    'is_active' => true,
                ]
            );
        }

        $todayDate = Carbon::now()->format('Y-m-d');
        $dateCode = Carbon::now()->format('Ymd');
        $purchaseRef = 'PUR-'.$dateCode.'-9999';

        $existingPurchase = Purchase::where('reference_no', $purchaseRef)->first();
        if ($existingPurchase) {
            $existingPurchase->items()->delete();
            $existingPurchase->delete();
        }

        $allRawItems = Item::orderBy('id')->take(25)->get();

        $purchase = Purchase::create([
            'reference_no' => $purchaseRef,
            'supplier_name' => 'PT Sentosa Tekstil & Aksesoris Nusantara',
            'date' => $todayDate,
            'total_amount' => 0,
            'notes' => 'Pengadaan partai besar bahan baku kain, benang, dan perlengkapan jahit (Uji Cetak Nota Pembelian 25 Item - 3 Halaman).',
            'created_by' => $adminId,
        ]);

        $purchaseGrandTotal = 0;
        foreach ($allRawItems as $idx => $rawItem) {
            $qty = 20 + (($idx + 1) * 5);
            $unitPrice = $rawItem->price > 0 ? (float) $rawItem->price : 25000;
            $subtotal = $qty * $unitPrice;
            $purchaseGrandTotal += $subtotal;

            PurchaseItem::create([
                'purchase_id' => $purchase->id,
                'item_id' => $rawItem->id,
                'unit_id' => $rawItem->unit_id,
                'quantity' => $qty,
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
            ]);
        }

        $purchase->update(['total_amount' => $purchaseGrandTotal]);

        $customer = Customer::where('code', 'CUST-001')->first() ?? Customer::first();
        $customerId = $customer ? $customer->id : null;
        $customerName = $customer ? $customer->name : 'SD Negeri 1 Sumber';

        $products = Product::with(['productionSteps.productionStep'])->get();
        $prodSD = $products->firstWhere('code', 'PRD-SD-MP-01') ?? $products->first();
        $prodSMP = $products->firstWhere('code', 'PRD-SMP-OS-01') ?? $products->skip(1)->first() ?? $prodSD;
        $prodSMA = $products->firstWhere('code', 'PRD-SMA-PRM-01') ?? $products->skip(2)->first() ?? $prodSD;
        $prodKemeja = $products->firstWhere('code', 'PRD-KMJ-PUTIH') ?? $prodSD;
        $prodCelana = $products->firstWhere('code', 'PRD-CLN-SMP') ?? $prodSMP;

        $invoiceNum = 'INV-'.$dateCode.'-9999';

        $existingInv = Invoice::where('invoice_number', $invoiceNum)->first();
        if ($existingInv) {
            foreach ($existingInv->items as $it) {
                ProductionAssignment::where('invoice_item_id', $it->id)->delete();
            }
            $existingInv->items()->delete();
            $existingInv->delete();
        }

        $invoice = Invoice::create([
            'invoice_number' => $invoiceNum,
            'customer_id' => $customerId,
            'customer_name' => $customerName,
            'order_date' => $todayDate,
            'completion_date' => Carbon::now()->addDays(14)->format('Y-m-d'),
            'type' => 'REGULAR',
            'subtotal' => 0,
            'discount' => 250000,
            'total_amount' => 0,
            'paid_amount' => 15000000,
            'payment_status' => 'DP',
            'production_status' => 'PROSES',
            'cut_stock' => false,
            'notes' => "Pesanan seragam massal semester baru (Uji Cetak Nota Invoice & SPK Produksi 25 Item - Multi Halaman).\nMohon pastikan jahitan rapi sesuai standar mutu Azhar Collection.",
            'created_by' => $adminId,
        ]);

        $invoiceItemsConfig = [
            ['name' => 'Setelan Seragam SD Merah Putih', 'unit' => 'Stel', 'qty' => 50, 'price' => 110000, 'prod' => $prodSD, 'sizes' => ['S' => ['qty' => 10, 'price' => 105000], 'M' => ['qty' => 20, 'price' => 110000], 'L' => ['qty' => 15, 'price' => 110000], 'XL' => ['qty' => 5, 'price' => 115000]]],
            ['name' => 'Kemeja Putih Lengan Pendek Oxford SD', 'unit' => 'Pcs', 'qty' => 45, 'price' => 60000, 'prod' => $prodKemeja, 'sizes' => ['S' => 10, 'M' => 20, 'L' => 10, 'XL' => 5]],
            ['name' => 'Celana Panjang Merah Famatex SD', 'unit' => 'Pcs', 'qty' => 35, 'price' => 65000, 'prod' => $prodCelana, 'sizes' => ['S' => 10, 'M' => 15, 'L' => 10]],
            ['name' => 'Rok Panjang Rempel Merah Famatex SD', 'unit' => 'Pcs', 'qty' => 30, 'price' => 65000, 'prod' => $prodSD, 'sizes' => ['S' => 10, 'M' => 10, 'L' => 10]],
            ['name' => 'Kemeja Batik Motif Tut Wuri Handayani SD', 'unit' => 'Pcs', 'qty' => 50, 'price' => 75000, 'prod' => $prodKemeja, 'sizes' => ['S' => 10, 'M' => 20, 'L' => 15, 'XL' => 5]],
            ['name' => 'Setelan Seragam Pramuka Siaga Putra', 'unit' => 'Stel', 'qty' => 30, 'price' => 125000, 'prod' => $prodSMA, 'sizes' => ['S' => 10, 'M' => 10, 'L' => 10]],
            ['name' => 'Setelan Seragam Pramuka Siaga Putri', 'unit' => 'Stel', 'qty' => 30, 'price' => 125000, 'prod' => $prodSMA, 'sizes' => ['S' => 10, 'M' => 10, 'L' => 10]],
            ['name' => 'Kaos Olahraga Katun Lengan Panjang SD', 'unit' => 'Pcs', 'qty' => 55, 'price' => 55000, 'prod' => $prodSD, 'sizes' => ['S' => 15, 'M' => 20, 'L' => 15, 'XL' => 5]],
            ['name' => 'Celana Training Olahraga Diadora SD', 'unit' => 'Pcs', 'qty' => 55, 'price' => 50000, 'prod' => $prodCelana, 'sizes' => ['S' => 15, 'M' => 20, 'L' => 15, 'XL' => 5]],
            ['name' => 'Rompi Rajut Merah Bordir Logo SD', 'unit' => 'Pcs', 'qty' => 40, 'price' => 45000, 'prod' => $prodSD, 'sizes' => ['S' => 10, 'M' => 20, 'L' => 10]],
            ['name' => 'Jas Almamater / Blazer SD Furing Penuh', 'unit' => 'Pcs', 'qty' => 25, 'price' => 140000, 'prod' => $prodSMP, 'sizes' => ['S' => 5, 'M' => 10, 'L' => 10]],
            ['name' => 'Topi Pet SD Merah Putih Bordir Komputer', 'unit' => 'Pcs', 'qty' => 60, 'price' => 15000, 'prod' => $prodSD, 'sizes' => ['All Size' => 60]],
            ['name' => 'Dasi Panjang Merah Bordir Tut Wuri SD', 'unit' => 'Pcs', 'qty' => 60, 'price' => 10000, 'prod' => $prodSD, 'sizes' => ['All Size' => 60]],
            ['name' => 'Ikat Pinggang Sabuk SD Gesper Logam', 'unit' => 'Pcs', 'qty' => 50, 'price' => 15000, 'prod' => $prodSD, 'sizes' => ['Standar' => 50]],
            ['name' => 'Kaos Kaki Putih Telapak Hitam Logo SD', 'unit' => 'Pasang', 'qty' => 60, 'price' => 12000, 'prod' => $prodSD, 'sizes' => ['All Size' => 60]],
            ['name' => 'Kerudung / Jilbab Putih Bordir Logo SD', 'unit' => 'Pcs', 'qty' => 35, 'price' => 25000, 'prod' => $prodSD, 'sizes' => ['S' => 10, 'M' => 15, 'L' => 10]],
            ['name' => 'Baju Koko Muslim Putih Bordir SD', 'unit' => 'Pcs', 'qty' => 30, 'price' => 70000, 'prod' => $prodKemeja, 'sizes' => ['S' => 10, 'M' => 10, 'L' => 10]],
            ['name' => 'Celana Panjang Muslim Hijau Lumut SD', 'unit' => 'Pcs', 'qty' => 30, 'price' => 65000, 'prod' => $prodCelana, 'sizes' => ['S' => 10, 'M' => 10, 'L' => 10]],
            ['name' => 'Hasduk Kacu Pramuka SD + Ring Rotan', 'unit' => 'Set', 'qty' => 60, 'price' => 12500, 'prod' => $prodSMA, 'sizes' => ['Standar' => 60]],
            ['name' => 'Topi Baret Pramuka Coklat Putra', 'unit' => 'Pcs', 'qty' => 30, 'price' => 22000, 'prod' => $prodSMA, 'sizes' => ['All Size' => 30]],
            ['name' => 'Topi Bonet Pramuka Siaga Putri', 'unit' => 'Pcs', 'qty' => 30, 'price' => 20000, 'prod' => $prodSMA, 'sizes' => ['All Size' => 30]],
            ['name' => 'Jas Praktikum / Jas Lab Putih Siswa', 'unit' => 'Pcs', 'qty' => 20, 'price' => 85000, 'prod' => $prodKemeja, 'sizes' => ['S' => 5, 'M' => 10, 'L' => 5]],
            ['name' => 'Celemek Tata Boga Siswa Bordir Logo', 'unit' => 'Pcs', 'qty' => 25, 'price' => 30000, 'prod' => $prodSD, 'sizes' => ['All Size' => 25]],
            ['name' => 'Tas Serut Goodie Bag Azhar Collection', 'unit' => 'Pcs', 'qty' => 70, 'price' => 8000, 'prod' => $prodSD, 'sizes' => ['Standar' => 70]],
            ['name' => 'Set Paket Atribut Badge Bordir Komputer', 'unit' => 'Set', 'qty' => 60, 'price' => 15000, 'prod' => $prodSD, 'sizes' => ['Komplit' => 60]],
        ];

        $invSubtotal = 0;
        $createdInvoiceItems = [];

        foreach ($invoiceItemsConfig as $itConf) {
            $itemSubtotal = $itConf['qty'] * $itConf['price'];
            $invSubtotal += $itemSubtotal;

            $invItem = InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'product_id' => $itConf['prod'] ? $itConf['prod']->id : null,
                'item_name' => $itConf['name'],
                'unit' => $itConf['unit'],
                'qty' => $itConf['qty'],
                'unit_price' => $itConf['price'],
                'subtotal' => $itemSubtotal,
                'size_breakdown' => $itConf['sizes'],
                'description' => 'Bahan berkualitas tinggi, jahit stik ganda rapi, QC ketat.',
            ]);

            $createdInvoiceItems[] = $invItem;
        }

        $invGrandTotal = max(0, $invSubtotal - $invoice->discount);
        $invoice->update([
            'subtotal' => $invSubtotal,
            'total_amount' => $invGrandTotal,
        ]);

        $potongStep = ProductionStep::where('name', 'like', '%Potong%')->first();
        $jahitStep = ProductionStep::where('name', 'like', '%Jahit%')->first();
        $packingStep = ProductionStep::where('name', 'like', '%Packing%')->first();

        foreach ($createdInvoiceItems as $idx => $invItem) {
            $asgn = ProductionAssignment::create([
                'invoice_item_id' => $invItem->id,
                'user_id' => $targetTailor->id,
                'qty' => $invItem->qty,
                'target_date' => Carbon::now()->addDays(rand(3, 10))->format('Y-m-d'),
                'status' => 'completed',
            ]);

            $wageRate = 2500 + (($idx % 5) * 500);
            $stepModel = ($idx % 2 === 0) ? $potongStep : $jahitStep;

            ProductionAssignmentStep::create([
                'production_assignment_id' => $asgn->id,
                'production_step_id' => $stepModel ? $stepModel->id : null,
                'step_name' => $stepModel ? $stepModel->name : 'Jahit Perakitan & Finishing',
                'wage' => $wageRate,
                'qty' => $invItem->qty,
                'status' => 'completed',
                'completed_at' => Carbon::now()->subDays(rand(1, 4)),
            ]);
        }
    }
}
