import React, { memo } from "react";
import { Filter, X, RotateCcw } from "lucide-react";

const CustomerFilterModal = memo(function CustomerFilterModal({
    isOpen,
    typeFilter,
    statusFilter,
    onClose,
    onChangeTypeFilter,
    onChangeStatusFilter,
    onReset,
}) {
    if (!isOpen) return null;

    const types = [
        { label: "Semua Tipe Pelanggan", value: "all" },
        { label: "Perorangan / Pribadi", value: "Perorangan" },
        { label: "Sekolah / Lembaga Pendidikan", value: "Sekolah" },
        { label: "Instansi / Pemerintah", value: "Instansi" },
        { label: "Perusahaan / Swasta", value: "Perusahaan" },
        { label: "Komunitas / Organisasi", value: "Komunitas" },
        { label: "Lainnya", value: "Lainnya" },
    ];

    const statuses = [
        { label: "Semua Status", value: "all" },
        { label: "Aktif", value: "active" },
        { label: "Nonaktif", value: "inactive" },
    ];

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
                                Filter Data Pelanggan
                            </h3>
                            <p className="text-xs text-slate-500">
                                Saring berdasarkan tipe pemesan dan status aktif.
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

                {/* Filters */}
                <div className="space-y-3.5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Tipe / Kategori Pemesan
                        </label>
                        <select
                            value={typeFilter}
                            onChange={(e) => onChangeTypeFilter(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 bg-white font-medium shadow-soft-2xs"
                        >
                            {types.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Status Pelanggan
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => onChangeStatusFilter(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 bg-white font-medium shadow-soft-2xs"
                        >
                            {statuses.map((st) => (
                                <option key={st.value} value={st.value}>
                                    {st.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
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

export default CustomerFilterModal;
