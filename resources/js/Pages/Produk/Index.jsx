import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import {
    Head,
    router,
    usePage,
} from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import SimpleFilterModal from "@/Components/SimpleFilterModal";
import ProductTable from "@/Components/ProductTable";
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
    const [categoryFilter, setCategoryFilter] =
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
                "produk.create",
            ),
        [permissions],
    );

    const canUpdate = useMemo(
        () =>
            hasPermission(
                permissions,
                "produk.update",
            ),
        [permissions],
    );

    const canDelete = useMemo(
        () =>
            hasPermission(
                permissions,
                "produk.delete",
            ),
        [permissions],
    );

    const loadData = useCallback(() => {
        setLoading(true);

        axios
            .get("/api/products")
            .then((res) => {
                setItems(res.data?.data || []);
            })
            .catch((err) => {
                Toast.error(
                    err.response?.data?.message ||
                        "Gagal memuat data produk",
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

    const handleFilterClick = useCallback(() => {
        setIsFilterModalOpen(
            (prev) => !prev,
        );
    }, []);

    const handleRefresh = useCallback(() => {
        closeFilter();
        loadData();
    }, [closeFilter, loadData]);

    const handleOpenCreatePage =
        useCallback(() => {
            closeFilter();

            router.visit(
                "/dashboard/produk/create",
            );
        }, [closeFilter]);

    const handleOpenEditPage =
        useCallback(
            (product) => {
                closeFilter();

                router.visit(
                    `/dashboard/produk/${product.id}/edit`,
                );
            },
            [closeFilter],
        );

    const handleOpenDetailPage =
        useCallback(
            (product) => {
                closeFilter();

                router.visit(
                    `/dashboard/produk/${product.id}`,
                );
            },
            [closeFilter],
        );

    const handleDelete = useCallback(
        async (product) => {
            closeFilter();

            const confirmed =
                await confirmDialog({
                    title: `Hapus Produk '${product.name}'?`,
                    text: "Resep bahan baku (BOM) terkait juga akan dihapus dari sistem.",
                    confirmButtonText:
                        "Ya, Hapus",
                });

            if (!confirmed) return;

            try {
                const res =
                    await axios.delete(
                        `/api/products/${product.id}`,
                    );

                Toast.success(
                    res.data?.message ||
                        "Produk berhasil dihapus",
                );

                loadData();
            } catch (err) {
                Toast.error(
                    err.response?.data?.message ||
                        "Gagal menghapus produk",
                );
            }
        },
        [closeFilter, loadData],
    );

    const existingCategories = useMemo(() => {
        const categories = new Set();

        items.forEach((item) => {
            if (item.category) {
                categories.add(item.category);
            }
        });

        return Array.from(categories).sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        const search =
            searchTerm.toLowerCase();

        return items.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                (item.name || "")
                    .toLowerCase()
                    .includes(search) ||
                (item.code || "")
                    .toLowerCase()
                    .includes(search) ||
                (item.category || "")
                    .toLowerCase()
                    .includes(search);

            const matchesCategory =
                categoryFilter === "all" ||
                (item.category || "") ===
                    categoryFilter;

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
                matchesCategory &&
                matchesStatus
            );
        });
    }, [
        items,
        searchTerm,
        categoryFilter,
        statusFilter,
    ]);

    const isFilterActive = useMemo(
        () =>
            categoryFilter !== "all" ||
            statusFilter !== "all",
        [categoryFilter, statusFilter],
    );

    const handleResetFilters =
        useCallback(() => {
            setCategoryFilter("all");
            setStatusFilter("all");
            setCurrentPage(1);
        }, []);

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
        useCallback((value) => {
            setSearchTerm(value);
            setCurrentPage(1);
        }, []);

    return (
        <DashboardLayout>
            <Head title="Master Produk Jadi & Resep BOM - Azhar Collection" />

            <div className="space-y-4">
                <PageHeaderBar
                    breadcrumbs={[
                        {
                            label: "Master Data",
                        },
                        {
                            label: "Master Produk Jadi (BOM)",
                        },
                    ]}
                    searchValue={
                        searchTerm
                    }
                    onSearchChange={
                        handleSearchChange
                    }
                    searchPlaceholder="Cari produk, kode, kategori..."
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
                            extraFilter={
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Kategori
                                    </label>

                                    <select
                                        value={
                                            categoryFilter
                                        }
                                        onChange={(
                                            e,
                                        ) => {
                                            setCategoryFilter(
                                                e
                                                    .target
                                                    .value,
                                            );
                                            setCurrentPage(
                                                1,
                                            );
                                        }}
                                        className="w-full h-8 px-2.5 border border-slate-200 rounded-md bg-slate-50 text-xs font-semibold text-slate-700 outline-none transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 cursor-pointer"
                                    >
                                        <option value="all">
                                            Semua
                                            Kategori
                                        </option>

                                        {existingCategories.map(
                                            (
                                                category,
                                            ) => (
                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                            }
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
                        handleOpenCreatePage
                    }
                    addTitle="Tambah"
                    canCreate={canCreate}
                />

                <ProductTable
                    products={
                        paginatedItems
                    }
                    loading={loading}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onViewDetail={
                        handleOpenDetailPage
                    }
                    onEdit={
                        handleOpenEditPage
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
            </div>
        </DashboardLayout>
    );
}
