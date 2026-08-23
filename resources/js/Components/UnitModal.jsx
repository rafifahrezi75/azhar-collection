import React, { memo } from "react";
import { Scale, X } from "lucide-react";

const UnitModal = memo(function UnitModal({
    isOpen,
    isEditing,
    form,
    submitting,
    onClose,
    onChange,
    onSubmit,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-xl w-full p-4 sm:p-5 shadow-soft-xl space-y-3.5 border border-slate-100 animate-in zoom-in-95 duration-150 my-auto">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Scale className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                {isEditing ? "Edit Satuan Ukuran" : "Tambah Satuan Ukuran"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Atur nama dan simbol satuan barang / bahan baku.
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

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-7">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Nama Satuan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 placeholder-slate-400 font-medium shadow-soft-2xs"
                                placeholder="Contoh: Meter / Pieces / Roll"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="sm:col-span-5">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Simbol / Kode
                            </label>
                            <input
                                type="text"
                                name="symbol"
                                value={form.symbol}
                                onChange={onChange}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 placeholder-slate-400 uppercase font-semibold shadow-soft-2xs"
                                placeholder="Contoh: m, pcs, roll"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-8">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Deskripsi Singkat
                            </label>
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={onChange}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 placeholder-slate-400 font-medium shadow-soft-2xs"
                                placeholder="Keterangan singkat satuan..."
                            />
                        </div>

                        <div className="sm:col-span-4 sm:pt-5">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    id="modal_unit_is_active"
                                    checked={form.is_active}
                                    onChange={onChange}
                                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/25 focus:ring-2 focus:ring-offset-1 w-4 h-4 cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-slate-700">Status Aktif</span>
                            </label>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 shadow-soft-xs disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? "Memproses..." : isEditing ? "Simpan Perubahan" : "Simpan Satuan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default UnitModal;
