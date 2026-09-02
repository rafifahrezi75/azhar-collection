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
                $date1 = Carbon::now()->subDays(6)->format('Y-m-d');
                $date2 = Carbon::now()->subDays(4)->format('Y-m-d');
                $half = (int) ceil($stepQty / 2);

                ProductionProgressLog::create([
                    'production_assignment_step_id' => $step->id,
                    'user_id' => $tailorId,
                    'date' => $date1,
                    'qty' => $half,
                    'notes' => 'Pengerjaan batch 1 selesai',
                    'created_by' => $tailorId,
                ]);

                if ($stepQty - $half > 0) {
                    ProductionProgressLog::create([
                        'production_assignment_step_id' => $step->id,
                        'user_id' => $tailorId,
                        'date' => $date2,
                        'qty' => $stepQty - $half,
                        'notes' => 'Penyelesaian seluruh target langkah',
                        'created_by' => $tailorId,
                    ]);
                }
            } elseif ($step->status === 'in_progress') {
                $portion = max(1, (int) round($stepQty * 0.4));
                ProductionProgressLog::create([
                    'production_assignment_step_id' => $step->id,
                    'user_id' => $tailorId,
                    'date' => Carbon::now()->subDays(1)->format('Y-m-d'),
                    'qty' => $portion,
                    'notes' => 'Progres pengerjaan berjalan',
                    'created_by' => $tailorId,
                ]);
            }
        }
    }
}
