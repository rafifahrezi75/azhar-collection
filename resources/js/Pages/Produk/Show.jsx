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
    Ruler,
    Star,
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
                    <p className="text-sm text-slate-500">
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
            <Head title={`${product.name} - Detail Produk`} />
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        title="Kembali ke katalog"
                        onClick={() => router.visit("/dashboard/produk")}
                        className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-sm cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                                {product.name}
                            </h1>
                            <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold border border-slate-200">
                                {product.code}
                            </span>
                            {product.is_active ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Aktif
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Non-Aktif
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            Kategori:{" "}
                            <strong className="text-slate-700">
                                {product.category || "Umum"}
                            </strong>{" "}
                            • {product.default_unit || "Stel"} •{" "}
                            {formatCurrency(product.base_price)}
                        </p>
                    </div>
                    {canUpdate && (
                        <button
                            type="button"
                            onClick={() =>
                                router.visit(
                                    `/dashboard/produk/${product.id}/edit`,
                                )
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md shadow-2xs cursor-pointer shrink-0"
                        >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        {images.length > 0 ? (
                            <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <div className="relative rounded-lg overflow-hidden bg-slate-900 max-h-72 flex items-center justify-center">
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
                                                                : images.length -
                                                                  1,
                                                    )
                                                }
                                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/90 cursor-pointer"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedImageIndex(
                                                        (p) =>
                                                            p <
                                                            images.length - 1
                                                                ? p + 1
                                                                : 0,
                                                    )
                                                }
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/90 cursor-pointer"
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
                                                className={`w-16 h-16 rounded-md overflow-hidden border-2 shrink-0 ${selectedImageIndex === idx ? "border-teal-600 ring-2 ring-teal-500/30" : "border-slate-200 opacity-70 hover:opacity-100"}`}
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
                            <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center h-56 text-slate-400 shadow-sm">
                                <span className="text-sm font-bold text-slate-500">
                                    Tidak ada foto
                                </span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm space-y-1">
                                <span className="text-[11px] font-semibold text-slate-500 block">
                                    Satuan
                                </span>
                                <span className="text-sm font-bold text-slate-800">
                                    {product.default_unit || "Stel"}
                                </span>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm space-y-1">
                                <span className="text-[11px] font-semibold text-slate-500 block">
                                    Harga Dasar
                                </span>
                                <span className="text-sm font-bold text-teal-700 font-mono">
                                    {formatCurrency(product.base_price)}
                                </span>
                            </div>
                            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 space-y-1">
                                <span className="text-[11px] font-semibold text-rose-600 block">
                                    Min. Biaya Bahan
                                </span>
                                <span className="text-sm font-bold text-rose-700 font-mono">
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
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 space-y-1">
                                <span className="text-[11px] font-semibold text-indigo-600 block">
                                    Total Upah
                                </span>
                                <span className="text-sm font-bold text-indigo-700 font-mono">
                                    {formatCurrency(
                                        (product.production_steps || []).reduce(
                                            (s, step) =>
                                                s + Number(step.wage || 0),
                                            0,
                                        ),
                                    )}
                                </span>
                            </div>
                        </div>

                        {product.description && (
                            <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-sm space-y-1 text-xs">
                                <div className="font-bold text-slate-700 text-[11px]">
                                    Deskripsi & Spesifikasi:
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {sizes.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-500">
                                    Harga seragam:{" "}
                                    <strong>
                                        {formatCurrency(product.base_price)}
                                    </strong>{" "}
                                    per {product.default_unit || "Stel"}
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
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
                                    <tbody className="divide-y divide-slate-100">
                                        {sizes.map((s, i) => (
                                            <tr
                                                key={s.id || i}
                                                className="hover:bg-slate-50/60"
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

                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setActiveTab("recipe")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-md cursor-pointer ${activeTab === "recipe" ? "bg-white text-teal-700 shadow border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <Layers className="w-4 h-4" /> Resep Bahan
                            </button>
                            <button
                                onClick={() => setActiveTab("steps")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-md cursor-pointer ${activeTab === "steps" ? "bg-white text-teal-700 shadow border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <Scissors className="w-4 h-4" /> Langkah
                                Produksi
                            </button>
                        </div>

                        {activeTab === "recipe" && (
                            <div className="space-y-3">
                                {materials.length === 0 ? (
                                    <div className="p-6 text-center bg-white rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                                        <Package className="w-7 h-7 mx-auto text-slate-300 mb-1" />
                                        <p>Belum ada resep bahan baku</p>
                                    </div>
                                ) : (
                                    <>
                                        {globalMaterials.length > 0 && (
                                            <details className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                                                <summary className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                                    <span className="text-xs font-bold text-slate-900">
                                                        Bahan Umum (Semua
                                                        Ukuran)
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
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
                                                                className="px-3.5 py-2.5 flex items-center justify-between text-xs"
                                                            >
                                                                <div>
                                                                    <div className="font-bold text-slate-900">
                                                                        {
                                                                            mat
                                                                                .item
                                                                                ?.name
                                                                        }
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-500 font-mono">
                                                                        {
                                                                            mat
                                                                                .item
                                                                                ?.code
                                                                        }{" "}
                                                                        • @{" "}
                                                                        {formatCurrency(
                                                                            mat
                                                                                .item
                                                                                ?.price,
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-bold font-mono">
                                                                        {formatQty(
                                                                            mat.required_qty,
                                                                        )}{" "}
                                                                        {
                                                                            mat.unit_name
                                                                        }
                                                                    </div>
                                                                    <div className="text-[10px] font-bold text-teal-700">
                                                                        ={" "}
                                                                        {formatCurrency(
                                                                            Number(
                                                                                mat.required_qty ||
                                                                                    0,
                                                                            ) *
                                                                                Number(
                                                                                    mat
                                                                                        .item
                                                                                        ?.price ||
                                                                                        0,
                                                                                ),
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
                                                    className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                                                >
                                                    <summary className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                                        <span className="text-xs font-bold text-slate-900">
                                                            Resep {sz.size_name}{" "}
                                                            <span className="font-normal text-slate-500">
                                                                ({sz.category})
                                                            </span>
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
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
                                                                    className="px-3.5 py-2.5 flex items-center justify-between text-xs"
                                                                >
                                                                    <div>
                                                                        <div className="font-bold text-slate-900">
                                                                            {
                                                                                mat
                                                                                    .item
                                                                                    ?.name
                                                                            }
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-500 font-mono">
                                                                            {
                                                                                mat
                                                                                    .item
                                                                                    ?.code
                                                                            }{" "}
                                                                            • @{" "}
                                                                            {formatCurrency(
                                                                                mat
                                                                                    .item
                                                                                    ?.price,
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-bold font-mono">
                                                                            {formatQty(
                                                                                mat.required_qty,
                                                                            )}{" "}
                                                                            {
                                                                                mat.unit_name
                                                                            }
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-teal-700">
                                                                            ={" "}
                                                                            {formatCurrency(
                                                                                Number(
                                                                                    mat.required_qty ||
                                                                                        0,
                                                                                ) *
                                                                                    Number(
                                                                                        mat
                                                                                            .item
                                                                                            ?.price ||
                                                                                            0,
                                                                                    ),
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

                        {activeTab === "steps" && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                                {(product.production_steps || []).length ===
                                0 ? (
                                    <div className="p-4 text-center text-xs text-slate-400">
                                        Belum ada langkah produksi
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
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
                                        <tbody className="divide-y divide-slate-100">
                                            {product.production_steps.map(
                                                (step, i) => (
                                                    <tr
                                                        key={i}
                                                        className="hover:bg-slate-50/60"
                                                    >
                                                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                                                            {i + 1}
                                                        </td>
                                                        <td className="py-2.5 px-3 font-bold text-slate-800">
                                                            {step
                                                                .production_step
                                                                ?.name ||
                                                                step.custom_name}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-teal-700 font-mono">
                                                            {formatCurrency(
                                                                step.wage,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                            Didaftarkan pada {formatDate(product.created_at)}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
