import React, { memo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";

const Pagination = memo(function Pagination({
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    onItemsPerPageChange,
    pageSizeOptions = [10, 25, 50, 100],
}) {
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    if (totalItems === 0) return null;

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers with ellipses
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, currentPage + 2);

            if (start > 1) {
                pages.push(1);
                if (start > 2) pages.push("...");
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages) {
                if (end < totalPages - 1) pages.push("...");
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-700 select-none">
            {/* Left: Info & Per Page selector */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
                <span className="font-medium text-slate-700">
                    Menampilkan <strong className="font-bold text-slate-900">{startItem}</strong> -{" "}
                    <strong className="font-bold text-slate-900">{endItem}</strong> dari{" "}
                    <strong className="font-bold text-slate-900">{totalItems}</strong> data
                </span>

                {onItemsPerPageChange && (
                    <div className="flex items-center gap-1.5 pl-3 border-l border-slate-300">
                        <span className="text-[11px] text-slate-500 font-medium">Tampilkan:</span>
                        <div className="relative inline-block">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                                className="appearance-none bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-md pl-2.5 pr-7 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors cursor-pointer shadow-2xs"
                            >
                                {pageSizeOptions.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title="Halaman Pertama"
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                {/* Prev Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Halaman Sebelumnya"
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-1.5 text-slate-400 font-bold">
                            ...
                        </span>
                    ) : (
                        <button
                            key={`page-${page}`}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={`min-w-[28px] h-7 px-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                currentPage === page
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 shadow-2xs"
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}

                {/* Next Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Halaman Berikutnya"
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Last Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Halaman Terakhir"
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                >
                    <ChevronsRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
});

export default Pagination;
