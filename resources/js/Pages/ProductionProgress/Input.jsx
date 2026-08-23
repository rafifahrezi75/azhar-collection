import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import CalendarMonth from "@/Components/CalendarMonth";
import { formatDate, formatDateWithDay, todayLocal } from "@/utils/format";
import { ArrowLeft, Calendar, ChevronDown, ChevronLeft, ChevronRight, Filter, Plus, Save, Trash2, UserPlus } from "lucide-react";
import { Toast } from "@/utils/sweetalert";

const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

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
        if (!people.some(p => p.id === a.tailor.id)) people.push(a.tailor);
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
        let bucket = workByUser[uid].find(x => x.product === a.product);
        if (!bucket) {
            bucket = { product: a.product, steps: [] };
            workByUser[uid].push(bucket);
        }
        (a.steps || []).forEach((s) => {
            const remaining = Math.max(0, s.qty - s.done_qty);
            if (remaining > 0 && !bucket.steps.some(x => x.id === s.id)) bucket.steps.push({ id: s.id, name: s.name, remaining });
        });
    });

    const makeCard = () => {
        const uid = people.length === 1 ? String(people[0].id) : "";
        const items = uid ? (workByUser[uid] || []) : [];
        const autoProduct = items.length === 1 ? items[0].product : "";
        return {
            ...emptyCard(applyToAll ? globalDate : (selectedDate || todayLocal())),
            user_id: uid,
            bajuList: [{ product: autoProduct, open: false, lines: [emptyLine()] }],
        };
    };

    const [cards, setCards] = useState(() => [makeCard()]);
    const [submitting, setSubmitting] = useState(false);

    const backUrl = route("production-progress.show", invoice.id);

    const updateCard = (ci, key, value) => setCards(prev => prev.map((c, i) => (i === ci ? { ...c, [key]: value } : c)));
    const setCardUser = (ci, uid) => {
        const items = workByUser[uid] || [];
        const autoProduct = items.length === 1 ? items[0].product : "";
        setCards(prev => prev.map((c, i) => (i === ci ? { ...c, user_id: uid, bajuList: [{ product: autoProduct, open: false, lines: [emptyLine()] }] } : c)));
    };
    const addCard = () => setCards(prev => [...prev, makeCard()]);
    const removeCard = (ci) => setCards(prev => prev.filter((_, i) => i !== ci));

    const updateBaju = (ci, bi, patch) => setCards(prev => prev.map((c, i) => (i === ci ? { ...c, bajuList: c.bajuList.map((b, j) => (j === bi ? { ...b, ...patch } : b)) } : c)));
    const setBajuProduct = (ci, bi, product) => updateBaju(ci, bi, { product, lines: [emptyLine()] });
    const toggleBaju = (ci, bi) => {
        const cur = cards[ci]?.bajuList[bi];
        if (cur) updateBaju(ci, bi, { open: !cur.open });
    };
    const addBaju = (ci) => setCards(prev => prev.map((c, i) => (i === ci ? { ...c, bajuList: [...c.bajuList, emptyBaju()] } : c)));
    const removeBaju = (ci, bi) => setCards(prev => prev.map((c, i) => (i === ci ? { ...c, bajuList: c.bajuList.filter((_, j) => j !== bi) } : c)));

    const updateLine = (ci, bi, li, key, value) => {
        setCards(prev => {
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

    const addLine = (ci, bi) => setCards(prev => {
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
    const removeLine = (ci, bi, li) => setCards(prev => {
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
                        Toast.error(`Lengkapi langkah & jumlah pada baris #${li + 1} (${baju.product}, kartu #${ci + 1}).`);
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
        router.post(route("production-progress.store"), {
            items: cards.flatMap(card => card.bajuList.flatMap(baju => baju.lines.map(line => ({
                production_assignment_step_id: line.step_id,
                date: applyToAll ? globalDate : card.date,
                qty: parseInt(line.qty, 10),
                notes: line.notes || null,
            })))),
        }, {
            onSuccess: () => {
                Toast.success("Progress berhasil disimpan.");
                router.visit(backUrl);
            },
            onError: () => Toast.error("Gagal menyimpan progress."),
            onFinish: () => setSubmitting(false),
        });
    };

    const cellInput = "w-full px-2 py-1.5 text-xs bg-transparent border border-transparent hover:border-slate-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md transition-colors";

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
                setGlobalDate={setGlobalDate}
                applyToAll={applyToAll}
                setApplyToAll={setApplyToAll}
                filterOpen={filterOpen}
                setFilterOpen={setFilterOpen}
                tempDate={tempDate}
                setTempDate={setTempDate}
                tempApply={tempApply}
                setTempApply={setTempApply}
                navigateToSelectedDate={navigateToSelectedDate}
                goToInputDate={goToInputDate}
                backUrl={backUrl}
            />
        );
    }

    return (
        <InputForm
            invoice={invoice}
            work={work}
            workByUser={workByUser}
            people={people}
            cards={cards}
            setCards={setCards}
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
            updateBaju={updateBaju}
            setBajuProduct={setBajuProduct}
            toggleBaju={toggleBaju}
            addBaju={addBaju}
            removeBaju={removeBaju}
            updateLine={updateLine}
            addLine={addLine}
            removeLine={removeLine}
            handleAddSubmit={handleAddSubmit}
            submitting={submitting}
            cellInput={cellInput}
            backUrl={backUrl}
            goToCalendar={goToCalendar}
        />
    );
}

function CalendarView({ invoice, work, calendar, history, globalDate, setGlobalDate, applyToAll, setApplyToAll, filterOpen, setFilterOpen, tempDate, setTempDate, tempApply, setTempApply, navigateToSelectedDate, goToInputDate, backUrl }) {
    const monthsWithData = Object.keys(calendar || {}).sort();
    const today = new Date();
    const defaultKey = monthsWithData.length > 0 ? monthsWithData[monthsWithData.length - 1]
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
    const monthTotalQty = monthLogs.reduce((sum, [, logs]) => sum + logs.reduce((s, l) => s + l.qty, 0), 0);

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
            <Head title={`Input Progress — ${invoice.invoice_number} - Azhar Collection`} />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => router.visit(backUrl)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                            title="Kembali ke Detail Progress"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-base font-bold text-slate-800 leading-tight">Input Progress Harian</h1>
                            <p className="text-[11px] text-slate-400 truncate">{invoice.invoice_number} — {invoice.customer_name}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => goToInputDate(globalDate)}
                        className="h-[36px] inline-flex items-center gap-2 px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Input Progress
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-sm font-bold text-slate-800">
                                        {MONTH_NAMES[calMonth0]} {calYear}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

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

                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-teal-500" /> Ada progress</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-teal-50 border border-teal-200" /> Durasi order</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-800" /> Hari ini</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-slate-700">
                                    Rekap {MONTH_NAMES[calMonth0]} {calYear}
                                </h4>
                                <span className="text-[10px] font-bold text-teal-600">+{monthTotalQty} pcs</span>
                            </div>

                            {itemGroups.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Belum ada data item.</p>
                            ) : (
                                <div className="space-y-3">
                                    {itemGroups.map((g) => {
                                        const pct = g.stepQty > 0 ? Math.min(100, Math.round((g.stepDone / g.stepQty) * 100)) : 0;
                                        return (
                                            <div key={g.product}>
                                                <div className="flex justify-between items-center gap-2 mb-1">
                                                    <p className="text-xs font-semibold text-slate-700 truncate">{g.product}</p>
                                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{g.stepDone}/{g.stepQty} langkah ({pct}%)</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-teal-500"}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {monthLogs.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                                    {monthLogs.map(([date, logs]) => {
                                        const dayTotal = logs.reduce((s, l) => s + l.qty, 0);
                                        const tailorMap = new Map();
                                        logs.forEach((l) => {
                                            if (!tailorMap.has(l.tailor)) tailorMap.set(l.tailor, 0);
                                            tailorMap.set(l.tailor, tailorMap.get(l.tailor) + l.qty);
                                        });
                                        return (
                                            <button
                                                key={date}
                                                type="button"
                                                onClick={() => navigateToSelectedDate(date)}
                                                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-left"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold text-slate-700">{formatDateWithDay(date)}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">
                                                        {Array.from(tailorMap.entries()).map(([name, qty]) => `${name}: ${qty}`).join(", ")}
                                                    </p>
                                                </div>
                                                <span className="text-[11px] font-bold text-teal-600 shrink-0">+{dayTotal} pcs</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function InputForm({ invoice, work, workByUser, people, cards, setCards, selectedDate, globalDate, setGlobalDate, applyToAll, setApplyToAll, filterOpen, setFilterOpen, tempDate, setTempDate, tempApply, setTempApply, updateCard, setCardUser, addCard, removeCard, updateBaju, setBajuProduct, toggleBaju, addBaju, removeBaju, updateLine, addLine, removeLine, handleAddSubmit, submitting, cellInput, backUrl, goToCalendar }) {
    return (
        <DashboardLayout>
            <Head title={`Input Progress — ${invoice.invoice_number} - Azhar Collection`} />

            <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => goToCalendar()}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                            title="Kembali ke Kalender"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-base font-bold text-slate-800 leading-tight">Input Progress Harian</h1>
                            <p className="text-[11px] text-slate-400 truncate">{invoice.invoice_number} — {invoice.customer_name} — {formatDate(selectedDate)}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => { setTempDate(globalDate); setTempApply(applyToAll); setFilterOpen(true); }}
                            className="h-[36px] inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-600 bg-white hover:bg-teal-50 hover:text-teal-700 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                            {applyToAll && (
                                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-700 rounded-full">1</span>
                            )}
                        </button>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <button
                            type="button"
                            onClick={addCard}
                            className="h-[36px] inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-600 bg-white hover:bg-teal-50 hover:text-teal-700 border border-dashed border-slate-300 hover:border-teal-400 rounded-lg transition-colors cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4" />
                            Tambah Karyawan
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || people.length === 0}
                            className="h-[36px] inline-flex items-center gap-2 px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? "Menyimpan..." : "Simpan Progress"}
                        </button>
                    </div>
                </div>

                {people.length === 0 ? (
                    <div className="bg-white rounded-md border border-slate-200 shadow-sm p-8 text-center text-xs text-slate-400 italic">
                        Tidak ada penugasan aktif pada invoice ini.
                    </div>
                ) : (
                    <div className={`grid gap-3 items-start ${cards.length === 1 ? "" : "md:grid-cols-2"}`}>
                        {cards.map((card, ci) => (
                            <div key={ci} className="bg-white rounded-md border border-slate-200 shadow-sm">
                                {applyToAll ? (
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-md">
                                        <select
                                            required
                                            value={card.user_id}
                                            onChange={(e) => setCardUser(ci, e.target.value)}
                                            className="flex-1 min-w-0 px-2.5 py-2 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                                        >
                                            <option value="">-- Pilih Penjahit --</option>
                                            {people.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <span className="text-[10px] text-slate-500 shrink-0 whitespace-nowrap">
                                            Tanggal: <span className="font-semibold text-slate-700">{globalDate}</span>
                                        </span>
                                        {cards.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCard(ci)}
                                                className="w-[36px] h-[36px] shrink-0 inline-flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                title="Hapus kartu karyawan ini"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-md grid-cols-[1fr_150px_36px] items-end">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                                Karyawan <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                required
                                                value={card.user_id}
                                                onChange={(e) => setCardUser(ci, e.target.value)}
                                                className="w-full px-2.5 py-2 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                                            >
                                                <option value="">-- Pilih Penjahit --</option>
                                                {people.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                                Tanggal <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                min={invoice.order_date || ""}
                                                value={card.date}
                                                onChange={(e) => updateCard(ci, "date", e.target.value)}
                                                className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                                            />
                                        </div>
                                        {cards.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCard(ci)}
                                                className="w-[36px] h-[36px] inline-flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                title="Hapus kartu karyawan ini"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="p-3 space-y-2.5">
                                    {card.user_id && card.bajuList.length === 0 && (
                                        <p className="text-xs text-slate-400 italic">Belum ada baju dipilih.</p>
                                    )}

                                    {card.user_id && card.bajuList.map((baju, bi) => {
                                        const entryItems = workByUser[card.user_id] || [];
                                        const entrySteps = baju.product ? ((entryItems.find(i => i.product === baju.product) || {}).steps || []) : [];
                                        const filledSteps = baju.lines.filter(l => l.step_id).length;
                                        const bajuQty = baju.lines.reduce((s, l) => s + (parseInt(l.qty, 10) || 0), 0);
                                        return (
                                            <div key={bi} className="border border-slate-200 rounded-lg overflow-hidden">
                                                <div className={`flex items-center gap-2 px-2.5 py-2 bg-slate-50/80 ${baju.open ? "border-b border-slate-100" : ""}`}>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleBaju(ci, bi)}
                                                        className="w-6 h-6 shrink-0 inline-flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                                        title={baju.open ? "Tutup" : "Buka"}
                                                    >
                                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${baju.open ? "" : "-rotate-90"}`} />
                                                    </button>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-800 truncate">
                                                            {baju.product || `Baju / Item ${bi + 1}`}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {filledSteps}/{baju.lines.length} langkah · {bajuQty} pcs
                                                        </p>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            type="button"
                                                            disabled={!baju.product}
                                                            onClick={() => addLine(ci, bi)}
                                                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 disabled:opacity-40 disabled:cursor-not-allowed border border-teal-200/80 rounded-md transition-colors cursor-pointer"
                                                            title={baju.product ? "Tambah baris langkah produksi" : "Pilih baju terlebih dahulu"}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            Tambah Langkah
                                                        </button>
                                                        {card.bajuList.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeBaju(ci, bi)}
                                                                className="w-6 h-6 inline-flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                                                title="Hapus blok baju ini"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {baju.open && (
                                                    <div className="p-2.5 space-y-2.5">
                                                        {entryItems.length === 0 && (
                                                            <p className="text-xs text-slate-400 italic">Tidak ada penugasan aktif untuk penjahit ini.</p>
                                                        )}

                                                        {entryItems.length > 1 && (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {entryItems.map(it => (
                                                                    <button
                                                                        key={it.product}
                                                                        type="button"
                                                                        onClick={() => setBajuProduct(ci, bi, it.product)}
                                                                        className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                                                                            baju.product === it.product
                                                                                ? "bg-teal-600 text-white border-teal-600 shadow-2xs"
                                                                                : "bg-white text-slate-700 border-slate-300 hover:bg-teal-50 hover:border-teal-300"
                                                                        }`}
                                                                    >
                                                                        {it.product}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {baju.product && (
                                                            <div className="rounded-lg border border-slate-200 overflow-hidden">
                                                                <table className="w-full text-xs">
                                                                    <thead>
                                                                        <tr className="bg-slate-50/80 border-b border-slate-200 text-left">
                                                                            <th className="ps-3 pe-1 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Langkah</th>
                                                                            <th className="px-1 py-1.5 w-[60px] text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                                                                            <th className="px-1 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Catatan</th>
                                                                            <th className="px-2 py-1.5 w-9"></th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-100">
                                                                        {baju.lines.map((line, li) => {
                                                                            const selectedStep = entrySteps.find(s => String(s.id) === String(line.step_id));
                                                                            return (
                                                                                <tr key={li}>
                                                                                    <td className="ps-2 pe-1 py-1">
                                                                                        <select
                                                                                            required
                                                                                            value={line.step_id}
                                                                                            onChange={(e) => updateLine(ci, bi, li, "step_id", e.target.value)}
                                                                                            className={`${cellInput} min-w-[130px]`}
                                                                                        >
                                                                                            <option value="">-- Pilih --</option>
                                                                                            {entrySteps.map(s => (
                                                                                                <option key={s.id} value={s.id}>
                                                                                                    {s.name} — sisa {s.remaining} pcs
                                                                                                </option>
                                                                                            ))}
                                                                                        </select>
                                                                                    </td>
                                                                                    <td className="px-1 py-1">
                                                                                        <input
                                                                                            type="number"
                                                                                            min="1"
                                                                                            required
                                                                                            value={line.qty}
                                                                                            onChange={(e) => updateLine(ci, bi, li, "qty", e.target.value)}
                                                                                            placeholder="0"
                                                                                            className={cellInput}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="px-1 py-1">
                                                                                        <input
                                                                                            type="text"
                                                                                            value={line.notes}
                                                                                            onChange={(e) => updateLine(ci, bi, li, "notes", e.target.value)}
                                                                                            placeholder={selectedStep ? `Sisa ${selectedStep.remaining} pcs` : "Opsional"}
                                                                                            className={cellInput}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="px-1.5 py-1 text-center">
                                                                                        {baju.lines.length > 1 && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => removeLine(ci, bi, li)}
                                                                                                className="w-6 h-6 inline-flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                                                                                title="Hapus langkah ini"
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

                                                        {baju.product && entrySteps.length === 0 && (
                                                            <p className="text-[11px] text-slate-400 italic">Semua langkah untuk baju ini sudah selesai.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {card.user_id && (workByUser[card.user_id]?.length || 0) > card.bajuList.length && (
                                        <button
                                            type="button"
                                            onClick={() => addBaju(ci)}
                                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-dashed border-slate-300 hover:border-teal-400 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Tambah Baju
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </form>

            {filterOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-md max-w-xs w-full p-5 sm:p-6 shadow-xl space-y-4 border border-slate-200 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Filter Tanggal</h3>
                                    <p className="text-xs text-slate-500">Atur tanggal &amp; terapkan ke semua kartu.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFilterOpen(false)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    required
                                    min={invoice.order_date || ""}
                                    value={tempDate}
                                    onChange={(e) => setTempDate(e.target.value)}
                                    className="w-full h-[36px] px-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                                />
                            </div>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={tempApply}
                                    onChange={(e) => setTempApply(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                />
                                <span className="text-xs font-medium text-slate-700">Terapkan ke semua kartu karyawan</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3.5 mt-5">
                            <button
                                type="button"
                                onClick={() => setFilterOpen(false)}
                                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setGlobalDate(tempDate);
                                    setApplyToAll(tempApply);
                                    if (tempApply) {
                                        setCards(prev => prev.map(c => ({ ...c, date: tempDate })));
                                    }
                                    setFilterOpen(false);
                                }}
                                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer shadow-xs"
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
