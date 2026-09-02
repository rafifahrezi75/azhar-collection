import React, { useState, useMemo } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { hasPermission } from "@/utils/permissions";
import {
    ArrowLeft,
    Layers,
    Package,
    Edit2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Scissors,
    CheckCircle2,
    XCircle,
} from "lucide-react";

export default function Show({ product }) {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];
    const canUpdate = useMemo(
        () => hasPermission(permissions, "produk.update"),
        [permissions],
    );
    const [selectedImageIndex, setSelectedImageIndex] = useState(() => {
        const imgs = product?.images || [];
        const idx = imgs.findIndex((i) => i.is_primary);
        return idx >= 0 ? idx : 0;
    });
    const [activeTab, setActiveTab] = useState("recipe");

    if (!product) {
        return (
            <DashboardLayout>
                <Head title="Produk Tidak Ditemukan" />
                <div className="flex items-center justify-center h-64">
                    <p className="text-sm text-slate-500 font-medium">
                        Produk tidak ditemukan
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    const materials = product.materials || [];
    const images = product.images || [];
    const sizes = product.sizes || [];

    const formatCurrency = (val) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);

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

    const formatQty = (val) => {
        if (val === "" || val == null) return "-";
        const n = parseFloat(String(val).replace(",", "."));
        if (isNaN(n)) return String(val);
        return Number(n)
            .toString()
            .replace(/\.0+$/, "")
            .replace(/(\.\d*[1-9])0+$/, "$1");
    };

    const currentImage = images[selectedImageIndex] || null;
    const productionWageMode = String(
        product.production_wage_mode || "steps",
    ).toLowerCase();
    const directProductionWage = Number(product.production_wage || 0);
    const stepProductionWage = (product.production_steps || []).reduce(
        (sum, step) => sum + Number(step.wage || 0),
        0,
    );
    const totalProductionWage =
        productionWageMode === "manual"
            ? directProductionWage
            : stepProductionWage;

    const calculateMaterialCost = (mats) =>
        mats.reduce(
            (s, m) =>
                s + Number(m.required_qty || 0) * Number(m.item?.price || 0),
            0,
        );
    const globalMaterials = materials.filter((m) => !m.size_id);
    const globalMaterialCost = calculateMaterialCost(globalMaterials);
    const distinctSizesWithMaterials =
        sizes.length > 0
            ? sizes.map((s) => {
                  const sizeMats = materials.filter(
                      (m) => m.size_id === s.size_id,
                  );
                  const sizeCost = calculateMaterialCost(sizeMats);
                  return {
                      size_name: s.size?.size_name || `Ukuran ${s.size_id}`,
                      price: s.price,
                      category: s.size?.category || "-",
                      notes: s.notes,
                      materials: sizeMats,
                      total_material_cost: sizeCost + globalMaterialCost,
                  };
              })
            : [];

    return (
        <DashboardLayout>
            <Head
                title={`${product.name} - Detail Produk - Azhar Collection`}
            />
            <div className="space-y-4 max-w-7xl mx-auto">
                {/* CARD INDUK UTAMA */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Tombol Kembali & Judul */}
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    title="Kembali"
                                    onClick={() =>
                                        router.visit("/dashboard/produk")
                                    }
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Package className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                        Detail Produk
                                    </h3>
                                    <p className="text-[11px] text-slate-500 truncate">
                                        Informasi spesifikasi produk, variasi ukuran, resep bahan baku, dan langkah produksi.
                                    </p>
                                </div>
                            </div>

                            {/* Tombol Aksi Edit */}
                            {canUpdate && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        title="Edit Produk"
                                        onClick={() =>
                                            router.visit(
                                                `/dashboard/produk/${product.id}/edit`,
                                            )
                                        }
                                        className="inline-flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                                    >
                                        <Edit2 className="w-3.5 h-3.5 text-teal-600" />
                                        <span>Edit</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KONTEN UTAMA */}
                    <div className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            {/* KOLOM KIRI: Foto, Card Info Produk, Metrik & Variasi Ukuran */}
                            <div className="lg:col-span-5 space-y-4">
                                {/* Galeri Foto Produk */}
                                {images.length > 0 ? (
                                    <div className="space-y-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                                        <div className="relative rounded-lg overflow-hidden bg-slate-900 max-h-72 flex items-center justify-center border border-slate-200">
                                            {currentImage && (
                                                <img
                                                    src={currentImage.image_url}
                                                    alt={product.name}
                                                    className="max-h-72 w-auto object-contain"
                                                />
                                            )}
                                            {images.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedImageIndex(
                                                                (p) =>
                                                                    p > 0
                                                                        ? p - 1
                                                                        : images.length - 1,
                                                            )
                                                        }
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/90 cursor-pointer shadow-md"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedImageIndex(
                                                                (p) =>
                                                                    p < images.length - 1
                                                                        ? p + 1
                                                                        : 0,
                                                            )
                                                        }
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/90 cursor-pointer shadow-md"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {images.length > 1 && (
                                            <div className="flex items-center gap-2 overflow-x-auto py-1">
                                                {images.map((img, idx) => (
                                                    <button
                                                        key={img.id || idx}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedImageIndex(idx)
                                                        }
                                                        className={`w-14 h-14 rounded-md overflow-hidden border-2 shrink-0 transition-all ${
                                                            selectedImageIndex === idx
                                                                ? "border-teal-600 ring-2 ring-teal-500/30"
                                                                : "border-slate-200 opacity-70 hover:opacity-100"
                                                        }`}
                                                    >
                                                        <img
                                                            src={img.image_url}
                                                            alt={`Thumb ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/50 rounded-lg border border-slate-200 flex flex-col items-center justify-center h-52 text-slate-400 shadow-2xs">
                                        <Package className="w-10 h-10 text-slate-300 mb-1" />
                                        <span className="text-xs font-medium text-slate-400">
                                            Tanpa Foto Produk
                                        </span>
                                    </div>
                                )}

                                {/* CARD INFO PRODUK (IDENTITAS UTAMA) */}
                                <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 shadow-2xs space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                                                    {product.name}
                                                </h1>
                                                <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold shadow-2xs">
                                                    {product.code}
                                                </span>
                                            </div>
                                            <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                                                <p>
                                                    Kategori:{" "}
                                                    <strong className="text-slate-800 font-semibold">
                                                        {product.category || "Umum"}
                                                    </strong>
                                                </p>
                                                <p>
                                                    Satuan Default:{" "}
                                                    <strong className="text-slate-800 font-semibold">
                                                        {product.default_unit || "Stel"}
                                                    </strong>
                                                </p>
                                                <p>
                                                    Harga Dasar:{" "}
                                                    <strong className="text-teal-700 font-semibold font-mono">
                                                        {formatCurrency(product.base_price)}
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>

                                        {product.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                                                <XCircle className="w-3 h-3 text-rose-500" />
                                                Non-Aktif
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Ringkasan Biaya & Upah */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                            Satuan
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                                            {product.default_unit || "Stel"}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                            Harga Dasar
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-teal-700 font-mono">
                                            {formatCurrency(product.base_price)}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200/80 shadow-2xs space-y-1">
                                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                                            Min. Biaya Bahan
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-rose-800 font-mono">
                                            {formatCurrency(
                                                distinctSizesWithMaterials.length > 0
                                                    ? Math.min(
                                                          ...distinctSizesWithMaterials.map(
                                                              (s) =>
                                                                  s.total_material_cost,
                                                          ),
                                                      )
                                                    : globalMaterialCost,
                                            )}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200/80 shadow-2xs space-y-1">
                                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                                            {productionWageMode === "manual"
                                                ? "Upah Langsung"
                                                : "Total Upah"}
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-indigo-800 font-mono">
                                            {formatCurrency(totalProductionWage)}
                                        </span>
                                    </div>
                                </div>

                                {/* Deskripsi & Spesifikasi */}
                                {product.description && (
                                    <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 space-y-1.5 shadow-2xs">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-1.5">
                                            <span>Deskripsi & Spesifikasi</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium pt-0.5">
                                            {product.description}
                                        </p>
                                    </div>
                                )}

                                {/* Tabel Variasi Ukuran */}
                                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs bg-white">
                                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Variasi Ukuran & Harga
                                    </div>
                                    {sizes.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-slate-500 font-medium">
                                            Harga seragam:{" "}
                                            <strong className="text-slate-800">
                                                {formatCurrency(product.base_price)}
                                            </strong>{" "}
                                            per {product.default_unit || "Stel"}
                                        </div>
                                    ) : (
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                                                <tr>
                                                    <th className="py-2 px-3 w-10 text-center">
                                                        No
                                                    </th>
                                                    <th className="py-2 px-3">
                                                        Ukuran
                                                    </th>
                                                    <th className="py-2 px-3">
                                                        Kategori
                                                    </th>
                                                    <th className="py-2 px-3 text-right">
                                                        Harga
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                                {sizes.map((s, i) => (
                                                    <tr
                                                        key={s.id || i}
                                                        className="hover:bg-slate-50/80 transition-colors"
                                                    >
                                                        <td className="py-2 px-3 text-center text-slate-400 font-mono">
                                                            {i + 1}
                                                        </td>
                                                        <td className="py-2 px-3 font-bold text-slate-900">
                                                            {s.size?.size_name ||
                                                                s.size_name}
                                                        </td>
                                                        <td className="py-2 px-3 text-xs text-slate-500">
                                                            {s.size?.category || "-"}
                                                        </td>
                                                        <td className="py-2 px-3 text-right font-bold text-teal-700 font-mono">
                                                            {formatCurrency(s.price)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* KOLOM KANAN: Tab Navigasi, Resep Bahan & Langkah Produksi */}
                            <div className="lg:col-span-7 space-y-4">
                                {/* TAB NAVIGATION */}
                                <div className="flex items-center gap-2 h-9 border-b border-slate-200/80">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("recipe")}
                                        className={`inline-flex items-center gap-1.5 h-full px-3 text-xs font-semibold rounded-t-md transition-all cursor-pointer border-b-2 -mb-px ${
                                            activeTab === "recipe"
                                                ? "border-teal-600 text-teal-700 bg-teal-50/80 font-bold"
                                                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <Layers
                                            className={`w-3.5 h-3.5 ${
                                                activeTab === "recipe"
                                                    ? "text-teal-600"
                                                    : "text-slate-400"
                                            }`}
                                        />
                                        <span>Resep Bahan Baku</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("steps")}
                                        className={`inline-flex items-center gap-1.5 h-full px-3 text-xs font-semibold rounded-t-md transition-all cursor-pointer border-b-2 -mb-px ${
                                            activeTab === "steps"
                                                ? "border-teal-600 text-teal-700 bg-teal-50/80 font-bold"
                                                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <Scissors
                                            className={`w-3.5 h-3.5 ${
                                                activeTab === "steps"
                                                    ? "text-teal-600"
                                                    : "text-slate-400"
                                            }`}
                                        />
                                        <span>Langkah Produksi</span>
                                    </button>
                                </div>

                                {/* TAB CONTENT: RESEP BAHAN */}
                                {activeTab === "recipe" && (
                                    <div className="space-y-3">
                                        {materials.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 text-xs bg-slate-50/50 rounded-lg border border-slate-200">
                                                <Package className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
                                                Belum ada resep bahan baku untuk produk ini.
                                            </div>
                                        ) : (
                                            <>
                                                {globalMaterials.length > 0 && (
                                                    <details className="group border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                                                        <summary className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                                            <span className="text-xs font-bold text-slate-900">
                                                                Bahan Umum (Semua Ukuran)
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded font-mono">
                                                                    {formatCurrency(
                                                                        globalMaterialCost,
                                                                    )}
                                                                </span>
                                                                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                                                            </div>
                                                        </summary>
                                                        <div className="divide-y divide-slate-100">
                                                            {globalMaterials.map(
                                                                (mat, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/60"
                                                                    >
                                                                        <div>
                                                                            <div className="font-bold text-slate-900">
                                                                                {mat.item?.name}
                                                                            </div>
                                                                            <div className="text-[10px] text-slate-500 font-mono">
                                                                                {mat.item?.code} • @ {formatCurrency(mat.item?.price)}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="font-bold font-mono text-slate-800">
                                                                                {formatQty(mat.required_qty)} {mat.unit_name}
                                                                            </div>
                                                                            <div className="text-[10px] font-bold text-teal-700 font-mono">
                                                                                = {formatCurrency(
                                                                                    Number(mat.required_qty || 0) * Number(mat.item?.price || 0),
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </details>
                                                )}

                                                {distinctSizesWithMaterials.map(
                                                    (sz, idx) => (
                                                        <details
                                                            key={idx}
                                                            className="group border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs"
                                                        >
                                                            <summary className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                                                <span className="text-xs font-bold text-slate-900">
                                                                    Resep {sz.size_name}{" "}
                                                                    <span className="font-normal text-slate-500">
                                                                        ({sz.category})
                                                                    </span>
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded font-mono">
                                                                        {formatCurrency(
                                                                            sz.total_material_cost,
                                                                        )}
                                                                    </span>
                                                                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                                                                </div>
                                                            </summary>
                                                            <div className="divide-y divide-slate-100">
                                                                {sz.materials.map(
                                                                    (mat, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/60"
                                                                        >
                                                                            <div>
                                                                                <div className="font-bold text-slate-900">
                                                                                    {mat.item?.name}
                                                                                </div>
                                                                                <div className="text-[10px] text-slate-500 font-mono">
                                                                                    {mat.item?.code} • @ {formatCurrency(mat.item?.price)}
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="font-bold font-mono text-slate-800">
                                                                                    {formatQty(mat.required_qty)} {mat.unit_name}
                                                                                </div>
                                                                                <div className="text-[10px] font-bold text-teal-700 font-mono">
                                                                                    = {formatCurrency(
                                                                                        Number(mat.required_qty || 0) * Number(mat.item?.price || 0),
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </details>
                                                    ),
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* TAB CONTENT: LANGKAH PRODUKSI */}
                                {activeTab === "steps" && (
                                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                                        {productionWageMode === "manual" ? (
                                            <div className="p-4 bg-indigo-50/50">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-800">
                                                            Upah Produksi Langsung
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 mt-0.5">
                                                            Upah produksi ditentukan langsung tanpa rincian langkah.
                                                        </div>
                                                    </div>
                                                    <div className="text-base font-extrabold text-indigo-700 font-mono shrink-0">
                                                        {formatCurrency(
                                                            totalProductionWage,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (product.production_steps || []).length ===
                                          0 ? (
                                            <div className="p-8 text-center text-slate-500 text-xs bg-slate-50/50">
                                                Belum ada langkah produksi terdaftar.
                                            </div>
                                        ) : (
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                                                    <tr>
                                                        <th className="py-2.5 px-3 w-12 text-center">
                                                            No
                                                        </th>
                                                        <th className="py-2.5 px-3">
                                                            Pekerjaan
                                                        </th>
                                                        <th className="py-2.5 px-3 w-32 text-right">
                                                            Upah
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 font-medium">
                                                    {product.production_steps.map(
                                                        (step, i) => (
                                                            <tr
                                                                key={i}
                                                                className="hover:bg-slate-50/80 transition-colors"
                                                            >
                                                                <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                                                                    {i + 1}
                                                                </td>
                                                                <td className="py-2.5 px-3 font-bold text-slate-800">
                                                                    {step.production_step?.name ||
                                                                        step.custom_name}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-right font-bold text-teal-700 font-mono">
                                                                    {formatCurrency(step.wage)}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}

                                {/* FOOTER WAKTU PEDAFTARAN */}
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2 border-t border-slate-100">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>
                                        Didaftarkan pada {formatDate(product.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
