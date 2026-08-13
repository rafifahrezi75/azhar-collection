import React, { memo, useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Shirt,
    FileText,
    CheckCircle2,
    Sparkles,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Building,
    Percent,
} from "lucide-react";

const formatRp = (num) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(num || 0);
};

const formatShortRp = (num) => {
    if (!num || num === 0) return "Rp 0";
    if (num >= 1000000000) return `Rp ${(num / 1000000000).toFixed(2)} M`;
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)} Jt`;
    if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)} Rb`;
    return `Rp ${num}`;
};

const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num || 0);
};

const OrderAnalyticsChart = memo(function OrderAnalyticsChart({
    monthlyTrend = [],
    summaryKPI = {},
    selectedYear = 2026,
    compareYear = 2025,
    isComparing = true,
    activeMetric = "revenue", // "revenue" | "qty" | "invoices"
    customerInfo = null,
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Calculate max values for scaling
    const maxCurrentVal = Math.max(
        ...monthlyTrend.map((m) => {
            if (activeMetric === "revenue") return m.current_revenue || 0;
            if (activeMetric === "qty") return m.current_qty || 0;
            return m.current_invoices || 0;
        }),
        0
    );

    const maxCompareVal = isComparing
        ? Math.max(
              ...monthlyTrend.map((m) => {
                  if (activeMetric === "revenue") return m.compare_revenue || 0;
                  if (activeMetric === "qty") return m.compare_qty || 0;
                  return m.compare_invoices || 0;
              }),
              0
          )
        : 0;

    const rawMax = Math.max(maxCurrentVal, maxCompareVal);
    const ceilingMax = activeMetric === "revenue" ? Math.max(rawMax, 1000000) : Math.max(rawMax, 20);

    const kpi = summaryKPI || {};

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-6">
            {/* ========================================================= */}
            {/* 1. KPI RIBBON CARDS (4 CARDS)                             */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* KPI 1: Omzet / Nilai Pesanan */}
                <div className="relative overflow-hidden bg-gradient-to-br from-teal-50/80 via-white to-slate-50 rounded-xl p-4 border border-teal-200 shadow-sm hover:shadow transition-all flex flex-col justify-between group">
                    <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ background: "linear-gradient(to right, #0d9488, #34d399)" }}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-teal-800 uppercase tracking-wider">
                            Total Omzet ({selectedYear})
                        </span>
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: "rgba(13, 148, 136, 0.12)", color: "#0f766e" }}
                        >
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                            {formatShortRp(kpi.current_revenue)}
                        </div>
                        <div className="mt-2 pt-2 border-t border-teal-100 flex items-center justify-between text-xs">
                            {isComparing ? (
                                <span
                                    className={`inline-flex items-center gap-1 font-extrabold px-1.5 py-0.5 rounded-md text-[11px] ${
                                        kpi.revenue_growth >= 0
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-rose-100 text-rose-800"
                                    }`}
                                >
                                    {kpi.revenue_growth >= 0 ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    {kpi.revenue_growth >= 0 ? "+" : ""}
                                    {kpi.revenue_growth}% YoY
                                </span>
                            ) : (
                                <span className="text-slate-400 text-[11px]">Komparasi Mati</span>
                            )}
                            <span className="text-slate-500 font-mono text-[11px] truncate">
                                vs {formatShortRp(kpi.compare_revenue)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* KPI 2: Total Volume Produksi Pcs */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 rounded-xl p-4 border border-indigo-200 shadow-sm hover:shadow transition-all flex flex-col justify-between group">
                    <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ background: "linear-gradient(to right, #4f46e5, #60a5fa)" }}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-indigo-800 uppercase tracking-wider">
                            Volume Produksi ({selectedYear})
                        </span>
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: "rgba(79, 70, 229, 0.12)", color: "#4338ca" }}
                        >
                            <Shirt className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                            {formatNumber(kpi.current_qty)}{" "}
                            <span className="text-xs font-bold text-slate-500 font-sans">Pcs Baju</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-indigo-100 flex items-center justify-between text-xs">
                            {isComparing ? (
                                <span
                                    className={`inline-flex items-center gap-1 font-extrabold px-1.5 py-0.5 rounded-md text-[11px] ${
                                        kpi.qty_growth >= 0
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-rose-100 text-rose-800"
                                    }`}
                                >
                                    {kpi.qty_growth >= 0 ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    {kpi.qty_growth >= 0 ? "+" : ""}
                                    {kpi.qty_growth}% YoY
                                </span>
                            ) : (
                                <span className="text-slate-400 text-[11px]">Komparasi Mati</span>
                            )}
                            <span className="text-slate-500 font-mono text-[11px] truncate">
                                vs {formatNumber(kpi.compare_qty)} Pcs
                            </span>
                        </div>
                    </div>
                </div>

                {/* KPI 3: Jumlah Transaksi & Rata-rata Order */}
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/80 via-white to-slate-50 rounded-xl p-4 border border-amber-200 shadow-sm hover:shadow transition-all flex flex-col justify-between group">
                    <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ background: "linear-gradient(to right, #d97706, #fbbf24)" }}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">
                            Total Transaksi ({selectedYear})
                        </span>
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: "rgba(217, 119, 6, 0.12)", color: "#b45309" }}
                        >
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                            {formatNumber(kpi.current_invoices)}{" "}
                            <span className="text-xs font-bold text-slate-500 font-sans">Invoice</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-amber-100 flex items-center justify-between text-xs font-mono text-[11px]">
                            <span className="text-slate-500">Rata-rata/Inv:</span>
                            <span className="font-extrabold text-amber-800">
                                {formatShortRp(kpi.average_order_value)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* KPI 4: Kas Masuk vs Piutang Berjalan */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 rounded-xl p-4 border border-emerald-200 shadow-sm hover:shadow transition-all flex flex-col justify-between group">
                    <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ background: "linear-gradient(to right, #059669, #34d399)" }}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
                            Pelunasan & Piutang
                        </span>
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: "rgba(5, 150, 105, 0.12)", color: "#047857" }}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700 tracking-tight">
                            {formatShortRp(kpi.current_paid)}
                        </div>
                        <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between text-xs font-mono text-[11px]">
                            <span className="text-slate-500">Sisa Piutang:</span>
                            <span className="font-extrabold text-rose-600">
                                {formatShortRp(kpi.outstanding_amount)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. MAIN 12-MONTH VISUAL BAR CHART                        */}
            {/* ========================================================= */}
            <div className="pt-2 space-y-3">
                {/* Chart Header & Active Legends */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-5">
                        {/* Legend: Current Year (Teal/Emerald) */}
                        <div className="flex items-center gap-2">
                            <span
                                className="w-3.5 h-3.5 rounded-sm inline-block shadow-sm"
                                style={{ background: "linear-gradient(to top, #0f766e, #14b8a6, #34d399)" }}
                            />
                            <span className="font-extrabold text-slate-800">
                                Tahun {selectedYear}{" "}
                                <span className="font-normal text-slate-500">
                                    (
                                    {activeMetric === "revenue"
                                        ? "Nilai Omzet Rp"
                                        : activeMetric === "qty"
                                        ? "Volume Pcs Baju"
                                        : "Jumlah Invoice"}
                                    )
                                </span>
                            </span>
                        </div>

                        {/* Legend: Compare Year (Indigo) */}
                        {isComparing && (
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-3.5 h-3.5 rounded-sm inline-block shadow-sm"
                                    style={{ background: "linear-gradient(to top, #4338ca, #6366f1, #818cf8)" }}
                                />
                                <span className="font-extrabold text-indigo-900">
                                    Tahun {compareYear}{" "}
                                    <span className="font-normal text-indigo-600">(Pembanding YoY)</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Customer Scope Badge */}
                    <div>
                        {customerInfo ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 rounded-lg text-xs font-bold border border-teal-200 shadow-xs">
                                <Building className="w-3.5 h-3.5 text-teal-600" />
                                {customerInfo.name}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                                🏢 Seluruh Pelanggan (Total Usaha)
                            </span>
                        )}
                    </div>
                </div>

                {/* Chart Frame */}
                <div className="relative pt-6 pb-2">
                    {/* Background Horizontal Gridlines */}
                    <div className="absolute inset-x-0 top-6 bottom-9 flex flex-col justify-between pointer-events-none opacity-50">
                        <div className="border-b border-dashed border-slate-200 w-full" />
                        <div className="border-b border-dashed border-slate-200 w-full" />
                        <div className="border-b border-dashed border-slate-200 w-full" />
                        <div className="border-b border-slate-300 w-full" />
                    </div>

                    {/* 12 Months Grid */}
                    <div className="grid grid-cols-12 gap-1 sm:gap-2.5 h-64 relative z-10 px-1 items-end">
                        {monthlyTrend.map((m, idx) => {
                            const curVal =
                                activeMetric === "revenue"
                                    ? m.current_revenue || 0
                                    : activeMetric === "qty"
                                    ? m.current_qty || 0
                                    : m.current_invoices || 0;

                            const compVal =
                                activeMetric === "revenue"
                                    ? m.compare_revenue || 0
                                    : activeMetric === "qty"
                                    ? m.compare_qty || 0
                                    : m.compare_invoices || 0;

                            const curHeight = ceilingMax > 0 ? (curVal / ceilingMax) * 100 : 0;
                            const compHeight = ceilingMax > 0 ? (compVal / ceilingMax) * 100 : 0;

                            const isHovered = hoveredIndex === idx;
                            const monthDelta = curVal - compVal;
                            const monthGrowth =
                                compVal > 0
                                    ? Math.round((monthDelta / compVal) * 100)
                                    : curVal > 0
                                    ? 100
                                    : 0;

                            return (
                                <div
                                    key={m.month || idx}
                                    className={`flex flex-col items-center h-full justify-end group cursor-pointer relative rounded-xl transition-all duration-200 ${
                                        isHovered ? "bg-teal-500/10 -mx-0.5 px-0.5" : ""
                                    }`}
                                    onMouseEnter={() => setHoveredIndex(idx)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {/* Interactive Floating Tooltip */}
                                    {isHovered && (
                                        <div className="absolute bottom-full mb-3.5 bg-slate-900 text-white rounded-xl p-3.5 shadow-2xl border border-slate-700 text-xs z-50 pointer-events-none min-w-[220px] sm:min-w-[250px]">
                                            {/* Tooltip Header */}
                                            <div className="border-b border-slate-700 pb-2 mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                                                    <span className="font-extrabold text-white text-xs">
                                                        {m.full_label}
                                                    </span>
                                                </div>
                                                {isComparing && (
                                                    <span
                                                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                                            monthGrowth >= 0
                                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                                        }`}
                                                    >
                                                        {monthGrowth >= 0 ? "+" : ""}
                                                        {monthGrowth}% YoY
                                                    </span>
                                                )}
                                            </div>

                                            {/* Tooltip Primary Metric Figures */}
                                            <div className="space-y-2 font-mono text-[11px]">
                                                {/* Selected Year */}
                                                <div className="flex items-center justify-between bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700">
                                                    <span className="flex items-center gap-1.5 text-teal-300 font-bold">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full inline-block"
                                                            style={{ backgroundColor: "#14b8a6" }}
                                                        />
                                                        Tahun {selectedYear}:
                                                    </span>
                                                    <span className="font-extrabold text-white">
                                                        {activeMetric === "revenue"
                                                            ? formatRp(m.current_revenue)
                                                            : activeMetric === "qty"
                                                            ? `${formatNumber(m.current_qty)} Pcs`
                                                            : `${m.current_invoices} Invoice`}
                                                    </span>
                                                </div>

                                                {/* Compare Year */}
                                                {isComparing && (
                                                    <div className="flex items-center justify-between bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700">
                                                        <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full inline-block"
                                                                style={{ backgroundColor: "#6366f1" }}
                                                            />
                                                            Tahun {compareYear}:
                                                        </span>
                                                        <span className="font-extrabold text-white">
                                                            {activeMetric === "revenue"
                                                                ? formatRp(m.compare_revenue)
                                                                : activeMetric === "qty"
                                                                ? `${formatNumber(m.compare_qty)} Pcs`
                                                                : `${m.compare_invoices} Invoice`}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Sub-breakdown Details */}
                                                <div className="pt-2 border-t border-slate-800 space-y-1 text-[10px] text-slate-300">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Total Omzet:</span>
                                                        <span className="font-bold text-white font-mono">
                                                            {formatShortRp(m.current_revenue)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Total Volume:</span>
                                                        <span className="font-bold text-white font-mono">
                                                            {formatNumber(m.current_qty)} Pcs Baju
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Status Pembayaran:</span>
                                                        <span className="font-bold text-emerald-400 font-mono">
                                                            {m.paid_count} Lunas • {m.dp_count} DP • {m.unpaid_count} Belum
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bars Columns Container */}
                                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-52 px-0.5">
                                        {/* Compare Year Bar (Indigo) */}
                                        {isComparing && (
                                            <div className="w-full max-w-[16px] bg-slate-100 rounded-t-md flex flex-col justify-end h-full overflow-hidden">
                                                <div
                                                    style={{
                                                        height: `${Math.max(compVal > 0 ? 5 : 0, compHeight)}%`,
                                                        background: "linear-gradient(to top, #4338ca, #6366f1, #818cf8)",
                                                        backgroundColor: "#6366f1",
                                                    }}
                                                    className={`w-full rounded-t-md transition-all duration-300 ${
                                                        isHovered ? "brightness-125 shadow-md" : "opacity-85"
                                                    }`}
                                                />
                                            </div>
                                        )}

                                        {/* Current Year Bar (Emerald/Teal) */}
                                        <div className="w-full max-w-[16px] bg-slate-100 rounded-t-md flex flex-col justify-end h-full overflow-hidden">
                                            <div
                                                style={{
                                                    height: `${Math.max(curVal > 0 ? 5 : 0, curHeight)}%`,
                                                    background: "linear-gradient(to top, #0f766e, #14b8a6, #34d399)",
                                                    backgroundColor: "#0d9488",
                                                }}
                                                className={`w-full rounded-t-md transition-all duration-300 ${
                                                    isHovered
                                                        ? "brightness-125 shadow-lg scale-y-105 origin-bottom"
                                                        : ""
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Month Label with Hover Chip */}
                                    <div className="mt-2.5 text-center pb-1">
                                        <span
                                            className={`text-[10px] sm:text-xs font-bold block transition-all px-1.5 py-0.5 rounded-md ${
                                                isHovered
                                                    ? "bg-teal-600 text-white shadow-sm"
                                                    : "text-slate-600 group-hover:text-teal-700"
                                            }`}
                                        >
                                            {m.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default OrderAnalyticsChart;
