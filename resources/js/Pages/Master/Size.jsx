import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import { hasPermission } from "@/utils/permissions";
import { Toast, confirmDialog } from "@/utils/sweetalert";
import { Pencil, Trash2, X, Save, Edit, Loader2, Ruler } from "lucide-react";
import Pagination from "@/Components/Pagination";
import SortableTableBody, { SortableRow } from "@/Components/SortableTableBody";

export default function Size() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    const [form, setForm] = useState({
        category: "Dewasa",
        size_name: "",
        description: "",
    });

    const canCreate = useMemo(() => hasPermission(permissions, "produk.create"), [permissions]);
    const canUpdate = useMemo(() => hasPermission(permissions, "produk.update"), [permissions]);
    const canDelete = useMemo(() => hasPermission(permissions, "produk.delete"), [permissions]);

    const loadData = useCallback(() => {
        setLoading(true);
        axios
            .get("/api/sizes")
            .then((response) => {
                setItems(response.data.data || []);
                setLoading(false);
            })
            .catch((err) => {
                Toast.error(err.response?.data?.message || "Gagal memuat data ukuran.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleReorder = async (newPaginatedItems) => {
        if (searchTerm) return; // Disable reorder when searching
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const newItems = [...items];
        newItems.splice(startIndex, newPaginatedItems.length, ...newPaginatedItems);
        setItems(newItems);

        try {
            await axios.post('/api/master/reorder', {
                table: 'sizes',
                ids: newItems.map(i => i.id)
            });
            Toast.success("Urutan berhasil disimpan!");
        } catch (error) {
            Toast.error("Gagal menyimpan urutan.");
            loadData(); // revert
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            return (
                !searchTerm ||
                item.size_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [items, searchTerm]);

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    const uniqueCategories = useMemo(() => {
        return [...new Set(items.map((i) => i.category))].filter(Boolean).sort();
    }, [items]);

    useEffect(() => {
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
        if (currentPage > totalPages) setCurrentPage(1);
    }, [filteredItems.length, itemsPerPage, currentPage]);

    const handleSearchChange = useCallback((val) => {
        setSearchTerm(val);
        setCurrentPage(1);
    }, []);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const openCreateModal = useCallback(() => {
        setEditingId(null);
        setForm({ category: "Dewasa", size_name: "", description: "" });
        setIsModalOpen(true);
    }, []);

    const openEditModal = useCallback((item) => {
        setEditingId(item.id);
        setForm({
            category: item.category,
            size_name: item.size_name,
            description: item.description || "",
        });
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm({ category: "Dewasa", size_name: "", description: "" });
    }, []);

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();
            setSubmitting(true);

            try {
                if (editingId) {
                    const res = await axios.put(`/api/sizes/${editingId}`, form);
                    Toast.success(res.data.message || "Ukuran berhasil diperbarui.");
                } else {
                    const res = await axios.post("/api/sizes", form);
                    Toast.success(res.data.message || "Ukuran berhasil ditambahkan.");
                }
                closeModal();
                loadData();
            } catch (err) {
                Toast.error(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
            } finally {
                setSubmitting(false);
            }
        },
        [editingId, form, closeModal, loadData]
    );

    const handleDelete = useCallback(
        async (id) => {
            const confirmed = await confirmDialog({
                title: "Hapus Ukuran?",
                text: "Apakah Anda yakin ingin menghapus data ukuran ini?",
                confirmButtonText: "Ya, Hapus",
            });

            if (!confirmed) return;

            try {
                const res = await axios.delete(`/api/sizes/${id}`);
                Toast.success(res.data.message || "Ukuran berhasil dihapus.");
                loadData();
            } catch (err) {
                Toast.error(err.response?.data?.message || "Gagal menghapus data. Pastikan ukuran tidak sedang dipakai produk.");
            }
        },
        [loadData]
    );

    return (
        <DashboardLayout>
            <Head title="Ukuran - Azhar Collection" />
            <div className="space-y-4">
                <PageHeaderBar
                    breadcrumbs={[
                        { label: "Master Data" },
                        { label: "Ukuran" },
                    ]}
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Cari ukuran atau kategori..."
                    onRefresh={loadData}
                    refreshing={loading}
                    onAdd={openCreateModal}
                    addTitle="Tambah Ukuran"
                    canCreate={canCreate}
                />

                <div className="bg-white border border-slate-200/90 rounded-md overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                                    {!searchTerm && <th className="px-3 py-3 w-10 text-center"></th>}
                                    <th className="px-4 py-3 w-16 text-center">No</th>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3">Nama Ukuran</th>
                                    <th className="px-4 py-3">Deskripsi</th>
                                    <th className="px-4 py-3 w-28 text-center">Aksi</th>
                                </tr>
                            </thead>
                            {!searchTerm && !loading && paginatedItems.length > 0 ? (
                                <SortableTableBody items={paginatedItems} onReorder={handleReorder}>
                                    {paginatedItems.map((item, idx) => (
                                        <SortableRow key={item.id} id={item.id} className="hover:bg-slate-50/70 transition-colors bg-white">
                                            <td className="px-3.5 py-2.5 text-slate-400 font-mono text-xs font-medium text-center">
                                                {(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>
                                            <td className="px-3.5 py-2.5 font-medium text-slate-900">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                                                {item.size_name}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-slate-600 text-xs">
                                                {item.description || "-"}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center justify-end gap-1 w-full">
                                                    {canUpdate && (
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="w-7 h-7 inline-flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors border border-indigo-200/80 cursor-pointer shadow-2xs"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="w-7 h-7 inline-flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md transition-colors border border-rose-200/80 cursor-pointer shadow-2xs"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </SortableRow>
                                    ))}
                                </SortableTableBody>
                            ) : (
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                                                    <span>Memuat data...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                                Tidak ada data ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedItems.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors bg-white">
                                                <td className="px-3.5 py-2.5 text-slate-400 font-mono text-xs font-medium text-center">
                                                    {(currentPage - 1) * itemsPerPage + idx + 1}
                                                </td>
                                                <td className="px-3.5 py-2.5 font-medium text-slate-900">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                                                    {item.size_name}
                                                </td>
                                                <td className="px-3.5 py-2.5 text-slate-600 text-xs">
                                                    {item.description || "-"}
                                                </td>
                                                <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center justify-end gap-1 w-full">
                                                        {canUpdate && (
                                                            <button
                                                                onClick={() => openEditModal(item)}
                                                                className="w-7 h-7 inline-flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors border border-indigo-200/80 cursor-pointer shadow-2xs"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="w-7 h-7 inline-flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md transition-colors border border-rose-200/80 cursor-pointer shadow-2xs"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            )}
                        </table>
                    </div>
                    {filteredItems.length > 0 && (
                        <Pagination
                            totalItems={filteredItems.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(val) => {
                                setItemsPerPage(val);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal} />
                        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-2.5">
                                    <div className={`p-2 rounded-lg ${editingId ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600'}`}>
                                        {editingId ? <Edit className="w-5 h-5" /> : <Ruler className="w-5 h-5" />}
                                    </div>
                                    <h2 className="text-base font-bold text-slate-800">
                                        {editingId ? "Edit Ukuran" : "Tambah Ukuran"}
                                    </h2>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-5 overflow-y-auto space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                Kategori <span className="text-rose-500">*</span>
                                            </label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isCustomCategory}
                                                    onChange={(e) => {
                                                        setIsCustomCategory(e.target.checked);
                                                        setForm(prev => ({ ...prev, category: "" }));
                                                    }}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                />
                                                <span className="text-[10px] font-semibold text-slate-500">Kategori Baru (Custom)</span>
                                            </label>
                                        </div>
                                        {isCustomCategory ? (
                                            <input
                                                type="text"
                                                name="category"
                                                required
                                                value={form.category}
                                                onChange={handleFormChange}
                                                placeholder="Cth: Dewasa, Anak, SD"
                                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                                            />
                                        ) : (
                                            <select
                                                name="category"
                                                required
                                                value={form.category}
                                                onChange={handleFormChange}
                                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                            >
                                                <option value="" disabled>-- Pilih Kategori --</option>
                                                {uniqueCategories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Nama Ukuran <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="size_name"
                                            required
                                            value={form.size_name}
                                            onChange={handleFormChange}
                                            placeholder="Cth: XL, 32"
                                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all uppercase"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Deskripsi (Opsional)
                                        </label>
                                        <textarea
                                            name="description"
                                            rows={2}
                                            value={form.description}
                                            onChange={handleFormChange}
                                            placeholder="Tambahkan keterangan jika ada..."
                                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={submitting}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 transition-all disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500/30 transition-all disabled:opacity-70"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Simpan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
