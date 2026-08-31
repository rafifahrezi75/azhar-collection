import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { ShieldAlert, TrendingUp, Filter } from "lucide-react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import { hasPermission } from "@/utils/permissions";
import { Toast } from "@/utils/sweetalert";
import { Card } from "@/Components/Dashboard/dashboardShared";
import CustomerSelector from "@/Components/Dashboard/CustomerSelector";
import CustomerYearlyChart from "@/Components/Dashboard/CustomerYearlyChart";
import YearMonthDrawer from "@/Components/Dashboard/YearMonthDrawer";
import InvoiceDrillModal from "@/Components/Dashboard/InvoiceDrillModal";
import KpiCards from "@/Components/Dashboard/KpiCards";
import TopCustomersLeaderboard from "@/Components/Dashboard/TopCustomersLeaderboard";
import {
    TopProductsChart,
    PaymentStatusDonut,
    ProductionStatusBreakdown,
} from "@/Components/Dashboard/AnalyticsPanels";
import {
    ActivityTrendWidget,
    CriticalStockWidget,
    CategoryDonutWidget,
    RecentMutationsWidget,
} from "@/Components/Dashboard/OperationalWidgets";

const roundRate = (numerator, denominator) =>
    denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

export default function Dashboard({ initialSummary, initialOrderAnalytics, canViewAnalytics }) {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];
    const showAnalytics =
        typeof canViewAnalytics === "boolean"
            ? canViewAnalytics
            : hasPermission(permissions, "dashboard.analytics.view");

    const [summary, setSummary] = useState(initialSummary);
    const [analytics, setAnalytics] = useState(initialOrderAnalytics);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [trendData, setTrendData] = useState(null);
    const [trendLoading, setTrendLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [customerId, setCustomerId] = useState("ALL");
    const [compareId, setCompareId] = useState("");

    const [drawer, setDrawer] = useState({ open: false, year: null });
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [drillInvoice, setDrillInvoice] = useState(null);

    const currentYear = new Date().getFullYear();

    const fetchAnalytics = useCallback((cid) => {
        setAnalyticsLoading(true);
        return axios
            .get("/api/dashboard/order-analytics", {
                params: { customer_id: cid, year: currentYear, compare_year: currentYear - 1 },
            })
            .then((res) => setAnalytics(res.data?.data || null))
            .catch(() => Toast.error("Gagal memuat analitik penjualan"))
            .finally(() => setAnalyticsLoading(false));
    }, [currentYear]);

    const fetchTrend = useCallback(() => {
        setTrendLoading(true);
        return axios
            .get("/api/dashboard/customer-yearly-trend")
            .then((res) => setTrendData(res.data?.data || null))
            .catch(() => Toast.error("Gagal memuat tren pelanggan"))
            .finally(() => setTrendLoading(false));
    }, []);

    const fetchSummary = useCallback(() => {
        return axios
            .get("/api/dashboard/summary")
            .then((res) => setSummary(res.data?.data || null))
            .catch(() => Toast.error("Gagal memuat ringkasan"));
    }, []);

    useEffect(() => {
        if (!showAnalytics) return;
        fetchTrend();
    }, [showAnalytics, fetchTrend]);

    useEffect(() => {
        if (!showAnalytics) return;
        fetchAnalytics(customerId);
    }, [customerId, showAnalytics, fetchAnalytics]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        const jobs = [fetchSummary()];
        if (showAnalytics) jobs.push(fetchTrend(), fetchAnalytics(customerId));
        Promise.all(jobs)
            .then(() => Toast.success("Data dashboard berhasil diperbarui"))
            .finally(() => setRefreshing(false));
    }, [fetchSummary, fetchTrend, fetchAnalytics, customerId, showAnalytics]);

    const customers = useMemo(() => trendData?.customers || [], [trendData]);
    const availableYears = useMemo(() => trendData?.available_years || [], [trendData]);

    const buildYearRows = useCallback(
        (cid) => {
            if (cid !== "ALL") {
                const c = customers.find((x) => String(x.customer_id) === String(cid));
                return c ? c.years : [];
            }
            return availableYears.map((yr) => {
                const agg = { year: yr, total_amount: 0, paid_amount: 0, outstanding: 0, qty: 0, invoices: 0, prod_selesai: 0 };
                customers.forEach((c) => {
                    const y = c.years?.find((v) => v.year === yr);
                    if (!y) return;
                    agg.total_amount += y.total_amount;
                    agg.paid_amount += y.paid_amount;
                    agg.qty += y.qty;
                    agg.invoices += y.invoices;
                    agg.prod_selesai += y.prod_selesai;
                });
                agg.outstanding = Math.max(0, agg.total_amount - agg.paid_amount);
                agg.paid_rate = roundRate(agg.paid_amount, agg.total_amount);
                agg.fulfill_rate = roundRate(agg.prod_selesai, agg.invoices);
                return agg;
            });
        },
        [customers, availableYears]
    );

    const yearlyRows = useMemo(
        () => (showAnalytics ? buildYearRows(customerId) : []),
        [showAnalytics, buildYearRows, customerId]
    );
    const compareRows = useMemo(
        () => (showAnalytics && compareId ? buildYearRows(compareId) : null),
        [showAnalytics, buildYearRows, compareId]
    );

    const selectedLabel = useMemo(() => {
        if (customerId === "ALL") return "Semua Pelanggan";
        const c = customers.find((x) => String(x.customer_id) === String(customerId));
        return c?.name || "Pelanggan";
    }, [customerId, customers]);

    const handleSelectCustomer = useCallback((id) => {
        setCustomerId(id);
        setDrawer({ open: false, year: null });
        setDrillInvoice(null);
    }, []);

    const handleYearClick = useCallback(
        (year) => {
            setDrawer({ open: true, year });
            setOrdersLoading(true);
            axios
                .get("/api/dashboard/customer-orders", {
                    params: { customer_id: customerId, year },
                })
                .then((res) => setOrders(res.data?.data?.invoices || []))
                .catch(() => {
                    Toast.error("Gagal memuat pesanan tahun ini");
                    setOrders([]);
                })
                .finally(() => setOrdersLoading(false));
        },
        [customerId]
    );

    const restrictedBanner = !showAnalytics && (
        <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 shadow-2xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Analitik Penjualan Terbatas
                </p>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Grafik omzet, piutang, dan metrik penjualan hanya tersedia untuk hak akses Admin & Staff.
                    Hubungi administrator jika Anda memerlukan akses laporan keuangan.
                </p>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <Head title="Dashboard Penjualan - Azhar Collection" />

            <div className="space-y-5 max-w-[1600px] mx-auto">
                {/* PAGE HEADER BAR */}
                <PageHeaderBar
                    title="Dashboard Penjualan"
                    breadcrumbs={[{ label: "Dashboard" }]}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                />

                {/* RESTRICTED ACCESS BANNER */}
                {restrictedBanner}

                {/* ANALYTICS SECTION (FOR AUTHORIZED USERS) */}
                {showAnalytics && (
                    <>
                        {/* KPI SUMMARY CARDS */}
                        <KpiCards kpi={analytics?.summary_kpi} loading={analyticsLoading && !analytics} />

                        {/* TREN TAHUNAN & LEADERBOARD PELANGGAN */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
                            <Card className="xl:col-span-2 flex flex-col justify-between">
                                <div>
                                    {/* Header Controls & Filter Pelanggan */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                                                <TrendingUp className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                                    <span>Tren Performa Tahunan</span>
                                                    <span className="text-teal-700 font-mono font-bold">— {selectedLabel}</span>
                                                </h2>
                                                <p className="text-[11px] text-slate-500">
                                                    Visualisasi akumulasi omzet, pembayaran, dan pemenuhan pesanan.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shrink-0">
                                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Klik grafik batang untuk rincian bulanan</span>
                                        </div>
                                    </div>

                                    {/* Customer Selectors */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 bg-slate-50/60 rounded-lg border border-slate-200/80">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                                Pelanggan Utama
                                            </label>
                                            <CustomerSelector
                                                customers={customers}
                                                value={customerId}
                                                onChange={handleSelectCustomer}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                                Bandingkan Dengan
                                            </label>
                                            <CustomerSelector
                                                customers={customers}
                                                value={compareId || "ALL"}
                                                onChange={(id) => setCompareId(id === "ALL" ? "" : id)}
                                                allLabel="Tanpa Pembanding"
                                            />
                                        </div>
                                    </div>

                                    {/* Yearly Chart Component */}
                                    <CustomerYearlyChart
                                        data={yearlyRows}
                                        compareData={compareRows}
                                        loading={trendLoading}
                                        onBarClick={handleYearClick}
                                    />
                                </div>
                            </Card>

                            {/* Leaderboard Pelanggan */}
                            <TopCustomersLeaderboard
                                customers={customers}
                                year={currentYear}
                                selectedCustomerId={customerId}
                                onSelectCustomer={handleSelectCustomer}
                                loading={trendLoading}
                            />
                        </div>

                        {/* PANELS ANALITIK (PRODUK TERATAS, PEMBAYARAN, STATUS PRODUKSI) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <TopProductsChart products={analytics?.top_products || []} loading={analyticsLoading && !analytics} />
                            <PaymentStatusDonut breakdown={analytics?.payment_breakdown || {}} loading={analyticsLoading && !analytics} />
                            <ProductionStatusBreakdown statuses={analytics?.production_statuses || []} loading={analyticsLoading && !analytics} />
                        </div>
                    </>
                )}

                {/* OPERATIONAL WIDGETS SECTION */}
                <div className={`grid grid-cols-1 md:grid-cols-2 ${showAnalytics ? "xl:grid-cols-4" : ""} gap-4 items-start`}>
                    <ActivityTrendWidget trend={summary?.activity_trend || []} />
                    <CriticalStockWidget items={summary?.critical_items || []} />
                    <CategoryDonutWidget categories={summary?.category_distribution || []} />
                    <RecentMutationsWidget mutations={summary?.recent_mutations || []} />
                </div>
            </div>

            {/* DRAWER RINCIAN PESANAN TAHUN/BULAN */}
            <YearMonthDrawer
                open={drawer.open}
                year={drawer.year}
                customerName={selectedLabel}
                invoices={orders}
                loading={ordersLoading}
                onClose={() => setDrawer({ open: false, year: null })}
                onSelectInvoice={(inv) => setDrillInvoice(inv)}
            />

            {/* MODAL DRILL-DOWN INVOICE */}
            <InvoiceDrillModal invoice={drillInvoice} onClose={() => setDrillInvoice(null)} />
        </DashboardLayout>
    );
}
