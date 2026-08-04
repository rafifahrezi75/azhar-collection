import React, { memo, useState, useMemo } from "react";
import { Layers } from "lucide-react";

const CategoryDonutChart = memo(function CategoryDonutChart({ categories = [] }) {
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const filteredCats = useMemo(() => {
        return categories.filter((c) => c.items_count > 0);
    }, [categories]);

    const totalItems = useMemo(() => {
        return filteredCats.reduce((acc, curr) => acc + curr.items_count, 0);
    }, [filteredCats]);

    // Calculate SVG Pie/Donut Segments
    const radius = 65;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPercentage = 0;
    const segments = filteredCats.map((cat) => {
        const percent = totalItems > 0 ? (cat.items_count / totalItems) * 100 : 0;
        const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
        accumulatedPercentage += percent;

        return {
            ...cat,
            percent,
            strokeDasharray,
            strokeDashoffset,
        };
    });

    return (
        <div className="space-y-4">
            {/* Donut Graphic & Center Total */}
            <div className="relative flex items-center justify-center py-2">
                <svg
                    width="170"
                    height="170"
                    viewBox="0 0 170 170"
                    className="transform -rotate-90 transition-all duration-300"
                >
                    {/* Background Ring */}
                    <circle
                        cx="85"
                        cy="85"
                        r={radius}
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth={strokeWidth}
                    />

                    {/* Category Arcs */}
                    {segments.map((seg) => {
                        const isHovered = hoveredCategory?.id === seg.id;
                        return (
                            <circle
                                key={seg.id}
                                cx="85"
                                cy="85"
                                r={radius}
                                fill="transparent"
                                stroke={seg.color}
                                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                                strokeDasharray={seg.strokeDasharray}
                                strokeDashoffset={seg.strokeDashoffset}
                                className="transition-all duration-200 cursor-pointer"
                                onMouseEnter={() => setHoveredCategory(seg)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            />
                        );
                    })}
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {hoveredCategory ? hoveredCategory.name.slice(0, 14) + "..." : "Total Bahan"}
                    </span>
                    <span className="text-xl font-bold font-mono text-slate-900">
                        {hoveredCategory ? `${hoveredCategory.items_count} SKU` : `${totalItems} SKU`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                        {hoveredCategory ? `${hoveredCategory.percentage}% Bagian` : `${filteredCats.length} Kategori`}
                    </span>
                </div>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1 text-xs">
                {filteredCats.map((cat) => {
                    const isHovered = hoveredCategory?.id === cat.id;
                    return (
                        <div
                            key={cat.id}
                            onMouseEnter={() => setHoveredCategory(cat)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                                isHovered
                                    ? "bg-slate-100/90 border-slate-300 shadow-2xs"
                                    : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/50"
                            }`}
                        >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span className="font-semibold text-slate-800 truncate" title={cat.name}>
                                    {cat.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0 font-mono">
                                <span className="font-bold text-slate-900">{cat.items_count} SKU</span>
                                <span className="text-[11px] px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 font-semibold">
                                    {cat.percentage}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default CategoryDonutChart;
