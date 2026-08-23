import React, { memo } from "react";
import { Filter, X, RotateCcw } from "lucide-react";

const ItemFilterModal = memo(function ItemFilterModal({
    isOpen,
    categories = [],
    selectedCategory = "",
    onCategoryChange,
    stockFilter = "all",
    onStockFilterChange,
    stockTypeFilter = "all",
    onStockTypeFilterChange,
    statusFilter = "all",
    onStatusFilterChange,
    onReset,
    onClose,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-lg w-full p-4 sm:p-5 shadow-soft-xl space-y-3.5 border border-slate-100 animate-in zoom-in-95 duration-150 my-auto">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Filter className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                Filter Data Barang
                            </h3>
                            <p className="text-xs text-slate-500">
                                Saring katalog bahan baku sesuai kebutuhan.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                {/* Body - 2 Columns Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Kategori Filter */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Kategori Bahan
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 bg-white font-medium shadow-soft-2xs"
                        >
                            <option value="">Semua Kategori Bahan</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tipe Kepastian Stok Filter */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Kepastian Data Stok
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                            {[
                                { id: "all", label: "Semua" },
                                { id: "real", label: "Nyata" },
                                { id: "estimated", label: "Estimasi" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onStockTypeFilterChange && onStockTypeFilterChange(item.id)}
                                    className={`px-1.5 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer text-center ${
                                        stockTypeFilter === item.id
                                            ? "bg-teal-600 text-white border-teal-600 shadow-soft-xs"
                                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Aktif Filter */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Status Katalog
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                            {[
                                { id: "all", label: "Semua" },
                                { id: "active", label: "Aktif" },
                                { id: "inactive", label: "Nonaktif" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onStatusFilterChange(item.id)}
                                    className={`px-1.5 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer text-center ${
                                        statusFilter === item.id
                                            ? "bg-teal-600 text-white border-teal-600 shadow-soft-xs"
                                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Kondisi Stok Filter */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Kondisi Stok
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {[
                                { id: "all", label: "Semua" },
                                { id: "safe", label: "Stok Aman" },
                                { id: "low", label: "Menipis" },
                                { id: "out", label: "Habis" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onStockFilterChange(item.id)}
                                    className={`px-2 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer text-center ${
                                        stockFilter === item.id
                                            ? "bg-teal-600 text-white border-teal-600 shadow-soft-xs"
                                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Filter</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 shadow-soft-xs cursor-pointer"
                    >
                        Terapkan
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ItemFilterModal;
