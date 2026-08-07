import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import ProductCategoryModal from "@/Components/ProductCategoryModal";
import ProductCategoryTable from "@/Components/ProductCategoryTable";
import SimpleFilterModal from "@/Components/SimpleFilterModal";
import { hasPermission } from "@/utils/permissions";
import { Toast, confirmDialog } from "@/utils/sweetalert";

export default function Index() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const initialFormState = {
        name: "",
        description: "",
        is_active: true,
    };

    const [form, setForm] = useState(initialFormState);

    const canCreate = useMemo(() => hasPermission(permissions, "kategori-produk.create"), [permissions]);
    const canUpdate = useMemo(() => hasPermission(permissions, "kategori-produk.update"), [permissions]);
    const canDelete = useMemo(() => hasPermission(permissions, "kategori-produk.delete"), [permissions]);

    const loadData = useCallback(() => {
        setLoading(true);
        axios
            .get("/api/product-categories")
            .then((response) => {
                setItems(response.data.data || []);
            })
            .catch(() => {
                Toast.error("Gagal memuat data kategori produk.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isFilterActive = useMemo(() => statusFilter !== "all", [statusFilter]);

    const handleResetFilters = useCallback(() => {
        setStatusFilter("all");
        setCurrentPage(1);
    }, []);

    // Filter items
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesStatus = true;
            if (statusFilter === "active") {
                matchesStatus = Boolean(item.is_active);
            } else if (statusFilter === "inactive") {
                matchesStatus = !Boolean(item.is_active);
            }

            return matchesSearch && matchesStatus;
        });
    }, [items, searchTerm, statusFilter]);

    // Paginated items
    const totalFiltered = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    const handleOpenCreateModal = () => {
        setEditingId(null);
        setForm(initialFormState);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category) => {
        setEditingId(category.id);
        setForm({
            name: category.name || "",
            description: category.description || "",
            is_active: Boolean(category.is_active),
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialFormState);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const url = editingId ? `/api/product-categories/${editingId}` : "/api/product-categories";
        const method = editingId ? "put" : "post";

        try {
            const response = await axios[method](url, form);
            Toast.success(response.data.message || (editingId ? "Kategori diperbarui" : "Kategori ditambahkan"));
            handleCloseModal();
            loadData();
        } catch (err) {
            const message = err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
            Toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (category) => {
        const confirmed = await confirmDialog(
            `Hapus Kategori '${category.name}'?`,
            "Pastikan kategori tidak sedang digunakan oleh produk pakaian aktif."
        );

        if (confirmed) {
            try {
                const response = await axios.delete(`/api/product-categories/${category.id}`);
                Toast.success(response.data.message || "Kategori berhasil dihapus");
                loadData();
            } catch (err) {
                const message = err.response?.data?.message || "Gagal menghapus kategori produk.";
                Toast.error(message);
            }
        }
    };

    return (
        <DashboardLayout>
            <Head title="Master Kategori Produk - Azhar Collection" />

            <div className="space-y-4">
                {/* Unified PageHeaderBar */}
                <PageHeaderBar
                    breadcrumbs={[
                        { label: "Master Data" },
                        { label: "Kategori Produk Pakaian" },
                    ]}
                    searchValue={searchTerm}
                    onSearchChange={(val) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Cari kategori produk..."
                    onFilterClick={() => setIsFilterModalOpen(true)}
                    isFilterActive={isFilterActive}
                    onRefresh={loadData}
                    refreshing={loading}
                    onAdd={handleOpenCreateModal}
                    addTitle="Tambah Kategori Produk"
                    canCreate={canCreate}
                />

                {/* Main Table */}
                <ProductCategoryTable
                    items={paginatedItems}
                    loading={loading}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDelete}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalFiltered}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(page) => setCurrentPage(page)}
                    onItemsPerPageChange={(limit) => {
                        setItemsPerPage(limit);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* Filter Modal */}
            <SimpleFilterModal
                isOpen={isFilterModalOpen}
                title="Filter Kategori Produk"
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onReset={handleResetFilters}
                onClose={() => setIsFilterModalOpen(false)}
            />

            {/* Create/Edit Modal */}
            <ProductCategoryModal
                isOpen={isModalOpen}
                isEditing={Boolean(editingId)}
                form={form}
                submitting={submitting}
                onClose={handleCloseModal}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
            />
        </DashboardLayout>
    );
}
