import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { ShieldAlert } from "lucide-react";
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
            .then(() => Toast.success("Data dashboard diperbarui"))
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
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
                <p className="text-sm font-bold text-amber-800">Analitik Penjualan Terbatas</p>
                <p className="text-xs text-amber-700 mt-0.5">
                    Grafik omzet, piutang, dan data penjualan hanya tersedia untuk Admin & Staff.
                    Hubungi administrator jika Anda membutuhkan akses.
                </p>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <Head title="Dashboard Penjualan" />

            <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
                <PageHeaderBar
                    title="Dashboard Penjualan"
                    breadcrumbs={[{ label: "Dashboard" }]}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                />

                {restrictedBanner}

                {showAnalytics && (
                    <>
                        <KpiCards kpi={analytics?.summary_kpi} loading={analyticsLoading && !analytics} />

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 items-stretch">
                            <Card className="xl:col-span-2">
                                <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-4">
                                    <div className="sm:w-72">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Pelanggan
                                        </label>
                                        <CustomerSelector customers={customers} value={customerId} onChange={handleSelectCustomer} />
                                    </div>
                                    <div className="sm:w-56">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Bandingkan dengan
                                        </label>
                                        <CustomerSelector
                                            customers={customers}
                                            value={compareId || "ALL"}
                                            onChange={(id) => setCompareId(id === "ALL" ? "" : id)}
                                            allLabel="Tidak ada"
                                        />
                                    </div>
                                </div>

                                <div className="-mx-1 px-1">
                                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
                                        Tren Tahunan
                                        <span className="text-teal-700">— {selectedLabel}</span>
                                    </h2>
                                </div>
                                <CustomerYearlyChart
                                    data={yearlyRows}
                                    compareData={compareRows}
                                    loading={trendLoading}
                                    onBarClick={handleYearClick}
                                />
                            </Card>

                            <TopCustomersLeaderboard
                                customers={customers}
                                year={currentYear}
                                selectedCustomerId={customerId}
                                onSelectCustomer={handleSelectCustomer}
                                loading={trendLoading}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            <TopProductsChart products={analytics?.top_products || []} loading={analyticsLoading && !analytics} />
                            <PaymentStatusDonut breakdown={analytics?.payment_breakdown || {}} loading={analyticsLoading && !analytics} />
                            <ProductionStatusBreakdown statuses={analytics?.production_statuses || []} loading={analyticsLoading && !analytics} />
                        </div>
                    </>
                )}

                <div className={`grid grid-cols-1 md:grid-cols-2 ${showAnalytics ? "xl:grid-cols-4" : ""} gap-3 items-start`}>
                    <ActivityTrendWidget trend={summary?.activity_trend || []} />
                    <CriticalStockWidget items={summary?.critical_items || []} />
                    <CategoryDonutWidget categories={summary?.category_distribution || []} />
                    <RecentMutationsWidget mutations={summary?.recent_mutations || []} />
                </div>
            </div>

            <YearMonthDrawer
                open={drawer.open}
                year={drawer.year}
                customerName={selectedLabel}
                invoices={orders}
                loading={ordersLoading}
                onClose={() => setDrawer({ open: false, year: null })}
                onSelectInvoice={(inv) => setDrillInvoice(inv)}
            />

            <InvoiceDrillModal invoice={drillInvoice} onClose={() => setDrillInvoice(null)} />
        </DashboardLayout>
    );
}
