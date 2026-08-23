import React, { memo, useRef, useState, useEffect, useCallback } from "react";
import { Package, X, UploadCloud, Trash2, Image as ImageIcon, Plus, Boxes, RefreshCw, Calculator, Layers, FileText } from "lucide-react";

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

    // Multi-unit initial stock inputs state
    const [stockInputMode, setStockInputMode] = useState("direct"); // "multi" | "direct"
    const [unitQuantities, setUnitQuantities] = useState({ base: 0 });

    // Function to generate auto code
    const generateAutoCode = useCallback(() => {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `BB-${randomNum}`;
    }, []);

    // Direct Mode Unit Selector for Estimation
    const [directEstUnitId, setDirectEstUnitId] = useState("");
    const [directRealQty, setDirectRealQty] = useState("");
    const [directEstQty, setDirectEstQty] = useState("");

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

    // Handle modal open & auto code & initial unit quantities init
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

            // Read base unit and conversion quantities
            const remReal = Number(form.real_stock) || 0;
            const remEst = Number(form.estimated_stock) || 0;

            setDirectRealQty(remReal > 0 ? remReal : (remReal === 0 && isEditing ? 0 : ""));
            setDirectEstQty(remEst > 0 ? remEst : "");
            setDirectEstUnitId(String(form.unit_id || ""));

            const initialQ = {
                base_real: remReal,
                base_est: remEst,
            };

            if (form.conversions && form.conversions.length > 0) {
                setStockInputMode("multi");
                form.conversions.forEach((c, idx) => {
                    initialQ[`conv_real_${idx}`] = Number(c.real_stock || 0);
                    initialQ[`conv_est_${idx}`] = Number(c.estimated_stock || 0);
                });
                setUnitQuantities(initialQ);
            } else {
                setStockInputMode("direct");
                setUnitQuantities(initialQ);
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

    const handleUnitQuantityChange = (key, val) => {
        const num = val === "" ? "" : Math.max(0, parseInt(val, 10) || 0);
        const nextQ = { ...unitQuantities, [key]: num };
        setUnitQuantities(nextQ);

        const baseReal = parseInt(nextQ.base_real || 0, 10) || 0;
        const baseEst = parseInt(nextQ.base_est || 0, 10) || 0;

        let totalBaseReal = baseReal;
        let totalBaseEst = baseEst;

        const updatedConversions = (form.conversions || []).map((c, idx) => {
            const mult = parseInt(c.multiplier || 1, 10) || 1;
            const qReal = parseInt(nextQ[`conv_real_${idx}`] || 0, 10) || 0;
            const qEst = parseInt(nextQ[`conv_est_${idx}`] || 0, 10) || 0;
            totalBaseReal += qReal * mult;
            totalBaseEst += qEst * mult;
            return {
                ...c,
                real_stock: qReal,
                estimated_stock: qEst,
                stock: qReal + qEst,
            };
        });

        const totalStock = totalBaseReal + totalBaseEst;

        onChange({ target: { name: "conversions", value: updatedConversions } });
        onChange({ target: { name: "real_stock", value: baseReal } });
        onChange({ target: { name: "estimated_stock", value: baseEst } });
        onChange({ target: { name: "stock", value: totalStock } });
        onChange({ target: { name: "is_estimated_stock", value: totalBaseEst > 0 } });
    };

    const handleDirectRealChange = (val) => {
        setDirectRealQty(val);
        const real = val === "" ? 0 : Math.max(0, parseInt(val, 10) || 0);
        const est = form.estimated_stock || 0;
        const total = real + est;

        onChange({ target: { name: "real_stock", value: real } });
        onChange({ target: { name: "stock", value: total } });
        onChange({ target: { name: "is_estimated_stock", value: est > 0 } });
    };

    const handleDirectEstChange = (val, chosenUnitId = directEstUnitId) => {
        setDirectEstQty(val);
        const qtyNum = val === "" ? 0 : Math.max(0, parseInt(val, 10) || 0);

        let mult = 1;
        if (chosenUnitId && String(chosenUnitId) !== String(form.unit_id)) {
            const conv = (form.conversions || []).find((c) => String(c.unit_id) === String(chosenUnitId));
            if (conv) mult = parseInt(conv.multiplier || 1, 10) || 1;
        }

        const estInBase = qtyNum * mult;
        const real = form.real_stock || 0;
        const total = real + estInBase;

        onChange({ target: { name: "estimated_stock", value: estInBase } });
        onChange({ target: { name: "stock", value: total } });
        onChange({ target: { name: "is_estimated_stock", value: estInBase > 0 } });
    };

    const handleDirectEstUnitSelect = (unitId) => {
        setDirectEstUnitId(unitId);
        handleDirectEstChange(directEstQty, unitId);
    };

    if (!isOpen) return null;

    const baseUnitObj = units.find((u) => String(u.id) === String(form.unit_id));
    const baseUnitSymbol = baseUnitObj?.symbol || baseUnitObj?.name || "Satuan Dasar";

    // Filter available units for conversion (cannot select the same as base unit)
    const availableConversionUnits = units.filter((u) => String(u.id) !== String(form.unit_id));

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-5xl w-full p-4 sm:p-5 shadow-soft-xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                {isEditing ? "Edit Data Bahan Baku" : "Tambah Bahan Baku Baru"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Lengkapi informasi bahan baku, kemasan multi-satuan, dan stok awal.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form - Side-by-Side 2-Column Layout */}
                <form onSubmit={onSubmit} className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        
                        {/* LEFT COLUMN: Master Data, Photo, & Description (lg:col-span-5) */}
                        <div className="lg:col-span-5 space-y-3.5">
                            
                            {/* Card: Identitas Bahan Baku */}
                            <div className="p-3.5 bg-slate-50/80 rounded-md border border-slate-200 space-y-3 shadow-2xs">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-2">
                                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Informasi Dasar Bahan</span>
                                </div>

                                {/* Code / SKU with Auto Checkbox */}
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
                                            className={`w-full border rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold uppercase transition-all ${
                                                isAutoCode
                                                    ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                                                    : "bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder-slate-400"
                                            }`}
                                            placeholder="Contoh: BB-001"
                                            required
                                        />
                                        {isAutoCode && (
                                            <button
                                                type="button"
                                                onClick={handleRefreshCode}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                                title="Generate Kode Baru"
                                            >
                                                <RefreshCw className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Nama Bahan Baku <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={onChange}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-400 font-medium"
                                        placeholder="Contoh: Kain Toyobo Navy"
                                        required
                                    />
                                </div>

                                {/* Category, Base Unit, Price */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Kategori <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            name="category_id"
                                            value={form.category_id}
                                            onChange={onChange}
                                            className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white font-medium"
                                            required
                                        >
                                            <option value="" disabled hidden>Pilih Kategori</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Satuan Dasar (Gudang) <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            name="unit_id"
                                            value={form.unit_id}
                                            onChange={onChange}
                                            className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white font-medium"
                                            required
                                        >
                                            <option value="" disabled hidden>Pilih Satuan</option>
                                            {units.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.name} {unit.symbol ? `(${unit.symbol})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Harga per {baseUnitSymbol}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                <span className="text-xs font-semibold text-slate-500">Rp</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="price"
                                                value={form.price}
                                                onChange={onChange}
                                                min="0"
                                                className="w-full border border-slate-300 rounded-md pl-7 pr-2.5 py-1.5 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Foto & Deskripsi */}
                            <div className="p-3.5 bg-slate-50/80 rounded-md border border-slate-200 space-y-3 shadow-2xs">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Foto Bahan Baku
                                    </label>
                                    <div className="border border-dashed border-slate-300 rounded-md p-2.5 bg-white flex items-center gap-3">
                                        {previewUrl ? (
                                            <div className="relative w-14 h-14 shrink-0 rounded-md overflow-hidden border border-slate-200 shadow-2xs group bg-white">
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
                                            <div className="w-14 h-14 shrink-0 rounded-md border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                                                <ImageIcon className="w-5 h-5 text-slate-300 mb-0.5" />
                                                <span className="text-[9px] font-semibold text-slate-400">Tanpa Foto</span>
                                            </div>
                                        )}

                                        <div className="flex-1 space-y-1">
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
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
                                            >
                                                <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>{previewUrl ? "Ganti Foto" : "Pilih Foto"}</span>
                                            </label>
                                            <p className="text-[10px] text-slate-400">
                                                JPG, PNG, WEBP. Maks: 3MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Deskripsi / Spesifikasi
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={onChange}
                                        rows={2}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none placeholder-slate-400 font-medium"
                                        placeholder="Keterangan spesifikasi bahan baku..."
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
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
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Multi-Unit Packaging & Initial Stock Calculation (lg:col-span-7) */}
                        <div className="lg:col-span-7 space-y-3.5">
                            
                            {/* Card: Satuan Kemasan / Multi-Satuan */}
                            <div className="p-3.5 rounded-md bg-slate-50/80 border border-slate-200 space-y-2.5 shadow-2xs">
                                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Boxes className="w-4 h-4 text-teal-600" />
                                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                            Satuan Kemasan (Multi-Satuan)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onAddConversion}
                                        disabled={!form.unit_id || availableConversionUnits.length === 0}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
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
                                                    className="p-2 bg-white rounded-md border border-slate-200 flex items-center gap-2 shadow-2xs"
                                                >
                                                    <div className="flex-1">
                                                        <select
                                                            value={conv.unit_id}
                                                            onChange={(e) =>
                                                                onConversionChange(index, "unit_id", e.target.value)
                                                            }
                                                            className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                                                            required
                                                        >
                                                            <option value="" disabled hidden>Pilih Satuan</option>
                                                            {availableConversionUnits.map((u) => (
                                                                <option key={u.id} value={u.id}>
                                                                    {u.name} ({u.symbol || u.name})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="w-28 flex items-center gap-1">
                                                        <span className="text-[11px] text-slate-500 font-medium">@</span>
                                                        <input
                                                            type="number"
                                                            min="2"
                                                            value={conv.multiplier}
                                                            onChange={(e) =>
                                                                onConversionChange(index, "multiplier", e.target.value)
                                                            }
                                                            placeholder="Isi"
                                                            className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                            required
                                                        />
                                                        <span className="text-xs font-semibold text-slate-500">{baseUnitSymbol}</span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => onRemoveConversion(index)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer shrink-0"
                                                        title="Hapus satuan konversi"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500">
                                        Belum ada satuan kemasan tambahan (misal: Roll @ 50m, Dus @ 100pcs). Klik "Tambah Kemasan" jika bahan memiliki satuan bertingkat.
                                    </p>
                                )}
                            </div>

                            {/* Card: Input Stok Awal */}
                            <div className="p-3.5 rounded-md bg-emerald-50/40 border border-emerald-200/80 space-y-3 shadow-2xs">
                                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calculator className="w-4 h-4 text-emerald-700" />
                                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                            Jumlah Stok Awal ({baseUnitSymbol})
                                        </label>
                                    </div>

                                    {form.conversions && form.conversions.length > 0 && (
                                        <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-slate-200 text-[11px]">
                                            <button
                                                type="button"
                                                onClick={() => setStockInputMode("multi")}
                                                className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                                                    stockInputMode === "multi"
                                                        ? "bg-emerald-600 text-white shadow-2xs"
                                                        : "text-slate-600 hover:text-slate-900"
                                                }`}
                                            >
                                                Pilih per Satuan
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStockInputMode("direct")}
                                                className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                                                    stockInputMode === "direct"
                                                        ? "bg-emerald-600 text-white shadow-2xs"
                                                        : "text-slate-600 hover:text-slate-900"
                                                }`}
                                            >
                                                Input Total Langsung
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Multi-Unit Mode Input Fields */}
                                {stockInputMode === "multi" && form.conversions && form.conversions.length > 0 ? (
                                    <div className="space-y-2.5">
                                        <p className="text-xs text-slate-600 font-medium">
                                            Tentukan jumlah fisik untuk masing-masing satuan (Nyata vs Estimasi/Sisaan):
                                        </p>

                                        {/* Conversion Unit Cards */}
                                        {form.conversions.map((conv, idx) => {
                                            const convUnitObj = units.find((u) => String(u.id) === String(conv.unit_id));
                                            const convName = convUnitObj?.name || "Satuan";
                                            const convSymbol = convUnitObj?.symbol || convName;
                                            const mult = parseInt(conv.multiplier || 1, 10);
                                            return (
                                                <div key={idx} className="p-2.5 bg-white rounded-md border border-slate-200 shadow-2xs space-y-1.5">
                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                                        <span className="text-xs font-bold text-slate-800">
                                                            {convName} ({convSymbol})
                                                        </span>
                                                        <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                            1 {convSymbol} = {mult} {baseUnitSymbol}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                                                                Nyata (Utuh)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={unitQuantities[`conv_real_${idx}`] ?? ""}
                                                                onChange={(e) => handleUnitQuantityChange(`conv_real_${idx}`, e.target.value)}
                                                                placeholder="0"
                                                                className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] font-semibold text-amber-900 mb-0.5">
                                                                Estimasi (Sisaan)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={unitQuantities[`conv_est_${idx}`] ?? ""}
                                                                onChange={(e) => handleUnitQuantityChange(`conv_est_${idx}`, e.target.value)}
                                                                placeholder="0"
                                                                className="w-full border border-amber-300 rounded-md px-2 py-1 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-amber-50/30"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Base Unit Card */}
                                        <div className="p-2.5 bg-white rounded-md border border-teal-200 shadow-2xs space-y-1.5">
                                            <div className="flex items-center justify-between border-b border-teal-100 pb-1">
                                                <span className="text-xs font-bold text-slate-800">
                                                    {baseUnitSymbol} (Satuan Terkecil / Dasar)
                                                </span>
                                                <span className="text-[10px] font-mono font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                                    @1 {baseUnitSymbol}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                                                        Nyata ({baseUnitSymbol})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={unitQuantities.base_real ?? ""}
                                                        onChange={(e) => handleUnitQuantityChange("base_real", e.target.value)}
                                                        placeholder="0"
                                                        className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-semibold text-amber-900 mb-0.5">
                                                        Estimasi ({baseUnitSymbol})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={unitQuantities.base_est ?? ""}
                                                        onChange={(e) => handleUnitQuantityChange("base_est", e.target.value)}
                                                        placeholder="0"
                                                        className="w-full border border-amber-300 rounded-md px-2 py-1 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-amber-50/30"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dynamic Live Calculation Summary */}
                                        <div className="p-2.5 bg-emerald-100/70 rounded-md border border-emerald-300/80 flex items-center justify-between text-xs">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="font-semibold text-emerald-950">Rincian:</span>
                                                <span className="font-mono font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                                                    Nyata: {form.real_stock || 0} {baseUnitSymbol}
                                                </span>
                                                {Number(form.estimated_stock) > 0 && (
                                                    <span className="font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 text-[11px]">
                                                        Estimasi: ~{form.estimated_stock} {baseUnitSymbol}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-mono font-extrabold text-sm text-emerald-950">
                                                    Total: {form.stock || 0} {baseUnitSymbol}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Direct Mode Input */
                                    <div className="space-y-2.5">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Stok Nyata ({baseUnitSymbol}) <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={directRealQty}
                                                    onChange={(e) => handleDirectRealChange(e.target.value)}
                                                    min="0"
                                                    className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-xs font-semibold text-amber-900">
                                                        Stok Estimasi
                                                    </label>
                                                    {form.conversions && form.conversions.length > 0 && (
                                                        <select
                                                            value={directEstUnitId}
                                                            onChange={(e) => handleDirectEstUnitSelect(e.target.value)}
                                                            className="text-[10px] border border-amber-300 rounded px-1 py-0.5 bg-amber-50/50 text-amber-900 font-semibold"
                                                        >
                                                            <option value={form.unit_id}>{baseUnitSymbol}</option>
                                                            {form.conversions.map((c, i) => {
                                                                const uObj = units.find((u) => String(u.id) === String(c.unit_id));
                                                                return (
                                                                    <option key={i} value={c.unit_id}>
                                                                        {uObj?.name || "Kemasan"} (@{c.multiplier})
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    )}
                                                </div>
                                                <input
                                                    type="number"
                                                    value={directEstQty}
                                                    onChange={(e) => handleDirectEstChange(e.target.value)}
                                                    min="0"
                                                    className="w-full border border-amber-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-2 bg-emerald-100/70 rounded-md border border-emerald-300 text-xs">
                                            <span className="font-medium text-emerald-900">Total Stok Keseluruhan:</span>
                                            <span className="font-mono font-bold text-sm text-emerald-950">
                                                {form.stock || 0} {baseUnitSymbol}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Batas Minimum Stok (Peringatan dalam {baseUnitSymbol})
                                    </label>
                                    <input
                                        type="number"
                                        name="min_stock"
                                        value={form.min_stock}
                                        onChange={onChange}
                                        min="0"
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                                        placeholder="5"
                                    />
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-4 shrink-0">
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
