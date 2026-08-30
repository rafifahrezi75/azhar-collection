import React, { memo, useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Users,
    X,
    RefreshCw,
    Phone,
    Mail,
    MapPin,
    Tag,
    UserCheck,
    Save,
} from "lucide-react";

const CustomerModal = memo(function CustomerModal({
    isOpen,
    isEditing,
    form,
    submitting,
    onClose,
    onChange,
    onSubmit,
}) {
    const [isAutoCode, setIsAutoCode] = useState(!isEditing);
    const [fetchingCode, setFetchingCode] = useState(false);

    const fetchNextCode = useCallback(async () => {
        setFetchingCode(true);
        try {
            const res = await axios.get("/api/customers/next-code");
            if (res.data?.code) {
                onChange({ target: { name: "code", value: res.data.code } });
            }
        } catch {
            // Fallback default
            onChange({ target: { name: "code", value: "CUST-001" } });
        } finally {
            setFetchingCode(false);
        }
    }, [onChange]);

    useEffect(() => {
        if (isOpen) {
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

    const handleToggleAutoCode = (checked) => {
        setIsAutoCode(checked);
        if (checked) {
            fetchNextCode();
        }
    };

    const handleRefreshCode = () => {
        if (isAutoCode && !fetchingCode) {
            fetchNextCode();
        }
    };

    if (!isOpen) return null;

    const customerTypes = [
        {
            label: "Perorangan / Individu (Pribadi / Custom Jahit)",
            value: "Perorangan",
        },
        {
            label: "Sekolah / Lembaga Pendidikan (TK/SD/SMP/SMA/Pesantren)",
            value: "Sekolah",
        },
        {
            label: "Instansi / Pemerintah (Dinas/Kementerian/BUMN)",
            value: "Instansi / Pemerintah",
        },
        {
            label: "Perusahaan / Swasta (PT/CV/Pabrik/Korporasi)",
            value: "Perusahaan / Swasta",
        },
        {
            label: "Komunitas / Organisasi (Karang Taruna/Klub/EO)",
            value: "Komunitas / Organisasi",
        },
        { label: "Lainnya", value: "Lainnya" },
    ];

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full p-4 sm:p-5 shadow-soft-xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                {isEditing
                                    ? "Edit Data Pelanggan"
                                    : "Tambah Pelanggan Baru"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Lengkapi data pemesan (Perorangan,
                                Sekolah, Instansi Pemerintah, Perusahaan, atau
                                Komunitas).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form - 2 Columns Side-by-Side */}
                <form onSubmit={onSubmit} className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        {/* LEFT COLUMN: Identitas & Tipe Pelanggan */}
                        <div className="space-y-3.5">
                            <div className="p-3.5 bg-slate-50/80 rounded-md border border-slate-200 space-y-3 shadow-2xs">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-2">
                                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Identitas Pemesan / Pelanggan</span>
                                </div>

                                {/* Code / SKU with Auto Checkbox */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Kode Pelanggan{" "}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isAutoCode}
                                                onChange={(e) =>
                                                    handleToggleAutoCode(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className="text-[11px] font-medium text-slate-600">
                                                Otomatis
                                            </span>
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="code"
                                            value={form.code}
                                            onChange={onChange}
                                            readOnly={isAutoCode}
                                            className={`w-full border rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold uppercase transition-all ${
                                                isAutoCode
                                                    ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                                                    : "bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder-slate-400"
                                            }`}
                                            placeholder="Contoh: CUST-001"
                                            required
                                        />
                                        {isAutoCode && (
                                            <button
                                                type="button"
                                                onClick={handleRefreshCode}
                                                disabled={fetchingCode}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-200 rounded transition-colors cursor-pointer disabled:opacity-50"
                                                title="Ambil Kode Urut Terakhir (+1)"
                                            >
                                                <RefreshCw
                                                    className={`w-3 h-3 ${fetchingCode ? "animate-spin text-teal-600" : ""}`}
                                                />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Type */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Tipe / Kategori Pelanggan{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        name="type"
                                        value={form.type || "Perorangan"}
                                        onChange={onChange}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white font-medium"
                                        required
                                    >
                                        {customerTypes.map((t) => (
                                            <option
                                                key={t.value}
                                                value={t.value}
                                            >
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Customer Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Nama Pelanggan / Lembaga{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={onChange}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder-slate-400 font-medium"
                                        placeholder="Contoh: SMA Negeri 1 Jakarta / Bpk. Hendra Gunawan / PT. Astra"
                                        required
                                    />
                                </div>

                                {/* Institution / Sub-Org Name (Optional) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Nama Instansi / Afiliasi / Divisi
                                        (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        name="institution_name"
                                        value={form.institution_name || ""}
                                        onChange={onChange}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder-slate-400 font-medium"
                                        placeholder="Contoh: Divisi HRD / Koperasi Siswa / Panitia Event"
                                    />
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        id="modal_customer_is_active"
                                        checked={form.is_active}
                                        onChange={onChange}
                                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                                    />
                                    <label
                                        htmlFor="modal_customer_is_active"
                                        className="text-xs font-semibold text-slate-700 select-none cursor-pointer"
                                    >
                                        Status Pelanggan Aktif
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Kontak PIC & Alamat */}
                        <div className="space-y-3.5">
                            <div className="p-3.5 bg-slate-50/80 rounded-md border border-slate-200 space-y-3 shadow-2xs">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/80 pb-2">
                                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Kontak & Alamat Pengiriman</span>
                                </div>

                                {/* Contact Person */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Penanggung Jawab / PIC
                                    </label>
                                    <input
                                        type="text"
                                        name="contact_person"
                                        value={form.contact_person || ""}
                                        onChange={onChange}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder-slate-400 font-medium"
                                        placeholder="Contoh: Bpk. Bambang Sutrisno / Ibu Ratna"
                                    />
                                </div>

                                {/* Phone & Email Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            No. Telepon / WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={form.phone || ""}
                                            onChange={onChange}
                                            className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder-slate-400 font-medium"
                                            placeholder="0812-xxxx-xxxx"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email || ""}
                                            onChange={onChange}
                                            className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder-slate-400 font-medium"
                                            placeholder="kontak@pelanggan.com"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Alamat Lengkap / Pengiriman
                                    </label>
                                    <textarea
                                        name="address"
                                        value={form.address || ""}
                                        onChange={onChange}
                                        rows={2}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none placeholder-slate-400 font-medium"
                                        placeholder="Jl. Budi Utomo No.7, Jakarta..."
                                    />
                                </div>

                                {/* Notes / Catatan */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Catatan / Keterangan Tambahan
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={form.notes || ""}
                                        onChange={onChange}
                                        rows={2}
                                        className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none placeholder-slate-400 font-medium"
                                        placeholder="Catatan khusus, instruksi, atau keterangan lainnya..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            title="Batal"
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            title={
                                submitting
                                    ? "Memproses..."
                                    : isEditing
                                      ? "Simpan"
                                      : "Simpan"
                            }
                            className="w-8 h-8 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-md border border-teal-700/20 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Save
                                className={`w-4 h-4 ${
                                    submitting ? "animate-pulse" : ""
                                }`}
                            />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default CustomerModal;
