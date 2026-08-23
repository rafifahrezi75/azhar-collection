import React, { memo } from "react";
import { Tags, X, Save } from "lucide-react";

const ProductCategoryModal = memo(function ProductCategoryModal({
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
            <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-5 shadow-soft-xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Tags className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                {isEditing ? "Edit Kategori Produk" : "Tambah Kategori Produk"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {isEditing
                                    ? "Perbarui informasi kategori pakaian jadi."
                                    : "Tambahkan klasifikasi kategori produk pakaian baru."}
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

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-3.5">
                    {/* Nama Kategori */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Nama Kategori <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={form.name}
                            onChange={onChange}
                            placeholder="Contoh: Seragam Olahraga, Jas Almamater..."
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 bg-white shadow-soft-2xs"
                        />
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Deskripsi (Opsional)
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            value={form.description}
                            onChange={onChange}
                            placeholder="Keterangan singkat mengenai kategori pakaian ini..."
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 bg-white shadow-soft-2xs"
                        />
                    </div>

                    {/* Status Aktif Switch */}
                    <div className="pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={(e) =>
                                    onChange({
                                        target: {
                                            name: "is_active",
                                            value: e.target.checked,
                                        },
                                    })
                                }
                                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500/25 focus:ring-2 focus:ring-offset-1"
                            />
                            <span className="text-xs font-semibold text-slate-700">
                                Kategori Aktif (Dapat digunakan pada produk)
                            </span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-soft-xs"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>{submitting ? "Menyimpan..." : isEditing ? "Perbarui" : "Simpan"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default ProductCategoryModal;
