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

            <div className="space-y-4 max-w-7xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    <div className="p-4 sm:p-5">
                        {/* HEADER */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    title="Kembali"
                                    onClick={() => router.visit(`/dashboard/pelanggan/${customer?.id || ""}`)}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-sm cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                    <Users className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                                        Edit Data Pelanggan
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Perbarui informasi profil, lembaga, dan kontak pemesan.
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

                        {/* BODY CONTENT 2 KOLOM SEJAJAR DENGAN FORM BAHAN BAKU */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* KOLOM KIRI: Identitas & Lembaga */}
                            <div className="lg:col-span-6 space-y-4">
                                <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-2">
                                        <Building2 className="w-4 h-4 text-teal-600" />
                                        <span>Identitas & Lembaga Pemesan</span>
                                    </div>

                                    <div>
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

                                    <div>
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
                                            className="w-full h-8 px-2.5 text-xs font-medium border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
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

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Nama Instansi / Lembaga
                                            </label>
                                            <input
                                                type="text"
                                                name="institution_name"
                                                value={form.institution_name}
                                                onChange={handleChange}
                                                placeholder="Contoh: Dinas Pendidikan"
                                                className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                            />
                                        </div>
                                    </div>

                                    <div>
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

                            {/* KOLOM KANAN: Kontak & Alamat */}
                            <div className="lg:col-span-6 space-y-4">
                                <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-2">
                                        <Phone className="w-4 h-4 text-teal-600" />
                                        <span>Informasi Kontak & Alamat</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
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

                                        <div>
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
                                    </div>

                                    <div>
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

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Catatan Tambahan
                                        </label>
                                        <textarea
                                            name="notes"
                                            rows={2}
                                            value={form.notes}
                                            onChange={handleChange}
                                            placeholder="Catatan kebiasaan pemesanan, jam operasional, dll..."
                                            className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                        />
                                    </div>

                                    <div className="pt-1">
                                        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={form.is_active}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                                            />
                                            <span className="text-xs font-semibold text-slate-700">
                                                Status Pelanggan Aktif Digunakan
                                            </span>
                                        </label>
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
