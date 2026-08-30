import React, { memo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Package, CreditCard, Scissors } from "lucide-react";
import { Card, formatMoneyShort, formatRupiah, EmptyState, PRODUCTION_BADGES } from "./dashboardShared";

export const TopProductsChart = memo(function TopProductsChart({ products = [], loading = false }) {
    return (
        <Card
            title="Top 5 Produk Terlaris"
            subtitle="Berdasarkan omzet tahun berjalan"
            right={<Package className="w-4 h-4 text-slate-300" />}
        >
            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((n) => <div key={n} className="h-8 animate-pulse rounded bg-slate-100" />)}</div>
            ) : products.length === 0 ? (
                <EmptyState message="Belum ada data produk." />
            ) : (
                <div className="space-y-3">
                    {products.map((p, i) => (
                        <div key={i}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-semibold text-slate-700 truncate">
                                    {i + 1}. {p.name}
                                </span>
                                <span className="text-[11px] font-bold text-teal-700 font-mono shrink-0">
                                    {formatMoneyShort(p.total_revenue)}
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.max(4, p.revenue_percentage || 0)}%`,
                                        background: i === 0 ? "#800080" : i === 1 ? "#a33ba3" : i === 2 ? "#c46ec4" : "#df9edf",
                                    }}
                                />
                            </div>
                            <div className="flex justify-between mt-0.5 text-[10px] text-slate-400">
                                <span>{p.total_qty} pcs</span>
                                <span>{p.revenue_percentage}% dari omzet</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
});

const DonutTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white/95 border border-slate-200 rounded-lg shadow-soft-md px-3 py-2 text-xs">
            <div className="font-bold text-slate-800">{d.label}</div>
            <div className="text-slate-500">{d.count} invoice</div>
            <div className="font-semibold text-slate-700">{formatRupiah(d.total)}</div>
        </div>
    );
};

export const PaymentStatusDonut = memo(function PaymentStatusDonut({ breakdown = {}, loading = false }) {
    const data = Object.values(breakdown).map((d) => ({ ...d, value: d.count }));

    return (
        <Card
            title="Status Pembayaran"
            subtitle="Komposisi invoice tahun berjalan"
            right={<CreditCard className="w-4 h-4 text-slate-300" />}
        >
            {loading ? (
                <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
            ) : data.every((d) => !d.value) ? (
                <EmptyState message="Belum ada invoice." />
            ) : (
                <>
                    <div className="relative h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="label"
                                    innerRadius={48}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    strokeWidth={0}
                                >
                                    {data.map((d) => (
                                        <Cell key={d.label} fill={d.color} cursor="pointer" />
                                    ))}
                                </Pie>
                                <Tooltip content={<DonutTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-bold text-slate-800">
                                {data.reduce((s, d) => s + (d.value || 0), 0)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">invoice</span>
                        </div>
                    </div>
                    <div className="space-y-1.5 mt-2">
                        {data.map((d) => (
                            <div key={d.label} className="flex items-center gap-2 text-xs">
                                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                                <span className="text-slate-600 flex-1 truncate">{d.label}</span>
                                <span className="text-slate-400">{d.count}</span>
                                <span className="font-semibold text-slate-700 font-mono w-24 text-right">
                                    {formatMoneyShort(d.total)}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Card>
    );
});

const normKey = (s) => String(s || "").toLowerCase().trim();

export const ProductionStatusBreakdown = memo(function ProductionStatusBreakdown({
    statuses = [],
    loading = false,
}) {
    const maxCount = Math.max(1, ...statuses.map((s) => s.count || 0));
    const total = statuses.reduce((s, x) => s + (x.count || 0), 0);

    return (
        <Card
            title="Status Produksi"
            subtitle="Distribusi pesanan tahun berjalan"
            right={<Scissors className="w-4 h-4 text-slate-300" />}
        >
            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((n) => <div key={n} className="h-6 animate-pulse rounded bg-slate-100" />)}</div>
            ) : total === 0 ? (
                <EmptyState message="Belum ada pesanan." />
            ) : (
                <div className="space-y-2.5">
                    {statuses.map((s) => {
                        const badge = PRODUCTION_BADGES[normKey(s.key)] || {};
                        return (
                            <div key={s.key}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.cls || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                        {s.label}
                                    </span>
                                    <span className="font-bold text-slate-700">
                                        {s.count}
                                        <span className="text-slate-400 font-medium ml-1">
                                            ({total > 0 ? Math.round((s.count / total) * 100) : 0}%)
                                        </span>
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(s.count / maxCount) * 100}%`,
                                            background: s.color,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
});
