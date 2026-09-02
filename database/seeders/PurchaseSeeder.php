<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\StockMutation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PurchaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('purchases')->delete();
        DB::table('purchase_items')->delete();

        $admin = User::first();
        $adminId = $admin ? $admin->id : 1;

        $kainOxf = Item::where('code', 'KAIN-OXF-WHT')->first();
        $kainFamRed = Item::where('code', 'KAIN-FAM-RED')->first();
        $kainFamBlu = Item::where('code', 'KAIN-FAM-BLU')->first();
        $benang = Item::where('code', 'BNG-WHT')->first();
        $kancing = Item::where('code', 'KNC-WHT')->first();
        $zipper = Item::where('code', 'ZIP-YKK-N1')->first();

        $purchasesData = [
            [
                'supplier_name' => 'CV Tekstil Bandung Utama',
                'days_ago' => 25,
                'notes' => 'Kulaan kain gelombang awal untuk persiapan semester baru',
                'items' => [
                    [
                        'item' => $kainOxf,
                        'qty' => 100,
                        'unit_price' => 24000,
                    ],
                    [
                        'item' => $kainFamRed,
                        'qty' => 80,
                        'unit_price' => 30000,
                    ],
                ],
            ],
            [
                'supplier_name' => 'Grosir Kain & Bahan Abadi Cirebon',
                'days_ago' => 15,
                'notes' => 'Restock kain famatex biru SMP',
                'items' => [
                    [
                        'item' => $kainFamBlu,
                        'qty' => 100,
                        'unit_price' => 30000,
                    ],
                ],
            ],
            [
                'supplier_name' => 'Toko Mitra Benang & Aksesoris',
                'days_ago' => 8,
                'notes' => 'Pembelian benang jahit putih dan kancing kemeja',
                'items' => [
                    [
                        'item' => $benang,
                        'qty' => 40,
                        'unit_price' => 1500,
                    ],
                    [
                        'item' => $kancing,
                        'qty' => 1000,
                        'unit_price' => 40,
                    ],
                    [
                        'item' => $zipper,
                        'qty' => 100,
                        'unit_price' => 2000,
                    ],
                ],
            ],
        ];

        foreach ($purchasesData as $idx => $pData) {
            $pDate = Carbon::now()->subDays($pData['days_ago']);
            $refNo = 'PUR-'.$pDate->format('Ymd').'-'.str_pad($idx + 1, 4, '0', STR_PAD_LEFT);

            $purchase = Purchase::create([
                'reference_no' => $refNo,
                'supplier_name' => $pData['supplier_name'],
                'date' => $pDate->format('Y-m-d'),
                'total_amount' => 0,
                'notes' => $pData['notes'],
                'created_by' => $adminId,
            ]);

            $total = 0;
            foreach ($pData['items'] as $itemData) {
                $item = $itemData['item'];
                if (! $item) {
                    continue;
                }

                $qty = $itemData['qty'];
                $price = $itemData['unit_price'];
                $subtotal = $qty * $price;
                $total += $subtotal;

                $purchase->items()->create([
                    'item_id' => $item->id,
                    'unit_id' => $item->unit_id,
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'subtotal' => $subtotal,
                ]);

                StockMutation::create([
                    'item_id' => $item->id,
                    'user_id' => $adminId,
                    'type' => 'in',
                    'quantity' => $qty,
                    'unit_id' => $item->unit_id,
                    'multiplier' => 1,
                    'total_base_quantity' => $qty,
                    'previous_stock' => $item->real_stock,
                    'current_stock' => $item->real_stock + $qty,
                    'notes' => 'Pembelian supplier: '.$refNo,
                    'reference_no' => $refNo,
                    'mutation_date' => $pDate->format('Y-m-d'),
                ]);

                $item->increment('real_stock', $qty);
                $item->increment('estimated_stock', $qty);
            }

            $purchase->update(['total_amount' => $total]);
        }
    }
}
