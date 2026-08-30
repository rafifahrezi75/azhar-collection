import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Receipt, Calendar, User, Phone, MapPin, CheckCircle2, Check,
    Clock, AlertCircle, Package, Layers, Printer, DollarSign,
    Info, History, Zap, Scissors, ArrowLeft, Plus, X, Trash2, ChevronDown
} from "lucide-react";

export default function Show({ invoice: initialInvoice, users: initialUsers = [] }) {
    const [invoice, setInvoice] = useState(initialInvoice);
    const [users, setUsers] = useState(initialUsers);
    const [activeTab, setActiveTab] = useState("items"); // 'items', 'bom', 'spk'

    // Synchronize with Inertia prop updates
    useEffect(() => {
        if (initialInvoice) {
            setInvoice(initialInvoice);
        }
    }, [initialInvoice]);

    useEffect(() => {
        if (initialUsers && initialUsers.length > 0) {
            setUsers(initialUsers);
        }
    }, [initialUsers]);

    // SPK Form State
    const [showSPKForm, setShowSPKForm] = useState(false);
    const [openSpkCards, setOpenSpkCards] = useState({});
    const [spkForm, setSpkForm] = useState({
        invoice_item_id: "",
        user_id: "",
        qty: "",
        target_date: "",
        steps: []
    });

    const updateInvoiceState = useCallback((updater) => {
        setInvoice(prev => (prev ? updater(prev) : prev));
    }, []);

    const formatCurrency = useCallback((val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    }, []);

    const formatDate = useCallback((dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Intl.DateTimeFormat("id-ID", {
                dateStyle: "long",
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    }, []);

    if (!invoice) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-slate-500 font-semibold">Data invoice tidak ditemukan.</div>
                </div>
            </DashboardLayout>
        );
    }

    const customer = useMemo(() => invoice.customer || {}, [invoice]);
    const items = useMemo(() => invoice.items || [], [invoice]);
    const remainingBalance = useMemo(() => Math.max(0, (invoice.total_amount || 0) - (invoice.paid_amount || 0)), [invoice]);

    // Calculate BOM per item
    const bomPerItem = useMemo(() => items.map((line) => {
        const prod = line.product;
        const lineQty = Number(line.qty) || 0;
        const breakdownMap = {};
        const materialsList = [];

        if (line.size_breakdown) {
            let parsed = line.size_breakdown;
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch (e) {}
            }
            if (typeof parsed === 'object' && parsed !== null) {
                Object.entries(parsed).forEach(([k, v]) => {
                    if (typeof v === 'object' && v.size && v.qty) {
                        breakdownMap[v.size] = Number(v.qty) || 0;
                    } else {
                        breakdownMap[k] = Number(v) || 0;
                    }
                });
            }
        }

        if (prod && prod.materials) {
            // Materials can be per-size or universal
            if (Object.keys(breakdownMap).length > 0) {
                // Calculate per size
                Object.entries(breakdownMap).forEach(([sizeName, sizeQty]) => {
                    if (sizeQty <= 0) return;

                    let sizeMaterials = prod.materials.filter(m => m.size_name === sizeName);
                    if (sizeMaterials.length === 0) {
                        sizeMaterials = prod.materials.filter(m => !m.size_name || m.size_name === 'ALL');
                    }

                    sizeMaterials.forEach(mat => {
                        const itemName = mat.item?.name || "Bahan Baku";
                        const itemCode = mat.item?.code || "-";
                        const unit = mat.unit_name || mat.item?.unit?.name || "Unit";
                        const required = Number(mat.required_qty) || 0;
                        const yieldQty = Math.max(0.0001, Number(mat.yield_qty) || 1);
                        const usageQty = (sizeQty / yieldQty) * required;

                        materialsList.push({
                            forSize: sizeName,
                            name: itemName,
                            code: itemCode,
                            unit: unit,
                            totalRequired: Number(usageQty.toFixed(4)),
                            currentStock: mat.item?.real_stock ?? "-",
                        });
                    });
                });
            } else {
                // Fallback to lineQty for universal materials
                const defaultMaterials = prod.materials.filter(m => !m.size_name || m.size_name === 'ALL');
                defaultMaterials.forEach(mat => {
                    const itemName = mat.item?.name || "Bahan Baku";
                    const itemCode = mat.item?.code || "-";
                    const unit = mat.unit_name || mat.item?.unit?.name || "Unit";
                    const required = Number(mat.required_qty) || 0;
                    const yieldQty = Math.max(0.0001, Number(mat.yield_qty) || 1);
                    const usageQty = (lineQty / yieldQty) * required;

                    materialsList.push({
                        forSize: 'ALL',
                        name: itemName,
                        code: itemCode,
                        unit: unit,
                        totalRequired: Number(usageQty.toFixed(4)),
                        currentStock: mat.item?.real_stock ?? "-",
                    });
                });
            }
        }

        return {
            id: line.id,
            itemName: line.item_name,
            materials: materialsList
        };
    }), [items]);

    const handleCreateSPK = useCallback((e) => {
        e.preventDefault();
        if (!spkForm.invoice_item_id || !spkForm.user_id || spkForm.steps.length === 0) {
            Swal.fire('Peringatan', 'Harap isi semua data wajib dan centang minimal 1 langkah produksi.', 'warning');
            return;
        }

        axios.post('/api/production-assignments', spkForm)
            .then(res => {
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'SPK berhasil dibuat.', timer: 1200, showConfirmButton: false });
                setShowSPKForm(false);
                setSpkForm({ invoice_item_id: "", user_id: "", qty: "", target_date: "", steps: [] });

                if (res.data?.data) {
                    const newAssignment = res.data.data;
                    updateInvoiceState(prev => ({
                        ...prev,
                        items: prev.items.map(item =>
                            item.id == newAssignment.invoice_item_id
                                ? { ...item, production_assignments: [...(item.production_assignments || []), newAssignment] }
                                : item
                        )
                    }));
                }
            })
            .catch(err => {
                console.error("SPK Error:", err.response?.data);
                Swal.fire('Error', err.response?.data?.message || 'Gagal membuat SPK', 'error');
            });
    }, [spkForm, updateInvoiceState]);

    const handleToggleSPKStep = useCallback((stepId, currentStatus) => {
        const newStatus = currentStatus === 'SELESAI' ? 'PENDING' : 'SELESAI';

        // Optimistic UI update — no reload needed
        updateInvoiceState(prev => ({
            ...prev,
            items: prev.items.map(item => ({
                ...item,
                production_assignments: (item.production_assignments || []).map(as => {
                    const hasStep = (as.steps || []).some(st => st.id === stepId);
                    if (!hasStep) return as;
                    const newSteps = as.steps.map(st =>
                        st.id === stepId ? { ...st, status: newStatus } : st
                    );
                    const allDone = newSteps.every(s => s.status === 'SELESAI');
                    const anyDone = newSteps.some(s => s.status === 'SELESAI');
                    return { ...as, status: allDone ? 'SELESAI' : anyDone ? 'IN_PROGRESS' : 'PENDING', steps: newSteps };
                })
            }))
        }));

        axios.put(`/api/production-assignments/steps/${stepId}/status`, { status: newStatus })
            .catch(err => {
                console.error("Toggle error:", err);
                // Revert on failure
                updateInvoiceState(prev => ({
                    ...prev,
                    items: prev.items.map(item => ({
                        ...item,
                        production_assignments: (item.production_assignments || []).map(as => ({
                            ...as,
                            steps: (as.steps || []).map(st =>
                                st.id === stepId ? { ...st, status: currentStatus } : st
                            )
                        }))
                    }))
                }));
                Swal.fire('Error', 'Gagal update status', 'error');
            });
    }, [updateInvoiceState]);

    const handleDeleteSPK = useCallback((id) => {
        Swal.fire({
            title: 'Hapus SPK?',
            text: "Data penugasan ini akan dihapus permanen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // Optimistic delete — no reload
                updateInvoiceState(prev => ({
                    ...prev,
                    items: prev.items.map(item => ({
                        ...item,
                        production_assignments: (item.production_assignments || []).filter(as => as.id !== id)
                    }))
                }));

                axios.delete(`/api/production-assignments/${id}`)
                    .then(() => {
                        Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'SPK berhasil dihapus.', timer: 1000, showConfirmButton: false });
                    })
                    .catch(() => {
                        Swal.fire('Error', 'Gagal menghapus', 'error');
                    });
            }
        });
    }, [updateInvoiceState]);

    const selectedItemForSPK = useMemo(() => items.find(i => i.id == spkForm.invoice_item_id), [items, spkForm.invoice_item_id]);

    return (
        <DashboardLayout>
            <Head title={`Invoice #${invoice.invoice_number}`} />

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <Link href="/dashboard/invoice" className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-slate-200 shadow-2xs">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex gap-2">
                        <button onClick={() => window.open(`/dashboard/invoice/${invoice.id}/production-pdf`, '_blank')} className="px-3 py-1.5 bg-white text-slate-700 font-semibold border border-slate-200 rounded-md shadow-2xs hover:bg-slate-50 flex items-center gap-1.5 text-xs transition-colors cursor-pointer">
                            <Printer className="w-3.5 h-3.5" /> SPK PDF
                        </button>
                        <button onClick={() => window.open(`/dashboard/invoice/${invoice.id}/print`, '_blank')} className="px-3 py-1.5 bg-teal-600 text-white font-semibold rounded-md shadow-sm hover:bg-teal-700 flex items-center gap-1.5 text-xs transition-colors cursor-pointer">
                            <Receipt className="w-3.5 h-3.5" /> Cetak Nota
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column: Summary */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Invoice + Financial Summary */}
                    <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Invoice</p>
                                <p className="text-lg font-bold text-slate-800">#{invoice.invoice_number}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {invoice.payment_status === "LUNAS" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3" /> Lunas
                                    </span>
                                ) : invoice.payment_status === "DP" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                                        <Clock className="w-3 h-3" /> DP
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-rose-50 text-rose-700 border-rose-200">
                                        <AlertCircle className="w-3 h-3" /> Belum Lunas
                                    </span>
                                )}
                                {invoice.production_status === "SELESAI" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                        <Package className="w-3 h-3" /> Selesai
                                    </span>
                                ) : invoice.production_status === "PROSES" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
                                        <Zap className="w-3 h-3" /> Diproses
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-slate-100 text-slate-600 border-slate-200">
                                        <History className="w-3 h-3" /> Pending
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mb-4">
                            <span>Tgl Pesan: <span className="text-slate-700 font-medium">{formatDate(invoice.order_date)}</span></span>
                            <span>Target: <span className="text-slate-700 font-medium">{formatDate(invoice.completion_date)}</span></span>
                        </div>

                        <div className="bg-slate-900 rounded-lg p-3 text-white">
                            <div className="mb-3">
                                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Total Tagihan</div>
                                <div className="text-base font-bold font-mono">{formatCurrency(invoice.total_amount)}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700">
                                <div>
                                    <div className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Dibayar</div>
                                    <div className="font-mono text-xs font-semibold">{formatCurrency(invoice.paid_amount)}</div>
                                </div>
                                <div>
                                    <div className="text-rose-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Sisa</div>
                                    <div className="font-mono text-xs font-semibold">{formatCurrency(remainingBalance)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4">
                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-teal-600" /> Informasi Pelanggan
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs text-slate-400 mb-0.5">Nama Pelanggan</div>
                                <div className="font-semibold text-slate-800 text-xs">{invoice.customer_name || customer.name || "-"}</div>
                            </div>
                            {customer.phone && (
                                <div className="flex items-start gap-2">
                                    <Phone className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                    <span className="text-xs text-slate-600">{customer.phone}</span>
                                </div>
                            )}
                            {customer.address && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                    <span className="text-xs text-slate-600">{customer.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Tabs */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                        {/* Tabs Header */}
                        <div className="flex bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 p-1.5 gap-1">
                            <button
                                onClick={() => setActiveTab("items")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === "items"
                                        ? "bg-white text-teal-600 shadow-soft-2xs border border-slate-200/60"
                                        : "text-slate-500 hover:bg-slate-200/50"
                                }`}
                            >
                                <Package className="w-3.5 h-3.5" /> Rincian Pesanan
                            </button>
                            <button
                                onClick={() => setActiveTab("bom")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === "bom"
                                        ? "bg-white text-indigo-600 shadow-soft-2xs border border-slate-200/60"
                                        : "text-slate-500 hover:bg-slate-200/50"
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5" /> Bahan Baku
                            </button>
                            <button
                                onClick={() => setActiveTab("spk")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === "spk"
                                        ? "bg-white text-teal-600 shadow-soft-2xs border border-slate-200/60"
                                        : "text-slate-500 hover:bg-slate-200/50"
                                }`}
                            >
                                <Scissors className="w-3.5 h-3.5" /> SPK Pekerja
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 p-4">

                            {/* Rincian Pesanan Tab */}
                            {activeTab === "items" && (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    {items.map((item) => {
                                        // Normalize size_breakdown to handle both old format {size: qty} and new {size: {qty, price}}
                                        const getSizeBreakdown = (breakdown) => {
                                            if (!breakdown) return {};
                                            const normalized = {};
                                            Object.entries(breakdown).forEach(([size, data]) => {
                                                if (typeof data === 'object' && data !== null && 'qty' in data) {
                                                    // New format: {size: {qty: X, price: Y}}
                                                    normalized[size] = {
                                                        qty: Number(data.qty) || 0,
                                                        price: Number(data.price) || 0,
                                                    };
                                                } else {
                                                    // Old format: {size: qty}
                                                    normalized[size] = {
                                                        qty: Number(data) || 0,
                                                        price: Number(item.unit_price) || 0,
                                                    };
                                                }
                                            });
                                            return normalized;
                                        };

                                        const sizeBreakdown = getSizeBreakdown(item.size_breakdown);
                                        const hasSizeBreakdown = Object.keys(sizeBreakdown).length > 0;

                                        return (
                                            <div key={item.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-soft-2xs">
                                                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-xs">{item.item_name}</h4>
                                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                                                            <span className="inline-flex items-center bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                                                                {item.qty} {item.unit}
                                                            </span>
                                                            <span className="text-slate-300">&bull;</span>
                                                            <span>{formatCurrency(item.unit_price)} / {item.unit}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Subtotal</div>
                                                        <div className="font-bold text-teal-600 text-xs">{formatCurrency(item.subtotal)}</div>
                                                    </div>
                                                </div>
                                                {hasSizeBreakdown && (
                                                    <div className="p-4 bg-slate-50/50">
                                                        <div className="w-full text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-3">
                                                            <Layers className="w-3 h-3" /> Rincian Ukuran & Harga
                                                        </div>
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-left border-collapse text-xs">
                                                                <thead>
                                                                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                                                        <th className="p-3">Ukuran</th>
                                                                        <th className="p-3 text-center">Qty</th>
                                                                        <th className="p-3 text-right">Harga Satuan</th>
                                                                        <th className="p-3 text-right">Subtotal</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100">
                                                                    {Object.entries(sizeBreakdown).map(([size, data]) => {
                                                                        const subtotal = data.qty * data.price;
                                                                        return (
                                                                            <tr key={size} className="hover:bg-slate-50/50">
                                                                                <td className="p-3 font-semibold text-slate-700">{size}</td>
                                                                                <td className="p-3 text-center font-mono text-slate-600">{data.qty} Pcs</td>
                                                                                <td className="p-3 text-right font-mono text-slate-600">{formatCurrency(data.price)}</td>
                                                                                <td className="p-3 text-right font-bold text-teal-600 font-mono">{formatCurrency(subtotal)}</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                    <tr className="bg-slate-50 font-bold text-slate-700">
                                                                        <td className="p-3" colSpan="2">Total</td>
                                                                        <td className="p-3 text-right">{sizeBreakdown ? Object.values(sizeBreakdown).reduce((sum, d) => sum + d.qty, 0) : 0} Pcs</td>
                                                                        <td className="p-3 text-right">{formatCurrency(sizeBreakdown ? Object.values(sizeBreakdown).reduce((sum, d) => sum + d.qty * d.price, 0) : 0)}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* BOM Tab */}
                            {activeTab === "bom" && (
                                <div className="animate-in fade-in duration-300 space-y-4">
                                    <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                        <h4 className="font-bold text-indigo-800 flex items-center gap-2 text-xs">
                                            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Estimasi Kebutuhan Bahan
                                        </h4>
                                        <p className="text-[11px] text-indigo-600 mt-1">Berdasarkan kalkulasi resep bahan baku per item pesanan.</p>
                                    </div>
                                    {bomPerItem.length > 0 ? (
                                        <div className="space-y-3">
                                            {bomPerItem.map((itemBOM, index) => {
                                                const groupedMaterials = itemBOM.materials ? itemBOM.materials.reduce((acc, mat) => {
                                                    (acc[mat.forSize] = acc[mat.forSize] || []).push(mat);
                                                    return acc;
                                                }, {}) : {};

                                                return (
                                                    <details key={index} className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-soft-2xs">
                                                        <summary className="bg-slate-50/80 border-b border-slate-200 p-3 cursor-pointer flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                                                            <h5 className="font-bold text-slate-800 text-xs">{itemBOM.itemName}</h5>
                                                            <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                            </span>
                                                        </summary>
                                                        <div className="p-3 space-y-3">
                                                            {Object.keys(groupedMaterials).length > 0 ? (
                                                                Object.entries(groupedMaterials).map(([size, materials]) => (
                                                                    <details key={size} className="group/size border border-slate-200 rounded-lg overflow-hidden">
                                                                        <summary className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-200/60 transition-colors">
                                                                            <div className="flex items-center gap-2">
                                                                                <Layers className="w-3.5 h-3.5 text-slate-500" />
                                                                                <span className="font-bold text-xs text-slate-700">
                                                                                    {size === 'ALL' ? 'Semua / Per Baju' : `Ukuran ${size}`}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-slate-400 group-open/size:rotate-180 transition-transform duration-200">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                                            </span>
                                                                        </summary>
                                                                        <div className="overflow-x-auto">
                                                                            <table className="w-full text-left border-collapse">
                                                                                <thead>
                                                                                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200">
                                                                                        <th className="p-3 font-semibold">Bahan Baku</th>
                                                                                        <th className="p-3 font-semibold text-center">Kebutuhan</th>
                                                                                        <th className="p-3 font-semibold text-center">Stok Gudang</th>
                                                                                        <th className="p-3 font-semibold text-center">Status</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-slate-100">
                                                                                    {materials.map((bom, idx) => {
                                                                                        const isShortage = bom.currentStock !== "-" && bom.totalRequired > bom.currentStock;
                                                                                        return (
                                                                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                                                                <td className="p-3">
                                                                                                    <div className="font-semibold text-slate-800 text-xs">{bom.name}</div>
                                                                                                    <div className="text-[11px] text-slate-400 mt-0.5">{bom.code}</div>
                                                                                                </td>
                                                                                                <td className="p-3 text-center">
                                                                                                    <span className="font-bold text-indigo-600 text-xs">{bom.totalRequired}</span>
                                                                                                    <span className="text-[11px] text-slate-500 ml-1">{bom.unit}</span>
                                                                                                </td>
                                                                                                <td className="p-3 text-center">
                                                                                                    <span className="font-medium text-slate-700 text-xs">{bom.currentStock}</span>
                                                                                                    <span className="text-[11px] text-slate-400 ml-1">{bom.unit}</span>
                                                                                                </td>
                                                                                                <td className="p-3 text-center">
                                                                                                    {bom.currentStock === "-" ? (
                                                                                                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">No Data</span>
                                                                                                    ) : isShortage ? (
                                                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
                                                                                                            <AlertCircle className="w-3 h-3" /> Kurang
                                                                                                        </span>
                                                                                                    ) : (
                                                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">
                                                                                                            <CheckCircle2 className="w-3 h-3" /> Aman
                                                                                                        </span>
                                                                                                    )}
                                                                                                </td>
                                                                                            </tr>
                                                                                        );
                                                                                    })}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </details>
                                                                ))
                                                            ) : (
                                                                <div className="text-center text-xs text-slate-500 py-4">
                                                                    Tidak ada data bahan baku untuk item ini.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </details>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-lg">
                                            Tidak ada data bahan baku untuk pesanan ini.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SPK Tab */}
                            {activeTab === "spk" && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                                                <Scissors className="w-4 h-4 text-teal-600" /> Penugasan Karyawan (SPK)
                                            </h4>
                                            <p className="text-[11px] text-slate-500 mt-1">Buat dan kelola surat perintah kerja ke karyawan.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowSPKForm(!showSPKForm)}
                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer ${showSPKForm ? 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'}`}
                                        >
                                            {showSPKForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                            {showSPKForm ? "Batal" : "Buat Penugasan Baru"}
                                        </button>
                                    </div>

                                    {/* Create Form */}
                                    {showSPKForm && (
                                        <div className="bg-teal-50/50 rounded-lg border border-teal-100 p-4 mb-4 animate-in slide-in-from-top-3 duration-300 shadow-soft-2xs">
                                            <form onSubmit={handleCreateSPK}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Item Baju</label>
                                                        <select
                                                            className="w-full rounded-lg border-slate-300 shadow-2xs focus:border-teal-500 focus:ring-teal-500 text-xs px-3 py-2 bg-white"
                                                            value={spkForm.invoice_item_id}
                                                            onChange={e => {
                                                                const itemId = e.target.value;
                                                                const sItem = items.find(i => i.id == itemId);
                                                                setSpkForm({...spkForm, invoice_item_id: itemId, qty: sItem ? sItem.qty : "", steps: []});
                                                            }}
                                                            required
                                                        >
                                                            <option value="">-- Pilih Baju --</option>
                                                            {items.map(i => <option key={i.id} value={i.id}>{i.item_name} ({i.qty} {i.unit})</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Karyawan</label>
                                                        <select
                                                            className="w-full rounded-lg border-slate-300 shadow-2xs focus:border-teal-500 focus:ring-teal-500 text-xs px-3 py-2 bg-white"
                                                            value={spkForm.user_id}
                                                            onChange={e => setSpkForm({...spkForm, user_id: e.target.value})}
                                                            required
                                                        >
                                                            <option value="">-- Pilih Karyawan --</option>
                                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah (Qty)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full rounded-lg border-slate-300 shadow-2xs focus:border-teal-500 focus:ring-teal-500 text-xs px-3 py-2 bg-white"
                                                            placeholder="Berapa pcs?"
                                                            value={spkForm.qty}
                                                            onChange={e => setSpkForm({...spkForm, qty: e.target.value})}
                                                            required
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Target Waktu (Opsional)</label>
                                                        <input
                                                            type="date"
                                                            className="w-full rounded-lg border-slate-300 shadow-2xs focus:border-teal-500 focus:ring-teal-500 text-xs px-3 py-2 bg-white"
                                                            value={spkForm.target_date}
                                                            onChange={e => setSpkForm({...spkForm, target_date: e.target.value})}
                                                        />
                                                    </div>
                                                </div>

                                                {selectedItemForSPK && selectedItemForSPK.product?.production_steps && (
                                                    <div className="mb-4 bg-white p-3 rounded-lg border border-slate-200">
                                                        <label className="block text-xs font-semibold text-slate-700 mb-2">Langkah Produksi yang Ditugaskan & Target Qty:</label>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                            {selectedItemForSPK.product.production_steps.map(ps => {
                                                                const isChecked = spkForm.steps.some(s => (typeof s === 'object' ? s.id : s) === ps.id);
                                                                const currentStepObj = spkForm.steps.find(s => (typeof s === 'object' ? s.id : s) === ps.id);
                                                                const currentQty = typeof currentStepObj === 'object' ? currentStepObj.qty : (spkForm.qty || selectedItemForSPK.qty || 1);

                                                                return (
                                                                    <div key={ps.id} className={`p-2.5 rounded-lg border transition-all ${isChecked ? 'bg-teal-50/60 border-teal-300 shadow-2xs' : 'bg-slate-50 border-slate-200'}`}>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                                                checked={isChecked}
                                                                                onChange={e => {
                                                                                    if (e.target.checked) {
                                                                                        setSpkForm({
                                                                                            ...spkForm,
                                                                                            steps: [...spkForm.steps.filter(s => (typeof s === 'object' ? s.id : s) !== ps.id), { id: ps.id, qty: spkForm.qty || selectedItemForSPK.qty || 1 }]
                                                                                        });
                                                                                    } else {
                                                                                        setSpkForm({
                                                                                            ...spkForm,
                                                                                            steps: spkForm.steps.filter(s => (typeof s === 'object' ? s.id : s) !== ps.id)
                                                                                        });
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <span className="text-xs font-semibold text-slate-700">{ps.production_step?.name || ps.custom_name}</span>
                                                                        </label>
                                                                        {isChecked && (
                                                                            <div className="flex items-center gap-1.5 mt-2 pl-6">
                                                                                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Qty:</span>
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    className="w-20 rounded-lg border-slate-300 text-xs px-2 py-1 bg-white focus:ring-teal-500 focus:border-teal-500 font-semibold text-slate-700"
                                                                                    value={currentQty}
                                                                                    onChange={e => {
                                                                                        const newQty = e.target.value;
                                                                                        setSpkForm({
                                                                                            ...spkForm,
                                                                                            steps: spkForm.steps.map(s => {
                                                                                                const sId = typeof s === 'object' ? s.id : s;
                                                                                                if (sId === ps.id) {
                                                                                                    return { id: ps.id, qty: newQty };
                                                                                                }
                                                                                                return s;
                                                                                            })
                                                                                        });
                                                                                    }}
                                                                                />
                                                                                <span className="text-[11px] text-slate-500">{selectedItemForSPK.unit || 'Pcs'}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex justify-end">
                                                    <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer text-xs">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Simpan Penugasan
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* Existing SPKs */}
                                    <div className="space-y-3">
                                        {items.flatMap(i => i.production_assignments || []).length > 0 ? (
                                            items.flatMap(item =>
                                                [...(item.production_assignments || [])]
                                                    .sort((a, b) => b.id - a.id)
                                                    .map(assignment => {
                                                        const isOpen = openSpkCards[assignment.id] === true;
                                                        return (
                                                        <div key={assignment.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-soft-2xs">
                                                            <div className="bg-slate-50/80 border-b border-slate-200 px-3 py-2.5 flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenSpkCards(prev => ({ ...prev, [assignment.id]: !isOpen }))}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-200/60 text-slate-400 transition-colors cursor-pointer shrink-0"
                                                                >
                                                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`} />
                                                                </button>
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                                    {(assignment.assignee?.name || 'U').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h5 className="font-bold text-slate-800 text-xs truncate">{assignment.assignee?.name || 'Karyawan'}</h5>
                                                                    <p className="text-[11px] text-slate-500 font-medium truncate">{item.item_name}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    {assignment.status === 'SELESAI' ? (
                                                                        <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5"/> Selesai</span>
                                                                    ) : assignment.status === 'IN_PROGRESS' ? (
                                                                        <span className="text-indigo-600 flex items-center gap-1 text-xs font-bold"><Zap className="w-3.5 h-3.5"/> Proses</span>
                                                                    ) : (
                                                                        <span className="text-slate-500 flex items-center gap-1 text-xs font-bold"><Clock className="w-3.5 h-3.5"/> Pending</span>
                                                                    )}
                                                                    <button onClick={() => handleDeleteSPK(assignment.id)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md cursor-pointer transition-colors" title="Hapus SPK">
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {isOpen && (
                                                                <div className="p-3">
                                                                    <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Langkah Kerja yang Ditugaskan:</h6>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                        {(assignment.steps || []).map(step => (
                                                                            <button
                                                                                key={step.id}
                                                                                onClick={() => handleToggleSPKStep(step.id, step.status)}
                                                                                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all text-left cursor-pointer ${step.status === 'SELESAI' ? 'bg-emerald-50 border-emerald-300 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'}`}
                                                                            >
                                                                                <div className="flex flex-col pr-2">
                                                                                    <span className={`font-medium text-[11px] ${step.status === 'SELESAI' ? 'text-emerald-700' : 'text-slate-700'}`}>{step.step_name}</span>
                                                                                    <span className="text-[10px] text-slate-400 font-normal">{step.qty || assignment.qty || item.qty} {item.unit || 'Pcs'}</span>
                                                                                </div>
                                                                                {step.status === 'SELESAI' ? (
                                                                                    <div className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                                                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="w-4 h-4 rounded-md border-2 border-slate-300 bg-white flex-shrink-0" />
                                                                                )}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        );
                                                    })
                                            )
                                        ) : (
                                            <div className="p-8 text-center bg-slate-50/80 rounded-lg border border-dashed border-slate-300">
                                                <Scissors className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <h4 className="font-bold text-slate-600 mb-1 text-xs">Belum ada penugasan</h4>
                                                <p className="text-[11px] text-slate-500">Klik "Buat Penugasan Baru" untuk membagi tugas ke karyawan.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            </div>
        </DashboardLayout>
    );
}





