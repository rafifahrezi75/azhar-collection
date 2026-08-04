import React, { memo, useState } from "react";
import {
    X,
    Package,
    AlertTriangle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownLeft,
    User as UserIcon,
    FileText,
    History,
    Boxes,
    Edit,
    ZoomIn,
    Plus,
    Calculator,
    Layers
} from "lucide-react";

const ItemDetailModal = memo(function ItemDetailModal({
    isOpen,
    item,
    loading = false,
    canUpdate = false,
    onClose,
    onEdit,
    onTakeStock,
    onAddStock,
}) {
    const [activeTab, setActiveTab] = useState("info"); // "info" | "mutations"
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!isOpen || !item) return null;

    const baseUnitSymbol = item.unit?.symbol || item.unit?.name || "pcs";
    const isLowStock = Number(item.stock) <= Number(item.min_stock) && Number(item.stock) > 0;
    const isOutOfStock = Number(item.stock) <= 0;
    const unitSummaries = item.unit_stock_summary || [];

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-md max-w-4xl w-full p-4 sm:p-5 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-150 my-8 max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center font-bold shrink-0">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                    {item.name}
                                </h3>
                                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-bold">
                                    {item.code}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Kategori: <strong className="text-slate-700 font-semibold">{item.category?.name || "-"}</strong> &bull; Satuan Dasar: <strong className="text-slate-700 font-semibold">{item.unit?.name || "-"} ({baseUnitSymbol})</strong>
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Tutup Modal"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                {/* Quick Action Bar & Tabs */}
                <div className="py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                    <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-md border border-slate-200/80">
                        <button
                            type="button"
                            onClick={() => setActiveTab("info")}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                activeTab === "info"
                                    ? "bg-white text-teal-800 shadow-xs border border-slate-200/60"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Informasi & Rincian Stok
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("mutations")}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeTab === "mutations"
                                    ? "bg-white text-teal-800 shadow-xs border border-slate-200/60"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <History className="w-3.5 h-3.5" />
                            <span>Riwayat Mutasi</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                activeTab === "mutations" ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-600"
                            }`}>
                                {item.mutations?.length || 0}
                            </span>
                        </button>
                    </div>

                    {canUpdate && (
                        <div className="flex items-center gap-1.5">
                            {/* Ambil Stok - Soft Amber */}
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onTakeStock(item);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-md border border-amber-200/80 shadow-2xs transition-colors cursor-pointer"
                            >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>Ambil Stok</span>
                            </button>

                            {/* Tambah Stok - Soft Emerald */}
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onAddStock(item);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-200/80 shadow-2xs transition-colors cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Stok</span>
                            </button>

                            {/* Edit - Soft Indigo */}
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onEdit(item);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-200/80 shadow-2xs transition-colors cursor-pointer"
                            >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal Body */}
                <div className="py-3.5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                    {loading ? (
                        <div className="py-16 text-center text-slate-500 font-medium text-sm animate-pulse">
                            Memuat data detail bahan baku...
                        </div>
                    ) : activeTab === "info" ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Left Column: Photo & Status */}
                            <div className="md:col-span-4 space-y-3">
                                <div className="relative aspect-square w-full rounded-md overflow-hidden bg-slate-50 border border-slate-200 group shadow-2xs">
                                    {item.image_url ? (
                                        <>
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                onClick={() => setLightboxOpen(true)}
                                            />
                                            <div
                                                onClick={() => setLightboxOpen(true)}
                                                className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5 cursor-pointer"
                                            >
                                                <ZoomIn className="w-4 h-4" />
                                                <span>Perbesar Foto</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                                            <Package className="w-9 h-9 text-slate-300" />
                                            <span className="text-xs text-slate-400 font-medium">Tanpa Foto Produk</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status Card with Soft Badges */}
                                <div className="p-3 rounded-md bg-white border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Status Katalog:</span>
                                        {item.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                <span>Aktif</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                <X className="w-3 h-3 text-slate-500" />
                                                <span>Nonaktif</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Kondisi Stok:</span>
                                        {isOutOfStock ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                                <span>Habis (0)</span>
                                            </span>
                                        ) : isLowStock ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                                <span>Menipis</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                <span>Aman</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <span className="text-slate-500 font-medium">Batas Minimum:</span>
                                        <span className="font-semibold text-slate-800 font-mono">
                                            {item.min_stock} {baseUnitSymbol}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Stock Breakdown & Unit Summaries */}
                            <div className="md:col-span-8 space-y-3.5">
                                {/* Primary Stock Card with Soft Pastel Gradient & Crisp Content */}
                                <div className="p-4 rounded-md bg-gradient-to-br from-teal-50/90 via-emerald-50/40 to-slate-50 border border-teal-200/90 shadow-2xs space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] uppercase tracking-wider font-bold text-teal-800 flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5 text-teal-600" />
                                            Ketersediaan Stok Gudang
                                        </span>
                                        <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-white text-teal-800 border border-teal-200 font-mono font-bold shadow-2xs">
                                            Total Satuan Dasar: {item.stock} {baseUnitSymbol}
                                        </span>
                                    </div>

                                    {/* Big Breakdown Text */}
                                    <div>
                                        <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                                            {item.stock_breakdown_text || `${item.stock} ${baseUnitSymbol}`}
                                        </h4>
                                        <p className="text-xs text-slate-600 mt-0.5">
                                            Kombinasi kemasan bertingkat yang siap dipakai pada proses produksi.
                                        </p>
                                    </div>

                                    {/* Breakdown Pill Cards */}
                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-teal-200/60">
                                        {item.stock_breakdown?.map((b, idx) => (
                                            <div
                                                key={idx}
                                                className="px-2.5 py-1 rounded-md bg-white border border-teal-200/80 flex items-center gap-1.5 text-xs shadow-2xs"
                                            >
                                                <span className="text-teal-700 font-bold font-mono">{b.count}</span>
                                                <span className="text-slate-800 font-medium">{b.unit_name} ({b.unit_symbol})</span>
                                                {b.multiplier > 1 && (
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        (@{b.multiplier} {baseUnitSymbol})
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SECTION: Rincian Stok di SEMUA Satuan Terdaftar */}
                                <div className="p-3.5 rounded-md bg-white border border-slate-200 space-y-2.5 shadow-2xs">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Calculator className="w-4 h-4 text-teal-600" />
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                Rincian Stok di Seluruh Satuan Terdaftar
                                            </h4>
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium font-mono">
                                            {unitSummaries.length} Satuan
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {unitSummaries.map((u, sIdx) => (
                                            <div
                                                key={sIdx}
                                                className={`p-3 rounded-md border flex flex-col justify-between transition-all ${
                                                    u.is_base
                                                        ? "bg-teal-50/50 border-teal-200/90 shadow-2xs"
                                                        : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                        <span className={`w-2 h-2 rounded-full ${u.is_base ? "bg-teal-600" : "bg-slate-400"}`} />
                                                        <span>{u.unit_name} ({u.unit_symbol})</span>
                                                    </span>
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                                        u.is_base ? "bg-teal-100 text-teal-800 border border-teal-200" : "bg-slate-200/80 text-slate-700 border border-slate-300"
                                                    }`}>
                                                        {u.is_base ? "Satuan Dasar" : `1 = ${u.multiplier} ${baseUnitSymbol}`}
                                                    </span>
                                                </div>

                                                <div className="space-y-0.5">
                                                    <div className="font-mono text-xs font-bold text-slate-900">
                                                        {u.display_text}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-medium">
                                                        {u.detail_text}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Description / Notes */}
                                <div className="p-3 rounded-md bg-white border border-slate-200 space-y-1 shadow-2xs">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
                                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Deskripsi / Catatan Bahan Baku</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-normal pt-0.5">
                                        {item.description || "Tidak ada catatan atau deskripsi tambahan untuk barang ini."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Mutations Tab */
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Catatan Riwayat Mutasi Stok
                                </h4>
                                <span className="text-xs text-slate-500">
                                    Menampilkan log transaksi stok keluar, masuk, dan penyesuaian
                                </span>
                            </div>

                            {item.mutations && item.mutations.length > 0 ? (
                                <div className="border border-slate-200 rounded-md overflow-hidden shadow-2xs">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                                            <tr>
                                                <th className="px-3 py-2">Tanggal</th>
                                                <th className="px-3 py-2">Tipe</th>
                                                <th className="px-3 py-2">Jumlah Transaksi</th>
                                                <th className="px-3 py-2">Total Satuan Dasar</th>
                                                <th className="px-3 py-2">Sisa Stok</th>
                                                <th className="px-3 py-2">Keperluan / Keterangan</th>
                                                <th className="px-3 py-2">Petugas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {item.mutations.map((m) => {
                                                const isOut = m.type === "out";
                                                const isIn = m.type === "in";
                                                return (
                                                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                                                        <td className="px-3 py-2 font-mono text-xs text-slate-600 whitespace-nowrap">
                                                            {new Date(m.mutation_date || m.created_at).toLocaleDateString("id-ID", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            {isOut ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                                    <ArrowUpRight className="w-3 h-3 text-rose-600" />
                                                                    <span>Keluar</span>
                                                                </span>
                                                            ) : isIn ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                                                                    <span>Masuk</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                                    <span>Penyesuaian</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap font-mono">
                                                            {isOut ? `-${m.quantity}` : `+${m.quantity}`}{" "}
                                                            <span className="font-normal text-slate-500">
                                                                {m.unit?.symbol || m.unit?.name || baseUnitSymbol}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 font-mono text-xs text-slate-600 whitespace-nowrap">
                                                            {isOut ? `-${m.total_base_quantity}` : `+${m.total_base_quantity}`} {baseUnitSymbol}
                                                        </td>
                                                        <td className="px-3 py-2 font-mono font-bold text-slate-800 whitespace-nowrap">
                                                            {m.current_stock} {baseUnitSymbol}
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-600 max-w-xs truncate" title={m.notes}>
                                                            {m.notes || "-"}
                                                            {m.reference_no && (
                                                                <span className="block text-[10px] font-mono text-slate-400">
                                                                    Ref: {m.reference_no}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5">
                                                                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                                                <span className="text-slate-700 font-medium">{m.user?.name || "System"}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-md border border-slate-200">
                                    Belum ada catatan mutasi stok untuk barang ini.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-1 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs transition-colors cursor-pointer"
                    >
                        Tutup Detail
                    </button>
                </div>
            </div>

            {/* Lightbox Image Preview */}
            {lightboxOpen && item.image_url && (
                <div
                    className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <div className="relative max-w-2xl max-h-[85vh] p-3 bg-white rounded-md border border-slate-200 shadow-2xl flex flex-col items-center">
                        <img
                            src={item.image_url}
                            alt={item.name}
                            className="max-h-[75vh] w-auto rounded-md object-contain"
                        />
                        <div className="mt-2 text-center text-slate-900 text-xs font-semibold">
                            {item.name} ({item.code})
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default ItemDetailModal;
