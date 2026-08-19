<?php

namespace App\Http\Controllers;

use App\Models\ProductionAssignment;
use App\Models\ProductionAssignmentStep;
use App\Models\ProductionStep;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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

        $defaultQty = (int)($validated['qty'] ?? 1);

        $assignment = ProductionAssignment::create([
            'invoice_item_id' => $validated['invoice_item_id'],
            'user_id' => $validated['user_id'],
            'qty' => $defaultQty,
            'target_date' => $validated['target_date'] ?? null,
            'status' => 'PENDING',
        ]);

        foreach ($validated['steps'] as $stepItem) {
            $stepId = is_array($stepItem) ? ($stepItem['id'] ?? null) : $stepItem;
            $stepQty = (is_array($stepItem) && !empty($stepItem['qty'])) ? (int)$stepItem['qty'] : $defaultQty;

            $productStep = \App\Models\ProductProductionStep::with('productionStep')->find($stepId);
            if ($productStep) {
                ProductionAssignmentStep::create([
                    'production_assignment_id' => $assignment->id,
                    'production_step_id' => $productStep->production_step_id,
                    'step_name' => $productStep->custom_name ?? $productStep->productionStep?->name ?? 'Langkah Produksi',
                    'wage' => $productStep->wage ?? $productStep->productionStep?->default_wage ?? 0,
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
}
