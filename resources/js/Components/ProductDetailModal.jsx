import React, { memo, useState, useEffect } from "react";
import {
    X,
    Shirt,
    Layers,
    Package,
    Edit2,
    Calendar,
    Tag,
    DollarSign,
    CheckCircle2,
    XCircle,
    Info,
    Ruler,
    Image as ImageIcon,
    Star,
    ChevronLeft,
    ChevronRight,
    Scissors
} from "lucide-react";

const ProductDetailModal = memo(function ProductDetailModal({
    isOpen,
    product,
    canEdit = false,
    onClose,
    onEdit,
}) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        if (isOpen && product) {
            // Pick primary image or index 0
            const images = product.images || [];
            const primaryIdx = images.findIndex((img) => img.is_primary);
            setSelectedImageIndex(primaryIdx >= 0 ? primaryIdx : 0);
        }
    }, [isOpen, product]);

    const [activeTab, setActiveTab] = useState('recipe');
    
    if (!isOpen || !product) return null;

    const materials = product.materials || [];
    const images = product.images || [];
    const sizes = product.sizes || [];

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const currentImage = images[selectedImageIndex] || null;

    // Group materials for display
    const calculateMaterialCost = (mats) => {
        return mats.reduce((sum, m) => sum + (Number(m.required_qty || 0) * Number(m.item?.price || 0)), 0);
    };

    const globalMaterials = materials.filter((m) => !m.size_id);
    const globalMaterialCost = calculateMaterialCost(globalMaterials);

    const distinctSizesWithMaterials = sizes.length > 0
        ? sizes.map((s) => {
              const sizeMaterials = materials.filter((m) => m.size_id === s.size_id);
              const sizeMaterialCost = calculateMaterialCost(sizeMaterials);
              return {
                  size_name: s.size?.size_name || `Ukuran ${s.size_id}`,
                  price: s.price,
                  materials: sizeMaterials,
                  total_material_cost: sizeMaterialCost + globalMaterialCost
              };
          })
        : [];

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-7xl w-full p-4 sm:p-5 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 duration-150 my-auto max-h-[95vh] flex flex-col">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-200/60 shadow-2xs">
                            <Shirt className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                                    {product.name}
                                </h3>
                                <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold border border-slate-200">
                                    {product.code}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                Kategori: <strong className="text-slate-700">{product.category || "Umum"}</strong>
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

                {/* Content Area - 2 Columns */}
                <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-1">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        
                        {/* LEFT COLUMN: Info, Images, Sizes */}
                        <div className="lg:col-span-5 flex flex-col gap-4">
                            {/* Multi-Photo Gallery Showcase */}
                            {images.length > 0 ? (
                                <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                                    <div className="relative rounded-lg overflow-hidden bg-slate-900 max-h-72 flex items-center justify-center">
                                        {currentImage && (
                                            <img
                                                src={currentImage.image_url}
                                                alt={product.name}
                                                className="max-h-72 w-auto object-contain"
                                            />
                                        )}

                                        {/* Prev / Next controls */}
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/90 transition-colors cursor-pointer"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/90 transition-colors cursor-pointer"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Thumbnails list */}
                                    {images.length > 1 && (
                                        <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
                                            {images.map((img, idx) => (
                                                <button
                                                    key={img.id || idx}
                                                    type="button"
                                                    onClick={() => setSelectedImageIndex(idx)}
                                                    className={`w-16 h-16 rounded-md overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                                                        selectedImageIndex === idx
                                                            ? "border-teal-600 ring-2 ring-teal-500/30 scale-105"
                                                            : "border-slate-200 opacity-70 hover:opacity-100"
                                                    }`}
                                                >
                                                    <img
                                                        src={img.image_url}
                                                        alt={`Thumbnail ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col items-center justify-center h-56 text-slate-400">
                                    <Shirt className="w-12 h-12 mb-3 opacity-20 text-slate-500" />
                                    <span className="text-sm font-bold text-slate-500">Tidak ada foto</span>
                                    <span className="text-xs text-slate-400 mt-1">Produk ini belum memiliki foto</span>
                                </div>
                            )}

                            {/* Main Information Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                                    <span className="text-[11px] font-semibold text-slate-500 block">Satuan Standar</span>
                                    <span className="text-sm font-bold text-slate-800">{product.default_unit || "Stel"}</span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                                    <span className="text-[11px] font-semibold text-slate-500 block">Harga Dasar</span>
                                    <span className="text-sm font-bold text-teal-700 font-mono">{formatCurrency(product.base_price)}</span>
                                </div>

                                <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 space-y-1">
                                    <span className="text-[11px] font-semibold text-rose-600 block">Min. Biaya Bahan</span>
                                    <span className="text-sm font-bold text-rose-700 font-mono">
                                        {formatCurrency(
                                            distinctSizesWithMaterials.length > 0 
                                            ? Math.min(...distinctSizesWithMaterials.map(s => s.total_material_cost))
                                            : globalMaterialCost
                                        )}
                                    </span>
                                </div>

                                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-1">
                                    <span className="text-[11px] font-semibold text-indigo-600 block">Total Upah Jahit</span>
                                    <span className="text-sm font-bold text-indigo-700 font-mono">{formatCurrency((product.production_steps || []).reduce((sum, s) => sum + Number(s.wage || 0), 0))}</span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                                    <span className="text-[11px] font-semibold text-slate-500 block">Status Katalog</span>
                                    <div className="flex items-center gap-1.5">
                                        {product.is_active ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                                                <XCircle className="w-3.5 h-3.5" />
                                                Non-Aktif
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1 text-xs">
                                    <div className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                                        <Info className="w-3.5 h-3.5 text-teal-600" />
                                        <span>Deskripsi & Spesifikasi Model:</span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed pl-5">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {/* Varian Ukuran & Harga Table */}
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Ruler className="w-4 h-4 text-teal-600" />
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Varian Ukuran & Harga Jual ({sizes.length} Varian)
                                    </h4>
                                </div>

                                {sizes.length === 0 ? (
                                    <div className="p-4 text-center bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
                                        Harga seragam untuk semua ukuran: <strong>{formatCurrency(product.base_price)}</strong> per {product.default_unit || "Stel"}.
                                    </div>
                                ) : (
                                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                                    <th className="py-2 px-3 w-10 text-center">No</th>
                                                    <th className="py-2 px-3">Ukuran</th>
                                                    <th className="py-2 px-3 text-right">Harga Jual</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {sizes.map((s, sIdx) => (
                                                    <tr key={s.id || sIdx} className="hover:bg-slate-50/60">
                                                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{sIdx + 1}</td>
                                                        <td className="py-2 px-3 font-bold text-slate-900">{s.size?.size_name || s.size_name} {s.notes ? <span className="text-slate-400 font-normal ml-1">({s.notes})</span> : ""}</td>
                                                        <td className="py-2 px-3 text-right font-bold text-teal-700 font-mono">{formatCurrency(s.price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: BOM and Production Steps */}
                        <div className="lg:col-span-7 flex flex-col h-full max-h-[600px]">
                            {/* Tabs Header */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-lg border border-slate-200/60 mb-4 shrink-0">
                                <button
                                    onClick={() => setActiveTab('recipe')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                        activeTab === 'recipe' 
                                        ? 'bg-white text-teal-700 shadow-2xs border border-slate-200/80' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                                    }`}
                                >
                                    <Layers className="w-4 h-4" />
                                    Resep Bahan Baku
                                </button>
                                <button
                                    onClick={() => setActiveTab('steps')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                        activeTab === 'steps' 
                                        ? 'bg-white text-teal-700 shadow-2xs border border-slate-200/80' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                                    }`}
                                >
                                    <Scissors className="w-4 h-4" />
                                    Langkah Produksi
                                </button>
                            </div>

                            {/* Tab Contents */}
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {activeTab === 'recipe' && (
                                    <div className="space-y-3 animate-in fade-in duration-200">
                                        {materials.length === 0 ? (
                                            <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                                                <Package className="w-7 h-7 mx-auto text-slate-300 mb-1" />
                                                <p className="font-medium text-slate-500">Belum ada resep bahan baku</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {/* Global Materials */}
                                                {globalMaterials.length > 0 && (
                                                    <details open className="group border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs transition-all hover:border-teal-200">
                                                        <summary className="bg-slate-50/80 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded bg-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-xs transition-colors">
                                                                    U
                                                                </span>
                                                                <span className="text-xs font-bold text-slate-900">Bahan Baku Umum (Semua Ukuran)</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-slate-500 font-medium bg-slate-200/50 px-1.5 py-0.5 rounded">{globalMaterials.length} Bahan</span>
                                                                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
                                                                    {formatCurrency(globalMaterialCost)}
                                                                </span>
                                                                <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </div>
                                                        </summary>
                                                        <div className="divide-y divide-slate-100">
                                                            {globalMaterials.map((mat, mIdx) => {
                                                                const matCost = Number(mat.required_qty || 0) * Number(mat.item?.price || 0);
                                                                return (
                                                                <div key={mIdx} className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs hover:bg-slate-50/50">
                                                                    <div>
                                                                        <div className="font-bold text-slate-900">{mat.item?.name}</div>
                                                                        <div className="text-[10px] text-slate-500 font-mono">{mat.item?.code} • @ {formatCurrency(mat.item?.price)}</div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-bold text-slate-700 font-mono">
                                                                            {mat.required_qty} {mat.unit_name}
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-teal-700 mt-0.5">
                                                                            = {formatCurrency(matCost)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </details>
                                                )}

                                                {/* Per Size Materials */}
                                                {distinctSizesWithMaterials.map((sz, szIdx) => (
                                                    <details key={szIdx} open className="group border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs transition-all hover:border-teal-200">
                                                        <summary className="bg-slate-50/80 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs group-open:bg-teal-700 transition-colors">
                                                                    {sz.size_name}
                                                                </span>
                                                                <span className="text-xs font-bold text-slate-900">Resep {sz.size_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-slate-500 font-medium bg-slate-200/50 px-1.5 py-0.5 rounded">{sz.materials.length} Bahan</span>
                                                                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
                                                                    {formatCurrency(sz.total_material_cost)}
                                                                </span>
                                                                <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </div>
                                                        </summary>
                                                        <div className="divide-y divide-slate-100">
                                                            {sz.materials.map((mat, mIdx) => {
                                                                const matCost = Number(mat.required_qty || 0) * Number(mat.item?.price || 0);
                                                                return (
                                                                <div key={mIdx} className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs hover:bg-slate-50/50">
                                                                    <div>
                                                                        <div className="font-bold text-slate-900">{mat.item?.name}</div>
                                                                        <div className="text-[10px] text-slate-500 font-mono">{mat.item?.code} • @ {formatCurrency(mat.item?.price)}</div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-bold text-slate-700 font-mono">
                                                                            {mat.required_qty} {mat.unit_name}
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-teal-700 mt-0.5">
                                                                            = {formatCurrency(matCost)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </details>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'steps' && (
                                    <div className="space-y-3 animate-in fade-in duration-200">
                                        {(!product.production_steps || product.production_steps.length === 0) ? (
                                            <div className="p-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                                                Belum ada langkah produksi.
                                            </div>
                                        ) : (
                                            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs bg-white">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                                            <th className="py-2.5 px-3 w-12 text-center">Urutan</th>
                                                            <th className="py-2.5 px-3">Pekerjaan</th>
                                                            <th className="py-2.5 px-3 w-32 text-right">Upah (Rp)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {product.production_steps.map((step, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50/60">
                                                                <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                                                                <td className="py-2.5 px-3 font-bold text-slate-800">{step.production_step?.name}</td>
                                                                <td className="py-2.5 px-3 text-right font-bold text-teal-700 font-mono">{formatCurrency(step.wage)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
                    <span className="text-[11px] text-slate-400">
                        Didaftarkan pada {formatDate(product.created_at)}
                    </span>
                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onEdit(product);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit Produk & BOM</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
});

export default ProductDetailModal;
