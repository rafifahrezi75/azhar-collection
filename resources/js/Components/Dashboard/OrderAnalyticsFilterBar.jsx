import React from "react";
import { Filter, Calendar, Users, BarChart2, DollarSign, Shirt, FileText, ArrowRightLeft, Sparkles } from "lucide-react";

export default function OrderAnalyticsFilterBar({
    customers = [],
    selectedCustomer = "ALL",
    onChangeCustomer,
    availableYears = [2026, 2025],
    selectedYear = 2026,
    onChangeYear,
    compareYear = 2025,
    onChangeCompareYear,
    isComparing = true,
    onToggleComparing,
    activeMetric = "revenue", // "revenue" | "qty" | "invoices"
    onChangeMetric,
    loading = false,
}) {
    return (
        <div className="relative bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
            {/* Top Row: Title, Subtitle, and Metric Switcher */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start sm:items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-sm shrink-0 font-bold"
                        style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)", backgroundColor: "#0d9488" }}
                    >
                        <BarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                                Tren & Performa Pesanan Pelanggan
                            </h2>
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                <Sparkles className="w-3 h-3 text-teal-600" />
                                Multi-Year YoY
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Visualisasi omzet penjualan, volume produksi seragam (pcs), dan perbandingan performa antar tahun.
                        </p>
                    </div>
                </div>

                {/* Metric Switcher Segmented Control */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
                    <button
                        type="button"
                        onClick={() => onChangeMetric("revenue")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeMetric === "revenue"
                                ? "bg-white text-teal-800 shadow-sm border border-slate-200"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                        <span>Omzet (Rp)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onChangeMetric("qty")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeMetric === "qty"
                                ? "bg-white text-indigo-800 shadow-sm border border-slate-200"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Shirt className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Volume (Pcs)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onChangeMetric("invoices")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeMetric === "invoices"
                                ? "bg-white text-amber-800 shadow-sm border border-slate-200"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Transaksi</span>
                    </button>
                </div>
            </div>

            {/* Bottom Row: Filter Controls */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                {/* 1. Customer Dropdown Filter (5 cols) */}
                <div className="sm:col-span-2 lg:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-teal-600" />
                        <span>Filter Pelanggan / Sekolah</span>
                    </label>
                    <div className="relative">
                        <select
                            value={selectedCustomer}
                            onChange={(e) => onChangeCustomer(e.target.value)}
                            disabled={loading}
                            className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-xs transition-all cursor-pointer"
                        >
                            <option value="ALL">🏢 Semua Pelanggan (Akumulasi Usaha Total)</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} {c.institution_name ? `• ${c.institution_name}` : ""} ({c.code || "CUST"})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 2. Primary Year Filter (3 cols) */}
                <div className="sm:col-span-1 lg:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>Tahun Utama</span>
                    </label>
                    <select
                        value={selectedYear}
                        onChange={(e) => onChangeYear(parseInt(e.target.value, 10))}
                        disabled={loading}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs font-extrabold text-teal-900 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-xs transition-all cursor-pointer"
                    >
                        {availableYears.map((yr) => (
                            <option key={yr} value={yr}>
                                🗓️ Tahun {yr}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. YoY Compare Year Filter (4 cols) */}
                <div className="sm:col-span-1 lg:col-span-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Bandingkan Tahun (YoY)</span>
                        </label>
                        <button
                            type="button"
                            onClick={onToggleComparing}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                                isComparing
                                    ? "bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-200"
                                    : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                        >
                            {isComparing ? "✓ Komparasi Aktif" : "Mati"}
                        </button>
                    </div>

                    <div className="relative">
                        <select
                            value={compareYear}
                            onChange={(e) => onChangeCompareYear(parseInt(e.target.value, 10))}
                            disabled={!isComparing || loading}
                            className={`w-full text-xs rounded-xl px-3.5 py-2.5 shadow-xs transition-all ${
                                isComparing
                                    ? "bg-indigo-50 text-indigo-950 border border-indigo-300 font-extrabold cursor-pointer focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-medium"
                            }`}
                        >
                            {availableYears
                                .filter((yr) => yr !== selectedYear)
                                .map((yr) => (
                                    <option key={yr} value={yr}>
                                        📊 vs Tahun {yr}
                                    </option>
                                ))}
                            {availableYears.filter((yr) => yr !== selectedYear).length === 0 && (
                                <option value={selectedYear - 1}>📊 vs Tahun {selectedYear - 1}</option>
                            )}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
