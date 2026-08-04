import React, { memo, useRef, useState, useEffect, useCallback } from "react";
import { Package, X, UploadCloud, Trash2, Image as ImageIcon, Plus, Boxes, RefreshCw } from "lucide-react";

const ItemModal = memo(function ItemModal({
    isOpen,
    isEditing,
    form,
    categories = [],
    units = [],
    submitting,
    onClose,
    onChange,
    onFileChange,
    onRemoveImage,
    onAddConversion,
    onRemoveConversion,
    onConversionChange,
    onSubmit,
}) {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAutoCode, setIsAutoCode] = useState(!isEditing);

    // Function to generate auto code
    const generateAutoCode = useCallback(() => {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `BB-${randomNum}`;
    }, []);

    // Sync preview URL
    useEffect(() => {
        if (form.imageFile) {
            const objectUrl = URL.createObjectURL(form.imageFile);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (form.existingImageUrl && !form.removeImage) {
            setPreviewUrl(form.existingImageUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [form.imageFile, form.existingImageUrl, form.removeImage]);

    // Handle modal open & auto code init
    useEffect(() => {
        if (isOpen) {
            if (!isEditing) {
                setIsAutoCode(true);
                if (!form.code) {
                    const newCode = generateAutoCode();
                    onChange({ target: { name: "code", value: newCode } });
                }
            } else {
                setIsAutoCode(false);
            }
        }
    }, [isOpen, isEditing]);

    const handleToggleAutoCode = (checked) => {
        setIsAutoCode(checked);
        if (checked) {
            const newCode = generateAutoCode();
            onChange({ target: { name: "code", value: newCode } });
        }
    };

    const handleRefreshCode = () => {
        if (isAutoCode) {
            const newCode = generateAutoCode();
            onChange({ target: { name: "code", value: newCode } });
        }
    };

    if (!isOpen) return null;

    const baseUnitObj = units.find((u) => String(u.id) === String(form.unit_id));
    const baseUnitSymbol = baseUnitObj?.symbol || baseUnitObj?.name || "Satuan Dasar";

    // Filter available units for conversion (cannot select the same as base unit)
    const availableConversionUnits = units.filter((u) => String(u.id) !== String(form.unit_id));

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-md max-w-2xl w-full p-5 sm:p-6 shadow-xl space-y-4 border border-slate-200 animate-in zoom-in-95 duration-150 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Package className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                {isEditing ? "Edit Data Bahan Baku" : "Tambah Bahan Baku Baru"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Lengkapi informasi bahan baku, multi-satuan kemasan, stok, dan foto.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-3.5">
                    {/* Row 1: Code (SKU) & Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Kode / SKU <span className="text-rose-500">*</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isAutoCode}
                                        onChange={(e) => handleToggleAutoCode(e.target.checked)}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <span className="text-[11px] font-medium text-slate-600">Otomatis</span>
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="code"
                                    value={form.code}
                                    onChange={onChange}
                                    readOnly={isAutoCode}
                                    className={`w-full border rounded-md px-3 py-2 text-xs sm:text-sm font-mono font-bold uppercase transition-all ${
                                        isAutoCode
                                            ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                                            : "bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder-slate-400"
                                    }`}
                                    placeholder="Contoh: KAIN-001"
                                    required
                                />
                                {isAutoCode && (
                                    <button
                                        type="button"
                                        onClick={handleRefreshCode}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                        title="Generate Kode Baru"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Nama Bahan Baku <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-400 font-medium"
                                placeholder="Contoh: Kain Katun Toyobo Premium Navy Blue"
                                required
                            />
                        </div>
                    </div>

                    {/* Row 2: Category & Base Unit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Kategori Bahan <span className="text-rose-500">*</span>
                            </label>
                            <select
                                name="category_id"
                                value={form.category_id}
                                onChange={onChange}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white font-medium"
                                required
                            >
                                <option value="">-- Pilih Kategori --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Satuan Terkecil / Dasar <span className="text-rose-500">*</span>
                            </label>
                            <select
                                name="unit_id"
                                value={form.unit_id}
                                onChange={onChange}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white font-medium"
                                required
                            >
                                <option value="">-- Pilih Satuan Dasar --</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name} {unit.symbol ? `(${unit.symbol})` : ""}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[11px] text-slate-500 mt-1">
                                Satuan terkecil untuk kalkulasi stok (contoh: Meter atau Pcs).
                            </p>
                        </div>
                    </div>

                    {/* Multi-Unit Conversions Section */}
                    <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <div className="flex items-center gap-2">
                                <Boxes className="w-4 h-4 text-teal-600" />
                                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Satuan Kemasan / Multi-Satuan (Konversi)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={onAddConversion}
                                disabled={!form.unit_id || availableConversionUnits.length === 0}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Kemasan</span>
                            </button>
                        </div>

                        {form.conversions && form.conversions.length > 0 ? (
                            <div className="space-y-2">
                                {form.conversions.map((conv, index) => {
                                    const convUnitObj = units.find((u) => String(u.id) === String(conv.unit_id));
                                    const convSymbol = convUnitObj?.symbol || convUnitObj?.name || "Kemasan";
                                    return (
                                        <div
                                            key={index}
                                            className="p-2.5 bg-white rounded-md border border-slate-200 flex flex-col sm:flex-row items-center gap-2.5 shadow-2xs"
                                        >
                                            <div className="w-full sm:w-1/2">
                                                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-0.5">
                                                    Pilih Satuan Kemasan
                                                </label>
                                                <select
                                                    value={conv.unit_id}
                                                    onChange={(e) =>
                                                        onConversionChange(index, "unit_id", e.target.value)
                                                    }
                                                    className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                                                    required
                                                >
                                                    <option value="">-- Pilih Satuan --</option>
                                                    {availableConversionUnits.map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.name} ({u.symbol || u.name})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="w-full sm:w-1/3">
                                                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-0.5">
                                                    Isi (@ {baseUnitSymbol})
                                                </label>
                                                <input
                                                    type="number"
                                                    min="2"
                                                    value={conv.multiplier}
                                                    onChange={(e) =>
                                                        onConversionChange(index, "multiplier", e.target.value)
                                                    }
                                                    placeholder="Contoh: 50"
                                                    className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-3">
                                                <span className="text-xs font-mono text-slate-700 font-bold truncate">
                                                    1 {convSymbol} = {conv.multiplier || "?"} {baseUnitSymbol}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveConversion(index)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                                    title="Hapus satuan konversi"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500">
                                Belum ada satuan kemasan tambahan. Anda bisa menambahkan satuan bertingkat seperti: 1 Roll = 50 Meter, 1 Box = 120 Pcs, atau 1 Gross = 144 Pcs.
                            </p>
                        )}
                    </div>

                    {/* Row 3: Stock & Min Stock */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Jumlah Stok Awal ({baseUnitSymbol}) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={onChange}
                                min="0"
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                placeholder="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Batas Minimum Stok (Peringatan)
                            </label>
                            <input
                                type="number"
                                name="min_stock"
                                value={form.min_stock}
                                onChange={onChange}
                                min="0"
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                placeholder="5"
                            />
                        </div>
                    </div>

                    {/* Photo Upload Section */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Foto Bahan Baku
                        </label>
                        
                        <div className="border border-dashed border-slate-300 rounded-md p-3 bg-slate-50/70 flex flex-col sm:flex-row items-center gap-3">
                            {/* Preview Area */}
                            {previewUrl ? (
                                <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden border border-slate-200 shadow-2xs group bg-white">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                            onRemoveImage();
                                        }}
                                        className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        title="Hapus foto ini"
                                    >
                                        <Trash2 className="w-4 h-4 text-rose-300" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-16 h-16 shrink-0 rounded-md border border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon className="w-6 h-6 text-slate-300 mb-0.5" />
                                    <span className="text-[10px] font-semibold text-slate-400">Tanpa Foto</span>
                                </div>
                            )}

                            {/* Upload Controls */}
                            <div className="flex-1 text-center sm:text-left space-y-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={onFileChange}
                                    className="hidden"
                                    id="barang_photo_input"
                                />
                                <label
                                    htmlFor="barang_photo_input"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
                                >
                                    <UploadCloud className="w-4 h-4 text-emerald-600" />
                                    <span>{previewUrl ? "Ganti Foto" : "Pilih Foto Bahan"}</span>
                                </label>
                                <p className="text-[11px] text-slate-500">
                                    Format: JPG, PNG, WEBP. Maksimal ukuran: 3MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Deskripsi / Spesifikasi Bahan
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={onChange}
                            rows={2}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none placeholder-slate-400"
                            placeholder="Keterangan spesifikasi bahan, warna, lebar kain, merk, dll..."
                        />
                    </div>

                    {/* Status Active Checkbox */}
                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            name="is_active"
                            id="modal_barang_is_active"
                            checked={form.is_active}
                            onChange={onChange}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <label
                            htmlFor="modal_barang_is_active"
                            className="text-xs font-semibold text-slate-700 select-none cursor-pointer"
                        >
                            Status Bahan Baku Aktif Digunakan
                        </label>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3.5 mt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? "Memproses..." : isEditing ? "Simpan Perubahan" : "Simpan Bahan Baku"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default ItemModal;
