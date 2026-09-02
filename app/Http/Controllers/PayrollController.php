<?php

namespace App\Http\Controllers;

use App\Models\ProductionAssignment;
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
        $selectedMonth = (int) $request->query('month', (int) date('n'));
        $selectedYear = (int) $request->query('year', (int) date('Y'));
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
        $activeEmployeesCount = 0;

        foreach ($users as $user) {
            $assignments = ProductionAssignment::with(['invoiceItem.invoice', 'steps'])
                ->where('user_id', $user->id)
                ->whereHas('invoiceItem.invoice', function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('order_date', [$startDate, $endDate])
                        ->orWhereBetween('completion_date', [$startDate, $endDate]);
                })
                ->get();

            if ($assignments->isEmpty()) {
                $assignments = ProductionAssignment::with(['invoiceItem.invoice', 'steps'])
                    ->where('user_id', $user->id)
                    ->get();
            }

            $userTotalWage = 0;
            $userTotalQty = 0;
            $distinctInvoiceIds = [];
            $totalSteps = 0;

            foreach ($assignments as $assignment) {
                if ($assignment->invoiceItem?->invoice_id) {
                    $distinctInvoiceIds[$assignment->invoiceItem->invoice_id] = true;
                }

                foreach ($assignment->steps as $step) {
                    $qty = (int) ($step->qty ?: $assignment->qty ?: 1);
                    $wage = (float) ($step->wage ?: 0);
                    $subtotal = $qty * $wage;

                    $userTotalWage += $subtotal;
                    $userTotalQty += $qty;
                    $totalSteps++;
                }
            }

            if ($userTotalWage > 0 || $assignments->isNotEmpty()) {
                $activeEmployeesCount++;
            }

            $totalPayrollAmount += $userTotalWage;
            $totalQtyProduced += $userTotalQty;

            $payrollList[] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'total_invoices' => count($distinctInvoiceIds),
                'total_assignments' => $assignments->count(),
                'total_steps' => $totalSteps,
                'total_qty' => $userTotalQty,
                'total_wage' => $userTotalWage,
            ];
        }

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
                'total_payroll' => $totalPayrollAmount,
                'total_qty' => $totalQtyProduced,
            ],
        ]);
    }

    public function previewPage(Request $request): InertiaResponse
    {
        $staffUsers = User::whereHas('roles', fn ($q) => $q->where('name', 'staff'))
            ->orWhereHas('productionAssignments')
            ->orderBy('name')
            ->select('id', 'name', 'email')
            ->get();

        if ($staffUsers->isEmpty()) {
            $staffUsers = User::orderBy('name')->select('id', 'name', 'email')->get();
        }

        $selectedUserId = $request->query('user_id');
        if (! $selectedUserId && $staffUsers->isNotEmpty()) {
            $selectedUserId = (string) $staffUsers->first()->id;
        }

        $selectedMonth = (int) $request->query('month', (int) date('n'));
        $selectedYear = (int) $request->query('year', (int) date('Y'));

        return Inertia::render('Payroll/Preview', [
            'users' => $staffUsers,
            'selectedUserId' => (string) $selectedUserId,
            'selectedMonth' => $selectedMonth,
            'selectedYear' => $selectedYear,
        ]);
    }

    public function printPdf(Request $request): Response
    {
        $userId = $request->query('user_id');
        $month = (int) $request->query('month', (int) date('n'));
        $year = (int) $request->query('year', (int) date('Y'));

        $user = $userId ? User::find($userId) : User::first();
        if (! $user) {
            abort(404, 'Karyawan tidak ditemukan');
        }

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth()->format('Y-m-d');
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->format('Y-m-d');

        $assignments = ProductionAssignment::with([
            'invoiceItem.invoice.customer',
            'steps',
        ])
            ->where('user_id', $user->id)
            ->whereHas('invoiceItem.invoice', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('order_date', [$startDate, $endDate])
                    ->orWhereBetween('completion_date', [$startDate, $endDate])
                    ->orWhereNull('order_date');
            })
            ->get();

        if ($assignments->isEmpty()) {
            $assignments = ProductionAssignment::with([
                'invoiceItem.invoice.customer',
                'steps',
            ])
                ->where('user_id', $user->id)
                ->get();
        }

        $payrollItems = [];
        $grandTotalWage = 0;

        foreach ($assignments as $assignment) {
            $invoice = $assignment->invoiceItem?->invoice;
            $invoiceNumber = $invoice?->invoice_number ?? '-';
            $customerName = $invoice?->customer_name ?? ($invoice?->customer?->name ?? '');
            $orderDate = $invoice?->order_date ? date('d/m/Y', strtotime($invoice->order_date)) : '-';
            $itemName = $assignment->invoiceItem?->item_name ?? 'Item Pesanan';
            $unit = $assignment->invoiceItem?->unit ?? 'Pcs';
            $qty = (int) ($assignment->qty ?: 1);

            $stepRateSum = 0;
            foreach ($assignment->steps as $step) {
                $stepRateSum += (float) ($step->wage ?: 0);
            }

            $unitWage = $stepRateSum;
            $subtotal = $qty * $unitWage;
            $grandTotalWage += $subtotal;

            $productLabel = ! empty($customerName) && $customerName !== '-' ? "{$itemName} ({$customerName})" : $itemName;

            $payrollItems[] = [
                'invoice_number' => $invoiceNumber,
                'customer_name' => $customerName,
                'order_date' => $orderDate,
                'item_name' => $itemName,
                'product_label' => $productLabel,
                'qty' => $qty,
                'unit' => $unit,
                'unit_wage' => $unitWage,
                'subtotal' => $subtotal,
            ];
        }

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];
        $periodName = ($monthNames[$month] ?? 'Bulan '.$month).' '.$year;

        $pdf = Pdf::loadView('payroll-pdf', [
            'user' => $user,
            'month' => $month,
            'year' => $year,
            'periodName' => $periodName,
            'payrollItems' => $payrollItems,
            'grandTotalWage' => $grandTotalWage,
        ])->setPaper('a5', 'landscape');

        return $pdf->stream("Slip-Gaji-{$user->name}-{$periodName}.pdf");
    }
}
