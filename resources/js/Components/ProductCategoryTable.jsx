import React, { memo } from "react";
import { Edit2, Trash2, Tags } from "lucide-react";
import Pagination from "./Pagination";

const ProductCategoryTable = memo(function ProductCategoryTable({
    items = [],
    loading = false,
    canUpdate = false,
    canDelete = false,
    onEdit,
    onDelete,
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    onItemsPerPageChange,
}) {
    return (
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-2.5 px-3.5 w-12 text-center">No</th>
                            <th className="py-2.5 px-3.5 min-w-[220px]">Nama Kategori Produk</th>
                            <th className="py-2.5 px-3.5 min-w-[180px]">Slug / Identitas URL</th>
                            <th className="py-2.5 px-3.5 min-w-[250px]">Deskripsi</th>
                            <th className="py-2.5 px-3.5 w-24 text-center">Status</th>
                            <th className="py-2.5 px-3.5 w-24 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-slate-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                                        <span>Memuat data kategori produk...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-slate-400">
                                    <Tags className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                                    <p className="font-medium text-slate-500">Belum ada kategori produk</p>
                                    <p className="text-[11px] text-slate-400">Silakan tambahkan kategori pakaian jadi baru.</p>
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => {
                                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                        {/* No */}
                                        <td className="py-2.5 px-3.5 text-center text-slate-400 font-medium">
                                            {rowNumber}
                                        </td>

                                        {/* Nama Kategori */}
                                        <td className="py-2.5 px-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                                    <Tags className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-slate-900">{item.name}</span>
                                            </div>
                                        </td>

                                        {/* Slug */}
                                        <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-600">
                                            {item.slug}
                                        </td>

                                        {/* Deskripsi */}
                                        <td className="py-2.5 px-3.5 text-slate-500">
                                            {item.description || "-"}
                                        </td>

                                        {/* Status */}
                                        <td className="py-2.5 px-3.5 text-center">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    item.is_active
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : "bg-rose-50 text-rose-700 border border-rose-200"
                                                }`}
                                            >
                                                {item.is_active ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </td>

                                        {/* Aksi */}
                                        <td className="py-2.5 px-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* Edit */}
                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onEdit(item)}
                                                        title="Edit Kategori Produk"
                                                        className="w-7 h-7 inline-flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors border border-indigo-200/80 cursor-pointer shadow-2xs"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {/* Delete */}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(item)}
                                                        title="Hapus Kategori Produk"
                                                        className="w-7 h-7 inline-flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md transition-colors border border-rose-200/80 cursor-pointer shadow-2xs"
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

            {/* Pagination */}
            {totalItems > 0 && onPageChange && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                    onItemsPerPageChange={onItemsPerPageChange}
                />
            )}
        </div>
    );
});

export default ProductCategoryTable;
