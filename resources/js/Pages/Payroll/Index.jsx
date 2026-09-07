import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import Pagination from "@/Components/Pagination";
import PayrollFilterModal from "@/Components/PayrollFilterModal";
import { formatRupiah, todayLocal } from "@/utils/format";
import { Users, Printer, Eye, Wallet, CheckCircle2, RotateCcw, Layers } from "lucide-react";

export default function Index({
    payrolls = [],
    filters = {},
    periodName = "",
    stats = {},
}) {
    const localTodayParts = todayLocal().split("-");
    const defaultYear = Number(localTodayParts[0]);
    const defaultMonth = Number(localTodayParts[1]);

    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [month, setMonth] = useState(Number(filters.month) || defaultMonth);
    const [year, setYear] = useState(Number(filters.year) || defaultYear);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        if (filters.month) setMonth(Number(filters.month));
        if (filters.year) setYear(Number(filters.year));
    }, [filters.month, filters.year]);

    const isFilterActive = useMemo(() => {
        return Number(month) !== defaultMonth || Number(year) !== defaultYear;
    }, [month, year, defaultMonth, defaultYear]);

    const handleSearchChange = useCallback((val) => {
        setSearchTerm(val);
        setCurrentPage(1);
    }, []);

    const handlePeriodChange = (newMonth, newYear) => {
        setMonth(newMonth);
        setYear(newYear);
        setIsFilterModalOpen(false);
        setLoading(true);
        router.get(
            "/dashboard/payroll",
            { month: newMonth, year: newYear },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleResetFilter = () => {
        setMonth(defaultMonth);
        setYear(defaultYear);
        setIsFilterModalOpen(false);
        setLoading(true);
        router.get(
            "/dashboard/payroll",
            { month: defaultMonth, year: defaultYear },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleRefresh = useCallback(() => {
        setLoading(true);
        router.get(
            "/dashboard/payroll",
            { month, year },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            }
        );
    }, [month, year]);

    const filteredPayrolls = useMemo(() => {
        if (!searchTerm) return payrolls;
        const s = searchTerm.toLowerCase();
        return payrolls.filter(
            (item) =>
                item.name?.toLowerCase().includes(s) ||
                item.email?.toLowerCase().includes(s)
        );
    }, [payrolls, searchTerm]);

    const paginatedPayrolls = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPayrolls.slice(start, start + itemsPerPage);
    }, [filteredPayrolls, currentPage, itemsPerPage]);

    return (
        <DashboardLayout>
            <Head title="Gaji Karyawan - Azhar Collection" />

            <div className="w-full space-y-4">
                <PageHeaderBar
                    breadcrumbs={[
                        { label: "Master Data" },
                        { label: "Gaji Karyawan" },
                    ]}
                    beforeSearch={
                        isFilterActive ? (
                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-teal-50/80 border border-teal-200/90 rounded-lg text-xs text-teal-900 font-medium shadow-2xs shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse shrink-0" />
                                <span className="text-[11px] sm:text-xs whitespace-nowrap">
                                    Menampilkan periode: <strong>{periodName}</strong>
                                </span>
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    title="Reset Periode"
                                    className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-950 cursor-pointer text-[11px] pl-1.5 border-l border-teal-200/90 hover:underline"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span className="hidden md:inline">Reset Periode</span>
                                </button>
                            </div>
                        ) : null
                    }
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Cari nama karyawan..."
                    onFilterClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                    isFilterActive={isFilterActive}
                    filterContent={
                        <PayrollFilterModal
                            isOpen={isFilterModalOpen}
                            month={month}
                            year={year}
                            onMonthChange={(newMonth) => handlePeriodChange(newMonth, year)}
                            onYearChange={(newYear) => handlePeriodChange(month, newYear)}
                            onReset={handleResetFilter}
                            onClose={() => setIsFilterModalOpen(false)}
                        />
                    }
                    onRefresh={handleRefresh}
                    refreshing={loading}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-slate-500">Total Upah ({periodName})</div>
                            <div className="text-base font-bold text-teal-800">{formatRupiah(stats.total_payroll_amount || 0)}</div>
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-slate-500">Karyawan Bertugas</div>
                            <div className="text-base font-bold text-slate-800">{stats.total_employees || 0} Orang</div>
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-slate-500">Total Output Pengerjaan</div>
                            <div className="text-base font-bold text-slate-800">{(stats.total_qty || 0).toLocaleString("id-ID")} Pcs</div>
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-slate-500">Total SPK Ditugaskan</div>
                            <div className="text-base font-bold text-emerald-700">{stats.total_tasks || 0} SPK</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-md border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                                    <th className="px-3.5 py-2.5">No</th>
                                    <th className="px-3.5 py-2.5">Nama Karyawan</th>
                                    <th className="px-3.5 py-2.5 whitespace-nowrap">Tugas / SPK</th>
                                    <th className="px-3.5 py-2.5 whitespace-nowrap">Hasil Pengerjaan (Pcs)</th>
                                    <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Total Upah</th>
                                    <th className="px-3.5 py-2.5 whitespace-nowrap">Status</th>
                                    <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-3.5 py-8 text-center text-slate-400">
                                            <div className="inline-flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                                                <span>Memuat data gaji karyawan...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedPayrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-3.5 py-10 text-center text-slate-400">
                                            <Users className="w-9 h-9 mx-auto text-slate-300 mb-1.5" />
                                            <p className="font-semibold text-slate-600">Belum ada data gaji karyawan</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Tidak ada aktivitas pengerjaan pada periode {periodName}.
                                            </p>
                                            {isFilterActive && (
                                                <div className="mt-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleResetFilter}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs transition-colors cursor-pointer"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        <span>Kembali ke Periode Sekarang</span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPayrolls.map((emp, idx) => {
                                        const hasEarned = emp.total_wage > 0;
                                        return (
                                            <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-3.5 py-2.5 text-slate-400 font-mono text-xs font-medium">
                                                    {(currentPage - 1) * itemsPerPage + idx + 1}
                                                </td>
                                                <td className="px-3.5 py-2.5">
                                                    <div className="font-semibold text-slate-900">
                                                        {emp.name}
                                                    </div>
                                                    {emp.email && (
                                                        <div className="text-[11px] text-slate-400">
                                                            {emp.email}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3.5 py-2.5 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                                        {emp.total_tasks || 0} SPK
                                                    </span>
                                                </td>
                                                <td className="px-3.5 py-2.5 whitespace-nowrap">
                                                    {emp.total_qty > 0 ? (
                                                        <span className="font-bold text-slate-900 font-mono">
                                                            {emp.total_qty.toLocaleString("id-ID")} Pcs
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">
                                                            Belum ada pengerjaan
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3.5 py-2.5 text-right whitespace-nowrap font-bold text-slate-900 font-mono">
                                                    {formatRupiah(emp.total_wage)}
                                                </td>
                                                <td className="px-3.5 py-2.5 whitespace-nowrap">
                                                    {hasEarned ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            Selesai Dikerjakan
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            Belum Dikerjakan
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                router.visit(
                                                                    `/dashboard/payroll/preview?user_id=${emp.id}&month=${month}&year=${year}`
                                                                );
                                                            }}
                                                            title="Lihat"
                                                            className="w-7 h-7 inline-flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-md transition-colors border border-sky-200/80 cursor-pointer shadow-2xs"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={!hasEarned}
                                                            onClick={() => {
                                                                if (!hasEarned) return;
                                                                window.open(
                                                                    `/dashboard/payroll/pdf?user_id=${emp.id}&month=${month}&year=${year}`,
                                                                    "_blank"
                                                                );
                                                            }}
                                                            title={hasEarned ? "Cetak" : "Tidak ada upah untuk dicetak"}
                                                            className={`w-7 h-7 inline-flex items-center justify-center rounded-md transition-colors border shadow-2xs ${
                                                                hasEarned
                                                                    ? "bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200/80 cursor-pointer"
                                                                    : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
                                                            }`}
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredPayrolls.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(newSize) => {
                            setItemsPerPage(newSize);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
