import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import Pagination from "@/Components/Pagination";
import { Eye, Printer } from "lucide-react";
import { formatRupiah, formatDate } from "@/utils/format";

export default function Index({ purchases }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    const handleRefresh = () => {
        setLoading(true);
        window.location.reload();
    };

    const filteredPurchases = useMemo(() => {
        return purchases.filter(p =>
            p.reference_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.supplier_name && p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [purchases, searchTerm]);

    const paginatedPurchases = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPurchases.slice(start, start + itemsPerPage);
    }, [filteredPurchases, currentPage, itemsPerPage]);

    return (
        <DashboardLayout>
            <Head title="Pembelian - Azhar Collection" />

            <div className="space-y-4">
                <PageHeaderBar
                    breadcrumbs={[
                        { label: "Transaksi" },
                        { label: "Pembelian" },
                    ]}
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Cari referensi atau supplier..."
                    onRefresh={handleRefresh}
                    refreshing={loading}
                    onAdd={() => router.visit(route('purchases.create'))}
                    addTitle="Tambah"
                    canCreate={true}
                />

                <div className="bg-white rounded-md shadow-2xs border border-slate-200 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                                    <th className="px-4 py-3 text-center w-12">No</th>
                                    <th className="px-4 py-3">No. Referensi</th>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3">Supplier</th>
                                    <th className="px-4 py-3 text-right">Total Nominal</th>
                                    <th className="px-4 py-3">Dibuat Oleh</th>
                                    <th className="px-4 py-3 text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedPurchases.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-10 text-center text-slate-400">
                                            Tidak ada data pembelian yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPurchases.map((purchase, index) => (
                                        <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 text-center text-slate-400">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-800">
                                                {purchase.reference_no}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {formatDate(purchase.date)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {purchase.supplier_name || <span className="text-slate-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-teal-600">
                                                {formatRupiah(purchase.total_amount)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {purchase.creator?.name || 'Sistem'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* View Detail (Sky) */}
                                                    <Link
                                                        href={route('purchases.show', purchase.id)}
                                                        className="w-7 h-7 inline-flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-md transition-colors border border-sky-200/80 cursor-pointer shadow-2xs"
                                                        title="Detail"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>

                                                    {/* Cetak PDF (Indigo) - matching preview/print theme */}
                                                    <button
                                                        type="button"
                                                        onClick={() => router.visit(route('purchases.preview', purchase.id))}
                                                        className="w-7 h-7 inline-flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors border border-indigo-200/80 cursor-pointer shadow-2xs"
                                                        title="PDF"
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
                        totalItems={filteredPurchases.length}
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
