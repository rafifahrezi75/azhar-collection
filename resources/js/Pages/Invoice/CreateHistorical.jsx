import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import CustomerModal from "@/Components/CustomerModal";
import SizeBreakdownModal from "@/Components/SizeBreakdownModal";
import { Toast, confirmDialog } from "@/utils/sweetalert";
import {
    History,
    Receipt,
    Calendar,
    User,
    Plus,
    Trash2,
    Ruler,
    Layers,
    Package,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    Save,
    RefreshCw,
    Info,
    DollarSign,
    Percent,
    Shirt,
} from "lucide-react";

export default function CreateHistorical() {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingResources, setLoadingResources] = useState(true);

    // Quick Add Customer Modal
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [customerSubmitting, setCustomerSubmitting] = useState(false);
    const [customerForm, setCustomerForm] = useState({
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
    });

    // Size Breakdown Modal
    const [activeSizeItemIndex, setActiveSizeItemIndex] = useState(null);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

    // Main Invoice Form State
    const [isAutoInvoiceNumber, setIsAutoInvoiceNumber] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        invoice_number: "",
        customer_id: "",
        customer_name: "",
        order_date: new Date().toISOString().split("T")[0],
        completion_date: new Date().toISOString().split("T")[0],
        type: "HISTORICAL",
        discount: 0,
        paid_amount: 0,
        payment_status: "LUNAS",
        production_status: "SELESAI",
        cut_stock: false,
        notes: "Pencatatan data pesanan / nota historis lama.",
        items: [
            {
                product_id: "",
                item_name: "",
                unit: "Stel",
                qty: 1,
                unit_price: 0,
                subtotal: 0,
                size_breakdown: {},
                description: "",
            },
        ],
    });

    // Load Customers and Products
    const fetchResources = useCallback(async () => {
        setLoadingResources(true);
        try {
            const [custRes, prodRes] = await Promise.all([
                axios.get("/api/customers?status=active"),
                axios.get("/api/products?status=active"),
            ]);
            setCustomers(custRes.data?.data || []);
            setProducts(prodRes.data?.data || []);
        } catch {
            Toast.fire({
                icon: "error",
                title: "Gagal memuat data pelanggan / produk",
            });
        } finally {
            setLoadingResources(false);
        }
    }, []);

    // Fetch Next Invoice Number
    const fetchNextInvoiceNumber = useCallback(async (year) => {
        try {
            const currentYear = year || (form.order_date ? form.order_date.split("-")[0] : new Date().getFullYear());
            const res = await axios.get(`/api/invoices/next-number?year=${currentYear}`);
            if (res.data?.invoice_number) {
                setForm((prev) => ({ ...prev, invoice_number: res.data.invoice_number }));
            }
        } catch {
            setForm((prev) => ({ ...prev, invoice_number: `INV-${new Date().getFullYear()}-001` }));
        }
    }, [form.order_date]);

    useEffect(() => {
        fetchResources();
        fetchNextInvoiceNumber();
    }, [fetchResources]);

    // Handle Order Date change (can re-generate prefix year if auto)
    const handleOrderDateChange = (newDate) => {
        setForm((prev) => ({ ...prev, order_date: newDate }));
        if (isAutoInvoiceNumber && newDate) {
            const yr = newDate.split("-")[0];
            fetchNextInvoiceNumber(yr);
        }
    };

    // Handle Customer Selection
    const handleCustomerChange = (customerId) => {
        const found = customers.find((c) => String(c.id) === String(customerId));
        setForm((prev) => ({
            ...prev,
            customer_id: customerId,
            customer_name: found ? found.name : prev.customer_name,
        }));
    };

    // Quick Add Customer Handler
    const handleSaveQuickCustomer = async (e) => {
        e.preventDefault();
        setCustomerSubmitting(true);
        try {
            const res = await axios.post("/api/customers", customerForm);
            Toast.fire({
                icon: "success",
                title: "Pelanggan baru berhasil ditambahkan",
            });
            setIsCustomerModalOpen(false);
            // Refresh customer list and auto-select new customer
            const newCust = res.data?.data;
            await fetchResources();
            if (newCust) {
                setForm((prev) => ({
                    ...prev,
                    customer_id: newCust.id,
                    customer_name: newCust.name,
                }));
            }
        } catch (err) {
            Toast.fire({
                icon: "error",
                title: err.response?.data?.message || "Gagal menyimpan data pelanggan",
            });
        } finally {
            setCustomerSubmitting(false);
        }
    };

    // Item Operations
    const handleAddItemRow = () => {
        setForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    product_id: "",
                    item_name: "",
                    unit: "Stel",
                    qty: 1,
                    unit_price: 0,
                    subtotal: 0,
                    size_breakdown: {},
                    description: "",
                },
            ],
        }));
    };

    const handleRemoveItemRow = (index) => {
        if (form.items.length <= 1) {
            Toast.fire({
                icon: "warning",
                title: "Minimal harus ada 1 baris item pesanan",
            });
            return;
        }
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, idx) => idx !== index),
        }));
    };

    const handleItemFieldChange = (index, field, value) => {
        setForm((prev) => {
            const updatedItems = [...prev.items];
            const currentItem = { ...updatedItems[index], [field]: value };

            // If product_id changed, auto fill item_name, unit, base_price
            if (field === "product_id") {
                const prod = products.find((p) => String(p.id) === String(value));
                if (prod) {
                    currentItem.item_name = prod.name;
                    currentItem.unit = prod.default_unit || "Stel";
                    currentItem.unit_price = prod.base_price || 0;
                }
            }

            // Recalculate subtotal for this item
            const qty = parseInt(currentItem.qty) || 0;
            const price = parseFloat(currentItem.unit_price) || 0;
            currentItem.subtotal = qty * price;

            updatedItems[index] = currentItem;
            return { ...prev, items: updatedItems };
        });
    };

    // Size Breakdown Handlers
    const handleOpenSizeModal = (index) => {
        setActiveSizeItemIndex(index);
        setIsSizeModalOpen(true);
    };

    const handleSaveSizeBreakdown = (breakdown, totalQty, calculatedSubtotal, effectiveUnitPrice) => {
        if (activeSizeItemIndex !== null) {
            setForm((prev) => {
                const updatedItems = [...prev.items];
                const currentItem = { ...updatedItems[activeSizeItemIndex] };
                currentItem.size_breakdown = breakdown;
                if (totalQty > 0) {
                    currentItem.qty = totalQty;
                    if (calculatedSubtotal && calculatedSubtotal > 0) {
                        currentItem.subtotal = calculatedSubtotal;
                        currentItem.unit_price = effectiveUnitPrice;
                    } else {
                        const price = parseFloat(currentItem.unit_price) || 0;
                        currentItem.subtotal = totalQty * price;
                    }
                }
                updatedItems[activeSizeItemIndex] = currentItem;
                return { ...prev, items: updatedItems };
            });
        }
    };

    // Financial Calculations
    const subtotal = useMemo(() => {
        return form.items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
    }, [form.items]);

    const discountVal = parseFloat(form.discount) || 0;
    const totalAmount = Math.max(0, subtotal - discountVal);
    const paidAmount = parseFloat(form.paid_amount) || 0;
    const remainingBalance = Math.max(0, totalAmount - paidAmount);

    // Auto update paid amount when payment status is LUNAS
    useEffect(() => {
        if (form.payment_status === "LUNAS") {
            setForm((prev) => ({ ...prev, paid_amount: totalAmount }));
        } else if (form.payment_status === "BELUM_LUNAS") {
            setForm((prev) => ({ ...prev, paid_amount: 0 }));
        }
    }, [form.payment_status, totalAmount]);

    // Live Bill of Materials (BOM) Requirements Calculation (2-Stage Yield & Conversion)
    const materialRequirements = useMemo(() => {
        const requirementsMap = {};

        form.items.forEach((item) => {
            if (!item.product_id) return;
            const prod = products.find((p) => String(p.id) === String(item.product_id));
            if (!prod || !prod.materials) return;

            const breakdown = item.size_breakdown || {};
            const hasBreakdown = Object.keys(breakdown).length > 0;
            const totalLineQty = Number(item.qty) || 0;

            prod.materials.forEach((mat) => {
                const raw = mat.item;
                if (!raw) return;

                const rawId = raw.id;
                const usageUnit = mat.unit_name || raw.usage_unit || raw.unit?.name || "Meter";
                const warehouseUnit = raw.unit?.name || "Kg";
                const convRate = parseFloat(mat.conversion_rate ?? raw.conversion_rate) || 1.0;
                const yieldQty = parseFloat(mat.yield_qty) || 1.0;
                const reqPerYield = parseFloat(mat.required_qty) || 0.0;

                let lineUsageQty = 0;
                if (hasBreakdown && mat.size_name && mat.size_name !== "ALL") {
                    const sizeQty = Number(breakdown[mat.size_name]) || 0;
                    lineUsageQty = (sizeQty / yieldQty) * reqPerYield;
                } else if (!hasBreakdown || mat.size_name === "ALL" || !mat.size_name) {
                    lineUsageQty = (totalLineQty / yieldQty) * reqPerYield;
                }

                if (lineUsageQty <= 0) return;

                const warehouseDeduction = lineUsageQty / convRate;

                if (!requirementsMap[rawId]) {
                    requirementsMap[rawId] = {
                        item_id: rawId,
                        item_name: raw.name,
                        item_code: raw.code,
                        unit_name: usageUnit,
                        warehouse_unit: warehouseUnit,
                        conv_rate: convRate,
                        total_needed: 0,
                        warehouse_deduction: 0,
                        current_stock: raw.real_stock ?? 0,
                    };
                }
                requirementsMap[rawId].total_needed += lineUsageQty;
                requirementsMap[rawId].warehouse_deduction += warehouseDeduction;
            });
        });

        return Object.values(requirementsMap);
    }, [form.items, products]);

    // Save Invoice
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.invoice_number.trim()) {
            Toast.fire({ icon: "warning", title: "Nomor invoice wajib diisi" });
            return;
        }

        if (!form.customer_name.trim()) {
            Toast.fire({ icon: "warning", title: "Nama pelanggan wajib diisi atau dipilih" });
            return;
        }

        if (form.items.length === 0) {
            Toast.fire({ icon: "warning", title: "Tambahkan setidaknya 1 item pesanan" });
            return;
        }

        for (let i = 0; i < form.items.length; i++) {
            const itm = form.items[i];
            if (!itm.item_name.trim()) {
                Toast.fire({ icon: "warning", title: `Nama produk pada baris #${i + 1} wajib diisi` });
                return;
            }
            if (itm.qty <= 0) {
                Toast.fire({ icon: "warning", title: `Kuantitas baris #${i + 1} harus lebih dari 0` });
                return;
            }
        }

        const confirmMsg = form.cut_stock
            ? `Invoice #${form.invoice_number} akan disimpan dan STOK BAHAN BAKU DI GUDANG AKAN DIPOTONG sesuai resep BOM.`
            : `Invoice #${form.invoice_number} akan dicatat sebagai data historis (Stok bahan gudang TIDAK dipotong).`;

        const result = await confirmDialog({
            title: "Simpan Invoice Historis?",
            text: confirmMsg,
            confirmButtonText: "Ya, Simpan Invoice!",
        });

        if (!result.isConfirmed) return;

        setSubmitting(true);

        const payload = {
            ...form,
            subtotal,
            discount: discountVal,
            total_amount: totalAmount,
            paid_amount: paidAmount,
        };

        try {
            const res = await axios.post("/api/invoices", payload);
            Toast.fire({
                icon: "success",
                title: res.data?.message || "Invoice historis berhasil disimpan!",
            });
            router.visit("/dashboard/invoice");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Gagal menyimpan invoice";
            Toast.fire({
                icon: "error",
                title: errorMsg,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <DashboardLayout>
            <Head title="Input Invoice Lama (Data Historis)" />

            <form onSubmit={handleSubmit} className="space-y-4 pb-12">
                {/* Top Back & Action Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit("/dashboard/invoice")}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Kembali ke Daftar Invoice"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                    Input Invoice Lama (Data Historis)
                                </h2>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    <History className="w-3 h-3" />
                                    <span>Migrasi Arsip</span>
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Catat nota masa lalu untuk arsip omset, rekap pesanan stel/pcs, dan pemetaan bahan baku.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={() => router.visit("/dashboard/invoice")}
                            className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan Invoice...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Simpan Invoice Historis</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Grid 2 Columns: Main Info (Left) & Finance / Switch (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    
                    {/* LEFT COLUMN: IDENTITAS NOTA & DATA PELANGGAN (Col 8) */}
                    <div className="lg:col-span-8 space-y-4">
                        
                        {/* Section: Identitas & Tanggal */}
                        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs space-y-3">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                <Receipt className="w-4 h-4 text-teal-600" />
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Informasi Nota & Pelanggan
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Nomor Invoice */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Nomor Invoice / Nota <span className="text-rose-500">*</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isAutoInvoiceNumber}
                                                onChange={(e) => {
                                                    setIsAutoInvoiceNumber(e.target.checked);
                                                    if (e.target.checked) fetchNextInvoiceNumber();
                                                }}
                                                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3 h-3"
                                            />
                                            <span>Otomatis</span>
                                        </label>
                                    </div>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            value={form.invoice_number}
                                            onChange={(e) => setForm((p) => ({ ...p, invoice_number: e.target.value }))}
                                            readOnly={isAutoInvoiceNumber}
                                            placeholder="Contoh: INV-2024-001 atau No. Nota Fisik"
                                            required
                                            className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden transition-all ${
                                                isAutoInvoiceNumber
                                                    ? "bg-slate-100/80 text-slate-600 border-slate-200 cursor-not-allowed"
                                                    : "bg-white border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                            }`}
                                        />
                                        {isAutoInvoiceNumber && (
                                            <button
                                                type="button"
                                                onClick={() => fetchNextInvoiceNumber()}
                                                title="Generate nomor"
                                                className="absolute right-2 p-1 text-slate-400 hover:text-teal-600 transition-colors"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Pelanggan / Pemesan Selector */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Pilih Pelanggan / Instansi <span className="text-rose-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCustomerForm({
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
                                                });
                                                setIsCustomerModalOpen(true);
                                            }}
                                            className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                                        >
                                            + Tambah Baru
                                        </button>
                                    </div>
                                    <select
                                        value={form.customer_id || ""}
                                        onChange={(e) => handleCustomerChange(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-teal-500 bg-white"
                                    >
                                        <option value="">-- Pilih dari Master Pelanggan --</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.type}{c.institution_name ? ` - ${c.institution_name}` : ""})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tanggal Pesanan (Backdated Support) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Tanggal Pesanan (Lampau / Saat Nota Dibuat) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.order_date}
                                        onChange={(e) => handleOrderDateChange(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-teal-500 bg-white"
                                    />
                                </div>

                                {/* Tanggal Selesai */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Tanggal Selesai / Serah Terima
                                    </label>
                                    <input
                                        type="date"
                                        value={form.completion_date || ""}
                                        onChange={(e) => setForm((p) => ({ ...p, completion_date: e.target.value }))}
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-teal-500 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Dynamic Item Repeater (Stel / Pcs / Rincian Ukuran) */}
                        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <div className="flex items-center gap-2">
                                    <Shirt className="w-4 h-4 text-teal-600" />
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Rincian Item Pesanan (Stel / Pcs & Ukuran)
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddItemRow}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Baris Item</span>
                                </button>
                            </div>

                            {/* Item Rows */}
                            <div className="space-y-3">
                                {form.items.map((item, index) => {
                                    const hasBreakdown = item.size_breakdown && Object.keys(item.size_breakdown).length > 0;
                                    const breakdownEntries = hasBreakdown ? Object.entries(item.size_breakdown) : [];

                                    return (
                                        <div
                                            key={index}
                                            className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
                                        >
                                            {/* Top Row: Master Product Selector & Custom Name */}
                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-start">
                                                
                                                {/* Product Catalog Link */}
                                                <div className="sm:col-span-5">
                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                        Katalog Master Produk (Opsional - BOM)
                                                    </label>
                                                    <select
                                                        value={item.product_id || ""}
                                                        onChange={(e) => handleItemFieldChange(index, "product_id", e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white"
                                                    >
                                                        <option value="">-- Pilih Model Produk --</option>
                                                        {products.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} ({p.default_unit}) - {formatCurrency(p.base_price)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Item Name */}
                                                <div className="sm:col-span-6">
                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                        Nama Produk di Nota <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={item.item_name}
                                                        onChange={(e) => handleItemFieldChange(index, "item_name", e.target.value)}
                                                        required
                                                        placeholder="Misal: Baju Olahraga SDN 1, Kemeja PDH"
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white"
                                                    />
                                                </div>

                                                {/* Delete Row Button */}
                                                <div className="sm:col-span-1 flex items-end justify-center pt-5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItemRow(index)}
                                                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                                        title="Hapus baris item"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Second Row: Satuan, Qty + Size Breakdown Button, Unit Price, Subtotal */}
                                            <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5 items-center">
                                                
                                                {/* Satuan */}
                                                <div className="sm:col-span-2">
                                                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                                        Satuan
                                                    </label>
                                                    <select
                                                        value={item.unit}
                                                        onChange={(e) => handleItemFieldChange(index, "unit", e.target.value)}
                                                        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white"
                                                    >
                                                        <option value="Stel">Stel</option>
                                                        <option value="Pcs">Pcs</option>
                                                        <option value="Lusin">Lusin</option>
                                                        <option value="Kodi">Kodi</option>
                                                        <option value="Set">Set</option>
                                                        <option value="Paket">Paket</option>
                                                    </select>
                                                </div>

                                                {/* Quantity & Rincian Ukuran */}
                                                <div className="sm:col-span-4">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <label className="block text-[10px] font-semibold text-slate-600">
                                                            Jumlah ({item.unit}) <span className="text-rose-500">*</span>
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenSizeModal(index)}
                                                            className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Ruler className="w-2.5 h-2.5" />
                                                            <span>{hasBreakdown ? "Edit Ukuran" : "+ Rincian Size"}</span>
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.qty}
                                                            onChange={(e) => handleItemFieldChange(index, "qty", parseInt(e.target.value) || 0)}
                                                            required
                                                            className="w-20 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-md focus:border-teal-500 bg-white text-center font-mono"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenSizeModal(index)}
                                                            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer truncate border ${
                                                                hasBreakdown
                                                                    ? "bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100/80 shadow-2xs"
                                                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                                            }`}
                                                        >
                                                            <Ruler className={`w-3 h-3 shrink-0 ${hasBreakdown ? "text-teal-600" : "text-slate-400"}`} />
                                                            <span>
                                                                {hasBreakdown
                                                                    ? `${breakdownEntries.length} Ukuran`
                                                                    : "Atur Size"}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Unit Price */}
                                                <div className="sm:col-span-3">
                                                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                                        Harga Satuan (Rp)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="100"
                                                        value={item.unit_price}
                                                        onChange={(e) => handleItemFieldChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:border-teal-500 bg-white text-right font-mono"
                                                    />
                                                </div>

                                                {/* Subtotal */}
                                                <div className="sm:col-span-3">
                                                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 text-right">
                                                        Subtotal
                                                    </label>
                                                    <div className="px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 rounded-md text-right font-mono">
                                                        {formatCurrency(item.subtotal)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Size Breakdown Badges if set */}
                                            {hasBreakdown && (
                                                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/70 text-xs">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <Ruler className="w-3 h-3 text-teal-600" />
                                                        <span>Rincian Size ({breakdownEntries.reduce((s, [, q]) => s + (parseInt(q) || 0), 0)} Qty):</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        {breakdownEntries.map(([sz, count]) => (
                                                            <span
                                                                key={sz}
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50/80 text-teal-950 border border-teal-200 shadow-2xs"
                                                            >
                                                                <strong className="font-bold text-teal-800">{sz}:</strong>
                                                                <span className="font-mono font-semibold">{count}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Description / Bordir notes */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={item.description || ""}
                                                    onChange={(e) => handleItemFieldChange(index, "description", e.target.value)}
                                                    placeholder="Catatan pengerjaan (misal: Bordir logo dada & punggung sablon polyflex)..."
                                                    className="w-full px-2.5 py-1 text-[11px] border border-slate-200 rounded focus:border-teal-500 bg-white"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Section: Live BOM Material Requirements Preview */}
                        {materialRequirements.length > 0 && (
                            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs space-y-2.5">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Layers className="w-4 h-4 text-sky-600" />
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Estimasi Kebutuhan Bahan Baku (Formula BOM)
                                    </h3>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    Total bahan baku gudang yang digunakan berdasarkan item yang terhubung ke Master Produk:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {materialRequirements.map((mat) => (
                                        <div
                                            key={mat.item_id}
                                            className="p-2.5 rounded bg-sky-50/60 border border-sky-200/80 flex items-center justify-between text-xs"
                                        >
                                            <div>
                                                <div className="font-bold text-slate-800">{mat.item_name}</div>
                                                <div className="text-[10px] text-slate-500">
                                                    Stok Gudang: {mat.current_stock} {mat.unit_name}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-sky-900 text-sm">
                                                    {mat.total_needed.toFixed(2)} {mat.unit_name}
                                                </div>
                                                <div className="text-[10px] text-sky-700">Kebutuhan Total</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: KEUANGAN, BYPASS STOK & STATUS (Col 4) */}
                    <div className="lg:col-span-4 space-y-4">
                        
                        {/* Box 1: SAKELAR POTONG STOK (BYPASS STOK GUDANG) */}
                        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs space-y-3">
                            <div className="flex items-start gap-2.5">
                                <div className={`p-2 rounded-md ${form.cut_stock ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                                    <Package className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900">
                                            Potong Stok Bahan Gudang?
                                        </span>
                                        {/* Toggle Switch */}
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.cut_stock}
                                                onChange={(e) => setForm((p) => ({ ...p, cut_stock: e.target.checked }))}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                                        </label>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                        {form.cut_stock ? (
                                            <span className="text-amber-700 font-medium">
                                                <strong>AKTIF:</strong> Bahan baku di gudang akan otomatis dipotong sesuai formula BOM.
                                            </span>
                                        ) : (
                                            <span className="text-teal-700 font-medium">
                                                <strong>NON-AKTIF (Bypass):</strong> Stok gudang saat ini tetap aman tidak berkurang (rekomendasi untuk nota historis lama).
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Box 2: KALKULASI TOTAL PEMBAYARAN */}
                        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs space-y-3">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                <DollarSign className="w-4 h-4 text-teal-600" />
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Rincian Keuangan & Omset
                                </h3>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                {/* Subtotal */}
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Subtotal Item:</span>
                                    <span className="font-semibold text-slate-900 font-mono">
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>

                                {/* Diskon Potongan */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        Potongan / Diskon (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={form.discount}
                                        onChange={(e) => setForm((p) => ({ ...p, discount: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white text-right font-mono"
                                    />
                                </div>

                                {/* Total Tagihan */}
                                <div className="p-2.5 rounded bg-slate-900 text-white flex items-center justify-between">
                                    <span className="font-semibold text-xs text-slate-300">Total Tagihan:</span>
                                    <span className="font-bold text-base font-mono text-teal-300">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                </div>

                                {/* Status Pembayaran */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        Status Pembayaran
                                    </label>
                                    <select
                                        value={form.payment_status}
                                        onChange={(e) => setForm((p) => ({ ...p, payment_status: e.target.value }))}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white font-medium"
                                    >
                                        <option value="LUNAS">LUNAS (Sudah Terbayar Penuh)</option>
                                        <option value="DP">DP (Uang Muka Sebagian)</option>
                                        <option value="BELUM_LUNAS">BELUM LUNAS / Piutang</option>
                                    </select>
                                </div>

                                {/* Jumlah Terbayar */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        Jumlah Yang Sudah Dibayar (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={totalAmount}
                                        step="1000"
                                        value={form.paid_amount}
                                        onChange={(e) => setForm((p) => ({ ...p, paid_amount: parseFloat(e.target.value) || 0 }))}
                                        disabled={form.payment_status === "LUNAS"}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white text-right font-mono"
                                    />
                                </div>

                                {/* Sisa Piutang */}
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-600">
                                    <span>Sisa Tagihan (Piutang):</span>
                                    <span className={`font-bold font-mono ${remainingBalance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                        {formatCurrency(remainingBalance)}
                                    </span>
                                </div>

                                {/* Status Produksi */}
                                <div className="pt-2">
                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        Status Pengerjaan / Produksi
                                    </label>
                                    <select
                                        value={form.production_status}
                                        onChange={(e) => setForm((p) => ({ ...p, production_status: e.target.value }))}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white"
                                    >
                                        <option value="SELESAI">SELESAI (Sudah Diserahkan)</option>
                                        <option value="PROSES">PROSES (Sedang Dikerjakan)</option>
                                        <option value="PENDING">PENDING</option>
                                    </select>
                                </div>

                                {/* Catatan Nota */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        Catatan Internal / Keterangan Nota
                                    </label>
                                    <textarea
                                        value={form.notes || ""}
                                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                                        rows="3"
                                        placeholder="Keterangan tambahan..."
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white resize-none"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Menyimpan Invoice...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Simpan Invoice Historis</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Quick Customer Modal */}
            <CustomerModal
                isOpen={isCustomerModalOpen}
                isEditing={false}
                form={customerForm}
                submitting={customerSubmitting}
                onClose={() => setIsCustomerModalOpen(false)}
                onChange={(e) => {
                    const { name, value } = e.target;
                    setCustomerForm((p) => ({ ...p, [name]: value }));
                }}
                onSubmit={handleSaveQuickCustomer}
            />

            {/* Size Breakdown Modal */}
            <SizeBreakdownModal
                isOpen={isSizeModalOpen}
                itemName={activeSizeItemIndex !== null ? form.items[activeSizeItemIndex]?.item_name : ""}
                defaultUnitPrice={activeSizeItemIndex !== null ? (parseFloat(form.items[activeSizeItemIndex]?.unit_price) || 0) : 0}
                currentBreakdown={activeSizeItemIndex !== null ? form.items[activeSizeItemIndex]?.size_breakdown : {}}
                onClose={() => {
                    setIsSizeModalOpen(false);
                    setActiveSizeItemIndex(null);
                }}
                onSave={handleSaveSizeBreakdown}
            />
        </DashboardLayout>
    );
}
