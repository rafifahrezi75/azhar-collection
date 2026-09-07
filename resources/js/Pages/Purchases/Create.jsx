import React, { useState, useEffect, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import {
    Plus,
    Trash2,
    ArrowLeft,
    Save,
    Package,
    Boxes,
    FileText,
    Calendar,
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

    useEffect(() => {
        setLocalItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        const savedDraft = sessionStorage.getItem("purchase_form_draft");
        let parsedDraft = null;
        if (savedDraft) {
            try {
                parsedDraft = JSON.parse(savedDraft);
                if (parsedDraft?.form) {
                    setForm(parsedDraft.form);
                }
            } catch {
                parsedDraft = null;
            }
        }

        const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const newItemId = searchParams ? searchParams.get("new_item_id") : null;

        if (newItemId) {
            const newlyCreated = initialItems.find((i) => String(i.id) === String(newItemId));
            if (newlyCreated) {
                const targetIdx = parsedDraft?.targetIndex ?? -1;
                setForm((prev) => {
                    const currentItems = [...prev.items];
                    const newItemRow = {
                        item_id: String(newlyCreated.id),
                        unit_id: String(newlyCreated.unit_id || newlyCreated.unit?.id || ""),
                        quantity: 1,
                        unit_price: Number(newlyCreated.price) || 0,
                    };

                    if (targetIdx >= 0 && currentItems[targetIdx]) {
                        currentItems[targetIdx] = {
                            ...newItemRow,
                            quantity: currentItems[targetIdx].quantity || 1,
                        };
                    } else {
                        const emptyIdx = currentItems.findIndex((r) => !r.item_id);
                        if (emptyIdx !== -1) {
                            currentItems[emptyIdx] = newItemRow;
                        } else {
                            currentItems.push(newItemRow);
                        }
                    }

                    return {
                        ...prev,
                        items: currentItems,
                    };
                });

                Toast.success(`Bahan baku "${newlyCreated.name}" berhasil ditambahkan dan dipilih.`);
            }

            if (typeof window !== "undefined") {
                window.history.replaceState({}, "", window.location.pathname);
            }
            sessionStorage.removeItem("purchase_form_draft");
        }
    }, [initialItems]);

    const handleRedirectToCreateItem = (targetIndex = -1) => {
        sessionStorage.setItem(
            "purchase_form_draft",
            JSON.stringify({
                form,
                targetIndex,
            })
        );
        router.visit("/dashboard/barang/create?return_to=/dashboard/purchases/create");
    };

    const rawMaterialOptions = useMemo(() => {
        return localItems.map((item) => ({
            value: String(item.id),
            label: item.name,
            sublabel: `Stok: ${item.real_stock || 0} ${item.unit?.name || ""} • Kategori: ${item.category?.name || "-"}`,
            badge: item.code,
            searchKey: `${item.name} ${item.code || ""} ${item.category?.name || ""}`,
        }));
    }, [localItems]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index, field, value) => {
        if (field === "item_id" && value === "__NEW__") {
            handleRedirectToCreateItem(index);
            return;
        }

        const newItems = [...form.items];
        newItems[index][field] = value;

        if (field === "item_id") {
            const selected = getSelectedItem(value);
            if (selected) {
                newItems[index].unit_id = selected.unit_id || selected.unit?.id || "";
                newItems[index].unit_price = Number(selected.price) || 0;
            } else {
                newItems[index].unit_id = "";
                newItems[index].unit_price = 0;
            }
        }

        setForm({ ...form, items: newItems });
    };

    const addItemRow = () => {
        setForm({
            ...form,
            items: [
                ...form.items,
                { item_id: "", unit_id: "", quantity: 1, unit_price: 0 }
            ]
        });
    };

    const removeItemRow = (index) => {
        if (form.items.length === 1) return;
        const newItems = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items: newItems });
    };

    const calculateTotal = () => {
        return form.items.reduce((total, row) => {
            return total + ((Number(row.quantity) || 0) * (Number(row.unit_price) || 0));
        }, 0);
    };

    const calculateTotalQty = () => {
        return form.items.reduce((total, row) => {
            return total + (Number(row.quantity) || 0);
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
                sessionStorage.removeItem("purchase_form_draft");
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
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    <div className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    title="Kembali"
                                    onClick={() => {
                                        sessionStorage.removeItem("purchase_form_draft");
                                        router.visit(route("purchases.index"));
                                    }}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-sm cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                    <Package className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                                        Input Pembelian Baru
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Catat transaksi pembelian atau restock bahan baku konveksi.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                title={submitting ? "Menyimpan..." : "Simpan"}
                                disabled={submitting}
                                className="w-8 h-8 shrink-0 inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                        </div>

                        {/* SECTION 1: Informasi Transaksi Pembelian */}
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 space-y-3.5">
                                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                                    <FileText className="w-4 h-4 text-teal-600" />
                                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Informasi Transaksi Pembelian
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            Tanggal Pembelian <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={form.date}
                                            onChange={handleChange}
                                            required
                                            className="w-full h-8 px-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors bg-white shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Nama Supplier / Toko
                                        </label>
                                        <input
                                            type="text"
                                            name="supplier_name"
                                            value={form.supplier_name}
                                            onChange={handleChange}
                                            placeholder="Contoh: Toko Kain Maju Jaya"
                                            className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors bg-white shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Catatan Tambahan (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            placeholder="Catatan pembayaran, nomor nota, dll..."
                                            className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors bg-white shadow-2xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: Daftar Barang yang Dibeli */}
                            <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 shadow-2xs space-y-3.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <Boxes className="w-4 h-4 text-teal-600" />
                                        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                            Daftar Barang yang Dibeli
                                        </h2>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-100/80 text-teal-800 border border-teal-200/80">
                                            {form.items.length} Item
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRedirectToCreateItem(-1)}
                                            className="h-8 px-2.5 inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-[11px] rounded-lg border border-teal-200 transition-colors shadow-2xs cursor-pointer"
                                            title="Bahan Baku Baru"
                                        >
                                            <Plus className="w-3.5 h-3.5 text-teal-600" />
                                            <span className="mt-0.5">Bahan Baku</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={addItemRow}
                                            className="h-8 px-2.5 inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                                            title="Baris"
                                        >
                                            <Plus className="w-3.5 h-3.5 text-teal-600" />
                                            <span className="mt-0.5">Baris</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                                                <th className="px-3.5 py-2 w-10 text-center">No</th>
                                                <th className="px-3.5 py-2 min-w-[240px]">Pilih Bahan Baku <span className="text-rose-500">*</span></th>
                                                <th className="px-3.5 py-2 min-w-[140px]">Satuan Pembelian <span className="text-rose-500">*</span></th>
                                                <th className="px-3.5 py-2 w-28 text-right">Kuantitas <span className="text-rose-500">*</span></th>
                                                <th className="px-3.5 py-2 w-40 text-right">Harga Satuan (Rp) <span className="text-rose-500">*</span></th>
                                                <th className="px-3.5 py-2 w-36 text-right">Subtotal</th>
                                                <th className="px-3.5 py-2 w-12 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {form.items.map((row, index) => {
                                                const unitOptions = getUnitOptions(row.item_id);
                                                const subtotal = (Number(row.quantity) || 0) * (Number(row.unit_price) || 0);

                                                return (
                                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-3.5 py-2 text-center text-slate-400 font-mono font-medium">{index + 1}</td>
                                                        <td className="px-3.5 py-2">
                                                            <SearchableSelect
                                                                value={row.item_id}
                                                                onChange={(val) => handleItemChange(index, "item_id", val)}
                                                                options={rawMaterialOptions}
                                                                placeholder="Cari / Pilih Bahan Baku"
                                                                searchPlaceholder="Ketik nama bahan atau kode..."
                                                                actionOption={
                                                                    <span className="flex items-center gap-1.5 text-teal-700 font-bold">
                                                                        <Plus className="w-3.5 h-3.5 text-teal-600" />
                                                                        Bahan Baku Baru
                                                                    </span>
                                                                }
                                                                onAction={() => handleRedirectToCreateItem(index)}
                                                                required
                                                            />
                                                        </td>
                                                        <td className="px-3.5 py-2">
                                                            <select
                                                                value={row.unit_id}
                                                                onChange={(e) => handleItemChange(index, "unit_id", e.target.value)}
                                                                required
                                                                disabled={!row.item_id}
                                                                className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white shadow-2xs disabled:bg-slate-100 disabled:text-slate-400 font-medium"
                                                            >
                                                                {unitOptions.map((u) => (
                                                                    <option key={u.unit_id} value={u.unit_id}>
                                                                        {u.name} {u.symbol ? `(${u.symbol})` : ""} {u.multiplier > 1 ? `[x${u.multiplier}]` : ""}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-3.5 py-2 text-right">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={row.quantity}
                                                                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                                                required
                                                                className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg text-right font-mono font-bold focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white shadow-2xs"
                                                            />
                                                        </td>
                                                        <td className="px-3.5 py-2 text-right">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={row.unit_price}
                                                                onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                                                                required
                                                                className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg text-right font-mono focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white shadow-2xs"
                                                            />
                                                        </td>
                                                        <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-800">
                                                            {formatRupiah(subtotal)}
                                                        </td>
                                                        <td className="px-3.5 py-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItemRow(index)}
                                                                disabled={form.items.length === 1}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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

                                <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                                    <div className="text-slate-500">
                                        Total <span className="font-bold text-slate-700">{form.items.length}</span> baris barang &bull; Total Kuantitas: <span className="font-bold text-slate-700 font-mono">{calculateTotalQty()}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Total Pembelian:</span>
                                        <span className="text-base font-extrabold text-teal-700 font-mono">
                                            {formatRupiah(calculateTotal())}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}