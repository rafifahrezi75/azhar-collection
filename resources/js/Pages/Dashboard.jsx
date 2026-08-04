import React, { useEffect, useState, useCallback } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StockActivityChart from "@/Components/Dashboard/StockActivityChart";
import CategoryDonutChart from "@/Components/Dashboard/CategoryDonutChart";
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
} from "lucide-react";

export default function Dashboard({ initialSummary = null }) {
    const { auth } = usePage().props;
    const user = auth?.user || null;
    const permissions = auth?.permissions || [];

    const [summary, setSummary] = useState(initialSummary || {
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
    });

    const [loading, setLoading] = useState(!initialSummary);
    const [refreshing, setRefreshing] = useState(false);

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
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!initialSummary) {
            fetchSummary(true);
        }
    }, [initialSummary, fetchSummary]);

    const metrics = summary.metrics || {};
    const activityTrend = summary.activity_trend || [];
    const categoryDist = summary.category_distribution || [];
    const criticalItems = summary.critical_items || [];
    const recentMutations = summary.recent_mutations || [];

    return (
        <DashboardLayout>
            <Head title="Ringkasan & Statistik - Dashboard" />

            <div className="space-y-4 sm:space-y-5">
                {/* 1. Header Banner */}
                <div className="relative bg-slate-900 text-white rounded-md p-5 sm:p-6 shadow-sm overflow-hidden border border-slate-800">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-xs text-emerald-300 font-medium mb-2.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Azhar Collection • Inventory & Production Hub</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                                Selamat Datang kembali, {user?.name || "User"}! 👋
                            </h1>
                            <p className="mt-1.5 text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Ringkasan inventaris bahan baku, mutasi keluar/masuk, dan kesiapan stok produksi konveksi.
                            </p>
                        </div>

                        {/* Top Right Quick Actions */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => fetchSummary()}
                                disabled={refreshing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                                title="Perbarui Data Dashboard"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
                                <span>{refreshing ? "Memperbarui..." : "Refresh"}</span>
                            </button>

                            {permissions.includes("barang.create") && (
                                <Link
                                    href="/dashboard/barang"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Kelola Barang</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Top KPI Metric Cards (6 Cards Ribbon) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
                    {/* Stat 1: Total Bahan Baku */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-md border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Total Bahan
                            </span>
                            <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center font-bold group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                <Package className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                                {metrics.total_items || 0}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {metrics.active_items || 0} Aktif
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Katalog SKU</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat 2: Total Stok Fisik */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-md border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Stok Fisik Gudang
                            </span>
                            <div className="w-7 h-7 rounded-md bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                <Boxes className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                                {(metrics.total_stock_base || 0).toLocaleString("id-ID")}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                                    Satuan Dasar
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Total Akumulasi</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat 3: Mutasi Masuk Bulan Ini */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-md border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Masuk (Bulan Ini)
                            </span>
                            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                                +{(metrics.monthly_in_qty || 0).toLocaleString("id-ID")}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Restock Masuk
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Supplier / Awal</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat 4: Mutasi Keluar Bulan Ini */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-md border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Keluar (Bulan Ini)
                            </span>
                            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                                -{(metrics.monthly_out_qty || 0).toLocaleString("id-ID")}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    Produksi
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Potong / Jahit</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat 5: Stok Menipis & Kritis */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-md border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Stok Kritis
                            </span>
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold transition-colors ${
                                (metrics.low_stock_count || 0) > 0
                                    ? "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
                                    : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                            }`}>
                                <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
                                (metrics.low_stock_count || 0) > 0 ? "text-rose-600" : "text-slate-900"
                            }`}>
                                {metrics.low_stock_count || 0}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                                    (metrics.low_stock_count || 0) > 0
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}>
                                    {(metrics.low_stock_count || 0) > 0 ? "Perlu Restock" : "Stok Aman"}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Bahan Kritis</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat 6: Kategori & Satuan */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-md border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Master Data
                            </span>
                            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Layers className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                                {metrics.total_categories || 0} / {metrics.total_units || 0}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    Kategori & Satuan
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Klasifikasi</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Main Analytics Row (Charts Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: Tren Mutasi 7 Hari (8 Cols) */}
                    <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                    <BarChart3 className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                                        Grafik Tren Mutasi Stok Bahan Baku
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Perbandingan stok masuk vs keluar harian dalam satuan dasar.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Chart Component */}
                        <StockActivityChart data={activityTrend} />
                    </div>

                    {/* Right: Distribusi Kategori (4 Cols) */}
                    <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                        <PieChart className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                                            Komposisi Kategori Bahan
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            Distribusi ragam SKU per kategori.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Donut Chart Component */}
                            <div className="pt-1">
                                <CategoryDonutChart categories={categoryDist} />
                            </div>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Total Terdaftar:</span>
                            <span className="font-mono font-bold text-slate-800">
                                {categoryDist.length} Kategori Bahan
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Actionable Data & Monitoring Grid (Recent Mutations & Critical Stock) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: Log Mutasi Terbaru (7 Cols) */}
                    <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                    <History className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                                        Aktivitas Mutasi Stok Terkini
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Log pergerakan bahan masuk dan keluar terakhir.
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/dashboard/barang"
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
                            >
                                <span>Lihat Semua</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Recent Mutations Feed */}
                        {recentMutations.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {recentMutations.map((m) => {
                                    const isOut = m.type === "out";
                                    const isIn = m.type === "in";
                                    return (
                                        <div
                                            key={m.id}
                                            className="py-2.5 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition-colors rounded-md px-1"
                                        >
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                                                    isOut ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-600"
                                                }`}>
                                                    {isOut ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <h4 className="font-bold text-slate-900 text-xs truncate">
                                                            {m.item_name}
                                                        </h4>
                                                        <span className="font-mono text-[10px] text-slate-400">
                                                            {m.item_code}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                        {m.notes || "Tanpa keterangan"}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                                                        <span>{m.date}</span>
                                                        <span>•</span>
                                                        <span>Petugas: {m.user_name}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <span className={`font-mono text-xs font-bold block ${
                                                    isOut ? "text-amber-600" : "text-teal-600"
                                                }`}>
                                                    {isOut ? `-${m.quantity}` : `+${m.quantity}`} {m.unit_symbol}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-400">
                                                    ({isOut ? `-${m.total_base_quantity}` : `+${m.total_base_quantity}`} {m.base_unit_symbol})
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-xs text-slate-400">
                                Belum ada riwayat mutasi stok tercatat.
                            </div>
                        )}
                    </div>

                    {/* Right: Peringatan Stok Kritis (5 Cols) */}
                    <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                                        Peringatan Restock Bahan
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Bahan dengan stok mendekati batas minimum.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {criticalItems.length > 0 ? (
                            <div className="space-y-2.5">
                                {criticalItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-2.5 bg-slate-50 rounded-md border border-slate-200 space-y-1.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0 pr-2">
                                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                                    {item.name}
                                                </h4>
                                                <span className="text-[10px] font-mono text-slate-500">
                                                    {item.code} • {item.category_name}
                                                </span>
                                            </div>

                                            <div className="text-right shrink-0 font-mono">
                                                <span className={`text-xs font-bold ${
                                                    item.is_out_of_stock ? "text-rose-600" : "text-amber-600"
                                                }`}>
                                                    {item.stock} {item.unit_symbol}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block">
                                                    Min: {item.min_stock} {item.unit_symbol}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar Health */}
                                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${Math.max(5, item.health_ratio)}%` }}
                                                className={`h-full rounded-full transition-all ${
                                                    item.is_out_of_stock
                                                        ? "bg-rose-500"
                                                        : item.health_ratio < 50
                                                        ? "bg-amber-500"
                                                        : "bg-teal-500"
                                                }`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center space-y-1.5 bg-slate-50/50 rounded-md border border-dashed border-slate-200">
                                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                                <h4 className="text-xs font-bold text-slate-800">
                                    Semua Stok Bahan Baku Aman!
                                </h4>
                                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                                    Tidak ada item yang berada di bawah batas minimum stok saat ini.
                                </p>
                            </div>
                        )}

                        <div className="pt-1.5">
                            <Link
                                href="/dashboard/barang"
                                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <span>Buka Modul Inventaris Bahan</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 5. Quick Shortcut Grid & Role Summary */}
                <div className="bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                <Key className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                                    Akses Cepat Modul & Wewenang Akun
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Navigasi cepat ke modul utama sistem konveksi.
                                </p>
                            </div>
                        </div>

                        <span className="text-xs px-2.5 py-0.5 bg-teal-50 text-teal-700 font-semibold rounded-md border border-teal-200 font-mono">
                            {permissions.length} Hak Akses Aktif
                        </span>
                    </div>

                    {/* Quick Access Tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-0.5">
                        <Link
                            href="/dashboard/barang"
                            className="p-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-200 transition-all flex flex-col justify-between group cursor-pointer"
                        >
                            <Package className="w-4.5 h-4.5 text-teal-600 group-hover:scale-105 transition-transform" />
                            <div className="mt-2.5">
                                <span className="font-bold text-xs text-slate-900 block">Katalog Bahan</span>
                                <span className="text-[10px] text-slate-500">Stok & Mutasi</span>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/kategori"
                            className="p-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all flex flex-col justify-between group cursor-pointer"
                        >
                            <Layers className="w-4.5 h-4.5 text-emerald-600 group-hover:scale-105 transition-transform" />
                            <div className="mt-2.5">
                                <span className="font-bold text-xs text-slate-900 block">Kategori</span>
                                <span className="text-[10px] text-slate-500">Master Klasifikasi</span>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/satuan"
                            className="p-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all flex flex-col justify-between group cursor-pointer"
                        >
                            <Scale className="w-4.5 h-4.5 text-cyan-600 group-hover:scale-105 transition-transform" />
                            <div className="mt-2.5">
                                <span className="font-bold text-xs text-slate-900 block">Satuan Ukuran</span>
                                <span className="text-[10px] text-slate-500">Master Multi-Satuan</span>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/users"
                            className="p-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between group cursor-pointer"
                        >
                            <Users className="w-4.5 h-4.5 text-blue-600 group-hover:scale-105 transition-transform" />
                            <div className="mt-2.5">
                                <span className="font-bold text-xs text-slate-900 block">Pengguna</span>
                                <span className="text-[10px] text-slate-500">User Management</span>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/hak-akses"
                            className="p-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-purple-50/50 hover:border-purple-200 transition-all flex flex-col justify-between group cursor-pointer"
                        >
                            <Shield className="w-4.5 h-4.5 text-purple-600 group-hover:scale-105 transition-transform" />
                            <div className="mt-2.5">
                                <span className="font-bold text-xs text-slate-900 block">Hak Akses</span>
                                <span className="text-[10px] text-slate-500">Role & Permission</span>
                            </div>
                        </Link>
                    </div>

                    {/* Permissions list (collapsible/wrap) */}
                    <div className="pt-2.5 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1">
                            {permissions.map((perm) => (
                                <span
                                    key={perm}
                                    className="px-2 py-0.5 bg-slate-50 text-slate-600 font-mono text-[10px] font-medium rounded-md border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
                                >
                                    {perm}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
