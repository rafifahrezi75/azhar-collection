import React, { useEffect, useState, useCallback } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StockActivityChart from "@/Components/Dashboard/StockActivityChart";
import CategoryDonutChart from "@/Components/Dashboard/CategoryDonutChart";
import OrderAnalyticsFilterBar from "@/Components/Dashboard/OrderAnalyticsFilterBar";
import OrderAnalyticsChart from "@/Components/Dashboard/OrderAnalyticsChart";
import CustomerYearlyTrendChart from "@/Components/Dashboard/CustomerYearlyTrendChart";
import {
    Layers, Users, Package, Scale, ArrowDownLeft, ArrowUpRight,
    AlertTriangle, CheckCircle2, RefreshCw, Plus, ChevronRight,
    History, Boxes, BarChart3, PieChart, FileSpreadsheet, Scissors,
    ShoppingBag, Sparkles,
} from "lucide-react";

export default function Dashboard({ initialSummary = null, initialOrderAnalytics = null }) {
    const { auth } = usePage().props;
    const user = auth?.user || null;
    const permissions = auth?.permissions || [];

    // --- State: Stock Summary ---
    const [summary, setSummary] = useState(
        initialSummary || {
            metrics: {
                total_items: 0,
                active_items: 0,
                total_stock_base: 0,
                low_stock_count: 0,
                out_of_stock_count: 0,
                safe_stock_count: 0,
                total_categories: 0,
                total_units: 0,
                total_users: 0,
                total_roles: 0,
                monthly_in_qty: 0,
                monthly_out_qty: 0,
                monthly_transactions_count: 0,
            },
            activity_trend: [],
            category_distribution: [],
            critical_items: [],
            recent_mutations: [],
        }
    );

    // --- State: Order Analytics ---
    const [orderAnalytics, setOrderAnalytics] = useState(
        initialOrderAnalytics || {
            filter: {
                customer_id: "ALL",
                selected_customer: null,
                year: new Date().getFullYear(),
                compare_year: new Date().getFullYear() - 1,
                available_years: [new Date().getFullYear(), new Date().getFullYear() - 1],
                customers_list: [],
            },
            summary_kpi: {
                current_revenue: 0,
                current_paid: 0,
                outstanding_amount: 0,
                current_qty: 0,
                current_invoices: 0,
                compare_revenue: 0,
                compare_qty: 0,
                compare_invoices: 0,
                revenue_growth: 0,
                qty_growth: 0,
                invoice_growth: 0,
                average_order_value: 0,
            },
            monthly_trend: [],
            top_products: [],
            production_statuses: [],
            payment_breakdown: {},
            top_customers: [],
            recent_invoices: [],
        }
    );

    const [selectedCustomer, setSelectedCustomer] = useState(
        initialOrderAnalytics?.filter?.customer_id || "ALL"
    );
    const [selectedYear, setSelectedYear] = useState(
        initialOrderAnalytics?.filter?.year || new Date().getFullYear()
    );
    const [compareYear, setCompareYear] = useState(
        initialOrderAnalytics?.filter?.compare_year || new Date().getFullYear() - 1
    );
    const [isComparing, setIsComparing] = useState(true);
    const [activeMetric, setActiveMetric] = useState("revenue"); // "revenue" | "qty" | "invoices"

    const [loadingSummary, setLoadingSummary] = useState(!initialSummary);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // --- API Calls ---
    const fetchSummary = useCallback(async (isSilent = false) => {
        if (!isSilent) setRefreshing(true);
        try {
            const res = await axios.get("/api/dashboard/summary");
            if (res.data?.data) {
                setSummary(res.data.data);
            }
        } catch (err) {
            console.error("Gagal memuat ringkasan dashboard:", err);
        } finally {
            setLoadingSummary(false);
            setRefreshing(false);
        }
    }, []);

    const fetchOrderAnalytics = useCallback(async (custId, yr, compYr) => {
        setLoadingAnalytics(true);
        try {
            const res = await axios.get("/api/dashboard/order-analytics", {
                params: {
                    customer_id: custId,
                    year: yr,
                    compare_year: compYr,
                },
            });
            if (res.data?.data) {
                setOrderAnalytics(res.data.data);
            }
        } catch (err) {
            console.error("Gagal memuat analitik pesanan:", err);
        } finally {
            setLoadingAnalytics(false);
        }
    }, []);

    const handleRefreshAll = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchSummary(true),
            fetchOrderAnalytics(selectedCustomer, selectedYear, compareYear),
        ]);
        setRefreshing(false);
    };

    const handleCustomerChange = (newCust) => {
        setSelectedCustomer(newCust);
        fetchOrderAnalytics(newCust, selectedYear, compareYear);
    };

    const handleYearChange = (newYear) => {
        setSelectedYear(newYear);
        const autoCompYear = compareYear === newYear ? newYear - 1 : compareYear;
        if (autoCompYear !== compareYear) {
            setCompareYear(autoCompYear);
        }
        fetchOrderAnalytics(selectedCustomer, newYear, autoCompYear);
    };

    const handleCompareYearChange = (newCompYear) => {
        setCompareYear(newCompYear);
        fetchOrderAnalytics(selectedCustomer, selectedYear, newCompYear);
    };

    useEffect(() => {
        if (!initialSummary) {
            fetchSummary(true);
        }
        if (!initialOrderAnalytics) {
            fetchOrderAnalytics(selectedCustomer, selectedYear, compareYear);
        }
    }, [initialSummary, initialOrderAnalytics, fetchSummary, fetchOrderAnalytics, selectedCustomer, selectedYear, compareYear]);

    const metrics = summary.metrics || {};
    const activityTrend = summary.activity_trend || [];
    const categoryDist = summary.category_distribution || [];
    const criticalItems = summary.critical_items || [];
    const recentMutations = summary.recent_mutations || [];

    const orderFilter = orderAnalytics.filter || {};
    const orderKPI = orderAnalytics.summary_kpi || {};
    const monthlyTrend = orderAnalytics.monthly_trend || [];

    return (
        <DashboardLayout>
            <Head title="Ringkasan & Analitik Pesanan - Dashboard" />

            <div className="space-y-6 sm:space-y-8 pb-8">
                {/* ========================================================= */}
                {/* HERO HEADER                                               */}
                {/* ========================================================= */}
                <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-md text-[10px] text-teal-700 font-bold mb-2">
                                <Sparkles className="w-3 h-3" />
                                Azhar Collection
                            </div>
                            <h1 className="text-xl font-bold text-slate-800">
                                Halo, {user?.name || "Admin"}!
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Pantau pesanan, stok, dan performa bisnis Anda hari ini.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleRefreshAll}
                                disabled={refreshing || loadingAnalytics}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 font-semibold border border-slate-200 rounded-md shadow-2xs hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loadingAnalytics ? "animate-spin text-teal-600" : ""}`} />
                                {refreshing || loadingAnalytics ? "Memuat..." : "Refresh"}
                            </button>
                            {permissions.includes("invoice.create") && (
                                <Link
                                    href="/dashboard/invoice/create"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white font-semibold rounded-md shadow-sm hover:bg-teal-700 text-xs transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Invoice Baru
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* SECTION 1: ANALITIK PESANAN                              */}
                {/* ========================================================= */}
                <div className="space-y-4">
                    <OrderAnalyticsFilterBar
                        customers={orderFilter.customers_list || []}
                        selectedCustomer={selectedCustomer}
                        onChangeCustomer={handleCustomerChange}
                        availableYears={orderFilter.available_years || [selectedYear, compareYear]}
                        selectedYear={selectedYear}
                        onChangeYear={handleYearChange}
                        compareYear={compareYear}
                        onChangeCompareYear={handleCompareYearChange}
                        isComparing={isComparing}
                        onToggleComparing={() => setIsComparing((prev) => !prev)}
                        activeMetric={activeMetric}
                        onChangeMetric={(m) => setActiveMetric(m)}
                        loading={loadingAnalytics}
                    />

                    <OrderAnalyticsChart
                        monthlyTrend={monthlyTrend}
                        summaryKPI={orderKPI}
                        selectedYear={selectedYear}
                        compareYear={compareYear}
                        isComparing={isComparing}
                        activeMetric={activeMetric}
                        customerInfo={orderFilter.selected_customer}
                    />
                </div>

                {/* ========================================================= */}
                {/* SECTION 2: TREN PESANAN PER PELANGGAN                    */}
                {/* ========================================================= */}
                <CustomerYearlyTrendChart />

                {/* ========================================================= */}
                {/* SECTION 3: INVENTARIS & STOK BAHAN BAKU                   */}
                {/* ========================================================= */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                <Boxes className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Inventaris Bahan Baku</h2>
                                <p className="text-[11px] text-slate-500">Stok fisik dan pergerakan mutasi</p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/barang"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                        >
                            Katalog
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* 6 Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Bahan</span>
                                <Package className="w-3.5 h-3.5 text-teal-500" />
                            </div>
                            <div className="text-lg font-bold text-slate-800 font-mono">{metrics.total_items || 0}</div>
                            <span className="text-[10px] text-emerald-600 font-semibold">{metrics.active_items || 0} aktif</span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Stok Fisik</span>
                                <Boxes className="w-3.5 h-3.5 text-cyan-500" />
                            </div>
                            <div className="text-lg font-bold text-slate-800 font-mono">{(metrics.total_stock_base || 0).toLocaleString("id-ID")}</div>
                            <span className="text-[10px] text-slate-400 font-semibold">satuan dasar</span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Masuk Bln Ini</span>
                                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <div className="text-lg font-bold text-emerald-600 font-mono">+{(metrics.monthly_in_qty || 0).toLocaleString("id-ID")}</div>
                            <span className="text-[10px] text-slate-400 font-semibold">restock</span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Keluar Bln Ini</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div className="text-lg font-bold text-amber-600 font-mono">-{(metrics.monthly_out_qty || 0).toLocaleString("id-ID")}</div>
                            <span className="text-[10px] text-slate-400 font-semibold">produksi</span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Stok Menipis</span>
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            </div>
                            <div className="text-lg font-bold text-rose-600 font-mono">{metrics.low_stock_count || 0}</div>
                            <span className="text-[10px] text-rose-500 font-semibold">restock segera</span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Klasifikasi</span>
                                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <div className="text-lg font-bold text-slate-800 font-mono">{metrics.total_categories || 0}<span className="text-sm text-slate-400"> / {metrics.total_units || 0}</span></div>
                            <span className="text-[10px] text-slate-400 font-semibold">kategori & satuan</span>
                        </div>
                    </div>

                    {/* Stock Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left: Tren Mutasi 7 Hari (8 Cols) */}
                        <div className="lg:col-span-8 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <BarChart3 className="w-4 h-4 text-teal-600" />
                                <h3 className="text-xs font-bold text-slate-700">Tren Mutasi Stok (7 Hari)</h3>
                            </div>
                            <StockActivityChart data={activityTrend} />
                        </div>

                        {/* Right: Distribusi Kategori (4 Cols) */}
                        <div className="lg:col-span-4 bg-white p-4 rounded-md border border-slate-200 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <PieChart className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-xs font-bold text-slate-700">Komposisi Kategori</h3>
                            </div>
                            <div className="flex-1">
                                <CategoryDonutChart categories={categoryDist} />
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium text-center">
                                {categoryDist.length} kategori terdaftar
                            </div>
                        </div>
                    </div>

                    {/* Stock Table & Critical Alerts */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left: Log Mutasi Terbaru (7 Cols) */}
                        <div className="lg:col-span-7 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <History className="w-4 h-4 text-teal-600" />
                                <h3 className="text-xs font-bold text-slate-700">Mutasi Stok Terkini</h3>
                            </div>

                            {recentMutations.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-400">
                                    Belum ada catatan mutasi stok.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {recentMutations.map((m) => (
                                        <div key={m.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${m.type === "in" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                                                    {m.type === "in" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-semibold text-slate-800 block truncate">{m.item_name}</span>
                                                    <span className="text-[10px] text-slate-400">{m.date} · {m.user_name}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={`font-bold font-mono text-xs ${m.type === "in" ? "text-emerald-600" : "text-amber-600"}`}>
                                                    {m.type === "in" ? "+" : "-"}{m.total_base_quantity} {m.base_unit_symbol}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Critical Low Stock Items (5 Cols) */}
                        <div className="lg:col-span-5 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                <h3 className="text-xs font-bold text-slate-700">Stok Menipis</h3>
                            </div>

                            {criticalItems.length === 0 ? (
                                <div className="py-8 text-center">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                                    <span className="text-xs text-emerald-600 font-semibold">Semua stok aman</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {criticalItems.map((item) => (
                                        <div key={item.id} className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 text-xs">
                                            <div className="min-w-0">
                                                <span className="font-semibold text-slate-800 block truncate">{item.name}</span>
                                                <span className="text-[10px] text-slate-400">Min: {item.min_stock} {item.unit_symbol}</span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="font-bold font-mono text-rose-600 text-xs">{item.stock} {item.unit_symbol}</span>
                                                <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded ml-1">Kritis</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* QUICK NAVIGATION                                          */}
                {/* ========================================================= */}
                <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pintasan Cepat</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        <Link href="/dashboard/invoice" className="p-3 rounded-lg border border-slate-200 hover:bg-teal-50 hover:border-teal-300 transition-all group cursor-pointer">
                            <FileSpreadsheet className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                            <span className="block mt-2 text-xs font-semibold text-slate-800">Invoice</span>
                            <span className="text-[10px] text-slate-400">Transaksi</span>
                        </Link>
                        <Link href="/dashboard/produk" className="p-3 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all group cursor-pointer">
                            <ShoppingBag className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                            <span className="block mt-2 text-xs font-semibold text-slate-800">Produk</span>
                            <span className="text-[10px] text-slate-400">Resep & Ukuran</span>
                        </Link>
                        <Link href="/dashboard/pelanggan" className="p-3 rounded-lg border border-slate-200 hover:bg-cyan-50 hover:border-cyan-300 transition-all group cursor-pointer">
                            <Users className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
                            <span className="block mt-2 text-xs font-semibold text-slate-800">Pelanggan</span>
                            <span className="text-[10px] text-slate-400">Sekolah & Instansi</span>
                        </Link>
                        <Link href="/dashboard/barang" className="p-3 rounded-lg border border-slate-200 hover:bg-teal-50 hover:border-teal-300 transition-all group cursor-pointer">
                            <Package className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                            <span className="block mt-2 text-xs font-semibold text-slate-800">Bahan Baku</span>
                            <span className="text-[10px] text-slate-400">Stok & Mutasi</span>
                        </Link>
                        <Link href="/dashboard/kategori" className="p-3 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all group cursor-pointer">
                            <Layers className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                            <span className="block mt-2 text-xs font-semibold text-slate-800">Kategori</span>
                            <span className="text-[10px] text-slate-400">Klasifikasi</span>
                        </Link>
                        <Link href="/dashboard/satuan" className="p-3 rounded-lg border border-slate-200 hover:bg-purple-50 hover:border-purple-300 transition-all group cursor-pointer">
                            <Scale className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                            <span className="block mt-2 text-xs font-semibold text-slate-800">Satuan</span>
                            <span className="text-[10px] text-slate-400">Konversi</span>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
