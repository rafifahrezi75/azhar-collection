import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import Pagination from "@/Components/Pagination";
import InvoiceFilterModal from "@/Components/InvoiceFilterModal";
import { hasPermission } from "@/utils/permissions";
import { Toast, confirmDialog } from "@/utils/sweetalert";
import { formatRupiah, formatDate } from "@/utils/format";
import {
    Receipt,
    History,
    Zap,
    Eye,
    Printer,
    Trash2,
    Plus,
    CheckCircle2,
    TrendingUp,
    AlertCircle,
} from "lucide-react";

export default function Index() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState({
        total_invoices: 0,
        total_omset: 0,
        total_paid: 0,
        total_unpaid: 0,
    });
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const canCreate = useMemo(() => hasPermission(permissions, "invoice.create"), [permissions]);
    const canDelete = useMemo(() => hasPermission(permissions, "invoice.delete"), [permissions]);

    const isFilterActive =
        paymentStatusFilter !== "all" || typeFilter !== "all" || Boolean(startDate) || Boolean(endDate);

    const loadData = useCallback(() => {
        setLoading(true);
        const params = {};
        if (paymentStatusFilter !== "all") params.payment_status = paymentStatusFilter;
        if (typeFilter !== "all") params.type = typeFilter;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        axios
            .get("/api/invoices", { params })
            .then((res) => {
                setInvoices(res.data?.data || []);
                setSummary(res.data?.summary || {
                    total_invoices: 0,
                    total_omset: 0,
                    total_paid: 0,
                    total_unpaid: 0,
                });
            })
            .catch(() => {
                Toast.error("Gagal memuat data invoice");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [paymentStatusFilter, typeFilter, startDate, endDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenPrint = async (invoice) => {
        closeFilter();
        router.visit(`/dashboard/invoice/${invoice.id}/print-preview`);
    };

    const handleDelete = async (invoice) => {
        const confirmed = await confirmDialog({
            title: `Hapus Invoice #${invoice.invoice_number}?`,
            text: `Invoice pesanan atas nama '${invoice.customer_name}' akan dihapus dari sistem.`,
            confirmButtonText: "Ya, Hapus Invoice",
        });

        if (confirmed) {
            try {
                const res = await axios.delete(`/api/invoices/${invoice.id}`);
                Toast.success(res.data?.message || "Invoice berhasil dihapus");
                loadData();
            } catch (err) {
                Toast.error(err.response?.data?.message || "Gagal menghapus invoice");
            }
        }
    };

    const handleResetFilters = () => {
        setTypeFilter("all");
        setPaymentStatusFilter("all");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
    };

    const closeFilter = useCallback(() => {
        setIsFilterModalOpen(false);
    }, []);

    const handleFilterClick = useCallback(() => {
        setIsFilterModalOpen((prev) => !prev);
    }, []);

    const handleRefresh = useCallback(() => {
        closeFilter();
        loadData();
    }, [closeFilter, loadData]);

    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            const term = searchTerm.toLowerCase();
            const invNum = (inv.invoice_number || "").toLowerCase();
            const custName = (inv.customer_name || "").toLowerCase();
            const instName = (inv.customer?.institution_name || "").toLowerCase();

            return !searchTerm || invNum.includes(term) || custName.includes(term) || instName.includes(term);
        });
    }, [invoices, searchTerm]);

    const totalFiltered = filteredInvoices.length;
    const paginatedInvoices = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredInvoices.slice(start, start + itemsPerPage);
    }, [filteredInvoices, currentPage, itemsPerPage]);

    return (
        <DashboardLayout>
            <Head title="Daftar Invoice & Transaksi - Azhar Collection" />

            <div className="space-y-4">
                <PageHeaderBar
                    breadcrumbs={[
                        { label: "Transaksi" },
                        { label: "Transaksi & Invoice Penjualan" },
                    ]}
                    searchValue={searchTerm}
                    onSearchChange={(val) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Cari no invoice, pemesan, instansi..."
                    onFilterClick={handleFilterClick}
                    isFilterActive={isFilterActive}
                    filterContent={
                        <InvoiceFilterModal
                            isOpen={isFilterModalOpen}
                            typeFilter={typeFilter}
                            onTypeFilterChange={(val) => {
                                setTypeFilter(val);
                                setCurrentPage(1);
                            }}
                            paymentStatusFilter={paymentStatusFilter}
                            onPaymentStatusFilterChange={(val) => {
                                setPaymentStatusFilter(val);
                                setCurrentPage(1);
                            }}
                            startDate={startDate}
                            onStartDateChange={(val) => {
                                setStartDate(val);
                                setCurrentPage(1);
                            }}
                            endDate={endDate}
                            onEndDateChange={(val) => {
                                setEndDate(val);
                                setCurrentPage(1);
                            }}
                            onReset={handleResetFilters}
                            onClose={closeFilter}
                        />
                    }
                    onRefresh={handleRefresh}
                    refreshing={loading}
                    onAdd={() => {
                        closeFilter();
                        router.visit("/dashboard/invoice/create");
                    }}
                    addTitle="Tambah Transaksi"
                    canCreate={canCreate}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-soft-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100/60">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-slate-500">Total Invoice</div>
                            <div className="text-base font-bold text-slate-800 font-mono">{summary.total_invoices} Nota</div>
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-soft-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-slate-500">Total Nilai Transaksi</div>
                            <div className="text-base font-bold text-emerald-700 font-mono">{formatRupiah(summary.total_omset)}</div>
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-soft-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/60">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-slate-500">Kas Masuk (Terbayar)</div>
                            <div className="text-base font-bold text-sky-700 font-mono">{formatRupiah(summary.total_paid)}</div>
                        </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-soft-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100/60">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-slate-500">Sisa Piutang Tagihan</div>
                            <div className="text-base font-bold text-rose-700 font-mono">{formatRupiah(summary.total_unpaid)}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/90 shadow-soft-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-2.5 px-3.5 w-12 text-center">No</th>
                                    <th className="py-2.5 px-3.5 min-w-[180px]">No. Invoice & Tanggal</th>
                                    <th className="py-2.5 px-3.5 min-w-[220px]">Pelanggan / Pemesan</th>
                                    <th className="py-2.5 px-3.5 text-center w-36">Item & Qty</th>
                                    <th className="py-2.5 px-3.5 text-right w-36">Total Tagihan</th>
                                    <th className="py-2.5 px-3.5 text-right w-36">Terbayar / Sisa</th>
                                    <th className="py-2.5 px-3.5 text-center w-28">Status Bayar</th>
                                    <th className="py-2.5 px-3.5 text-center w-32">Tipe Pesanan</th>
                                    <th className="py-2.5 px-3.5 text-center w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="py-10 text-center text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                                                <span>Memuat daftar invoice transaksi...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="py-10 text-center text-slate-400 space-y-2">
                                            <Receipt className="w-9 h-9 mx-auto text-slate-300 mb-1" />
                                            {searchTerm ? (
                                                <>
                                                    <p className="font-semibold text-slate-700">Tidak ada invoice yang cocok</p>
                                                    <p className="text-xs text-slate-500">
                                                        Tidak ditemukan hasil pencarian untuk "{searchTerm}".
                                                    </p>
                                                    <div className="pt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSearchTerm("")}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Bersihkan Pencarian
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-semibold text-slate-700">Belum ada data invoice terdaftar</p>
                                                    <p className="text-xs text-slate-500">
                                                        Mulai buat pesanan faktur transaksi baru atau masukkan arsip nota lama.
                                                    </p>
                                                    {canCreate && (
                                                        <div className="pt-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => router.visit("/dashboard/invoice/create")}
                                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-soft-xs"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                                <span>Buat Invoice Baru</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedInvoices.map((inv, idx) => {
                                        const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                                        const remaining = Math.max(0, (inv.total_amount || 0) - (inv.paid_amount || 0));
                                        const itemsCount = (inv.items || []).length;
                                        const totalQty = (inv.items || []).reduce((s, i) => s + (i.qty || 0), 0);

                                        return (
                                            <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-2.5 px-3.5 text-center text-slate-400 font-mono text-xs">
                                                    {rowNumber}
                                                </td>

                                                <td className="py-2.5 px-3.5">
                                                    <div className="font-bold text-slate-900 font-mono">
                                                        #{inv.invoice_number}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        {formatDate(inv.order_date)}
                                                    </div>
                                                </td>

                                                <td className="py-2.5 px-3.5">
                                                    <div className="font-bold text-slate-900">
                                                        {inv.customer_name}
                                                    </div>
                                                    {inv.customer?.institution_name && (
                                                        <div className="text-[11px] text-slate-500">
                                                            {inv.customer.institution_name}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-2.5 px-3.5 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 font-mono">
                                                        {totalQty} Pcs ({itemsCount} Item)
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 font-mono">
                                                    {formatRupiah(inv.total_amount)}
                                                </td>

                                                <td className="py-2.5 px-3.5 text-right font-mono">
                                                    <div className="text-emerald-700 font-semibold">
                                                        {formatRupiah(inv.paid_amount)}
                                                    </div>
                                                    {remaining > 0 ? (
                                                        <div className="text-[10px] text-rose-600 font-semibold">
                                                            Sisa: {formatRupiah(remaining)}
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] text-emerald-600 font-semibold">
                                                            Lunas
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-2.5 px-3.5 text-center">
                                                    {(() => {
                                                        const pStatus = String(inv.payment_status || "").toUpperCase();
                                                        const isLunas = pStatus === "LUNAS";
                                                        const isDp = pStatus === "DP" || pStatus === "PARTIAL";
                                                        return (
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                    isLunas
                                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                        : isDp
                                                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                                        : "bg-rose-50 text-rose-700 border border-rose-200"
                                                                }`}
                                                            >
                                                                {isDp ? "DP" : inv.payment_status || "BELUM_LUNAS"}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>

                                                <td className="py-2.5 px-3.5 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                                            inv.type === "HISTORICAL"
                                                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                                                : "bg-teal-50 text-teal-800 border border-teal-200"
                                                        }`}
                                                    >
                                                        {inv.type === "HISTORICAL" ? (
                                                            <>
                                                                <History className="w-3 h-3 text-amber-600 shrink-0" />
                                                                <span>Historis</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Zap className="w-3 h-3 text-teal-600 shrink-0" />
                                                                <span>Reguler</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="py-2.5 px-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link
                                                            href={`/dashboard/invoice/${inv.id}`}
                                                            title="Lihat Detail"
                                                            className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-soft-2xs"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenPrint(inv)}
                                                            title="Cetak Nota"
                                                            className="p-1.5 bg-white hover:bg-slate-50 text-teal-600 hover:text-teal-700 rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-soft-2xs"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                        </button>

                                                        {canDelete && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(inv)}
                                                                title="Hapus Invoice"
                                                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-200/80 cursor-pointer shadow-soft-2xs"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalFiltered > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalFiltered}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => setCurrentPage(p)}
                            onItemsPerPageChange={(limit) => {
                                setItemsPerPage(limit);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
