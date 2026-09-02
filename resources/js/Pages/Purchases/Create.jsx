import React, { useState, useEffect, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    Plus,
    Trash2,
    ArrowLeft,
    Save,
    Package,
    Boxes,
    FileText,
    Calendar,
    RefreshCw,
    X,
    Sparkles,
} from "lucide-react";
import { Toast } from "@/utils/sweetalert";
import { formatRupiah, todayLocal } from "@/utils/format";

export default function Create({ items: initialItems = [], categories = [], units = [] }) {
    const [localItems, setLocalItems] = useState(initialItems);
    const [form, setForm] = useState({
        date: todayLocal(),
        supplier_name: "",
        notes: "",
        items: [
            { item_id: "", unit_id: "", quantity: 1, unit_price: 0 }
        ]
    });
    const [submitting, setSubmitting] = useState(false);

    const [showNewItemModal, setShowNewItemModal] = useState(false);
    const [targetRowIndex, setTargetRowIndex] = useState(-1);
    const [isAutoCode, setIsAutoCode] = useState(true);
    const [creatingItem, setCreatingItem] = useState(false);
    const [newItemForm, setNewItemForm] = useState({
        code: "",
        name: "",
        category_id: categories[0]?.id ? String(categories[0].id) : "",
        unit_id: units[0]?.id ? String(units[0].id) : "",
        price: 0,
        min_stock: 5,
        description: "",
    });

    const generateAutoCode = useCallback(() => {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `BB-${randomNum}`;
    }, []);

    useEffect(() => {
        if (isAutoCode) {
            setNewItemForm((prev) => ({ ...prev, code: generateAutoCode() }));
        }
    }, [isAutoCode, generateAutoCode]);

    const openQuickCreateItem = (rowIndex = -1) => {
        setTargetRowIndex(rowIndex);
        setNewItemForm({
            code: generateAutoCode(),
            name: "",
            category_id: categories[0]?.id ? String(categories[0].id) : "",
            unit_id: units[0]?.id ? String(units[0].id) : "",
            price: 0,
            min_stock: 5,
            description: "",
        });
        setIsAutoCode(true);
        setShowNewItemModal(true);
    };

    const handleSaveNewItem = async (e) => {
        e.preventDefault();
        if (!newItemForm.name || !newItemForm.category_id || !newItemForm.unit_id) {
            Toast.error("Nama bahan, kategori, dan satuan wajib diisi.");
            return;
        }

        setCreatingItem(true);
        try {
            const payload = {
                code: newItemForm.code,
                name: newItemForm.name,
                category_id: parseInt(newItemForm.category_id, 10),
                unit_id: parseInt(newItemForm.unit_id, 10),
                price: Number(newItemForm.price) || 0,
                min_stock: Number(newItemForm.min_stock) || 5,
                description: newItemForm.description || "",
                is_active: true,
            };

            const res = await axios.post("/items", payload);
            const createdItem = res.data?.data || res.data;

            if (createdItem && createdItem.id) {
                const enrichedItem = {
                    ...createdItem,
                    unit: units.find((u) => u.id === createdItem.unit_id) || createdItem.unit,
                    conversions: [],
                };

                setLocalItems((prev) => [...prev, enrichedItem]);

                if (targetRowIndex >= 0 && form.items[targetRowIndex]) {
                    const newItems = [...form.items];
                    newItems[targetRowIndex] = {
                        item_id: String(createdItem.id),
                        unit_id: String(createdItem.unit_id),
                        quantity: newItems[targetRowIndex].quantity || 1,
                        unit_price: Number(createdItem.price) || 0,
                    };
                    setForm((prev) => ({ ...prev, items: newItems }));
                } else {
                    setForm((prev) => ({
                        ...prev,
                        items: [
                            ...prev.items,
                            {
                                item_id: String(createdItem.id),
                                unit_id: String(createdItem.unit_id),
                                quantity: 1,
                                unit_price: Number(createdItem.price) || 0,
                            },
                        ],
                    }));
                }

                Toast.success(`Bahan baku "${createdItem.name}" berhasil dibuat dan dipilih.`);
                setShowNewItemModal(false);
            }
        } catch (err) {
            Toast.error(err.response?.data?.message || "Gagal menyimpan bahan baku baru.");
        } finally {
            setCreatingItem(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index, field, value) => {
        if (field === "item_id" && value === "__NEW__") {
            openQuickCreateItem(index);
            return;
        }

        const newItems = [...form.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === "item_id") {
            const selectedItem = localItems.find((i) => i.id === parseInt(value, 10));
            newItems[index].unit_id = selectedItem ? String(selectedItem.unit_id) : "";
            newItems[index].unit_price = selectedItem?.price ? Number(selectedItem.price) : 0;
        }

        setForm({ ...form, items: newItems });
    };

    const addItemRow = () => {
        setForm({
            ...form,
            items: [...form.items, { item_id: "", unit_id: "", quantity: 1, unit_price: 0 }]
        });
    };

    const removeItemRow = (index) => {
        if (form.items.length === 1) {
            Toast.error("Minimal harus ada satu barang dalam pembelian.");
            return;
        }
        const newItems = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items: newItems });
    };

    const calculateTotal = () => {
        return form.items.reduce((total, item) => {
            return total + (Number(item.quantity || 0) * Number(item.unit_price || 0));
        }, 0);
    };

    const calculateTotalQty = () => {
        return form.items.reduce((total, item) => {
            return total + Number(item.quantity || 0);
        }, 0);
    };

    const getSelectedItem = (item_id) => localItems.find((i) => i.id === parseInt(item_id, 10));

    const getUnitOptions = (item_id) => {
        const item = getSelectedItem(item_id);
        if (!item) return [];

        const baseUnit = item.unit;
        const options = [];

        if (baseUnit) {
            options.push({
                unit_id: baseUnit.id,
                name: baseUnit.name,
                symbol: baseUnit.symbol,
                multiplier: 1,
                is_base: true,
            });
        }

        if (Array.isArray(item.conversions)) {
            item.conversions.forEach((c) => {
                if (c.unit && String(c.unit_id) !== String(baseUnit?.id)) {
                    options.push({
                        unit_id: c.unit.id,
                        name: c.unit.name,
                        symbol: c.unit.symbol,
                        multiplier: Number(c.multiplier) || 1,
                        is_base: false,
                    });
                }
            });
        }

        return options;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (form.items.some((item) => !item.item_id || !item.unit_id || Number(item.quantity) < 1 || Number(item.unit_price) < 0)) {
            Toast.error("Harap lengkapi semua data barang dan satuan dengan benar.");
            return;
        }

        setSubmitting(true);
        router.post(route("purchases.store"), form, {
            onSuccess: () => {
                Toast.success("Transaksi pembelian berhasil disimpan.");
            },
            onError: () => {
                Toast.error("Gagal menyimpan data pembelian. Periksa kembali form.");
                setSubmitting(false);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <DashboardLayout>
            <Head title="Input Pembelian Baru - Azhar Collection" />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <button
                                type="button"
                                title="Kembali ke Daftar Pembelian"
                                onClick={() => router.visit(route("purchases.index"))}
                                className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>

                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                <Package className="w-4 h-4" />
                            </div>

                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                    Input Pembelian Baru
                                </h3>
                                <p className="text-[11px] text-slate-500 truncate">
                                    Catat transaksi pembelian atau restock bahan baku konveksi
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-teal-600" />
                            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Informasi Transaksi Pembelian
                            </h2>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    Tanggal Pembelian <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Nama Supplier / Toko
                                </label>
                                <input
                                    type="text"
                                    name="supplier_name"
                                    value={form.supplier_name}
                                    onChange={handleChange}
                                    placeholder="Contoh: Toko Kain Maju Jaya"
                                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Catatan Tambahan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    placeholder="Catatan pembayaran, nomor nota supplier, dll..."
                                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Boxes className="w-4 h-4 text-teal-600" />
                                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Daftar Barang yang Dibeli
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                                    {form.items.length} Item
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => openQuickCreateItem(-1)}
                                    className="h-8 px-3 inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-md border border-amber-200 transition-colors shadow-2xs cursor-pointer"
                                    title="Daftarkan bahan baku baru yang belum ada di database"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                    <span>+ Tambah Bahan Baku Baru</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={addItemRow}
                                    className="h-8 px-3 inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-md border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                                    title="Tambah baris pembelian"
                                >
                                    <Plus className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Tambah Baris</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                                        <th className="px-3.5 py-2.5 w-10 text-center">#</th>
                                        <th className="px-3.5 py-2.5 min-w-[240px]">Pilih Bahan Baku <span className="text-rose-500">*</span></th>
                                        <th className="px-3.5 py-2.5 min-w-[140px]">Satuan Pembelian <span className="text-rose-500">*</span></th>
                                        <th className="px-3.5 py-2.5 w-28 text-right">Kuantitas <span className="text-rose-500">*</span></th>
                                        <th className="px-3.5 py-2.5 w-40 text-right">Harga Satuan (Rp) <span className="text-rose-500">*</span></th>
                                        <th className="px-3.5 py-2.5 w-36 text-right">Subtotal</th>
                                        <th className="px-3.5 py-2.5 w-12 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {form.items.map((row, index) => {
                                        const unitOptions = getUnitOptions(row.item_id);
                                        const subtotal = (Number(row.quantity) || 0) * (Number(row.unit_price) || 0);

                                        return (
                                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-3.5 py-3 text-center text-slate-400 font-medium">{index + 1}</td>
                                                <td className="px-3.5 py-3">
                                                    <select
                                                        value={row.item_id}
                                                        onChange={(e) => handleItemChange(index, "item_id", e.target.value)}
                                                        required
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                                                    >
                                                        <option value="">-- Pilih Bahan Baku --</option>
                                                        <option value="__NEW__" className="text-amber-700 font-bold bg-amber-50">
                                                            + Daftarkan Bahan Baku Baru...
                                                        </option>
                                                        {localItems.map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.name} ({item.code})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-3.5 py-3">
                                                    <select
                                                        value={row.unit_id}
                                                        onChange={(e) => handleItemChange(index, "unit_id", e.target.value)}
                                                        required
                                                        disabled={!row.item_id}
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                                                    >
                                                        <option value="">-- Satuan --</option>
                                                        {unitOptions.map((u) => (
                                                            <option key={u.unit_id} value={u.unit_id}>
                                                                {u.name} {u.symbol ? `(${u.symbol})` : ""} {u.multiplier > 1 ? `[x${u.multiplier}]` : ""}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-3.5 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={row.quantity}
                                                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                                        required
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md text-right focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                    />
                                                </td>
                                                <td className="px-3.5 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.unit_price}
                                                        onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                                                        required
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md text-right font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                                    />
                                                </td>
                                                <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-800">
                                                    {formatRupiah(subtotal)}
                                                </td>
                                                <td className="px-3.5 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItemRow(index)}
                                                        disabled={form.items.length === 1}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Hapus baris"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-xs text-slate-500">
                                Total <span className="font-bold text-slate-700">{form.items.length}</span> baris barang | Total Kuantitas: <span className="font-bold text-slate-700">{calculateTotalQty()}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-600">Total Pembelian:</span>
                                <span className="text-lg font-bold text-teal-700 font-mono">
                                    {formatRupiah(calculateTotal())}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => router.visit(route("purchases.index"))}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>{submitting ? "Menyimpan Transaksi..." : "Simpan Transaksi Pembelian"}</span>
                        </button>
                    </div>
                </form>
            </div>

            {showNewItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150 my-8">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold">
                                    <Sparkles className="w-3.5 h-3.5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Daftarkan Bahan Baku Baru
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNewItemModal(false)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNewItem} className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Kode Bahan <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setNewItemForm((prev) => ({ ...prev, code: generateAutoCode() }))}
                                                className="text-[10px] text-teal-600 hover:text-teal-700 flex items-center gap-0.5 cursor-pointer"
                                                title="Acak Kode Baru"
                                            >
                                                <RefreshCw className="w-2.5 h-2.5" /> Acak
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={newItemForm.code}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, code: e.target.value })}
                                        required
                                        className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Kategori Bahan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={newItemForm.category_id}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, category_id: e.target.value })}
                                        required
                                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Nama Bahan Baku <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newItemForm.name}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                                    placeholder="Contoh: Kain Famatex Biru Dongker"
                                    required
                                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Satuan Dasar <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={newItemForm.unit_id}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, unit_id: e.target.value })}
                                        required
                                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                                    >
                                        <option value="">-- Pilih Satuan --</option>
                                        {units.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} {u.symbol ? `(${u.symbol})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Harga Beli Dasar (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newItemForm.price}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value })}
                                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Deskripsi / Spesifikasi Bahan
                                </label>
                                <textarea
                                    rows="2"
                                    value={newItemForm.description}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                                    placeholder="Spesifikasi lebar kain, warna, ketebalan, dll..."
                                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowNewItemModal(false)}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingItem}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-md transition-colors shadow-xs cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{creatingItem ? "Menyimpan..." : "Simpan & Pilih Bahan"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
