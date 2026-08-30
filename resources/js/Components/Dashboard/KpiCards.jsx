import React, { memo } from "react";
import { TrendingUp, Receipt, Wallet, ShoppingBag } from "lucide-react";
import { formatRupiah, formatMoneyShort, GrowthChip, Skeleton } from "./dashboardShared";

const KpiCards = memo(function KpiCards({ kpi, loading = false }) {
    if (loading || !kpi) {
        return (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((n) => (
                    <Skeleton key={n} className="h-24" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            icon: TrendingUp,
            title: "Omzet Tahun Ini",
            value: formatRupiah(kpi.current_revenue),
            sub: <GrowthChip growth={kpi.revenue_growth} />,
            iconCls: "bg-teal-50 text-teal-600",
        },
        {
            icon: Wallet,
            title: "Piutang Outstanding",
            value: formatRupiah(kpi.outstanding_amount),
            sub: (
                <span className="text-[10px] text-slate-400">
                    Tertagih {formatMoneyShort(kpi.current_paid)}
                </span>
            ),
            iconCls: "bg-rose-50 text-rose-600",
        },
        {
            icon: Receipt,
            title: "Jumlah Invoice",
            value: new Intl.NumberFormat("id-ID").format(kpi.current_invoices),
            sub: <GrowthChip growth={kpi.invoice_growth} />,
            iconCls: "bg-indigo-50 text-indigo-600",
        },
        {
            icon: ShoppingBag,
            title: "Rata-rata Nilai Order",
            value: formatRupiah(kpi.average_order_value),
            sub: (
                <span className="text-[10px] text-slate-400">
                    Qty {new Intl.NumberFormat("id-ID").format(kpi.current_qty)} pcs
                </span>
            ),
            iconCls: "bg-amber-50 text-amber-600",
        },
    ];

    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {cards.map((c) => (
                <div
                    key={c.title}
                    className="bg-white rounded-xl border border-slate-200/60 shadow-soft-xs p-4 flex flex-col gap-2"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {c.title}
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.iconCls}`}>
                            <c.icon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-900 font-mono leading-tight truncate" title={c.value}>
                        {c.value}
                    </div>
                    <div>{c.sub}</div>
                </div>
            ))}
        </div>
    );
});

export default KpiCards;
