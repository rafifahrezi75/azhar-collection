<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Invoice;
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
        $adminId = $admin ? $admin->id : 1;

        $custSD = Customer::where('code', 'CUST-001')->first() ?? Customer::first();
        $custSMP = Customer::where('code', 'CUST-002')->first() ?? Customer::skip(1)->first() ?? $custSD;
        $custSMA = Customer::where('code', 'CUST-003')->first() ?? Customer::skip(2)->first() ?? $custSD;
        $custToko = Customer::where('code', 'CUST-004')->first() ?? Customer::skip(3)->first() ?? $custSD;

        $prodSD = Product::where('code', 'PRD-SD-MP-01')->first() ?? Product::first();
        $prodSMP = Product::where('code', 'PRD-SMP-OS-01')->first() ?? Product::skip(1)->first() ?? $prodSD;
        $prodSMA = Product::where('code', 'PRD-SMA-PRM-01')->first() ?? Product::skip(2)->first() ?? $prodSD;
        $prodKemeja = Product::where('code', 'PRD-KMJ-PUTIH')->first() ?? $prodSD;
        $prodCelana = Product::where('code', 'PRD-CLN-SMP')->first() ?? $prodSMP;

        $invoicesData = [
            [
                'invoice_number' => 'INV-'.Carbon::now()->subDays(12)->format('Ymd').'-0001',
                'customer_id' => $custSD->id,
                'customer_name' => $custSD->name,
                'order_date' => Carbon::now()->subDays(12)->format('Y-m-d'),
                'completion_date' => Carbon::now()->addDays(6)->format('Y-m-d'),
                'type' => 'REGULAR',
                'payment_status' => 'DP',
                'production_status' => 'PROSES',
                'cut_stock' => true,
                'notes' => 'Pesanan seragam merah putih dan kemeja putih cadangan semester baru',
                'discount' => 100000,
                'paid_amount' => 3000000,
                'items' => [
                    [
                        'product_id' => $prodSD->id,
                        'item_name' => $prodSD->name,
                        'unit' => 'Stel',
                        'qty' => 40,
                        'unit_price' => 110000,
                        'subtotal' => 4400000,
                        'size_breakdown' => ['S' => 10, 'M' => 15, 'L' => 10, 'XL' => 5],
                        'description' => 'Kemeja Oxford Putih + Celana/Rok Famatex Merah',
                    ],
                    [
                        'product_id' => $prodKemeja->id,
                        'item_name' => $prodKemeja->name,
                        'unit' => 'Pcs',
                        'qty' => 20,
                        'unit_price' => 60000,
                        'subtotal' => 1200000,
                        'size_breakdown' => ['S' => 5, 'M' => 10, 'L' => 5],
                        'description' => 'Kemeja Putih Lengan Pendek Ekstra',
                    ],
                ],
            ],
            [
                'invoice_number' => 'INV-'.Carbon::now()->subDays(7)->format('Ymd').'-0002',
                'customer_id' => $custSMP->id,
                'customer_name' => $custSMP->name,
                'order_date' => Carbon::now()->subDays(7)->format('Y-m-d'),
                'completion_date' => Carbon::now()->addDays(8)->format('Y-m-d'),
                'type' => 'REGULAR',
                'payment_status' => 'DP',
                'production_status' => 'PROSES',
                'cut_stock' => true,
                'notes' => 'Pesanan seragam OSIS SMP gelombang 1',
                'discount' => 0,
                'paid_amount' => 3500000,
                'items' => [
                    [
                        'product_id' => $prodSMP->id,
                        'item_name' => $prodSMP->name,
                        'unit' => 'Stel',
                        'qty' => 50,
                        'unit_price' => 130000,
                        'subtotal' => 6500000,
                        'size_breakdown' => ['S' => 10, 'M' => 20, 'L' => 15, 'XL' => 5],
                        'description' => 'Kemeja Putih Lengan Pendek + Celana/Rok Biru Famatex',
                    ],
                ],
            ],
            [
                'invoice_number' => 'INV-'.Carbon::now()->subDays(20)->format('Ymd').'-0003',
                'customer_id' => $custSMA->id,
                'customer_name' => $custSMA->name,
                'order_date' => Carbon::now()->subDays(20)->format('Y-m-d'),
                'completion_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'type' => 'REGULAR',
                'payment_status' => 'LUNAS',
                'production_status' => 'SELESAI',
                'cut_stock' => true,
                'notes' => 'Pesanan seragam pramuka penegak kelas X',
                'discount' => 0,
                'paid_amount' => 4200000,
                'items' => [
                    [
                        'product_id' => $prodSMA->id,
                        'item_name' => $prodSMA->name,
                        'unit' => 'Stel',
                        'qty' => 30,
                        'unit_price' => 140000,
                        'subtotal' => 4200000,
                        'size_breakdown' => ['S' => 5, 'M' => 15, 'L' => 10],
                        'description' => 'Setelan Pramuka Famatex Lengkap Atribut Bordir',
                    ],
                ],
            ],
            [
                'invoice_number' => 'INV-'.Carbon::now()->subDays(2)->format('Ymd').'-0004',
                'customer_id' => $custToko->id,
                'customer_name' => $custToko->name,
                'order_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'completion_date' => Carbon::now()->addDays(12)->format('Y-m-d'),
                'type' => 'REGULAR',
                'payment_status' => 'BELUM_LUNAS',
                'production_status' => 'PENDING',
                'cut_stock' => false,
                'notes' => 'Restock grosir celana SMP toko',
                'discount' => 0,
                'paid_amount' => 0,
                'items' => [
                    [
                        'product_id' => $prodCelana->id,
                        'item_name' => $prodCelana->name,
                        'unit' => 'Pcs',
                        'qty' => 25,
                        'unit_price' => 70000,
                        'subtotal' => 1750000,
                        'size_breakdown' => ['28' => 5, '30' => 10, '32' => 10],
                        'description' => 'Celana Panjang Famatex Biru SMP',
                    ],
                ],
            ],
        ];

        foreach ($invoicesData as $inv) {
            $items = $inv['items'];
            $subtotal = array_sum(array_column($items, 'subtotal'));
            $discount = $inv['discount'];
            $totalAmount = $subtotal - $discount;

            $invoice = Invoice::create([
                'invoice_number' => $inv['invoice_number'],
                'customer_id' => $inv['customer_id'],
                'customer_name' => $inv['customer_name'],
                'order_date' => $inv['order_date'],
                'completion_date' => $inv['completion_date'],
                'type' => $inv['type'],
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total_amount' => $totalAmount,
                'paid_amount' => $inv['paid_amount'],
                'payment_status' => $inv['payment_status'],
                'production_status' => $inv['production_status'],
                'cut_stock' => $inv['cut_stock'],
                'notes' => $inv['notes'],
                'created_by' => $adminId,
            ]);

            foreach ($items as $it) {
                $invoice->items()->create([
                    'product_id' => $it['product_id'],
                    'item_name' => $it['item_name'],
                    'unit' => $it['unit'],
                    'qty' => $it['qty'],
                    'unit_price' => $it['unit_price'],
                    'subtotal' => $it['subtotal'],
                    'size_breakdown' => $it['size_breakdown'],
                    'description' => $it['description'],
                ]);
            }
        }
    }
}
