<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\ProductionAssignment;
use App\Models\ProductionAssignmentStep;
use App\Models\ProductionProgressLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ProductionProgressSeeder extends Seeder
{
    public function run(): void
    {
        ProductionProgressLog::query()->delete();
        ProductionAssignmentStep::query()->delete();
        ProductionAssignment::query()->delete();

        $invoices = Invoice::with('items.product.productionSteps.productionStep')->get();

        if ($invoices->isEmpty()) {
            $this->command->warn('No invoices found. Skipping.');

            return;
        }

        $tailors = User::orderBy('id')->get();
        if ($tailors->count() < 1) {
            $this->command->warn('No users found. Skipping.');

            return;
        }

        $today = Carbon::today();
        $seededCount = 0;
        $tailorIndex = 0;

        foreach ($invoices->take(8) as $invoice) {
            foreach ($invoice->items as $item) {
                if (! $item->product || $item->product->productionSteps->isEmpty()) {
                    continue;
                }

                $orderDate = Carbon::parse($invoice->order_date ?? now());
                $targetDate = Carbon::parse($invoice->completion_date ?? $orderDate->copy()->addDays(14));
                if ($targetDate->lessThanOrEqualTo($orderDate)) {
                    $targetDate = $orderDate->copy()->addDays(14);
                }

                $logEnd = $targetDate->lessThan($today) ? $targetDate->copy() : $today->copy();

                $invoiceStatus = match (true) {
                    $seededCount < 2 => 'completed',
                    $seededCount < 5 => 'in_progress',
                    default => 'pending',
                };

                $tailorCount = min($tailors->count(), max(1, rand(1, 3)));
                $assigned = [];
                for ($i = 0; $i < $tailorCount; $i++) {
                    $assigned[] = $tailors[($tailorIndex + $i) % $tailors->count()];
                }
                $tailorIndex += $tailorCount;

                $qty = max(1, (int) $item->qty);
                $base = intdiv($qty, $tailorCount);
                $remainder = $qty % $tailorCount;

                foreach ($assigned as $i => $tailor) {
                    $shareQty = $base + ($i < $remainder ? 1 : 0);
                    if ($shareQty < 1) {
                        continue;
                    }

                    $assignment = ProductionAssignment::create([
                        'invoice_item_id' => $item->id,
                        'user_id' => $tailor->id,
                        'qty' => $shareQty,
                        'target_date' => $targetDate->format('Y-m-d'),
                        'status' => $invoiceStatus === 'completed' ? 'completed' : ($invoiceStatus === 'in_progress' ? 'in_progress' : 'pending'),
                    ]);

                    foreach ($item->product->productionSteps as $pIndex => $productStep) {
                        $stepStatus = match ($invoiceStatus) {
                            'completed' => 'completed',
                            'in_progress' => match (true) {
                                $pIndex === 0 => 'completed',
                                $pIndex === 1 => rand(0, 10) < 7 ? 'completed' : 'in_progress',
                                default => rand(0, 10) < 4 ? 'in_progress' : 'pending',
                            },
                            default => 'pending',
                        };

                        $step = ProductionAssignmentStep::create([
                            'production_assignment_id' => $assignment->id,
                            'production_step_id' => $productStep->production_step_id,
                            'step_name' => $productStep->custom_name ?? $productStep->productionStep?->name ?? 'Langkah Produksi',
                            'wage' => $productStep->wage ?? $productStep->productionStep?->default_wage ?? 5000,
                            'qty' => $shareQty,
                            'status' => $stepStatus,
                            'completed_at' => null,
                        ]);

                        if ($stepStatus === 'pending') {
                            continue;
                        }

                        $goalQty = $stepStatus === 'completed'
                            ? $shareQty
                            : max(1, (int) ceil($shareQty * rand(35, 75) / 100));

                        $startDate = $orderDate->copy()->addDays(rand(1, 5));
                        if ($startDate->lessThanOrEqualTo($orderDate)) {
                            $startDate = $orderDate->copy()->addDay();
                        }
                        if ($startDate->greaterThan($logEnd)) {
                            $startDate = $logEnd->copy();
                        }

                        $cursor = $startDate->copy();
                        $remaining = $goalQty;
                        $dayCount = 0;

                        while ($remaining > 0 && $dayCount < 15 && $cursor->lessThanOrEqualTo($logEnd)) {
                            $portion = max(1, (int) ceil($goalQty / rand(2, 4)));
                            $todayQty = min($portion, $remaining);

                            ProductionProgressLog::create([
                                'production_assignment_step_id' => $step->id,
                                'user_id' => $tailor->id,
                                'date' => $cursor->format('Y-m-d'),
                                'qty' => $todayQty,
                                'notes' => $this->randomNote($dayCount, $remaining - $todayQty),
                                'created_by' => $tailor->id,
                            ]);

                            $remaining -= $todayQty;
                            $cursor->addDays(rand(1, 3));
                            $dayCount++;
                        }

                        $totalDone = (int) $step->progressLogs()->sum('qty');
                        if ($totalDone >= $step->qty) {
                            $step->update(['status' => 'completed', 'completed_at' => $cursor->copy()->subDay()]);
                        } elseif ($totalDone > 0) {
                            $step->update(['status' => 'in_progress']);
                        } else {
                            $step->update(['status' => 'pending']);
                        }
                    }

                    $assignment->refresh()->load('steps');
                    $stepTotal = $assignment->steps->count();
                    $doneSteps = $assignment->steps->where('status', 'completed')->count();
                    $startedSteps = $assignment->steps->filter(fn ($s) => $s->status !== 'pending')->count();

                    if ($stepTotal > 0 && $doneSteps === $stepTotal) {
                        $assignment->update(['status' => 'completed']);
                    } elseif ($startedSteps > 0) {
                        $assignment->update(['status' => 'in_progress']);
                    }
                }

                $seededCount++;
            }
        }

        $this->command->info("Production Assignments & Progress Logs seeded realistically. ({$seededCount} invoice items processed)");
    }

    private function randomNote(int $day, int $leftAfter): ?string
    {
        if ($day === 0) {
            return 'Mulai pengerjaan';
        }

        if ($leftAfter <= 0) {
            return 'Pekerjaan selesai';
        }

        $roll = rand(1, 10);
        if ($roll > 9) {
            return 'Ada kendala bahan, progres sedikit';
        }

        if ($roll > 8) {
            return 'Dikerjakan bersama tim potong';
        }

        return null;
    }
}
