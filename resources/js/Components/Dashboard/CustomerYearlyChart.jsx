import React, { useState, useMemo, memo } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList,
} from "recharts";
import { BarChart3, LineChart as LineChartIcon, MousePointerClick } from "lucide-react";
import {
    BRAND_COLOR,
    formatCompact,
    formatMoneyShort,
    formatRupiah,
    GrowthChip,
} from "./dashboardShared";

export const METRICS = [
    { key: "total_amount", label: "Omzet", type: "currency" },
    { key: "qty", label: "Qty", type: "number" },
    { key: "invoices", label: "Invoice", type: "number" },
    { key: "paid_rate", label: "Rasio Bayar", type: "percent" },
    { key: "fulfill_rate", label: "Rasio Produksi", type: "percent" },
];

const formatByType = (val, type) => {
    if (type === "currency") return formatRupiah(val);
    if (type === "percent") return `${val || 0}%`;
    return new Intl.NumberFormat("id-ID").format(val || 0);
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-soft-md px-3 py-2.5 text-xs space-y-1 min-w-[190px]">
            <div className="font-bold text-slate-800 text-sm mb-1">{d.year}</div>
            <div className="flex justify-between gap-4">
                <span className="text-slate-500">Omzet</span>
                <span className="font-semibold text-slate-800">{formatMoneyShort(d.total_amount)}</span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-slate-500">Tertagih</span>
                <span className="font-medium text-emerald-600">{formatMoneyShort(d.paid_amount)}</span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-slate-500">Outstanding</span>
                <span className="font-medium text-rose-600">{formatMoneyShort(d.outstanding)}</span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-slate-500">Qty / Invoice</span>
                <span className="font-medium text-slate-700">
                    {new Intl.NumberFormat("id-ID").format(d.qty)} / {d.invoices}
                </span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-slate-500">Rasio Bayar</span>
                <span className="font-medium text-slate-700">{d.paid_rate}%</span>
            </div>
        </div>
    );
};

const CustomerYearlyChart = memo(function CustomerYearlyChart({
    data = [],
    compareData = null,
    loading = false,
    onBarClick,
}) {
    const [metricKey, setMetricKey] = useState("total_amount");
    const [chartType, setChartType] = useState("bar");

    const metric = METRICS.find((m) => m.key === metricKey) || METRICS[0];

    const rows = useMemo(
        () =>
            data.map((d, i) => {
                const cur = d[metric.key] ?? 0;
                const prev = i > 0 ? data[i - 1][metric.key] ?? 0 : null;
                let growth = null;
                if (prev !== null) {
                    growth = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? 100 : 0;
                }
                return {
                    ...d,
                    value: cur,
                    compare_value: compareData ? compareData[i]?.[metric.key] ?? null : undefined,
                    growth,
                };
            }),
        [data, metric, compareData]
    );

    const growthLabel = ({ x, y, width, index }) => {
        const row = rows[index];
        if (!row || row.growth === null || row.growth === undefined) return null;
        const up = row.growth >= 0;
        return (
            <text
                x={x + width / 2}
                y={y - 6}
                fill={up ? "#059669" : "#e11d48"}
                fontSize={9}
                fontWeight={700}
                textAnchor="middle"
            >
                {up ? "▲" : "▼"} {Math.abs(row.growth)}%
            </text>
        );
    };

    if (loading) {
        return <div className="h-64 animate-pulse rounded-lg bg-slate-100" />;
    }

    if (!data.length) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-10 h-10 text-slate-200 mb-2" />
                <p className="text-sm text-slate-400 italic">Belum ada data transaksi untuk pelanggan ini.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap gap-1">
                    {METRICS.map((m) => (
                        <button
                            key={m.key}
                            type="button"
                            onClick={() => setMetricKey(m.key)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                metricKey === m.key
                                    ? "bg-teal-600 text-white shadow-soft-xs"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                    <button
                        type="button"
                        onClick={() => setChartType("bar")}
                        title="Bar Chart"
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                            chartType === "bar" ? "bg-white text-teal-600 shadow-soft-2xs" : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setChartType("line")}
                        title="Line Chart"
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                            chartType === "line" ? "bg-white text-teal-600 shadow-soft-2xs" : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <LineChartIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={rows} margin={{ top: 18, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => (metric.type === "currency" ? formatCompact(v) : formatCompact(v))}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(128,0,128,0.05)" }} />

                    {chartType === "bar" ? (
                        <Bar
                            dataKey="value"
                            fill={BRAND_COLOR}
                            radius={[5, 5, 0, 0]}
                            maxBarSize={56}
                            cursor={onBarClick ? "pointer" : "default"}
                            onClick={(entry) => {
                                const payload = entry?.payload ?? entry;
                                if (onBarClick && payload?.year) onBarClick(payload.year);
                            }}
                        >
                            <LabelList dataKey="value" content={growthLabel} />
                        </Bar>
                    ) : (
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={BRAND_COLOR}
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: BRAND_COLOR, cursor: onBarClick ? "pointer" : "default" }}
                            activeDot={{ r: 6 }}
                            onClick={(entry) => {
                                const payload = entry?.payload ?? entry;
                                if (onBarClick && payload?.year) onBarClick(payload.year);
                            }}
                        />
                    )}

                    {compareData && compareData.length > 0 && (
                        <>
                            <Line
                                type="monotone"
                                dataKey="compare_value"
                                stroke="#94a3b8"
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                dot={{ r: 3, fill: "#94a3b8" }}
                                onClick={(entry) => {
                                    const payload = entry?.payload ?? entry;
                                    if (onBarClick && payload?.year) onBarClick(payload.year);
                                }}
                            />
                        </>
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                    <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: BRAND_COLOR }} />
                        {metric.label}
                    </span>
                    {compareData && compareData.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                            <span className="w-4 h-0 border-t-2 border-dashed border-slate-400" />
                            Pembanding
                        </span>
                    )}
                </div>
                {onBarClick && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 italic">
                        <MousePointerClick className="w-3 h-3" />
                        Klik bar tahun untuk drill-down
                    </span>
                )}
            </div>
        </div>
    );
});

export default CustomerYearlyChart;
