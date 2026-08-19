<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Invoice;

class DumpInvoice extends Command
{
    protected $signature = 'dump:invoice';
    
    public function handle()
    {
        $invoice = Invoice::first();
        if (!$invoice) return;
        
        $invoice->load([
            'customer',
            'items.product.images',
            'items.product.sizes',
            'items.product.productionSteps.productionStep',
            'items.productionSteps.assignee',
            'items.productionAssignments.assignee',
            'items.productionAssignments.steps',
            'items.product.materials.item.unit',
            'creator',
        ]);
        
        echo json_encode($invoice->toArray(), JSON_PRETTY_PRINT);
    }
}
