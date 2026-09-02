import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import CalendarMonth from "@/Components/CalendarMonth";
import { formatDate, formatDateWithDay, todayLocal } from "@/utils/format";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Circle,
    Trash2,
    Plus,
    Calendar,
    Receipt,
    Layers,
    User,
    Clock,
    AlertTriangle,
} from "lucide-react";
import { Toast, confirmDialog } from "@/utils/sweetalert";

const MONTH_NAMES = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const statusConfig = {
    completed:   { label: "Selesai",       color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    COMPLETED:   { label: "Selesai",       color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    SELESAI:     { label: "Selesai",       color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    in_progress: { label: "Dikerjakan",    color: "bg-amber-50 text-amber-700 border-amber-200",     icon: Clock },
    IN_PROGRESS: { label: "Dikerjakan",    color: "bg-amber-50 text-amber-700 border-amber-200",     icon: Clock },
    pending:     { label: "Belum Dimulai", color: "bg-slate-100 text-slate-600 border-slate-200",     icon: AlertTriangle },
    PENDING:     { label: "Belum Dimulai", color: "bg-slate-100 text-slate-600 border-slate-200",     icon: AlertTriangle },
};

function StatusBadge({ status }) {
    const cfg = statusConfig[status] || statusConfig["pending"];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${cfg.color} shrink-0`}>
            <Icon className="w-3 h-3" />
            <span className="leading-none">{cfg.label}</span>
        </span>
    );
}

export default function Show({ invoice, work, history, calendar, totals, filters }) {
    const { auth } = usePage().props;
    const isAdmin = auth.roles && auth.roles.includes("admin");

    const todayStr = todayLocal();
    const todayMonth = todayStr.substring(0, 7);
    const [calKey, setCalKey] = useState(todayMonth);
    const [calYear, calMonth] = calKey.split("-").map(Number);
    const calMonth0 = calMonth - 1;

    const selectedDate =
        filters?.date === undefined || filters?.date === null
            ? todayLocal()
            : filters.date || null;

    const prevMonth = () => {
        const m = calMonth0 === 0 ? 11 : calMonth0 - 1;
        const y = calMonth0 === 0 ? calYear - 1 : calYear;
        setCalKey(`${y}-${String(m + 1).padStart(2, "0")}`);
    };

    const nextMonth = () => {
        const m = calMonth0 === 11 ? 0 : calMonth0 + 1;
        const y = calMonth0 === 11 ? calYear + 1 : calYear;
        setCalKey(`${y}-${String(m + 1).padStart(2, "0")}`);
    };

    const selectDate = (dateStr) => {
        const monthKey = dateStr.substring(0, 7);
        if (monthKey !== calKey) setCalKey(monthKey);
        router.get(
            route("production-progress.show", invoice.id),
            { date: dateStr === selectedDate ? "" : dateStr },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const daysMap = calendar?.[`${calYear}-${String(calMonth).padStart(2, "0")}`] || {};

    const doneQty = totals.done_qty || 0;
    const totalQty = totals.total_qty || 0;
    const pct = totalQty > 0 ? Math.min(100, Math.round((doneQty / totalQty) * 100)) : 0;

    const [openDates, setOpenDates] = useState({});
    const [openPeople, setOpenPeople] = useState({});
    const [itemOpen, setItemOpen] = useState(false);

    const toggleDateOpen = (date) => {
        setOpenDates((prev) => ({ ...prev, [date]: !(prev[date] === true) }));
    };

    const togglePersonOpen = (key) => {
        setOpenPeople((prev) => ({ ...prev, [key]: !(prev[key] === true) }));
    };

    const handleDelete = async (log) => {
        const confirmed = await confirmDialog({
            title: "Hapus Catatan Progress?",
            text: "Data pada tanggal tersebut akan dihapus.",
            icon: "warning",
            confirmButtonText: "Ya, Hapus!",
        });
        if (confirmed) {
            router.delete(route("production-progress.destroy", log.id), {
                onSuccess: () => Toast.success("Catatan berhasil dihapus."),
                preserveScroll: true,
            });
        }
    };

    const canEdit = (work || []).some((a) =>
        (a.steps || []).some((s) => s.qty - s.done_qty > 0)
    );

    const itemGroups = (() => {
        const map = new Map();
        (work || []).forEach((a) => {
            const key = a.product;
            if (!map.has(key))
                map.set(key, { product: key, qty: 0, stepQty: 0, stepDone: 0 });
            const g = map.get(key);
            g.qty += a.qty;
            (a.steps || []).forEach((x) => {
                g.stepQty += x.qty;
                g.stepDone += x.done_qty;
            });
        });
        return Array.from(map.values()).map((g) => {
            const ipct =
                g.stepQty > 0
                    ? Math.min(100, Math.round((g.stepDone / g.stepQty) * 100))
                    : 0;
            return { ...g, pct: ipct, done: Math.round((g.qty * ipct) / 100) };
        });
    })();

    const invoiceQtyTotal = itemGroups.reduce((sum, g) => sum + g.qty, 0);
    const doneDisplay = Math.round((invoiceQtyTotal * pct) / 100);

    const stepInfo = {};
    (work || []).forEach((a) => {
        (a.steps || []).forEach((s) => {
            stepInfo[s.id] = s;
        });
    });

    const groupedHistory = Object.entries(
        (history || []).reduce((acc, log) => {
            (acc[log.date] = acc[log.date] || []).push(log);
            return acc;
        }, {})
    ).sort((a, b) => b[0].localeCompare(a[0]));

    const filteredHistory = selectedDate
        ? groupedHistory.filter(([date]) => date === selectedDate)
        : groupedHistory;

    return (
        <DashboardLayout>
            <Head title={`Progress #${invoice.invoice_number} - Azhar Collection`} />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => router.visit(route("production-progress.index"))}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                    title="Kembali ke Progress Penjahit"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Receipt className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                            Monitoring Progress Produksi
                                        </h3>
                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold shadow-2xs">
                                            #{invoice.invoice_number}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {invoice.customer_name || "Pelanggan Umum"} &bull; Log pengerjaan harian dan penyelesaian tahapan jahit.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 shrink-0">
                                {canEdit && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.visit(
                                                selectedDate
                                                    ? route("production-progress.input", { invoice: invoice.id }) +
                                                          `?date=${selectedDate}`
                                                    : route("production-progress.input", invoice.id)
                                            )
                                        }
                                        className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-semibold rounded-lg border border-teal-200 shadow-2xs transition-all cursor-pointer"
                                        title="Progress"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-teal-600" />
                                        <span className="mt-0.5">Progress</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="p-4 sm:p-5 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            {/* KOLOM KIRI: Identitas & Metrik Progress */}
                            <div className="lg:col-span-4 space-y-4">
                                {/* Card Identitas Pesanan */}
                                <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 shadow-2xs space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                Pelanggan Pemesan
                                            </span>
                                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight truncate mt-0.5">
                                                {invoice.customer_name || "Pelanggan Umum"}
                                            </h4>
                                            <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                                                <p className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    Order:{" "}
                                                    <strong className="text-slate-800 font-semibold font-mono">
                                                        {formatDate(invoice.order_date)}
                                                    </strong>
                                                </p>
                                                <p className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    Target Selesai:{" "}
                                                    <strong className="text-slate-800 font-semibold font-mono">
                                                        {formatDate(invoice.completion_date)}
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>

                                        <StatusBadge status={totals.status} />
                                    </div>
                                </div>

                                {/* Ringkasan Beban Kerja & Target */}
                                <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Status Produksi:</span>
                                        <StatusBadge status={totals.status} />
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                                        <span className="text-slate-500 font-medium">Total Target Barang:</span>
                                        <span className="font-semibold text-slate-800 font-mono">
                                            {invoiceQtyTotal} Pcs
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Surat Perintah Kerja (SPK):</span>
                                        <span className="font-semibold text-slate-800 font-mono">
                                            {work.length} Penugasan
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                                        <span className="text-slate-500 font-medium">Progress Selesai:</span>
                                        <span className="font-bold text-teal-700 font-mono text-sm">
                                            {doneDisplay} / {invoiceQtyTotal} Pcs ({pct}%)
                                        </span>
                                    </div>
                                </div>

                                {/* Kalender Interaktif */}
                                <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-teal-600" />
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                {MONTH_NAMES[calMonth0]} {calYear}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={prevMonth}
                                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-200/70 text-slate-600 transition-colors cursor-pointer"
                                                title="Bulan sebelumnya"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextMonth}
                                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-200/70 text-slate-600 transition-colors cursor-pointer"
                                                title="Bulan berikutnya"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                                        <CalendarMonth
                                            year={calYear}
                                            month={calMonth0}
                                            daysMap={daysMap}
                                            selectedDate={selectedDate}
                                            onSelectDate={selectDate}
                                            filteredDate={selectedDate}
                                            rangeStart={invoice.order_date}
                                            rangeEnd={invoice.completion_date}
                                        />
                                    </div>

                                    <div className="pt-2 border-t border-slate-200/80 flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded bg-teal-500" /> Ada progress
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded bg-teal-50 border border-teal-200" /> Durasi order
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded bg-slate-800" /> Hari ini
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded bg-white border border-slate-200" /> Kosong
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* KOLOM KANAN: Hero Card Progress & Log Riwayat */}
                            <div className="lg:col-span-8 space-y-4">
                                {/* Hero Card: Progress Akumulasi & Rincian per Produk */}
                                <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 border border-slate-200 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                        <span className="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
                                            <Layers className="w-4 h-4 text-teal-600" />
                                            Akumulasi Progress Produksi
                                        </span>
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                            {pct}% Selesai
                                        </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                                                Estimasi Output Selesai:
                                            </span>
                                            <span className="font-mono font-extrabold text-teal-900 text-sm">
                                                {doneDisplay} / {invoiceQtyTotal} Pcs
                                            </span>
                                        </div>

                                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    pct >= 100
                                                        ? "bg-emerald-500"
                                                        : pct >= 50
                                                        ? "bg-amber-400"
                                                        : "bg-teal-500"
                                                }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>

                                        {itemGroups.length > 0 && (
                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setItemOpen((prev) => !prev)}
                                                    className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:text-teal-700 transition-colors cursor-pointer py-1"
                                                >
                                                    <span>Rincian Estimasi per Produk ({itemGroups.length})</span>
                                                    <ChevronDown
                                                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                                            itemOpen ? "" : "-rotate-90"
                                                        }`}
                                                    />
                                                </button>

                                                {itemOpen && (
                                                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2.5">
                                                        {itemGroups.map((g) => (
                                                            <div key={g.product} className="space-y-1">
                                                                <div className="flex justify-between items-center gap-2 text-xs">
                                                                    <span className="font-semibold text-slate-800 truncate">
                                                                        {g.product}
                                                                    </span>
                                                                    <span className="font-mono text-[11px] text-slate-500 font-bold shrink-0">
                                                                        {g.done}/{g.qty} pcs ({g.pct}%)
                                                                    </span>
                                                                </div>
                                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all ${
                                                                            g.pct >= 100
                                                                                ? "bg-emerald-500"
                                                                                : g.pct >= 50
                                                                                ? "bg-amber-400"
                                                                                : "bg-teal-500"
                                                                        }`}
                                                                        style={{ width: `${g.pct}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Log Riwayat Progress Harian */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-teal-600" />
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                Riwayat Catatan Progress
                                                {selectedDate ? ` (${formatDateWithDay(selectedDate)})` : " per Tanggal"}
                                            </h4>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                            {filteredHistory.reduce((sum, [, logs]) => sum + logs.length, 0)} Log Catatan
                                        </span>
                                    </div>

                                    {filteredHistory.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-xs bg-slate-50/50 rounded-lg border border-slate-200">
                                            {selectedDate
                                                ? "Tidak ada catatan log produksi pada tanggal yang dipilih."
                                                : "Belum ada riwayat catatan progress yang tersimpan."}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredHistory.map(([date, logs]) => {
                                                const dayTotal = logs.reduce((s, l) => s + l.qty, 0);
                                                const isOpen = selectedDate ? true : openDates[date] === true;

                                                const tMap = new Map();
                                                logs.forEach((l) => {
                                                    const key = l.tailor || "-";
                                                    if (!tMap.has(key)) tMap.set(key, []);
                                                    tMap.get(key).push(l);
                                                });
                                                const tailorGroups = Array.from(tMap.entries()).map(([name, pLogs]) => ({
                                                    name,
                                                    logs: pLogs,
                                                }));

                                                return (
                                                    <div
                                                        key={date}
                                                        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
                                                    >
                                                        {!selectedDate && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleDateOpen(date)}
                                                                className="w-full px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
                                                            >
                                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                                    <ChevronDown
                                                                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                                                            isOpen ? "" : "-rotate-90"
                                                                        }`}
                                                                    />
                                                                    {formatDateWithDay(date)}
                                                                </span>
                                                                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded">
                                                                    +{dayTotal} pcs
                                                                </span>
                                                            </button>
                                                        )}

                                                        {isOpen && (
                                                            <div className="p-3 bg-slate-50/30">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {tailorGroups.map((t) => {
                                                                        const tTotal = t.logs.reduce((s, l) => s + l.qty, 0);
                                                                        const personKey = `${date}|${t.name || "-"}`;
                                                                        const isPersonOpen = openPeople[personKey] !== false;

                                                                        const productMap = new Map();
                                                                        t.logs.forEach((l) => {
                                                                            if (!productMap.has(l.product))
                                                                                productMap.set(l.product, []);
                                                                            productMap.get(l.product).push(l);
                                                                        });

                                                                        return (
                                                                            <div
                                                                                key={t.name || "none"}
                                                                                className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs self-start space-y-2.5"
                                                                            >
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => togglePersonOpen(personKey)}
                                                                                    className="w-full flex items-center justify-between gap-2 cursor-pointer pb-2 border-b border-slate-100 text-left"
                                                                                >
                                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                                        <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 font-bold text-[10px] flex items-center justify-center border border-teal-200/80 shadow-2xs shrink-0">
                                                                                            {(t.name || "?").charAt(0).toUpperCase()}
                                                                                        </div>
                                                                                        <p className="text-xs font-bold text-slate-800 truncate">
                                                                                            {t.name || "Tanpa Penjahit"}
                                                                                        </p>
                                                                                    </div>
                                                                                    <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-teal-700 shrink-0">
                                                                                        +{tTotal} pcs
                                                                                        <ChevronDown
                                                                                            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                                                                                                isPersonOpen ? "" : "-rotate-90"
                                                                                            }`}
                                                                                        />
                                                                                    </span>
                                                                                </button>

                                                                                {isPersonOpen && (
                                                                                    <div className="space-y-2">
                                                                                        {Array.from(productMap.entries()).map(
                                                                                            ([product, pLogs]) => {
                                                                                                const pTotal = pLogs.reduce(
                                                                                                    (s, l) => s + l.qty,
                                                                                                    0
                                                                                                );
                                                                                                return (
                                                                                                    <div
                                                                                                        key={product}
                                                                                                        className="bg-slate-50/60 border border-slate-200/80 rounded-md p-2.5 space-y-1.5"
                                                                                                    >
                                                                                                        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1">
                                                                                                            <p className="text-[11px] font-bold text-slate-700 truncate">
                                                                                                                {product}
                                                                                                            </p>
                                                                                                            <span className="text-[10px] font-mono font-semibold text-slate-500">
                                                                                                                {pTotal} pcs
                                                                                                            </span>
                                                                                                        </div>

                                                                                                        <div className="space-y-1">
                                                                                                            {pLogs.map((log) => {
                                                                                                                const si = stepInfo[log.step_id];
                                                                                                                const selesai =
                                                                                                                    si &&
                                                                                                                    si.qty > 0 &&
                                                                                                                    si.done_qty >= si.qty;
                                                                                                                return (
                                                                                                                    <div
                                                                                                                        key={log.id}
                                                                                                                        className="flex items-start justify-between gap-2 py-0.5"
                                                                                                                    >
                                                                                                                        <div className="flex items-start gap-1.5 min-w-0">
                                                                                                                            {selesai ? (
                                                                                                                                <CheckCircle2
                                                                                                                                    className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5"
                                                                                                                                    title="Langkah ini sudah selesai"
                                                                                                                                />
                                                                                                                            ) : (
                                                                                                                                <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                                                                                                                            )}
                                                                                                                            <div className="min-w-0">
                                                                                                                                <p
                                                                                                                                    className={`text-xs truncate ${
                                                                                                                                        selesai
                                                                                                                                            ? "font-semibold text-emerald-800"
                                                                                                                                            : "font-medium text-slate-700"
                                                                                                                                    }`}
                                                                                                                                >
                                                                                                                                    {log.step_name}
                                                                                                                                </p>
                                                                                                                                {log.notes && (
                                                                                                                                    <p className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-[280px]">
                                                                                                                                        {log.notes}
                                                                                                                                    </p>
                                                                                                                                )}
                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                                                                                            <span className="font-mono text-xs font-bold text-slate-800">
                                                                                                                                {log.qty}{" "}
                                                                                                                                <span className="text-[10px] font-normal text-slate-400">
                                                                                                                                    pcs
                                                                                                                                </span>
                                                                                                                            </span>
                                                                                                                            {isAdmin && (
                                                                                                                                <button
                                                                                                                                    type="button"
                                                                                                                                    onClick={() => handleDelete(log)}
                                                                                                                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                                                                                                                    title="Hapus Log Catatan"
                                                                                                                                >
                                                                                                                                    <Trash2 className="w-3 h-3" />
                                                                                                                                </button>
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                );
                                                                                                            })}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            }
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}