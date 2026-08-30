import React, { memo } from "react";
import {
    Filter,
    X,
    RotateCcw,
    Calendar,
} from "lucide-react";

const InvoiceFilterModal = memo(
    function InvoiceFilterModal({
        isOpen,
        typeFilter = "all",
        onTypeFilterChange,
        paymentStatusFilter = "all",
        onPaymentStatusFilterChange,
        startDate = "",
        onStartDateChange,
        endDate = "",
        onEndDateChange,
        onReset,
        onClose,
    }) {
        if (!isOpen) return null;

        const typeOptions = [
            {
                label: "Semua Tipe",
                value: "all",
            },
            {
                label: "Pesanan Baru (Reguler)",
                value: "REGULAR",
            },
            {
                label: "Pesanan Lama (Historis)",
                value: "HISTORICAL",
            },
        ];

        const paymentOptions = [
            {
                label: "Semua Status",
                value: "all",
            },
            {
                label: "Lunas",
                value: "LUNAS",
            },
            {
                label: "DP (Uang Muka)",
                value: "DP",
            },
            {
                label: "Belum Lunas",
                value: "BELUM_LUNAS",
            },
        ];

        return (
            <div className="absolute right-0 top-full mt-1 z-[100] w-[calc(100vw-24px)] max-w-96 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 sm:p-4 origin-top-right animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="relative border-b border-slate-100 pb-3 mb-3.5">
                    <div className="flex items-center gap-2.5 pr-[76px]">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <Filter className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-900 text-sm truncate">
                                Filter Transaksi & Invoice
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

                <div className="space-y-3.5">
                    {/* Tipe Pesanan */}
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Tipe Pesanan
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                            {typeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        onTypeFilterChange?.(
                                            option.value,
                                        )
                                    }
                                    title={option.label}
                                    className={`min-w-0 px-2 py-1.5 rounded-md border text-[11px] font-semibold transition-all cursor-pointer text-center ${
                                        typeFilter ===
                                        option.value
                                            ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                >
                                    <span className="block truncate">
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Pembayaran */}
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Status Pembayaran
                        </label>

                        <div className="grid grid-cols-2 gap-1.5">
                            {paymentOptions.map(
                                (option) => (
                                    <button
                                        key={
                                            option.value
                                        }
                                        type="button"
                                        onClick={() =>
                                            onPaymentStatusFilterChange?.(
                                                option.value,
                                            )
                                        }
                                        title={
                                            option.label
                                        }
                                        className={`min-w-0 px-2 py-1.5 rounded-md border text-[11px] font-semibold transition-all cursor-pointer text-center ${
                                            paymentStatusFilter ===
                                            option.value
                                                ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        <span className="block truncate">
                                            {
                                                option.label
                                            }
                                        </span>
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Rentang Tanggal */}
                    <div>
                        <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            <Calendar className="w-3.5 h-3.5 text-teal-600" />

                            <span>
                                Rentang Tanggal Pesanan
                            </span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                                <span className="text-[10px] font-medium text-slate-500 block mb-1">
                                    Dari Tanggal
                                </span>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        onStartDateChange?.(
                                            e.target.value,
                                        )
                                    }
                                    className="w-full h-8 px-2.5 border border-slate-200 rounded-md bg-slate-50 text-xs font-medium text-slate-700 outline-none transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                                />
                            </div>

                            <div>
                                <span className="text-[10px] font-medium text-slate-500 block mb-1">
                                    Sampai Tanggal
                                </span>

                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) =>
                                        onEndDateChange?.(
                                            e.target.value,
                                        )
                                    }
                                    className="w-full h-8 px-2.5 border border-slate-200 rounded-md bg-slate-50 text-xs font-medium text-slate-700 outline-none transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);

export default InvoiceFilterModal;
