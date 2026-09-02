<?php

namespace Database\Seeders;

use App\Models\ProductionAssignmentStep;
use App\Models\ProductionProgressLog;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductionProgressSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('production_progress_logs')->delete();

        $steps = ProductionAssignmentStep::with('assignment')->get();

        foreach ($steps as $step) {
            $assignment = $step->assignment;
            if (! $assignment) {
                continue;
            }

            $tailorId = $assignment->user_id;
            $stepQty = (int) ($step->qty ?: 20);

            if ($step->status === 'completed') {
                $targetDate = $step->completed_at ? Carbon::parse($step->completed_at) : Carbon::now()->subDays(4);
                $half = (int) ceil($stepQty / 2);

                ProductionProgressLog::create([
                    'production_assignment_step_id' => $step->id,
                    'user_id' => $tailorId,
                    'date' => $targetDate->copy()->subDays(1)->format('Y-m-d'),
                    'qty' => $half,
                    'notes' => 'Pengerjaan bagian pertama selesai',
                    'created_by' => $tailorId,
                ]);

                if ($stepQty - $half > 0) {
                    ProductionProgressLog::create([
                        'production_assignment_step_id' => $step->id,
                        'user_id' => $tailorId,
                        'date' => $targetDate->format('Y-m-d'),
                        'qty' => $stepQty - $half,
                        'notes' => 'Penyelesaian sisa target langkah kerja',
                        'created_by' => $tailorId,
                    ]);
                }
            } elseif ($step->status === 'in_progress') {
                $portion = max(1, (int) round($stepQty * 0.5));
                ProductionProgressLog::create([
                    'production_assignment_step_id' => $step->id,
                    'user_id' => $tailorId,
                    'date' => Carbon::now()->subDays(1)->format('Y-m-d'),
                    'qty' => $portion,
                    'notes' => 'Progres pengerjaan bertahap sedang berjalan',
                    'created_by' => $tailorId,
                ]);
            }
        }
    }
}
