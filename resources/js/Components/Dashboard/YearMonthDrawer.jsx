import React, { useState, useEffect, useMemo, memo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import { X, ChevronRight, Receipt, CalendarDays } from "lucide-react";
import {
    BRAND_COLOR,
    MONTH_SHORT,
    MONTH_FULL,
    formatCompact,
    formatMoneyShort,
    formatRupiah,
    formatDate,
    PaymentBadge,
    ProductionBadge,
    EmptyState,
} from "./dashboardShared";

const MonthTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-soft-md px-3 py-2 text-xs">
            <div className="font-bold text-slate-800 mb-0.5">{d.fullLabel}</div>
            <div className="text-slate-500">
                Omzet: <span className="font-semibold text-slate-700">{formatMoneyShort(d.revenue)}</span>
            </div>
            <div className="text-slate-500">
                Invoice: <span className="font-semibold text-slate-700">{d.count}</span>
            </div>
        </div>
    );
};

const YearMonthDrawer = memo(function YearMonthDrawer({
    open,
    year,
    customerName = "Semua Pelanggan",
    invoices = [],
    loading = false,
    onClose,
    onSelectInvoice,
}) {
    const [selectedMonth, setSelectedMonth] = useState(null);

    useEffect(() => {
        if (open) setSelectedMonth(null);
    }, [open, year]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    const monthlyData = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const list = invoices.filter((inv) => {
                if (!inv.order_date) return false;
                return parseInt(String(inv.order_date).slice(5, 7), 10) === m;
            });
            return {
                month: m,
                label: MONTH_SHORT[i],
                fullLabel: `${MONTH_FULL[i]} ${year}`,
                revenue: list.reduce((s, inv) => s + (Number(inv.total) || 0), 0),
                count: list.length,
            };
        });
    }, [invoices, year]);

    const monthInvoices = useMemo(() => {
        if (selectedMonth === null) return [];
        return invoices
            .filter((inv) => parseInt(String(inv.order_date || "").slice(5, 7), 10) === selectedMonth)
            .sort((a, b) => String(b.order_date || "").localeCompare(String(a.order_date || "")));
    }, [invoices, selectedMonth]);

    const selectedMonthData = selectedMonth ? monthlyData[selectedMonth - 1] : null;

    if (!open) return null;

    const yearTotal = invoices.reduce((s, inv) => s + (Number(inv.total) || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
            <div className="relative w-full max-w-xl h-full bg-slate-50 shadow-soft-xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-slate-200 bg-white">
                    <div>
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-teal-600" />
                            Rincian {year}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {customerName} · Total{" "}
                            <span className="font-semibold text-teal-700">{formatRupiah(yearTotal)}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-5">
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-soft-xs p-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Klik bulan untuk lihat invoice
                        </p>
                        {loading ? (
                            <div className="h-44 animate-pulse rounded-lg bg-slate-100" />
                        ) : (
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 9, fill: "#94a3b8" }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => formatCompact(v)}
                                    />
                                    <Tooltip content={<MonthTooltip />} cursor={{ fill: "rgba(128,0,128,0.05)" }} />
                                    <Bar
                                        dataKey="revenue"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={30}
                                        cursor="pointer"
                                        onClick={(entry) => {
                                            const d = entry?.payload ?? entry;
                                            if (d?.month && d.count > 0) setSelectedMonth(d.month);
                                            else if (d?.month) setSelectedMonth(d.month);
                                        }}
                                    >
                                        {monthlyData.map((m) => (
                                            <Cell
                                                key={m.month}
                                                fill={selectedMonth === m.month ? "#5c005c" : m.count > 0 ? BRAND_COLOR : "#e2e8f0"}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {selectedMonth && (
                        <div className="bg-white rounded-xl border border-slate-200/60 shadow-soft-xs overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">
                                        {MONTH_FULL[selectedMonth - 1]} {year}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {monthInvoices.length} invoice ·{" "}
                                        <span className="font-semibold text-teal-700">
                                            {formatMoneyShort(selectedMonthData?.revenue)}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMonth(null)}
                                    className="text-[11px] font-bold text-slate-400 hover:text-teal-600 cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>

                            {loading ? (
                                <div className="p-4 space-y-2">
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                                    ))}
                                </div>
                            ) : monthInvoices.length === 0 ? (
                                <EmptyState message="Belum ada pesanan di bulan ini." />
                            ) : (
                                <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar">
                                    {monthInvoices.map((inv) => (
                                        <li key={inv.id}>
                                            <button
                                                type="button"
                                                onClick={() => onSelectInvoice(inv)}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-teal-50/40 transition-colors text-left cursor-pointer group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                                    <Receipt className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-bold text-slate-800 font-mono">
                                                            {inv.invoice_number}
                                                        </span>
                                                        <PaymentBadge value={inv.payment_status} />
                                                        <ProductionBadge value={inv.production_status} />
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(inv.order_date)}</div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-bold text-slate-800 font-mono">
                                                        {formatMoneyShort(inv.total)}
                                                    </div>
                                                    {inv.outstanding > 0 && (
                                                        <div className="text-[10px] text-rose-500 font-medium">
                                                            Sisa {formatMoneyShort(inv.outstanding)}
                                                        </div>
                                                    )}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 shrink-0 transition-colors" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default YearMonthDrawer;
