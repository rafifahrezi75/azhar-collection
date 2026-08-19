import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import SimpleFilterModal from "@/Components/SimpleFilterModal";
import ProductModal from "@/Components/ProductModal";
import ProductDetailModal from "@/Components/ProductDetailModal";
import ProductTable from "@/Components/ProductTable";
import { hasPermission } from "@/utils/permissions";
import { Toast, confirmDialog } from "@/utils/sweetalert";

export default function Index() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal Create / Edit state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Detail Modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const initialFormState = {
        code: "",
        name: "",
        category: "",
        default_unit: "Stel",
        base_price: 0,
        description: "",
        is_active: true,
        sizes: [],
        materials: [],
        existing_images: [],
        new_images: [],
        deleted_image_ids: [],
        primary_image_id: null,
        primary_image_index: null,
        production_steps: [],
    };

    const [form, setForm] = useState(initialFormState);

    const canCreate = useMemo(() => hasPermission(permissions, "produk.create"), [permissions]);
    const canUpdate = useMemo(() => hasPermission(permissions, "produk.update"), [permissions]);
    const canDelete = useMemo(() => hasPermission(permissions, "produk.delete"), [permissions]);

    const loadData = useCallback(() => {
        setLoading(true);
        axios
            .get("/api/products")
            .then((res) => {
                setItems(res.data?.data || []);
            })
            .catch(() => {
                Toast.error("Gagal memuat data produk");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSizesChange = (sizes) => {
        setForm((prev) => ({ ...prev, sizes }));
    };

    const handleMaterialsChange = (materials) => {
        setForm((prev) => ({ ...prev, materials }));
    };

    const handleImagesChange = (updatedForm) => {
        setForm(updatedForm);
    };

    const handleProductionStepsChange = (production_steps) => {
        setForm((prev) => ({ ...prev, production_steps }));
    };

    const handleOpenCreateModal = () => {
        setEditingId(null);
        setForm(initialFormState);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setEditingId(product.id);
        const primaryImg = (product.images || []).find((i) => i.is_primary);
        setForm({
            code: product.code,
            name: product.name,
            category: product.category || "",
            default_unit: product.default_unit || "Stel",
            base_price: product.base_price || 0,
            description: product.description || "",
            is_active: Boolean(product.is_active),
            sizes: (product.sizes || []).map((s) => ({
                size_name: s.size_name,
                price: s.price,
                notes: s.notes || "",
            })),
            materials: (product.materials || []).map((m) => ({
                item_id: m.item_id,
                size_name: m.size_name || "ALL",
                required_qty: m.required_qty,
                yield_qty: m.yield_qty ?? 1,
                unit_name: m.unit_name || m.item?.usage_unit || m.item?.unit?.name || "Meter",
                notes: m.notes || "",
            })),
            existing_images: (product.images || []).map((img) => ({
                id: img.id,
                image_path: img.image_path,
                image_url: img.image_url,
                is_primary: Boolean(img.is_primary),
            })),
            new_images: [],
            deleted_image_ids: [],
            primary_image_id: primaryImg ? primaryImg.id : null,
            primary_image_index: null,
            production_steps: (product.production_steps || []).map((ps) => ({
                production_step_id: ps.production_step_id,
                step_order: ps.sort_order,
                wage: ps.wage,
            })),
        });
        setIsModalOpen(true);
    };

    const handleOpenDetailModal = (product) => {
        setSelectedProduct(product);
        setIsDetailModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialFormState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append("code", form.code || "");
        formData.append("name", form.name || "");
        formData.append("category", form.category || "");
        formData.append("default_unit", form.default_unit || "Stel");
        formData.append("base_price", form.base_price ?? 0);
        formData.append("description", form.description || "");
        formData.append("is_active", form.is_active ? "1" : "0");
        const validSizes = (form.sizes || []).filter(s => s.size_id);
        const validMaterials = (form.materials || []).filter(m => m.item_id);
        const validSteps = (form.production_steps || []).filter(s => s.production_step_id);

        formData.append("sizes", JSON.stringify(validSizes));
        formData.append("materials", JSON.stringify(validMaterials));
        formData.append("production_steps", JSON.stringify(validSteps));

        if (form.deleted_image_ids && form.deleted_image_ids.length > 0) {
            formData.append("deleted_image_ids", JSON.stringify(form.deleted_image_ids));
        }
        if (form.primary_image_id) {
            formData.append("primary_image_id", form.primary_image_id);
        }
        if (form.primary_image_index !== null && form.primary_image_index !== undefined) {
            formData.append("primary_image_index", form.primary_image_index);
        }

        if (form.new_images && form.new_images.length > 0) {
            form.new_images.forEach((imgObj) => {
                if (imgObj.file) {
                    formData.append("images[]", imgObj.file);
                }
            });
        }

        const url = editingId ? `/api/products/${editingId}` : "/api/products";
        if (editingId) {
            formData.append("_method", "PUT");
        }

        try {
            const res = await axios.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            Toast.success(res.data?.message || (editingId ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan"));
            handleCloseModal();
            loadData();
        } catch (err) {
            const message = err.response?.data?.message || "Terjadi kesalahan saat menyimpan data";
            Toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (product) => {
        const confirmed = await confirmDialog(
            `Hapus Produk '${product.name}'?`,
            "Resep bahan baku (BOM) terkait juga akan dihapus dari sistem."
        );

        if (confirmed) {
            try {
                const res = await axios.delete(`/api/products/${product.id}`);
                Toast.success(res.data?.message || "Produk berhasil dihapus");
                loadData();
            } catch (err) {
                const message = err.response?.data?.message || "Gagal menghapus produk";
                Toast.error(message);
            }
        }
    };

    // Categories list for filter modal
    const existingCategories = useMemo(() => {
        const cats = new Set();
        items.forEach((i) => {
            if (i.category) cats.add(i.category);
        });
        return Array.from(cats);
    }, [items]);

    // Filter and search logic
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.category || "").toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory =
                categoryFilter === "all" || (item.category || "") === categoryFilter;

            let matchesStatus = true;
            if (statusFilter === "active") {
                matchesStatus = Boolean(item.is_active);
            } else if (statusFilter === "inactive") {
                matchesStatus = !Boolean(item.is_active);
            }

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [items, searchTerm, categoryFilter, statusFilter]);

    const isFilterActive = categoryFilter !== "all" || statusFilter !== "all";

    // Pagination calculations
    const totalFiltered = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    return (
        <DashboardLayout>
            <Head title="Master Produk Jadi & Resep BOM - Azhar Collection" />

            <div className="space-y-4">
                {/* Unified PageHeaderBar */}
                <PageHeaderBar
                    breadcrumbs={[
                        { label: "Master Data" },
                        { label: "Master Produk Jadi (BOM)" },
                    ]}
                    searchValue={searchTerm}
                    onSearchChange={(val) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Cari produk, kode, kategori..."
                    onFilterClick={() => setIsFilterModalOpen(true)}
                    isFilterActive={isFilterActive}
                    onRefresh={loadData}
                    refreshing={loading}
                    onAdd={handleOpenCreateModal}
                    addTitle="Tambah Produk Baru"
                    canCreate={canCreate}
                />

                {/* Main Table */}
                <ProductTable
                    products={paginatedItems}
                    loading={loading}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onViewDetail={handleOpenDetailModal}
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
                title="Filter Produk"
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                extraFilter={
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Kategori
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:border-teal-500 bg-white"
                        >
                            <option value="all">Semua Kategori</option>
                            {existingCategories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                }
                onReset={() => {
                    setCategoryFilter("all");
                    setStatusFilter("all");
                }}
                onClose={() => setIsFilterModalOpen(false)}
            />

            {/* Create/Edit Modal */}
            <ProductModal
                isOpen={isModalOpen}
                isEditing={Boolean(editingId)}
                form={form}
                submitting={submitting}
                onClose={handleCloseModal}
                onChange={handleFormChange}
                onSizesChange={handleSizesChange}
                onMaterialsChange={handleMaterialsChange}
                onImagesChange={handleImagesChange}
                onProductionStepsChange={handleProductionStepsChange}
                onSubmit={handleSubmit}
            />

            {/* Detail Modal */}
            <ProductDetailModal
                isOpen={isDetailModalOpen}
                product={selectedProduct}
                canEdit={canUpdate}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedProduct(null);
                }}
                onEdit={handleOpenEditModal}
            />
        </DashboardLayout>
    );
}
