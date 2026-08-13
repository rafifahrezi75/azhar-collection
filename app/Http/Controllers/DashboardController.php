<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Models\Role;
use App\Models\StockMutation;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;

class DashboardController extends Controller
{
    public function page(Request $request)
    {
        $summary = $this->getDashboardSummary();
        $year = (int) ($request->get('year', Carbon::now()->year));
        $compareYear = (int) ($request->get('compare_year', $year - 1));
        $customerId = $request->get('customer_id', 'ALL');

        $orderAnalytics = $this->getOrderAnalyticsData($customerId, $year, $compareYear);

        return Inertia::render('Dashboard', [
            'initialSummary' => $summary,
            'initialOrderAnalytics' => $orderAnalytics,
        ]);
    }

    public function summaryApi(Request $request)
    {
        $summary = $this->getDashboardSummary();

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }

    public function orderAnalyticsApi(Request $request)
    {
        $year = (int) ($request->get('year', Carbon::now()->year));
        $compareYear = (int) ($request->get('compare_year', $year - 1));
        $customerId = $request->get('customer_id', 'ALL');

        $data = $this->getOrderAnalyticsData($customerId, $year, $compareYear);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function getOrderAnalyticsData($customerId = 'ALL', $year = null, $compareYear = null): array
    {
        $currentYear = (int) ($year ?: Carbon::now()->year);
        $previousYear = (int) ($compareYear ?: $currentYear - 1);

        // 1. Available Years
        $dbYears = Invoice::whereNotNull('order_date')
            ->selectRaw('YEAR(order_date) as yr')
            ->distinct()
            ->orderBy('yr', 'desc')
            ->pluck('yr')
            ->toArray();
        $availableYears = array_values(array_unique(array_merge($dbYears, [(int) Carbon::now()->year, (int) Carbon::now()->year - 1])));
        rsort($availableYears);

        // 2. Customers List for Dropdown
        $customers = Customer::select('id', 'name', 'code', 'institution_name')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'code' => $c->code,
                    'institution_name' => $c->institution_name,
                    'display_label' => $c->name . ($c->institution_name ? " ({$c->institution_name})" : ''),
                ];
            });

        $selectedCustomer = null;
        if ($customerId && $customerId !== 'ALL') {
            $cust = Customer::find($customerId);
            if ($cust) {
                $selectedCustomer = [
                    'id' => $cust->id,
                    'name' => $cust->name,
                    'code' => $cust->code,
                    'institution_name' => $cust->institution_name,
                    'phone' => $cust->phone,
                    'address' => $cust->address,
                ];
            }
        }

        // 3. Query Invoices for Current Year and Comparison Year
        $queryCurrent = Invoice::whereYear('order_date', $currentYear)->with(['items.product.images', 'customer']);
        if ($customerId && $customerId !== 'ALL') {
            $queryCurrent->where('customer_id', $customerId);
        }
        $invoicesCurrent = $queryCurrent->get();

        $queryCompare = Invoice::whereYear('order_date', $previousYear)->with('items');
        if ($customerId && $customerId !== 'ALL') {
            $queryCompare->where('customer_id', $customerId);
        }
        $invoicesCompare = $queryCompare->get();

        // 4. Monthly Breakdown (1..12)
        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agu',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
        ];
        $monthFullNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        $monthlyData = [];
        $totalCurrentRevenue = 0;
        $totalCurrentQty = 0;
        $totalCurrentInvoices = 0;
        $totalCurrentPaid = 0;

        $totalCompareRevenue = 0;
        $totalCompareQty = 0;
        $totalCompareInvoices = 0;

        for ($m = 1; $m <= 12; $m++) {
            $curMonthInvoices = $invoicesCurrent->filter(function ($inv) use ($m) {
                return $inv->order_date && Carbon::parse($inv->order_date)->month === $m;
            });

            $compMonthInvoices = $invoicesCompare->filter(function ($inv) use ($m) {
                return $inv->order_date && Carbon::parse($inv->order_date)->month === $m;
            });

            $curRevenue = (float) $curMonthInvoices->sum('total_amount');
            $curPaid = (float) $curMonthInvoices->sum('paid_amount');
            $curInvoiceCount = $curMonthInvoices->count();
            $curQty = (int) $curMonthInvoices->reduce(function ($carry, $inv) {
                return $carry + $inv->items->sum('qty');
            }, 0);

            $compRevenue = (float) $compMonthInvoices->sum('total_amount');
            $compInvoiceCount = $compMonthInvoices->count();
            $compQty = (int) $compMonthInvoices->reduce(function ($carry, $inv) {
                return $carry + $inv->items->sum('qty');
            }, 0);

            $paidInvoices = $curMonthInvoices->where('payment_status', 'lunas')->count();
            $dpInvoices = $curMonthInvoices->where('payment_status', 'dp')->count();
            $unpaidInvoices = $curMonthInvoices->where('payment_status', 'belum_bayar')->count();

            $monthlyData[] = [
                'month' => $m,
                'label' => $monthNames[$m],
                'full_label' => $monthFullNames[$m] . ' ' . $currentYear,
                'current_revenue' => $curRevenue,
                'current_paid' => $curPaid,
                'current_qty' => $curQty,
                'current_invoices' => $curInvoiceCount,
                'compare_revenue' => $compRevenue,
                'compare_qty' => $compQty,
                'compare_invoices' => $compInvoiceCount,
                'paid_count' => $paidInvoices,
                'dp_count' => $dpInvoices,
                'unpaid_count' => $unpaidInvoices,
            ];

            $totalCurrentRevenue += $curRevenue;
            $totalCurrentQty += $curQty;
            $totalCurrentInvoices += $curInvoiceCount;
            $totalCurrentPaid += $curPaid;

            $totalCompareRevenue += $compRevenue;
            $totalCompareQty += $compQty;
            $totalCompareInvoices += $compInvoiceCount;
        }

        // 5. Growth Percentages
        $revenueGrowth = $totalCompareRevenue > 0
            ? round((($totalCurrentRevenue - $totalCompareRevenue) / $totalCompareRevenue) * 100, 1)
            : ($totalCurrentRevenue > 0 ? 100 : 0);

        $qtyGrowth = $totalCompareQty > 0
            ? round((($totalCurrentQty - $totalCompareQty) / $totalCompareQty) * 100, 1)
            : ($totalCurrentQty > 0 ? 100 : 0);

        $invoiceGrowth = $totalCompareInvoices > 0
            ? round((($totalCurrentInvoices - $totalCompareInvoices) / $totalCompareInvoices) * 100, 1)
            : ($totalCurrentInvoices > 0 ? 100 : 0);

        $avgOrderValue = $totalCurrentInvoices > 0 ? round($totalCurrentRevenue / $totalCurrentInvoices) : 0;
        $outstandingAmount = max(0, $totalCurrentRevenue - $totalCurrentPaid);

        // 6. Top 5 Products
        $allItems = $invoicesCurrent->flatMap->items;
        $topProducts = $allItems->groupBy(function ($item) {
            return $item->product_id ? 'prod_' . $item->product_id : 'name_' . ($item->item_name ?: 'Custom');
        })->map(function ($group) use ($totalCurrentRevenue) {
            $first = $group->first();
            $totalQty = (int) $group->sum('qty');
            $totalSubtotal = (float) $group->sum('subtotal');
            $product = $first->product;

            return [
                'product_id' => $first->product_id,
                'name' => $product ? $product->name : ($first->item_name ?: 'Item Custom'),
                'code' => $product ? $product->code : '-',
                'category_name' => $product && is_string($product->category) ? $product->category : ($product && $product->category ? ($product->category->name ?? '-') : '-'),
                'image_url' => $product ? $product->primary_image_url : null,
                'total_qty' => $totalQty,
                'total_revenue' => $totalSubtotal,
                'revenue_percentage' => $totalCurrentRevenue > 0 ? round(($totalSubtotal / $totalCurrentRevenue) * 100, 1) : 0,
            ];
        })->sortByDesc('total_qty')->take(5)->values()->all();

        // 7. Production Status Breakdown
        $prodStatuses = [
            'pending' => ['key' => 'pending', 'label' => 'Pending / Antrian', 'color' => '#64748b', 'count' => 0],
            'potong' => ['key' => 'potong', 'label' => 'Proses Potong', 'color' => '#0284c7', 'count' => 0],
            'jahit' => ['key' => 'jahit', 'label' => 'Proses Jahit', 'color' => '#f59e0b', 'count' => 0],
            'qc' => ['key' => 'qc', 'label' => 'QC & Finishing', 'color' => '#8b5cf6', 'count' => 0],
            'selesai' => ['key' => 'selesai', 'label' => 'Selesai Jahit', 'color' => '#10b981', 'count' => 0],
            'dikirim' => ['key' => 'dikirim', 'label' => 'Dikirim / Diambil', 'color' => '#0d9488', 'count' => 0],
        ];
        foreach ($invoicesCurrent as $inv) {
            $st = $inv->production_status ?: 'pending';
            if (isset($prodStatuses[$st])) {
                $prodStatuses[$st]['count']++;
            }
        }

        // 8. Payment Status Breakdown
        $paymentBreakdown = [
            'lunas' => [
                'label' => 'Lunas',
                'count' => $invoicesCurrent->where('payment_status', 'lunas')->count(),
                'total' => (float) $invoicesCurrent->where('payment_status', 'lunas')->sum('total_amount'),
                'color' => '#10b981'
            ],
            'dp' => [
                'label' => 'DP / Cicilan',
                'count' => $invoicesCurrent->where('payment_status', 'dp')->count(),
                'total' => (float) $invoicesCurrent->where('payment_status', 'dp')->sum('total_amount'),
                'color' => '#f59e0b'
            ],
            'belum_bayar' => [
                'label' => 'Belum Bayar',
                'count' => $invoicesCurrent->where('payment_status', 'belum_bayar')->count(),
                'total' => (float) $invoicesCurrent->where('payment_status', 'belum_bayar')->sum('total_amount'),
                'color' => '#f43f5e'
            ],
        ];

        // 9. Top Customers (If customer_id === ALL)
        $topCustomers = [];
        if (!$customerId || $customerId === 'ALL') {
            $topCustomers = $invoicesCurrent->groupBy('customer_id')->map(function ($group) use ($totalCurrentRevenue) {
                $first = $group->first();
                $cust = $first->customer;
                $custName = $cust ? $cust->name : ($first->customer_name ?: 'Pelanggan Umum');
                $instName = $cust ? $cust->institution_name : '-';
                $subtotalSum = (float) $group->sum('total_amount');
                $qtySum = (int) $group->reduce(function ($carry, $inv) {
                    return $carry + $inv->items->sum('qty');
                }, 0);

                return [
                    'customer_id' => $first->customer_id,
                    'name' => $custName,
                    'institution_name' => $instName,
                    'invoices_count' => $group->count(),
                    'total_qty' => $qtySum,
                    'total_revenue' => $subtotalSum,
                    'revenue_percentage' => $totalCurrentRevenue > 0 ? round(($subtotalSum / $totalCurrentRevenue) * 100, 1) : 0,
                ];
            })->sortByDesc('total_revenue')->take(5)->values()->all();
        }

        // 10. Recent Invoices
        $recentInvoices = $invoicesCurrent->sortByDesc('order_date')->take(6)->map(function ($inv) {
            return [
                'id' => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'customer_name' => $inv->customer ? $inv->customer->name : ($inv->customer_name ?: 'Umum'),
                'order_date' => $inv->order_date ? Carbon::parse($inv->order_date)->format('d M Y') : '-',
                'total_amount' => (float) $inv->total_amount,
                'paid_amount' => (float) $inv->paid_amount,
                'payment_status' => $inv->payment_status,
                'production_status' => $inv->production_status,
                'total_qty' => (int) $inv->items->sum('qty'),
            ];
        })->values()->all();

        return [
            'filter' => [
                'customer_id' => $customerId,
                'selected_customer' => $selectedCustomer,
                'year' => $currentYear,
                'compare_year' => $previousYear,
                'available_years' => $availableYears,
                'customers_list' => $customers,
            ],
            'summary_kpi' => [
                'current_revenue' => $totalCurrentRevenue,
                'current_paid' => $totalCurrentPaid,
                'outstanding_amount' => $outstandingAmount,
                'current_qty' => $totalCurrentQty,
                'current_invoices' => $totalCurrentInvoices,
                'compare_revenue' => $totalCompareRevenue,
                'compare_qty' => $totalCompareQty,
                'compare_invoices' => $totalCompareInvoices,
                'revenue_growth' => $revenueGrowth,
                'qty_growth' => $qtyGrowth,
                'invoice_growth' => $invoiceGrowth,
                'average_order_value' => $avgOrderValue,
            ],
            'monthly_trend' => $monthlyData,
            'top_products' => $topProducts,
            'production_statuses' => array_values($prodStatuses),
            'payment_breakdown' => $paymentBreakdown,
            'top_customers' => $topCustomers,
            'recent_invoices' => $recentInvoices,
        ];
    }

    private function getDashboardSummary(): array
    {
        // 1. Basic Counts
        $totalItems = Item::count();
        $activeItems = Item::where('is_active', true)->count();
        $totalStockBase = (int) Item::sum('stock');
        
        $lowStockItems = Item::whereRaw('stock <= min_stock')
            ->where('is_active', true)
            ->with(['unit', 'category'])
            ->orderBy('stock', 'asc')
            ->get();
        $lowStockCount = $lowStockItems->count();
        $outOfStockCount = Item::where('stock', '<=', 0)->count();
        $safeStockCount = max(0, $totalItems - $lowStockCount);

        $totalCategories = Category::count();
        $totalUnits = Unit::count();
        $totalUsers = User::count();
        $totalRoles = Role::count();

        // 2. Monthly In / Out Totals (Current Month)
        $startOfMonth = Carbon::now()->startOfMonth();
        $monthlyInQty = (int) StockMutation::where('type', 'in')
            ->where('mutation_date', '>=', $startOfMonth)
            ->sum('total_base_quantity');

        $monthlyOutQty = (int) StockMutation::where('type', 'out')
            ->where('mutation_date', '>=', $startOfMonth)
            ->sum('total_base_quantity');

        $monthlyTransactionsCount = StockMutation::where('mutation_date', '>=', $startOfMonth)->count();

        // 3. Activity Trend (Last 7 Days)
        $trendDays = 7;
        $activityTrend = [];
        for ($i = $trendDays - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $dayLabel = $date->translatedFormat('D, d M');

            $inSum = (int) StockMutation::where('type', 'in')
                ->whereDate('mutation_date', $dateStr)
                ->sum('total_base_quantity');

            $outSum = (int) StockMutation::where('type', 'out')
                ->whereDate('mutation_date', $dateStr)
                ->sum('total_base_quantity');

            $count = StockMutation::whereDate('mutation_date', $dateStr)->count();

            $activityTrend[] = [
                'date' => $dateStr,
                'label' => $dayLabel,
                'short_label' => $date->format('d/m'),
                'day_name' => $date->translatedFormat('l'),
                'in_qty' => $inSum,
                'out_qty' => $outSum,
                'total_mutations' => $count,
            ];
        }

        // 4. Category Breakdown & Stock Distribution
        $palette = ['#0d9488', '#0284c7', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
        $categoriesData = Category::withCount('items')
            ->with(['items' => function ($q) {
                $q->select('id', 'category_id', 'stock');
            }])
            ->get()
            ->map(function ($cat, $index) use ($palette, $totalItems) {
                $stockSum = $cat->items->sum('stock');
                $itemPercentage = $totalItems > 0 ? round(($cat->items_count / $totalItems) * 100, 1) : 0;
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'items_count' => $cat->items_count,
                    'total_stock' => $stockSum,
                    'percentage' => $itemPercentage,
                    'color' => $palette[$index % count($palette)],
                ];
            })
            ->sortByDesc('items_count')
            ->values()
            ->all();

        // 5. Critical Stock Items (Need Restock)
        $criticalItems = $lowStockItems->take(5)->map(function ($item) {
            $ratio = $item->min_stock > 0 ? min(100, round(($item->stock / $item->min_stock) * 100)) : 0;
            return [
                'id' => $item->id,
                'code' => $item->code,
                'name' => $item->name,
                'stock' => $item->stock,
                'min_stock' => $item->min_stock,
                'unit_symbol' => $item->unit ? ($item->unit->symbol ?: $item->unit->name) : 'pcs',
                'category_name' => $item->category ? $item->category->name : '-',
                'image_url' => $item->image_url,
                'health_ratio' => $ratio,
                'is_out_of_stock' => $item->stock <= 0,
            ];
        })->values()->all();

        // 6. Recent Mutations (Latest 6)
        $recentMutations = StockMutation::with(['item.unit', 'user', 'unit'])
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'type' => $m->type,
                    'quantity' => $m->quantity,
                    'unit_symbol' => $m->unit ? ($m->unit->symbol ?: $m->unit->name) : ($m->item && $m->item->unit ? ($m->item->unit->symbol ?: $m->item->unit->name) : 'pcs'),
                    'total_base_quantity' => $m->total_base_quantity,
                    'base_unit_symbol' => $m->item && $m->item->unit ? ($m->item->unit->symbol ?: $m->item->unit->name) : 'pcs',
                    'item_id' => $m->item_id,
                    'item_name' => $m->item ? $m->item->name : 'Item Dihapus',
                    'item_code' => $m->item ? $m->item->code : '-',
                    'item_image' => $m->item ? $m->item->image_url : null,
                    'notes' => $m->notes,
                    'reference_no' => $m->reference_no,
                    'user_name' => $m->user ? $m->user->name : 'Sistem',
                    'date' => $m->mutation_date ? $m->mutation_date->format('d M Y, H:i') : $m->created_at->format('d M Y, H:i'),
                    'time_ago' => $m->created_at->diffForHumans(),
                ];
            });

        return [
            'metrics' => [
                'total_items' => $totalItems,
                'active_items' => $activeItems,
                'total_stock_base' => $totalStockBase,
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
                'safe_stock_count' => $safeStockCount,
                'total_categories' => $totalCategories,
                'total_units' => $totalUnits,
                'total_users' => $totalUsers,
                'total_roles' => $totalRoles,
                'monthly_in_qty' => $monthlyInQty,
                'monthly_out_qty' => $monthlyOutQty,
                'monthly_transactions_count' => $monthlyTransactionsCount,
            ],
            'activity_trend' => $activityTrend,
            'category_distribution' => $categoriesData,
            'critical_items' => $criticalItems,
            'recent_mutations' => $recentMutations,
        ];
    }
}
