<?php

namespace App\Http\Controllers;

use App\Models\InvoiceItemProductionStep;
use App\Models\Invoice;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class InvoiceItemProductionStepController extends Controller
{
    public function assignUser(Request $request, InvoiceItemProductionStep $step): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
        ]);

        $step->update([
            'assigned_to' => $validated['user_id'],
        ]);

        return response()->json([
            'message' => 'Penugasan berhasil diperbarui',
            'data' => $step->load('assignee'),
        ]);
    }

    public function toggleStatus(Request $request, InvoiceItemProductionStep $step): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:PENDING,IN_PROGRESS,SELESAI',
        ]);

        $data = [
            'status' => $validated['status'],
        ];

        if ($validated['status'] === 'SELESAI') {
            $data['completed_at'] = now();
        } elseif ($validated['status'] === 'PENDING' || $validated['status'] === 'IN_PROGRESS') {
            $data['completed_at'] = null;
        }

        $step->update($data);

        return response()->json([
            'message' => 'Status berhasil diperbarui',
            'data' => $step->load('assignee'),
        ]);
    }

    public function generateForInvoice(Invoice $invoice): JsonResponse
    {
        $invoice->load('items');
        
        foreach ($invoice->items as $invoiceItem) {
            $existingCount = $invoiceItem->productionSteps()->count();
            if ($existingCount === 0 && $invoiceItem->product_id) {
                $product = Product::with('productionSteps.productionStep')->find($invoiceItem->product_id);
                if ($product) {
                    foreach ($product->productionSteps as $step) {
                        InvoiceItemProductionStep::create([
                            'invoice_item_id' => $invoiceItem->id,
                            'production_step_id' => $step->production_step_id,
                            'step_name' => $step->custom_name ?: ($step->productionStep->name ?? 'Tahap Produksi'),
                            'wage' => $step->wage,
                            'step_order' => $step->sort_order,
                            'status' => 'PENDING',
                        ]);
                    }
                }
            }
        }

        return response()->json([
            'message' => 'Langkah produksi berhasil dibuat',
        ]);
    }
}
