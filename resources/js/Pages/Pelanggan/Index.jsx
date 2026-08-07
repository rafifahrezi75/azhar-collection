import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import CustomerModal from "@/Components/CustomerModal";
import CustomerDetailModal from "@/Components/CustomerDetailModal";
import CustomerTable from "@/Components/CustomerTable";
import CustomerFilterModal from "@/Components/CustomerFilterModal";
import { hasPermission } from "@/utils/permissions";
import { Toast, confirmDialog } from "@/utils/sweetalert";

export default function Index() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Create/Edit Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Detail Modal state
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const initialFormState = {
        code: "",
        name: "",
        type: "Perorangan",
        institution_name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
        is_active: true,
    };

    const [form, setForm] = useState(initialFormState);

    const canCreate = useMemo(() => hasPermission(permissions, "pelanggan.create"), [permissions]);
    const canUpdate = useMemo(() => hasPermission(permissions, "pelanggan.update"), [permissions]);
    const canDelete = useMemo(() => hasPermission(permissions, "pelanggan.delete"), [permissions]);

    const loadData = useCallback(() => {
        setLoading(true);
        axios
            .get("/api/customers")
            .then((response) => {
                setItems(response.data.data || []);
                setLoading(false);
            })
            .catch((err) => {
                Toast.error(err.response?.data?.message || "Gagal memuat data pelanggan.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isFilterActive = useMemo(
        () => typeFilter !== "all" || statusFilter !== "all",
        [typeFilter, statusFilter]
    );

    const handleResetFilters = useCallback(() => {
        setTypeFilter("all");
        setStatusFilter("all");
        setSearchTerm("");
        setCurrentPage(1);
    }, []);

    // Filter items
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.notes?.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesType = true;
            if (typeFilter !== "all") {
                matchesType = item.type?.toLowerCase().includes(typeFilter.toLowerCase());
            }

            let matchesStatus = true;
            if (statusFilter === "active") {
                matchesStatus = Boolean(item.is_active);
            } else if (statusFilter === "inactive") {
                matchesStatus = !Boolean(item.is_active);
            }

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [items, searchTerm, typeFilter, statusFilter]);

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

    const handleOpenCreateModal = () => {
        setEditingId(null);
        setForm(initialFormState);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingId(item.id);
        setForm({
            code: item.code || "",
            name: item.name || "",
            type: item.type || "Perorangan",
            institution_name: item.institution_name || "",
            contact_person: item.contact_person || "",
            phone: item.phone || "",
            email: item.email || "",
            address: item.address || "",
            notes: item.notes || "",
            is_active: Boolean(item.is_active),
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleOpenDetailModal = (item) => {
        setSelectedCustomer(item);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setSelectedCustomer(null);
        setIsDetailModalOpen(false);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingId) {
                const res = await axios.put(`/api/customers/${editingId}`, form);
                Toast.success(res.data.message || "Data pelanggan berhasil diperbarui.");
            } else {
                const res = await axios.post("/api/customers", form);
                Toast.success(res.data.message || "Data pelanggan berhasil ditambahkan.");
            }
            handleCloseModal();
            loadData();
        } catch (err) {
            Toast.error(
                err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(", ")
                    : "Terjadi kesalahan saat menyimpan data pelanggan.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (item) => {
        const confirmed = await confirmDialog(
            `Hapus Pelanggan '${item.name}'?`,
            "Data pelanggan ini akan dihapus dari sistem."
        );

        if (confirmed) {
            try {
                const res = await axios.delete(`/api/customers/${item.id}`);
                Toast.success(res.data.message || "Data pelanggan berhasil dihapus.");
                loadData();
            } catch (err) {
                Toast.error(err.response?.data?.message || "Gagal menghapus data pelanggan.");
            }
        }
    };

    return (
        <DashboardLayout>
            <Head title="Master Data Pelanggan - Azhar Collection" />

            <div className="space-y-4">
                {/* Unified PageHeaderBar */}
                <PageHeaderBar
                    breadcrumbs={[
                        { label: "Master Data" },
                        { label: "Data Pelanggan" },
                    ]}
                    searchValue={searchTerm}
                    onSearchChange={(val) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Cari pelanggan, kode, PIC, alamat..."
                    onFilterClick={() => setIsFilterModalOpen(true)}
                    isFilterActive={isFilterActive}
                    onRefresh={loadData}
                    refreshing={loading}
                    onAdd={handleOpenCreateModal}
                    addTitle="Tambah Pelanggan Baru"
                    canCreate={canCreate}
                />

                {/* Table Data with View Detail action and Pagination */}
                <CustomerTable
                    items={paginatedItems}
                    loading={loading}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    startIndex={(currentPage - 1) * itemsPerPage}
                    totalItems={filteredItems.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(val) => {
                        setItemsPerPage(val);
                        setCurrentPage(1);
                    }}
                    onViewDetail={handleOpenDetailModal}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDelete}
                />

                {/* Modal Detail */}
                <CustomerDetailModal
                    isOpen={isDetailModalOpen}
                    customer={selectedCustomer}
                    canEdit={canUpdate}
                    onClose={handleCloseDetailModal}
                    onEdit={handleOpenEditModal}
                />

                {/* Modal Create/Edit */}
                <CustomerModal
                    isOpen={isModalOpen}
                    isEditing={Boolean(editingId)}
                    form={form}
                    submitting={submitting}
                    onClose={handleCloseModal}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                />

                {/* Modal Filter */}
                <CustomerFilterModal
                    isOpen={isFilterModalOpen}
                    typeFilter={typeFilter}
                    statusFilter={statusFilter}
                    onClose={() => setIsFilterModalOpen(false)}
                    onChangeTypeFilter={(val) => {
                        setTypeFilter(val);
                        setCurrentPage(1);
                    }}
                    onChangeStatusFilter={(val) => {
                        setStatusFilter(val);
                        setCurrentPage(1);
                    }}
                    onReset={handleResetFilters}
                />
            </div>
        </DashboardLayout>
    );
}
