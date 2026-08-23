import React, { memo } from "react";
import { Filter, X, RotateCcw } from "lucide-react";

const SimpleFilterModal = memo(function SimpleFilterModal({
    isOpen,
    title = "Filter Data",
    statusFilter = "all",
    onStatusFilterChange,
    extraFilter = null,
    onReset,
    onClose,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-xs w-full p-5 sm:p-6 shadow-soft-xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Filter className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h3>
                            <p className="text-xs text-slate-500">Saring data tampilan.</p>
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

                {/* Body */}
                <div className="space-y-3.5 text-xs">
                    {extraFilter}

                    {/* Status Filter */}
                    {onStatusFilterChange && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Status
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
                                                ? "bg-teal-600 text-white border-teal-600 shadow-soft-xs"
                                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-5">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer shadow-soft-xs"
                    >
                        Terapkan
                    </button>
                </div>
            </div>
        </div>
    );
});

export default SimpleFilterModal;
