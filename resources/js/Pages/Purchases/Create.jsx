import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { Toast } from "@/utils/sweetalert";

export default function Create({ items }) {
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        supplier_name: "",
        notes: "",
        items: [
            { item_id: "", unit_id: "", quantity: 1, unit_price: 0 }
        ]
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...form.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // When item changes, auto-select base unit and reset unit_id
        if (field === 'item_id') {
            const selectedItem = items.find(i => i.id === parseInt(value));
            newItems[index].unit_id = selectedItem ? String(selectedItem.unit_id) : "";
        }

        setForm({ ...form, items: newItems });
    };

    const addItem = () => {
        setForm({
            ...form,
            items: [...form.items, { item_id: "", unit_id: "", quantity: 1, unit_price: 0 }]
        });
    };

    const removeItem = (index) => {
        if (form.items.length === 1) return;
        const newItems = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items: newItems });
    };

    const calculateTotal = () => {
        return form.items.reduce((total, item) => {
            return total + (Number(item.quantity) * Number(item.unit_price));
        }, 0);
    };

    const getSelectedItem = (item_id) => items.find((i) => i.id === parseInt(item_id, 10));

    const getUnitOptions = (item_id) => getSelectedItem(item_id)?.all_units || [];

    const getSelectedUnit = (row) => {
        const opts = getUnitOptions(row.item_id);
        return opts.find((u) => String(u.unit_id) === String(row.unit_id)) || null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (form.items.some(item => !item.item_id || !item.unit_id || item.quantity < 1 || item.unit_price < 0)) {
            Toast.error("Harap lengkapi semua data barang (termasuk pilih satuan) dengan benar.");
            return;
        }

        setSubmitting(true);
        router.post(route('purchases.store'), form, {
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
            <Head title="Tambah Pembelian - Azhar Collection" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('purchases.index')}
                            className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Input Pembelian Baru</h1>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Informasi Umum */}
                    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Informasi Pembelian</h2>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Tanggal Pembelian <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Nama Supplier / Toko
                                </label>
                                <input
                                    type="text"
                                    name="supplier_name"
                                    value={form.supplier_name}
                                    onChange={handleChange}
                                    placeholder="Contoh: Toko Maju Jaya"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Catatan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    placeholder="Catatan tambahan..."
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Daftar Barang */}
                    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Daftar Barang <span className="text-red-500">*</span>
                            </h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Tambah Baris
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider">
                                        <th className="px-4 py-3 w-8 text-center">#</th>
                                        <th className="px-4 py-3 min-w-[220px]">Pilih Barang</th>
                                        <th className="px-4 py-3 w-36">Satuan</th>
                                        <th className="px-4 py-3 w-28">Kuantitas</th>
                                        <th className="px-4 py-3 w-36">Harga Satuan (Rp)</th>
                                        <th className="px-4 py-3 w-32 text-right">Subtotal</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {form.items.map((row, index) => {
                                        const unitOptions = getUnitOptions(row.item_id);
                                        const selectedUnit = getSelectedUnit(row);
                                        const selectedItem = getSelectedItem(row.item_id);
                                        const baseSymbol = selectedItem?.unit?.symbol || selectedItem?.unit?.name || "pcs";
                                        const multiplier = selectedUnit?.multiplier || 1;
                                        const equivalentQty = Number(row.quantity || 0) * multiplier;
                                        return (
                                            <tr key={index} className="hover:bg-slate-50/30 align-top">
                                                <td className="px-4 py-2.5 text-center text-slate-400 font-medium">{index + 1}</td>
                                                <td className="px-4 py-2.5">
                                                    <select
                                                        value={row.item_id}
                                                        onChange={(e) => handleItemChange(index, 'item_id', e.target.value)}
                                                        required
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white"
                                                    >
                                                        <option value="">-- Pilih Barang --</option>
                                                        {items.map(item => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.name} ({item.code})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <select
                                                        value={row.unit_id}
                                                        onChange={(e) => handleItemChange(index, 'unit_id', e.target.value)}
                                                        required
                                                        disabled={!row.item_id}
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="">-- Satuan --</option>
                                                        {unitOptions.map(u => (
                                                            <option key={u.unit_id} value={u.unit_id}>
                                                                {u.label || `${u.name} (${u.symbol})`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {selectedUnit && multiplier > 1 && (
                                                        <p className="mt-1 text-[10px] text-slate-400">
                                                            1 {selectedUnit.symbol} = {multiplier} {baseSymbol}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        required
                                                        value={row.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                                    />
                                                    {selectedUnit && multiplier > 1 && Number(row.quantity) > 0 && (
                                                        <p className="mt-1 text-[10px] text-teal-600 font-medium">
                                                            Setara +{equivalentQty} {baseSymbol}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        required
                                                        value={row.unit_price}
                                                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                                                    />
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-semibold text-slate-700">
                                                    Rp {(Number(row.quantity) * Number(row.unit_price)).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        disabled={form.items.length === 1}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                                        <td colSpan="5" className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Total Keseluruhan:
                                        </td>
                                        <td colSpan="2" className="px-4 py-3 font-bold text-teal-600 text-sm">
                                            Rp {calculateTotal().toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pb-4">
                        <Link
                            href={route('purchases.index')}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60 shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? "Menyimpan..." : "Simpan Transaksi"}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
