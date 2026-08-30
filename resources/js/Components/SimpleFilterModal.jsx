import React, { memo } from "react";
import { Filter, RotateCcw, X } from "lucide-react";

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
        <div className="absolute right-0 top-full mt-1 z-[100] w-[calc(100vw-24px)] max-w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 sm:p-4 origin-top-right animate-in fade-in zoom-in-95 duration-150">
            <div className="relative border-b border-slate-100 pb-3 mb-3.5">
                <div className="flex items-center gap-2.5 pr-[76px]">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Filter className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">
                            {title}
                        </h3>

                        <p className="text-[11px] text-slate-500 truncate">
                            Saring data tampilan.
                        </p>
                    </div>
                </div>

                <div className="absolute right-0 top-0 flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onReset}
                        title="Reset"
                        aria-label="Reset"
                        className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        title="Tutup"
                        aria-label="Tutup"
                        className="w-8 h-8 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-md border border-teal-700/20 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3.5 text-xs">
                {extraFilter}

                {onStatusFilterChange && (
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Status
                        </label>

                        <div className="grid grid-cols-3 gap-1.5">
                            {[
                                {
                                    id: "all",
                                    label: "Semua",
                                },
                                {
                                    id: "active",
                                    label: "Aktif",
                                },
                                {
                                    id: "inactive",
                                    label: "Nonaktif",
                                },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                        onStatusFilterChange(item.id)
                                    }
                                    className={`min-w-0 px-1.5 sm:px-2 py-1.5 rounded-md border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center ${
                                        statusFilter === item.id
                                            ? "bg-teal-600 text-white border-teal-600 shadow-sm"
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
        </div>
    );
});

export default SimpleFilterModal;
