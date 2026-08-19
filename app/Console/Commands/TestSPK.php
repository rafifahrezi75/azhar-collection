<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InvoiceItem;
use App\Models\User;
use App\Models\ProductProductionStep;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\ProductionAssignmentController;
use Illuminate\Http\Request;

class TestSPK extends Command
{
    protected $signature = 'test:spk';
    protected $description = 'Test SPK creation';

    public function handle()
    {
        $item = InvoiceItem::with('product.productionSteps')->first();
        if (!$item) {
            $this->error('No invoice item found');
            return;
        }

        $user = User::first();
        $steps = $item->product->productionSteps->pluck('id')->toArray();

        $data = [
            'invoice_item_id' => $item->id,
            'user_id' => $user->id,
            'qty' => $item->qty,
            'target_date' => now()->addDays(5)->format('Y-m-d'),
            'steps' => $steps,
        ];

        $request = Request::create('/dashboard/production-assignments', 'POST', $data);

        $validator = Validator::make($data, [
            'invoice_item_id' => 'required|exists:invoice_items,id',
            'user_id' => 'required|exists:users,id',
            'qty' => 'required|integer|min:1',
            'target_date' => 'nullable|date',
            'steps' => 'required|array|min:1',
            'steps.*' => 'exists:product_production_steps,id',
        ]);

        if ($validator->fails()) {
            $this->error('Validation failed');
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return;
        }

        $this->info('Validation passed!');
    }
}
