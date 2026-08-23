import React, { memo } from "react";
import { Filter, X, RotateCcw, Calendar, Check } from "lucide-react";

const InvoiceFilterModal = memo(function InvoiceFilterModal({
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

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-5 shadow-soft-xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Filter className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                Filter Transaksi & Invoice
                            </h3>
                            <p className="text-xs text-slate-500">
                                Saring berdasarkan tipe, status bayar, atau tanggal.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Filter Fields */}
                <div className="space-y-4">
                    {/* Tipe Pesanan */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Tipe Pesanan
                        </label>
                        <div className="space-y-1.5">
                            {[
                                { label: "Semua Tipe", value: "all" },
                                { label: "Pesanan Baru (Reguler)", value: "REGULAR" },
                                { label: "Pesanan Lama (Historis)", value: "HISTORICAL" },
                            ].map((opt) => (
                                <label
                                    key={opt.value}
                                    onClick={() => onTypeFilterChange(opt.value)}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                                        typeFilter === opt.value
                                            ? "bg-teal-50 border-teal-300 shadow-2xs"
                                            : "bg-white border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                                        typeFilter === opt.value
                                            ? "border-teal-600 bg-teal-600"
                                            : "border-slate-300 bg-white"
                                    }`}>
                                        {typeFilter === opt.value && (
                                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        )}
                                    </div>
                                    <span className={`text-xs sm:text-sm font-medium ${typeFilter === opt.value ? "text-teal-800" : "text-slate-700"}`}>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Status Pembayaran */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Status Pembayaran
                        </label>
                        <div className="space-y-1.5">
                            {[
                                { label: "Semua Status", value: "all" },
                                { label: "Lunas", value: "LUNAS" },
                                { label: "DP (Uang Muka)", value: "DP" },
                                { label: "Belum Lunas", value: "BELUM_LUNAS" },
                            ].map((opt) => (
                                <label
                                    key={opt.value}
                                    onClick={() => onPaymentStatusFilterChange(opt.value)}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                                        paymentStatusFilter === opt.value
                                            ? "bg-teal-50 border-teal-300 shadow-2xs"
                                            : "bg-white border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                                        paymentStatusFilter === opt.value
                                            ? "border-teal-600 bg-teal-600"
                                            : "border-slate-300 bg-white"
                                    }`}>
                                        {paymentStatusFilter === opt.value && (
                                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        )}
                                    </div>
                                    <span className={`text-xs sm:text-sm font-medium ${paymentStatusFilter === opt.value ? "text-teal-800" : "text-slate-700"}`}>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Rentang Tanggal */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-teal-600" />
                            <span>Rentang Tanggal Pesanan</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[10px] font-medium text-slate-500 block mb-1">Dari Tanggal:</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => onStartDateChange(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 bg-white text-slate-800 shadow-soft-2xs"
                                />
                            </div>
                            <div>
                                <span className="text-[10px] font-medium text-slate-500 block mb-1">Sampai Tanggal:</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => onEndDateChange(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 bg-white text-slate-800 shadow-soft-2xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer shadow-soft-xs"
                    >
                        <Check className="w-3.5 h-3.5" />
                        <span>Terapkan</span>
                    </button>
                </div>

            </div>
        </div>
    );
});

export default InvoiceFilterModal;
