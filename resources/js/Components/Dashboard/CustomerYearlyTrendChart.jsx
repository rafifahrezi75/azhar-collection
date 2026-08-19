import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
    Users, TrendingUp, CheckCircle2, AlertCircle, Clock,
    RefreshCw, ChevronDown, ChevronUp, Package, DollarSign
} from "lucide-react";

const fmt = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR",
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(val || 0);

const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);

// Pastel color palette for customers (up to 12)
const CUSTOMER_COLORS = [
    { bar: "#6366f1", light: "#eef2ff", text: "#4338ca" },
    { bar: "#0d9488", light: "#f0fdfa", text: "#0f766e" },
    { bar: "#f59e0b", light: "#fffbeb", text: "#b45309" },
    { bar: "#f43f5e", light: "#fff1f2", text: "#be123c" },
    { bar: "#8b5cf6", light: "#f5f3ff", text: "#6d28d9" },
    { bar: "#0ea5e9", light: "#f0f9ff", text: "#0369a1" },
    { bar: "#10b981", light: "#ecfdf5", text: "#047857" },
    { bar: "#fb923c", light: "#fff7ed", text: "#c2410c" },
    { bar: "#a855f7", light: "#faf5ff", text: "#7e22ce" },
    { bar: "#ec4899", light: "#fdf2f8", text: "#9d174d" },
    { bar: "#14b8a6", light: "#f0fdfa", text: "#0f766e" },
    { bar: "#64748b", light: "#f8fafc", text: "#334155" },
];

function MiniBar({ value, max, color }) {
    const w = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
            <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${w}%`, backgroundColor: color }}
            />
        </div>
    );
}

function StatusDot({ paidRate, fulfillRate }) {
    if (paidRate >= 100 && fulfillRate >= 100)
        return <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]"><CheckCircle2 className="w-3 h-3" /> Terpenuhi</span>;
    if (paidRate >= 80 || fulfillRate >= 80)
        return <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[10px]"><Clock className="w-3 h-3" /> Sebagian</span>;
    return <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-[10px]"><AlertCircle className="w-3 h-3" /> Belum</span>;
}

function CustomerRow({ customer, years, colorObj, maxRevenue }) {
    const [expanded, setExpanded] = useState(false);

    const totalRevAll = useMemo(() => customer.years.reduce((s, y) => s + y.total_amount, 0), [customer.years]);
    const totalInvAll = useMemo(() => customer.years.reduce((s, y) => s + y.invoices, 0), [customer.years]);
    const totalQtyAll = useMemo(() => customer.years.reduce((s, y) => s + y.qty, 0), [customer.years]);
    const avgFulfill  = useMemo(() => {
        const active = customer.years.filter(y => y.invoices > 0);
        return active.length > 0 ? Math.round(active.reduce((s, y) => s + y.fulfill_rate, 0) / active.length) : 0;
    }, [customer.years]);
    const avgPaid     = useMemo(() => {
        const active = customer.years.filter(y => y.invoices > 0);
        return active.length > 0 ? Math.round(active.reduce((s, y) => s + y.paid_rate, 0) / active.length) : 0;
    }, [customer.years]);

    const activeYears = customer.years.filter(y => y.invoices > 0);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            {/* Header row */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
                <div
                    className="w-8 h-8 rounded-md flex items-center justify-center font-black text-xs shrink-0"
                    style={{ background: colorObj.light, color: colorObj.text }}
                >
                    {(customer.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-xs truncate">{customer.name}</div>
                    {customer.institution_name && (
                        <div className="text-[10px] text-slate-400 truncate">{customer.institution_name}</div>
                    )}
                </div>
                {/* Mini stats */}
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium">Total Omzet</div>
                        <div className="text-xs font-black text-slate-800">{fmt(totalRevAll)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium">Invoice</div>
                        <div className="text-xs font-bold text-slate-700">{totalInvAll}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium">Qty</div>
                        <div className="text-xs font-bold text-slate-700">{totalQtyAll.toLocaleString("id-ID")} Pcs</div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 min-w-[70px]">
                        <StatusDot paidRate={avgPaid} fulfillRate={avgFulfill} />
                        <div className="text-[10px] text-slate-400">
                            Bayar {avgPaid}% · Prod {avgFulfill}%
                        </div>
                    </div>
                </div>
                {expanded
                    ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>

            {/* Expanded: per-year breakdown */}
            {expanded && (
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 space-y-3">
                    {activeYears.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Tidak ada invoice di tahun manapun.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {years.map(yr => {
                                const yd = customer.years.find(y => y.year === yr);
                                if (!yd || yd.invoices === 0) return (
                                    <div key={yr} className="rounded-md border border-dashed border-slate-200 p-3 flex flex-col gap-1 bg-white opacity-50">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{yr}</div>
                                        <div className="text-xs text-slate-300 italic">Tidak ada pesanan</div>
                                    </div>
                                );
                                return (
                                    <div key={yr} className="rounded-md border border-slate-200 p-3 flex flex-col gap-2 bg-white">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{yr}</span>
                                            <StatusDot paidRate={yd.paid_rate} fulfillRate={yd.fulfill_rate} />
                                        </div>
                                        <div className="text-sm font-black text-slate-800">{fmt(yd.total_amount)}</div>
                                        {/* Revenue bar */}
                                        <MiniBar value={yd.total_amount} max={maxRevenue} color={colorObj.bar} />
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] mt-0.5">
                                            <div>
                                                <span className="text-slate-400">Invoice</span>
                                                <span className="font-bold text-slate-700 ml-1">{yd.invoices}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Qty</span>
                                                <span className="font-bold text-slate-700 ml-1">{yd.qty.toLocaleString("id-ID")} Pcs</span>
                                            </div>
                                            <div className="col-span-2 flex gap-1 flex-wrap mt-0.5">
                                                {yd.lunas > 0 && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Lunas {yd.lunas}</span>
                                                )}
                                                {yd.dp > 0 && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">DP {yd.dp}</span>
                                                )}
                                                {yd.belum_bayar > 0 && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Belum {yd.belum_bayar}</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Paid rate */}
                                        <div>
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                                <span className="flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" /> Pembayaran</span>
                                                <span className="font-bold text-slate-600">{yd.paid_rate}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${yd.paid_rate}%` }} />
                                            </div>
                                        </div>
                                        {/* Fulfill rate */}
                                        <div>
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                                <span className="flex items-center gap-1"><Package className="w-2.5 h-2.5" /> Prod. Selesai</span>
                                                <span className="font-bold text-slate-600">{yd.fulfill_rate}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-indigo-400 transition-all duration-500" style={{ width: `${yd.fulfill_rate}%` }} />
                                            </div>
                                        </div>
                                        {yd.outstanding > 0 && (
                                            <div className="text-[10px] text-rose-600 font-bold">
                                                Sisa tagihan: {fmt(yd.outstanding)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function CustomerYearlyTrendChart() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("/api/dashboard/customer-yearly-trend");
            if (res.data?.data) setData(res.data.data);
        } catch (e) {
            console.error(e);
            setError("Gagal memuat data tren pelanggan.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const years = useMemo(() => data?.available_years || [], [data]);
    const customers = useMemo(() => {
        const list = data?.customers || [];
        if (!search.trim()) return list;
        const q = search.toLowerCase();
        return list.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.institution_name?.toLowerCase().includes(q)
        );
    }, [data, search]);

    // Max revenue across all year-customer combos (for bar scale)
    const maxRevenue = useMemo(() => {
        let max = 0;
        (data?.customers || []).forEach(c => {
            c.years.forEach(y => { if (y.total_amount > max) max = y.total_amount; });
        });
        return max;
    }, [data]);

    return (
        <div className="pt-4 space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold shadow-sm"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", backgroundColor: "#6366f1" }}
                    >
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                            Tren Pesanan per Pelanggan
                        </h2>
                        <p className="text-xs text-slate-500">
                            Riwayat omzet tahunan, pembayaran & status produksi per pelanggan
                        </p>
                    </div>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>{loading ? "Memuat..." : "Refresh"}</span>
                </button>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memuat data tren pelanggan...
                </div>
            )}
            {error && (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium border border-rose-200">
                    {error}
                </div>
            )}
            {!loading && !error && data && (
                <>
                    {/* Search */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari pelanggan..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 text-slate-700 placeholder-slate-400"
                            />
                        </div>
                        <span className="text-xs text-slate-400 font-medium shrink-0">
                            {customers.length} pelanggan · {years.slice(0, 4).join(", ")}
                        </span>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Terpenuhi (bayar ≥100% & prod ≥100%)</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> Sebagian (≥80%)</span>
                        <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-rose-500" /> Belum (&lt;80%)</span>
                    </div>

                    {/* Customer list */}
                    {customers.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Tidak ada pelanggan ditemukan.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {customers.map((cust, idx) => (
                                <CustomerRow
                                    key={cust.customer_id}
                                    customer={cust}
                                    years={years}
                                    colorObj={CUSTOMER_COLORS[idx % CUSTOMER_COLORS.length]}
                                    maxRevenue={maxRevenue}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
