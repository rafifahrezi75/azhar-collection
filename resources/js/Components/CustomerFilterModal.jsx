import React, { memo } from "react";
import {
    Filter,
    RotateCcw,
    X,
} from "lucide-react";

const CustomerFilterModal = memo(function CustomerFilterModal({
    isOpen,
    typeFilter = "all",
    statusFilter = "all",
    onClose,
    onChangeTypeFilter,
    onChangeStatusFilter,
    onReset,
}) {
    if (!isOpen) return null;

    const types = [
        {
            label: "Semua Tipe Pelanggan",
            value: "all",
        },
        {
            label: "Perorangan / Pribadi",
            value: "Perorangan",
        },
        {
            label: "Sekolah / Lembaga Pendidikan",
            value: "Sekolah",
        },
        {
            label: "Instansi / Pemerintah",
            value: "Instansi",
        },
        {
            label: "Perusahaan / Swasta",
            value: "Perusahaan",
        },
        {
            label: "Komunitas / Organisasi",
            value: "Komunitas",
        },
        {
            label: "Lainnya",
            value: "Lainnya",
        },
    ];

    return (
        <div className="absolute right-0 top-full mt-1 z-[100] w-[calc(100vw-24px)] max-w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 sm:p-4 origin-top-right animate-in fade-in zoom-in-95 duration-150">
            <div className="relative border-b border-slate-100 pb-3 mb-3.5">
                <div className="flex items-center gap-2.5 min-w-0 pr-[76px]">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Filter className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">
                            Filter Data Pelanggan
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
                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tipe / Kategori Pemesan
                    </label>

                    <select
                        value={typeFilter}
                        onChange={(e) =>
                            onChangeTypeFilter?.(
                                e.target.value,
                            )
                        }
                        className="w-full h-8 px-2.5 border border-slate-200 rounded-md bg-slate-50 text-xs font-semibold text-slate-700 outline-none transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 cursor-pointer"
                    >
                        {types.map((type) => (
                            <option
                                key={type.value}
                                value={type.value}
                            >
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Status Pelanggan
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
                                    onChangeStatusFilter?.(
                                        item.id,
                                    )
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
            </div>
        </div>
    );
});

export default CustomerFilterModal;
