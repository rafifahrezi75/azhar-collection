import React, { memo } from "react";
import { Search, Filter, RefreshCw, Plus, X } from "lucide-react";
import Tooltip from "@/Components/Tooltip";

const PageHeaderBar = memo(function PageHeaderBar({
    title = "",
    breadcrumbs = [],
    searchValue = "",
    onSearchChange,
    searchPlaceholder = "Cari data...",
    onFilterClick,
    isFilterActive = false,
    onRefresh,
    refreshing = false,
    onAdd,
    addTitle = "Tambah",
    canCreate = true,
    extraActions = null,
}) {
    const displayTitle = title || (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.label : "");

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            {/* Left: Page Title Only */}
            <div>
                {displayTitle && (
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        {displayTitle}
                    </h1>
                )}
            </div>

            {/* Right: Compact Actions Bar (Search, Filter, Refresh, Add Button) */}
            <div className="flex items-center gap-1.5 self-start sm:self-center">
                {/* Search Input */}
                {onSearchChange && (
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-44 sm:w-56 pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs transition-all"
                        />
                        {searchValue && (
                            <Tooltip content="Hapus" position="bottom">
                                <button
                                    type="button"
                                    onClick={() => onSearchChange("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </Tooltip>
                        )}
                    </div>
                )}

                {/* Filter Icon Button */}
                {onFilterClick && (
                    <Tooltip content="Filter" position="bottom">
                        <button
                            type="button"
                            onClick={onFilterClick}
                            className={`relative p-1.5 rounded-md border transition-colors cursor-pointer shadow-2xs ${
                                isFilterActive
                                    ? "bg-teal-50 border-teal-500 text-teal-700 font-bold"
                                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            {isFilterActive && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-teal-600 ring-2 ring-white" />
                            )}
                        </button>
                    </Tooltip>
                )}

                {/* Refresh Icon Button */}
                {onRefresh && (
                    <Tooltip content="Segarkan" position="bottom">
                        <button
                            type="button"
                            onClick={onRefresh}
                            className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors cursor-pointer shadow-2xs"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        </button>
                    </Tooltip>
                )}

                {/* Optional Extra Actions */}
                {extraActions}

                {/* Add Icon Button with Tooltip */}
                {canCreate && onAdd && (
                    <Tooltip content={addTitle === "Tambah Data" ? "Tambah" : addTitle} position="bottom">
                        <button
                            type="button"
                            onClick={onAdd}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all shadow-xs hover:shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </Tooltip>
                )}
            </div>
        </div>
    );
});

export default PageHeaderBar;
