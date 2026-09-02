<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\ProductionAssignment;
use App\Models\ProductionAssignmentStep;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductionAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('production_progress_logs')->delete();
        DB::table('production_assignment_steps')->delete();
        DB::table('production_assignments')->delete();

        $ahmad = User::where('email', 'ahmad@azhar.test')->first() ?? User::where('name', 'like', '%Ahmad%')->first();
        $budi = User::where('email', 'budi@azhar.test')->first() ?? User::where('name', 'like', '%Budi%')->first();
        $agus = User::where('email', 'agus@azhar.test')->first() ?? User::where('name', 'like', '%Agus%')->first();
        $dewi = User::where('email', 'dewi@azhar.test')->first() ?? User::where('name', 'like', '%Dewi%')->first();
        $siti = User::where('email', 'siti@azhar.test')->first() ?? User::where('name', 'like', '%Siti%')->first();

        $fallbackUser = User::first();
        $ahmad = $ahmad ?? $fallbackUser;
        $budi = $budi ?? $fallbackUser;
        $agus = $agus ?? $fallbackUser;
        $dewi = $dewi ?? $fallbackUser;
        $siti = $siti ?? $fallbackUser;

        $invSD = Invoice::with(['items.product.productionSteps.productionStep'])->where('invoice_number', 'like', '%-0001')->first();
        if ($invSD && $invSD->items->isNotEmpty()) {
            $item = $invSD->items->first();
            $pSteps = $item->product?->productionSteps ?? collect();

            $assignAhmad = ProductionAssignment::create([
                'invoice_item_id' => $item->id,
                'user_id' => $ahmad->id,
                'qty' => 20,
                'target_date' => Carbon::parse($invSD->order_date)->addDays(10)->format('Y-m-d'),
                'status' => 'in_progress',
            ]);

            $assignBudi = ProductionAssignment::create([
                'invoice_item_id' => $item->id,
                'user_id' => $budi->id,
                'qty' => 20,
                'target_date' => Carbon::parse($invSD->order_date)->addDays(10)->format('Y-m-d'),
                'status' => 'in_progress',
            ]);

            foreach ([$assignAhmad, $assignBudi] as $asgn) {
                foreach ($pSteps as $idx => $ps) {
                    ProductionAssignmentStep::create([
                        'production_assignment_id' => $asgn->id,
                        'production_step_id' => $ps->production_step_id,
                        'step_name' => $ps->custom_name ?? $ps->productionStep?->name ?? 'Langkah Produksi',
                        'wage' => $ps->wage ?? 3000,
                        'qty' => 20,
                        'status' => $idx === 0 ? 'completed' : ($idx === 1 ? 'in_progress' : 'pending'),
                        'completed_at' => $idx === 0 ? Carbon::now()->subDays(5) : null,
                    ]);
                }
            }
        }

        $invSMP = Invoice::with(['items.product.productionSteps.productionStep'])->where('invoice_number', 'like', '%-0002')->first();
        if ($invSMP && $invSMP->items->isNotEmpty()) {
            $item = $invSMP->items->first();
            $pSteps = $item->product?->productionSteps ?? collect();

            $assignAgus = ProductionAssignment::create([
                'invoice_item_id' => $item->id,
                'user_id' => $agus->id,
                'qty' => 30,
                'target_date' => Carbon::parse($invSMP->order_date)->addDays(12)->format('Y-m-d'),
                'status' => 'in_progress',
            ]);

            $assignDewi = ProductionAssignment::create([
                'invoice_item_id' => $item->id,
                'user_id' => $dewi->id,
                'qty' => 30,
                'target_date' => Carbon::parse($invSMP->order_date)->addDays(12)->format('Y-m-d'),
                'status' => 'in_progress',
            ]);

            foreach ([$assignAgus, $assignDewi] as $asgn) {
                foreach ($pSteps as $idx => $ps) {
                    ProductionAssignmentStep::create([
                        'production_assignment_id' => $asgn->id,
                        'production_step_id' => $ps->production_step_id,
                        'step_name' => $ps->custom_name ?? $ps->productionStep?->name ?? 'Langkah Produksi',
                        'wage' => $ps->wage ?? 3000,
                        'qty' => 30,
                        'status' => $idx === 0 ? 'completed' : 'pending',
                        'completed_at' => $idx === 0 ? Carbon::now()->subDays(2) : null,
                    ]);
                }
            }
        }

        $invSMA = Invoice::with(['items.product.productionSteps.productionStep'])->where('invoice_number', 'like', '%-0003')->first();
        if ($invSMA && $invSMA->items->isNotEmpty()) {
            $item = $invSMA->items->first();
            $pSteps = $item->product?->productionSteps ?? collect();

            $assignSiti = ProductionAssignment::create([
                'invoice_item_id' => $item->id,
                'user_id' => $siti->id,
                'qty' => 50,
                'target_date' => Carbon::parse($invSMA->order_date)->addDays(18)->format('Y-m-d'),
                'status' => 'completed',
            ]);

            foreach ($pSteps as $ps) {
                ProductionAssignmentStep::create([
                    'production_assignment_id' => $assignSiti->id,
                    'production_step_id' => $ps->production_step_id,
                    'step_name' => $ps->custom_name ?? $ps->productionStep?->name ?? 'Langkah Produksi',
                    'wage' => $ps->wage ?? 3500,
                    'qty' => 50,
                    'status' => 'completed',
                    'completed_at' => Carbon::now()->subDays(4),
                ]);
            }
        }
    }
}
