<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('invoices')->delete();
        DB::table('invoice_items')->delete();

        $customers = Customer::all();
        $products = Product::with('sizes.size')->get();
        $admin = User::first();

        if ($customers->isEmpty() || $products->isEmpty() || !$admin) {
            $this->command->warn('Skipping TransactionSeeder because Customers, Products, or Admin is missing.');
            return;
        }

        $paymentStatuses = ['LUNAS', 'DP', 'BELUM_LUNAS'];
        $productionStatuses = ['SELESAI', 'PROSES', 'PENDING'];

        // Let's create around 20 invoices
        for ($i = 0; $i < 20; $i++) {
            $customer = $customers->random();
            $orderDate = Carbon::now()->subDays(rand(1, 60));
            $isCompleted = rand(0, 1) === 1;

            $dateStr = $orderDate->format('Ymd');
            $randStr = strtoupper(Str::random(4));
            $invoiceNumber = "INV-{$dateStr}-{$randStr}";

            $numItems = rand(1, 2);
            $selectedProducts = $products->random($numItems);

            $totalAmount = 0;
            $itemsData = [];

            foreach ($selectedProducts as $product) {
                $sizeBreakdown = [];
                $totalQty = 0;

                if ($product->sizes->count() > 0) {
                    $sizes = $product->sizes->random(rand(1, min(3, $product->sizes->count())));
                    foreach ($sizes as $s) {
                        // Realistic large quantities for schools
                        $qty = rand(20, 150);
                        $sizeName = $s->size ? $s->size->size_name : "Ukuran {$s->size_id}";
                        $sizeBreakdown[$sizeName] = $qty;
                        $totalQty += $qty;
                    }
                } else {
                    $totalQty = rand(50, 300);
                }

                $unitPrice = $product->base_price ?: 120000;
                $subtotal = $unitPrice * $totalQty;
                $totalAmount += $subtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'item_name' => $product->name,
                    'unit' => $product->default_unit ?? 'Stel',
                    'qty' => $totalQty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    'size_breakdown' => $sizeBreakdown,
                    'description' => "Pesanan kolektif {$product->name}"
                ];
            }

            $paymentStatus = $paymentStatuses[array_rand($paymentStatuses)];
            $productionStatus = $productionStatuses[array_rand($productionStatuses)];
            
            $paidAmount = 0;
            if ($paymentStatus === 'LUNAS') {
                $paidAmount = $totalAmount;
            } elseif ($paymentStatus === 'DP') {
                $paidAmount = $totalAmount * (rand(30, 70) / 100);
            }

            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'order_date' => $orderDate,
                'completion_date' => $isCompleted ? $orderDate->copy()->addDays(rand(14, 30)) : null,
                'type' => 'PESANAN',
                'subtotal' => $totalAmount,
                'discount' => 0,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'payment_status' => $paymentStatus,
                'production_status' => $productionStatus,
                'cut_stock' => rand(0, 1) === 1,
                'notes' => 'Pesanan tender seragam via seeder',
                'created_by' => $admin->id,
            ]);

            foreach ($itemsData as $itemData) {
                $itemData['invoice_id'] = $invoice->id;
                InvoiceItem::create($itemData);
            }
        }
    }
}
