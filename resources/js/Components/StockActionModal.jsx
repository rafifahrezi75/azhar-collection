import React, { memo, useState, useEffect, useMemo, useCallback } from "react";
import {
    X,
    ArrowUpRight,
    ArrowDownLeft,
    AlertTriangle,
    Calculator,
    RefreshCw,
    Layers,
    Plus,
    Minus,
    Equal
} from "lucide-react";

const StockActionModal = memo(function StockActionModal({
    isOpen,
    item,
    type = "out", // "out" | "in"
    submitting = false,
    onClose,
    onSubmit,
}) {
    if (!isOpen || !item) return null;

    const isOut = type === "out";
    const baseUnitSymbol = item.unit?.symbol || item.unit?.name || "pcs";
    const availableUnits = item.all_units || [];

    const defaultUnitId = useMemo(() => {
        return item.unit_id ? String(item.unit_id) : (availableUnits[0]?.unit_id ? String(availableUnits[0]?.unit_id) : "");
    }, [item.unit_id, availableUnits]);

    const [isAutoRef, setIsAutoRef] = useState(true);

    const generateAutoRef = useCallback(() => {
        const prefix = isOut ? "OUT" : "IN";
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${dateStr}-${rand}`;
    }, [isOut]);

    const realStock = Number(item.real_stock) || (item.is_estimated_stock ? 0 : Number(item.stock) || 0);
    const estimatedStock = Number(item.estimated_stock) || (item.is_estimated_stock ? Number(item.stock) || 0 : 0);

    const [form, setForm] = useState({
        unit_id: defaultUnitId,
        quantity: 1,
        stock_target: "real",
        notes: "",
        reference_no: "",
        mutation_date: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        setIsAutoRef(true);
        setForm({
            unit_id: defaultUnitId,
            quantity: 1,
            stock_target: "real",
            notes: isOut ? "Pengambilan bahan baku untuk proses produksi" : "Penerimaan stok bahan baku masuk dari supplier",
            reference_no: generateAutoRef(),
            mutation_date: new Date().toISOString().split("T")[0],
        });
    }, [item, isOut, defaultUnitId, generateAutoRef]);

    const handleToggleAutoRef = (checked) => {
        setIsAutoRef(checked);
        if (checked) {
            setForm((prev) => ({ ...prev, reference_no: generateAutoRef() }));
        }
    };

    const handleRefreshRef = () => {
        if (isAutoRef) {
            setForm((prev) => ({ ...prev, reference_no: generateAutoRef() }));
        }
    };

    const selectedUnitObj = useMemo(() => {
        return availableUnits.find((u) => String(u.unit_id) === String(form.unit_id)) || {
            unit_id: item.unit_id,
            name: item.unit?.name,
            symbol: baseUnitSymbol,
            multiplier: 1,
        };
    }, [availableUnits, form.unit_id, item.unit_id, item.unit, baseUnitSymbol]);

    const multiplier = selectedUnitObj.multiplier || 1;
    const qty = Math.max(1, parseInt(form.quantity || 1, 10));
    const totalBaseQty = qty * multiplier;
    const currentStock = parseInt(item.stock || 0, 10);

    const projectedStock = isOut
        ? currentStock - totalBaseQty
        : currentStock + totalBaseQty;

    const isStockInsufficient = isOut && projectedStock < 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isStockInsufficient) return;
        onSubmit({
            type,
            unit_id: form.unit_id,
            quantity: qty,
            stock_target: form.stock_target,
            notes: form.notes,
            reference_no: form.reference_no,
            mutation_date: form.mutation_date,
        });
    };

    const unitCards = item.unit_cards || [];

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-3xl w-full p-4 sm:p-5 shadow-soft-xl border border-slate-100 animate-in zoom-in-95 duration-150 my-auto">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold border ${
                            isOut ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                        }`}>
                            {isOut ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                {isOut ? "Ambil / Potong Stok Bahan Baku" : "Tambah / Terima Stok Bahan Baku"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {item.name} <span className="font-mono font-bold text-slate-700">({item.code})</span> &bull; {item.category?.name || "Bahan Baku"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form & Info Grid Layout (Side-by-Side) */}
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        
                        {/* Left Column: Current Physical Stock & Math Calculation Card */}
                        <div className="md:col-span-5 space-y-3">
                            {/* Current Physical Breakdown */}
                            <div className="p-3 bg-slate-50/90 rounded-md border border-slate-200 space-y-2 text-xs shadow-2xs">
                                <div className="flex items-center gap-1.5 text-slate-700 font-semibold uppercase text-[11px] tracking-wider">
                                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Stok Fisik Saat Ini</span>
                                </div>
                                <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm bg-white p-2 rounded border border-slate-200/80 leading-relaxed">
                                    {item.dual_stock_breakdown_text || item.stock_breakdown_text || `${item.stock} ${baseUnitSymbol}`}
                                </div>

                                {unitCards.length > 0 && (
                                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                                        {unitCards.map((c, idx) => (
                                            <div key={idx} className="bg-white p-1.5 rounded border border-slate-200 text-[11px]">
                                                <span className="text-slate-500 font-medium block truncate">{c.unit_name}</span>
                                                <span className="font-bold font-mono text-slate-800">{c.total_text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500">Total Akumulasi:</span>
                                    <span className="font-mono font-bold text-teal-800">
                                        {item.stock} {baseUnitSymbol}
                                    </span>
                                </div>
                            </div>

                            {/* Calculation Card with Explicit Mathematical Addition / Subtraction */}
                            <div className={`p-3 rounded-md border transition-colors shadow-2xs ${
                                isStockInsufficient
                                    ? "bg-rose-50/90 border-rose-200 text-rose-900"
                                    : "bg-slate-50/90 border-slate-200 text-slate-800"
                            }`}>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                    <Calculator className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Kalkulasi & Mutasi Stok</span>
                                </div>

                                {/* Math Expression Visual Box */}
                                <div className="bg-white p-2.5 rounded-md border border-slate-200 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-medium">Stok Awal:</span>
                                        <span className="font-mono font-bold text-slate-800">{currentStock} {baseUnitSymbol}</span>
                                    </div>

                                    <div className={`flex items-center justify-between text-xs font-bold py-1 px-1.5 rounded ${
                                        isOut ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    }`}>
                                        <span className="inline-flex items-center gap-1">
                                            {isOut ? <Minus className="w-3.5 h-3.5 text-amber-600" /> : <Plus className="w-3.5 h-3.5 text-emerald-600" />}
                                            <span>{isOut ? "Ambil" : "Tambah"} ({qty} {selectedUnitObj.symbol}):</span>
                                        </span>
                                        <span className="font-mono">
                                            {isOut ? "-" : "+"} {totalBaseQty} {baseUnitSymbol}
                                        </span>
                                    </div>

                                    <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                                        <span className="text-slate-700 inline-flex items-center gap-1">
                                            <Equal className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{isOut ? "Sisa Stok Akhir:" : "Total Stok Baru:"}</span>
                                        </span>
                                        <span className={`font-mono text-sm ${
                                            isStockInsufficient ? "text-rose-600" : "text-teal-800"
                                        }`}>
                                            {projectedStock} {baseUnitSymbol}
                                        </span>
                                    </div>
                                </div>

                                {isStockInsufficient && (
                                    <div className="mt-2 p-1.5 bg-rose-100/70 rounded text-[11px] font-medium text-rose-800 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                                        <span>Stok tidak mencukupi! Tersedia: {currentStock} {baseUnitSymbol}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Input Form Fields */}
                        <div className="md:col-span-7 space-y-3">
                            {/* Unit Selection & Quantity */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Satuan Mutasi <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={form.unit_id}
                                        onChange={(e) => setForm((prev) => ({ ...prev, unit_id: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white font-medium"
                                        required
                                    >
                                        {availableUnits.map((u) => (
                                            <option key={u.unit_id} value={u.unit_id}>
                                                {u.label || u.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Jumlah ({selectedUnitObj.symbol}) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.quantity}
                                        onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Target Stok (Nyata vs Estimasi - Direct Choice) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    {isOut ? "Ambil Dari Jenis Stok" : "Alokasi Jenis Stok"} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.stock_target}
                                    onChange={(e) => setForm((prev) => ({ ...prev, stock_target: e.target.value }))}
                                    className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white font-medium"
                                >
                                    {isOut ? (
                                        <>
                                            <option value="real">
                                                Stok Nyata ({realStock} {baseUnitSymbol})
                                            </option>
                                            <option value="estimated">
                                                Stok Estimasi ({estimatedStock} {baseUnitSymbol})
                                            </option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="real">
                                                Stok Nyata ({baseUnitSymbol})
                                            </option>
                                            <option value="estimated">
                                                Stok Estimasi ({baseUnitSymbol})
                                            </option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Reference & Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            No. Referensi
                                        </label>
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isAutoRef}
                                                onChange={(e) => handleToggleAutoRef(e.target.checked)}
                                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className="text-[11px] font-medium text-slate-600">Otomatis</span>
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.reference_no}
                                            onChange={(e) => setForm((prev) => ({ ...prev, reference_no: e.target.value }))}
                                            readOnly={isAutoRef}
                                            placeholder="Contoh: OUT-12345"
                                            className={`w-full border rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold transition-all ${
                                                isAutoRef
                                                    ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                                                    : "bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                            }`}
                                        />
                                        {isAutoRef && (
                                            <button
                                                type="button"
                                                onClick={handleRefreshRef}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                                title="Generate No. Referensi Baru"
                                            >
                                                <RefreshCw className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Tanggal Mutasi
                                    </label>
                                    <input
                                        type="date"
                                        value={form.mutation_date}
                                        onChange={(e) => setForm((prev) => ({ ...prev, mutation_date: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Reason / Notes */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Keperluan / Catatan Mutasi <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="2"
                                    value={form.notes}
                                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder={isOut ? "Contoh: Pemotongan kain pola gamis batch #1" : "Contoh: Penerimaan bahan baku dari supplier"}
                                    className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none placeholder-slate-400 font-medium"
                                    required
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={submitting}
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || isStockInsufficient}
                                    className={`px-4 py-1.5 text-white rounded-md text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5 ${
                                        isStockInsufficient
                                            ? "bg-slate-400 cursor-not-allowed"
                                            : isOut
                                            ? "bg-amber-600 hover:bg-amber-700"
                                            : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                                >
                                    {submitting ? (
                                        <span>Memproses...</span>
                                    ) : (
                                        <>
                                            {isOut ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            <span>{isOut ? "Konfirmasi Ambil Stok" : "Simpan Tambah Stok"}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
});

export default StockActionModal;
