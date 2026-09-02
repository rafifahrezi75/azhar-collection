import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Toast } from "@/utils/sweetalert";
import {
    ArrowLeft,
    Users,
    Save,
    Building2,
    Phone,
    Mail,
    MapPin,
    FileText,
    CheckCircle2,
} from "lucide-react";

const CUSTOMER_TYPES = [
    "Sekolah / Pendidikan",
    "Instansi Pemerintah",
    "Perusahaan / Swasta",
    "Komunitas / Event",
    "Perorangan",
];

export default function Edit({ customer }) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        code: customer?.code || "",
        name: customer?.name || "",
        type: customer?.type || "Sekolah / Pendidikan",
        institution_name: customer?.institution_name || "",
        contact_person: customer?.contact_person || "",
        phone: customer?.phone || "",
        email: customer?.email || "",
        address: customer?.address || "",
        notes: customer?.notes || "",
        is_active: customer?.is_active ?? true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            Toast.error("Nama pelanggan wajib diisi.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.put(`/api/customers/${customer.id}`, form);
            Toast.success(res.data.message || "Data pelanggan berhasil diperbarui.");
            router.visit(`/dashboard/pelanggan/${customer.id}`);
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(", ")
                    : "Gagal memperbarui data pelanggan.");
            Toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Edit ${customer?.name || "Pelanggan"} - Azhar Collection`} />

            <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto pb-16">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* TOP HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => router.visit(`/dashboard/pelanggan/${customer?.id || ""}`)}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                    title="Kembali"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Users className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                                        Edit Data Pelanggan
                                    </h1>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        Perbarui informasi profil, lembaga, dan kontak pemesan
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => router.visit(`/dashboard/pelanggan/${customer?.id || ""}`)}
                                    className="h-8 px-3 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-8 px-3.5 inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{submitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* FORM CONTENT */}
                    <div className="p-4 sm:p-6 space-y-6">
                        {/* Section 1: Identitas Pelanggan */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                                <Building2 className="w-4 h-4 text-teal-600" />
                                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Identitas & Lembaga Pemesan
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                <div className="sm:col-span-4">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Kode Pelanggan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={form.code}
                                        onChange={handleChange}
                                        placeholder="CUST-001"
                                        required
                                        className="w-full h-8 px-2.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs uppercase"
                                    />
                                </div>

                                <div className="sm:col-span-8">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Nama Pelanggan / Pemesan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Contoh: SD Negeri 1 Sumber"
                                        required
                                        className="w-full h-8 px-2.5 text-xs font-semibold border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Tipe Kemitraan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        required
                                        className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs font-medium"
                                    >
                                        {CUSTOMER_TYPES.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-6">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Nama Instansi / Lembaga (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        name="institution_name"
                                        value={form.institution_name}
                                        onChange={handleChange}
                                        placeholder="Contoh: Dinas Pendidikan / PT Maju Sejahtera"
                                        className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                    />
                                </div>

                                <div className="sm:col-span-12">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Nama Kontak Person / PIC (Penanggung Jawab)
                                    </label>
                                    <input
                                        type="text"
                                        name="contact_person"
                                        value={form.contact_person}
                                        onChange={handleChange}
                                        placeholder="Contoh: Bpk. H. Ahmad Subardjo (Kepala Sekolah)"
                                        className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Kontak & Alamat */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                                <Phone className="w-4 h-4 text-teal-600" />
                                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Informasi Kontak & Alamat
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                <div className="sm:col-span-6">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        No. Telepon / WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Contoh: 081234567890"
                                        className="w-full h-8 px-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Alamat Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Contoh: sdn1sumber@gmail.com"
                                        className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                    />
                                </div>

                                <div className="sm:col-span-12">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Alamat Lengkap / Wilayah Pengiriman
                                    </label>
                                    <textarea
                                        name="address"
                                        rows={3}
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Jl. Raya Sunan Gunung Jati No. 45, Cirebon"
                                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                    />
                                </div>

                                <div className="sm:col-span-12">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Catatan Tambahan
                                    </label>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        value={form.notes}
                                        onChange={handleChange}
                                        placeholder="Catatan kebiasaan pemesanan, jam buka sekolah, dll..."
                                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                    />
                                </div>

                                <div className="sm:col-span-12 pt-2">
                                    <label className="inline-flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={form.is_active}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                                        />
                                        <span className="text-xs font-semibold text-slate-700">
                                            Status Pelanggan Aktif (Dapat dipilih dalam pembuatan invoice baru)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => router.visit(`/dashboard/pelanggan/${customer?.id || ""}`)}
                            className="h-8 px-3.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-8 px-4 inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>{submitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                        </button>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
