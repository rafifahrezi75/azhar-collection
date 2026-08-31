import React, { useState, useMemo } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { hasPermission } from "@/utils/permissions";
import {
    ArrowLeft,
    Package,
    AlertTriangle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownLeft,
    User as UserIcon,
    FileText,
    History,
    Edit,
    ZoomIn,
    Plus,
    Calculator,
    Layers,
    X,
} from "lucide-react";

export default function Show({ item }) {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];
    const canUpdate = useMemo(
        () => hasPermission(permissions, "barang.update"),
        [permissions],
    );
    const [activeTab, setActiveTab] = useState("info");
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!item) {
        return (
            <DashboardLayout>
                <Head title="Bahan Baku Tidak Ditemukan" />
                <div className="flex items-center justify-center h-64">
                    <p className="text-sm text-slate-500">
                        Bahan baku tidak ditemukan
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    const baseUnitSymbol = item.unit?.symbol || item.unit?.name || "pcs";
    const isLowStock =
        Number(item.stock) <= Number(item.min_stock) && Number(item.stock) > 0;
    const isOutOfStock = Number(item.stock) <= 0;

    return (
        <DashboardLayout>
            <Head title={`${item.name} - Detail Bahan Baku`} />
            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header Area */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Left: Back Button & Title */}
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    title="Kembali"
                                    onClick={() =>
                                        router.visit("/dashboard/barang")
                                    }
                                    className="w-8 h-8 shrink-0 inline-flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-all cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 shrink-0 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shadow-2xs">
                                    <Package className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                        Detail Bahan Baku
                                    </h3>
                                    <p className="text-[11px] text-slate-500 truncate">
                                        Informasi bahan, stok fisik, dan riwayat
                                        mutasi.
                                    </p>
                                </div>
                            </div>

                            {/* Right: Tab Controls & Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 shrink-0">
                                {/* Clean Underscore Tab (Tanpa Background Abu-abu) */}
                                <div className="flex items-center gap-5 h-8 border-b border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("info")}
                                        className={`inline-flex items-center gap-1.5 h-full px-0.5 text-xs font-semibold transition-all cursor-pointer border-b-2 -mb-px ${
                                            activeTab === "info"
                                                ? "border-teal-600 text-teal-700 font-bold"
                                                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <FileText
                                            className={`w-3.5 h-3.5 ${activeTab === "info" ? "text-teal-600" : "text-slate-400"}`}
                                        />
                                        <span>Informasi</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveTab("mutations")
                                        }
                                        className={`inline-flex items-center gap-1.5 h-full px-0.5 text-xs font-semibold transition-all cursor-pointer border-b-2 -mb-px ${
                                            activeTab === "mutations"
                                                ? "border-teal-600 text-teal-700 font-bold"
                                                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <History
                                            className={`w-3.5 h-3.5 ${activeTab === "mutations" ? "text-teal-600" : "text-slate-400"}`}
                                        />
                                        <span>Riwayat Mutasi</span>
                                        <span
                                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                                activeTab === "mutations"
                                                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                            }`}
                                        >
                                            {item.mutations?.length || 0}
                                        </span>
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                {canUpdate && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            title="Ambil Stok"
                                            onClick={() =>
                                                router.visit(
                                                    `/dashboard/barang/${item.id}/stock?type=out`,
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-semibold rounded-lg border border-amber-200 shadow-2xs transition-all cursor-pointer"
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">
                                                Ambil Stok
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            title="Tambah Stok"
                                            onClick={() =>
                                                router.visit(
                                                    `/dashboard/barang/${item.id}/stock?type=in`,
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-lg border border-emerald-200 shadow-2xs transition-all cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">
                                                Tambah Stok
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            title="Edit Bahan Baku"
                                            onClick={() =>
                                                router.visit(
                                                    `/dashboard/barang/${item.id}/edit`,
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                            <span>Edit</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Tab Content */}
                    <div className="p-4 sm:p-5">
                        {activeTab === "info" ? (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-4 space-y-3">
                                    {/* Item Photo */}
                                    <div className="relative aspect-square w-full rounded-md overflow-hidden bg-slate-50 border border-slate-200 group shadow-2xs">
                                        {item.image_url ? (
                                            <>
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                    onClick={() =>
                                                        setLightboxOpen(true)
                                                    }
                                                />
                                                <div
                                                    onClick={() =>
                                                        setLightboxOpen(true)
                                                    }
                                                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5 cursor-pointer"
                                                >
                                                    <ZoomIn className="w-4 h-4" />
                                                    <span>Perbesar Foto</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                                                <Package className="w-9 h-9 text-slate-300" />
                                                <span className="text-xs text-slate-400 font-medium">
                                                    Tanpa Foto Produk
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Item General Details */}
                                    <div className="p-3 rounded-md bg-white border border-slate-200 shadow-2xs">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                                                        {item.name}
                                                    </h1>
                                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 font-bold">
                                                        {item.code}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-500">
                                                    <p>
                                                        Kategori:{" "}
                                                        <strong className="text-slate-700 font-semibold">
                                                            {item.category
                                                                ?.name || "-"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Satuan Dasar:{" "}
                                                        <strong className="text-slate-700 font-semibold">
                                                            {item.unit?.name ||
                                                                "-"}{" "}
                                                            ({baseUnitSymbol})
                                                        </strong>
                                                    </p>
                                                </div>
                                            </div>

                                            {item.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                                    <X className="w-3 h-3" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stock Metrics Status */}
                                    <div className="p-3 rounded-md bg-white border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">
                                                Status Katalog:
                                            </span>
                                            {item.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>Aktif</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                    <X className="w-3 h-3 text-slate-500" />
                                                    <span>Nonaktif</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">
                                                Kondisi Stok:
                                            </span>
                                            {isOutOfStock ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                                    <span>Habis (0)</span>
                                                </span>
                                            ) : isLowStock ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                                    <span>Menipis</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>Aman</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <span className="text-slate-500 font-medium">
                                                Batas Minimum:
                                            </span>
                                            <span className="font-semibold text-slate-800 font-mono">
                                                {item.min_stock}{" "}
                                                {baseUnitSymbol}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">
                                                Harga Dasar:
                                            </span>
                                            <span className="font-semibold text-teal-700 font-mono">
                                                {new Intl.NumberFormat(
                                                    "id-ID",
                                                    {
                                                        style: "currency",
                                                        currency: "IDR",
                                                        minimumFractionDigits: 0,
                                                    },
                                                ).format(item.price || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-8 space-y-3.5">
                                    {/* Physical Units Cards */}
                                    <div className="p-3.5 sm:p-4 rounded-md bg-white border border-slate-200 space-y-3 shadow-2xs">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                                                    <Calculator className="w-3.5 h-3.5" />
                                                </div>
                                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                                                    Stok Fisik per Satuan
                                                </h4>
                                            </div>
                                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                                {item.unit_cards?.length || 1}{" "}
                                                Satuan Terdaftar
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {item.unit_cards?.map(
                                                (card, cIdx) => (
                                                    <div
                                                        key={cIdx}
                                                        className={`p-3 rounded-md border flex flex-col justify-between transition-all ${
                                                            card.is_base
                                                                ? "bg-teal-50/40 border-teal-200/90 shadow-2xs"
                                                                : "bg-emerald-50/40 border-emerald-200/90 shadow-2xs"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2.5">
                                                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                                <span
                                                                    className={`w-2.5 h-2.5 rounded-full ${
                                                                        card.is_base
                                                                            ? "bg-teal-600"
                                                                            : "bg-emerald-600"
                                                                    }`}
                                                                />
                                                                <span>
                                                                    {
                                                                        card.unit_name
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        card.unit_symbol
                                                                    }
                                                                    )
                                                                </span>
                                                            </span>
                                                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                                                {
                                                                    card.multiplier_label
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <div className="p-2 bg-white rounded border border-emerald-200/80 shadow-2xs">
                                                                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wide block">
                                                                        Nyata
                                                                        (Pasti)
                                                                    </span>
                                                                    <span className="font-mono font-extrabold text-emerald-950 text-sm sm:text-base block mt-0.5">
                                                                        {
                                                                            card.real_text
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="p-2 bg-amber-50/80 rounded border border-amber-200/80 shadow-2xs">
                                                                    <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wide block">
                                                                        Estimasi
                                                                        / Sisa
                                                                    </span>
                                                                    <span className="font-mono font-extrabold text-amber-950 text-sm sm:text-base block mt-0.5">
                                                                        {card.est_count >
                                                                        0
                                                                            ? card.est_text
                                                                            : "0"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/70 bg-white/70 px-2 py-1 rounded">
                                                                <span className="text-slate-600 font-semibold">
                                                                    Subtotal
                                                                    Fisik:
                                                                </span>
                                                                <div className="text-right">
                                                                    <span className="font-mono font-extrabold text-slate-900">
                                                                        {
                                                                            card.total_text
                                                                        }
                                                                    </span>
                                                                    {!card.is_base && (
                                                                        <span className="text-[10px] text-slate-500 font-mono block">
                                                                            (={" "}
                                                                            {
                                                                                card.equivalent_text
                                                                            }
                                                                            )
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {/* Breakdown Total Hero */}
                                    {(() => {
                                        const heroBreakdown =
                                            item.dual_stock_breakdown_text ||
                                            item.stock_breakdown_text ||
                                            `${item.stock} ${baseUnitSymbol}`;
                                        return (
                                            <div className="p-3.5 sm:p-4 rounded-md bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 border border-slate-200 shadow-2xs space-y-3">
                                                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                                                        <Layers className="w-3.5 h-3.5 text-teal-600" />
                                                        Akumulasi & Rincian Stok
                                                        Terbaca
                                                    </span>
                                                    {item.is_estimated_stock && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                                                            Terdapat Estimasi
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs space-y-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                                                        Rincian Keseluruhan
                                                        Fisik Barang:
                                                    </span>
                                                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-mono">
                                                        {heroBreakdown}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 font-medium pt-0.5">
                                                        Total akumulasi
                                                        konversi:{" "}
                                                        <strong className="font-bold text-slate-900 font-mono">
                                                            {item.stock}{" "}
                                                            {baseUnitSymbol}
                                                        </strong>{" "}
                                                        (
                                                        {item.unit?.name ||
                                                            "Satuan Dasar"}
                                                        )
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Description */}
                                    <div className="p-3 rounded-md bg-white border border-slate-200 space-y-1 shadow-2xs">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
                                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                                            <span>
                                                Deskripsi / Catatan Bahan Baku
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed font-normal pt-0.5">
                                            {item.description ||
                                                "Tidak ada catatan atau deskripsi tambahan untuk barang ini."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Mutations Tab Content */
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Catatan Riwayat Mutasi Stok
                                    </h4>
                                    <span className="text-xs text-slate-500">
                                        Menampilkan log transaksi stok keluar,
                                        masuk, dan penyesuaian
                                    </span>
                                </div>
                                {item.mutations && item.mutations.length > 0 ? (
                                    <div className="border border-slate-200 rounded-md overflow-hidden shadow-2xs overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                                                <tr>
                                                    <th className="px-3 py-2">
                                                        Tanggal
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Tipe
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Jumlah Transaksi
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Total Satuan Dasar
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Sisa Stok
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Keperluan / Keterangan
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Petugas
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {item.mutations.map((m) => {
                                                    const isOut =
                                                        m.type === "out";
                                                    const isIn =
                                                        m.type === "in";
                                                    return (
                                                        <tr
                                                            key={m.id}
                                                            className="hover:bg-slate-50/70 transition-colors"
                                                        >
                                                            <td className="px-3 py-2 font-mono text-xs text-slate-600 whitespace-nowrap">
                                                                {new Date(
                                                                    m.mutation_date ||
                                                                        m.created_at,
                                                                ).toLocaleDateString(
                                                                    "id-ID",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    },
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 whitespace-nowrap">
                                                                {isOut ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                                        <ArrowUpRight className="w-3 h-3 text-rose-600" />
                                                                        <span>
                                                                            Keluar
                                                                        </span>
                                                                    </span>
                                                                ) : isIn ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                                                                        <span>
                                                                            Masuk
                                                                        </span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                                        <span>
                                                                            Penyesuaian
                                                                        </span>
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap font-mono">
                                                                {isOut
                                                                    ? `-${m.quantity}`
                                                                    : `+${m.quantity}`}{" "}
                                                                <span className="font-normal text-slate-500">
                                                                    {m.unit
                                                                        ?.symbol ||
                                                                        m.unit
                                                                            ?.name ||
                                                                        baseUnitSymbol}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 font-mono text-xs text-slate-600 whitespace-nowrap">
                                                                {isOut
                                                                    ? `-${m.total_base_quantity}`
                                                                    : `+${m.total_base_quantity}`}{" "}
                                                                {baseUnitSymbol}
                                                            </td>
                                                            <td className="px-3 py-2 font-mono font-bold text-slate-800 whitespace-nowrap">
                                                                {
                                                                    m.current_stock
                                                                }{" "}
                                                                {baseUnitSymbol}
                                                            </td>
                                                            <td
                                                                className="px-3 py-2 text-slate-600 max-w-xs truncate"
                                                                title={m.notes}
                                                            >
                                                                {m.notes || "-"}
                                                                {m.reference_no && (
                                                                    <span className="block text-[10px] font-mono text-slate-400">
                                                                        Ref:{" "}
                                                                        {
                                                                            m.reference_no
                                                                        }
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5">
                                                                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                                                    <span className="text-slate-700 font-medium">
                                                                        {m.user
                                                                            ?.name ||
                                                                            "System"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-md border border-slate-200">
                                        Belum ada catatan mutasi stok untuk
                                        barang ini.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && item.image_url && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <div className="relative max-w-2xl max-h-[85vh] p-3 bg-white rounded-md border border-slate-200 shadow-2xl flex flex-col items-center">
                        <img
                            src={item.image_url}
                            alt={item.name}
                            className="max-h-[75vh] w-auto rounded-md object-contain"
                        />
                        <div className="mt-2 text-center text-slate-900 text-xs font-semibold">
                            {item.name} ({item.code})
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
