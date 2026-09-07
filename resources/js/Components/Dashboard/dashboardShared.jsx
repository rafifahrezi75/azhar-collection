import React, { memo } from "react";
import { formatRupiah, formatDate, formatDateWithDay } from "@/utils/format";

export const BRAND_COLOR = "#800080";

export const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const MONTH_FULL = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const formatCompact = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(val);
};

export const formatMoneyShort = (val) => {
    if (!val) return "Rp 0";
    return `Rp ${formatCompact(val)}`;
};

const norm = (s) => String(s || "").toLowerCase().trim();

export const PAYMENT_BADGES = {
    lunas: { label: "Lunas", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    dp: { label: "DP / Sebagian", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    partial: { label: "DP / Sebagian", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    belum_bayar: { label: "Belum Bayar", cls: "bg-rose-50 text-rose-700 border-rose-200" },
    belum_lunas: { label: "Belum Lunas", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

export const PRODUCTION_BADGES = {
    pending: { label: "Pending", cls: "bg-slate-100 text-slate-700 border-slate-200" },
    potong: { label: "Potong", cls: "bg-sky-50 text-sky-700 border-sky-200" },
    jahit: { label: "Jahit", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    qc: { label: "QC", cls: "bg-violet-50 text-violet-700 border-violet-200" },
    proses: { label: "Diproses", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    selesai: { label: "Selesai", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    dikirim: { label: "Dikirim", cls: "bg-teal-50 text-teal-700 border-teal-200" },
};

export const StatusBadge = memo(function StatusBadge({ map, value }) {
    const cfg = map[norm(value)] || { label: value || "-", cls: "bg-slate-100 text-slate-600 border-slate-200" };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
});

export const PaymentBadge = ({ value }) => <StatusBadge map={PAYMENT_BADGES} value={value} />;
export const ProductionBadge = ({ value }) => <StatusBadge map={PRODUCTION_BADGES} value={value} />;

export const GrowthChip = memo(function GrowthChip({ growth, suffix = "%" }) {
    if (growth === null || growth === undefined || isNaN(growth)) return null;
    const up = growth >= 0;
    return (
        <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                up ? "text-emerald-600" : "text-rose-600"
            }`}
        >
            {up ? "▲" : "▼"} {Math.abs(growth)}
            {suffix}
        </span>
    );
});

export function Card({ title, subtitle, icon: Icon, right, children, className = "" }) {
    return (
        <div className={`bg-white rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between ${className}`}>
            {(title || right || Icon) && (
                <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                        {Icon && (
                            <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                        )}
                        <div className="min-w-0">
                            {title && <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">{title}</h3>}
                            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>}
                        </div>
                    </div>
                    {right}
                </div>
            )}
            <div className={title || Icon ? "p-4 flex-1 flex flex-col justify-between" : "p-4 flex-1"}>{children}</div>
        </div>
    );
}

export function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />;
}

export function EmptyState({ message }) {
    return (
        <div className="py-10 text-center">
            <p className="text-sm text-slate-400 italic">{message}</p>
        </div>
    );
}

export { formatRupiah, formatDate, formatDateWithDay };
