import React, { useRef, useState, useEffect, useCallback } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Toast } from "@/utils/sweetalert";
import {
    Package,
    Save,
    UploadCloud,
    Trash2,
    Image as ImageIcon,
    Plus,
    Boxes,
    RefreshCw,
    Calculator,
    FileText,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

export default function Create({ categories = [], units = [] }) {
    const { auth } = usePage().props;
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAutoCode, setIsAutoCode] = useState(true);
    const [stockInputMode, setStockInputMode] = useState("direct");
    const [unitQuantities, setUnitQuantities] = useState({
        base_real: 0,
        base_est: 0,
    });
    const [directEstUnitId, setDirectEstUnitId] = useState("");
    const [directRealQty, setDirectRealQty] = useState("");
    const [directEstQty, setDirectEstQty] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        code: "",
        name: "",
        category_id: "",
        unit_id: "",
        usage_unit: "",
        conversion_rate: 1,
        price: 0,
        stock: 0,
        real_stock: 0,
        estimated_stock: 0,
        is_estimated_stock: false,
        min_stock: 5,
        description: "",
        is_active: true,
        imageFile: null,
        existingImageUrl: null,
        removeImage: false,
        conversions: [],
    });

    const generateAutoCode = useCallback(() => {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `BB-${randomNum}`;
    }, []);

    useEffect(() => {
        if (isAutoCode) {
            const newCode = generateAutoCode();
            setForm((prev) => ({ ...prev, code: newCode }));
        }
    }, [isAutoCode, generateAutoCode]);

    useEffect(() => {
        if (form.imageFile) {
            const objectUrl = URL.createObjectURL(form.imageFile);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (form.existingImageUrl && !form.removeImage) {
            setPreviewUrl(form.existingImageUrl);
        } else setPreviewUrl(null);
    }, [form.imageFile, form.existingImageUrl, form.removeImage]);

    useEffect(() => {
        if (form.unit_id) setDirectEstUnitId(String(form.unit_id));
    }, [form.unit_id]);

    const handleToggleAutoCode = (checked) => {
        setIsAutoCode(checked);
        if (checked) {
            const newCode = generateAutoCode();
            setForm((prev) => ({ ...prev, code: newCode }));
        }
    };

    const handleRefreshCode = () => {
        if (isAutoCode) {
            const newCode = generateAutoCode();
            setForm((prev) => ({ ...prev, code: newCode }));
        }
    };

    const onChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setForm((prev) => ({ ...prev, imageFile: file, removeImage: false }));
    }, []);

    const handleRemoveImage = useCallback(() => {
        if (fileInputRef.current) fileInputRef.current.value = "";
        setForm((prev) => ({ ...prev, imageFile: null, removeImage: true }));
    }, []);

    const handleAddConversion = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            conversions: [...prev.conversions, { unit_id: "", multiplier: 10 }],
        }));
    }, []);

    const handleRemoveConversion = useCallback((index) => {
        setForm((prev) => ({
            ...prev,
            conversions: prev.conversions.filter((_, i) => i !== index),
        }));
    }, []);

    const handleConversionChange = useCallback((index, field, value) => {
        setForm((prev) => {
            const updated = [...prev.conversions];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, conversions: updated };
        });
    }, []);

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
        setForm((prev) => ({
            ...prev,
            conversions: updatedConversions,
            real_stock: baseReal,
            estimated_stock: baseEst,
            stock: totalStock,
            is_estimated_stock: totalBaseEst > 0,
        }));
    };

    const handleDirectRealChange = (val) => {
        setDirectRealQty(val);
        const real = val === "" ? 0 : Math.max(0, parseInt(val, 10) || 0);
        const est = form.estimated_stock || 0;
        const total = real + est;
        setForm((prev) => ({
            ...prev,
            real_stock: real,
            stock: total,
            is_estimated_stock: est > 0,
        }));
    };

    const handleDirectEstChange = (val, chosenUnitId = directEstUnitId) => {
        setDirectEstQty(val);
        const qtyNum = val === "" ? 0 : Math.max(0, parseInt(val, 10) || 0);
        let mult = 1;
        if (chosenUnitId && String(chosenUnitId) !== String(form.unit_id)) {
            const conv = (form.conversions || []).find(
                (c) => String(c.unit_id) === String(chosenUnitId),
            );
            if (conv) mult = parseInt(conv.multiplier || 1, 10) || 1;
        }
        const estInBase = qtyNum * mult;
        const real = form.real_stock || 0;
        const total = real + estInBase;
        setForm((prev) => ({
            ...prev,
            estimated_stock: estInBase,
            stock: total,
            is_estimated_stock: estInBase > 0,
        }));
    };

    const handleDirectEstUnitSelect = (unitId) => {
        setDirectEstUnitId(unitId);
        handleDirectEstChange(directEstQty, unitId);
    };

    useEffect(() => {
        if (form.conversions && form.conversions.length > 0) {
            setStockInputMode("multi");
            const initialQ = { base_real: 0, base_est: 0 };
            form.conversions.forEach((c, idx) => {
                initialQ[`conv_real_${idx}`] = Number(c.real_stock || 0);
                initialQ[`conv_est_${idx}`] = Number(c.estimated_stock || 0);
            });
            setUnitQuantities(initialQ);
        }
    }, [form.conversions.length]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const realStockNum = Number(form.real_stock) || 0;
        const estimatedStockNum = Number(form.estimated_stock) || 0;
        const totalStockNum =
            realStockNum + estimatedStockNum > 0
                ? realStockNum + estimatedStockNum
                : Number(form.stock) || 0;
        const formData = new FormData();
        formData.append("code", form.code);
        formData.append("name", form.name);
        formData.append("category_id", form.category_id);
        formData.append("unit_id", form.unit_id);
        formData.append("usage_unit", form.usage_unit || "");
        formData.append("conversion_rate", form.conversion_rate || "1");
        formData.append("price", form.price || "0");
        formData.append("real_stock", realStockNum);
        formData.append("estimated_stock", estimatedStockNum);
        formData.append("stock", totalStockNum);
        formData.append(
            "is_estimated_stock",
            estimatedStockNum > 0 || form.is_estimated_stock ? "1" : "0",
        );
        formData.append("min_stock", form.min_stock);
        formData.append("description", form.description || "");
        formData.append("is_active", form.is_active ? "1" : "0");
        formData.append("conversions", JSON.stringify(form.conversions));
        if (form.imageFile) formData.append("image", form.imageFile);
        if (form.removeImage) formData.append("remove_image", "1");
        try {
            const res = await axios.post("/api/items", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            Toast.success(
                res.data.message || "Data barang berhasil ditambahkan.",
            );
            router.visit("/dashboard/barang");
        } catch (err) {
            const message =
                err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(", ")
                    : "Terjadi kesalahan saat menyimpan data barang.");
            Toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const baseUnitObj = units.find(
        (u) => String(u.id) === String(form.unit_id),
    );
    const baseUnitSymbol =
        baseUnitObj?.symbol || baseUnitObj?.name || "Satuan Utama";
    const availableConversionUnits = units.filter(
        (u) => String(u.id) !== String(form.unit_id),
    );

    return (
        <DashboardLayout>
            <Head title="Tambah Bahan Baku - Azhar Collection" />
            <div className="space-y-4 max-w-7xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    <div className="p-4 sm:p-5">
                        {/* HEADER - DIBIARKAN UTUH SESUAI INSTRUKSI */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    title="Kembali"
                                    onClick={() =>
                                        router.visit("/dashboard/barang")
                                    }
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-sm cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                    <Package className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                                        Form Bahan Baku
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Isi dengan lengkap untuk akurasi stok
                                        multi-satuan.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                title={submitting ? "Menyimpan..." : "Simpan"}
                                disabled={submitting}
                                className="w-8 h-8 shrink-0 inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                        </div>

                        {/* BODY ROMBAKAN */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* KOLOM KIRI: Informasi Utama & Media */}
                            <div className="lg:col-span-6 space-y-4">
                                {/* Section Informasi Dasar */}
                                <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-2">
                                        <FileText className="w-4 h-4 text-teal-600" />
                                        <span>Informasi Utama</span>
                                    </div>

                                    {/* SKU & Toggle Auto */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs font-semibold text-slate-700">
                                                Kode / SKU <span className="text-rose-500">*</span>
                                            </label>
                                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={isAutoCode}
                                                    onChange={(e) => handleToggleAutoCode(e.target.checked)}
                                                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                                                />
                                                <span className="text-xs font-medium text-slate-600">Otomatis</span>
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="code"
                                                value={form.code}
                                                onChange={onChange}
                                                readOnly={isAutoCode}
                                                className={`w-full border rounded-lg px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
                                                    isAutoCode
                                                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                                                        : "bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                }`}
                                                placeholder="Contoh: BB-001"
                                                required
                                            />
                                            {isAutoCode && (
                                                <button
                                                    type="button"
                                                    onClick={handleRefreshCode}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-200/60 rounded-md transition-colors"
                                                    title="Acak Kode Baru"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Nama Bahan Baku */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Nama Bahan Baku <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={onChange}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder-slate-400 font-medium transition-all"
                                            placeholder="Contoh: Kain Toyobo Navy Premium"
                                            required
                                        />
                                    </div>

                                    {/* Kategori, Satuan Utama & Harga */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Kategori <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                name="category_id"
                                                value={form.category_id}
                                                onChange={onChange}
                                                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-medium"
                                                required
                                            >
                                                <option value="" disabled hidden>Pilih</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Satuan Dasar <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                name="unit_id"
                                                value={form.unit_id}
                                                onChange={onChange}
                                                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-medium"
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
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Harga / {baseUnitSymbol}
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={form.price}
                                                    onChange={onChange}
                                                    min="0"
                                                    className="w-full border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-mono font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section Foto & Keterangan */}
                                <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3.5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Foto Bahan Baku
                                        </label>
                                        <div className="border border-dashed border-slate-300 hover:border-teal-500 rounded-lg p-3 bg-white transition-colors flex items-center gap-3">
                                            {previewUrl ? (
                                                <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-xs group bg-slate-100">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Hapus Gambar"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-rose-300" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 shrink-0 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                                                    <ImageIcon className="w-5 h-5 text-slate-300" />
                                                </div>
                                            )}

                                            <div className="flex-1 space-y-1">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="barang_photo_create"
                                                />
                                                <label
                                                    htmlFor="barang_photo_create"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 hover:border-teal-500 text-slate-700 text-xs font-semibold rounded-md shadow-2xs cursor-pointer transition-all"
                                                >
                                                    <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
                                                    <span>{previewUrl ? "Ganti Gambar" : "Pilih Gambar"}</span>
                                                </label>
                                                <p className="text-[10px] text-slate-400">
                                                    JPG, PNG, WEBP. Maksimal 3MB.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Deskripsi / Spesifikasi
                                        </label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={onChange}
                                            rows={2}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none placeholder-slate-400 font-medium"
                                            placeholder="Catatan spesifikasi bahan (misal: Gramasi, Warna, Tekstur)..."
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            id="create_barang_is_active"
                                            checked={form.is_active}
                                            onChange={onChange}
                                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                                        />
                                        <label
                                            htmlFor="create_barang_is_active"
                                            className="text-xs font-semibold text-slate-700 select-none cursor-pointer"
                                        >
                                            Status Bahan Baku Aktif Digunakan
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* KOLOM KANAN: Multi-Satuan & Kalkulasi Stok Awal */}
                            <div className="lg:col-span-6 space-y-4">
                                {/* Section Multi-Satuan */}
                                <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Boxes className="w-4 h-4 text-teal-600" />
                                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                Kemasan Tambahan (Multi-Satuan)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddConversion}
                                            disabled={!form.unit_id || availableConversionUnits.length === 0}
                                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah Kemasan</span>
                                        </button>
                                    </div>

                                    {form.conversions && form.conversions.length > 0 ? (
                                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                                            {form.conversions.map((conv, index) => (
                                                <div
                                                    key={index}
                                                    className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2 shadow-2xs"
                                                >
                                                    <div className="flex-1">
                                                        <select
                                                            value={conv.unit_id}
                                                            onChange={(e) => handleConversionChange(index, "unit_id", e.target.value)}
                                                            className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                                                            required
                                                        >
                                                            <option value="" disabled hidden>Pilih Satuan Kemasan</option>
                                                            {availableConversionUnits.map((u) => (
                                                                <option key={u.id} value={u.id}>
                                                                    {u.name} ({u.symbol || u.name})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className="text-xs text-slate-400 font-medium">=</span>
                                                        <input
                                                            type="number"
                                                            min="2"
                                                            value={conv.multiplier}
                                                            onChange={(e) => handleConversionChange(index, "multiplier", e.target.value)}
                                                            className="w-16 border border-slate-300 rounded-md px-2 py-1 text-xs font-mono font-bold text-center focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                            required
                                                        />
                                                        <span className="text-xs font-semibold text-slate-600 truncate max-w-[60px]">
                                                            {baseUnitSymbol}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveConversion(index)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
                                                        title="Hapus Kemasan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 py-1 italic">
                                            Belum ada satuan tambahan (misal: Roll @ 50m, Dus @ 100pcs). Tambahkan jika bahan baku dikemas bertingkat.
                                        </p>
                                    )}
                                </div>

                                {/* Section Input Stok Awal */}
                                <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3.5">
                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Calculator className="w-4 h-4 text-teal-600" />
                                            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                Input Stok Awal ({baseUnitSymbol})
                                            </label>
                                        </div>

                                        {form.conversions && form.conversions.length > 0 && (
                                            <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium">
                                                <button
                                                    type="button"
                                                    onClick={() => setStockInputMode("multi")}
                                                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                                                        stockInputMode === "multi"
                                                            ? "bg-white text-teal-700 shadow-2xs"
                                                            : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                                >
                                                    Per Kemasan
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setStockInputMode("direct")}
                                                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                                                        stockInputMode === "direct"
                                                            ? "bg-white text-teal-700 shadow-2xs"
                                                            : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                                >
                                                    Direct Total
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mode Rincian Per Satuan Kemasan */}
                                    {stockInputMode === "multi" && form.conversions && form.conversions.length > 0 ? (
                                        <div className="space-y-2.5">
                                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                                {/* Baris Input Satuan Tambahan */}
                                                {form.conversions.map((conv, idx) => {
                                                    const convUnitObj = units.find((u) => String(u.id) === String(conv.unit_id));
                                                    const convSymbol = convUnitObj?.symbol || convUnitObj?.name || "Kemasan";
                                                    const mult = parseInt(conv.multiplier || 1, 10) || 1;

                                                    return (
                                                        <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                                                            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                                                <span className="text-xs font-bold text-slate-800">
                                                                    Kemasan: {convSymbol}
                                                                </span>
                                                                <span className="text-[10px] font-mono font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                                                    1 {convSymbol} = {mult} {baseUnitSymbol}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="block text-[10px] font-semibold text-teal-900 mb-0.5">
                                                                        Utuh (Nyata)
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={unitQuantities[`conv_real_${idx}`] ?? ""}
                                                                        onChange={(e) => handleUnitQuantityChange(`conv_real_${idx}`, e.target.value)}
                                                                        placeholder="0"
                                                                        className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-semibold text-amber-900 mb-0.5">
                                                                        Sisaan (Estimasi)
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={unitQuantities[`conv_est_${idx}`] ?? ""}
                                                                        onChange={(e) => handleUnitQuantityChange(`conv_est_${idx}`, e.target.value)}
                                                                        placeholder="0"
                                                                        className="w-full border border-amber-300 rounded-md px-2 py-1 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-amber-50/20"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Baris Input Satuan Utama */}
                                                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                                        <span className="text-xs font-bold text-slate-800">
                                                            {baseUnitSymbol} (Satuan Dasar)
                                                        </span>
                                                        <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            @1 {baseUnitSymbol}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-[10px] font-semibold text-teal-900 mb-0.5">
                                                                Utuh (Nyata)
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
                                                                Sisaan (Estimasi)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={unitQuantities.base_est ?? ""}
                                                                onChange={(e) => handleUnitQuantityChange("base_est", e.target.value)}
                                                                placeholder="0"
                                                                className="w-full border border-amber-300 rounded-md px-2 py-1 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-amber-50/20"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Mode Input Direct */
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Stok Nyata ({baseUnitSymbol}) <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={directRealQty}
                                                    onChange={(e) => handleDirectRealChange(e.target.value)}
                                                    min="0"
                                                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-amber-900 mb-1">
                                                    Stok Estimasi
                                                </label>
                                                <div className="flex rounded-lg shadow-2xs">
                                                    <input
                                                        type="number"
                                                        value={directEstQty}
                                                        onChange={(e) => handleDirectEstChange(e.target.value)}
                                                        min="0"
                                                        className="w-full border border-amber-300 rounded-l-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                                                        placeholder="0"
                                                    />
                                                    {form.conversions && form.conversions.length > 0 ? (
                                                        <select
                                                            value={directEstUnitId}
                                                            onChange={(e) => handleDirectEstUnitSelect(e.target.value)}
                                                            className="border border-l-0 border-amber-300 rounded-r-lg px-2 py-1.5 bg-amber-50 text-amber-950 font-bold text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shrink-0"
                                                        >
                                                            <option value={form.unit_id}>{baseUnitSymbol}</option>
                                                            {form.conversions.map((c, i) => {
                                                                const uObj = units.find((u) => String(u.id) === String(c.unit_id));
                                                                return (
                                                                    <option key={i} value={c.unit_id}>
                                                                        {uObj?.symbol || uObj?.name || "Kemasan"} (@{c.multiplier})
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    ) : (
                                                        <span className="inline-flex items-center border border-l-0 border-amber-300 rounded-r-lg px-2.5 py-1.5 bg-amber-50 text-amber-900 font-bold text-xs shrink-0">
                                                            {baseUnitSymbol}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary Card Total Stok */}
                                    <div className="p-3 bg-teal-500/10 rounded-lg border border-teal-200/80 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-bold text-teal-950 uppercase tracking-tight">
                                                    Total Stok Terhitung
                                                </p>
                                                <p className="text-[10px] text-teal-700">
                                                    Nyata: <b>{form.real_stock || 0}</b> | Estimasi: <b>~{form.estimated_stock || 0}</b> {baseUnitSymbol}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-mono font-extrabold text-teal-950">
                                                {form.stock || 0} <span className="text-xs font-bold text-teal-800">{baseUnitSymbol}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Input Batas Minimum Stok */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Batas Minimum Stok (Sistem Peringatan dalam {baseUnitSymbol})
                                        </label>
                                        <input
                                            type="number"
                                            name="min_stock"
                                            value={form.min_stock}
                                            onChange={onChange}
                                            min="0"
                                            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                                            placeholder="5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
