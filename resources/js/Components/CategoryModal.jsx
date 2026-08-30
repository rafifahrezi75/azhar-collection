import React, { memo } from "react";
import { FolderPlus, Save, X } from "lucide-react";

const CategoryModal = memo(function CategoryModal({
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
        <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-xl p-4 sm:p-5 shadow-soft-xl border border-slate-100 animate-in zoom-in-95 duration-150 my-auto max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-32px)] overflow-y-auto">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2.5">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
                        <FolderPlus className="w-4.5 h-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                            {isEditing
                                ? "Edit Kategori Produk"
                                : "Tambah Kategori Produk"}
                        </h3>

                        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                            Isi informasi data kategori produk di bawah ini.
                        </p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-3 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:items-center">
                        <div className="sm:col-span-8">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Nama Kategori{" "}
                                <span className="text-rose-500">*</span>
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                className="w-full min-w-0 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 placeholder-slate-400 font-medium shadow-soft-2xs"
                                placeholder="Contoh: Kain & Tekstil Utama"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="sm:col-span-4 sm:pt-5">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    id="modal_is_active"
                                    checked={form.is_active}
                                    onChange={onChange}
                                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/25 focus:ring-2 focus:ring-offset-1 w-4 h-4 cursor-pointer shrink-0"
                                />

                                <span className="text-xs font-semibold text-slate-700">
                                    Status Aktif
                                </span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Deskripsi Singkat
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={onChange}
                            rows={3}
                            className="w-full min-w-0 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 placeholder-slate-400 resize-none font-medium shadow-soft-2xs"
                            placeholder="Penjelasan ringkas mengenai kategori ini..."
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            title="Kembali"
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            title={
                                submitting
                                    ? "Memproses..."
                                    : isEditing
                                      ? "Simpan Perubahan"
                                      : "Simpan Kategori"
                            }
                            className="w-8 h-8 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-md border border-teal-700/20 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default CategoryModal;
