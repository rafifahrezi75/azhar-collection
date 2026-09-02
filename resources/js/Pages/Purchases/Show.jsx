import React, { useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    ArrowLeft,
    Receipt,
    User,
    Package,
    CheckCircle2,
    Boxes,
    FileText,
    Calculator,
    Layers,
    DollarSign,
    Store,
    Calendar,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/utils/format";

const resolveUnitMeta = (row) => {
    const chosen = row.unit;
    const item = row.item;
    const baseUnit = item?.unit;
    const isBase = String(row.unit_id) === String(item?.unit_id);
    const conversion = (item?.conversions || []).find(
        (c) => String(c.unit_id) === String(row.unit_id)
    );
    const multiplier = isBase ? 1 : (parseInt(conversion?.multiplier, 10) || 1);
    const name = chosen?.name || conversion?.unit?.name || baseUnit?.name || "-";
    const symbol = chosen?.symbol || conversion?.unit?.symbol || baseUnit?.symbol || "";
    const baseSymbol = baseUnit?.symbol || baseUnit?.name || "pcs";

    return { 
        name, 
        symbol, 
        multiplier, 
        baseSymbol, 
        equivalentQty: Number(row.quantity || 0) * multiplier,
        isBase 
    };
};

export default function Show({ purchase }) {
    if (!purchase) {
        return (
            <DashboardLayout>
                <Head title="Pembelian Tidak Ditemukan" />
                <div className="flex items-center justify-center h-64">
                    <p className="text-sm text-slate-500 font-medium">
                        Data transaksi pembelian tidak ditemukan
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    const items = useMemo(() => purchase.items || [], [purchase.items]);
    const totalQty = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        [items]
    );
    const totalBaseQty = useMemo(
        () => items.reduce((sum, item) => sum + resolveUnitMeta(item).equivalentQty, 0),
        [items]
    );

    return (
        <DashboardLayout>
            <Head title={`#${purchase.reference_no} - Detail Pembelian - Azhar Collection`} />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    title="Kembali ke Daftar Pembelian"
                                    onClick={() => router.visit(route("purchases.index"))}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Receipt className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                            Detail Pembelian
                                        </h3>
                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold shadow-2xs">
                                            #{purchase.reference_no}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        Informasi pengadaan stok bahan baku, rincian konversi satuan, dan nota faktur.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => router.visit(route("purchases.preview", purchase.id))}
                                    className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-semibold rounded-lg border border-teal-200 shadow-2xs transition-all cursor-pointer"
                                    title="Cetak Nota Resmi Pembelian"
                                >
                                    <Receipt className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Cetak Nota</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            {/* KOLOM KIRI: Identitas & Metrik Transaksi */}
                            <div className="lg:col-span-4 space-y-4">
                                {/* Card Status & Identitas Utama */}
                                <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 shadow-2xs space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                Supplier / Toko
                                            </span>
                                            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight truncate mt-0.5">
                                                {purchase.supplier_name || "Tanpa Nama Supplier"}
                                            </h1>
                                            <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                                                <p className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    Tanggal:{" "}
                                                    <strong className="text-slate-800 font-semibold font-mono">
                                                        {formatDate(purchase.date)}
                                                    </strong>
                                                </p>
                                                <p className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    Petugas:{" "}
                                                    <strong className="text-slate-800 font-semibold">
                                                        {purchase.creator?.name || "Admin"}
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>

                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            Masuk
                                        </span>
                                    </div>
                                </div>

                                {/* Ringkasan Finansial & Total Qty */}
                                <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">
                                            Status Mutasi:
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            Stok Bertambah
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                                        <span className="text-slate-500 font-medium">
                                            Total Transaksi Item:
                                        </span>
                                        <span className="font-semibold text-slate-800 font-mono">
                                            {items.length} Item Bahan
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">
                                            Total Kuantitas Fisik:
                                        </span>
                                        <span className="font-semibold text-slate-800 font-mono">
                                            {totalQty} Satuan Beli
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                                        <span className="text-slate-500 font-medium">
                                            Total Nilai Faktur:
                                        </span>
                                        <span className="font-bold text-teal-700 font-mono text-sm">
                                            {formatRupiah(purchase.total_amount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Catatan Pembelian */}
                                <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 space-y-1.5 shadow-2xs">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-1.5">
                                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Catatan Pengadaan</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium pt-0.5">
                                        {purchase.notes || "Tidak ada catatan atau instruksi tambahan untuk transaksi ini."}
                                    </p>
                                </div>
                            </div>

                            {/* KOLOM KANAN: Breakdown & Tabel Detail Item */}
                            <div className="lg:col-span-8 space-y-4">
                                {/* Hero Card: Total Pembelian & Volume Masuk */}
                                <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 border border-slate-200 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                        <span className="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
                                            <Layers className="w-4 h-4 text-teal-600" />
                                            Akumulasi Pengadaan Bahan
                                        </span>
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                            Faktur Resmi
                                        </span>
                                    </div>
                                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                                            Total Nominal Pembayaran:
                                        </span>
                                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-mono">
                                            {formatRupiah(purchase.total_amount)}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium pt-0.5">
                                            Total akumulasi konversi:{" "}
                                            <strong className="font-bold text-teal-900 font-mono">
                                                {totalBaseQty} Satuan Dasar
                                            </strong>{" "}
                                            dari seluruh lini bahan baku yang dibeli.
                                        </p>
                                    </div>
                                </div>

                                {/* Tabel Rincian Item Bahan Baku */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Boxes className="w-4 h-4 text-teal-600" />
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                Rincian Item Bahan Baku
                                            </h4>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                            {items.length} Item
                                        </span>
                                    </div>

                                    {items.length > 0 ? (
                                        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                                                    <tr>
                                                        <th className="px-3 py-2.5 w-10 text-center">#</th>
                                                        <th className="px-3 py-2.5">Bahan Baku</th>
                                                        <th className="px-3 py-2.5 text-right">Kuantitas</th>
                                                        <th className="px-3 py-2.5">Satuan Beli</th>
                                                        <th className="px-3 py-2.5 text-right">Setara Satuan Dasar</th>
                                                        <th className="px-3 py-2.5 text-right">Harga Satuan</th>
                                                        <th className="px-3 py-2.5 text-right">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                                                    {items.map((row, idx) => {
                                                        const unit = resolveUnitMeta(row);
                                                        return (
                                                            <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                                                                <td className="px-3 py-2 text-center text-slate-400 font-medium">
                                                                    {idx + 1}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <div className="font-bold text-slate-900 leading-tight">
                                                                        {row.item?.name || "-"}
                                                                    </div>
                                                                    <span className="inline-block mt-0.5 font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600">
                                                                        {row.item?.code || "-"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-bold text-slate-800 font-mono">
                                                                    {row.quantity}
                                                                </td>
                                                                <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                                                                    {unit.name}
                                                                    {unit.symbol && (
                                                                        <span className="ml-1 text-slate-400">
                                                                            ({unit.symbol})
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-mono text-slate-700 whitespace-nowrap">
                                                                    <span className="font-semibold text-teal-700">
                                                                        {unit.equivalentQty} {unit.baseSymbol}
                                                                    </span>
                                                                    {unit.multiplier > 1 && (
                                                                        <span className="block text-[10px] text-slate-400">
                                                                            1 {unit.symbol || unit.name} = {unit.multiplier} {unit.baseSymbol}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-mono text-slate-600 whitespace-nowrap">
                                                                    {formatRupiah(row.unit_price)}
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-bold font-mono text-slate-900 whitespace-nowrap">
                                                                    {formatRupiah(row.subtotal)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot className="border-t-2 border-slate-200 bg-slate-50/80 font-medium">
                                                    <tr>
                                                        <td colSpan="6" className="px-3 py-2.5 text-right font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                                                            Total Nilai Pembelian:
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right font-extrabold text-teal-700 font-mono text-xs sm:text-sm">
                                                            {formatRupiah(purchase.total_amount)}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 text-xs bg-slate-50/50 rounded-lg border border-slate-200">
                                            Belum ada item bahan baku yang terdaftar pada pembelian ini.
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