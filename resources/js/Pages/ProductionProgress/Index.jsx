import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import Pagination from "@/Components/Pagination";
import SimpleFilterModal from "@/Components/SimpleFilterModal";
import { formatDate } from "@/utils/format";
import { Eye } from "lucide-react";

const STATUS_OPTIONS = [
    { id: "", label: "Semua" },
    { id: "pending", label: "Belum Dimulai" },
    { id: "in_progress", label: "Dikerjakan" },
    { id: "completed", label: "Selesai" },
];

const statusConfig = {
    completed:   { label: "Selesai",           color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    COMPLETED:   { label: "Selesai",           color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    SELESAI:     { label: "Selesai",           color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    in_progress: { label: "Dikerjakan",        color: "bg-amber-50 text-amber-700 border-amber-200" },
    IN_PROGRESS: { label: "Dikerjakan",        color: "bg-amber-50 text-amber-700 border-amber-200" },
    pending:     { label: "Belum Dimulai",     color: "bg-slate-100 text-slate-500 border-slate-200" },
    PENDING:     { label: "Belum Dimulai",     color: "bg-slate-100 text-slate-500 border-slate-200" },
};

function StatusBadge({ status }) {
    const cfg = statusConfig[status] || statusConfig["pending"];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${cfg.color}`}>
            {cfg.label}
        </span>
    );
}

function ProgressBar({ done, total }) {
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[70px]">
                <div
                    className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-sky-400"}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                {done}/{total} pcs
            </span>
        </div>
    );
}

export default function Index({ invoices, filters }) {
    const { auth } = usePage().props;
    const isAdmin = auth.roles && auth.roles.includes("admin");

    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const isFilterActive = Boolean(statusFilter);

    const navigate = (params) => {
        router.get(route("production-progress.index"), params, { preserveState: true, replace: true });
    };

    const buildParams = ({ search = searchTerm, status = statusFilter, perPage } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (status) params.status = status;
        if (perPage) params.per_page = perPage;
        return params;
    };

    const handleSearch = (val) => {
        setSearchTerm(val);
        navigate(buildParams({ search: val }));
    };

    const handleStatusFilter = (val) => {
        setStatusFilter(val);
        navigate(buildParams({ status: val }));
    };

    const handleItemsPerPage = (limit) => {
        navigate(buildParams({ perPage: limit }));
    };

    const handleResetFilters = () => {
        setStatusFilter("");
        setSearchTerm("");
        navigate({});
    };

    const handleRefresh = () => {
        setLoading(true);
        router.visit(route("production-progress.index"), { preserveScroll: true, onFinish: () => setLoading(false) });
    };

    return (
        <DashboardLayout>
            <Head title="Progress Penjahit - Azhar Collection" />

            <div className="space-y-4">
                <PageHeaderBar
                    breadcrumbs={[{ label: "Produksi" }, { label: "Progress Penjahit" }]}
                    title="Progress Penjahit"
                    searchValue={searchTerm}
                    onSearchChange={handleSearch}
                    searchPlaceholder="Cari no. invoice / pelanggan..."
                    onFilterClick={() => setIsFilterModalOpen(true)}
                    isFilterActive={isFilterActive}
                    onRefresh={handleRefresh}
                    refreshing={loading}
                />

                {/* Master table: one row per invoice */}
                <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                                    <th className="px-4 py-3 text-center w-10">No</th>
                                    <th className="px-4 py-3">Invoice / Pelanggan</th>
                                    <th className="px-4 py-3">Tanggal Order</th>
                                    {isAdmin && <th className="px-4 py-3">Penjahit</th>}
                                    <th className="px-4 py-3">Rincian Pekerjaan</th>
                                    <th className="px-4 py-3">Progress</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Target Selesai</th>
                                    <th className="px-4 py-3 text-center w-20">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 9 : 8} className="px-4 py-10 text-center text-slate-400">
                                            Belum ada data progress penjahit.
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.data.map((inv, index) => (
                                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 text-center text-slate-400 font-medium">
                                                {(invoices.current_page - 1) * invoices.per_page + index + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={route("production-progress.show", inv.id)}
                                                    className="font-bold text-slate-800 text-xs hover:text-teal-600 transition-colors"
                                                >
                                                    {inv.invoice_number}
                                                </Link>
                                                <div className="text-slate-400 text-[10px] mt-0.5">{inv.customer_name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(inv.order_date)}</td>
                                            {isAdmin && (
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 flex-wrap max-w-[160px]">
                                                        {inv.tailors.length === 0 ? (
                                                            <span className="text-slate-400">-</span>
                                                        ) : inv.tailors.slice(0, 2).map((t) => (
                                                            <span
                                                                key={t.id}
                                                                className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200/80 px-1.5 py-0.5 rounded font-medium text-[10px]"
                                                            >
                                                                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-[8px] shrink-0">
                                                                    {(t.name || "U").charAt(0).toUpperCase()}
                                                                </span>
                                                                {t.name}
                                                            </span>
                                                        ))}
                                                        {inv.tailors.length > 2 && (
                                                            <span className="text-[10px] text-slate-400 font-semibold">+{inv.tailors.length - 2}</span>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                                {inv.items_count} item &middot; {inv.steps_count} langkah
                                            </td>
                                            <td className="px-4 py-3 min-w-[130px]">
                                                <ProgressBar done={inv.done_qty || 0} total={inv.total_qty || 0} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={inv.status} />
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(inv.completion_date)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Link
                                                    href={route("production-progress.show", inv.id)}
                                                    className="w-7 h-7 inline-flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-md transition-colors border border-sky-200/80 shadow-2xs cursor-pointer"
                                                    title="Lihat Detail Progress Invoice"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={invoices.current_page}
                        totalItems={invoices.total}
                        itemsPerPage={invoices.per_page}
                        onPageChange={(page) => navigate({ ...buildParams({ perPage: invoices.per_page }), page })}
                        onItemsPerPageChange={handleItemsPerPage}
                    />
                </div>
            </div>

            {/* Filter Modal */}
            <SimpleFilterModal
                isOpen={isFilterModalOpen}
                title="Filter Progress Penjahit"
                extraFilter={
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Status Produksi
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {STATUS_OPTIONS.map((item) => (
                                <button
                                    key={item.id || "all"}
                                    type="button"
                                    onClick={() => handleStatusFilter(item.id)}
                                    className={`px-2 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer text-center ${
                                        statusFilter === item.id
                                            ? "bg-teal-600 text-white border-teal-600 shadow-2xs"
                                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                }
                onReset={handleResetFilters}
                onClose={() => setIsFilterModalOpen(false)}
            />
        </DashboardLayout>
    );
}
