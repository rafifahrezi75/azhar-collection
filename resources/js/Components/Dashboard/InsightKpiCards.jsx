import React from "react";
import { TrendingUp, Wallet, AlertCircle, CheckCircle2, Layers, Scissors, ShieldAlert } from "lucide-react";
import { formatRupiah } from "@/utils/format";

export default function InsightKpiCards({ kpi, spkStats, canViewAnalytics, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-md border border-slate-200 shadow-2xs p-4 h-28 animate-pulse flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="h-3 w-24 bg-slate-200 rounded" />
                            <div className="w-7 h-7 rounded-md bg-slate-200" />
                        </div>
                        <div className="h-7 w-36 bg-slate-200 rounded" />
                        <div className="h-3 w-28 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (!canViewAnalytics) {
        const cards = [
            {
                title: "SPK Berjalan",
                value: `${spkStats?.spk_in_progress || 0} SPK`,
                sub: "Dalam proses produksi jahit",
                icon: Scissors,
                iconCls: "bg-indigo-50 text-indigo-700",
            },
            {
                title: "SPK Menunggu",
                value: `${spkStats?.spk_pending || 0} SPK`,
                sub: "Antrean belum dimulai",
                icon: AlertCircle,
                iconCls: "bg-amber-50 text-amber-700",
            },
            {
                title: "SPK Selesai",
                value: `${spkStats?.spk_completed || 0} SPK`,
                sub: "Produksi rampung",
                icon: CheckCircle2,
                iconCls: "bg-emerald-50 text-emerald-700",
            },
            {
                title: "Output Pcs Bulan Ini",
                value: `${kpi?.monthly_production_output || 0} pcs`,
                sub: "Hasil pengerjaan penjahit",
                icon: Layers,
                iconCls: "bg-teal-50 text-teal-700",
            },
        ];

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.map((c, idx) => {
                    const Icon = c.icon;
                    return (
                        <div key={idx} className="bg-white rounded-md border border-slate-200 shadow-2xs p-4 flex flex-col justify-between h-28">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.title}</span>
                                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${c.iconCls}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                                {c.value}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                                {c.sub}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    const cards = [
        {
            title: "Omzet Bulan Ini",
            value: formatRupiah(kpi?.monthly_omset || 0),
            sub: `${kpi?.monthly_invoices_count || 0} invoice diterbitkan`,
            icon: TrendingUp,
            iconCls: "bg-teal-50 text-teal-700",
        },
        {
            title: "Kas Masuk / Realisasi",
            value: formatRupiah(kpi?.monthly_cash_in || 0),
            sub: (
                <span className="inline-flex items-center gap-1">
                    <span className="font-semibold text-emerald-700">{kpi?.collection_rate || 0}%</span>
                    <span>terkumpul dari omzet</span>
                </span>
            ),
            icon: Wallet,
            iconCls: "bg-emerald-50 text-emerald-700",
        },
        {
            title: "Sisa Piutang Berjalan",
            value: formatRupiah(kpi?.monthly_receivables || 0),
            sub: `${kpi?.unpaid_invoices_count || 0} invoice belum lunas`,
            icon: AlertCircle,
            iconCls: "bg-rose-50 text-rose-700",
        },
        {
            title: "Output Produksi Selesai",
            value: `${kpi?.monthly_production_output || 0} pcs`,
            sub: "Total hasil jahit bulan ini",
            icon: Layers,
            iconCls: "bg-sky-50 text-sky-700",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((c, idx) => {
                const Icon = c.icon;
                return (
                    <div key={idx} className="bg-white rounded-md border border-slate-200 shadow-2xs p-4 flex flex-col justify-between h-28">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.title}</span>
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center ${c.iconCls}`}>
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                        </div>
                            <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                                {c.value}
                            </div>
                        <div className="text-[11px] text-slate-500 truncate">
                            {c.sub}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
