import React, { memo, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
    Shirt,
    X,
    RefreshCw,
    Plus,
    Trash2,
    Package,
    Tag,
    DollarSign,
    Layers,
    Image as ImageIcon,
    UploadCloud,
    Star,
    Check,
    Ruler,
    SlidersHorizontal,
    Info,
    Copy,
    Sparkles,
    ArrowRight,
} from "lucide-react";

const adultPreset = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
const numberPreset = ["No. 1", "No. 2", "No. 3", "No. 4", "No. 5", "No. 6", "No. 7", "No. 8", "No. 9", "No. 10", "No. 11", "No. 12"];

const ProductModal = memo(function ProductModal({
    isOpen,
    isEditing,
    form,
    submitting,
    onClose,
    onChange,
    onSizesChange,
    onMaterialsChange,
    onImagesChange,
    onSubmit,
}) {
    const [activeTab, setActiveTab] = useState("info"); // 'info' | 'sizes' | 'bom'
    const [isAutoCode, setIsAutoCode] = useState(!isEditing);
    const [fetchingCode, setFetchingCode] = useState(false);
    const [rawItems, setRawItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [productCategories, setProductCategories] = useState([]);
    const fileInputRef = useRef(null);

    // Quick add material to all sizes state
    const [quickItemSelect, setQuickItemSelect] = useState("");
    const [quickQty, setQuickQty] = useState(1);
    const [quickUnit, setQuickUnit] = useState("Meter");
    const [quickNotes, setQuickNotes] = useState("");
    const [showQuickAddAll, setShowQuickAddAll] = useState(false);

    const fetchNextCode = useCallback(async () => {
        setFetchingCode(true);
        try {
            const res = await axios.get("/api/products/next-code");
            if (res.data?.code) {
                onChange({ target: { name: "code", value: res.data.code } });
            }
        } catch {
            onChange({ target: { name: "code", value: "PRD-001" } });
        } finally {
            setFetchingCode(false);
        }
    }, [onChange]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get("/api/product-categories?status=active");
            if (res.data?.data) {
                setProductCategories(res.data.data.map((c) => c.name));
            }
        } catch {
            setProductCategories([]);
        }
    }, []);

    const fetchRawItems = useCallback(async () => {
        setLoadingItems(true);
        try {
            const res = await axios.get("/api/items?status=active");
            setRawItems(res.data?.data || []);
        } catch {
            setRawItems([]);
        } finally {
            setLoadingItems(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setActiveTab("info");
            fetchCategories();
            fetchRawItems();
            if (!isEditing) {
                setIsAutoCode(true);
                if (!form.code) {
                    fetchNextCode();
                }
            } else {
                setIsAutoCode(false);
            }
        }
    }, [isOpen, isEditing]);

    // IMAGE UPLOAD HANDLERS
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            is_new: true,
        }));

        const existingNew = form.new_images || [];
        onImagesChange({
            ...form,
            new_images: [...existingNew, ...newImages],
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveExistingImage = (imageId) => {
        const deletedIds = form.deleted_image_ids || [];
        const updatedExisting = (form.existing_images || []).filter((img) => img.id !== imageId);
        
        onImagesChange({
            ...form,
            existing_images: updatedExisting,
            deleted_image_ids: [...deletedIds, imageId],
        });
    };

    const handleRemoveNewImage = (index) => {
        const updatedNew = (form.new_images || []).filter((_, idx) => idx !== index);
        onImagesChange({
            ...form,
            new_images: updatedNew,
        });
    };

    const handleSetPrimaryExisting = (imageId) => {
        onImagesChange({
            ...form,
            primary_image_id: imageId,
            primary_image_index: null,
        });
    };

    const handleSetPrimaryNew = (index) => {
        onImagesChange({
            ...form,
            primary_image_index: index,
            primary_image_id: null,
        });
    };

    // SIZE VARIANT HANDLERS
    const handleAddSizeRow = (sizeName = "", price = "") => {
        const currentSizes = form.sizes || [];
        const basePrice = form.base_price || 0;
        onSizesChange([
            ...currentSizes,
            {
                size_name: sizeName,
                price: price !== "" ? price : basePrice,
                notes: "",
            },
        ]);
    };

    const handleApplyPresetSizes = (presetList) => {
        const currentSizes = form.sizes || [];
        const currentNames = new Set(currentSizes.map((s) => s.size_name));
        const basePrice = form.base_price || 0;

        const toAdd = presetList
            .filter((name) => !currentNames.has(name))
            .map((name) => ({
                size_name: name,
                price: basePrice,
                notes: "",
            }));

        onSizesChange([...currentSizes, ...toAdd]);
    };

    const handleApplyBasePriceToAllSizes = () => {
        const basePrice = form.base_price || 0;
        const updated = (form.sizes || []).map((s) => ({
            ...s,
            price: basePrice,
        }));
        onSizesChange(updated);
    };

    const handleSizeFieldChange = (index, field, value) => {
        const updated = [...(form.sizes || [])];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        onSizesChange(updated);
    };

    const handleRemoveSizeRow = (index) => {
        const targetSizeName = form.sizes?.[index]?.size_name;
        const updatedSizes = (form.sizes || []).filter((_, idx) => idx !== index);
        onSizesChange(updatedSizes);

        // Also clean up materials assigned to this size if user deleted the size
        if (targetSizeName) {
            const updatedMaterials = (form.materials || []).filter((m) => m.size_name !== targetSizeName);
            onMaterialsChange(updatedMaterials);
        }
    };

    // BOM MATERIAL HANDLERS (SIZE-BASED CARDS)
    const handleAddMaterialToSize = (sizeName) => {
        const defaultItem = rawItems[0];
        const newRow = {
            item_id: defaultItem ? defaultItem.id : "",
            size_name: sizeName || "ALL",
            required_qty: 1,
            unit_name: defaultItem?.unit?.name || "Meter",
            notes: "",
        };
        onMaterialsChange([...(form.materials || []), newRow]);
    };

    const handleRemoveMaterialRow = (originalIndex) => {
        const updated = (form.materials || []).filter((_, idx) => idx !== originalIndex);
        onMaterialsChange(updated);
    };

    const handleMaterialFieldChange = (originalIndex, field, value) => {
        const updated = [...(form.materials || [])];
        updated[originalIndex] = {
            ...updated[originalIndex],
            [field]: value,
        };

        if (field === "item_id") {
            const selectedItem = rawItems.find((i) => String(i.id) === String(value));
            if (selectedItem?.unit?.name) {
                updated[originalIndex].unit_name = selectedItem.unit.name;
            }
        }

        onMaterialsChange(updated);
    };

    // Apply this specific material row to ALL defined sizes
    const handleApplyMaterialToAllSizes = (materialIndex) => {
        const mat = form.materials?.[materialIndex];
        if (!mat || !mat.item_id) return;

        const definedSizes = (form.sizes || []).map((s) => s.size_name).filter(Boolean);
        const targetSizes = definedSizes.length > 0 ? definedSizes : ["ALL"];
        const currentMaterials = [...(form.materials || [])];

        // Remove existing instances of this item_id in other sizes to prevent duplicates
        const filtered = currentMaterials.filter(
            (m) => String(m.item_id) !== String(mat.item_id) || !targetSizes.includes(m.size_name)
        );

        // Add this material for every defined size
        const newRows = targetSizes.map((sz) => ({
            item_id: mat.item_id,
            size_name: sz,
            required_qty: mat.required_qty,
            unit_name: mat.unit_name,
            notes: mat.notes || "",
        }));

        onMaterialsChange([...filtered, ...newRows]);
    };

    // Copy all materials from a source size card to a target size card
    const handleCopyMaterialsBetweenSizes = (sourceSize, targetSize) => {
        if (!sourceSize || !targetSize || sourceSize === targetSize) return;

        const currentMaterials = [...(form.materials || [])];
        const sourceMaterials = currentMaterials.filter((m) => (m.size_name || "ALL") === sourceSize);
        if (sourceMaterials.length === 0) return;

        // Keep all materials except the target size's current materials
        const keptMaterials = currentMaterials.filter((m) => (m.size_name || "ALL") !== targetSize);

        const newTargetMaterials = sourceMaterials.map((m) => ({
            ...m,
            size_name: targetSize,
        }));

        onMaterialsChange([...keptMaterials, ...newTargetMaterials]);
    };

    // Quick Add 1 Material to ALL sizes simultaneously
    const handleQuickAddMaterialToAll = () => {
        if (!quickItemSelect) return;
        const definedSizes = (form.sizes || []).map((s) => s.size_name).filter(Boolean);
        const targetSizes = definedSizes.length > 0 ? definedSizes : ["ALL"];
        const currentMaterials = [...(form.materials || [])];

        const newRows = targetSizes.map((sz) => ({
            item_id: quickItemSelect,
            size_name: sz,
            required_qty: Number(quickQty) || 1,
            unit_name: quickUnit || "Meter",
            notes: quickNotes || "",
        }));

        onMaterialsChange([...currentMaterials, ...newRows]);
        setQuickItemSelect("");
        setQuickQty(1);
        setQuickNotes("");
        setShowQuickAddAll(false);
    };

    if (!isOpen) return null;

    const defaultCategories = [
        "Seragam Olahraga",
        "Seragam Batik Sekolah",
        "Kemeja PDH / PDL",
        "Jas Almamater",
        "Kaos & Polo Shirt",
        "Busana Muslim & Gamis",
        "Celana & Rok Seragam",
    ];

    const categories = productCategories.length > 0 ? productCategories : defaultCategories;
    const units = ["Stel", "Pcs", "Lusin", "Kodi", "Set", "Meter", "Paket"];
    const existingImages = form.existing_images || [];
    const newImages = form.new_images || [];
    const definedSizes = form.sizes || [];
    const definedSizeNames = definedSizes.map((s) => s.size_name).filter(Boolean);

    // Group materials by size_name for the Card layout
    const materialsWithOriginalIndex = (form.materials || []).map((m, idx) => ({ ...m, _origIndex: idx }));
    const universalMaterials = materialsWithOriginalIndex.filter((m) => !m.size_name || m.size_name === "ALL");

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full p-4 sm:p-5 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-200/60 shadow-2xs">
                            <Shirt className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                {isEditing ? "Edit Data & Spesifikasi Produk" : "Tambah Produk Jadi Baru"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Kelola spesifikasi model, galeri multi-foto, varian harga per ukuran, dan resep bahan (BOM).
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg border border-slate-200/70 text-xs font-semibold shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab("info")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all cursor-pointer ${
                            activeTab === "info"
                                ? "bg-white text-teal-900 shadow-xs font-bold border border-slate-200/60"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Shirt className="w-4 h-4 text-teal-600" />
                        <span>1. Info & Foto Produk</span>
                        {(existingImages.length + newImages.length) > 0 && (
                            <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded-full">
                                {existingImages.length + newImages.length} foto
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("sizes")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all cursor-pointer ${
                            activeTab === "sizes"
                                ? "bg-white text-teal-900 shadow-xs font-bold border border-slate-200/60"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Ruler className="w-4 h-4 text-teal-600" />
                        <span>2. Varian Ukuran & Harga</span>
                        {(form.sizes?.length || 0) > 0 && (
                            <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded-full">
                                {form.sizes.length} ukuran
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("bom")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all cursor-pointer ${
                            activeTab === "bom"
                                ? "bg-white text-teal-900 shadow-xs font-bold border border-slate-200/60"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Layers className="w-4 h-4 text-teal-600" />
                        <span>3. Resep Bahan (BOM)</span>
                        {(form.materials?.length || 0) > 0 && (
                            <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded-full">
                                {form.materials.length} resep
                            </span>
                        )}
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={onSubmit} className="flex-1 space-y-4">
                    
                    {/* TAB 1: INFORMASI UMUM & MULTI-FOTO */}
                    {activeTab === "info" && (
                        <div className="space-y-4 animate-in fade-in duration-150">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Kode Produk */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Kode Produk <span className="text-rose-500">*</span>
                                        </label>
                                        {!isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const next = !isAutoCode;
                                                    setIsAutoCode(next);
                                                    if (next) fetchNextCode();
                                                }}
                                                className="text-[11px] text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
                                            >
                                                {isAutoCode ? "Manual" : "Otomatis"}
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="code"
                                            value={form.code || ""}
                                            onChange={onChange}
                                            disabled={isAutoCode}
                                            placeholder="Contoh: PRD-001"
                                            className={`w-full px-3 py-2 text-xs border rounded-md font-mono font-semibold ${
                                                isAutoCode
                                                    ? "bg-slate-100 text-slate-500 border-slate-200"
                                                    : "bg-white text-slate-800 border-slate-300 focus:border-teal-500"
                                            }`}
                                            required
                                        />
                                        {fetchingCode && (
                                            <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin absolute right-2.5 top-2.5" />
                                        )}
                                    </div>
                                </div>

                                {/* Nama Produk */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Nama Model Produk <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name || ""}
                                        onChange={onChange}
                                        placeholder="Contoh: Baju Olahraga SD Lengan Pendek"
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-teal-500 font-semibold"
                                        required
                                    />
                                </div>

                                {/* Kategori */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Kategori Produk <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={form.category || ""}
                                        onChange={onChange}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-teal-500 bg-white"
                                        required
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Satuan & Harga Dasar */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Satuan <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            name="default_unit"
                                            value={form.default_unit || "Stel"}
                                            onChange={onChange}
                                            className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-md focus:border-teal-500 bg-white"
                                            required
                                        >
                                            {units.map((u) => (
                                                <option key={u} value={u}>
                                                    {u}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Harga Dasar (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            name="base_price"
                                            value={form.base_price || ""}
                                            onChange={onChange}
                                            placeholder="75.000"
                                            className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-md focus:border-teal-500 font-mono text-right font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Keterangan & Spesifikasi Model
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description || ""}
                                        onChange={onChange}
                                        rows="2"
                                        placeholder="Contoh: Kerah wangki kombinasi, celana panjang kolor karet, saku kanan-kiri"
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:border-teal-500 bg-white resize-none"
                                    />
                                </div>
                            </div>

                            {/* MULTI-PHOTO GALLERY SECTION */}
                            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4.5 h-4.5 text-teal-600" />
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800">
                                                Galeri Foto Produk (Bisa Beberapa Foto)
                                            </h4>
                                            <p className="text-[11px] text-slate-500">
                                                Upload foto tampak depan, belakang, detail jahitan, atau contoh kain. Pilih foto utama untuk thumbnail.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer"
                                    >
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        <span>+ Upload Foto</span>
                                    </button>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {/* Gallery Grid */}
                                {(existingImages.length === 0 && newImages.length === 0) ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-lg p-6 text-center bg-white cursor-pointer transition-all hover:bg-teal-50/30 group"
                                    >
                                        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-teal-600 mx-auto mb-1.5 transition-colors" />
                                        <p className="text-xs font-bold text-slate-700 group-hover:text-teal-900">
                                            Klik untuk memilih foto produk
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Format JPG, PNG, WEBP (Bisa pilih beberapa foto sekaligus)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {/* Existing Images */}
                                        {existingImages.map((img) => {
                                            const isPrimary = (form.primary_image_id ? form.primary_image_id === img.id : Boolean(img.is_primary));
                                            return (
                                                <div
                                                    key={img.id}
                                                    className={`relative rounded-lg overflow-hidden border bg-white shadow-2xs group transition-all ${
                                                        isPrimary
                                                            ? "border-teal-500 ring-2 ring-teal-500/30"
                                                            : "border-slate-200 hover:border-slate-300"
                                                    }`}
                                                >
                                                    <img
                                                        src={img.image_url}
                                                        alt="Foto Produk"
                                                        className="w-full h-28 object-cover"
                                                    />
                                                    
                                                    {isPrimary && (
                                                        <div className="absolute top-1.5 left-1.5 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                                                            <Star className="w-2.5 h-2.5 fill-current" />
                                                            <span>Utama</span>
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                                        {!isPrimary && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetPrimaryExisting(img.id)}
                                                                title="Jadikan Foto Utama"
                                                                className="p-1.5 rounded bg-white text-teal-700 hover:bg-teal-50 transition-colors text-[10px] font-bold inline-flex items-center gap-1"
                                                            >
                                                                <Star className="w-3 h-3" />
                                                                <span>Utama</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveExistingImage(img.id)}
                                                            title="Hapus Foto"
                                                            className="p-1.5 rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* New Images */}
                                        {newImages.map((img, idx) => {
                                            const isPrimary = (form.primary_image_index === idx) || (existingImages.length === 0 && form.primary_image_index === null && idx === 0);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`relative rounded-lg overflow-hidden border bg-white shadow-2xs group transition-all ${
                                                        isPrimary
                                                            ? "border-teal-500 ring-2 ring-teal-500/30"
                                                            : "border-slate-200 hover:border-slate-300"
                                                    }`}
                                                >
                                                    <img
                                                        src={img.preview}
                                                        alt="Foto Baru"
                                                        className="w-full h-28 object-cover"
                                                    />

                                                    <div className="absolute top-1.5 right-1.5 bg-sky-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-2xs">
                                                        Baru
                                                    </div>

                                                    {isPrimary && (
                                                        <div className="absolute top-1.5 left-1.5 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                                                            <Star className="w-2.5 h-2.5 fill-current" />
                                                            <span>Utama</span>
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                                        {!isPrimary && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetPrimaryNew(idx)}
                                                                title="Jadikan Foto Utama"
                                                                className="p-1.5 rounded bg-white text-teal-700 hover:bg-teal-50 transition-colors text-[10px] font-bold inline-flex items-center gap-1"
                                                            >
                                                                <Star className="w-3 h-3" />
                                                                <span>Utama</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveNewImage(idx)}
                                                            title="Batal Upload"
                                                            className="p-1.5 rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: VARIAN UKURAN & HARGA PER UKURAN */}
                    {activeTab === "sizes" && (
                        <div className="space-y-4 animate-in fade-in duration-150">
                            {/* Preset Buttons & Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-teal-50/70 rounded-xl border border-teal-200/80">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold text-teal-950">
                                        Preset Varian Ukuran Cepat
                                    </h4>
                                    <p className="text-[11px] text-teal-700">
                                        Tambahkan ukuran secara otomatis atau buat ukuran kustom.
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => handleApplyPresetSizes(adultPreset)}
                                        className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 rounded shadow-2xs transition-colors cursor-pointer"
                                    >
                                        + Standar (S - 5XL)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyPresetSizes(numberPreset)}
                                        className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 rounded shadow-2xs transition-colors cursor-pointer"
                                    >
                                        + Nomor (No. 1 - 12)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddSizeRow("", "")}
                                        className="px-2.5 py-1 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded shadow-2xs transition-colors cursor-pointer"
                                    >
                                        + Ukuran Kustom
                                    </button>
                                </div>
                            </div>

                            {/* Size Table */}
                            {(!form.sizes || form.sizes.length === 0) ? (
                                <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                                    <Ruler className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                                    <p className="text-xs font-bold text-slate-700">Belum ada varian ukuran yang ditambahkan.</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Pilih salah satu tombol preset di atas atau tambah ukuran kustom.
                                    </p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700">
                                            Daftar Varian Ukuran & Harga Jual ({form.sizes.length} Varian)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleApplyBasePriceToAllSizes}
                                            className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                                        >
                                            Samakan Semua ke Harga Dasar (Rp {Number(form.base_price || 0).toLocaleString("id-ID")})
                                        </button>
                                    </div>

                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                                <th className="py-2 px-3 w-10 text-center">#</th>
                                                <th className="py-2 px-3 w-32">Ukuran <span className="text-rose-500">*</span></th>
                                                <th className="py-2 px-3 w-44">Harga Jual (Rp) <span className="text-rose-500">*</span></th>
                                                <th className="py-2 px-3">Catatan / Detail Spesifikasi</th>
                                                <th className="py-2 px-3 w-12 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {form.sizes.map((sz, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="text"
                                                            value={sz.size_name || ""}
                                                            onChange={(e) => handleSizeFieldChange(idx, "size_name", e.target.value)}
                                                            required
                                                            placeholder="S / M / No. 1"
                                                            className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded focus:border-teal-500 focus:outline-hidden bg-white"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <div className="relative">
                                                            <span className="absolute left-2.5 top-1.5 text-[11px] text-slate-400 font-semibold">Rp</span>
                                                            <input
                                                                type="number"
                                                                value={sz.price ?? ""}
                                                                onChange={(e) => handleSizeFieldChange(idx, "price", parseFloat(e.target.value) || 0)}
                                                                min="0"
                                                                step="100"
                                                                required
                                                                placeholder="0"
                                                                className="w-full pl-7 pr-2.5 py-1.5 text-xs font-bold font-mono border border-slate-200 rounded focus:border-teal-500 focus:outline-hidden bg-white text-slate-900 text-right"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="text"
                                                            value={sz.notes || ""}
                                                            onChange={(e) => handleSizeFieldChange(idx, "notes", e.target.value)}
                                                            placeholder="Contoh: Lingkar Dada 100cm, Panjang 70cm"
                                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 focus:outline-hidden bg-white"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSizeRow(idx)}
                                                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                                            title="Hapus ukuran ini"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: RESEP KEBUTUHAN BAHAN BAKU (BOM) DIBUAT PER CARD UKURAN */}
                    {activeTab === "bom" && (
                        <div className="space-y-4 animate-in fade-in duration-150">
                            
                            {/* BOM Global Header & Tools */}
                            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-teal-600" />
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800">
                                                Resep Kebutuhan Bahan Baku (Bill of Materials) Per Ukuran
                                            </h4>
                                            <p className="text-[11px] text-slate-500">
                                                Atur kebutuhan bahan gudang untuk masing-masing ukuran (Card). Anda bisa menerapkan bahan ke semua ukuran sekaligus dengan satu klik.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowQuickAddAll((prev) => !prev)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded-md transition-colors cursor-pointer shadow-2xs"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                                            <span>+ Tambah 1 Bahan ke SEMUA Ukuran</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Add to All Sizes Toolbar Form */}
                                {showQuickAddAll && (
                                    <div className="p-3 bg-white rounded-lg border border-teal-300 ring-2 ring-teal-500/20 space-y-2 animate-in fade-in duration-150">
                                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                                            <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                                                <Layers className="w-3.5 h-3.5 text-teal-600" />
                                                <span>Pilih Bahan Baku yang Sama untuk Diterapkan ke Semua Ukuran:</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setShowQuickAddAll(false)}
                                                className="text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                                            <div className="sm:col-span-5">
                                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Bahan Baku Gudang</label>
                                                <select
                                                    value={quickItemSelect}
                                                    onChange={(e) => {
                                                        const itmId = e.target.value;
                                                        setQuickItemSelect(itmId);
                                                        const found = rawItems.find((i) => String(i.id) === String(itmId));
                                                        if (found?.unit?.name) setQuickUnit(found.unit.name);
                                                    }}
                                                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:border-teal-500 bg-white"
                                                >
                                                    <option value="">-- Pilih Bahan --</option>
                                                    {rawItems.map((item) => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.name} ({item.code}) - Stok: {item.real_stock ?? 0} {item.unit?.name || ""}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Kebutuhan</label>
                                                <input
                                                    type="number"
                                                    min="0.001"
                                                    step="0.001"
                                                    value={quickQty}
                                                    onChange={(e) => setQuickQty(parseFloat(e.target.value) || 1)}
                                                    className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:border-teal-500"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Satuan</label>
                                                <input
                                                    type="text"
                                                    value={quickUnit}
                                                    onChange={(e) => setQuickUnit(e.target.value)}
                                                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:border-teal-500 bg-slate-50"
                                                />
                                            </div>
                                            <div className="sm:col-span-3 flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={handleQuickAddMaterialToAll}
                                                    disabled={!quickItemSelect}
                                                    className="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded text-xs shadow-2xs transition-colors cursor-pointer"
                                                >
                                                    Terapkan ke Semua Ukuran
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RENDER SIZE CARDS */}
                            {definedSizes.length === 0 ? (
                                /* IF NO SIZES DEFINED IN TAB 2: SHOW SINGLE STANDARD CARD */
                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                                            <h4 className="text-xs font-bold text-slate-900">
                                                Card Resep Standar (Semua Ukuran)
                                            </h4>
                                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                                                {universalMaterials.length} Bahan
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAddMaterialToSize("ALL")}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-2xs transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>+ Tambah Bahan</span>
                                        </button>
                                    </div>

                                    {universalMaterials.length === 0 ? (
                                        <div className="p-6 text-center text-xs text-slate-400">
                                            <Package className="w-7 h-7 mx-auto text-slate-300 mb-1" />
                                            <p className="font-semibold text-slate-600">Belum ada bahan baku di resep standar.</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                Klik tombol "+ Tambah Bahan" di atas untuk menambahkan kain atau benang.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 space-y-2.5">
                                            {universalMaterials.map((mat) => {
                                                const originalIndex = mat._origIndex;
                                                const selectedItem = rawItems.find((i) => String(i.id) === String(mat.item_id));
                                                return (
                                                    <div
                                                        key={originalIndex}
                                                        className="grid grid-cols-12 gap-2 items-center bg-slate-50/70 p-2.5 rounded-lg border border-slate-200"
                                                    >
                                                        <div className="col-span-12 sm:col-span-5">
                                                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Bahan Baku Gudang</label>
                                                            <select
                                                                value={mat.item_id || ""}
                                                                onChange={(e) => handleMaterialFieldChange(originalIndex, "item_id", e.target.value)}
                                                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white"
                                                            >
                                                                <option value="">-- Pilih Bahan Baku --</option>
                                                                {rawItems.map((item) => (
                                                                    <option key={item.id} value={item.id}>
                                                                        {item.name} ({item.code}) - Stok: {item.real_stock ?? 0} {item.unit?.name || ""}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="col-span-4 sm:col-span-2">
                                                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Kebutuhan</label>
                                                            <input
                                                                type="number"
                                                                value={mat.required_qty ?? 1}
                                                                onChange={(e) => handleMaterialFieldChange(originalIndex, "required_qty", parseFloat(e.target.value) || 0)}
                                                                min="0.001"
                                                                step="0.001"
                                                                className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded focus:border-teal-500 bg-white"
                                                            />
                                                        </div>
                                                        <div className="col-span-4 sm:col-span-2">
                                                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Satuan</label>
                                                            <input
                                                                type="text"
                                                                value={mat.unit_name || (selectedItem?.unit?.name || "Meter")}
                                                                onChange={(e) => handleMaterialFieldChange(originalIndex, "unit_name", e.target.value)}
                                                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-slate-100"
                                                            />
                                                        </div>
                                                        <div className="col-span-3 sm:col-span-2">
                                                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Catatan</label>
                                                            <input
                                                                type="text"
                                                                value={mat.notes || ""}
                                                                onChange={(e) => handleMaterialFieldChange(originalIndex, "notes", e.target.value)}
                                                                placeholder="Komponen"
                                                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 flex items-center justify-center pt-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveMaterialRow(originalIndex)}
                                                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                                                title="Hapus bahan"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* IF SIZES ARE DEFINED: RENDER A DEDICATED CARD FOR EACH SIZE */
                                <div className="space-y-3.5">
                                    {definedSizes.map((sz, szIdx) => {
                                        const sizeName = sz.size_name;
                                        const sizeMaterials = materialsWithOriginalIndex.filter((m) => m.size_name === sizeName);
                                        const otherSizes = definedSizeNames.filter((s) => s !== sizeName);

                                        return (
                                            <div
                                                key={szIdx}
                                                className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white transition-all hover:border-teal-400"
                                            >
                                                {/* Card Header per Size */}
                                                <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-md bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                                                            {sizeName}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-slate-900">
                                                                    Resep Bahan Ukuran {sizeName}
                                                                </span>
                                                                {sz.price > 0 && (
                                                                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded font-mono">
                                                                        Rp {Number(sz.price).toLocaleString("id-ID")}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-slate-500 font-medium">
                                                                {sizeMaterials.length} jenis bahan terdaftar
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {/* Copy from another size dropdown */}
                                                        {otherSizes.length > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <select
                                                                    defaultValue=""
                                                                    onChange={(e) => {
                                                                        if (e.target.value) {
                                                                            handleCopyMaterialsBetweenSizes(e.target.value, sizeName);
                                                                            e.target.value = "";
                                                                        }
                                                                    }}
                                                                    className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-300 rounded px-2 py-1 cursor-pointer hover:border-teal-500"
                                                                >
                                                                    <option value="" disabled>Salin dari Size...</option>
                                                                    {otherSizes.map((os) => (
                                                                        <option key={os} value={os}>
                                                                            Salin dari Ukuran {os}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddMaterialToSize(sizeName)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-2xs transition-colors cursor-pointer"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                            <span>+ Tambah Bahan</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Card Materials List */}
                                                {sizeMaterials.length === 0 ? (
                                                    <div className="p-5 text-center text-xs text-slate-400 bg-slate-50/30">
                                                        <p className="font-semibold text-slate-600">Belum ada bahan untuk Ukuran {sizeName}.</p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            Klik "+ Tambah Bahan" atau salin dari ukuran lain di menu atas card.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 space-y-2">
                                                        {sizeMaterials.map((mat) => {
                                                            const originalIndex = mat._origIndex;
                                                            const selectedItem = rawItems.find((i) => String(i.id) === String(mat.item_id));

                                                            return (
                                                                <div
                                                                    key={originalIndex}
                                                                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50/80 hover:bg-white p-2.5 rounded-lg border border-slate-200 transition-all"
                                                                >
                                                                    {/* Bahan Baku Gudang */}
                                                                    <div className="sm:col-span-4">
                                                                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                                                            Bahan Baku Gudang <span className="text-rose-500">*</span>
                                                                        </label>
                                                                        <select
                                                                            value={mat.item_id || ""}
                                                                            onChange={(e) => handleMaterialFieldChange(originalIndex, "item_id", e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white"
                                                                        >
                                                                            <option value="">-- Pilih Bahan Baku --</option>
                                                                            {rawItems.map((item) => (
                                                                                <option key={item.id} value={item.id}>
                                                                                    {item.name} ({item.code}) - Stok: {item.real_stock ?? 0} {item.unit?.name || ""}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        {selectedItem && (
                                                                            <span className="text-[10px] text-teal-600 font-medium block mt-0.5">
                                                                                Stok: <strong>{selectedItem.real_stock ?? 0} {selectedItem.unit?.name}</strong>
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Kebutuhan / Qty */}
                                                                    <div className="sm:col-span-2">
                                                                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                                                            Kebutuhan ({mat.unit_name || "Meter"}) <span className="text-rose-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={mat.required_qty ?? 1}
                                                                            onChange={(e) => handleMaterialFieldChange(originalIndex, "required_qty", parseFloat(e.target.value) || 0)}
                                                                            min="0.001"
                                                                            step="0.001"
                                                                            className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded focus:border-teal-500 bg-white"
                                                                        />
                                                                    </div>

                                                                    {/* Satuan & Catatan */}
                                                                    <div className="sm:col-span-2">
                                                                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                                                            Satuan
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={mat.unit_name || (selectedItem?.unit?.name || "Meter")}
                                                                            onChange={(e) => handleMaterialFieldChange(originalIndex, "unit_name", e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-slate-100"
                                                                        />
                                                                    </div>

                                                                    <div className="sm:col-span-2">
                                                                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                                                            Catatan
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={mat.notes || ""}
                                                                            onChange={(e) => handleMaterialFieldChange(originalIndex, "notes", e.target.value)}
                                                                            placeholder="Kain badan / kerah"
                                                                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white"
                                                                        />
                                                                    </div>

                                                                    {/* Quick Action: Apply to ALL sizes + Delete */}
                                                                    <div className="sm:col-span-2 flex items-center justify-end gap-1.5 pt-2 sm:pt-4">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleApplyMaterialToAllSizes(originalIndex)}
                                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded text-[10px] font-bold transition-colors cursor-pointer"
                                                                            title="Terapkan bahan ini dengan takaran ini ke SEMUA ukuran"
                                                                        >
                                                                            <Layers className="w-3 h-3 text-teal-600" />
                                                                            <span>Semua Size</span>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveMaterialRow(originalIndex)}
                                                                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                                                            title="Hapus bahan dari ukuran ini"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status Aktif */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <input
                            type="checkbox"
                            id="is_active_product"
                            name="is_active"
                            checked={form.is_active ?? true}
                            onChange={(e) => onChange({ target: { name: "is_active", value: e.target.checked } })}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="is_active_product" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                            Produk Aktif (Tersedia dan dapat dipilih saat membuat pesanan/invoice baru)
                        </label>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-md shadow-xs transition-colors cursor-pointer"
                        >
                            <Check className="w-4 h-4" />
                            <span>{submitting ? "Menyimpan Data..." : (isEditing ? "Simpan Perubahan" : "Simpan Produk Baru")}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
});

export default ProductModal;
