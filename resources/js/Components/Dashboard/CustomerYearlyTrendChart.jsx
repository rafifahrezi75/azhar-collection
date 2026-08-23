import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { TrendingUp, RefreshCw, ChevronDown, Calendar } from "lucide-react";

const fmtRp = (num) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR",
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(num || 0);

const fmtNum = (num) => new Intl.NumberFormat("id-ID").format(num || 0);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function CustomerYearlyTrendChart() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState("ALL");
    const [yearFrom, setYearFrom] = useState(new Date().getFullYear() - 1);
    const [yearTo, setYearTo] = useState(new Date().getFullYear());
    const [hoveredIdx, setHoveredIdx] = useState(null);

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
    const customers = useMemo(() => data?.customers || [], [data]);

    // Build year range options
    const yearOptions = useMemo(() => {
        if (years.length === 0) return [];
        const min = Math.min(...years);
        const max = Math.max(...years);
        const opts = [];
        for (let y = max; y >= min; y--) opts.push(y);
        return opts;
    }, [years]);

    // Filtered years within range
    const rangeYears = useMemo(() => {
        return years.filter((y) => y >= yearFrom && y <= yearTo).sort((a, b) => a - b);
    }, [years, yearFrom, yearTo]);

    // Selected customer info
    const selectedCustomer = useMemo(() => {
        if (selectedCustomerId === "ALL") return null;
        return customers.find((c) => c.customer_id == selectedCustomerId) || null;
    }, [customers, selectedCustomerId]);

    // Chart data: revenue per year for selected customer
    const chartData = useMemo(() => {
        if (selectedCustomerId === "ALL") {
            // Aggregate all customers per year
            return rangeYears.map((yr) => {
                let totalRevenue = 0;
                let totalQty = 0;
                let totalInvoices = 0;
                customers.forEach((c) => {
                    const yd = c.years.find((y) => y.year === yr);
                    if (yd) {
                        totalRevenue += yd.total_amount || 0;
                        totalQty += yd.qty || 0;
                        totalInvoices += yd.invoices || 0;
                    }
                });
                return { year: yr, label: String(yr), revenue: totalRevenue, qty: totalQty, invoices: totalInvoices };
            });
        } else {
            const cust = customers.find((c) => c.customer_id == selectedCustomerId);
            if (!cust) return [];
            return rangeYears.map((yr) => {
                const yd = cust.years.find((y) => y.year === yr);
                return {
                    year: yr,
                    label: String(yr),
                    revenue: yd?.total_amount || 0,
                    qty: yd?.qty || 0,
                    invoices: yd?.invoices || 0,
                };
            });
        }
    }, [customers, selectedCustomerId, rangeYears]);

    const maxRevenue = useMemo(() => {
        if (chartData.length === 0) return 1;
        return Math.max(...chartData.map((d) => d.revenue), 1);
    }, [chartData]);

    const totalRevenue = useMemo(() => chartData.reduce((s, d) => s + d.revenue, 0), [chartData]);
    const totalQty = useMemo(() => chartData.reduce((s, d) => s + d.qty, 0), [chartData]);
    const totalInvoices = useMemo(() => chartData.reduce((s, d) => s + d.invoices, 0), [chartData]);

    return (
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Tren & Performa Pesanan Pelanggan</h3>
                        <p className="text-[11px] text-slate-500">Grafik omzet per tahun berdasarkan pelanggan</p>
                    </div>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Customer Selector */}
                <div className="relative">
                    <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                    >
                        <option value="ALL">Semua Pelanggan</option>
                        {customers.map((c) => (
                            <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>

                {/* Year Range */}
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <select
                        value={yearFrom}
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            setYearFrom(v);
                            if (v > yearTo) setYearTo(v);
                        }}
                        className="appearance-none px-2 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                    >
                        {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <span className="text-xs text-slate-400">s/d</span>
                    <select
                        value={yearTo}
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            setYearTo(v);
                            if (v < yearFrom) setYearFrom(v);
                        }}
                        className="appearance-none px-2 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                    >
                        {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Memuat data...
                </div>
            )}
            {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium border border-rose-200">{error}</div>
            )}

            {/* Chart */}
            {!loading && !error && chartData.length > 0 && (
                <>
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Omzet</div>
                            <div className="text-sm font-bold text-slate-800 font-mono">{fmtRp(totalRevenue)}</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Qty</div>
                            <div className="text-sm font-bold text-slate-800 font-mono">{fmtNum(totalQty)} <span className="text-[10px] text-slate-400">pcs</span></div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Invoice</div>
                            <div className="text-sm font-bold text-slate-800 font-mono">{fmtNum(totalInvoices)}</div>
                        </div>
                    </div>

                    {/* Selected Customer Info */}
                    {selectedCustomer && (
                        <div className="mb-3 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {selectedCustomer.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <span className="text-xs font-bold text-teal-800 block truncate">{selectedCustomer.name}</span>
                                {selectedCustomer.institution_name && (
                                    <span className="text-[10px] text-teal-600">{selectedCustomer.institution_name}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Vertical Bar Chart */}
                    <div className="relative pt-4 pb-2">
                        {/* Gridlines */}
                        <div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
                            <div className="border-b border-dashed border-slate-200" />
                            <div className="border-b border-dashed border-slate-200" />
                            <div className="border-b border-dashed border-slate-200" />
                            <div className="border-b border-slate-300" />
                        </div>

                        {/* Bars */}
                        <div className="grid gap-2 sm:gap-3 h-56 relative z-10 px-1 items-end" style={{ gridTemplateColumns: `repeat(${chartData.length}, 1fr)` }}>
                            {chartData.map((d, idx) => {
                                const h = maxRevenue > 0 ? Math.max(2, (d.revenue / maxRevenue) * 100) : 2;
                                const isHovered = hoveredIdx === idx;

                                return (
                                    <div
                                        key={d.year}
                                        className="flex flex-col items-center h-full justify-end cursor-pointer relative"
                                        onMouseEnter={() => setHoveredIdx(idx)}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                    >
                                        {/* Tooltip */}
                                        {isHovered && (
                                            <div className="absolute bottom-full mb-2 bg-slate-900 text-white rounded-lg p-2.5 shadow-xl text-[10px] z-50 pointer-events-none min-w-[160px]">
                                                <div className="font-bold text-xs mb-1.5 border-b border-slate-700 pb-1">{d.label}</div>
                                                <div className="space-y-0.5">
                                                    <div className="flex justify-between"><span className="text-slate-400">Omzet:</span><span className="font-bold text-teal-300 font-mono">{fmtRp(d.revenue)}</span></div>
                                                    <div className="flex justify-between"><span className="text-slate-400">Qty:</span><span className="font-bold text-white font-mono">{fmtNum(d.qty)} pcs</span></div>
                                                    <div className="flex justify-between"><span className="text-slate-400">Invoice:</span><span className="font-bold text-white font-mono">{d.invoices}</span></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bar */}
                                        <div
                                            className={`w-full max-w-[80px] rounded-t-md transition-all duration-300 ${isHovered ? "bg-teal-600" : "bg-teal-500"}`}
                                            style={{ height: `${h}%` }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* X-axis labels */}
                        <div className="grid gap-2 sm:gap-3 px-1 mt-2" style={{ gridTemplateColumns: `repeat(${chartData.length}, 1fr)` }}>
                            {chartData.map((d) => (
                                <div key={d.year} className="text-center">
                                    <span className="text-[10px] font-bold text-slate-500">{d.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Y-axis label */}
                    <div className="mt-1 text-[10px] text-slate-400 text-center">
                        Omzet (Rp) per tahun
                    </div>
                </>
            )}

            {!loading && !error && chartData.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-400">Tidak ada data untuk rentang tahun yang dipilih.</div>
            )}
        </div>
    );
}
