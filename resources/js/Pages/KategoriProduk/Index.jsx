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

const INITIAL_FORM_STATE = {
    name: "",
    description: "",
    is_active: true,
};

export default function Index() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        ...INITIAL_FORM_STATE,
    });

    const canCreate = useMemo(
        () =>
            hasPermission(
                permissions,
                "kategori-produk.create",
            ),
        [permissions],
    );

    const canUpdate = useMemo(
        () =>
            hasPermission(
                permissions,
                "kategori-produk.update",
            ),
        [permissions],
    );

    const canDelete = useMemo(
        () =>
            hasPermission(
                permissions,
                "kategori-produk.delete",
            ),
        [permissions],
    );

    const loadData = useCallback(() => {
        setLoading(true);

        axios
            .get("/api/product-categories")
            .then((response) => {
                setItems(response.data.data || []);
            })
            .catch((err) => {
                Toast.error(
                    err.response?.data?.message ||
                        "Gagal memuat data kategori produk.",
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isFilterActive = useMemo(
        () => statusFilter !== "all",
        [statusFilter],
    );

    const handleResetFilters = useCallback(() => {
        setStatusFilter("all");
        setCurrentPage(1);
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const search =
                searchTerm.toLowerCase();

            const matchesSearch =
                !searchTerm ||
                item.name
                    ?.toLowerCase()
                    .includes(search) ||
                item.slug
                    ?.toLowerCase()
                    .includes(search) ||
                item.description
                    ?.toLowerCase()
                    .includes(search);

            let matchesStatus = true;

            if (statusFilter === "active") {
                matchesStatus = Boolean(
                    item.is_active,
                );
            } else if (
                statusFilter === "inactive"
            ) {
                matchesStatus = !Boolean(
                    item.is_active,
                );
            }

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        items,
        searchTerm,
        statusFilter,
    ]);

    const totalFiltered =
        filteredItems.length;

    const totalPages = Math.max(
        1,
        Math.ceil(
            totalFiltered /
                itemsPerPage,
        ),
    );

    const paginatedItems = useMemo(() => {
        const start =
            (currentPage - 1) *
            itemsPerPage;

        return filteredItems.slice(
            start,
            start + itemsPerPage,
        );
    }, [
        filteredItems,
        currentPage,
        itemsPerPage,
    ]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const handleSearchChange =
        useCallback((val) => {
            setSearchTerm(val);
            setCurrentPage(1);
        }, []);

    const handleFilterClick =
        useCallback(() => {
            setIsFilterModalOpen(
                (prev) => !prev,
            );
        }, []);

    const closeFilter =
        useCallback(() => {
            setIsFilterModalOpen(false);
        }, []);

    const handleRefresh =
        useCallback(() => {
            closeFilter();
            loadData();
        }, [closeFilter, loadData]);

    const handleOpenCreateModal =
        useCallback(() => {
            closeFilter();

            setEditingId(null);

            setForm({
                ...INITIAL_FORM_STATE,
            });

            setIsModalOpen(true);
        }, [closeFilter]);

    const handleOpenEditModal =
        useCallback(
            (category) => {
                closeFilter();

                setEditingId(category.id);

                setForm({
                    name:
                        category.name || "",
                    description:
                        category.description ||
                        "",
                    is_active: Boolean(
                        category.is_active,
                    ),
                });

                setIsModalOpen(true);
            },
            [closeFilter],
        );

    const handleCloseModal =
        useCallback(() => {
            setIsModalOpen(false);
            setEditingId(null);

            setForm({
                ...INITIAL_FORM_STATE,
            });
        }, []);

    const handleFormChange =
        useCallback((e) => {
            const {
                name,
                value,
                type,
                checked,
            } = e.target;

            setForm((prev) => ({
                ...prev,
                [name]:
                    type === "checkbox"
                        ? checked
                        : value,
            }));
        }, []);

    const handleSubmit =
        useCallback(
            async (e) => {
                e.preventDefault();

                setSubmitting(true);

                const url = editingId
                    ? `/api/product-categories/${editingId}`
                    : "/api/product-categories";

                const method = editingId
                    ? "put"
                    : "post";

                try {
                    const response =
                        await axios[
                            method
                        ](url, form);

                    Toast.success(
                        response.data
                            .message ||
                            (editingId
                                ? "Kategori berhasil diperbarui."
                                : "Kategori berhasil ditambahkan."),
                    );

                    handleCloseModal();
                    loadData();
                } catch (err) {
                    Toast.error(
                        err.response?.data
                            ?.message ||
                            "Terjadi kesalahan saat menyimpan data.",
                    );
                } finally {
                    setSubmitting(false);
                }
            },
            [
                editingId,
                form,
                handleCloseModal,
                loadData,
            ],
        );

    const handleDelete =
        useCallback(
            async (category) => {
                closeFilter();

                const confirmed =
                    await confirmDialog({
                        title: `Hapus Kategori '${category.name}'?`,
                        text: "Pastikan kategori tidak sedang digunakan oleh produk pakaian aktif.",
                        confirmButtonText:
                            "Ya, Hapus Kategori",
                    });

                if (!confirmed) return;

                try {
                    const response =
                        await axios.delete(
                            `/api/product-categories/${category.id}`,
                        );

                    Toast.success(
                        response.data
                            .message ||
                            "Kategori berhasil dihapus.",
                    );

                    loadData();
                } catch (err) {
                    Toast.error(
                        err.response?.data
                            ?.message ||
                            "Gagal menghapus kategori produk.",
                    );
                }
            },
            [closeFilter, loadData],
        );

    return (
        <DashboardLayout>
            <Head title="Master Kategori Produk - Azhar Collection" />

            <div className="space-y-4">
                <PageHeaderBar
                    breadcrumbs={[
                        {
                            label: "Master Data",
                        },
                        {
                            label: "Kategori Produk",
                        },
                    ]}
                    searchValue={
                        searchTerm
                    }
                    onSearchChange={
                        handleSearchChange
                    }
                    searchPlaceholder="Cari kategori produk..."
                    onFilterClick={
                        handleFilterClick
                    }
                    isFilterActive={
                        isFilterActive
                    }
                    filterContent={
                        <SimpleFilterModal
                            isOpen={
                                isFilterModalOpen
                            }
                            title="Filter Produk"
                            statusFilter={
                                statusFilter
                            }
                            onStatusFilterChange={(
                                value,
                            ) => {
                                setStatusFilter(
                                    value,
                                );
                                setCurrentPage(1);
                            }}
                            onReset={
                                handleResetFilters
                            }
                            onClose={
                                closeFilter
                            }
                        />
                    }
                    onRefresh={
                        handleRefresh
                    }
                    refreshing={loading}
                    onAdd={
                        handleOpenCreateModal
                    }
                    addTitle="Tambah"
                    canCreate={
                        canCreate
                    }
                />

                <ProductCategoryTable
                    items={
                        paginatedItems
                    }
                    loading={loading}
                    canUpdate={
                        canUpdate
                    }
                    canDelete={
                        canDelete
                    }
                    onEdit={
                        handleOpenEditModal
                    }
                    onDelete={
                        handleDelete
                    }
                    currentPage={
                        currentPage
                    }
                    totalPages={
                        totalPages
                    }
                    totalItems={
                        totalFiltered
                    }
                    itemsPerPage={
                        itemsPerPage
                    }
                    onPageChange={(
                        page,
                    ) =>
                        setCurrentPage(
                            page,
                        )
                    }
                    onItemsPerPageChange={(
                        limit,
                    ) => {
                        setItemsPerPage(
                            limit,
                        );
                        setCurrentPage(1);
                    }}
                />

                <ProductCategoryModal
                    isOpen={
                        isModalOpen
                    }
                    isEditing={Boolean(
                        editingId,
                    )}
                    form={form}
                    submitting={
                        submitting
                    }
                    onClose={
                        handleCloseModal
                    }
                    onChange={
                        handleFormChange
                    }
                    onSubmit={
                        handleSubmit
                    }
                />
            </div>
        </DashboardLayout>
    );
}
