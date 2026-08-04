import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import UnitModal from "@/Components/UnitModal";
import UnitTable from "@/Components/UnitTable";
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

    const [form, setForm] = useState({
        name: "",
        symbol: "",
        description: "",
        is_active: true,
    });

    const canCreate = useMemo(() => hasPermission(permissions, "satuan.create"), [permissions]);
    const canUpdate = useMemo(() => hasPermission(permissions, "satuan.update"), [permissions]);
    const canDelete = useMemo(() => hasPermission(permissions, "satuan.delete"), [permissions]);

    const loadData = useCallback(() => {
        setLoading(true);
        axios
            .get("/api/units")
            .then((response) => {
                setItems(response.data.data || []);
                setLoading(false);
            })
            .catch((err) => {
                Toast.error(err.response?.data?.message || "Gagal memuat data satuan.");
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
                item.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    // Adjust page if out of bounds
    useEffect(() => {
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [filteredItems.length, itemsPerPage, currentPage]);

    const handleSearchChange = useCallback((val) => {
        setSearchTerm(val);
        setCurrentPage(1);
    }, []);

    const handleFormChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }, []);

    const openCreateModal = useCallback(() => {
        setEditingId(null);
        setForm({
            name: "",
            symbol: "",
            description: "",
            is_active: true,
        });
        setIsModalOpen(true);
    }, []);

    const openEditModal = useCallback((item) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            symbol: item.symbol || "",
            description: item.description || "",
            is_active: Boolean(item.is_active),
        });
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm({
            name: "",
            symbol: "",
            description: "",
            is_active: true,
        });
    }, []);

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();
            setSubmitting(true);

            try {
                if (editingId) {
                    const res = await axios.put(`/api/units/${editingId}`, form);
                    Toast.success(res.data.message || "Satuan berhasil diperbarui.");
                } else {
                    const res = await axios.post("/api/units", form);
                    Toast.success(res.data.message || "Satuan berhasil ditambahkan.");
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
                title: "Hapus Satuan?",
                text: "Apakah Anda yakin ingin menghapus data satuan ukuran ini?",
                confirmButtonText: "Ya, Hapus Satuan",
            });

            if (!confirmed) return;

            try {
                const res = await axios.delete(`/api/units/${id}`);
                Toast.success(res.data.message || "Satuan berhasil dihapus.");
                loadData();
            } catch (err) {
                Toast.error(err.response?.data?.message || "Gagal menghapus data satuan.");
            }
        },
        [loadData]
    );

    return (
        <DashboardLayout>
            <Head title="Satuan Barang" />
            <div className="space-y-4">
                {/* Header Bar */}
                <PageHeaderBar
                    breadcrumbs={[
                        { label: "Master Data" },
                        { label: "Satuan Barang" },
                    ]}
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Cari satuan / simbol..."
                    onFilterClick={() => setIsFilterModalOpen(true)}
                    isFilterActive={isFilterActive}
                    onRefresh={loadData}
                    refreshing={loading}
                    onAdd={openCreateModal}
                    addTitle="Tambah Satuan Baru"
                    canCreate={canCreate}
                />

                {/* Unit Table */}
                <UnitTable
                    items={paginatedItems}
                    loading={loading}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    currentPage={currentPage}
                    totalItems={filteredItems.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(newSize) => {
                        setItemsPerPage(newSize);
                        setCurrentPage(1);
                    }}
                />

                {/* Filter Modal */}
                <SimpleFilterModal
                    isOpen={isFilterModalOpen}
                    title="Filter Satuan"
                    statusFilter={statusFilter}
                    onStatusFilterChange={(val) => {
                        setStatusFilter(val);
                        setCurrentPage(1);
                    }}
                    onReset={handleResetFilters}
                    onClose={() => setIsFilterModalOpen(false)}
                />

                {/* Unit Modal */}
                <UnitModal
                    isOpen={isModalOpen}
                    isEditing={Boolean(editingId)}
                    form={form}
                    submitting={submitting}
                    onClose={closeModal}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                />
            </div>
        </DashboardLayout>
    );
}
