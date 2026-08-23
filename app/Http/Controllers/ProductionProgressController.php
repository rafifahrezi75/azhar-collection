<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\ProductionAssignment;
use App\Models\ProductionAssignmentStep;
use App\Models\ProductionProgressLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductionProgressController extends Controller
{
    private const DONE = ['completed', 'COMPLETED', 'SELESAI'];

    /**
     * Master table: list invoices that have production assignments,
     * with aggregated progress summary (per invoice, not per step).
     */
    public function index(Request $request)
    {
        $isAdmin = auth()->user()->hasRole('admin');
        $userId = auth()->id();

        $query = Invoice::query()
            ->whereHas('items.productionAssignments')
            ->when(! $isAdmin, fn ($q) => $q->whereHas(
                'items.productionAssignments',
                fn ($q2) => $q2->where('user_id', $userId)
            ));

        // Search
        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('invoice_number', 'like', "%{$s}%")
                    ->orWhere('customer_name', 'like', "%{$s}%");
            });
        }

        // Status filter (computed across all steps of the invoice)
        if ($request->status === 'completed') {
            $query->whereDoesntHave('items.productionAssignments.steps', fn ($q) => $q->whereNotIn('status', self::DONE));
        } elseif ($request->status === 'pending') {
            $query->whereDoesntHave('items.productionAssignments.steps', fn ($q) => $q->whereNotIn('status', ['pending', 'PENDING']));
        } elseif ($request->status === 'in_progress') {
            $query->where(function ($q) {
                $q->whereHas('items.productionAssignments.steps', fn ($s) => $s->whereIn('status', ['in_progress', 'IN_PROGRESS']))
                    ->orWhere(fn ($qq) => $qq
                        ->whereHas('items.productionAssignments.steps', fn ($s) => $s->whereIn('status', self::DONE))
                        ->whereHas('items.productionAssignments.steps', fn ($s) => $s->whereNotIn('status', self::DONE)));
            });
        }

        $perPage = in_array($request->integer('per_page'), [10, 25, 50, 100], true)
            ? $request->integer('per_page')
            : 10;

        $invoices = $query
            ->with([
                'items.productionAssignments' => function ($q) use ($isAdmin, $userId) {
                    if (! $isAdmin) {
                        $q->where('user_id', $userId);
                    }
                    $q->with([
                        'assignee:id,name',
                        'steps:id,production_assignment_id,step_name,qty,status',
                        'steps.progressLogs',
                    ]);
                },
            ])
            ->select('id', 'invoice_number', 'customer_name', 'order_date', 'completion_date')
            ->orderByDesc('order_date')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        $invoices->getCollection()->transform(function ($invoice) {
            $assignments = $invoice->items->flatMap->productionAssignments->values();
            $steps = $assignments->flatMap->steps->values();
            $tailors = $assignments->map->assignee->filter()->unique('id')->values();

            $statuses = $steps->map(fn ($s) => strtolower((string) $s->status))->unique()->values();

            if ($statuses->isEmpty()) {
                $status = 'pending';
            } elseif ($statuses->every(fn ($st) => in_array($st, self::DONE))) {
                $status = 'completed';
            } elseif ($statuses->every(fn ($st) => $st === 'pending')) {
                $status = 'pending';
            } else {
                $status = 'in_progress';
            }

            return [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'customer_name' => $invoice->customer_name,
                'order_date' => $invoice->order_date?->format('Y-m-d'),
                'completion_date' => $invoice->completion_date?->format('Y-m-d'),
                'items_count' => $invoice->items->count(),
                'steps_count' => $steps->count(),
                'tailors' => $tailors->map(fn ($t) => ['id' => $t->id, 'name' => $t->name]),
                'total_qty' => (int) $steps->sum('qty'),
                'done_qty' => (int) $steps->sum(fn ($s) => $s->progressLogs->sum('qty')),
                'status' => $status,
            ];
        });

        return Inertia::render('ProductionProgress/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    /**
     * Detail: single invoice with its items/assignments/steps breakdown,
     * daily calendar of progress logs and chronological history.
     */
    public function show(Request $request, Invoice $invoice)
    {
        [$work, $logs, $calendar, $totals] = $this->buildProgressData($invoice);

        return Inertia::render('ProductionProgress/Show', [
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'customer_name' => $invoice->customer_name,
                'order_date' => $invoice->order_date?->format('Y-m-d'),
                'completion_date' => $invoice->completion_date?->format('Y-m-d'),
            ],
            'work' => $work,
            'history' => $logs,
            'calendar' => $calendar,
            'totals' => $totals,
            'filters' => $request->only(['date']),
        ]);
    }

    /**
     * Standalone form page to record daily progress of an invoice.
     */
    public function input(Request $request, Invoice $invoice)
    {
        [$work, $logs, $calendar] = $this->buildProgressData($invoice);

        return Inertia::render('ProductionProgress/Input', [
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'customer_name' => $invoice->customer_name,
                'order_date' => $invoice->order_date?->format('Y-m-d'),
                'completion_date' => $invoice->completion_date?->format('Y-m-d'),
            ],
            'work' => $work,
            'calendar' => $calendar,
            'history' => $logs,
            'filters' => ['date' => $request->query('date')],
        ]);
    }

    private function buildProgressData(Invoice $invoice): array
    {
        $isAdmin = auth()->user()->hasRole('admin');
        $userId = auth()->id();

        $assignments = ProductionAssignment::query()
            ->whereHas('invoiceItem', fn ($q) => $q->where('invoice_id', $invoice->id))
            ->when(! $isAdmin, fn ($q) => $q->where('user_id', $userId))
            ->with([
                'assignee:id,name',
                'invoiceItem:id,invoice_id,product_id,item_name,qty,unit',
                'invoiceItem.product:id,name',
                'steps:id,production_assignment_id,production_step_id,step_name,qty,status,completed_at',
                'steps.productionStep:id,name',
                'steps.progressLogs' => fn ($q) => $q->orderByDesc('date')->orderByDesc('id'),
                'steps.progressLogs.tailor:id,name',
            ])
            ->get();

        // Non-admin must own at least one assignment on this invoice
        if (! $isAdmin && $assignments->isEmpty()) {
            abort(403);
        }

        // Breakdown per item / assignment / step
        $work = $assignments->map(function ($a) {
            return [
                'id' => $a->id,
                'product' => $a->invoiceItem->product?->name ?? $a->invoiceItem->item_name,
                'item_qty' => (int) $a->invoiceItem->qty,
                'unit' => $a->invoiceItem->unit,
                'qty' => (int) $a->qty,
                'target_date' => $a->target_date?->format('Y-m-d'),
                'status' => $a->status,
                'tailor' => $a->assignee?->only(['id', 'name']),
                'steps' => $a->steps->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->step_name ?: ($s->productionStep?->name ?? '-'),
                    'qty' => (int) $s->qty,
                    'done_qty' => (int) $s->progressLogs->sum('qty'),
                    'status' => $s->status,
                ]),
            ];
        })->values();

        // Flatten all logs of this invoice
        $logs = $assignments
            ->flatMap(fn ($a) => $a->steps->flatMap(fn ($s) => $s->progressLogs->map(fn ($l) => [
                'id' => $l->id,
                'step_id' => $s->id,
                'step_name' => $s->step_name ?: ($s->productionStep?->name ?? '-'),
                'product' => $a->invoiceItem->product?->name ?? $a->invoiceItem->item_name,
                'date' => $l->date->format('Y-m-d'),
                'qty' => (int) $l->qty,
                'notes' => $l->notes,
                'tailor' => $l->tailor?->name,
            ])))
            ->sortBy([['date', 'desc'], ['id', 'desc']])
            ->values();

        // Group by Y-m then day for the calendar (day may hold multiple logs)
        $byMonth = [];
        foreach ($logs->sortBy('date') as $log) {
            $monthKey = substr($log['date'], 0, 7);
            $day = (int) substr($log['date'], 8, 2);
            $byMonth[$monthKey][$day][] = $log;
        }
        ksort($byMonth);

        $allSteps = $assignments->flatMap->steps->values();
        $totalQty = (int) $allSteps->sum('qty');
        $doneQty = (int) $logs->sum('qty');

        $statuses = $allSteps->map(fn ($s) => strtolower((string) $s->status))->unique()->values();
        if ($statuses->isEmpty()) {
            $status = 'pending';
        } elseif ($statuses->every(fn ($st) => in_array($st, self::DONE))) {
            $status = 'completed';
        } elseif ($statuses->every(fn ($st) => $st === 'pending')) {
            $status = 'pending';
        } else {
            $status = 'in_progress';
        }

        return [
            $work,
            $logs,
            $byMonth,
            ['total_qty' => $totalQty, 'done_qty' => $doneQty, 'status' => $status],
        ];
    }

    /**
     * Store a new daily progress log.
     */
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.production_assignment_step_id' => 'required|exists:production_assignment_steps,id',
            'items.*.date' => 'required|date',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $item) {
                $step = ProductionAssignmentStep::with(['assignment', 'progressLogs'])->findOrFail($item['production_assignment_step_id']);

                if (! auth()->user()->hasRole('admin') && $step->assignment->user_id != auth()->id()) {
                    abort(403);
                }

                ProductionProgressLog::create([
                    'production_assignment_step_id' => $step->id,
                    'user_id' => $step->assignment->user_id,
                    'date' => $item['date'],
                    'qty' => $item['qty'],
                    'notes' => $item['notes'] ?? null,
                    'created_by' => auth()->id(),
                ]);

                $totalDone = $step->progressLogs()->sum('qty');
                if ($totalDone >= $step->qty && ! in_array($step->status, self::DONE)) {
                    $step->update(['status' => 'completed', 'completed_at' => now()]);
                    $incomplete = $step->assignment->steps()->whereNotIn('status', self::DONE)->where('id', '!=', $step->id)->count();
                    if ($incomplete === 0) {
                        $step->assignment->update(['status' => 'completed']);
                    }
                } elseif (in_array(strtolower((string) $step->status), ['pending'])) {
                    $step->update(['status' => 'in_progress']);
                    if (in_array(strtolower((string) $step->assignment->status), ['pending'])) {
                        $step->assignment->update(['status' => 'in_progress']);
                    }
                }
            }
        });

        return back()->with('success', 'Progress harian berhasil dicatat.');
    }

    /**
     * Delete a daily progress log (admin only).
     */
    public function destroy(ProductionProgressLog $productionProgressLog)
    {
        if (! auth()->user()->hasRole('admin')) {
            abort(403);
        }

        $step = $productionProgressLog->assignmentStep;
        $productionProgressLog->delete();

        $totalDone = $step->progressLogs()->sum('qty');
        if ($totalDone < $step->qty && in_array(strtolower((string) $step->status), self::DONE)) {
            $step->update(['status' => 'in_progress', 'completed_at' => null]);
            if (in_array(strtolower((string) $step->assignment->status), self::DONE)) {
                $step->assignment->update(['status' => 'in_progress']);
            }
        }

        return back()->with('success', 'Catatan progress berhasil dihapus.');
    }
}
