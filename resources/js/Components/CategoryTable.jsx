import React, { memo } from "react";
import { Edit2, Trash2, Folder, AlertCircle } from "lucide-react";
import Pagination from "@/Components/Pagination";

const CategoryTable = memo(function CategoryTable({
    categories,
    items,
    loading = false,
    canUpdate = false,
    canDelete = false,
    onEdit,
    onDelete,
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    onItemsPerPageChange,
}) {
    const displayCategories = (categories && categories.length > 0) ? categories : (items || []);

    return (
        <div className="bg-white border border-slate-200/90 rounded-md overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                            <th className="px-3.5 py-2.5">No</th>
                            <th className="px-3.5 py-2.5">Nama Kategori</th>
                            <th className="px-3.5 py-2.5">Deskripsi</th>
                            <th className="px-3.5 py-2.5">Jumlah Barang</th>
                            <th className="px-3.5 py-2.5">Status</th>
                            <th className="px-3.5 py-2.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-3.5 py-8 text-center text-slate-400">
                                    <div className="inline-flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                                        <span>Memuat data kategori...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : displayCategories.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-3.5 py-10 text-center text-slate-400">
                                    <Folder className="w-9 h-9 mx-auto text-slate-300 mb-1.5" />
                                    <p className="font-semibold text-slate-600">Belum ada data kategori</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Klik tombol '+' di pojok kanan atas untuk menambah data baru.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            displayCategories.map((item, idx) => {
                                const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-3.5 py-2.5 text-slate-400 font-mono text-xs font-medium">
                                            {rowNumber}
                                        </td>
                                        <td className="px-3.5 py-2.5 font-semibold text-slate-900">{item.name}</td>
                                        <td className="px-3.5 py-2.5 text-slate-600 text-xs">{item.description || "-"}</td>
                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                                {item.items_count || 0} barang
                                            </span>
                                        </td>
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
                                        <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1">
                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onEdit(item)}
                                                        title="Edit Kategori"
                                                        className="w-7 h-7 inline-flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors border border-indigo-200/80 cursor-pointer shadow-2xs"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(item.id)}
                                                        title="Hapus Kategori"
                                                        className="w-7 h-7 inline-flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md transition-colors border border-rose-200/80 cursor-pointer shadow-2xs"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {!canUpdate && !canDelete && (
                                                    <span className="text-xs text-slate-400 italic">No permission</span>
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
        </div>
    );
});

export default CategoryTable;
