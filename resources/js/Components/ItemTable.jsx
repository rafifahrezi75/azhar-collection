import React, { memo, useState } from "react";
import {
    Edit2,
    Trash2,
    Package,
    ImageIcon,
    X,
    Eye,
    ArrowUpRight,
    Plus
} from "lucide-react";
import Pagination from "@/Components/Pagination";
import { formatRupiah } from "@/utils/format";

const ItemTable = memo(function ItemTable({
    items = [],
    loading = false,
    canUpdate = false,
    canDelete = false,
    onViewDetail,
    onTakeStock,
    onAddStock,
    onEdit,
    onDelete,
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    onItemsPerPageChange,
}) {
    const [previewImage, setPreviewImage] = useState(null);

    return (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-soft-2xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                            <th className="px-3.5 py-2.5">No</th>
                            <th className="px-3.5 py-2.5">Foto</th>
                            <th className="px-3.5 py-2.5">Kode & Nama Bahan</th>
                            <th className="px-3.5 py-2.5">Kategori</th>
                            <th className="px-3.5 py-2.5">Satuan</th>
                            <th className="px-3.5 py-2.5">Harga Dasar</th>
                            <th className="px-3.5 py-2.5">Kondisi Stok</th>
                            <th className="px-3.5 py-2.5">Status</th>
                            <th className="px-3.5 py-2.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="px-3.5 py-10 text-center text-slate-400">
                                    <div className="inline-flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                                        <span>Memuat data bahan baku...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-3.5 py-12 text-center text-slate-400 space-y-2">
                                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                                    <p className="font-semibold text-slate-700">Belum ada data barang atau bahan baku</p>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        Katalog bahan baku belum memiliki item. Tambahkan bahan baku baru untuk mengelola stok konveksi.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            items.map((item, idx) => {
                                const baseUnitSymbol = item.unit?.symbol || item.unit?.name || "pcs";
                                const isOutOfStock = Number(item.stock) <= 0;
                                const isLowStock = !isOutOfStock && Number(item.stock) <= Number(item.min_stock || 0);
                                const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                                const conversions = item.conversions || [];

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-3.5 py-2.5 text-slate-400 font-mono text-xs font-medium">
                                            {rowNumber}
                                        </td>

                                        <td className="px-3.5 py-2.5">
                                            {item.image_url ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewImage({ url: item.image_url, name: item.name })}
                                                    title="Lihat Foto"
                                                    className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 hover:border-teal-500 transition-all shadow-soft-2xs relative cursor-pointer block"
                                                >
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400" title="Tidak ada foto">
                                                    <ImageIcon className="w-4 h-4 text-slate-400" />
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-3.5 py-2.5">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                                    {item.code}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onViewDetail(item)}
                                                className="font-semibold text-slate-900 hover:text-teal-700 transition-colors text-left cursor-pointer line-clamp-1"
                                                title={item.name}
                                            >
                                                {item.name}
                                            </button>
                                        </td>

                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            {item.category ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                                                    {item.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>

                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            <div className="font-semibold text-slate-800">
                                                {baseUnitSymbol}
                                            </div>
                                            {conversions.length > 0 && (
                                                <div className="text-[10px] text-slate-500 font-mono">
                                                    +{conversions.length} konversi
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-3.5 py-2.5 whitespace-nowrap font-mono font-semibold text-slate-900">
                                            {formatRupiah(item.price || item.base_price || 0)}
                                        </td>

                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold font-mono text-slate-900">
                                                    {Number(item.stock).toLocaleString("id-ID")}
                                                </span>
                                                <span className="text-[11px] text-slate-500">
                                                    {baseUnitSymbol}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400">
                                                Min: {Number(item.min_stock || 0).toLocaleString("id-ID")} {baseUnitSymbol}
                                            </div>
                                        </td>

                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            {isOutOfStock ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    Habis
                                                </span>
                                            ) : isLowStock ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    Menipis
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Aman
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onViewDetail(item)}
                                                    title="Lihat Detail"
                                                    className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-soft-2xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>

                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onTakeStock(item)}
                                                        title="Ambil Stok (Keluar)"
                                                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors border border-amber-200/80 cursor-pointer shadow-soft-2xs"
                                                    >
                                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onAddStock(item)}
                                                        title="Tambah Stok (Masuk)"
                                                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200/80 cursor-pointer shadow-soft-2xs"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onEdit(item)}
                                                        title="Edit Bahan"
                                                        className="p-1.5 bg-white hover:bg-slate-50 text-teal-600 hover:text-teal-700 rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-soft-2xs"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(item.id)}
                                                        title="Hapus Bahan"
                                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-200/80 cursor-pointer shadow-soft-2xs"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {totalItems > 0 && onPageChange && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                    onItemsPerPageChange={onItemsPerPageChange}
                />
            )}

            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-soft-xl border border-slate-200 animate-in zoom-in-95"
                    >
                        <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                            <span className="font-bold text-xs truncate">{previewImage.name}</span>
                            <button
                                type="button"
                                onClick={() => setPreviewImage(null)}
                                className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-3 bg-slate-100 flex items-center justify-center">
                            <img
                                src={previewImage.url}
                                alt={previewImage.name}
                                className="max-h-80 w-auto object-contain rounded-md"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default ItemTable;
