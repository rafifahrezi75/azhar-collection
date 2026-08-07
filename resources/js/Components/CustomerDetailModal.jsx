import React, { memo } from "react";
import {
    X,
    Users,
    Building,
    Landmark,
    Briefcase,
    User,
    UserCheck,
    Phone,
    Mail,
    MapPin,
    FileText,
    Calendar,
    Edit2,
    CheckCircle2,
    XCircle,
    ExternalLink
} from "lucide-react";

const CustomerDetailModal = memo(function CustomerDetailModal({
    isOpen,
    customer,
    canEdit = false,
    onClose,
    onEdit,
}) {
    if (!isOpen || !customer) return null;

    const getTypeBadge = (type) => {
        const t = (type || "").toUpperCase();
        if (t.includes("SEKOLAH") || t.includes("PENDIDIKAN")) {
            return {
                style: "bg-sky-50 text-sky-700 border-sky-200",
                icon: <Building className="w-3.5 h-3.5 shrink-0" />,
            };
        }
        if (t.includes("INSTANSI") || t.includes("PEMERINTAH") || t.includes("DINAS")) {
            return {
                style: "bg-purple-50 text-purple-700 border-purple-200",
                icon: <Landmark className="w-3.5 h-3.5 shrink-0" />,
            };
        }
        if (t.includes("PERUSAHAAN") || t.includes("SWASTA") || t.includes("KORPORASI")) {
            return {
                style: "bg-indigo-50 text-indigo-700 border-indigo-200",
                icon: <Briefcase className="w-3.5 h-3.5 shrink-0" />,
            };
        }
        if (t.includes("KOMUNITAS") || t.includes("ORGANISASI") || t.includes("EVENT")) {
            return {
                style: "bg-amber-50 text-amber-800 border-amber-200",
                icon: <Users className="w-3.5 h-3.5 shrink-0" />,
            };
        }
        if (t.includes("PERORANGAN") || t.includes("INDIVIDU") || t.includes("PRIBADI")) {
            return {
                style: "bg-teal-50 text-teal-700 border-teal-200",
                icon: <User className="w-3.5 h-3.5 shrink-0" />,
            };
        }
        return {
            style: "bg-slate-100 text-slate-700 border-slate-200",
            icon: <UserCheck className="w-3.5 h-3.5 shrink-0" />,
        };
    };

    const typeBadge = getTypeBadge(customer.type);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 shadow-xl space-y-5 border border-slate-200 animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar">
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                                    {customer.name}
                                </h3>
                                <span className="bg-slate-100 text-slate-700 font-mono font-bold text-xs px-2 py-0.5 rounded border border-slate-200">
                                    {customer.code}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${typeBadge.style}`}
                                >
                                    {typeBadge.icon}
                                    <span>{customer.type || "Perorangan"}</span>
                                </span>
                                {customer.is_active ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        Aktif
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                        <XCircle className="w-3 h-3 text-slate-400" />
                                        Nonaktif
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Tutup Detail"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Details Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: Identitas & Afiliasi */}
                    <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                            Identitas Pemesan
                        </h4>
                        <div>
                            <span className="text-[11px] text-slate-500 font-medium block">Nama Pelanggan / Lembaga</span>
                            <span className="text-xs font-semibold text-slate-900">{customer.name}</span>
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-500 font-medium block">Tipe Pemesan</span>
                            <span className="text-xs font-semibold text-slate-900">{customer.type || "Perorangan"}</span>
                        </div>
                        {customer.institution_name && (
                            <div>
                                <span className="text-[11px] text-slate-500 font-medium block">Nama Instansi / Afiliasi / Divisi</span>
                                <span className="text-xs font-semibold text-slate-900">{customer.institution_name}</span>
                            </div>
                        )}
                    </div>

                    {/* Card 2: Kontak & PIC */}
                    <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                            Kontak & PIC
                        </h4>
                        <div>
                            <span className="text-[11px] text-slate-500 font-medium block">Penanggung Jawab / PIC</span>
                            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                {customer.contact_person || "-"}
                            </span>
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-500 font-medium block">No. Telepon / WhatsApp</span>
                            {customer.phone ? (
                                <span className="text-xs font-mono font-semibold text-teal-700 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                                    {customer.phone}
                                </span>
                            ) : (
                                <span className="text-xs text-slate-400 italic">-</span>
                            )}
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-500 font-medium block">Email</span>
                            {customer.email ? (
                                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    {customer.email}
                                </span>
                            ) : (
                                <span className="text-xs text-slate-400 italic">-</span>
                            )}
                        </div>
                    </div>

                    {/* Card 3: Alamat Lengkap (Full Width) */}
                    <div className="md:col-span-2 p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            Alamat Lengkap / Pengiriman
                        </h4>
                        <p className="text-xs text-slate-800 leading-relaxed font-medium">
                            {customer.address || <span className="text-slate-400 italic">Tidak ada alamat tercatat.</span>}
                        </p>
                    </div>

                    {/* Card 4: Catatan / Keterangan (Full Width) */}
                    <div className="md:col-span-2 p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            Catatan / Keterangan
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                            {customer.notes || <span className="text-slate-400 italic">Tidak ada catatan tambahan.</span>}
                        </p>
                    </div>
                </div>

                {/* Metadata & Timestamps */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Dibuat: {formatDate(customer.created_at)}</span>
                    </div>
                    {customer.updated_at && (
                        <span>Terakhir diperbarui: {formatDate(customer.updated_at)}</span>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onEdit(customer);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Data Pelanggan</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

export default CustomerDetailModal;
