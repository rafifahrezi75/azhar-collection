<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\ProductionAssignment;
use App\Models\ProductionAssignmentStep;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductionAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $invoice = Invoice::with('items.product.productionSteps')->where('invoice_number', 'INV-20260810-BZZB')->first();
        if (! $invoice) {
            $invoice = Invoice::with('items.product.productionSteps')->first();
        }

        if (! $invoice) {
            $this->command->info('No invoices found. Skip SPK Seeder.');

            return;
        }

        // Ambil user dengan role staff (penjahit)
        $user = User::whereHas('roles', fn ($q) => $q->where('name', 'staff'))->first()
            ?? User::first(); // fallback ke admin jika belum ada staff

        foreach ($invoice->items as $item) {
            if (! $item->product || $item->product->productionSteps->isEmpty()) {
                continue;
            }

            // Assign
            $assignment = ProductionAssignment::create([
                'invoice_item_id' => $item->id,
                'user_id' => $user->id,
                'qty' => $item->qty,
                'target_date' => now()->addDays(7)->format('Y-m-d'),
                'status' => 'PENDING',
            ]);

            // Assign steps
            foreach ($item->product->productionSteps as $productStep) {
                ProductionAssignmentStep::create([
                    'production_assignment_id' => $assignment->id,
                    'production_step_id' => $productStep->production_step_id,
                    'step_name' => $productStep->custom_name ?? $productStep->productionStep?->name ?? 'Langkah Produksi',
                    'wage' => $productStep->wage ?? $productStep->productionStep?->default_wage ?? 0,
                    'status' => 'PENDING',
                ]);
            }
        }

        $this->command->info('Production Assignment (SPK) seeded successfully.');
    }
}
