import React, { memo } from "react";
import Pagination from "@/Components/Pagination";
import {
    Edit2,
    Trash2,
    Eye,
    Users,
    MapPin,
    Phone,
    User,
    Building,
    Landmark,
    Briefcase,
    UserCheck
} from "lucide-react";

const CustomerTable = memo(function CustomerTable({
    items = [],
    loading = false,
    canUpdate = false,
    canDelete = false,
    startIndex = 0,
    totalItems = 0,
    itemsPerPage = 10,
    currentPage = 1,
    onPageChange,
    onItemsPerPageChange,
    onViewDetail,
    onEdit,
    onDelete,
}) {
    const getTypeBadge = (type) => {
        const t = (type || "").toUpperCase();
        if (t.includes("SEKOLAH") || t.includes("PENDIDIKAN")) {
            return {
                style: "bg-sky-50 text-sky-700 border-sky-200",
                icon: <Building className="w-3 h-3 shrink-0" />,
            };
        }
        if (t.includes("INSTANSI") || t.includes("PEMERINTAH") || t.includes("DINAS")) {
            return {
                style: "bg-purple-50 text-purple-700 border-purple-200",
                icon: <Landmark className="w-3 h-3 shrink-0" />,
            };
        }
        if (t.includes("PERUSAHAAN") || t.includes("SWASTA") || t.includes("KORPORASI")) {
            return {
                style: "bg-indigo-50 text-indigo-700 border-indigo-200",
                icon: <Briefcase className="w-3 h-3 shrink-0" />,
            };
        }
        if (t.includes("KOMUNITAS") || t.includes("ORGANISASI") || t.includes("EVENT")) {
            return {
                style: "bg-amber-50 text-amber-800 border-amber-200",
                icon: <Users className="w-3 h-3 shrink-0" />,
            };
        }
        if (t.includes("PERORANGAN") || t.includes("INDIVIDU") || t.includes("PRIBADI")) {
            return {
                style: "bg-teal-50 text-teal-700 border-teal-200",
                icon: <User className="w-3 h-3 shrink-0" />,
            };
        }
        return {
            style: "bg-slate-100 text-slate-700 border-slate-200",
            icon: <UserCheck className="w-3 h-3 shrink-0" />,
        };
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-2.5 px-3.5 w-12 text-center">No</th>
                            <th className="py-2.5 px-3.5 min-w-[220px]">Pelanggan / Pemesan</th>
                            <th className="py-2.5 px-3.5 w-44">Tipe</th>
                            <th className="py-2.5 px-3.5 min-w-[180px]">Kontak & PIC</th>
                            <th className="py-2.5 px-3.5 min-w-[200px]">Alamat / Wilayah</th>
                            <th className="py-2.5 px-3.5 w-24 text-center">Status</th>
                            <th className="py-2.5 px-3.5 w-28 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                                        <span>Memuat data pelanggan...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-400">
                                    <Users className="w-8 h-8 mx-auto mb-1.5 text-slate-300" />
                                    <span>Tidak ada data pelanggan ditemukan.</span>
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => {
                                const badgeInfo = getTypeBadge(item.type);
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                        {/* No */}
                                        <td className="py-2.5 px-3.5 text-center text-slate-400 font-mono">
                                            {startIndex + index + 1}
                                        </td>

                                        {/* Customer Code & Name */}
                                        <td className="py-2.5 px-3.5">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="bg-slate-100 text-slate-800 font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border border-slate-200">
                                                    {item.code}
                                                </span>
                                                {item.institution_name && item.institution_name !== item.name && (
                                                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[160px]">
                                                        {item.institution_name}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onViewDetail?.(item)}
                                                className="font-semibold text-slate-900 hover:text-teal-600 transition-colors text-left cursor-pointer truncate max-w-[260px] block"
                                                title="Klik untuk melihat detail lengkap"
                                            >
                                                {item.name}
                                            </button>
                                        </td>

                                        {/* Type Badge */}
                                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badgeInfo.style}`}
                                            >
                                                {badgeInfo.icon}
                                                <span>{item.type || "Perorangan"}</span>
                                            </span>
                                        </td>

                                        {/* PIC & Phone */}
                                        <td className="py-2.5 px-3.5 space-y-0.5">
                                            {item.contact_person ? (
                                                <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                                                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[170px]">{item.contact_person}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">-</span>
                                            )}
                                            {item.phone && (
                                                <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                                                    <Phone className="w-3 h-3 text-teal-600 shrink-0" />
                                                    <span>{item.phone}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Address / Location (Clean single-line truncate) */}
                                        <td className="py-2.5 px-3.5">
                                            {item.address ? (
                                                <div className="flex items-center gap-1.5 text-slate-600" title={item.address}>
                                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[220px] text-[11px]">{item.address}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">-</span>
                                            )}
                                        </td>

                                        {/* Active Status */}
                                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                                            {item.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </td>

                                        {/* Action Buttons (Consistent with other tables) */}
                                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1">
                                                {/* View Detail Button (Sky) */}
                                                <button
                                                    type="button"
                                                    onClick={() => onViewDetail?.(item)}
                                                    title="Detail"
                                                    className="w-7 h-7 inline-flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition-all duration-200 border border-sky-200/80 cursor-pointer shadow-soft-2xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Edit Button (Indigo) */}
                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onEdit(item)}
                                                        title="Edit"
                                                        className="w-7 h-7 inline-flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all duration-200 border border-indigo-200/80 cursor-pointer shadow-soft-2xs"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {/* Delete Button (Rose) */}
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(item)}
                                                        title="Hapus"
                                                        className="w-7 h-7 inline-flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-all duration-200 border border-rose-200/80 cursor-pointer shadow-soft-2xs"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Component */}
            {totalItems > 0 && onPageChange && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                    onItemsPerPageChange={onItemsPerPageChange}
                />
            )}
        </div>
    );
});

export default CustomerTable;
