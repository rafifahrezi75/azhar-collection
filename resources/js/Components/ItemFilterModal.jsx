import React, { memo } from "react";
import { Filter, X, RotateCcw } from "lucide-react";

const ItemFilterModal = memo(function ItemFilterModal({
    isOpen,
    categories = [],
    selectedCategory = "",
    onCategoryChange,
    stockFilter = "all",
    onStockFilterChange,
    statusFilter = "all",
    onStatusFilterChange,
    onReset,
    onClose,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-md max-w-sm w-full p-5 sm:p-6 shadow-xl space-y-4 border border-slate-200 animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Filter className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                Filter Data Barang
                            </h3>
                            <p className="text-xs text-slate-500">
                                Saring katalog bahan baku.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-3.5 text-xs">
                    {/* Kategori Filter */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Kategori Bahan
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white font-medium"
                        >
                            <option value="">Semua Kategori Bahan</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Stok Filter */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Kondisi Stok
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {[
                                { id: "all", label: "Semua Stok" },
                                { id: "safe", label: "Stok Aman" },
                                { id: "low", label: "Stok Menipis" },
                                { id: "out", label: "Stok Habis" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onStockFilterChange(item.id)}
                                    className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer text-left ${
                                        stockFilter === item.id
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
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
                        <div className="grid grid-cols-3 gap-1.5">
                            {[
                                { id: "all", label: "Semua" },
                                { id: "active", label: "Aktif" },
                                { id: "inactive", label: "Nonaktif" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onStatusFilterChange(item.id)}
                                    className={`px-2 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer text-center ${
                                        statusFilter === item.id
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
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
                <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-5">
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
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                    >
                        Terapkan
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ItemFilterModal;
