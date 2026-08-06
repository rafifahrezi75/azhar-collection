import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import ItemModal from "@/Components/ItemModal";
import ItemTable from "@/Components/ItemTable";
import ItemDetailModal from "@/Components/ItemDetailModal";
import StockActionModal from "@/Components/StockActionModal";
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

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [stockFilter, setStockFilter] = useState("all"); // "all" | "low" | "out" | "safe"
    const [stockTypeFilter, setStockTypeFilter] = useState("all"); // "all" | "real" | "estimated"
    const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Edit/Create Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Detail Modal state
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailItem, setDetailItem] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Stock Action (Take / Add Stock) Modal state
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockModalItem, setStockModalItem] = useState(null);
    const [stockActionType, setStockActionType] = useState("out"); // "out" | "in"
    const [stockSubmitting, setStockSubmitting] = useState(false);

    const initialFormState = {
        code: "",
        name: "",
        category_id: "",
        unit_id: "",
        stock: 0,
        real_stock: 0,
        estimated_stock: 0,
        is_estimated_stock: false,
        min_stock: 5,
        description: "",
        is_active: true,
        imageFile: null,
        existingImageUrl: null,
        removeImage: false,
        conversions: [],
    };

    const [form, setForm] = useState(initialFormState);

    const canCreate = useMemo(() => hasPermission(permissions, "barang.create"), [permissions]);
    const canUpdate = useMemo(() => hasPermission(permissions, "barang.update"), [permissions]);
    const canDelete = useMemo(() => hasPermission(permissions, "barang.delete"), [permissions]);

    const loadData = useCallback(() => {
        setLoading(true);
        Promise.all([
            axios.get("/api/items"),
            axios.get("/api/items/form-data"),
        ])
            .then(([itemsRes, formRes]) => {
                setItems(itemsRes.data.data || []);
                setCategories(formRes.data.categories || []);
                setUnits(formRes.data.units || []);
                setLoading(false);
            })
            .catch((err) => {
                Toast.error(err.response?.data?.message || "Gagal memuat data barang.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Check if any filter is active
    const isFilterActive = useMemo(() => {
        return (
            selectedCategory !== "" ||
            stockFilter !== "all" ||
            stockTypeFilter !== "all" ||
            statusFilter !== "all"
        );
    }, [selectedCategory, stockFilter, stockTypeFilter, statusFilter]);

    const handleResetFilters = useCallback(() => {
        setSelectedCategory("");
        setStockFilter("all");
        setStockTypeFilter("all");
        setStatusFilter("all");
        setCurrentPage(1);
    }, []);

    // Filter items locally
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory =
                !selectedCategory || String(item.category_id) === String(selectedCategory);

            let matchesStock = true;
            if (stockFilter === "low") {
                matchesStock = item.stock <= (item.min_stock || 0) && item.stock > 0;
            } else if (stockFilter === "out") {
                matchesStock = item.stock <= 0;
            } else if (stockFilter === "safe") {
                matchesStock = item.stock > (item.min_stock || 0);
            }

            let matchesStockType = true;
            if (stockTypeFilter === "real") {
                matchesStockType = Number(item.real_stock) > 0 || (!Boolean(item.is_estimated_stock) && Number(item.stock) > 0);
            } else if (stockTypeFilter === "estimated") {
                matchesStockType = Number(item.estimated_stock) > 0 || Boolean(item.is_estimated_stock);
            }

            let matchesStatus = true;
            if (statusFilter === "active") {
                matchesStatus = Boolean(item.is_active);
            } else if (statusFilter === "inactive") {
                matchesStatus = !Boolean(item.is_active);
            }

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStock &&
                matchesStockType &&
                matchesStatus
            );
        });
    }, [items, searchTerm, selectedCategory, stockFilter, stockTypeFilter, statusFilter]);

    // Paginated items
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    // Reset current page if filtered items change and page is out of bounds
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

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm((prev) => ({
                ...prev,
                imageFile: file,
                removeImage: false,
            }));
        }
    }, []);

    const handleRemoveImage = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            imageFile: null,
            removeImage: true,
        }));
    }, []);

    const handleAddConversion = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            conversions: [
                ...prev.conversions,
                { unit_id: "", multiplier: 10 },
            ],
        }));
    }, []);

    const handleRemoveConversion = useCallback((index) => {
        setForm((prev) => ({
            ...prev,
            conversions: prev.conversions.filter((_, i) => i !== index),
        }));
    }, []);

    const handleConversionChange = useCallback((index, field, value) => {
        setForm((prev) => {
            const updated = [...prev.conversions];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, conversions: updated };
        });
    }, []);

    const openCreateModal = useCallback(() => {
        setEditingId(null);
        setForm(initialFormState);
        setIsModalOpen(true);
    }, []);

    const openEditModal = useCallback((item) => {
        setEditingId(item.id);
        const mappedConversions = (item.conversions || []).map((c) => ({
            unit_id: String(c.unit_id),
            multiplier: c.multiplier,
            real_stock: c.real_stock ?? 0,
            estimated_stock: c.estimated_stock ?? 0,
            stock: c.stock ?? ((c.real_stock ?? 0) + (c.estimated_stock ?? 0)),
        }));

        const realStockVal = item.real_stock ?? 0;
        const estStockVal = item.estimated_stock ?? 0;

        setForm({
            code: item.code || "",
            name: item.name || "",
            category_id: String(item.category_id || ""),
            unit_id: String(item.unit_id || ""),
            stock: item.stock ?? (realStockVal + estStockVal),
            real_stock: realStockVal,
            estimated_stock: estStockVal,
            is_estimated_stock: estStockVal > 0 || Boolean(item.is_estimated_stock),
            min_stock: item.min_stock ?? 0,
            description: item.description || "",
            is_active: Boolean(item.is_active),
            imageFile: null,
            existingImageUrl: item.image_url || null,
            removeImage: false,
            conversions: mappedConversions,
        });
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialFormState);
    }, []);

    // View Details
    const handleViewDetail = useCallback((item) => {
        setDetailItem(item);
        setIsDetailOpen(true);
        setDetailLoading(true);

        axios.get(`/api/items/${item.id}`)
            .then((res) => {
                setDetailItem(res.data.data);
                setDetailLoading(false);
            })
            .catch(() => {
                setDetailLoading(false);
            });
    }, []);

    // Take Stock
    const handleTakeStock = useCallback((item) => {
        setStockModalItem(item);
        setStockActionType("out");
        setIsStockModalOpen(true);
    }, []);

    // Add Stock
    const handleAddStock = useCallback((item) => {
        setStockModalItem(item);
        setStockActionType("in");
        setIsStockModalOpen(true);
    }, []);

    // Submit Take/Add Stock
    const handleStockActionSubmit = useCallback(async (payload) => {
        if (!stockModalItem) return;
        setStockSubmitting(true);

        try {
            const res = await axios.post(`/api/items/${stockModalItem.id}/adjust-stock`, payload);
            Toast.success(res.data.message || "Mutasi stok berhasil dicatat.");
            setIsStockModalOpen(false);
            setStockModalItem(null);
            loadData();

            // Refresh detail item if open
            if (isDetailOpen && detailItem && detailItem.id === stockModalItem.id) {
                axios.get(`/api/items/${stockModalItem.id}`).then((r) => setDetailItem(r.data.data));
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Terjadi kesalahan saat memproses mutasi stok.";
            Toast.error(msg);
        } finally {
            setStockSubmitting(false);
        }
    }, [stockModalItem, isDetailOpen, detailItem, loadData]);

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();
            setSubmitting(true);

            const realStockNum = Number(form.real_stock) || 0;
            const estStockNum = Number(form.estimated_stock) || 0;
            const totalStockNum = realStockNum + estStockNum > 0 ? (realStockNum + estStockNum) : (Number(form.stock) || 0);

            const formData = new FormData();
            formData.append("code", form.code);
            formData.append("name", form.name);
            formData.append("category_id", form.category_id);
            formData.append("unit_id", form.unit_id);
            formData.append("real_stock", realStockNum);
            formData.append("estimated_stock", estStockNum);
            formData.append("stock", totalStockNum);
            formData.append("is_estimated_stock", (estStockNum > 0 || form.is_estimated_stock) ? "1" : "0");
            formData.append("min_stock", form.min_stock);
            formData.append("description", form.description || "");
            formData.append("is_active", form.is_active ? "1" : "0");
            formData.append("conversions", JSON.stringify(form.conversions));

            if (form.imageFile) {
                formData.append("image", form.imageFile);
            }
            if (form.removeImage) {
                formData.append("remove_image", "1");
            }

            try {
                if (editingId) {
                    const res = await axios.post(`/api/items/${editingId}`, formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    Toast.success(res.data.message || "Data barang berhasil diperbarui.");
                } else {
                    const res = await axios.post("/api/items", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    Toast.success(res.data.message || "Data barang berhasil ditambahkan.");
                }
                closeModal();
                loadData();
            } catch (err) {
                const message =
                    err.response?.data?.message ||
                    (err.response?.data?.errors
                        ? Object.values(err.response.data.errors).flat().join(", ")
                        : "Terjadi kesalahan saat menyimpan data barang.");
                Toast.error(message);
            } finally {
                setSubmitting(false);
            }
        },
        [editingId, form, closeModal, loadData]
    );

    const handleDelete = useCallback(
        async (id) => {
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
        },
        [loadData]
    );

    return (
        <DashboardLayout>
            <Head title="Katalog Barang" />
            <div className="space-y-4">
                {/* Minimalist Navigation Bar & Action Icons */}
                <PageHeaderBar
                    breadcrumbs={[
                        { label: "Master Data" },
                        { label: "Katalog Barang" },
                    ]}
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Cari barang / SKU..."
                    onFilterClick={() => setIsFilterModalOpen(true)}
                    isFilterActive={isFilterActive}
                    onRefresh={loadData}
                    refreshing={loading}
                    onAdd={openCreateModal}
                    addTitle="Tambah Barang Baru"
                    canCreate={canCreate}
                />

                {/* Minimalist Item Table */}
                <ItemTable
                    items={paginatedItems}
                    loading={loading}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onViewDetail={handleViewDetail}
                    onTakeStock={handleTakeStock}
                    onAddStock={handleAddStock}
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

                {/* Filter Dialog Modal */}
                <ItemFilterModal
                    isOpen={isFilterModalOpen}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={(val) => {
                        setSelectedCategory(val);
                        setCurrentPage(1);
                    }}
                    stockFilter={stockFilter}
                    onStockFilterChange={(val) => {
                        setStockFilter(val);
                        setCurrentPage(1);
                    }}
                    stockTypeFilter={stockTypeFilter}
                    onStockTypeFilterChange={(val) => {
                        setStockTypeFilter(val);
                        setCurrentPage(1);
                    }}
                    statusFilter={statusFilter}
                    onStatusFilterChange={(val) => {
                        setStatusFilter(val);
                        setCurrentPage(1);
                    }}
                    onReset={handleResetFilters}
                    onClose={() => setIsFilterModalOpen(false)}
                />

                {/* Create / Edit Modal Dialog */}
                <ItemModal
                    isOpen={isModalOpen}
                    isEditing={Boolean(editingId)}
                    form={form}
                    categories={categories}
                    units={units}
                    submitting={submitting}
                    onClose={closeModal}
                    onChange={handleFormChange}
                    onFileChange={handleFileChange}
                    onRemoveImage={handleRemoveImage}
                    onAddConversion={handleAddConversion}
                    onRemoveConversion={handleRemoveConversion}
                    onConversionChange={handleConversionChange}
                    onSubmit={handleSubmit}
                />

                {/* Item Detail Modal */}
                <ItemDetailModal
                    isOpen={isDetailOpen}
                    item={detailItem}
                    loading={detailLoading}
                    canUpdate={canUpdate}
                    onClose={() => {
                        setIsDetailOpen(false);
                        setDetailItem(null);
                    }}
                    onEdit={openEditModal}
                    onTakeStock={handleTakeStock}
                    onAddStock={handleAddStock}
                />

                {/* Stock Action (Ambil / Tambah Stok) Modal */}
                <StockActionModal
                    isOpen={isStockModalOpen}
                    item={stockModalItem}
                    type={stockActionType}
                    submitting={stockSubmitting}
                    onClose={() => {
                        setIsStockModalOpen(false);
                        setStockModalItem(null);
                    }}
                    onSubmit={handleStockActionSubmit}
                />
            </div>
        </DashboardLayout>
    );
}
