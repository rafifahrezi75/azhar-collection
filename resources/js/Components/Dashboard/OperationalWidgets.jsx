import React, { memo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { PackageX, ArrowDownToDot, ArrowUpFromLine, Layers, History } from "lucide-react";
import { Card, EmptyState, formatCompact } from "./dashboardShared";

export const ActivityTrendWidget = memo(function ActivityTrendWidget({ trend = [], loading = false }) {
    return (
        <Card
            title="Aktivitas Stok 7 Hari"
            subtitle="Masuk vs keluar gudang"
            right={<History className="w-4 h-4 text-slate-300" />}
        >
            {loading ? (
                <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
            ) : trend.length === 0 ? (
                <EmptyState message="Belum ada aktivitas." />
            ) : (
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={trend} margin={{ top: 4, right: 0, left: -22, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="short_label"
                            tick={{ fontSize: 9, fill: "#94a3b8" }}
                            axisLine={{ stroke: "#e2e8f0" }}
                            tickLine={false}
                        />
                        <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompact(v)} />
                        <Tooltip
                            contentStyle={{
                                fontSize: 11,
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="in_qty" name="Masuk" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={14} />
                        <Bar dataKey="out_qty" name="Keluar" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={14} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
});

export const CriticalStockWidget = memo(function CriticalStockWidget({ items = [], loading = false }) {
    return (
        <Card
            title="Stok Kritis"
            subtitle="5 bahan paling butuh restock"
            right={<PackageX className="w-4 h-4 text-slate-300" />}
        >
            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((n) => <div key={n} className="h-10 animate-pulse rounded bg-slate-100" />)}</div>
            ) : items.length === 0 ? (
                <EmptyState message="Semua stok aman." />
            ) : (
                <ul className="space-y-3">
                    {items.map((it) => {
                        const barColor =
                            it.is_out_of_stock || it.health_ratio <= 25
                                ? "bg-rose-500"
                                : it.health_ratio <= 60
                                ? "bg-amber-400"
                                : "bg-emerald-500";
                        return (
                            <li key={it.id}>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-xs font-semibold text-slate-700 truncate">
                                        {it.name}
                                        <span className="text-[10px] font-normal text-slate-400 ml-1.5">{it.category_name}</span>
                                    </span>
                                    <span
                                        className={`text-[11px] font-bold font-mono shrink-0 ${
                                            it.is_out_of_stock ? "text-rose-600" : "text-slate-700"
                                        }`}
                                    >
                                        {it.stock} {it.unit_symbol}
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.max(3, it.health_ratio)}%` }} />
                                </div>
                                {it.is_out_of_stock && (
                                    <div className="text-[10px] font-bold text-rose-600 mt-0.5">STOK HABIS</div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
});

export const CategoryDonutWidget = memo(function CategoryDonutWidget({ categories = [], loading = false }) {
    return (
        <Card
            title="Kategori Bahan"
            subtitle="Komposisi item per kategori"
            right={<Layers className="w-4 h-4 text-slate-300" />}
        >
            {loading ? (
                <div className="h-36 animate-pulse rounded-lg bg-slate-100" />
            ) : categories.length === 0 ? (
                <EmptyState message="Belum ada kategori." />
            ) : (
                <>
                    <div className="relative h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categories}
                                    dataKey="items_count"
                                    nameKey="name"
                                    innerRadius={40}
                                    outerRadius={62}
                                    paddingAngle={2}
                                    strokeWidth={0}
                                >
                                    {categories.map((c) => (
                                        <Cell key={c.id} fill={c.color} cursor="pointer" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 11,
                                        borderRadius: 8,
                                        border: "1px solid #e2e8f0",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-lg font-bold text-slate-800">
                                {formatCompact(categories.reduce((s, c) => s + (c.total_stock || 0), 0))}
                            </span>
                            <span className="text-[10px] text-slate-400">total stok</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                        {categories.slice(0, 6).map((c) => (
                            <div key={c.id} className="flex items-center gap-1.5 text-[11px] min-w-0">
                                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: c.color }} />
                                <span className="text-slate-600 truncate flex-1">{c.name}</span>
                                <span className="text-slate-400 shrink-0">{c.items_count}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Card>
    );
});

const MUTATION_STYLE = {
    in: { label: "Masuk", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: ArrowDownToDot },
    out: { label: "Keluar", cls: "bg-rose-50 text-rose-700 border-rose-200", icon: ArrowUpFromLine },
};

export const RecentMutationsWidget = memo(function RecentMutationsWidget({ mutations = [], loading = false }) {
    return (
        <Card
            title="Mutasi Stok Terkini"
            subtitle="6 transaksi terakhir"
            right={<ArrowUpFromLine className="w-4 h-4 text-slate-300" />}
        >
            {loading ? (
                <div className="space-y-2">{[1, 2, 3].map((n) => <div key={n} className="h-10 animate-pulse rounded bg-slate-100" />)}</div>
            ) : mutations.length === 0 ? (
                <EmptyState message="Belum ada mutasi." />
            ) : (
                <ul className="divide-y divide-slate-100 -mx-1">
                    {mutations.map((m) => {
                        const cfg = MUTATION_STYLE[m.type] || MUTATION_STYLE.in;
                        const Icon = cfg.icon;
                        return (
                            <li key={m.id} className="flex items-start gap-2.5 py-2 px-1">
                                <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${cfg.cls}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-slate-700 truncate">{m.item_name}</div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                        {cfg.label} · {m.quantity} {m.unit_symbol} · {m.user_name} · {m.time_ago}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
});
