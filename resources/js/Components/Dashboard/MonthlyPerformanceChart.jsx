import React from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { formatRupiah } from "@/utils/format";

const formatCompactCurrency = (val) => {
    if (!val || isNaN(val)) return "0";
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)} jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)} rb`;
    return String(val);
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const omsetVal = payload.find((p) => p.dataKey === "omset")?.value || 0;
        const cashInVal = payload.find((p) => p.dataKey === "cash_in")?.value || 0;
        const expensesVal = payload.find((p) => p.dataKey === "expenses")?.value || 0;
        const outputPcs = payload[0]?.payload?.output_pcs || 0;

        return (
            <div className="bg-white rounded-md border border-slate-200 shadow-md p-3 text-xs min-w-[200px]">
                <div className="font-bold text-slate-800 pb-1.5 mb-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span>Bulan {label}</span>
                    <span className="text-slate-500 text-[11px]">{outputPcs} pcs jahit</span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#800080]" />
                            <span className="text-[11px]">Omzet:</span>
                        </span>
                        <span className="font-bold text-slate-900">{formatRupiah(omsetVal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span className="text-[11px]">Kas Masuk:</span>
                        </span>
                        <span className="font-bold text-emerald-700">{formatRupiah(cashInVal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-[11px]">Beban (Bahan+Gaji):</span>
                        </span>
                        <span className="font-bold text-amber-700">{formatRupiah(expensesVal)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function MonthlyPerformanceChart({ data, year }) {
    const list = data || [];
    const totalYearOmset = list.reduce((acc, curr) => acc + (curr.omset || 0), 0);
    const totalYearCash = list.reduce((acc, curr) => acc + (curr.cash_in || 0), 0);

    return (
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                            Tren Kinerja Bulanan
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Perbandingan Omzet, Kas Masuk, dan Beban Operasional {year || new Date().getFullYear()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 shrink-0">
                    <TrendingUp className="w-3 h-3 text-teal-700" />
                    <span>Tahun {year || new Date().getFullYear()}</span>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="w-full h-64 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={list} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 10, fill: "#64748b" }}
                                axisLine={{ stroke: "#e2e8f0" }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#64748b" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatCompactCurrency}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                                formatter={(val) => {
                                    if (val === "omset") return <span className="text-slate-700 font-medium">Omzet Faktur</span>;
                                    if (val === "cash_in") return <span className="text-slate-700 font-medium">Kas Masuk</span>;
                                    if (val === "expenses") return <span className="text-slate-700 font-medium">Beban (Bahan+Upah)</span>;
                                    return val;
                                }}
                            />
                            <Bar dataKey="omset" name="omset" fill="#800080" radius={[3, 3, 0, 0]} maxBarSize={16} />
                            <Bar dataKey="cash_in" name="cash_in" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={16} />
                            <Bar dataKey="expenses" name="expenses" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={16} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[11px]">Akumulasi Omzet:</span>
                        <span className="font-bold text-slate-900">{formatRupiah(totalYearOmset)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[11px]">Akumulasi Kas Masuk:</span>
                        <span className="font-bold text-emerald-700">{formatRupiah(totalYearCash)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
