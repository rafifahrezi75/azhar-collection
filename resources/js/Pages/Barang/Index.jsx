import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import ItemTable from "@/Components/ItemTable";
import ItemFilterModal from "@/Components/ItemFilterModal";
import { hasPermission } from "@/utils/permissions";
import { Toast, confirmDialog } from "@/utils/sweetalert";

export default function Index() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [stockFilter, setStockFilter] = useState("all");
    const [stockTypeFilter, setStockTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const canCreate = useMemo(() => hasPermission(permissions, "barang.create"), [permissions]);
    const canUpdate = useMemo(() => hasPermission(permissions, "barang.update"), [permissions]);
    const canDelete = useMemo(() => hasPermission(permissions, "barang.delete"), [permissions]);

    const loadData = useCallback(() => {
        setLoading(true);
        Promise.all([axios.get("/api/items"), axios.get("/api/items/form-data")])
            .then(([itemsRes, formRes]) => {
                setItems(itemsRes.data.data || []);
                setCategories(formRes.data.categories || []);
                setUnits(formRes.data.units || []);
            })
            .catch((err) => {
                Toast.error(err.response?.data?.message || "Gagal memuat data barang.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isFilterActive = useMemo(() => {
        return selectedCategory !== "" || stockFilter !== "all" || stockTypeFilter !== "all" || statusFilter !== "all";
    }, [selectedCategory, stockFilter, stockTypeFilter, statusFilter]);

    const handleResetFilters = useCallback(() => {
        setSelectedCategory("");
        setStockFilter("all");
        setStockTypeFilter("all");
        setStatusFilter("all");
        setCurrentPage(1);
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const search = searchTerm.toLowerCase();
            const matchesSearch =
                !searchTerm ||
                item.name?.toLowerCase().includes(search) ||
                item.code?.toLowerCase().includes(search) ||
                item.description?.toLowerCase().includes(search);
            const matchesCategory = !selectedCategory || String(item.category_id) === String(selectedCategory);
            let matchesStock = true;
            if (stockFilter === "low") matchesStock = item.stock <= (item.min_stock || 0) && item.stock > 0;
            else if (stockFilter === "out") matchesStock = item.stock <= 0;
            else if (stockFilter === "safe") matchesStock = item.stock > (item.min_stock || 0);
            let matchesStockType = true;
            if (stockTypeFilter === "real") matchesStockType = Number(item.real_stock) > 0 || (!Boolean(item.is_estimated_stock) && Number(item.stock) > 0);
            else if (stockTypeFilter === "estimated") matchesStockType = Number(item.estimated_stock) > 0 || Boolean(item.is_estimated_stock);
            let matchesStatus = true;
            if (statusFilter === "active") matchesStatus = Boolean(item.is_active);
            else if (statusFilter === "inactive") matchesStatus = !Boolean(item.is_active);
            return matchesSearch && matchesCategory && matchesStock && matchesStockType && matchesStatus;
        });
    }, [items, searchTerm, selectedCategory, stockFilter, stockTypeFilter, statusFilter]);

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    useEffect(() => {
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
        if (currentPage > totalPages) setCurrentPage(1);
    }, [filteredItems.length, itemsPerPage, currentPage]);

    const handleSearchChange = useCallback((val) => {
        setSearchTerm(val);
        setCurrentPage(1);
    }, []);

    const handleFilterClick = useCallback(() => setIsFilterModalOpen((prev) => !prev), []);
    const closeFilter = useCallback(() => setIsFilterModalOpen(false), []);
    const handleRefresh = useCallback(() => {
        closeFilter();
        loadData();
    }, [closeFilter, loadData]);

    const openCreatePage = useCallback(() => {
        closeFilter();
        router.visit("/dashboard/barang/create");
    }, [closeFilter]);

    const openEditPage = useCallback((item) => {
        closeFilter();
        router.visit(`/dashboard/barang/${item.id}/edit`);
    }, [closeFilter]);

    const handleViewDetail = useCallback((item) => {
        closeFilter();
        router.visit(`/dashboard/barang/${item.id}`);
    }, [closeFilter]);

    const handleTakeStock = useCallback((item) => {
        closeFilter();
        router.visit(`/dashboard/barang/${item.id}/stock?type=out&from=table`);
    }, [closeFilter]);

    const handleAddStock = useCallback((item) => {
        closeFilter();
        router.visit(`/dashboard/barang/${item.id}/stock?type=in&from=table`);
    }, [closeFilter]);

    const handleDelete = useCallback(async (id) => {
        closeFilter();
        const confirmed = await confirmDialog({
            title: "Hapus Barang?",
            text: "Apakah Anda yakin ingin menghapus data barang/bahan ini?",
            confirmButtonText: "Ya, Hapus Barang",
        });
        if (!confirmed) return;
        try {
            const res = await axios.delete(`/api/items/${id}`);
            Toast.success(res.data.message || "Data barang berhasil dihapus.");
            loadData();
        } catch (err) {
            Toast.error(err.response?.data?.message || "Gagal menghapus data barang.");
        }
    }, [closeFilter, loadData]);

    return (
        <DashboardLayout>
            <Head title="Katalog Bahan Baku " />
            <div className="space-y-4">
                <PageHeaderBar
                    breadcrumbs={[{ label: "Master Data" }, { label: "Katalog Bahan Baku" }]}
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Cari barang / SKU..."
                    onFilterClick={handleFilterClick}
                    isFilterActive={isFilterActive}
                    filterContent={
                        <ItemFilterModal
                            isOpen={isFilterModalOpen}
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
                            stockFilter={stockFilter}
                            onStockFilterChange={(val) => { setStockFilter(val); setCurrentPage(1); }}
                            stockTypeFilter={stockTypeFilter}
                            onStockTypeFilterChange={(val) => { setStockTypeFilter(val); setCurrentPage(1); }}
                            statusFilter={statusFilter}
                            onStatusFilterChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                            onReset={handleResetFilters}
                            onClose={closeFilter}
                        />
                    }
                    onRefresh={handleRefresh}
                    refreshing={loading}
                    onAdd={openCreatePage}
                    addTitle="Tambah"
                    canCreate={canCreate}
                />

                <ItemTable
                    items={paginatedItems}
                    loading={loading}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onViewDetail={handleViewDetail}
                    onTakeStock={handleTakeStock}
                    onAddStock={handleAddStock}
                    onEdit={openEditPage}
                    onDelete={handleDelete}
                    currentPage={currentPage}
                    totalItems={filteredItems.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(newSize) => { setItemsPerPage(newSize); setCurrentPage(1); }}
                />
            </div>
        </DashboardLayout>
    );
}
