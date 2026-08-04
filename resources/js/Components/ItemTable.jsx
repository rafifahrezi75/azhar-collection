import React, { memo, useState } from "react";
import {
    Edit2,
    Trash2,
    Package,
    ImageIcon,
    X,
    AlertTriangle,
    Eye,
    ArrowUpRight,
    Plus
} from "lucide-react";
import Pagination from "@/Components/Pagination";
import Tooltip from "@/Components/Tooltip";

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
        <div className="bg-white border border-slate-200/90 rounded-md overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                            <th className="px-3.5 py-2.5">#</th>
                            <th className="px-3.5 py-2.5">Foto</th>
                            <th className="px-3.5 py-2.5">Bahan / Barang</th>
                            <th className="px-3.5 py-2.5">Kategori</th>
                            <th className="px-3.5 py-2.5">Stok Gudang</th>
                            <th className="px-3.5 py-2.5">Status</th>
                            <th className="px-3.5 py-2.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-3.5 py-8 text-center text-slate-400">
                                    <div className="inline-flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                                        <span>Memuat data bahan baku...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-3.5 py-10 text-center text-slate-400">
                                    <Package className="w-9 h-9 mx-auto text-slate-300 mb-1.5" />
                                    <p className="font-semibold text-slate-600">Belum ada data barang / bahan baku</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Klik tombol '+' di pojok kanan atas untuk menambah data baru.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            items.map((item, idx) => {
                                const baseUnitSymbol = item.unit?.symbol || item.unit?.name || "pcs";
                                const isLowStock = item.stock <= (item.min_stock || 0) && item.stock > 0;
                                const isOutOfStock = item.stock <= 0;
                                const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-3.5 py-2.5 text-slate-400 font-mono text-xs font-medium">
                                            {rowNumber}
                                        </td>
                                        
                                        {/* Photo */}
                                        <td className="px-3.5 py-2.5">
                                            {item.image_url ? (
                                                <Tooltip content="Foto" position="bottom">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewImage({ url: item.image_url, name: item.name })}
                                                        className="w-9 h-9 rounded-md overflow-hidden border border-slate-200 hover:border-teal-400 transition-all shadow-2xs relative cursor-pointer"
                                                    >
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                </Tooltip>
                                            ) : (
                                                <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                    <ImageIcon className="w-4 h-4 text-slate-400" />
                                                </div>
                                            )}
                                        </td>

                                        {/* Code & Name */}
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

                                        {/* Category */}
                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            {item.category ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                                                    {item.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>

                                        {/* Minimalist Stock Pill */}
                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${
                                                    isOutOfStock
                                                        ? "bg-rose-50 text-rose-800 border-rose-200"
                                                        : isLowStock
                                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                }`}>
                                                    {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                                                    <span>{item.stock_breakdown_text || `${item.stock} ${baseUnitSymbol}`}</span>
                                                </span>
                                                <span className="text-[11px] font-mono text-slate-500 font-medium">
                                                    ({item.stock} {baseUnitSymbol})
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            {item.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </td>

                                        {/* Action Buttons with Soft Pastel Styling & Tooltips */}
                                        <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                            <div className="flex justify-end items-center gap-1.5">
                                                {/* View Detail - Soft Sky */}
                                                <Tooltip content="Detail" position="bottom">
                                                    <button
                                                        type="button"
                                                        onClick={() => onViewDetail(item)}
                                                        className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-md transition-colors border border-sky-200/80 cursor-pointer shadow-2xs"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                </Tooltip>

                                                {/* Take Stock (Ambil Stok) - Soft Amber */}
                                                {canUpdate && (
                                                    <Tooltip content="Ambil" position="bottom">
                                                        <button
                                                            type="button"
                                                            onClick={() => onTakeStock(item)}
                                                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md transition-colors border border-amber-200/80 cursor-pointer shadow-2xs"
                                                        >
                                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Tooltip>
                                                )}

                                                {/* Add Stock - Soft Emerald */}
                                                {canUpdate && (
                                                    <Tooltip content="Tambah" position="bottom">
                                                        <button
                                                            type="button"
                                                            onClick={() => onAddStock(item)}
                                                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-colors border border-emerald-200/80 cursor-pointer shadow-2xs"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Tooltip>
                                                )}

                                                {/* Edit - Soft Indigo */}
                                                {canUpdate && (
                                                    <Tooltip content="Edit" position="bottom">
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit(item)}
                                                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors border border-indigo-200/80 cursor-pointer shadow-2xs"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Tooltip>
                                                )}

                                                {/* Delete - Soft Rose */}
                                                {canDelete && (
                                                    <Tooltip content="Hapus" position="bottom">
                                                        <button
                                                            type="button"
                                                            onClick={() => onDelete(item.id)}
                                                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md transition-colors border border-rose-200/80 cursor-pointer shadow-2xs"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Tooltip>
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

            {/* Pagination */}
            {totalItems > 0 && onPageChange && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                    onItemsPerPageChange={onItemsPerPageChange}
                />
            )}

            {/* Lightbox Preview */}
            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-md max-w-lg w-full overflow-hidden shadow-2xl border border-slate-300 animate-in zoom-in-95"
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
