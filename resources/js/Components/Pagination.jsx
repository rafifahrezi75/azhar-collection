import React, { memo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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

    const startItem = (currentPage - 1) * itemsPerPage + 1;
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3.5 py-2.5 bg-white border-t border-slate-200 text-xs text-slate-700">
            {/* Left: Info & Per Page selector */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <span className="font-medium text-slate-800">
                    Menampilkan <strong className="font-bold text-slate-900">{startItem}</strong> -{" "}
                    <strong className="font-bold text-slate-900">{endItem}</strong> dari{" "}
                    <strong className="font-bold text-slate-900">{totalItems}</strong> data
                </span>

                {onItemsPerPageChange && (
                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
                        <span className="text-[11px] text-slate-600 font-medium">Baris:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="bg-white border border-slate-300 rounded-md px-2 py-0.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
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
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                {/* Prev Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Halaman Sebelumnya"
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                                    : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-100"
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
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Last Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Halaman Terakhir"
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronsRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
});

export default Pagination;
