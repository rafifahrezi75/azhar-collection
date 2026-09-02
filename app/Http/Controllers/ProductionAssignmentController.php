<?php

namespace App\Http\Controllers;

use App\Models\InvoiceItemProductionStep;
use App\Models\ProductionAssignment;
use App\Models\ProductionAssignmentStep;
use App\Models\ProductProductionStep;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductionAssignmentController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_item_id' => 'required|exists:invoice_items,id',
            'user_id' => 'required|exists:users,id',
            'qty' => 'nullable|integer|min:1',
            'target_date' => 'nullable|date',
            'steps' => 'required|array|min:1',
        ]);

        $defaultQty = (int) ($validated['qty'] ?? 1);

        $assignment = ProductionAssignment::create([
            'invoice_item_id' => $validated['invoice_item_id'],
            'user_id' => $validated['user_id'],
            'qty' => $defaultQty,
            'target_date' => $validated['target_date'] ?? null,
            'status' => 'PENDING',
        ]);

        // Ambil snapshot wage/step_name dari invoice_item_production_steps jika ada
        // Ini memastikan SPK menggunakan upah yang berlaku saat invoice dibuat,
        // bukan upah master yang berubah-berpotong retroaktyf.
        $invoiceItemProdSteps = InvoiceItemProductionStep::where('invoice_item_id', $validated['invoice_item_id'])
            ->pluck('wage', 'production_step_id')
            ->toArray();

        foreach ($validated['steps'] as $stepItem) {
            $stepId = is_array($stepItem) ? ($stepItem['id'] ?? null) : $stepItem;
            $stepQty = (is_array($stepItem) && ! empty($stepItem['qty'])) ? (int) $stepItem['qty'] : $defaultQty;

            $productStep = ProductProductionStep::with('productionStep')->find($stepId);
            if ($productStep) {
                // Coba ambil wage dari snapshot invoice dulu
                $snapshotWage = $invoiceItemProdSteps[$productStep->production_step_id] ?? null;
                $stepName = null;

                // Cari step_name yang cocok juga (bisa berdasarkan custom_name atau nama produksi)
                $matchedISS = InvoiceItemProductionStep::where('invoice_item_id', $validated['invoice_item_id'])
                    ->where('production_step_id', $productStep->production_step_id)
                    ->first();
                if ($matchedISS) {
                    $stepName = $matchedISS->step_name;
                }

                ProductionAssignmentStep::create([
                    'production_assignment_id' => $assignment->id,
                    'production_step_id' => $productStep->production_step_id,
                    'step_name' => $stepName ?? ($productStep->custom_name ?? $productStep->productionStep?->name ?? 'Langkah Produksi'),
                    'wage' => $snapshotWage ?? ($productStep->wage ?? $productStep->productionStep?->default_wage ?? 0),
                    'qty' => $stepQty,
                    'status' => 'PENDING',
                ]);
            }
        }

        return response()->json([
            'message' => 'Surat Perintah Kerja (SPK) berhasil dibuat.',
            'data' => $assignment->load(['assignee', 'steps']),
        ]);
    }

    public function toggleStepStatus(Request $request, ProductionAssignmentStep $step): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:PENDING,SELESAI',
        ]);

        $data = ['status' => $validated['status']];
        if ($validated['status'] === 'SELESAI') {
            $data['completed_at'] = now();
        } else {
            $data['completed_at'] = null;
        }

        $step->update($data);

        // Check overall assignment status
        $assignment = $step->assignment;
        $totalSteps = $assignment->steps()->count();
        $completedSteps = $assignment->steps()->where('status', 'SELESAI')->count();

        if ($completedSteps === $totalSteps) {
            $assignment->update(['status' => 'SELESAI']);
        } elseif ($completedSteps > 0) {
            $assignment->update(['status' => 'IN_PROGRESS']);
        } else {
            $assignment->update(['status' => 'PENDING']);
        }

        return response()->json([
            'message' => 'Status langkah produksi diperbarui.',
            'data' => $step,
        ]);
    }

    public function destroy(ProductionAssignment $assignment): JsonResponse
    {
        $assignment->delete();

        return response()->json([
            'message' => 'Surat Perintah Kerja (SPK) berhasil dihapus.',
        ]);
    }

    public function payrollPreviewPage(ProductionAssignment $assignment): Response
    {
        $assignment->load([
            'assignee',
            'invoiceItem.invoice.customer',
            'steps.productionStep',
        ]);

        return Inertia::render('Invoice/PayrollPreview', [
            'invoice' => $assignment->invoiceItem->invoice,
            'assignment' => $assignment,
            'assignmentId' => $assignment->id,
        ]);
    }

    public function printPayrollPDF(ProductionAssignment $assignment)
    {
        $assignment->load([
            'assignee',
            'invoiceItem.invoice.customer',
            'steps.productionStep',
        ]);

        $invoice = $assignment->invoiceItem->invoice;
        $targetAssignment = $assignment;

        $pdf = Pdf::loadView('payroll-pdf', compact('invoice', 'targetAssignment'))
            ->setPaper('a5', 'landscape');

        $fileName = 'Slip-Gaji-'.($assignment->assignee?->name ?? 'Karyawan').'-'.$invoice->invoice_number.'.pdf';

        return $pdf->stream($fileName);
    }
}
