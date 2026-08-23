import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import CalendarMonth from "@/Components/CalendarMonth";
import { formatDate, formatDateWithDay, todayLocal } from "@/utils/format";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Circle, Trash2, Plus, Calendar } from "lucide-react";
import { Toast, confirmDialog } from "@/utils/sweetalert";

const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const statusConfig = {
    completed:   { label: "Selesai",       color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    COMPLETED:   { label: "Selesai",       color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    SELESAI:     { label: "Selesai",       color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    in_progress: { label: "Dikerjakan",    color: "bg-amber-50 text-amber-700 border-amber-200" },
    IN_PROGRESS: { label: "Dikerjakan",    color: "bg-amber-50 text-amber-700 border-amber-200" },
    pending:     { label: "Belum Dimulai", color: "bg-slate-100 text-slate-500 border-slate-200" },
    PENDING:     { label: "Belum Dimulai", color: "bg-slate-100 text-slate-500 border-slate-200" },
};

function StatusBadge({ status }) {
    const cfg = statusConfig[status] || statusConfig["pending"];
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${cfg.color}`}>
            {cfg.label}
        </span>
    );
}

export default function Show({ invoice, work, history, calendar, totals, filters }) {
    const { auth } = usePage().props;
    const isAdmin = auth.roles && auth.roles.includes("admin");

    // ---- Calendar state ----
    const todayStr = todayLocal();
    const todayMonth = todayStr.substring(0, 7); // "YYYY-MM"
    const [calKey, setCalKey] = useState(todayMonth);
    const [calYear, calMonth] = calKey.split("-").map(Number);
    const calMonth0 = calMonth - 1;

    // Selected date from URL filter — default to today
    const selectedDate = (filters?.date === undefined || filters?.date === null)
        ? todayLocal()
        : (filters.date || null);

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
        router.get(route("production-progress.show", invoice.id), { date: dateStr === selectedDate ? "" : dateStr }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const daysMap = calendar?.[`${calYear}-${String(calMonth).padStart(2, "0")}`] || {};

    // ---- Overall progress ----
    const doneQty = totals.done_qty || 0;
    const totalQty = totals.total_qty || 0;
    const pct = totalQty > 0 ? Math.min(100, Math.round((doneQty / totalQty) * 100)) : 0;

    // ---- Collapse states ----
    const [openDates, setOpenDates] = useState({});
    const [openPeople, setOpenPeople] = useState({});
    const [itemOpen, setItemOpen] = useState(false);

    const toggleDateOpen = (date) => {
        setOpenDates(prev => ({ ...prev, [date]: !(prev[date] === true) }));
    };

    const togglePersonOpen = (key) => {
        setOpenPeople(prev => ({ ...prev, [key]: !(prev[key] === true) }));
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

    const canEdit = (work || []).some((a) => (a.steps || []).some((s) => s.qty - s.done_qty > 0));

    const itemGroups = (() => {
        const map = new Map();
        (work || []).forEach((a) => {
            const key = a.product;
            if (!map.has(key)) map.set(key, { product: key, qty: 0, stepQty: 0, stepDone: 0 });
            const g = map.get(key);
            g.qty += a.qty;
            (a.steps || []).forEach((x) => {
                g.stepQty += x.qty;
                g.stepDone += x.done_qty;
            });
        });
        return Array.from(map.values()).map((g) => {
            const ipct = g.stepQty > 0 ? Math.min(100, Math.round((g.stepDone / g.stepQty) * 100)) : 0;
            return { ...g, pct: ipct, done: Math.round((g.qty * ipct) / 100) };
        });
    })();

    const invoiceQtyTotal = itemGroups.reduce((sum, g) => sum + g.qty, 0);
    const doneDisplay = Math.round((invoiceQtyTotal * pct) / 100);

    const stepInfo = {};
    (work || []).forEach((a) => {
        (a.steps || []).forEach((s) => { stepInfo[s.id] = s; });
    });

    // History grouped by date desc (single source of truth)
    const groupedHistory = Object.entries(
        (history || []).reduce((acc, log) => {
            (acc[log.date] = acc[log.date] || []).push(log);
            return acc;
        }, {})
    ).sort((a, b) => b[0].localeCompare(a[0]));

    // Filter history by selected date
    const filteredHistory = selectedDate
        ? groupedHistory.filter(([date]) => date === selectedDate)
        : groupedHistory;

    return (
        <DashboardLayout>
            <Head title={`Progress — ${invoice.invoice_number} - Azhar Collection`} />

            <div className="space-y-4">
                {/* Header: back + actions */}
                <div className="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => router.visit(route("production-progress.index"))}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                        title="Kembali ke Progress Penjahit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => router.visit(selectedDate
                                ? route("production-progress.input", { invoice: invoice.id }) + `?date=${selectedDate}`
                                : route("production-progress.input", invoice.id))}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors cursor-pointer shadow-sm"
                            title={selectedDate ? `Input Progress pada ${selectedDate}` : "Input Progress"}
                        >
                            <Plus className="w-4 h-4" />
                            Input Progress
                        </button>
                    )}
                </div>

                {/* Row 1: Invoice info */}
                <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Invoice</p>
                            <p className="text-xl font-bold text-slate-800">{invoice.invoice_number}</p>
                            <p className="text-sm text-slate-500">{invoice.customer_name}</p>
                        </div>
                        <StatusBadge status={totals.status} />
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span>Order: <span className="text-slate-700 font-medium">{formatDate(invoice.order_date)}</span></span>
                        <span>Target Selesai: <span className="text-slate-700 font-medium">{formatDate(invoice.completion_date)}</span></span>
                        <span>Total Target: <span className="text-slate-700 font-medium">{invoiceQtyTotal} pcs</span></span>
                        <span>Penugasan: <span className="text-slate-700 font-medium">{work.length}</span></span>
                    </div>
                </div>

                {/* Progress keseluruhan */}
                <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
                    <div className="flex justify-between items-center gap-3">
                        <p className="text-xs font-semibold text-slate-600 min-w-0">Progress Keseluruhan</p>
                        <div className="flex items-center gap-2 shrink-0">
                            <p className="text-sm font-bold text-teal-600">{doneDisplay} / {invoiceQtyTotal} pcs ({pct}%)</p>
                            {itemGroups.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setItemOpen(prev => !prev)}
                                    title={itemOpen ? "Tutup rincian per item" : "Buka rincian per item"}
                                    className="w-7 h-7 inline-flex items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 rounded-md transition-colors cursor-pointer"
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${itemOpen ? "" : "-rotate-90"}`} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mt-2">
                        <div
                            className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-teal-500"}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>

                    {itemOpen && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            {itemGroups.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Belum ada data item.</p>
                            ) : (
                                <div className="space-y-3">
                                    {itemGroups.map((g) => (
                                        <div key={g.product}>
                                            <div className="flex justify-between items-center gap-2 mb-1">
                                                <p className="text-xs font-semibold text-slate-700 truncate">{g.product}</p>
                                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{g.done}/{g.qty} pcs ({g.pct}%)</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${g.pct >= 100 ? "bg-emerald-500" : g.pct >= 50 ? "bg-amber-400" : "bg-teal-500"}`}
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

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* Right: Riwayat progress per tanggal */}
                    <div className="lg:col-span-3 order-2 lg:order-2">
                        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
                                <h4 className="text-xs font-bold text-slate-700">
                                    Riwayat Progress{selectedDate ? ` — ${formatDateWithDay(selectedDate)}` : ' per Tanggal'}
                                </h4>
                                {selectedDate && canEdit ? (
                                    <button
                                        type="button"
                                        onClick={() => router.visit(route("production-progress.input", { invoice: invoice.id }) + `?date=${selectedDate}`)}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-semibold rounded-md transition-colors cursor-pointer shrink-0"
                                        title="Tambah Progress pada tanggal ini"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Progress
                                    </button>
                                ) : (
                                    <span className="text-[10px] text-slate-400 shrink-0">
                                        {filteredHistory.reduce((sum, [, logs]) => sum + logs.length, 0)} catatan
                                    </span>
                                )}
                            </div>

                            {filteredHistory.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-8 italic">
                                    {selectedDate ? 'Tidak ada catatan pada tanggal ini.' : 'Belum ada riwayat progress.'}
                                </p>
                            ) : (
                                <div className="divide-y divide-slate-100 overflow-y-auto max-h-[400px]">
                                    {filteredHistory.map(([date, logs]) => {
                                        const dayTotal = logs.reduce((s, l) => s + l.qty, 0);
                                        const isOpen = selectedDate ? true : openDates[date] === true;
                                        const tailorGroups = [];
                                        const tMap = new Map();
                                        logs.forEach((l) => {
                                            const key = l.tailor || "-";
                                            if (!tMap.has(key)) {
                                                tMap.set(key, []);
                                                tailorGroups.push({ name: l.tailor, logs: tMap.get(key) });
                                            }
                                            tMap.get(key).push(l);
                                        });
                                        return (
                                            <div key={date}>
                                                {!selectedDate && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleDateOpen(date)}
                                                        className="w-full px-4 py-2 bg-slate-50/70 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
                                                    >
                                                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                                                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`} />
                                                            {formatDateWithDay(date)}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-teal-600">+{dayTotal} pcs</span>
                                                    </button>
                                                )}

                                                {isOpen && (
                                                    <div className="p-2.5 bg-slate-50/30">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {tailorGroups.map((t) => {
                                                                const tTotal = t.logs.reduce((s, l) => s + l.qty, 0);
                                                                const personKey = `${date}|${t.name || "-"}`;
                                                                const isPersonOpen = openPeople[personKey] === true;
                                                                const productMap = new Map();
                                                                t.logs.forEach((l) => {
                                                                    if (!productMap.has(l.product)) productMap.set(l.product, []);
                                                                    productMap.get(l.product).push(l);
                                                                });
                                                                return (
                                                                    <div key={t.name || "none"} className="bg-white border border-slate-200 rounded-lg p-2.5 self-start">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => togglePersonOpen(personKey)}
                                                                            className="w-full flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 rounded-md px-1 py-0.5 transition-colors"
                                                                        >
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                                                    {(t.name || "?").charAt(0).toUpperCase()}
                                                                                </span>
                                                                                <p className="text-xs font-bold text-slate-800 truncate">{t.name || "Tanpa Penjahit"}</p>
                                                                            </div>
                                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-teal-600 whitespace-nowrap shrink-0">
                                                                                {tTotal} pcs
                                                                                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isPersonOpen ? "" : "-rotate-90"}`} />
                                                                            </span>
                                                                        </button>

                                                                        {isPersonOpen && (
                                                                            <div className="mt-2 space-y-1.5">
                                                                                {Array.from(productMap.entries()).map(([product, pLogs]) => {
                                                                                    const pTotal = pLogs.reduce((s, l) => s + l.qty, 0);
                                                                                    return (
                                                                                        <div key={product} className="bg-slate-50/70 border border-slate-100 rounded-md px-2.5 py-2">
                                                                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                                                                <p className="text-[11px] font-bold text-slate-700 truncate">{product}</p>
                                                                                                <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{pTotal} pcs</span>
                                                                                            </div>
                                                                                            <div className="space-y-1">
                                                                                                {pLogs.map(log => {
                                                                                                    const si = stepInfo[log.step_id];
                                                                                                    const selesai = si && si.qty > 0 && si.done_qty >= si.qty;
                                                                                                    return (
                                                                                                        <div key={log.id} className="flex items-start justify-between gap-2 py-0.5">
                                                                                                            <div className="flex items-start gap-1.5 min-w-0">
                                                                                                                {selesai
                                                                                                                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-px" title="Langkah ini sudah selesai" />
                                                                                                                    : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-px" />}
                                                                                                                <div className="min-w-0">
                                                                                                                    <p className={`text-xs truncate ${selesai ? "font-semibold text-emerald-700" : "font-medium text-slate-700"}`}>{log.step_name}</p>
                                                                                                                    {log.notes && <p className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-[320px]">{log.notes}</p>}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                                                                <span className="text-xs font-bold text-slate-700">{log.qty}</span>
                                                                                                                <span className="text-[10px] text-slate-400">pcs</span>
                                                                                                                {isAdmin && (
                                                                                                                    <button onClick={() => handleDelete(log)} className="w-5 h-5 inline-flex items-center justify-center bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded transition-colors cursor-pointer" title="Hapus">
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
                                                                                })}
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

                    {/* Left: Tanggalan */}
                    <div className="lg:col-span-2 order-1 lg:order-1">
                        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-sm font-bold text-slate-800">
                                        {MONTH_NAMES[calMonth0]} {calYear}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer" title="Bulan sebelumnya">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer" title="Bulan berikutnya">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

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

                            {/* Compact legend */}
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-teal-500" /> Ada progress</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-teal-50 border border-teal-200" /> Durasi order</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-800" /> Hari ini</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white border border-slate-200" /> Kosong</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
