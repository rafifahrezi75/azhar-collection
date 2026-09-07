import React, { useState, useMemo, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import Pagination from "@/Components/Pagination";
import PayrollFilterModal from "@/Components/PayrollFilterModal";
import {
    Users,
    Receipt,
    Printer,
    Eye,
    Calendar,
    Scissors,
    DollarSign,
} from "lucide-react";

export default function Index({
    payrolls = [],
    filters = {},
    periodName = "",
    stats = {},
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [month, setMonth] = useState(filters.month || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || new Date().getFullYear());
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const monthOptions = [
        { val: 1, label: "Januari" },
        { val: 2, label: "Februari" },
        { val: 3, label: "Maret" },
        { val: 4, label: "April" },
        { val: 5, label: "Mei" },
        { val: 6, label: "Juni" },
        { val: 7, label: "Juli" },
        { val: 8, label: "Agustus" },
        { val: 9, label: "September" },
        { val: 10, label: "Oktober" },
        { val: 11, label: "November" },
        { val: 12, label: "Desember" },
    ];

    const isFilterActive = useMemo(() => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        return Number(month) !== currentMonth || Number(year) !== currentYear;
    }, [month, year]);

    const handleSearchChange = useCallback((val) => {
        setSearchTerm(val);
        router.get(
            "/dashboard/payroll",
            { search: val, month, year },
            { preserveState: true, replace: true }
        );
    }, [month, year]);

    const handlePeriodChange = (newMonth, newYear) => {
        setMonth(newMonth);
        setYear(newYear);
        setIsFilterModalOpen(false);
        router.get(
            "/dashboard/payroll",
            { search: searchTerm, month: newMonth, year: newYear },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilter = () => {
        const defaultMonth = new Date().getMonth() + 1;
        const defaultYear = new Date().getFullYear();
        setMonth(defaultMonth);
        setYear(defaultYear);
        setIsFilterModalOpen(false);
        router.get(
            "/dashboard/payroll",
            { search: searchTerm, month: defaultMonth, year: defaultYear },
            { preserveState: true, replace: true }
        );
    };

    const handleRefresh = useCallback(() => {
        router.get("/dashboard/payroll", { search: searchTerm, month, year });
    }, [searchTerm, month, year]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

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
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 block">Karyawan Bertugas</span>
                            <span className="text-lg font-bold text-slate-900 block mt-0.5">
                                {stats.total_employees || 0} Orang
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100 shrink-0">
                            <Users className="w-4.5 h-4.5" />
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 block">Total Potongan Kain</span>
                            <span className="text-lg font-bold text-slate-900 block mt-0.5">
                                {stats.total_cut_pieces || 0} Pcs
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100 shrink-0">
                            <Scissors className="w-4.5 h-4.5" />
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 block">Jahitan Selesai</span>
                            <span className="text-lg font-bold text-slate-900 block mt-0.5">
                                {stats.total_sewn_pieces || 0} Pcs
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100 shrink-0">
                            <Receipt className="w-4.5 h-4.5" />
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 block">Total Beban Gaji</span>
                            <span className="text-lg font-bold text-teal-700 block mt-0.5 font-mono">
                                {formatCurrency(stats.total_payroll_amount)}
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100 shrink-0">
                            <DollarSign className="w-4.5 h-4.5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="py-2.5 px-3 w-12 text-center">No</th>
                                    <th className="py-2.5 px-3">Nama Karyawan</th>
                                    <th className="py-2.5 px-3 text-center">Tugas Selesai</th>
                                    <th className="py-2.5 px-3 text-right">Potong Kain (Pcs)</th>
                                    <th className="py-2.5 px-3 text-right">Jahit (Pcs)</th>
                                    <th className="py-2.5 px-3 text-right">Total Upah</th>
                                    <th className="py-2.5 px-3 w-28 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedPayrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                                            Tidak ada data penggajian untuk periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPayrolls.map((emp, idx) => (
                                        <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                                                {(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="font-bold text-slate-800">
                                                    {emp.name}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {emp.email}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                                                    {emp.total_tasks || 0} SPK
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                                                {emp.cutting_pieces > 0 ? (
                                                    <span>{emp.cutting_pieces} Pcs</span>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                                                {emp.sewing_pieces > 0 ? (
                                                    <span>{emp.sewing_pieces} Pcs</span>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                                                {formatCurrency(emp.total_wage)}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            router.visit(
                                                                `/dashboard/payroll/preview?user_id=${emp.id}&month=${month}&year=${year}`
                                                            );
                                                        }}
                                                        title="Lihat Rincian Slip Gaji"
                                                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-teal-700 rounded-md transition-colors shadow-2xs cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            window.open(
                                                                `/dashboard/payroll/pdf?user_id=${emp.id}&month=${month}&year=${year}`,
                                                                "_blank"
                                                            );
                                                        }}
                                                        title="Cetak Slip Gaji"
                                                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md transition-colors shadow-2xs cursor-pointer"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredPayrolls.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
