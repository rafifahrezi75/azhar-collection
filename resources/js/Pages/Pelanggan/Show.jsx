import React, { useState, useMemo } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { hasPermission } from "@/utils/permissions";
import { formatRupiah, formatDate } from "@/utils/format";
import {
    ArrowLeft,
    Users,
    Building2,
    Landmark,
    Briefcase,
    User as UserIcon,
    Phone,
    Mail,
    MapPin,
    FileText,
    Receipt,
    Calendar,
    Edit,
    ExternalLink,
    Clock,
    CheckCircle2,
    Tag,
    ShoppingBag,
    Eye,
    X,
} from "lucide-react";

export default function Show({ customer, stats = {} }) {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];
    const canUpdate = useMemo(
        () => hasPermission(permissions, "pelanggan.update"),
        [permissions]
    );

    const [activeTab, setActiveTab] = useState("info");

    if (!customer) {
        return (
            <DashboardLayout>
                <Head title="Pelanggan Tidak Ditemukan" />
                <div className="flex items-center justify-center h-64">
                    <p className="text-sm text-slate-500 font-medium">
                        Data pelanggan tidak ditemukan.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    const getTypeIcon = (type) => {
        const t = (type || "").toUpperCase();
        if (t.includes("SEKOLAH") || t.includes("PENDIDIKAN")) return <Building2 className="w-4 h-4 text-sky-600" />;
        if (t.includes("INSTANSI") || t.includes("PEMERINTAH")) return <Landmark className="w-4 h-4 text-purple-600" />;
        if (t.includes("PERUSAHAAN") || t.includes("SWASTA")) return <Briefcase className="w-4 h-4 text-indigo-600" />;
        if (t.includes("KOMUNITAS") || t.includes("EVENT")) return <Users className="w-4 h-4 text-amber-600" />;
        return <UserIcon className="w-4 h-4 text-teal-600" />;
    };

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "completed" || s === "selesai" || s === "paid") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Selesai
                </span>
            );
        }
        if (s === "in_progress" || s === "proses") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <Clock className="w-3 h-3 text-blue-600" />
                    Diproses
                </span>
            );
        }
        if (s === "canceled" || s === "batal") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <X className="w-3 h-3 text-rose-600" />
                    Dibatalkan
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                Pending
            </span>
        );
    };

    const cleanPhone = customer.phone ? customer.phone.replace(/[^0-9]/g, "") : "";
    const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}`
        : null;

    return (
        <DashboardLayout>
            <Head title={`${customer.name} - Detail Pelanggan - Azhar Collection`} />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Tombol Kembali & Judul */}
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    title="Kembali"
                                    onClick={() => router.visit("/dashboard/pelanggan")}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Users className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                        Detail Pelanggan
                                    </h3>
                                    <p className="text-[11px] text-slate-500 truncate">
                                        Informasi profil pemesan, lembaga, kontak penanggung jawab, dan riwayat invoice.
                                    </p>
                                </div>
                            </div>

                            {/* Navigasi Tab & Tombol Aksi */}
                            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0">
                                {/* Tab Navigation */}
                                <div className="flex items-center gap-2 h-8 border-b border-slate-200/80">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("info")}
                                        className={`inline-flex items-center gap-1.5 h-full px-2.5 text-xs font-semibold rounded-t-md transition-all cursor-pointer border-b-2 -mb-px ${
                                            activeTab === "info"
                                                ? "border-teal-600 text-teal-700 bg-teal-50/80 font-bold"
                                                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <FileText
                                            className={`w-3.5 h-3.5 ${
                                                activeTab === "info"
                                                    ? "text-teal-600"
                                                    : "text-slate-400"
                                            }`}
                                        />
                                        <span>Informasi</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("invoices")}
                                        className={`inline-flex items-center gap-1.5 h-full px-2.5 text-xs font-semibold rounded-t-md transition-all cursor-pointer border-b-2 -mb-px ${
                                            activeTab === "invoices"
                                                ? "border-teal-600 text-teal-700 bg-teal-50/80 font-bold"
                                                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <Receipt
                                            className={`w-3.5 h-3.5 ${
                                                activeTab === "invoices"
                                                    ? "text-teal-600"
                                                    : "text-slate-400"
                                            }`}
                                        />
                                        <span>Riwayat Invoice</span>
                                        <span
                                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                                activeTab === "invoices"
                                                    ? "bg-teal-100/80 text-teal-800 border border-teal-200/80"
                                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                            }`}
                                        >
                                            {customer.invoices?.length || 0}
                                        </span>
                                    </button>
                                </div>

                                {/* Tombol Aksi */}
                                {canUpdate && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            title="Edit Data Pelanggan"
                                            onClick={() => router.visit(`/dashboard/pelanggan/${customer.id}/edit`)}
                                            className="inline-flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                                        >
                                            <Edit className="w-3.5 h-3.5 text-teal-600" />
                                            <span>Edit</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MAIN TAB CONTENT */}
                    <div className="p-4 sm:p-5">
                        {activeTab === "info" ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                {/* KOLOM KIRI: Profil Ringkas & Metrik */}
                                <div className="lg:col-span-4 space-y-4">
                                    {/* Identitas Utama */}
                                    <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 shadow-2xs space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                                                        {customer.name}
                                                    </h1>
                                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold shadow-2xs">
                                                        {customer.code}
                                                    </span>
                                                </div>
                                                <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                                                    <p>
                                                        Tipe:{" "}
                                                        <strong className="text-slate-800 font-semibold">
                                                            {customer.type}
                                                        </strong>
                                                    </p>
                                                    {customer.institution_name && (
                                                        <p>
                                                            Instansi:{" "}
                                                            <strong className="text-slate-800 font-semibold">
                                                                {customer.institution_name}
                                                            </strong>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {customer.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                                    <X className="w-3 h-3 text-slate-400" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick WhatsApp / Contact Button */}
                                        {waUrl && (
                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors shadow-2xs"
                                            >
                                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Hubungi via WhatsApp</span>
                                                <ExternalLink className="w-3 h-3 text-emerald-500" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Metrik & Ringkasan Transaksi */}
                                    <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-2">
                                            <Receipt className="w-4 h-4 text-teal-600" />
                                            <span>Akumulasi Transaksi</span>
                                        </div>

                                        <div className="space-y-2 text-xs pt-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Total Belanja:</span>
                                                <span className="font-mono font-bold text-teal-700 text-sm">
                                                    {formatRupiah(stats.total_spent || 0)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                                                <span className="text-slate-500">Total Invoice:</span>
                                                <span className="font-semibold text-slate-800">
                                                    {stats.total_invoices || 0} Pesanan
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                                                <span className="text-slate-500">Pesanan Selesai:</span>
                                                <span className="font-semibold text-emerald-700">
                                                    {stats.completed_invoices || 0} Pesanan
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                                                <span className="text-slate-500">Volume Pakaian:</span>
                                                <span className="font-semibold text-slate-800">
                                                    {stats.total_items || 0} Pcs
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* KOLOM KANAN: Detail Informasi Lengkap */}
                                <div className="lg:col-span-8 space-y-4">
                                    {/* Section 1: Identitas Lembaga & PIC */}
                                    <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-2">
                                            <Building2 className="w-4 h-4 text-teal-600" />
                                            <span>Identitas & Lembaga Pemesan</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-slate-400 block text-[11px] mb-0.5">Kode Pelanggan</span>
                                                <span className="font-mono font-bold text-slate-800 text-sm">{customer.code}</span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block text-[11px] mb-0.5">Nama Pemesan</span>
                                                <span className="font-bold text-slate-900 text-sm">{customer.name}</span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block text-[11px] mb-0.5">Tipe Kemitraan</span>
                                                <span className="font-semibold text-slate-800">{customer.type}</span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block text-[11px] mb-0.5">Nama Instansi / Lembaga</span>
                                                <span className="font-semibold text-slate-800">{customer.institution_name || "-"}</span>
                                            </div>

                                            <div className="sm:col-span-2">
                                                <span className="text-slate-400 block text-[11px] mb-0.5">Kontak Person / PIC (Penanggung Jawab)</span>
                                                <span className="font-semibold text-slate-800">{customer.contact_person || "-"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Kontak & Alamat Pengiriman */}
                                    <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-2">
                                            <Phone className="w-4 h-4 text-teal-600" />
                                            <span>Informasi Kontak & Alamat Pengiriman</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-slate-400 block text-[11px] mb-0.5">No. Telepon / WhatsApp</span>
                                                {customer.phone ? (
                                                    <span className="font-mono font-bold text-slate-800">{customer.phone}</span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block text-[11px] mb-0.5">Alamat Email</span>
                                                {customer.email ? (
                                                    <a href={`mailto:${customer.email}`} className="font-medium text-teal-700 hover:underline">
                                                        {customer.email}
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </div>

                                            <div className="sm:col-span-2">
                                                <span className="text-slate-400 block text-[11px] mb-1">Alamat Lengkap / Wilayah Pengiriman</span>
                                                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-medium">
                                                    {customer.address || "Belum ada catatan alamat pengiriman."}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Catatan Khusus */}
                                    {customer.notes && (
                                        <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200 space-y-2">
                                            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                                                Catatan Khusus Pelanggan
                                            </span>
                                            <p className="text-xs text-amber-950 whitespace-pre-line leading-relaxed">
                                                {customer.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {customer.invoices && customer.invoices.length > 0 ? (
                                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                                                        <th className="py-2.5 px-3.5 w-10 text-center">#</th>
                                                        <th className="py-2.5 px-3.5 min-w-[140px]">No. Invoice</th>
                                                        <th className="py-2.5 px-3.5 w-32">Tanggal</th>
                                                        <th className="py-2.5 px-3.5 min-w-[200px]">Item Pesanan</th>
                                                        <th className="py-2.5 px-3.5 w-36 text-right">Grand Total</th>
                                                        <th className="py-2.5 px-3.5 w-28 text-center">Status</th>
                                                        <th className="py-2.5 px-3.5 w-16 text-center">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                    {customer.invoices.map((inv, idx) => (
                                                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                                                            <td className="py-2.5 px-3.5 text-center text-slate-400 font-medium">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="py-2.5 px-3.5 font-mono font-bold text-teal-700">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => router.visit(`/dashboard/invoice/${inv.id}?return_to=${encodeURIComponent(`/dashboard/pelanggan/${customer.id}`)}`)}
                                                                    className="hover:underline cursor-pointer"
                                                                >
                                                                    {inv.invoice_number}
                                                                </button>
                                                            </td>
                                                            <td className="py-2.5 px-3.5 text-slate-600 whitespace-nowrap">
                                                                {formatDate(inv.date || inv.created_at)}
                                                            </td>
                                                            <td className="py-2.5 px-3.5">
                                                                <div className="space-y-0.5">
                                                                    {(inv.items || []).map((it, iIdx) => (
                                                                        <div key={iIdx} className="text-slate-700 truncate max-w-xs">
                                                                            &bull; {it.item_name} ({it.qty} {it.unit || "pcs"})
                                                                        </div>
                                                                    ))}
                                                                    {(!inv.items || inv.items.length === 0) && (
                                                                        <span className="text-slate-400 italic text-[11px]">-</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                                                {formatRupiah(inv.grand_total || 0)}
                                                            </td>
                                                            <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                                                                {getStatusBadge(inv.status)}
                                                            </td>
                                                            <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => router.visit(`/dashboard/invoice/${inv.id}?return_to=${encodeURIComponent(`/dashboard/pelanggan/${customer.id}`)}`)}
                                                                    title="Lihat Detail Invoice"
                                                                    className="w-7 h-7 inline-flex items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-all border border-teal-200/80 cursor-pointer shadow-2xs"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-2">
                                        <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                                        <p className="text-xs text-slate-500 font-medium">
                                            Pelanggan ini belum memiliki riwayat pesanan invoice.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
