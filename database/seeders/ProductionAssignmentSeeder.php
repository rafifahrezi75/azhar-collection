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
        $dewi = User::where('email', 'dewi@azhar.test')->first() ?? User::where('name', 'like', '%Dewi%')->first();
        $siti = User::where('email', 'siti@azhar.test')->first() ?? User::where('name', 'like', '%Siti%')->first();
        $rudi = User::where('email', 'rudi@azhar.test')->first() ?? User::where('name', 'like', '%Rudi%')->first();

        $fallbackUser = User::first();
        $ahmad = $ahmad ?? $fallbackUser;
        $budi = $budi ?? $fallbackUser;
        $dewi = $dewi ?? $fallbackUser;
        $siti = $siti ?? $fallbackUser;
        $rudi = $rudi ?? $fallbackUser;

        $invSD = Invoice::with(['items.product.productionSteps.productionStep'])->where('invoice_number', 'like', '%-0001')->first();
        if ($invSD && $invSD->items->isNotEmpty()) {
            $itemSD = $invSD->items->first();
            $pSteps = $itemSD->product?->productionSteps ?? collect();

            $potongStep = $pSteps->first(fn ($s) => str_contains(strtolower($s->productionStep?->name ?? ''), 'potong'));
            $jahitSteps = $pSteps->filter(fn ($s) => str_contains(strtolower($s->productionStep?->name ?? ''), 'jahit') || str_contains(strtolower($s->productionStep?->name ?? ''), 'obras'));
            $finishingSteps = $pSteps->filter(fn ($s) => str_contains(strtolower($s->productionStep?->name ?? ''), 'kerah') || str_contains(strtolower($s->productionStep?->name ?? ''), 'kancing') || str_contains(strtolower($s->productionStep?->name ?? ''), 'gosok') || str_contains(strtolower($s->productionStep?->name ?? ''), 'packing'));

            $asgnAhmad = ProductionAssignment::create([
                'invoice_item_id' => $itemSD->id,
                'user_id' => $ahmad->id,
                'qty' => 40,
                'target_date' => Carbon::parse($invSD->order_date)->addDays(4)->format('Y-m-d'),
                'status' => 'completed',
            ]);

            if ($potongStep) {
                ProductionAssignmentStep::create([
                    'production_assignment_id' => $asgnAhmad->id,
                    'production_step_id' => $potongStep->production_step_id,
                    'step_name' => $potongStep->custom_name ?? $potongStep->productionStep?->name ?? 'Potong Kain (Cutting)',
                    'wage' => $potongStep->wage ?? 1500,
                    'qty' => 40,
                    'status' => 'completed',
                    'completed_at' => Carbon::parse($invSD->order_date)->addDays(3),
                ]);
            }

            $asgnBudi = ProductionAssignment::create([
                'invoice_item_id' => $itemSD->id,
                'user_id' => $budi->id,
                'qty' => 20,
                'target_date' => Carbon::parse($invSD->order_date)->addDays(10)->format('Y-m-d'),
                'status' => 'in_progress',
            ]);

            foreach ($jahitSteps as $idx => $js) {
                ProductionAssignmentStep::create([
                    'production_assignment_id' => $asgnBudi->id,
                    'production_step_id' => $js->production_step_id,
                    'step_name' => $js->custom_name ?? $js->productionStep?->name ?? 'Jahit',
                    'wage' => $js->wage ?? 3000,
                    'qty' => 20,
                    'status' => $idx === 0 ? 'completed' : 'in_progress',
                    'completed_at' => $idx === 0 ? Carbon::parse($invSD->order_date)->addDays(6) : null,
                ]);
            }

            $asgnDewi = ProductionAssignment::create([
                'invoice_item_id' => $itemSD->id,
                'user_id' => $dewi->id,
                'qty' => 20,
                'target_date' => Carbon::parse($invSD->order_date)->addDays(10)->format('Y-m-d'),
                'status' => 'in_progress',
            ]);

            foreach ($jahitSteps as $idx => $js) {
                ProductionAssignmentStep::create([
                    'production_assignment_id' => $asgnDewi->id,
                    'production_step_id' => $js->production_step_id,
                    'step_name' => $js->custom_name ?? $js->productionStep?->name ?? 'Jahit',
                    'wage' => $js->wage ?? 3000,
                    'qty' => 20,
                    'status' => $idx === 0 ? 'completed' : 'in_progress',
                    'completed_at' => $idx === 0 ? Carbon::parse($invSD->order_date)->addDays(7) : null,
                ]);
            }

            $asgnSiti = ProductionAssignment::create([
                'invoice_item_id' => $itemSD->id,
                'user_id' => $siti->id,
                'qty' => 40,
                'target_date' => Carbon::parse($invSD->order_date)->addDays(14)->format('Y-m-d'),
                'status' => 'pending',
            ]);

            foreach ($finishingSteps as $fs) {
                ProductionAssignmentStep::create([
                    'production_assignment_id' => $asgnSiti->id,
                    'production_step_id' => $fs->production_step_id,
                    'step_name' => $fs->custom_name ?? $fs->productionStep?->name ?? 'Finishing',
                    'wage' => $fs->wage ?? 1000,
                    'qty' => 40,
                    'status' => 'pending',
                    'completed_at' => null,
                ]);
            }
        }

        $invSMP = Invoice::with(['items.product.productionSteps.productionStep'])->where('invoice_number', 'like', '%-0002')->first();
        if ($invSMP && $invSMP->items->isNotEmpty()) {
            $itemSMP = $invSMP->items->first();
            $pSteps = $itemSMP->product?->productionSteps ?? collect();

            $potongStep = $pSteps->first(fn ($s) => str_contains(strtolower($s->productionStep?->name ?? ''), 'potong'));
            $otherSteps = $pSteps->filter(fn ($s) => ! str_contains(strtolower($s->productionStep?->name ?? ''), 'potong'));

            $asgnAhmadSMP = ProductionAssignment::create([
                'invoice_item_id' => $itemSMP->id,
                'user_id' => $ahmad->id,
                'qty' => 50,
                'target_date' => Carbon::parse($invSMP->order_date)->addDays(4)->format('Y-m-d'),
                'status' => 'completed',
            ]);

            if ($potongStep) {
                ProductionAssignmentStep::create([
                    'production_assignment_id' => $asgnAhmadSMP->id,
                    'production_step_id' => $potongStep->production_step_id,
                    'step_name' => $potongStep->custom_name ?? $potongStep->productionStep?->name ?? 'Potong Kain (Cutting)',
                    'wage' => $potongStep->wage ?? 1500,
                    'qty' => 50,
                    'status' => 'completed',
                    'completed_at' => Carbon::parse($invSMP->order_date)->addDays(3),
                ]);
            }

            $asgnRudi = ProductionAssignment::create([
                'invoice_item_id' => $itemSMP->id,
                'user_id' => $rudi->id,
                'qty' => 50,
                'target_date' => Carbon::parse($invSMP->order_date)->addDays(12)->format('Y-m-d'),
                'status' => 'in_progress',
            ]);

            foreach ($otherSteps as $idx => $os) {
                ProductionAssignmentStep::create([
                    'production_assignment_id' => $asgnRudi->id,
                    'production_step_id' => $os->production_step_id,
                    'step_name' => $os->custom_name ?? $os->productionStep?->name ?? 'Tahapan Produksi',
                    'wage' => $os->wage ?? 2500,
                    'qty' => 50,
                    'status' => $idx === 0 ? 'completed' : ($idx === 1 ? 'in_progress' : 'pending'),
                    'completed_at' => $idx === 0 ? Carbon::parse($invSMP->order_date)->addDays(5) : null,
                ]);
            }
        }

        $invSMA = Invoice::with(['items.product.productionSteps.productionStep'])->where('invoice_number', 'like', '%-0003')->first();
        if ($invSMA && $invSMA->items->isNotEmpty()) {
            $itemSMA = $invSMA->items->first();
            $pSteps = $itemSMA->product?->productionSteps ?? collect();

            $asgnAhmadSMA = ProductionAssignment::create([
                'invoice_item_id' => $itemSMA->id,
                'user_id' => $ahmad->id,
                'qty' => 30,
                'target_date' => Carbon::parse($invSMA->order_date)->addDays(4)->format('Y-m-d'),
                'status' => 'completed',
            ]);

            $asgnBudiSMA = ProductionAssignment::create([
                'invoice_item_id' => $itemSMA->id,
                'user_id' => $budi->id,
                'qty' => 30,
                'target_date' => Carbon::parse($invSMA->order_date)->addDays(12)->format('Y-m-d'),
                'status' => 'completed',
            ]);

            foreach ($pSteps as $ps) {
                ProductionAssignmentStep::create([
                    'production_assignment_id' => $asgnBudiSMA->id,
                    'production_step_id' => $ps->production_step_id,
                    'step_name' => $ps->custom_name ?? $ps->productionStep?->name ?? 'Tahapan Produksi',
                    'wage' => $ps->wage ?? 3000,
                    'qty' => 30,
                    'status' => 'completed',
                    'completed_at' => Carbon::parse($invSMA->order_date)->addDays(10),
                ]);
            }
        }
    }
}
