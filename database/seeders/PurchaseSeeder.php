<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\StockMutation;
use App\Models\User;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class PurchaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $user = User::first();
        $items = Item::with(['unit', 'conversions.unit'])->where('is_active', true)->get();

        if ($items->count() < 2) {
            return;
        }

        $suppliers = ['Toko Bahan Sejahtera', 'Grosir Kain Abadi', 'Mitra Benang Utama', 'Pabrik Kancing Nusantara', 'CV Mandiri Garment'];

        for ($i = 1; $i <= 15; $i++) {
            $purchaseDate = Carbon::now()->subDays(rand(1, 60));
            $referenceNo = 'PUR-'.$purchaseDate->format('Ymd').'-'.str_pad($i, 4, '0', STR_PAD_LEFT);

            $purchase = Purchase::create([
                'reference_no' => $referenceNo,
                'supplier_name' => $faker->randomElement($suppliers),
                'date' => $purchaseDate->format('Y-m-d'),
                'total_amount' => 0, // Will update later
                'notes' => $faker->optional(0.7)->sentence(),
                'created_by' => $user->id ?? 1,
            ]);

            // Randomize how many items in this purchase (1 to 4)
            $numItems = rand(1, min(4, $items->count()));
            $selectedItems = $items->random($numItems);

            $totalAmount = 0;

            foreach ($selectedItems as $item) {
                // Determine if we buy in base unit or conversion unit
                $isBaseUnit = $faker->boolean(60); // 60% chance base unit
                $unitId = $item->unit_id;
                $multiplier = 1;

                if (! $isBaseUnit && $item->conversions->count() > 0) {
                    $conversion = $item->conversions->random();
                    $unitId = $conversion->unit_id;
                    $multiplier = $conversion->conversion_rate;
                }

                $qty = rand(2, 20); // Quantity purchased
                $basePrice = $item->price > 0 ? $item->price * 0.7 : rand(5000, 50000); // Assume cost is 70% of selling price
                $unitPrice = $basePrice * $multiplier; // Adjust price based on unit
                $subtotal = $qty * $unitPrice;

                $purchase->items()->create([
                    'item_id' => $item->id,
                    'unit_id' => $unitId,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

                // Mutasi Item
                $baseQty = $qty * $multiplier;
                StockMutation::create([
                    'item_id' => $item->id,
                    'user_id' => $user->id ?? 1,
                    'type' => 'in',
                    'quantity' => $qty,
                    'unit_id' => $unitId,
                    'multiplier' => $multiplier,
                    'total_base_quantity' => $baseQty,
                    'previous_stock' => $item->stock,
                    'current_stock' => (int) $item->stock + $baseQty,
                    'notes' => 'Pembelian/Restock: '.$referenceNo,
                    'reference_no' => $referenceNo,
                    'mutation_date' => $purchaseDate,
                ]);
                $item->increment('stock', $baseQty);

                $totalAmount += $subtotal;
            }

            // Update total amount
            $purchase->update(['total_amount' => $totalAmount]);
        }
    }
}
