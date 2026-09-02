<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('invoices')->delete();
        DB::table('invoice_items')->delete();

        $admin = User::first();
        if (! $admin) {
            return;
        }

        $custSD = Customer::where('name', 'like', '%SD%')->first() ?? Customer::first();
        $custSMP = Customer::where('name', 'like', '%SMP%')->first() ?? Customer::skip(1)->first() ?? $custSD;
        $custSMA = Customer::where('name', 'like', '%SMA%')->first() ?? Customer::skip(2)->first() ?? $custSD;
        $custUmum = Customer::where('type', 'like', '%Umum%')->orWhere('type', 'like', '%Swasta%')->first() ?? Customer::latest()->first() ?? $custSD;

        $prodSD = Product::where('code', 'PRD-SD-MP-01')->first() ?? Product::first();
        $prodSMP = Product::where('code', 'PRD-SMP-OS-01')->first() ?? Product::skip(1)->first() ?? $prodSD;
        $prodSMA = Product::where('code', 'PRD-SMA-PRM-01')->first() ?? Product::skip(2)->first() ?? $prodSD;

        $invoicesData = [
            [
                'invoice_number' => 'INV-'.Carbon::now()->subDays(12)->format('Ymd').'-0001',
                'customer_id' => $custSD->id,
                'customer_name' => $custSD->name,
                'order_date' => Carbon::now()->subDays(12)->format('Y-m-d'),
                'completion_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
                'type' => 'REGULAR',
                'payment_status' => 'DP',
                'production_status' => 'PROSES',
                'cut_stock' => true,
                'notes' => 'Pesanan seragam merah putih semester baru',
                'items' => [
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => $prodSD->name,
                        'unit' => 'Stel',
                        'qty' => 40,
                        'unit_price' => 110000,
                        'subtotal' => 4400000,
                        'size_breakdown' => ['S' => 10, 'M' => 15, 'L' => 10, 'XL' => 5],
                        'description' => 'Bahan Oxford Putih & Famatex Merah',
                    ],
                ],
                'discount' => 0,
                'paid_amount' => 2200000,
            ],
            [
                'invoice_number' => 'INV-'.Carbon::now()->subDays(8)->format('Ymd').'-0002',
                'customer_id' => $custSMP->id,
                'customer_name' => $custSMP->name,
                'order_date' => Carbon::now()->subDays(8)->format('Y-m-d'),
                'completion_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
                'type' => 'REGULAR',
                'payment_status' => 'DP',
                'production_status' => 'PROSES',
                'cut_stock' => true,
                'notes' => 'Pesanan seragam OSIS SMP gelombang 1',
                'items' => [
                    [
                        'product_id' => $prodSMP->id,
                        'item_name' => $prodSMP->name,
                        'unit' => 'Stel',
                        'qty' => 60,
                        'unit_price' => 135000,
                        'subtotal' => 8100000,
                        'size_breakdown' => ['S' => 15, 'M' => 25, 'L' => 15, 'XL' => 5],
                        'description' => 'Kemeja Putih Lengan Pendek & Celana/Rok Biru',
                    ],
                ],
                'discount' => 100000,
                'paid_amount' => 4000000,
            ],
            [
                'invoice_number' => 'INV-'.Carbon::now()->subDays(25)->format('Ymd').'-0003',
                'customer_id' => $custSMA->id,
                'customer_name' => $custSMA->name,
                'order_date' => Carbon::now()->subDays(25)->format('Y-m-d'),
                'completion_date' => Carbon::now()->subDays(3)->format('Y-m-d'),
                'type' => 'REGULAR',
                'payment_status' => 'LUNAS',
                'production_status' => 'SELESAI',
                'cut_stock' => true,
                'notes' => 'Pesanan seragam pramuka penegak kelas X',
                'items' => [
                    [
                        'product_id' => $prodSMA->id,
                        'item_name' => $prodSMA->name,
                        'unit' => 'Stel',
                        'qty' => 50,
                        'unit_price' => 165000,
                        'subtotal' => 8250000,
                        'size_breakdown' => ['M' => 20, 'L' => 20, 'XL' => 10],
                        'description' => 'Seragam Pramuka Bahan Oxford & Famatex Coklat',
                    ],
                ],
                'discount' => 0,
                'paid_amount' => 8250000,
            ],
            [
                'invoice_number' => 'INV-'.Carbon::now()->subDays(2)->format('Ymd').'-0004',
                'customer_id' => $custUmum->id,
                'customer_name' => $custUmum->name,
                'order_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'completion_date' => Carbon::now()->addDays(14)->format('Y-m-d'),
                'type' => 'REGULAR',
                'payment_status' => 'BELUM_LUNAS',
                'production_status' => 'PENDING',
                'cut_stock' => true,
                'notes' => 'Pesanan awal untuk contoh batch 1',
                'items' => [
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => $prodSD->name,
                        'unit' => 'Stel',
                        'qty' => 20,
                        'unit_price' => 110000,
                        'subtotal' => 2200000,
                        'size_breakdown' => ['S' => 5, 'M' => 10, 'L' => 5],
                        'description' => 'Seragam SD Merah Putih',
                    ],
                ],
                'discount' => 0,
                'paid_amount' => 0,
            ],
            [
                'invoice_number' => 'INV-'.Carbon::now()->subDays(45)->format('Ymd').'-0005',
                'customer_id' => $custSMP->id,
                'customer_name' => $custSMP->name,
                'order_date' => Carbon::now()->subDays(45)->format('Y-m-d'),
                'completion_date' => Carbon::now()->subDays(20)->format('Y-m-d'),
                'type' => 'HISTORICAL',
                'payment_status' => 'LUNAS',
                'production_status' => 'SELESAI',
                'cut_stock' => false,
                'notes' => 'Arsip pesanan tahun ajaran lalu',
                'items' => [
                    [
                        'product_id' => $prodSMP->id,
                        'item_name' => $prodSMP->name,
                        'unit' => 'Stel',
                        'qty' => 30,
                        'unit_price' => 135000,
                        'subtotal' => 4050000,
                        'size_breakdown' => ['M' => 15, 'L' => 15],
                        'description' => 'Arsip Data Pesanan Lama',
                    ],
                ],
                'discount' => 0,
                'paid_amount' => 4050000,
            ],
            [
                'invoice_number' => 'INV-'.Carbon::now()->subDays(1)->format('Ymd').'-0006',
                'customer_id' => $custSD->id,
                'customer_name' => $custSD->name,
                'order_date' => Carbon::now()->subDays(1)->format('Y-m-d'),
                'completion_date' => Carbon::now()->addDays(20)->format('Y-m-d'),
                'type' => 'REGULAR',
                'payment_status' => 'DP',
                'production_status' => 'PROSES',
                'cut_stock' => true,
                'notes' => 'Paket Pengadaan Perlengkapan Seragam Sekolah Lengkap TA 2026/2027',
                'items' => [
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Setelan Seragam SD Merah Putih',
                        'unit' => 'Stel',
                        'qty' => 50,
                        'unit_price' => 110000,
                        'subtotal' => 5500000,
                        'size_breakdown' => ['S' => 15, 'M' => 20, 'L' => 15],
                        'description' => 'Bahan Oxford Putih & Famatex Merah',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Kemeja Oxford Putih Pendek SD',
                        'unit' => 'Pcs',
                        'qty' => 50,
                        'unit_price' => 55000,
                        'subtotal' => 2750000,
                        'size_breakdown' => ['S' => 15, 'M' => 20, 'L' => 15],
                        'description' => 'Bordir Lokasi & Logo Sekolah',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Celana Panjang Famatex Merah SD',
                        'unit' => 'Pcs',
                        'qty' => 30,
                        'unit_price' => 60000,
                        'subtotal' => 1800000,
                        'size_breakdown' => ['S' => 10, 'M' => 10, 'L' => 10],
                        'description' => 'Celana Panjang Pinggang Karet',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Rok Rempel Famatex Merah SD',
                        'unit' => 'Pcs',
                        'qty' => 20,
                        'unit_price' => 60000,
                        'subtotal' => 1200000,
                        'size_breakdown' => ['S' => 5, 'M' => 10, 'L' => 5],
                        'description' => 'Rok Rempel Bawah Lutut',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Seragam Pramuka Siaga SD Lengkap',
                        'unit' => 'Stel',
                        'qty' => 50,
                        'unit_price' => 125000,
                        'subtotal' => 6250000,
                        'size_breakdown' => ['S' => 15, 'M' => 20, 'L' => 15],
                        'description' => 'Bahan Oxford Coklat Susu & Famatex Coklat Tua',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Kaos Olahraga Katun TC SD',
                        'unit' => 'Pcs',
                        'qty' => 50,
                        'unit_price' => 45000,
                        'subtotal' => 2250000,
                        'size_breakdown' => ['S' => 15, 'M' => 20, 'L' => 15],
                        'description' => 'Kombinasi Sablon Logo Depan & Belakang',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Celana Training Diadora SD',
                        'unit' => 'Pcs',
                        'qty' => 50,
                        'unit_price' => 50000,
                        'subtotal' => 2500000,
                        'size_breakdown' => ['S' => 15, 'M' => 20, 'L' => 15],
                        'description' => 'Bahan Diadora Import List Samping',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Rompi Rajut Bordir Logo SD',
                        'unit' => 'Pcs',
                        'qty' => 50,
                        'unit_price' => 65000,
                        'subtotal' => 3250000,
                        'size_breakdown' => ['S' => 15, 'M' => 20, 'L' => 15],
                        'description' => 'Rajut Benang Katun Navy Bordir Komputer',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Topi Pet Bordir SD',
                        'unit' => 'Pcs',
                        'qty' => 50,
                        'unit_price' => 15000,
                        'subtotal' => 750000,
                        'size_breakdown' => ['All Size' => 50],
                        'description' => 'Topi Merah Putih Logo Tutwuri Bordir',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Dasi Bordir Logo SD',
                        'unit' => 'Pcs',
                        'qty' => 50,
                        'unit_price' => 10000,
                        'subtotal' => 500000,
                        'size_breakdown' => ['All Size' => 50],
                        'description' => 'Dasi Merah Perekat Velcro',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Sabuk Ikat Pinggang Gesper SD',
                        'unit' => 'Pcs',
                        'qty' => 50,
                        'unit_price' => 12000,
                        'subtotal' => 600000,
                        'size_breakdown' => ['All Size' => 50],
                        'description' => 'Sabuk Hitam Kepala Gesper Logam Logo SD',
                    ],
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => 'Kaos Kaki Logo Bordir SD',
                        'unit' => 'Pasang',
                        'qty' => 50,
                        'unit_price' => 10000,
                        'subtotal' => 500000,
                        'size_breakdown' => ['All Size' => 50],
                        'description' => 'Kaos Kaki Putih Telapak Hitam Bordir Logo',
                    ],
                ],
                'discount' => 350000,
                'paid_amount' => 15000000,
            ],
        ];

        foreach ($invoicesData as $data) {
            $items = $data['items'];
            unset($data['items']);

            $subtotal = array_sum(array_column($items, 'subtotal'));
            $totalAmount = $subtotal - ($data['discount'] ?? 0);

            $data['subtotal'] = $subtotal;
            $data['total_amount'] = $totalAmount;
            $data['created_by'] = $admin->id;

            $invoice = Invoice::create($data);

            foreach ($items as $item) {
                $item['invoice_id'] = $invoice->id;
                InvoiceItem::create($item);
            }
        }
    }
}
