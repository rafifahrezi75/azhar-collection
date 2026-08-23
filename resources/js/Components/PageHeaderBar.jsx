import React, { memo } from "react";
import { Search, Filter, RefreshCw, Plus, X } from "lucide-react";

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
                    <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
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
                            className="w-44 sm:w-56 pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder:text-slate-400 shadow-soft-2xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:shadow-soft-xs"
                        />
                        {searchValue && (
                            <button
                                type="button"
                                onClick={() => onSearchChange("")}
                                title="Hapus pencarian"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Filter Icon Button */}
                {onFilterClick && (
                    <button
                        type="button"
                        onClick={onFilterClick}
                        title="Filter Data"
                        className={`relative p-2 rounded-lg border transition-all duration-200 cursor-pointer shadow-soft-2xs ${
                            isFilterActive
                                ? "bg-teal-50 border-teal-400 text-teal-700 font-bold shadow-soft-xs"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        {isFilterActive && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-teal-600 ring-2 ring-white" />
                        )}
                    </button>
                )}

                {/* Refresh Icon Button */}
                {onRefresh && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        title="Segarkan Data"
                        className="p-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-lg transition-all duration-200 cursor-pointer shadow-soft-2xs"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                )}

                {/* Optional Extra Actions */}
                {extraActions}

                {/* Add Icon Button */}
                {canCreate && onAdd && (
                    <button
                        type="button"
                        onClick={onAdd}
                        title={addTitle}
                        className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 shadow-soft-xs hover:shadow-soft-sm cursor-pointer flex items-center justify-center shrink-0 active:shadow-soft-2xs active:translate-y-px"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
});

export default PageHeaderBar;
