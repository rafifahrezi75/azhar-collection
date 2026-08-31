import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Toast } from "@/utils/sweetalert";
import {
    ArrowLeft,
    ArrowUpRight,
    ArrowDownLeft,
    AlertTriangle,
    Calculator,
    RefreshCw,
    Layers,
    Plus,
    Minus,
    Equal,
    Save,
} from "lucide-react";

export default function Stock({ item, type = "out" }) {
    // State Tab Active ('out' atau 'in')
    const [activeType, setActiveType] = useState(type === "in" ? "in" : "out");
    const isOut = activeType === "out";

    const getFromSource = () => {
        if (typeof window === "undefined") return "show";
        return new URLSearchParams(window.location.search).get("from") === "table"
            ? "table"
            : "show";
    };

    const handleBack = () => {
        const from = getFromSource();
        router.visit(
            from === "table"
                ? "/dashboard/barang"
                : `/dashboard/barang/${item.id}`
        );
    };

    const baseUnitSymbol = item?.unit?.symbol || item?.unit?.name || "pcs";
    const availableUnits = item?.all_units || [];
    const defaultUnitId = useMemo(() => {
        return item?.unit_id
            ? String(item.unit_id)
            : availableUnits[0]?.unit_id
            ? String(availableUnits[0]?.unit_id)
            : "";
    }, [item, availableUnits]);

    const [isAutoRef, setIsAutoRef] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const generateAutoRef = useCallback((currentIsOut) => {
        const prefix = currentIsOut ? "OUT" : "IN";
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${dateStr}-${rand}`;
    }, []);

    const realStock =
        Number(item?.real_stock) ||
        (item?.is_estimated_stock ? 0 : Number(item?.stock) || 0);
    const estimatedStock =
        Number(item?.estimated_stock) ||
        (item?.is_estimated_stock ? Number(item?.stock) || 0 : 0);

    const [form, setForm] = useState({
        unit_id: defaultUnitId,
        quantity: 1,
        stock_target: "real",
        notes: isOut
            ? "Pengambilan bahan baku untuk proses produksi"
            : "Penerimaan stok bahan baku masuk dari supplier",
        reference_no: generateAutoRef(isOut),
        mutation_date: new Date().toISOString().split("T")[0],
    });

    // Reset Form & Generate Kode Baru saat Tab Berubah
    const handleTabChange = (newType) => {
        if (newType === activeType) return;
        const newIsOut = newType === "out";
        setActiveType(newType);
        setIsAutoRef(true);
        setForm((prev) => ({
            ...prev,
            notes: newIsOut
                ? "Pengambilan bahan baku untuk proses produksi"
                : "Penerimaan stok bahan baku masuk dari supplier",
            reference_no: generateAutoRef(newIsOut),
        }));

        // Sinkronkan query parameter URL tanpa reload halaman
        router.get(
            `/dashboard/barang/${item.id}/stock`,
            { type: newType, from: getFromSource() },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleToggleAutoRef = (checked) => {
        setIsAutoRef(checked);
        if (checked)
            setForm((prev) => ({ ...prev, reference_no: generateAutoRef(isOut) }));
    };

    const handleRefreshRef = () => {
        if (isAutoRef)
            setForm((prev) => ({ ...prev, reference_no: generateAutoRef(isOut) }));
    };

    const selectedUnitObj = useMemo(() => {
        return (
            availableUnits.find(
                (u) => String(u.unit_id) === String(form.unit_id)
            ) || {
                unit_id: item?.unit_id,
                name: item?.unit?.name,
                symbol: baseUnitSymbol,
                multiplier: 1,
            }
        );
    }, [availableUnits, form.unit_id, item, baseUnitSymbol]);

    const multiplier = selectedUnitObj.multiplier || 1;
    const qty = Math.max(1, parseInt(form.quantity || 1, 10));
    const totalBaseQty = qty * multiplier;
    const currentStock = parseInt(item?.stock || 0, 10);
    const projectedStock = isOut
        ? currentStock - totalBaseQty
        : currentStock + totalBaseQty;
    const isStockInsufficient = isOut && projectedStock < 0;
    const unitCards = item?.unit_cards || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isStockInsufficient) return;
        setSubmitting(true);
        try {
            const res = await axios.post(`/api/items/${item.id}/adjust-stock`, {
                type: activeType,
                unit_id: form.unit_id,
                quantity: qty,
                stock_target: form.stock_target,
                notes: form.notes,
                reference_no: form.reference_no,
                mutation_date: form.mutation_date,
            });
            Toast.success(res.data.message || "Mutasi stok berhasil dicatat.");
            router.visit(`/dashboard/barang/${item.id}`);
        } catch (err) {
            Toast.error(
                err.response?.data?.message ||
                    "Terjadi kesalahan saat memproses mutasi stok."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!item) {
        return (
            <DashboardLayout>
                <Head title="Bahan Baku Tidak Ditemukan" />
                <div className="flex items-center justify-center h-64">
                    <p className="text-sm text-slate-500 font-medium">
                        Bahan baku tidak ditemukan
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Head
                title={`${isOut ? "Ambil" : "Tambah"} Stok - ${item.name} - Azhar Collection`}
            />
            <div className="space-y-4 max-w-7xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    {/* HEADER TOP BAR WITH EMBEDDED TABS & PRIMARY SAVE BUTTON */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <button
                                type="button"
                                title={getFromSource() === "table" ? "Kembali" : "Kembali"}
                                onClick={handleBack}
                                className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>

                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                    Transaksi Mutasi Stok
                                </h3>
                                <p className="text-[11px] text-slate-500 truncate">
                                    {item.name}{" "}
                                    <span className="font-mono font-bold text-slate-700">
                                        ({item.code})
                                    </span>{" "}
                                    &bull; {item.category?.name || "Bahan Baku"}
                                </p>
                            </div>
                        </div>

                        {/* RIGHT ACTION: COLOR-CODED TABS WITH BACKGROUND & SAVE BUTTON */}
                        <div className="flex items-center gap-4">
                            {/* TAB SELECTION */}
                            <div className="flex items-center gap-2 h-8 border-b border-slate-200/80">
                                {/* TAB TAMBAH STOK (HIJAU) */}
                                <button
                                    type="button"
                                    onClick={() => handleTabChange("in")}
                                    className={`inline-flex items-center gap-1.5 h-full px-2.5 text-xs font-semibold rounded-t-md transition-all cursor-pointer border-b-2 -mb-px ${
                                        activeType === "in"
                                            ? "border-emerald-600 text-emerald-700 bg-emerald-50/80 font-bold"
                                            : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                    }`}
                                >
                                    <ArrowDownLeft
                                        className={`w-3.5 h-3.5 ${
                                            activeType === "in" ? "text-emerald-600" : "text-slate-400"
                                        }`}
                                    />
                                    <span>Tambah Stok</span>
                                </button>

                                {/* TAB AMBIL STOK (KUNING / AMBER) */}
                                <button
                                    type="button"
                                    onClick={() => handleTabChange("out")}
                                    className={`inline-flex items-center gap-1.5 h-full px-2.5 text-xs font-semibold rounded-t-md transition-all cursor-pointer border-b-2 -mb-px ${
                                        activeType === "out"
                                            ? "border-amber-600 text-amber-800 bg-amber-50/80 font-bold"
                                            : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                    }`}
                                >
                                    <ArrowUpRight
                                        className={`w-3.5 h-3.5 ${
                                            activeType === "out" ? "text-amber-600" : "text-slate-400"
                                        }`}
                                    />
                                    <span>Ambil Stok</span>
                                </button>
                            </div>

                            {/* TOMBOL SIMPAN UTAMA */}
                            <button
                                type="submit"
                                title={submitting ? "Menyimpan..." : "Simpan"}
                                disabled={submitting || isStockInsufficient}
                                className={`w-8 h-8 shrink-0 inline-flex items-center justify-center text-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
                                    isStockInsufficient
                                        ? "bg-slate-400 cursor-not-allowed"
                                        : "bg-teal-600 hover:bg-teal-700"
                                }`}
                            >
                                <Save className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* FORM CONTENT */}
                    <div className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                            {/* KOLOM KIRI: Ringkasan Stok & Kalkulator Live */}
                            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                                <div className="space-y-4">
                                    {/* Stok Fisik Saat Ini */}
                                    <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 space-y-3 shadow-2xs">
                                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-teal-600" />
                                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                    Stok Fisik Saat Ini
                                                </h4>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                                {unitCards.length > 0
                                                    ? `${unitCards.length} Satuan`
                                                    : "1 Satuan"}
                                            </span>
                                        </div>

                                        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                                                Rincian Stok Terbaca:
                                            </span>
                                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 font-mono leading-relaxed">
                                                {item.dual_stock_breakdown_text ||
                                                    item.stock_breakdown_text ||
                                                    `${item.stock} ${baseUnitSymbol}`}
                                            </h4>
                                        </div>

                                        {unitCards.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                {unitCards.map((c, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-white p-2.5 rounded-md border border-slate-200/80 shadow-2xs text-xs"
                                                    >
                                                        <span className="text-slate-500 font-semibold block truncate text-[10px] uppercase tracking-wider">
                                                            {c.unit_name} ({c.unit_symbol})
                                                        </span>
                                                        <span className="font-extrabold font-mono text-slate-900 text-xs sm:text-sm block mt-0.5">
                                                            {c.total_text}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 bg-white/60 px-2.5 py-1.5 rounded-md">
                                            <span className="text-slate-600 font-semibold">
                                                Total Akumulasi Konversi:
                                            </span>
                                            <span className="font-mono font-extrabold text-teal-800">
                                                {item.stock} {baseUnitSymbol}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Kartu Simulasi & Mutasi Live */}
                                    <div
                                        className={`p-4 rounded-lg border shadow-2xs space-y-3 transition-all ${
                                            isStockInsufficient
                                                ? "bg-rose-50/80 border-rose-200 text-rose-900"
                                                : "bg-slate-50/50 border-slate-200 text-slate-800"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                                            <Calculator className="w-4 h-4 text-teal-600" />
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                Simulasi & Kalkulasi Mutasi
                                            </h4>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-slate-200/90 shadow-2xs space-y-2 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 font-medium">
                                                    Stok Awal Dasar:
                                                </span>
                                                <span className="font-mono font-bold text-slate-800">
                                                    {currentStock} {baseUnitSymbol}
                                                </span>
                                            </div>

                                            <div
                                                className={`flex items-center justify-between font-bold p-2 rounded-md ${
                                                    isOut
                                                        ? "bg-amber-50 text-amber-900 border border-amber-200/90"
                                                        : "bg-emerald-50 text-emerald-900 border border-emerald-200/90"
                                                }`}
                                            >
                                                <span className="inline-flex items-center gap-1.5">
                                                    {isOut ? (
                                                        <Minus className="w-3.5 h-3.5 text-amber-700" />
                                                    ) : (
                                                        <Plus className="w-3.5 h-3.5 text-emerald-700" />
                                                    )}
                                                    <span>
                                                        {isOut ? "Pengurangan" : "Penambahan"}{" "}
                                                        ({qty} {selectedUnitObj.symbol}):
                                                    </span>
                                                </span>
                                                <span className="font-mono font-extrabold text-sm">
                                                    {isOut ? "-" : "+"} {totalBaseQty}{" "}
                                                    {baseUnitSymbol}
                                                </span>
                                            </div>

                                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold">
                                                <span className="text-slate-700 inline-flex items-center gap-1">
                                                    <Equal className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>
                                                        {isOut
                                                            ? "Proyeksi Sisa Stok:"
                                                            : "Proyeksi Total Stok Baru:"}
                                                    </span>
                                                </span>
                                                <span
                                                    className={`font-mono text-base font-extrabold ${
                                                        isStockInsufficient
                                                            ? "text-rose-600"
                                                            : isOut
                                                            ? "text-amber-700"
                                                            : "text-emerald-700"
                                                    }`}
                                                >
                                                    {projectedStock} {baseUnitSymbol}
                                                </span>
                                            </div>
                                        </div>

                                        {isStockInsufficient && (
                                            <div className="p-2.5 bg-rose-100/90 rounded-lg text-xs font-semibold text-rose-900 flex items-start gap-2 border border-rose-200">
                                                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                                                <div>
                                                    <p className="font-bold">Stok tidak mencukupi!</p>
                                                    <p className="text-[11px] text-rose-800 font-normal mt-0.5">
                                                        Jumlah pengambilan melebihi total stok fisik yang tersedia ({currentStock} {baseUnitSymbol}).
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* KOLOM KANAN: Input Form Mutasi */}
                            <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs h-full flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="border-b border-slate-100 pb-2">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                            Formulir {isOut ? "Pengambilan" : "Penerimaan"} Stok
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Isi rincian mutasi stok untuk memperbarui persediaan secara akurat.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Satuan Mutasi <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                value={form.unit_id}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        unit_id: e.target.value,
                                                    }))
                                                }
                                                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-semibold text-slate-800"
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
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        quantity: e.target.value,
                                                    }))
                                                }
                                                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            {isOut
                                                ? "Ambil Dari Jenis Stok"
                                                : "Alokasi Jenis Stok"}{" "}
                                            <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={form.stock_target}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    stock_target: e.target.value,
                                                }))
                                            }
                                            className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-medium text-slate-800"
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                                    No. Referensi
                                                </label>
                                                <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAutoRef}
                                                        onChange={(e) =>
                                                            handleToggleAutoRef(
                                                                e.target.checked,
                                                            )
                                                        }
                                                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                                                    />
                                                    <span className="text-[11px] font-semibold text-slate-600">
                                                        Otomatis
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={form.reference_no}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            reference_no: e.target.value,
                                                        }))
                                                    }
                                                    readOnly={isAutoRef}
                                                    placeholder={isOut ? "OUT-12345" : "IN-12345"}
                                                    className={`w-full border rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold ${
                                                        isAutoRef
                                                            ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                                                            : "bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                    }`}
                                                />
                                                {isAutoRef && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRefreshRef}
                                                        title="Generate Ulang Kode"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
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
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        mutation_date: e.target.value,
                                                    }))
                                                }
                                                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Keperluan / Catatan Mutasi <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={form.notes}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    notes: e.target.value,
                                                }))
                                            }
                                            placeholder={
                                                isOut
                                                    ? "Contoh: Pemotongan kain pola gamis batch #1"
                                                    : "Contoh: Penerimaan bahan baku dari supplier"
                                            }
                                            className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none font-medium text-slate-800"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
