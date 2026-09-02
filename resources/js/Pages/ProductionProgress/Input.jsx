import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import CalendarMonth from "@/Components/CalendarMonth";
import { formatDate, formatDateWithDay, todayLocal } from "@/utils/format";
import {
    ArrowLeft,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    Plus,
    Save,
    Trash2,
    UserPlus,
    Receipt,
    Layers,
    User,
    X,
} from "lucide-react";
import { Toast } from "@/utils/sweetalert";

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

const emptyLine = () => ({ step_id: "", qty: "", notes: "" });
const emptyBaju = () => ({ product: "", open: false, lines: [emptyLine()] });
const emptyCard = (date) => ({
    user_id: "",
    date: date || todayLocal(),
    bajuList: [emptyBaju()],
});

export default function Input({ invoice, work, calendar, history, filters }) {
    const selectedDate = filters?.date || null;

    const people = [];
    (work || []).forEach((a) => {
        if (!a.tailor) return;
        if (!people.some((p) => p.id === a.tailor.id)) people.push(a.tailor);
    });

    const [globalDate, setGlobalDate] = useState(selectedDate || todayLocal());
    const [applyToAll, setApplyToAll] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [tempDate, setTempDate] = useState(selectedDate || todayLocal());
    const [tempApply, setTempApply] = useState(false);

    const workByUser = {};
    (work || []).forEach((a) => {
        if (!a.tailor) return;
        const uid = String(a.tailor.id);
        if (!workByUser[uid]) workByUser[uid] = [];
        let bucket = workByUser[uid].find((x) => x.product === a.product);
        if (!bucket) {
            bucket = { product: a.product, steps: [] };
            workByUser[uid].push(bucket);
        }
        (a.steps || []).forEach((s) => {
            const remaining = Math.max(0, s.qty - s.done_qty);
            if (remaining > 0 && !bucket.steps.some((x) => x.id === s.id))
                bucket.steps.push({ id: s.id, name: s.name, remaining });
        });
    });

    const makeCard = () => {
        const uid = people.length === 1 ? String(people[0].id) : "";
        const items = uid ? workByUser[uid] || [] : [];
        const autoProduct = items.length === 1 ? items[0].product : "";
        return {
            ...emptyCard(applyToAll ? globalDate : selectedDate || todayLocal()),
            user_id: uid,
            bajuList: [{ product: autoProduct, open: false, lines: [emptyLine()] }],
        };
    };

    const [cards, setCards] = useState(() => [makeCard()]);
    const [submitting, setSubmitting] = useState(false);

    const backUrl = route("production-progress.show", invoice.id);

    const updateCard = (ci, key, value) =>
        setCards((prev) => prev.map((c, i) => (i === ci ? { ...c, [key]: value } : c)));

    const setCardUser = (ci, uid) => {
        const items = workByUser[uid] || [];
        const autoProduct = items.length === 1 ? items[0].product : "";
        setCards((prev) =>
            prev.map((c, i) =>
                i === ci
                    ? {
                          ...c,
                          user_id: uid,
                          bajuList: [{ product: autoProduct, open: false, lines: [emptyLine()] }],
                      }
                    : c
            )
        );
    };

    const addCard = () => setCards((prev) => [...prev, makeCard()]);
    const removeCard = (ci) => setCards((prev) => prev.filter((_, i) => i !== ci));

    const updateBaju = (ci, bi, patch) =>
        setCards((prev) =>
            prev.map((c, i) =>
                i === ci
                    ? {
                          ...c,
                          bajuList: c.bajuList.map((b, j) => (j === bi ? { ...b, ...patch } : b)),
                      }
                    : c
            )
        );

    const setBajuProduct = (ci, bi, product) =>
        updateBaju(ci, bi, { product, lines: [emptyLine()] });

    const toggleBaju = (ci, bi) => {
        const cur = cards[ci]?.bajuList[bi];
        if (cur) updateBaju(ci, bi, { open: !cur.open });
    };

    const addBaju = (ci) =>
        setCards((prev) =>
            prev.map((c, i) =>
                i === ci ? { ...c, bajuList: [...c.bajuList, emptyBaju()] } : c
            )
        );

    const removeBaju = (ci, bi) =>
        setCards((prev) =>
            prev.map((c, i) =>
                i === ci ? { ...c, bajuList: c.bajuList.filter((_, j) => j !== bi) } : c
            )
        );

    const updateLine = (ci, bi, li, key, value) => {
        setCards((prev) => {
            const newCards = [...prev];
            const card = newCards[ci];
            if (!card) return newCards;
            const newBajuList = [...card.bajuList];
            const b = newBajuList[bi];
            if (!b) return newCards;
            const newLines = [...b.lines];
            newLines[li] = { ...newLines[li], [key]: value };
            newBajuList[bi] = { ...b, lines: newLines };
            newCards[ci] = { ...card, bajuList: newBajuList };
            return newCards;
        });
    };

    const addLine = (ci, bi) =>
        setCards((prev) => {
            const newCards = [...prev];
            const card = newCards[ci];
            if (!card) return newCards;
            const newBajuList = [...card.bajuList];
            const b = newBajuList[bi];
            if (!b) return newCards;
            newBajuList[bi] = { ...b, open: true, lines: [...b.lines, emptyLine()] };
            newCards[ci] = { ...card, bajuList: newBajuList };
            return newCards;
        });

    const removeLine = (ci, bi, li) =>
        setCards((prev) => {
            const newCards = [...prev];
            const card = newCards[ci];
            if (!card) return newCards;
            const newBajuList = [...card.bajuList];
            const b = newBajuList[bi];
            if (!b) return newCards;
            newBajuList[bi] = { ...b, lines: b.lines.filter((_, k) => k !== li) };
            newCards[ci] = { ...card, bajuList: newBajuList };
            return newCards;
        });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        let invalidBaju = null;
        for (const [ci, card] of cards.entries()) {
            const cardDate = applyToAll ? globalDate : card.date;
            if (!card.user_id || !cardDate) {
                Toast.error(`Lengkapi penjahit & tanggal pada kartu #${ci + 1}.`);
                return;
            }
            for (const [bi, baju] of card.bajuList.entries()) {
                if (!baju.product) {
                    invalidBaju = [ci, bi];
                    Toast.error(`Pilih baju pada blok #${bi + 1} di kartu #${ci + 1}.`);
                    break;
                }
                for (const [li, line] of baju.lines.entries()) {
                    if (!line.step_id || !line.qty || parseInt(line.qty, 10) < 1) {
                        invalidBaju = [ci, bi];
                        Toast.error(
                            `Lengkapi langkah & jumlah pada baris #${li + 1} (${baju.product}, kartu #${ci + 1}).`
                        );
                        break;
                    }
                }
                if (invalidBaju) break;
            }
            if (invalidBaju) break;
        }
        if (invalidBaju) {
            updateBaju(invalidBaju[0], invalidBaju[1], { open: true });
            return;
        }
        setSubmitting(true);
        router.post(
            route("production-progress.store"),
            {
                items: cards.flatMap((card) =>
                    card.bajuList.flatMap((baju) =>
                        baju.lines.map((line) => ({
                            production_assignment_step_id: line.step_id,
                            date: applyToAll ? globalDate : card.date,
                            qty: parseInt(line.qty, 10),
                            notes: line.notes || null,
                        }))
                    )
                ),
            },
            {
                onSuccess: () => {
                    Toast.success("Progress berhasil disimpan.");
                    router.visit(backUrl);
                },
                onError: () => Toast.error("Gagal menyimpan progress."),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const inputUrl = route("production-progress.input", invoice.id);

    const goToInputDate = (dateStr) => {
        router.get(inputUrl, { date: dateStr }, { preserveState: true, replace: true });
    };

    const goToCalendar = () => {
        router.get(inputUrl, {}, { preserveState: true, replace: true });
    };

    const navigateToSelectedDate = (dateStr) => {
        if (selectedDate === dateStr) {
            goToCalendar();
        } else {
            goToInputDate(dateStr);
        }
    };

    if (!selectedDate) {
        return (
            <CalendarView
                invoice={invoice}
                work={work}
                calendar={calendar}
                history={history}
                globalDate={globalDate}
                navigateToSelectedDate={navigateToSelectedDate}
                goToInputDate={goToInputDate}
                backUrl={backUrl}
            />
        );
    }

    return (
        <InputForm
            invoice={invoice}
            workByUser={workByUser}
            people={people}
            cards={cards}
            selectedDate={selectedDate}
            globalDate={globalDate}
            setGlobalDate={setGlobalDate}
            applyToAll={applyToAll}
            setApplyToAll={setApplyToAll}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            tempDate={tempDate}
            setTempDate={setTempDate}
            tempApply={tempApply}
            setTempApply={setTempApply}
            updateCard={updateCard}
            setCardUser={setCardUser}
            addCard={addCard}
            removeCard={removeCard}
            setBajuProduct={setBajuProduct}
            toggleBaju={toggleBaju}
            addBaju={addBaju}
            removeBaju={removeBaju}
            updateLine={updateLine}
            addLine={addLine}
            removeLine={removeLine}
            handleAddSubmit={handleAddSubmit}
            submitting={submitting}
            backUrl={backUrl}
            setCards={setCards}
        />
    );
}

function CalendarView({
    invoice,
    work,
    calendar,
    history,
    globalDate,
    navigateToSelectedDate,
    goToInputDate,
    backUrl,
}) {
    const monthsWithData = Object.keys(calendar || {}).sort();
    const today = new Date();
    const defaultKey =
        monthsWithData.length > 0
            ? monthsWithData[monthsWithData.length - 1]
            : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const [calKey, setCalKey] = useState(defaultKey);
    const [calYear, calMonth] = calKey.split("-").map(Number);
    const calMonth0 = calMonth - 1;

    const daysMap = calendar?.[calKey] || {};

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

    const groupedHistory = Object.entries(
        (history || []).reduce((acc, log) => {
            (acc[log.date] = acc[log.date] || []).push(log);
            return acc;
        }, {})
    ).sort((a, b) => b[0].localeCompare(a[0]));

    const monthLogs = groupedHistory.filter(([date]) => date.startsWith(calKey));
    const monthTotalQty = monthLogs.reduce(
        (sum, [, logs]) => sum + logs.reduce((s, l) => s + l.qty, 0),
        0
    );

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
        return Array.from(map.values());
    })();

    return (
        <DashboardLayout>
            <Head title={`Input Progress #${invoice.invoice_number} - Azhar Collection`} />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => router.visit(backUrl)}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                    title="Kembali ke Detail Progress"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Receipt className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                            Input Progress Harian
                                        </h3>
                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold shadow-2xs">
                                            #{invoice.invoice_number}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {invoice.customer_name || "Pelanggan Umum"} &bull; Pilih tanggal pada kalender untuk mencatat output jahit.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => goToInputDate(globalDate)}
                                    className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-semibold rounded-lg border border-teal-200 shadow-2xs transition-all cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Input Hari Ini</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            {/* KOLOM KIRI: Kalender */}
                            <div className="lg:col-span-5 space-y-4">
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
                                            selectedDate={null}
                                            onSelectDate={navigateToSelectedDate}
                                            filteredDate={null}
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
                                    </div>
                                </div>
                            </div>

                            {/* KOLOM KANAN: Rekap Bulan Ini & Riwayat Input */}
                            <div className="lg:col-span-7 space-y-4">
                                <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 border border-slate-200 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                        <span className="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
                                            <Layers className="w-4 h-4 text-teal-600" />
                                            Rekapitulasi {MONTH_NAMES[calMonth0]} {calYear}
                                        </span>
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                            +{monthTotalQty} Pcs Selesai
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {itemGroups.map((g) => {
                                            const pct =
                                                g.stepQty > 0
                                                    ? Math.min(100, Math.round((g.stepDone / g.stepQty) * 100))
                                                    : 0;
                                            return (
                                                <div
                                                    key={g.product}
                                                    className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1.5"
                                                >
                                                    <div className="flex justify-between items-center gap-2 text-xs">
                                                        <span className="font-bold text-slate-800 truncate">
                                                            {g.product}
                                                        </span>
                                                        <span className="font-mono text-[10px] text-slate-500 font-bold">
                                                            {g.stepDone}/{g.stepQty} langkah ({pct}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Log Catatan Input */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                            Pilih Tanggal Riwayat
                                        </h4>
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                            {monthLogs.length} Hari Aktif
                                        </span>
                                    </div>

                                    {monthLogs.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-xs bg-slate-50/50 rounded-lg border border-slate-200">
                                            Belum ada catatan progress pada bulan yang dipilih.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {monthLogs.map(([date, logs]) => {
                                                const dayTotal = logs.reduce((s, l) => s + l.qty, 0);
                                                const tailorMap = new Map();
                                                logs.forEach((l) => {
                                                    if (!tailorMap.has(l.tailor))
                                                        tailorMap.set(l.tailor, 0);
                                                    tailorMap.set(
                                                        l.tailor,
                                                        tailorMap.get(l.tailor) + l.qty
                                                    );
                                                });
                                                return (
                                                    <button
                                                        key={date}
                                                        type="button"
                                                        onClick={() => navigateToSelectedDate(date)}
                                                        className="w-full flex items-center justify-between gap-2 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer text-left"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-slate-800">
                                                                {formatDateWithDay(date)}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                                                {Array.from(tailorMap.entries())
                                                                    .map(([name, qty]) => `${name}: ${qty} pcs`)
                                                                    .join(" • ")}
                                                            </p>
                                                        </div>
                                                        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded shrink-0">
                                                            +{dayTotal} pcs
                                                        </span>
                                                    </button>
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

function InputForm({
    invoice,
    workByUser,
    people,
    cards,
    selectedDate,
    globalDate,
    setGlobalDate,
    applyToAll,
    setApplyToAll,
    filterOpen,
    setFilterOpen,
    tempDate,
    setTempDate,
    tempApply,
    setTempApply,
    updateCard,
    setCardUser,
    addCard,
    removeCard,
    setBajuProduct,
    toggleBaju,
    addBaju,
    removeBaju,
    updateLine,
    addLine,
    removeLine,
    handleAddSubmit,
    submitting,
    backUrl,
    setCards,
}) {
    return (
        <DashboardLayout>
            <Head title={`Input Progress #${invoice.invoice_number} - Azhar Collection`} />

            <form onSubmit={handleAddSubmit} className="space-y-4 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => router.visit(backUrl)}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                    title="Kembali ke Detail Progress"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Receipt className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                            Form Input Progress
                                        </h3>
                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold shadow-2xs">
                                            {formatDate(selectedDate)}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        #{invoice.invoice_number} &bull; {invoice.customer_name || "Pelanggan Umum"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTempDate(globalDate);
                                        setTempApply(applyToAll);
                                        setFilterOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-300 shadow-2xs transition-all cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Filter Tanggal</span>
                                    {applyToAll && (
                                        <span className="ml-0.5 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-teal-100 text-teal-800 rounded-full">
                                            Semua
                                        </span>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={addCard}
                                    className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-300 shadow-2xs transition-all cursor-pointer"
                                >
                                    <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Tambah Karyawan</span>
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting || people.length === 0}
                                    className="inline-flex items-center gap-1.5 h-8 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{submitting ? "Menyimpan..." : "Simpan Progress"}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="p-4 sm:p-5">
                        {people.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-xs bg-slate-50/50 rounded-lg border border-slate-200">
                                Tidak ada penugasan kerja karyawan aktif pada invoice ini.
                            </div>
                        ) : (
                            <div
                                className={`grid gap-4 items-start ${
                                    cards.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
                                }`}
                            >
                                {cards.map((card, ci) => (
                                    <div
                                        key={ci}
                                        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
                                    >
                                        {/* Card Header Karyawan & Tanggal */}
                                        <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200/80 shadow-2xs shrink-0">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <select
                                                    required
                                                    value={card.user_id}
                                                    onChange={(e) => setCardUser(ci, e.target.value)}
                                                    className="flex-1 min-w-0 h-8 px-2.5 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg bg-white shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                                >
                                                    <option value="">-- Pilih Penjahit --</option>
                                                    {people.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {!applyToAll && (
                                                <input
                                                    type="date"
                                                    required
                                                    min={invoice.order_date || ""}
                                                    value={card.date}
                                                    onChange={(e) => updateCard(ci, "date", e.target.value)}
                                                    className="h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                                />
                                            )}

                                            {applyToAll && (
                                                <span className="font-mono text-[11px] font-bold text-slate-600 px-2 py-1 bg-white border border-slate-200 rounded-md shadow-2xs shrink-0">
                                                    {globalDate}
                                                </span>
                                            )}

                                            {cards.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCard(ci)}
                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200 transition-colors cursor-pointer shrink-0"
                                                    title="Hapus form karyawan ini"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Card Body: Daftar Baju & Langkah */}
                                        <div className="p-3.5 space-y-3">
                                            {card.user_id && card.bajuList.length === 0 && (
                                                <p className="text-xs text-slate-400 italic text-center py-2">
                                                    Belum ada baju yang dipilih.
                                                </p>
                                            )}

                                            {card.user_id &&
                                                card.bajuList.map((baju, bi) => {
                                                    const entryItems = workByUser[card.user_id] || [];
                                                    const entrySteps = baju.product
                                                        ? (entryItems.find((i) => i.product === baju.product) || {}).steps || []
                                                        : [];
                                                    const filledSteps = baju.lines.filter((l) => l.step_id).length;
                                                    const bajuQty = baju.lines.reduce(
                                                        (s, l) => s + (parseInt(l.qty, 10) || 0),
                                                        0
                                                    );

                                                    return (
                                                        <div
                                                            key={bi}
                                                            className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs"
                                                        >
                                                            <div
                                                                className={`p-2.5 bg-slate-50/70 flex items-center justify-between gap-2 ${
                                                                    baju.open ? "border-b border-slate-100" : ""
                                                                }`}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleBaju(ci, bi)}
                                                                    className="flex items-center gap-2 min-w-0 text-left cursor-pointer"
                                                                >
                                                                    <ChevronDown
                                                                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                                                                            baju.open ? "" : "-rotate-90"
                                                                        }`}
                                                                    />
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-bold text-slate-800 truncate">
                                                                            {baju.product || `Item Pakaian ${bi + 1}`}
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-500 font-mono">
                                                                            {filledSteps}/{baju.lines.length} langkah &bull; {bajuQty} pcs
                                                                        </p>
                                                                    </div>
                                                                </button>

                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <button
                                                                        type="button"
                                                                        disabled={!baju.product}
                                                                        onClick={() => addLine(ci, bi)}
                                                                        className="inline-flex items-center gap-1 h-7 px-2 bg-teal-50 hover:bg-teal-100 disabled:opacity-40 text-teal-700 text-[10px] font-semibold rounded-md border border-teal-200/80 transition-colors cursor-pointer"
                                                                        title={baju.product ? "Tambah baris langkah" : "Pilih produk terlebih dahulu"}
                                                                    >
                                                                        <Plus className="w-3 h-3 text-teal-600" />
                                                                        <span>Langkah</span>
                                                                    </button>

                                                                    {card.bajuList.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeBaju(ci, bi)}
                                                                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                                                            title="Hapus blok pakaian ini"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {baju.open && (
                                                                <div className="p-3 space-y-3 bg-white">
                                                                    {entryItems.length > 1 && (
                                                                        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100">
                                                                            {entryItems.map((it) => (
                                                                                <button
                                                                                    key={it.product}
                                                                                    type="button"
                                                                                    onClick={() => setBajuProduct(ci, bi, it.product)}
                                                                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                                                                                        baju.product === it.product
                                                                                            ? "bg-teal-50 text-teal-700 border-teal-300 shadow-2xs font-bold"
                                                                                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                                                    }`}
                                                                                >
                                                                                    {it.product}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {baju.product && (
                                                                        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs overflow-x-auto">
                                                                            <table className="w-full text-left text-xs">
                                                                                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                                                                                    <tr>
                                                                                        <th className="px-3 py-2">Langkah Produksi</th>
                                                                                        <th className="px-3 py-2 w-20 text-center">Kuantitas</th>
                                                                                        <th className="px-3 py-2">Catatan Tambahan</th>
                                                                                        <th className="px-2 py-2 w-8 text-center"></th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                                                                                    {baju.lines.map((line, li) => {
                                                                                        const selectedStep = entrySteps.find(
                                                                                            (s) => String(s.id) === String(line.step_id)
                                                                                        );
                                                                                        return (
                                                                                            <tr key={li} className="hover:bg-slate-50/80">
                                                                                                <td className="px-3 py-1.5">
                                                                                                    <select
                                                                                                        required
                                                                                                        value={line.step_id}
                                                                                                        onChange={(e) =>
                                                                                                            updateLine(ci, bi, li, "step_id", e.target.value)
                                                                                                        }
                                                                                                        className="w-full h-8 px-2 text-xs border border-slate-300 rounded-md bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-medium text-slate-800"
                                                                                                    >
                                                                                                        <option value="">-- Pilih Langkah --</option>
                                                                                                        {entrySteps.map((s) => (
                                                                                                            <option key={s.id} value={s.id}>
                                                                                                                {s.name} (sisa: {s.remaining} pcs)
                                                                                                            </option>
                                                                                                        ))}
                                                                                                    </select>
                                                                                                </td>
                                                                                                <td className="px-2 py-1.5 text-center">
                                                                                                    <input
                                                                                                        type="number"
                                                                                                        min="1"
                                                                                                        required
                                                                                                        value={line.qty}
                                                                                                        onChange={(e) =>
                                                                                                            updateLine(ci, bi, li, "qty", e.target.value)
                                                                                                        }
                                                                                                        placeholder="0"
                                                                                                        className="w-16 h-8 px-2 text-center text-xs font-mono font-bold border border-slate-300 rounded-md bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-800"
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="px-3 py-1.5">
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        value={line.notes}
                                                                                                        onChange={(e) =>
                                                                                                            updateLine(ci, bi, li, "notes", e.target.value)
                                                                                                        }
                                                                                                        placeholder={
                                                                                                            selectedStep
                                                                                                                ? `Sisa kuota ${selectedStep.remaining} pcs`
                                                                                                                : "Catatan opsional"
                                                                                                        }
                                                                                                        className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-md bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-700"
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="px-2 py-1.5 text-center">
                                                                                                    {baju.lines.length > 1 && (
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => removeLine(ci, bi, li)}
                                                                                                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                                                                                            title="Hapus baris langkah ini"
                                                                                                        >
                                                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                    )}
                                                                                                </td>
                                                                                            </tr>
                                                                                        );
                                                                                    })}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                            {card.user_id &&
                                                (workByUser[card.user_id]?.length || 0) > card.bajuList.length && (
                                                    <button
                                                        type="button"
                                                        onClick={() => addBaju(ci)}
                                                        className="w-full h-8 inline-flex items-center justify-center gap-1.5 px-3 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-dashed border-slate-300 hover:border-teal-400 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>Tambah Item Baju</span>
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </form>

            {/* MODAL FILTER TANGGAL */}
            {filterOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
                    onClick={() => setFilterOpen(false)}
                >
                    <div
                        className="relative max-w-sm w-full bg-white rounded-xl border border-slate-200 shadow-2xl p-4 sm:p-5 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs font-bold shrink-0">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                                        Pengaturan Tanggal
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Atur tanggal serentak untuk semua kartu.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFilterOpen(false)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Pilih Tanggal Pengerjaan
                                </label>
                                <input
                                    type="date"
                                    required
                                    min={invoice.order_date || ""}
                                    value={tempDate}
                                    onChange={(e) => setTempDate(e.target.value)}
                                    className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-mono"
                                />
                            </div>

                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={tempApply}
                                    onChange={(e) => setTempApply(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
                                />
                                <span className="text-xs font-medium text-slate-700">
                                    Terapkan ke seluruh kartu penjahit
                                </span>
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={() => setFilterOpen(false)}
                                className="inline-flex items-center h-8 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setGlobalDate(tempDate);
                                    setApplyToAll(tempApply);
                                    if (tempApply) {
                                        setCards((prev) => prev.map((c) => ({ ...c, date: tempDate })));
                                    }
                                    setFilterOpen(false);
                                }}
                                className="inline-flex items-center h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}