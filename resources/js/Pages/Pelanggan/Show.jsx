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
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    Receipt,
    Calendar,
    Edit2,
    ExternalLink,
    Clock,
    CheckCircle2,
    Tag,
    ShoppingBag,
    Eye,
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
        return <User className="w-4 h-4 text-teal-600" />;
    };

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "completed" || s === "selesai" || s === "paid") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Selesai
                </span>
            );
        }
        if (s === "in_progress" || s === "proses") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <Clock className="w-3 h-3" />
                    Diproses
                </span>
            );
        }
        if (s === "canceled" || s === "batal") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    Dibatalkan
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3" />
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

            <div className="space-y-4 max-w-7xl mx-auto pb-12">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* TOP HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => router.visit("/dashboard/pelanggan")}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                    title="Kembali ke Daftar Pelanggan"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    {getTypeIcon(customer.type)}
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                                            {customer.name}
                                        </h1>
                                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-md">
                                            {customer.code}
                                        </span>
                                        {customer.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                Nonaktif
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {customer.institution_name ? `${customer.institution_name} • ` : ""}
                                        {customer.type}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
                                {canUpdate && (
                                    <button
                                        type="button"
                                        onClick={() => router.visit(`/dashboard/pelanggan/${customer.id}/edit`)}
                                        className="h-8 px-3 inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        <span>Edit Data Pelanggan</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* STATS OVERVIEW CARDS */}
                    <div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Total Belanja (Omzet)
                            </span>
                            <div className="text-base sm:text-lg font-bold text-teal-700 font-mono">
                                {formatRupiah(stats.total_spent || 0)}
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                                Akumulasi seluruh nota
                            </span>
                        </div>

                        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Riwayat Pesanan
                            </span>
                            <div className="text-base sm:text-lg font-bold text-slate-800 font-mono">
                                {stats.total_invoices || 0} <span className="text-xs font-sans text-slate-500 font-normal">Invoice</span>
                            </div>
                            <span className="text-[10px] text-emerald-600 font-semibold block">
                                {stats.completed_invoices || 0} pesanan selesai
                            </span>
                        </div>

                        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Total Item Produksi
                            </span>
                            <div className="text-base sm:text-lg font-bold text-slate-800 font-mono">
                                {stats.total_items || 0} <span className="text-xs font-sans text-slate-500 font-normal">Pcs</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                                Volume pakaian dipesan
                            </span>
                        </div>

                        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Kategori Pelanggan
                            </span>
                            <div className="text-sm font-bold text-slate-800 truncate">
                                {customer.type}
                            </div>
                            <span className="text-[10px] text-slate-400 truncate block">
                                {customer.contact_person ? `PIC: ${customer.contact_person}` : "Perorangan"}
                            </span>
                        </div>
                    </div>

                    {/* TABS NAVIGATION */}
                    <div className="px-4 sm:px-5 pt-3 border-b border-slate-200 bg-white flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab("info")}
                            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 ${
                                activeTab === "info"
                                    ? "text-teal-700 border-b-2 border-teal-600"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Informasi Profil & Kontak</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("invoices")}
                            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 ${
                                activeTab === "invoices"
                                    ? "text-teal-700 border-b-2 border-teal-600"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Riwayat Invoice Pesanan ({customer.invoices?.length || 0})</span>
                        </button>
                    </div>

                    {/* TAB CONTENT */}
                    <div className="p-4 sm:p-5">
                        {activeTab === "info" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                {/* Profil & Lembaga */}
                                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                                    <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                                        <Building2 className="w-4 h-4 text-teal-600" />
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                            Identitas Pemesan & Instansi
                                        </h3>
                                    </div>

                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500 font-medium">Kode Pelanggan</span>
                                            <span className="font-mono font-bold text-slate-800">{customer.code}</span>
                                        </div>

                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500 font-medium">Nama Pelanggan</span>
                                            <span className="font-bold text-slate-800">{customer.name}</span>
                                        </div>

                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500 font-medium">Tipe Kemitraan</span>
                                            <span className="font-semibold text-slate-800">{customer.type}</span>
                                        </div>

                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500 font-medium">Nama Lembaga / Sekolah</span>
                                            <span className="font-semibold text-slate-800">
                                                {customer.institution_name || "-"}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500 font-medium">Kontak Person (PIC)</span>
                                            <span className="font-semibold text-slate-800">
                                                {customer.contact_person || "-"}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-1">
                                            <span className="text-slate-500 font-medium">Status Akun</span>
                                            <span className="font-bold">
                                                {customer.is_active ? (
                                                    <span className="text-emerald-700">Aktif</span>
                                                ) : (
                                                    <span className="text-slate-500">Nonaktif</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Kontak & Alamat */}
                                <div className="space-y-4">
                                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                                        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                                            <Phone className="w-4 h-4 text-teal-600" />
                                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                Kontak & Alamat Pengiriman
                                            </h3>
                                        </div>

                                        <div className="space-y-2.5 text-xs">
                                            <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-500 font-medium">No. Telepon / WA</span>
                                                {customer.phone ? (
                                                    <div className="flex items-center gap-2 font-mono font-bold text-slate-800">
                                                        <span>{customer.phone}</span>
                                                        {waUrl && (
                                                            <a
                                                                href={waUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100"
                                                            >
                                                                <span>WhatsApp</span>
                                                                <ExternalLink className="w-2.5 h-2.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-500 font-medium">Email</span>
                                                {customer.email ? (
                                                    <a
                                                        href={`mailto:${customer.email}`}
                                                        className="font-medium text-teal-700 hover:underline"
                                                    >
                                                        {customer.email}
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </div>

                                            <div className="py-1">
                                                <span className="text-slate-500 font-medium block mb-1">
                                                    Alamat Lengkap / Wilayah
                                                </span>
                                                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-medium">
                                                    {customer.address || "Belum ada catatan alamat."}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {customer.notes && (
                                        <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 shadow-2xs space-y-1.5">
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
                        )}

                        {activeTab === "invoices" && (
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
                                                                    onClick={() => router.visit(`/dashboard/invoice/${inv.id}`)}
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
                                                                    onClick={() => router.visit(`/dashboard/invoice/${inv.id}`)}
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
