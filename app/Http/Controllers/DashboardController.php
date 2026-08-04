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

class DashboardController extends Controller
{
    public function page(Request $request)
    {
        $summary = $this->getDashboardSummary();

        return Inertia::render('Dashboard', [
            'initialSummary' => $summary,
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
