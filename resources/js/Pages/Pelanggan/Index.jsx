import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import { Head, usePage, router } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import CustomerTable from "@/Components/CustomerTable";
import CustomerFilterModal from "@/Components/CustomerFilterModal";
import { hasPermission } from "@/utils/permissions";
import {
    Toast,
    confirmDialog,
} from "@/utils/sweetalert";

export default function Index() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] =
        useState("all");
    const [statusFilter, setStatusFilter] =
        useState("all");
    const [
        isFilterModalOpen,
        setIsFilterModalOpen,
    ] = useState(false);

    const [currentPage, setCurrentPage] =
        useState(1);
    const [itemsPerPage, setItemsPerPage] =
        useState(10);

    const canCreate = useMemo(
        () =>
            hasPermission(
                permissions,
                "pelanggan.create",
            ),
        [permissions],
    );

    const canUpdate = useMemo(
        () =>
            hasPermission(
                permissions,
                "pelanggan.update",
            ),
        [permissions],
    );

    const canDelete = useMemo(
        () =>
            hasPermission(
                permissions,
                "pelanggan.delete",
            ),
        [permissions],
    );

    const loadData = useCallback(() => {
        setLoading(true);

        axios
            .get("/api/customers")
            .then((response) => {
                setItems(
                    response.data.data || [],
                );
            })
            .catch((err) => {
                Toast.error(
                    err.response?.data?.message ||
                        "Gagal memuat data pelanggan.",
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const closeFilter = useCallback(() => {
        setIsFilterModalOpen(false);
    }, []);

    const handleFilterClick =
        useCallback(() => {
            setIsFilterModalOpen(
                (prev) => !prev,
            );
        }, []);

    const isFilterActive = useMemo(
        () =>
            typeFilter !== "all" ||
            statusFilter !== "all",
        [typeFilter, statusFilter],
    );

    const handleResetFilters =
        useCallback(() => {
            setTypeFilter("all");
            setStatusFilter("all");
            setCurrentPage(1);
        }, []);

    const filteredItems = useMemo(() => {
        const search =
            searchTerm.toLowerCase();

        return items.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                item.name
                    ?.toLowerCase()
                    .includes(search) ||
                item.code
                    ?.toLowerCase()
                    .includes(search) ||
                item.type
                    ?.toLowerCase()
                    .includes(search) ||
                item.institution_name
                    ?.toLowerCase()
                    .includes(search) ||
                item.contact_person
                    ?.toLowerCase()
                    .includes(search) ||
                item.address
                    ?.toLowerCase()
                    .includes(search) ||
                item.phone
                    ?.toLowerCase()
                    .includes(search) ||
                item.notes
                    ?.toLowerCase()
                    .includes(search);

            let matchesType = true;

            if (typeFilter !== "all") {
                matchesType = item.type
                    ?.toLowerCase()
                    .includes(
                        typeFilter.toLowerCase(),
                    );
            }

            let matchesStatus = true;

            if (
                statusFilter === "active"
            ) {
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
                matchesType &&
                matchesStatus
            );
        });
    }, [
        items,
        searchTerm,
        typeFilter,
        statusFilter,
    ]);

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
        const totalPages =
            Math.ceil(
                filteredItems.length /
                    itemsPerPage,
            ) || 1;

        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [
        filteredItems.length,
        itemsPerPage,
        currentPage,
    ]);

    const handleOpenCreateModal = useCallback(() => {
        router.visit("/dashboard/pelanggan/create");
    }, []);

    const handleOpenEditModal = useCallback((item) => {
        router.visit(`/dashboard/pelanggan/${item.id}/edit`);
    }, []);

    const handleOpenDetailModal = useCallback((item) => {
        router.visit(`/dashboard/pelanggan/${item.id}`);
    }, []);

    const handleDelete = useCallback(
        async (item) => {
            closeFilter();

            const confirmed =
                await confirmDialog({
                    title: `Hapus Pelanggan '${item.name}'?`,
                    text: "Data pelanggan ini akan dihapus dari sistem.",
                    confirmButtonText:
                        "Ya, Hapus",
                });

            if (!confirmed) return;

            try {
                const res =
                    await axios.delete(
                        `/api/customers/${item.id}`,
                    );

                Toast.success(
                    res.data.message ||
                        "Data pelanggan berhasil dihapus.",
                );

                loadData();
            } catch (err) {
                Toast.error(
                    err.response?.data
                        ?.message ||
                        "Gagal menghapus data pelanggan.",
                );
            }
        },
        [closeFilter, loadData],
    );

    const handleRefresh =
        useCallback(() => {
            closeFilter();
            loadData();
        }, [closeFilter, loadData]);

    return (
        <DashboardLayout>
            <Head title="Master Data Pelanggan - Azhar Collection" />

            <div className="space-y-4">
                <PageHeaderBar
                    breadcrumbs={[
                        {
                            label: "Master Data",
                        },
                        {
                            label: "Data Pelanggan",
                        },
                    ]}
                    searchValue={
                        searchTerm
                    }
                    onSearchChange={(
                        val,
                    ) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Cari pelanggan, kode, PIC, alamat..."
                    onFilterClick={
                        handleFilterClick
                    }
                    isFilterActive={
                        isFilterActive
                    }
                    filterContent={
                        <CustomerFilterModal
                            isOpen={
                                isFilterModalOpen
                            }
                            typeFilter={
                                typeFilter
                            }
                            statusFilter={
                                statusFilter
                            }
                            onClose={
                                closeFilter
                            }
                            onChangeTypeFilter={(
                                val,
                            ) => {
                                setTypeFilter(
                                    val,
                                );
                                setCurrentPage(1);
                            }}
                            onChangeStatusFilter={(
                                val,
                            ) => {
                                setStatusFilter(
                                    val,
                                );
                                setCurrentPage(1);
                            }}
                            onReset={
                                handleResetFilters
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
                    canCreate={canCreate}
                />

                <CustomerTable
                    items={
                        paginatedItems
                    }
                    loading={loading}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    startIndex={
                        (currentPage - 1) *
                        itemsPerPage
                    }
                    totalItems={
                        filteredItems.length
                    }
                    itemsPerPage={
                        itemsPerPage
                    }
                    currentPage={
                        currentPage
                    }
                    onPageChange={
                        setCurrentPage
                    }
                    onItemsPerPageChange={(
                        val,
                    ) => {
                        setItemsPerPage(
                            val,
                        );
                        setCurrentPage(1);
                    }}
                    onViewDetail={
                        handleOpenDetailModal
                    }
                    onEdit={
                        handleOpenEditModal
                    }
                    onDelete={
                        handleDelete
                    }
                />
            </div>
        </DashboardLayout>
    );
}
