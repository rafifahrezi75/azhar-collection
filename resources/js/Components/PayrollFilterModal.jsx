import React, { memo } from "react";
import { Calendar, RotateCcw, X } from "lucide-react";
import { todayLocal } from "@/utils/format";

const localParts = todayLocal().split("-");
const currentDefaultYear = Number(localParts[0]);
const currentDefaultMonth = Number(localParts[1]);

const PayrollFilterModal = memo(function PayrollFilterModal({
    isOpen,
    month = currentDefaultMonth,
    year = currentDefaultYear,
    onMonthChange,
    onYearChange,
    onReset,
    onClose,
}) {
    if (!isOpen) return null;

    const monthOptions = [
        { val: 1, label: "Januari" },
        { val: 2, label: "Februari" },
        { val: 3, label: "Maret" },
        { val: 4, label: "April" },
        { val: 5, label: "Mei" },
        { val: 6, label: "Juni" },
        { val: 7, label: "Juli" },
        { val: 8, label: "Agustus" },
        { val: 9, label: "September" },
        { val: 10, label: "Oktober" },
        { val: 11, label: "November" },
        { val: 12, label: "Desember" },
    ];

    const yearOptions = [
        currentDefaultYear - 2,
        currentDefaultYear - 1,
        currentDefaultYear,
        currentDefaultYear + 1,
    ];

    return (
        <div className="absolute right-0 top-full mt-1 z-[100] w-[calc(100vw-24px)] max-w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 sm:p-4 origin-top-right animate-in fade-in zoom-in-95 duration-150">
            <div className="relative border-b border-slate-100 pb-3 mb-3.5">
                <div className="flex items-center gap-2.5 min-w-0 pr-[76px]">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">
                            Filter Periode Gaji
                        </h3>

                        <p className="text-[11px] text-slate-500 truncate">
                            Pilih bulan dan tahun penggajian.
                        </p>
                    </div>
                </div>

                <div className="absolute right-0 top-0 flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onReset}
                        title="Reset ke Bulan Ini"
                        aria-label="Reset ke Bulan Ini"
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
                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Bulan Penggajian
                    </label>

                    <select
                        value={month}
                        onChange={(e) => onMonthChange?.(Number(e.target.value))}
                        className="w-full h-8 px-2.5 border border-slate-200 rounded-md bg-slate-50 text-xs font-semibold text-slate-700 outline-none transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 cursor-pointer"
                    >
                        {monthOptions.map((m) => (
                            <option key={m.val} value={m.val}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tahun Penggajian
                    </label>

                    <div className="grid grid-cols-4 gap-1.5">
                        {yearOptions.map((y) => (
                            <button
                                key={y}
                                type="button"
                                onClick={() => onYearChange?.(y)}
                                className={`min-w-0 px-1.5 py-1.5 rounded-md border text-[11px] font-semibold transition-all cursor-pointer text-center ${
                                    Number(year) === y
                                        ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default PayrollFilterModal;
