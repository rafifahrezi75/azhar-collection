import React, { useState, useCallback } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { ShieldAlert } from "lucide-react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import { hasPermission } from "@/utils/permissions";
import { Toast } from "@/utils/sweetalert";
import InsightKpiCards from "@/Components/Dashboard/InsightKpiCards";
import MonthlyPerformanceChart from "@/Components/Dashboard/MonthlyPerformanceChart";
import FinancialHealthCard from "@/Components/Dashboard/FinancialHealthCard";
import ProductionPulseCard from "@/Components/Dashboard/ProductionPulseCard";
import TopProductsCard from "@/Components/Dashboard/TopProductsCard";
import CriticalStockCard from "@/Components/Dashboard/CriticalStockCard";
import RecentMutationsCard from "@/Components/Dashboard/RecentMutationsCard";
import ActiveDeadlinesCard from "@/Components/Dashboard/ActiveDeadlinesCard";
import PendingInvoicesCard from "@/Components/Dashboard/PendingInvoicesCard";

export default function Dashboard({ initialSummary, canViewAnalytics }) {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];
    const showAnalytics =
        typeof canViewAnalytics === "boolean"
            ? canViewAnalytics
            : hasPermission(permissions, "dashboard.analytics.view");

    const [summary, setSummary] = useState(initialSummary);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        axios
            .get("/api/dashboard/summary")
            .then((res) => {
                setSummary(res.data?.data || null);
                Toast.success("Data dashboard berhasil diperbarui");
            })
            .catch(() => Toast.error("Gagal memuat ringkasan dashboard"))
            .finally(() => setRefreshing(false));
    }, []);

    const restrictedBanner = !showAnalytics && (
        <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-200/90 rounded-md p-3.5 shadow-2xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Akses Terbatas — Mode Operasional
                </p>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Metrik keuangan (omzet, kas masuk, piutang, dan margin laba) hanya dapat diakses oleh Administrator dan Staff Keuangan.
                </p>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <Head title="Dashboard - Azhar Collection" />

            <div className="space-y-4 max-w-[1600px] mx-auto">
                <PageHeaderBar
                    title="Dashboard Operasional & Bisnis"
                    breadcrumbs={[{ label: "Dashboard" }]}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                />

                {restrictedBanner}

                <InsightKpiCards
                    kpi={summary?.kpi}
                    spkStats={summary?.production_pulse}
                    canViewAnalytics={showAnalytics}
                    loading={refreshing && !summary}
                />

                {showAnalytics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                        <MonthlyPerformanceChart
                            data={summary?.monthly_trend || []}
                            year={summary?.current_year}
                        />
                        <FinancialHealthCard
                            data={summary?.financial_health}
                            periodLabel={summary?.period_label}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                    <ProductionPulseCard pulse={summary?.production_pulse} />
                    <TopProductsCard products={summary?.top_products || []} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                    <CriticalStockCard items={summary?.critical_items || []} />
                    <RecentMutationsCard mutations={summary?.recent_mutations || []} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                    <ActiveDeadlinesCard assignments={summary?.active_deadlines || []} />
                    {showAnalytics ? (
                        <PendingInvoicesCard invoices={summary?.pending_invoices || []} />
                    ) : (
                        <CriticalStockCard items={summary?.critical_items || []} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
