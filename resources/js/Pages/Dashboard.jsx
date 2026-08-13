import React, { useEffect, useState, useCallback } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StockActivityChart from "@/Components/Dashboard/StockActivityChart";
import CategoryDonutChart from "@/Components/Dashboard/CategoryDonutChart";
import OrderAnalyticsFilterBar from "@/Components/Dashboard/OrderAnalyticsFilterBar";
import OrderAnalyticsChart from "@/Components/Dashboard/OrderAnalyticsChart";
import TopProductsCard from "@/Components/Dashboard/TopProductsCard";
import {
    Layers,
    Users,
    Shield,
    Key,
    Sparkles,
    Package,
    Scale,
    ArrowDownLeft,
    ArrowUpRight,
    AlertTriangle,
    CheckCircle2,
    Clock,
    RefreshCw,
    Plus,
    ChevronRight,
    History,
    Boxes,
    BarChart3,
    PieChart,
    ExternalLink,
    FileSpreadsheet,
    Scissors,
    ShoppingBag,
    TrendingUp,
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
    const topProducts = orderAnalytics.top_products || [];
    const productionStatuses = orderAnalytics.production_statuses || [];
    const paymentBreakdown = orderAnalytics.payment_breakdown || {};
    const topCustomers = orderAnalytics.top_customers || [];

    return (
        <DashboardLayout>
            <Head title="Ringkasan & Analitik Pesanan - Dashboard" />

            <div className="space-y-6 sm:space-y-8 pb-8">
                {/* ========================================================= */}
                {/* 1. HERO HEADER BANNER                                    */}
                {/* ========================================================= */}
                <div className="relative bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg overflow-hidden border border-slate-800">
                    <div
                        className="absolute right-0 top-0 w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none opacity-20"
                        style={{ background: "radial-gradient(circle, #14b8a6 0%, transparent 70%)" }}
                    />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-900/40 border border-teal-500/30 rounded-full text-xs text-teal-300 font-bold mb-3 shadow-inner">
                                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                                <span>Azhar Collection • Enterprise Konveksi & Stock Intelligence</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                Halo, {user?.name || "Admin"}! 👋
                            </h1>
                            <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
                                Pantau grafik omzet pesanan pelanggan tahun ke tahun, kemajuan pengerjaan baju di meja produksi, dan ketersediaan stok fisik kain gudang.
                            </p>
                        </div>

                        {/* Top Right Quick Actions */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={handleRefreshAll}
                                disabled={refreshing || loadingAnalytics}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 shadow-sm transition-all cursor-pointer"
                                title="Perbarui Data Dashboard"
                            >
                                <RefreshCw
                                    className={`w-3.5 h-3.5 ${
                                        refreshing || loadingAnalytics ? "animate-spin text-teal-400" : ""
                                    }`}
                                />
                                <span>{refreshing || loadingAnalytics ? "Memuat..." : "Refresh Data"}</span>
                            </button>

                            {permissions.includes("invoice.create") && (
                                <Link
                                    href="/dashboard/invoice/create"
                                    style={{
                                        background: "linear-gradient(135deg, #0d9488, #0f766e)",
                                        backgroundColor: "#0d9488",
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Buat Invoice Baru</span>
                                </Link>
                            )}

                            {permissions.includes("barang.create") && (
                                <Link
                                    href="/dashboard/barang"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 shadow-sm transition-all cursor-pointer"
                                >
                                    <Package className="w-3.5 h-3.5" />
                                    <span>Kelola Stok</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* SECTION 1: ANALITIK PESANAN & TREN PELANGGAN (YOY)        */}
                {/* ========================================================= */}
                <div className="space-y-4">
                    {/* Filter Bar Component */}
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

                    {/* Interactive Bar Chart Component with YoY comparison */}
                    <OrderAnalyticsChart
                        monthlyTrend={monthlyTrend}
                        summaryKPI={orderKPI}
                        selectedYear={selectedYear}
                        compareYear={compareYear}
                        isComparing={isComparing}
                        activeMetric={activeMetric}
                        customerInfo={orderFilter.selected_customer}
                    />

                    {/* Top Products & Production Status Cards */}
                    <TopProductsCard
                        topProducts={topProducts}
                        productionStatuses={productionStatuses}
                        paymentBreakdown={paymentBreakdown}
                        topCustomers={topCustomers}
                        isAllCustomers={selectedCustomer === "ALL"}
                        selectedCustomerInfo={orderFilter.selected_customer}
                    />
                </div>

                {/* ========================================================= */}
                {/* SECTION 2: INVENTARIS & STOK BAHAN BAKU                   */}
                {/* ========================================================= */}
                <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold shadow-sm"
                                style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)", backgroundColor: "#0d9488" }}
                            >
                                <Boxes className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                                    Inventaris Bahan Baku & Logistik Gudang
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Monitoring ketersediaan stok fisik kain/aksesoris dan pergerakan mutasi harian
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/barang"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                        >
                            <span>Katalog Bahan</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* 6 Metric Cards Ribbon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
                        {/* Stat 1: Total Bahan Baku */}
                        <div className="relative overflow-hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between group">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500" />
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Total Bahan
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    <Package className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                                    {metrics.total_items || 0}
                                </h3>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {metrics.active_items || 0} Aktif
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">SKU</span>
                                </div>
                            </div>
                        </div>

                        {/* Stat 2: Total Stok Fisik */}
                        <div className="relative overflow-hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-cyan-300 transition-all flex flex-col justify-between group">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500" />
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Stok Fisik
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                    <Boxes className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                                    {(metrics.total_stock_base || 0).toLocaleString("id-ID")}
                                </h3>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                                        Satuan Dasar
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stat 3: Mutasi Masuk Bulan Ini */}
                        <div className="relative overflow-hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between group">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Masuk (Bln Ini)
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <ArrowDownLeft className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                                    +{(metrics.monthly_in_qty || 0).toLocaleString("id-ID")}
                                </h3>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Restock
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stat 4: Mutasi Keluar Bulan Ini */}
                        <div className="relative overflow-hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between group">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Keluar (Bln Ini)
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                                    -{(metrics.monthly_out_qty || 0).toLocaleString("id-ID")}
                                </h3>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Produksi
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stat 5: Stok Menipis */}
                        <div className="relative overflow-hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-rose-300 transition-all flex flex-col justify-between group">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Stok Menipis
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl sm:text-2xl font-black font-mono text-rose-600 tracking-tight">
                                    {metrics.low_stock_count || 0}
                                </h3>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                        Restock Segera
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stat 6: Kategori & Satuan */}
                        <div className="relative overflow-hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between group">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Klasifikasi
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Layers className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                                    {metrics.total_categories || 0} / {metrics.total_units || 0}
                                </h3>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                        Kategori & Satuan
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left: Tren Mutasi 7 Hari (8 Cols) */}
                        <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                                        style={{ backgroundColor: "rgba(13, 148, 136, 0.15)", color: "#0f766e" }}
                                    >
                                        <BarChart3 className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm">
                                            Grafik Tren Mutasi Stok Bahan Baku
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Perbandingan stok masuk vs keluar 7 hari terakhir dalam satuan dasar.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Chart Component */}
                            <StockActivityChart data={activityTrend} />
                        </div>

                        {/* Right: Distribusi Kategori (4 Cols) */}
                        <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                                            style={{ backgroundColor: "rgba(79, 70, 229, 0.15)", color: "#4338ca" }}
                                        >
                                            <PieChart className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-slate-900 text-sm">
                                                Komposisi Kategori Bahan
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Distribusi ragam SKU per kategori bahan.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Donut Chart Component */}
                                <div className="pt-2">
                                    <CategoryDonutChart categories={categoryDist} />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Total Terdaftar:</span>
                                <span className="font-mono font-extrabold text-slate-800">
                                    {categoryDist.length} Kategori Bahan
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stock Table & Critical Alerts */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left: Log Mutasi Terbaru (7 Cols) */}
                        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                                        style={{ backgroundColor: "rgba(13, 148, 136, 0.15)", color: "#0f766e" }}
                                    >
                                        <History className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm">
                                            Aktivitas Mutasi Stok Terkini
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Log pergerakan bahan masuk dan keluar terakhir.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {recentMutations.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                                    Belum ada catatan mutasi stok.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {recentMutations.map((m) => (
                                        <div key={m.id} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 shadow-sm ${
                                                        m.type === "in"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-amber-100 text-amber-700"
                                                    }`}
                                                >
                                                    {m.type === "in" ? (
                                                        <ArrowDownLeft className="w-4 h-4" />
                                                    ) : (
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-bold text-slate-900 block truncate">
                                                        {m.item_name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono block">
                                                        {m.date} • {m.user_name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 font-mono">
                                                <span
                                                    className={`font-black block text-xs ${
                                                        m.type === "in" ? "text-emerald-700" : "text-amber-700"
                                                    }`}
                                                >
                                                    {m.type === "in" ? "+" : "-"}
                                                    {m.total_base_quantity} {m.base_unit_symbol}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                                                    {m.notes || m.reference_no || "-"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Critical Low Stock Items (5 Cols) */}
                        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                                        style={{ backgroundColor: "rgba(225, 29, 72, 0.15)", color: "#e11d48" }}
                                    >
                                        <AlertTriangle className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm">
                                            Peringatan Stok Menipis
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Bahan yang berada di bawah batas minimum gudang.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {criticalItems.length === 0 ? (
                                <div className="py-10 text-center text-xs text-emerald-600 font-semibold flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <span>Semua stok bahan baku dalam kondisi aman!</span>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {criticalItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs shadow-sm"
                                        >
                                            <div className="min-w-0">
                                                <span className="font-extrabold text-slate-900 block truncate">
                                                    {item.name}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-mono block">
                                                    Min: {item.min_stock} {item.unit_symbol}
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="font-black font-mono text-rose-600 block text-xs">
                                                    {item.stock} {item.unit_symbol}
                                                </span>
                                                <span className="text-[9px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-rose-200">
                                                    Kritis
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 3. QUICK NAVIGATION SHORTCUTS                             */}
                {/* ========================================================= */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                            Pintasan Cepat Modul Sistem
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        <Link
                            href="/dashboard/invoice"
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 transition-all flex flex-col justify-between group cursor-pointer hover:shadow-sm"
                        >
                            <FileSpreadsheet className="w-5 h-5 text-teal-700 group-hover:scale-110 transition-transform" />
                            <div className="mt-3">
                                <span className="font-bold text-xs text-slate-900 block">Invoice Order</span>
                                <span className="text-[10px] text-slate-500">Daftar Transaksi</span>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/produk"
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all flex flex-col justify-between group cursor-pointer hover:shadow-sm"
                        >
                            <ShoppingBag className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                            <div className="mt-3">
                                <span className="font-bold text-xs text-slate-900 block">Katalog Produk</span>
                                <span className="text-[10px] text-slate-500">Resep & Ukuran</span>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/pelanggan"
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-300 transition-all flex flex-col justify-between group cursor-pointer hover:shadow-sm"
                        >
                            <Users className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform" />
                            <div className="mt-3">
                                <span className="font-bold text-xs text-slate-900 block">Pelanggan</span>
                                <span className="text-[10px] text-slate-500">Sekolah & Instansi</span>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/barang"
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 transition-all flex flex-col justify-between group cursor-pointer hover:shadow-sm"
                        >
                            <Package className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
                            <div className="mt-3">
                                <span className="font-bold text-xs text-slate-900 block">Bahan Baku</span>
                                <span className="text-[10px] text-slate-500">Stok & Mutasi</span>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/kategori"
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all flex flex-col justify-between group cursor-pointer hover:shadow-sm"
                        >
                            <Layers className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                            <div className="mt-3">
                                <span className="font-bold text-xs text-slate-900 block">Kategori</span>
                                <span className="text-[10px] text-slate-500">Master Klasifikasi</span>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/satuan"
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 transition-all flex flex-col justify-between group cursor-pointer hover:shadow-sm"
                        >
                            <Scale className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                            <div className="mt-3">
                                <span className="font-bold text-xs text-slate-900 block">Satuan Ukuran</span>
                                <span className="text-[10px] text-slate-500">Master Konversi</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
