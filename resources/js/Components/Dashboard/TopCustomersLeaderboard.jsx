import React, { useMemo, memo } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, formatMoneyShort, EmptyState } from "./dashboardShared";

const TopCustomersLeaderboard = memo(function TopCustomersLeaderboard({
    customers = [],
    year,
    selectedCustomerId,
    onSelectCustomer,
    loading = false,
}) {
    const rows = useMemo(() => {
        return customers
            .map((c) => {
                const cur = c.years?.find((y) => y.year === year);
                const prevYearData = c.years
                    ?.filter((y) => y.year < year)
                    .sort((a, b) => b.year - a.year)[0];
                const curVal = cur?.total_amount || 0;
                const prevVal = prevYearData?.total_amount || 0;
                const growth =
                    prevVal > 0 ? Math.round(((curVal - prevVal) / prevVal) * 100) : null;
                return {
                    id: c.customer_id,
                    name: c.name,
                    institution: c.institution_name,
                    revenue: curVal,
                    invoices: cur?.invoices || 0,
                    growth,
                };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [customers, year]);

    return (
        <Card
            title="Top 5 Pelanggan"
            subtitle={`Omzet ${year} + perbandingan tahun sebelumnya`}
            right={<Trophy className="w-4 h-4 text-amber-400" />}
            className="h-full"
        >
            {loading ? (
                <div className="space-y-3">{[1, 2, 3, 4, 5].map((n) => <div key={n} className="h-9 animate-pulse rounded bg-slate-100" />)}</div>
            ) : rows.length === 0 ? (
                <EmptyState message="Belum ada data pelanggan." />
            ) : (
                <ul className="space-y-1.5">
                    {rows.map((r, i) => {
                        const active = String(r.id) === String(selectedCustomerId);
                        return (
                            <li key={r.id}>
                                <button
                                    type="button"
                                    onClick={() => onSelectCustomer(String(r.id))}
                                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all text-left cursor-pointer group ${
                                        active ? "bg-teal-50 border border-teal-200" : "hover:bg-slate-50 border border-transparent"
                                    }`}
                                >
                                    <span
                                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                            i === 0
                                                ? "bg-amber-100 text-amber-700"
                                                : i === 1
                                                ? "bg-slate-200 text-slate-600"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-slate-800 truncate">{r.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate">
                                            {r.invoices} invoice{r.institution ? ` · ${r.institution}` : ""}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs font-bold text-slate-800 font-mono">
                                            {formatMoneyShort(r.revenue)}
                                        </div>
                                        <div
                                            className={`text-[10px] font-bold inline-flex items-center gap-0.5 justify-end ${
                                                r.growth === null
                                                    ? "text-slate-300"
                                                    : r.growth >= 0
                                                    ? "text-emerald-600"
                                                    : "text-rose-600"
                                            }`}
                                        >
                                            {r.growth === null ? (
                                                <>
                                                    <Minus className="w-2.5 h-2.5" /> baru
                                                </>
                                            ) : r.growth >= 0 ? (
                                                <>
                                                    <TrendingUp className="w-2.5 h-2.5" /> {r.growth}%
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingDown className="w-2.5 h-2.5" /> {Math.abs(r.growth)}%
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
});

export default TopCustomersLeaderboard;
