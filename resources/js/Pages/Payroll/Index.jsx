import React, { useState, useMemo, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import Pagination from "@/Components/Pagination";
import {
    Wallet,
    Users,
    Receipt,
    Printer,
    Download,
    Eye,
    Calendar,
    Scissors,
    DollarSign,
    Filter,
    X,
    Check,
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
                    onFilterClick={() => setIsFilterModalOpen(true)}
                    isFilterActive={isFilterActive}
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
                            <span className="text-[11px] font-semibold text-slate-500 block">Total Upah Periode Ini</span>
                            <span className="text-lg font-bold text-slate-900 block mt-0.5 font-mono">
                                {formatCurrency(stats.total_payroll)}
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
                            <DollarSign className="w-4.5 h-4.5" />
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 block">Total Output Jahitan</span>
                            <span className="text-lg font-bold text-slate-900 block mt-0.5">
                                {stats.total_qty || 0} Pcs / Stel
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 shrink-0">
                            <Scissors className="w-4.5 h-4.5" />
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 block">Periode Aktif</span>
                            <span className="text-xs font-bold text-slate-900 block mt-1 truncate">
                                {periodName}
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100 shrink-0">
                            <Calendar className="w-4.5 h-4.5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 text-center w-12">No</th>
                                    <th className="py-3 px-4">Nama Karyawan</th>
                                    <th className="py-3 px-4 text-center">Nota Dikerjakan</th>
                                    <th className="py-3 px-4 text-center">Langkah Kerja</th>
                                    <th className="py-3 px-4 text-center">Total Kuantitas</th>
                                    <th className="py-3 px-4 text-right">Total Upah Gaji</th>
                                    <th className="py-3 px-4 text-center w-40">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {paginatedPayrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-400">
                                            <Wallet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                            <span className="font-semibold text-slate-600 block">Belum ada data penggajian</span>
                                            <span className="text-[11px] text-slate-400 block mt-0.5">
                                                Tidak ada pengerjaan SPK pada periode {periodName}.
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPayrolls.map((item, idx) => {
                                        const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-3 px-4 text-center font-medium text-slate-500">
                                                    {globalIndex}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                            {item.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-900 block">{item.name}</span>
                                                            <span className="text-[11px] text-slate-400 block">{item.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-slate-700">
                                                        {item.total_invoices} Nota
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-xs font-semibold">
                                                        {item.total_steps} Langkah
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center font-medium">
                                                    {item.total_qty} Pcs/Stel
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-teal-800 text-sm">
                                                    {formatCurrency(item.total_wage)}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.visit(
                                                                    `/dashboard/payroll/preview?user_id=${item.id}&month=${month}&year=${year}`
                                                                )
                                                            }
                                                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer"
                                                            title="Lihat Slip Gaji"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        <a
                                                            href={`/dashboard/payroll/pdf?user_id=${item.id}&month=${month}&year=${year}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-teal-600 rounded-md transition-colors shadow-2xs"
                                                            title="Cetak PDF Langsung"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                        </a>
                                                        <a
                                                            href={`/dashboard/payroll/pdf?user_id=${item.id}&month=${month}&year=${year}`}
                                                            download={`Slip-Gaji-${item.name}-${periodName}.pdf`}
                                                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 rounded-md transition-colors shadow-2xs"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </a>
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
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </div>

            {isFilterModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Filter Periode Gaji</h4>
                                    <p className="text-[11px] text-slate-500">Pilih bulan dan tahun penggajian</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFilterModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Bulan Penggajian
                                </label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700 focus:border-teal-500"
                                >
                                    {monthOptions.map((m) => (
                                        <option key={m.val} value={m.val}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Tahun Penggajian
                                </label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700 focus:border-teal-500"
                                >
                                    {[2024, 2025, 2026, 2027].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Reset Bulan Ini
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePeriodChange(month, year)}
                                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>Terapkan</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
