<?php

namespace App\Http\Controllers;

use App\Models\ProductionAssignment;
use App\Models\ProductionAssignmentStep;
use App\Models\ProductionProgressLog;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PayrollController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $rawMonth = $request->query('month');
        $rawYear = $request->query('year');
        $selectedMonth = ($rawMonth !== null && $rawMonth !== '' && (int) $rawMonth >= 1 && (int) $rawMonth <= 12)
            ? (int) $rawMonth
            : (int) date('n');
        $selectedYear = ($rawYear !== null && $rawYear !== '' && (int) $rawYear >= 2000)
            ? (int) $rawYear
            : (int) date('Y');
        $search = trim((string) $request->query('search', ''));

        $startDate = Carbon::createFromDate($selectedYear, $selectedMonth, 1)->startOfMonth()->format('Y-m-d');
        $endDate = Carbon::createFromDate($selectedYear, $selectedMonth, 1)->endOfMonth()->format('Y-m-d');

        $usersQuery = User::where(function ($q) {
            $q->whereHas('roles', fn ($rq) => $rq->where('name', 'staff'))
                ->orWhereHas('productionAssignments');
        });

        if ($search !== '') {
            $usersQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $usersQuery->orderBy('name')->get();

        if ($users->isEmpty() && $search === '') {
            $users = User::orderBy('name')->get();
        }

        $payrollList = [];
        $totalPayrollAmount = 0;
        $totalQtyProduced = 0;
        $totalCutPieces = 0;
        $totalSewnPieces = 0;
        $activeEmployeesCount = 0;

        foreach ($users as $user) {
            $periodAssignments = ProductionAssignment::where('user_id', $user->id)
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('target_date', [$startDate, $endDate])
                        ->orWhereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
                })
                ->get();

            $distinctAssignmentIds = [];
            $distinctInvoiceIds = [];
            foreach ($periodAssignments as $pa) {
                $distinctAssignmentIds[$pa->id] = true;
                if ($pa->invoiceItem?->invoice_id) {
                    $distinctInvoiceIds[$pa->invoiceItem->invoice_id] = true;
                }
            }

            $logs = ProductionProgressLog::with(['assignmentStep.assignment.invoiceItem.invoice'])
                ->where('user_id', $user->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->get();

            $completedStepsWithoutLogs = ProductionAssignmentStep::with(['assignment.invoiceItem.invoice'])
                ->whereHas('assignment', fn ($q) => $q->where('user_id', $user->id))
                ->whereDoesntHave('progressLogs')
                ->whereIn('status', ['completed', 'COMPLETED', 'SELESAI'])
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('completed_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                        ->orWhere(function ($q2) use ($startDate, $endDate) {
                            $q2->whereNull('completed_at')
                                ->whereHas('assignment', function ($aq) use ($startDate, $endDate) {
                                    $aq->whereBetween('target_date', [$startDate, $endDate])
                                        ->orWhereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
                                });
                        });
                })
                ->get();

            $userTotalWage = 0;
            $userTotalQty = 0;
            $userCuttingPieces = 0;
            $userSewingPieces = 0;
            $userStepsBreakdown = [];
            $totalSteps = 0;

            foreach ($logs as $log) {
                $step = $log->assignmentStep;
                if (! $step) {
                    continue;
                }

                $qty = (int) $log->qty;
                $wage = (float) ($step->wage ?: 0);
                $subtotal = $qty * $wage;

                $userTotalWage += $subtotal;
                $userTotalQty += $qty;
                $totalSteps++;

                $invId = $step->assignment?->invoiceItem?->invoice_id;
                if ($invId) {
                    $distinctInvoiceIds[$invId] = true;
                }
                if ($step->production_assignment_id) {
                    $distinctAssignmentIds[$step->production_assignment_id] = true;
                }

                $stepName = $step->step_name ?: 'Pengerjaan';
                $userStepsBreakdown[$stepName] = ($userStepsBreakdown[$stepName] ?? 0) + $qty;

                $stepNameLower = strtolower($stepName);
                if (str_contains($stepNameLower, 'potong') || str_contains($stepNameLower, 'cutting')) {
                    $userCuttingPieces += $qty;
                } elseif (str_contains($stepNameLower, 'jahit') || str_contains($stepNameLower, 'sew')) {
                    $userSewingPieces += $qty;
                }
            }

            foreach ($completedStepsWithoutLogs as $step) {
                $assignment = $step->assignment;
                $qty = (int) ($step->qty ?: $assignment?->qty ?: 1);
                $wage = (float) ($step->wage ?: 0);
                $subtotal = $qty * $wage;

                $userTotalWage += $subtotal;
                $userTotalQty += $qty;
                $totalSteps++;

                $invId = $assignment?->invoiceItem?->invoice_id;
                if ($invId) {
                    $distinctInvoiceIds[$invId] = true;
                }
                if ($assignment?->id) {
                    $distinctAssignmentIds[$assignment->id] = true;
                }

                $stepName = $step->step_name ?: 'Pengerjaan';
                $userStepsBreakdown[$stepName] = ($userStepsBreakdown[$stepName] ?? 0) + $qty;

                $stepNameLower = strtolower($stepName);
                if (str_contains($stepNameLower, 'potong') || str_contains($stepNameLower, 'cutting')) {
                    $userCuttingPieces += $qty;
                } elseif (str_contains($stepNameLower, 'jahit') || str_contains($stepNameLower, 'sew')) {
                    $userSewingPieces += $qty;
                }
            }

            if ($userTotalWage > 0 || count($distinctAssignmentIds) > 0) {
                $activeEmployeesCount++;

                $totalPayrollAmount += $userTotalWage;
                $totalQtyProduced += $userTotalQty;
                $totalCutPieces += $userCuttingPieces;
                $totalSewnPieces += $userSewingPieces;

                $stepsList = [];
                foreach ($userStepsBreakdown as $name => $q) {
                    $stepsList[] = [
                        'name' => $name,
                        'qty' => $q,
                    ];
                }

                $payrollList[] = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'total_invoices' => count($distinctInvoiceIds),
                    'total_assignments' => count($distinctAssignmentIds),
                    'total_tasks' => count($distinctAssignmentIds),
                    'cutting_pieces' => $userCuttingPieces,
                    'sewing_pieces' => $userSewingPieces,
                    'total_steps' => $totalSteps,
                    'total_qty' => $userTotalQty,
                    'step_breakdown' => $stepsList,
                    'total_wage' => $userTotalWage,
                    'status' => $userTotalWage > 0 ? 'completed' : 'pending',
                ];
            }
        }

        $totalAllTasks = array_sum(array_column($payrollList, 'total_tasks'));

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        return Inertia::render('Payroll/Index', [
            'payrolls' => $payrollList,
            'filters' => [
                'search' => $search,
                'month' => $selectedMonth,
                'year' => $selectedYear,
            ],
            'periodName' => ($monthNames[$selectedMonth] ?? 'Bulan '.$selectedMonth).' '.$selectedYear,
            'stats' => [
                'total_employees' => $activeEmployeesCount,
                'total_cut_pieces' => $totalCutPieces,
                'total_sewn_pieces' => $totalSewnPieces,
                'total_payroll_amount' => $totalPayrollAmount,
                'total_payroll' => $totalPayrollAmount,
                'total_qty' => $totalQtyProduced,
                'total_tasks' => $totalAllTasks,
            ],
        ]);
    }

    public function previewPage(Request $request, $user = null): InertiaResponse
    {
        $staffUsers = User::whereHas('roles', fn ($q) => $q->where('name', 'staff'))
            ->orWhereHas('productionAssignments')
            ->orderBy('name')
            ->select('id', 'name', 'email')
            ->get();

        if ($staffUsers->isEmpty()) {
            $staffUsers = User::orderBy('name')->select('id', 'name', 'email')->get();
        }

        $selectedUserId = $user instanceof User ? $user->id : ($user ?? $request->query('user_id'));
        if (! $selectedUserId && $staffUsers->isNotEmpty()) {
            $selectedUserId = (string) $staffUsers->first()->id;
        }

        $rawMonth = $request->query('month');
        $rawYear = $request->query('year');
        $selectedMonth = ($rawMonth !== null && $rawMonth !== '' && (int) $rawMonth >= 1 && (int) $rawMonth <= 12)
            ? (int) $rawMonth
            : (int) date('n');
        $selectedYear = ($rawYear !== null && $rawYear !== '' && (int) $rawYear >= 2000)
            ? (int) $rawYear
            : (int) date('Y');

        return Inertia::render('Payroll/Preview', [
            'users' => $staffUsers,
            'selectedUserId' => (string) $selectedUserId,
            'selectedMonth' => $selectedMonth,
            'selectedYear' => $selectedYear,
        ]);
    }

    public function printPdf(Request $request, $user = null): Response
    {
        $userId = $user instanceof User ? $user->id : ($user ?? $request->query('user_id'));
        $rawMonth = $request->query('month');
        $rawYear = $request->query('year');
        $month = ($rawMonth !== null && $rawMonth !== '' && (int) $rawMonth >= 1 && (int) $rawMonth <= 12)
            ? (int) $rawMonth
            : (int) date('n');
        $year = ($rawYear !== null && $rawYear !== '' && (int) $rawYear >= 2000)
            ? (int) $rawYear
            : (int) date('Y');

        $targetUser = $userId ? User::find($userId) : User::first();
        if (! $targetUser) {
            abort(404, 'Karyawan tidak ditemukan');
        }

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth()->format('Y-m-d');
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->format('Y-m-d');

        $logs = ProductionProgressLog::with(['assignmentStep.assignment.invoiceItem.invoice.customer'])
            ->where('user_id', $targetUser->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $completedStepsWithoutLogs = ProductionAssignmentStep::with(['assignment.invoiceItem.invoice.customer'])
            ->whereHas('assignment', fn ($q) => $q->where('user_id', $targetUser->id))
            ->whereDoesntHave('progressLogs')
            ->whereIn('status', ['completed', 'COMPLETED', 'SELESAI'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('completed_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                    ->orWhere(function ($q2) use ($startDate, $endDate) {
                        $q2->whereNull('completed_at')
                            ->whereHas('assignment', function ($aq) use ($startDate, $endDate) {
                                $aq->whereBetween('target_date', [$startDate, $endDate])
                                    ->orWhereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
                            });
                    });
            })
            ->get();

        $itemsByItem = [];

        foreach ($logs as $log) {
            $step = $log->assignmentStep;
            if (! $step || ! $step->assignment) {
                continue;
            }
            $assignment = $step->assignment;
            $itemKey = $assignment->invoice_item_id ?: $assignment->id;
            $stepId = $step->id;
            $qty = (int) $log->qty;
            $wage = (float) ($step->wage ?: 0);
            $subtotal = $qty * $wage;

            if (! isset($itemsByItem[$itemKey])) {
                $inv = $assignment->invoiceItem?->invoice;
                $custName = $inv?->customer_name ?? ($inv?->customer?->name ?? '');
                $itemName = $assignment->invoiceItem?->item_name ?? 'Item Pesanan';
                $label = ! empty($custName) && $custName !== '-' ? "{$itemName} ({$custName})" : $itemName;

                $itemsByItem[$itemKey] = [
                    'invoice_number' => $inv?->invoice_number ?? '-',
                    'customer_name' => $custName,
                    'order_date' => $inv?->order_date ? date('d/m/Y', strtotime($inv->order_date)) : '-',
                    'item_name' => $itemName,
                    'product_label' => $label,
                    'unit' => $assignment->invoiceItem?->unit ?? 'Pcs',
                    'steps_qty' => [],
                    'subtotal' => 0,
                ];
            }

            $itemsByItem[$itemKey]['steps_qty'][$stepId] = ($itemsByItem[$itemKey]['steps_qty'][$stepId] ?? 0) + $qty;
            $itemsByItem[$itemKey]['subtotal'] += $subtotal;
        }

        foreach ($completedStepsWithoutLogs as $step) {
            if (! $step->assignment) {
                continue;
            }
            $assignment = $step->assignment;
            $itemKey = $assignment->invoice_item_id ?: $assignment->id;
            $stepId = $step->id;
            $qty = (int) ($step->qty ?: $assignment->qty ?: 1);
            $wage = (float) ($step->wage ?: 0);
            $subtotal = $qty * $wage;

            if (! isset($itemsByItem[$itemKey])) {
                $inv = $assignment->invoiceItem?->invoice;
                $custName = $inv?->customer_name ?? ($inv?->customer?->name ?? '');
                $itemName = $assignment->invoiceItem?->item_name ?? 'Item Pesanan';
                $label = ! empty($custName) && $custName !== '-' ? "{$itemName} ({$custName})" : $itemName;

                $itemsByItem[$itemKey] = [
                    'invoice_number' => $inv?->invoice_number ?? '-',
                    'customer_name' => $custName,
                    'order_date' => $inv?->order_date ? date('d/m/Y', strtotime($inv->order_date)) : '-',
                    'item_name' => $itemName,
                    'product_label' => $label,
                    'unit' => $assignment->invoiceItem?->unit ?? 'Pcs',
                    'steps_qty' => [],
                    'subtotal' => 0,
                ];
            }

            $itemsByItem[$itemKey]['steps_qty'][$stepId] = ($itemsByItem[$itemKey]['steps_qty'][$stepId] ?? 0) + $qty;
            $itemsByItem[$itemKey]['subtotal'] += $subtotal;
        }

        $payrollItems = [];
        foreach ($itemsByItem as $item) {
            $maxQty = ! empty($item['steps_qty']) ? max($item['steps_qty']) : 0;
            $itemQty = $maxQty > 0 ? $maxQty : 1;
            $subtotal = (float) $item['subtotal'];
            $unitWage = $itemQty > 0 ? ($subtotal / $itemQty) : 0;

            $payrollItems[] = [
                'invoice_number' => $item['invoice_number'],
                'customer_name' => $item['customer_name'],
                'order_date' => $item['order_date'],
                'item_name' => $item['item_name'],
                'product_label' => $item['product_label'],
                'qty' => $itemQty,
                'unit' => $item['unit'],
                'unit_wage' => $unitWage,
                'subtotal' => $subtotal,
            ];
        }

        $grandTotalWage = (float) array_sum(array_column($payrollItems, 'subtotal'));

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];
        $periodName = ($monthNames[$month] ?? 'Bulan '.$month).' '.$year;

        $pdf = Pdf::loadView('payroll-pdf', [
            'user' => $targetUser,
            'month' => $month,
            'year' => $year,
            'periodName' => $periodName,
            'payrollItems' => $payrollItems,
            'grandTotalWage' => $grandTotalWage,
        ])->setPaper('a5', 'landscape');

        return $pdf->stream("Slip-Gaji-{$targetUser->name}-{$periodName}.pdf");
    }
}
