import React, { memo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";

const StockActivityChart = memo(function StockActivityChart({ data = [] }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                Tidak ada data aktivitas mutasi untuk ditampilkan.
            </div>
        );
    }

    // Find max value for scaling
    const maxVal = Math.max(
        ...data.map((d) => Math.max(d.in_qty || 0, d.out_qty || 0)),
        50
    );

    const totalIn = data.reduce((acc, curr) => acc + (curr.in_qty || 0), 0);
    const totalOut = data.reduce((acc, curr) => acc + (curr.out_qty || 0), 0);

    const height = 180;
    const paddingBottom = 28;
    const availableHeight = height - paddingBottom;

    return (
        <div className="space-y-4">
            {/* Chart Summary Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-teal-500 inline-block shadow-2xs" />
                        <span className="text-slate-600 font-medium">Stok Masuk:</span>
                        <span className="font-mono font-bold text-teal-700">+{totalIn.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block shadow-2xs" />
                        <span className="text-slate-600 font-medium">Stok Keluar:</span>
                        <span className="font-mono font-bold text-amber-700">-{totalOut.toLocaleString("id-ID")}</span>
                    </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-600">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                    <span>7 Hari Terakhir</span>
                </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="relative pt-4">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-x-0 top-4 bottom-7 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                </div>

                {/* Bars Container */}
                <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 relative z-10 px-1">
                    {data.map((item, idx) => {
                        const inHeightPercent = maxVal > 0 ? (item.in_qty / maxVal) * 100 : 0;
                        const outHeightPercent = maxVal > 0 ? (item.out_qty / maxVal) * 100 : 0;
                        const isHovered = hoveredIndex === idx;

                        return (
                            <div
                                key={item.date || idx}
                                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Tooltip on Hover */}
                                {isHovered && (
                                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white rounded-lg p-2.5 shadow-xl text-xs z-30 pointer-events-none whitespace-nowrap min-w-[140px] animate-in zoom-in-95 duration-100">
                                        <p className="font-bold text-white border-b border-slate-700 pb-1 mb-1.5">
                                            {item.label}
                                        </p>
                                        <div className="space-y-1 font-mono text-[11px]">
                                            <div className="flex items-center justify-between text-teal-400">
                                                <span className="flex items-center gap-1">
                                                    <ArrowDownLeft className="w-3 h-3" /> Masuk:
                                                </span>
                                                <span className="font-bold">+{item.in_qty}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-amber-400">
                                                <span className="flex items-center gap-1">
                                                    <ArrowUpRight className="w-3 h-3" /> Keluar:
                                                </span>
                                                <span className="font-bold">-{item.out_qty}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                                                {item.total_mutations} transaksi mutasi
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bar Pair Container */}
                                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-36 px-0.5">
                                    {/* In Bar (Teal) */}
                                    <div className="w-full max-w-[16px] bg-slate-100 rounded-t flex flex-col justify-end h-full overflow-hidden">
                                        <div
                                            style={{ height: `${Math.max(item.in_qty > 0 ? 8 : 0, inHeightPercent)}%` }}
                                            className={`w-full bg-linear-to-t from-teal-600 to-teal-400 rounded-t transition-all duration-300 ${
                                                isHovered ? "brightness-110 shadow-xs" : ""
                                            }`}
                                        />
                                    </div>

                                    {/* Out Bar (Amber) */}
                                    <div className="w-full max-w-[16px] bg-slate-100 rounded-t flex flex-col justify-end h-full overflow-hidden">
                                        <div
                                            style={{ height: `${Math.max(item.out_qty > 0 ? 8 : 0, outHeightPercent)}%` }}
                                            className={`w-full bg-linear-to-t from-amber-600 to-amber-400 rounded-t transition-all duration-300 ${
                                                isHovered ? "brightness-110 shadow-xs" : ""
                                            }`}
                                        />
                                    </div>
                                </div>

                                {/* Label Under Bar */}
                                <div className="mt-2 text-center">
                                    <span className={`text-[10px] sm:text-xs font-semibold block transition-colors ${
                                        isHovered ? "text-teal-700 font-bold" : "text-slate-500"
                                    }`}>
                                        {item.short_label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default StockActivityChart;
