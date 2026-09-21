import React, { memo } from "react";
import {
    Search,
    Filter,
    RefreshCw,
    Plus,
    X,
} from "lucide-react";

const PageHeaderBar = memo(function PageHeaderBar({
    title = "",
    breadcrumbs = [],
    searchValue = "",
    onSearchChange,
    searchPlaceholder = "Cari data...",
    onFilterClick,
    isFilterActive = false,
    filterContent = null,
    onRefresh,
    refreshing = false,
    onAdd,
    addTitle = "Tambah",
    canCreate = true,
    extraActions = null,
    beforeSearch = null,
}) {
    const displayTitle =
        title ||
        (breadcrumbs.length > 0
            ? breadcrumbs[breadcrumbs.length - 1]?.label
            : "");

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 overflow-visible">
            <div>
                {breadcrumbs.length > 1 && (
                    <nav className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-0.5">
                        {breadcrumbs.map((b, idx) => (
                            <React.Fragment key={idx}>
                                {idx > 0 && <span className="text-slate-300">/</span>}
                                <span className={idx === breadcrumbs.length - 1 ? "text-slate-600 font-semibold" : "text-slate-400"}>
                                    {b.label}
                                </span>
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                {displayTitle && (
                    <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                        {displayTitle}
                    </h1>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center overflow-visible">
                {beforeSearch}

                {onSearchChange && (
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />

                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) =>
                                onSearchChange(e.target.value)
                            }
                            placeholder={searchPlaceholder}
                            className="w-44 sm:w-56 pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-soft-2xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:shadow-soft-xs"
                        />

                        {searchValue && (
                            <button
                                type="button"
                                onClick={() =>
                                    onSearchChange("")
                                }
                                title="Hapus pencarian"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}

                {onFilterClick && (
                    <div className="relative shrink-0">
                        <button
                            type="button"
                            onClick={onFilterClick}
                            title="Filter Data"
                            className={`relative p-2 rounded-lg border transition-all duration-200 cursor-pointer shadow-soft-2xs ${
                                isFilterActive
                                    ? "bg-teal-50 border-teal-300 text-teal-700 font-bold shadow-soft-xs"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                        >
                            <Filter className="w-3.5 h-3.5" />

                            {isFilterActive && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-teal-600 ring-2 ring-white" />
                            )}
                        </button>

                        {filterContent}
                    </div>
                )}

                {onRefresh && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        title="Segarkan Data"
                        className="p-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-lg transition-all duration-200 cursor-pointer shadow-soft-2xs"
                    >
                        <RefreshCw
                            className={`w-3.5 h-3.5 ${
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />
                    </button>
                )}

                {extraActions}

                {canCreate && onAdd && (
                    <button
                        type="button"
                        onClick={onAdd}
                        title={addTitle}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-soft-xs hover:shadow-soft-sm cursor-pointer shrink-0 active:shadow-soft-2xs active:translate-y-px"
                    >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline">{addTitle}</span>
                    </button>
                )}
            </div>
        </div>
    );
});

export default PageHeaderBar;
