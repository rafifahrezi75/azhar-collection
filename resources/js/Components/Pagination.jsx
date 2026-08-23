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

    const btnBase = "w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-soft-2xs";

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-100 text-xs text-slate-600 select-none">
            {/* Left: Info & Per Page selector */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
                <span className="font-medium text-slate-500">
                    Menampilkan <strong className="font-bold text-slate-700">{startItem}</strong> -{" "}
                    <strong className="font-bold text-slate-700">{endItem}</strong> dari{" "}
                    <strong className="font-bold text-slate-700">{totalItems}</strong> data
                </span>

                {onItemsPerPageChange && (
                    <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                        <span className="text-[11px] text-slate-500 font-medium">Tampilkan:</span>
                        <div className="relative inline-block">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                                className="appearance-none bg-white border border-slate-200 rounded-lg pl-2.5 pr-7 py-1 text-xs font-semibold text-slate-700 shadow-soft-2xs transition-all duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
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
                <button type="button" onClick={() => onPageChange(1)} disabled={currentPage === 1} title="Halaman Pertama" className={btnBase}>
                    <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} title="Halaman Sebelumnya" className={btnBase}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-1.5 text-slate-400 font-bold">...</span>
                    ) : (
                        <button
                            key={`page-${page}`}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                                currentPage === page
                                    ? "bg-teal-600 text-white shadow-soft-xs"
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-soft-2xs"
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} title="Halaman Berikutnya" className={btnBase}>
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} title="Halaman Terakhir" className={btnBase}>
                    <ChevronsRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
});

export default Pagination;
