import React, { memo, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    X,
    Receipt,
    Calendar,
    User,
    Building,
    Phone,
    MapPin,
    CheckCircle2,
    Clock,
    AlertCircle,
    Package,
    Layers,
    Printer,
    DollarSign,
    Info,
    History,
    Zap,
    Scissors,
    Briefcase,
    ShoppingBag
} from "lucide-react";

const InvoiceDetailModal = memo(function InvoiceDetailModal({
    isOpen,
    invoice,
    onClose,
    onPrint,
}) {
    const [activeTab, setActiveTab] = useState("items"); // 'items' | 'bom' | 'production'
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        if (activeTab === 'production' && users.length === 0) {
            axios.get('/api/users-management')
                .then(res => {
                    const usersList = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                    setUsers(usersList);
                })
                .catch(err => console.error(err));
        }
    }, [activeTab]);

    const handleAssignWorker = (stepId, userId) => {
        axios.put(`/api/invoice-item-production-steps/${stepId}/assign`, { user_id: userId })
            .then(res => {
                Swal.fire({icon: 'success', title: 'Berhasil', text: 'Pekerja berhasil ditugaskan', timer: 1000, showConfirmButton: false})
                    .then(() => window.location.reload());
            })
            .catch(err => Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal menugaskan pekerja'}));
    };

    const handleToggleStatus = (stepId, currentStatus) => {
        const newStatus = currentStatus === 'SELESAI' ? 'PENDING' : 'SELESAI';
        axios.put(`/api/invoice-item-production-steps/${stepId}/status`, { status: newStatus })
            .then(res => {
                Swal.fire({icon: 'success', title: 'Berhasil', text: 'Status diperbarui', timer: 1000, showConfirmButton: false})
                    .then(() => window.location.reload());
            })
            .catch(err => Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal merubah status'}));
    };

    
    const handleGenerateSteps = () => {
        axios.post(`/api/invoice-item-production-steps/${invoice.id}/generate`)
            .then(res => {
                Swal.fire({icon: 'success', title: 'Berhasil', text: 'Data produksi berhasil dibuat', timer: 1000, showConfirmButton: false})
                    .then(() => window.location.reload());
            })
            .catch(err => Swal.fire({icon: 'error', title: 'Gagal', text: 'Gagal membuat data produksi'}));
    };

    if (!isOpen || !invoice) return null;

    const customer = invoice.customer || {};
    const items = invoice.items || [];

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Intl.DateTimeFormat("id-ID", {
                dateStyle: "long",
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    };

    const remainingBalance = Math.max(0, (invoice.total_amount || 0) - (invoice.paid_amount || 0));

    // Calculate aggregated BOM raw materials from items
    const aggregatedBOM = {};
    items.forEach((line) => {
        const prod = line.product;
        const lineQty = Number(line.qty) || 0;
        if (prod && prod.materials) {
            prod.materials.forEach((mat) => {
                const itemName = mat.item?.name || "Bahan Baku";
                const itemCode = mat.item?.code || "-";
                const unit = mat.unit_name || mat.item?.unit?.name || "Unit";
                const required = Number(mat.required_qty) || 0;
                const totalReq = required * lineQty;

                const key = mat.item_id || itemName;
                if (!aggregatedBOM[key]) {
                    aggregatedBOM[key] = {
                        name: itemName,
                        code: itemCode,
                        unit: unit,
                        totalRequired: 0,
                        currentStock: mat.item?.real_stock ?? "-",
                    };
                }
                aggregatedBOM[key].totalRequired += totalReq;
            });
        }
    });
    const bomList = Object.values(aggregatedBOM);

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-slate-50/90 rounded-xl max-w-6xl w-full shadow-soft-xl border border-slate-100 animate-in zoom-in-95 duration-150 flex flex-col md:flex-row overflow-hidden max-h-[92vh]">
                
                {/* Left Column: Summary & Customer Info */}
                <div className="w-full md:w-1/3 bg-white p-5 sm:p-7 border-r border-slate-200/60 flex flex-col overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Invoice</div>
                                <h3 className="font-bold text-slate-900 text-lg">
                                    #{invoice.invoice_number}
                                </h3>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors md:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {invoice.payment_status === "LUNAS" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                            </span>
                        ) : invoice.payment_status === "DP" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3.5 h-3.5" /> DP / Sebagian
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertCircle className="w-3.5 h-3.5" /> Belum Lunas
                            </span>
                        )}

                        {invoice.production_status === "SELESAI" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                <Package className="w-3.5 h-3.5" /> Selesai
                            </span>
                        ) : invoice.production_status === "PROSES" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Zap className="w-3.5 h-3.5" /> Diproses
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                <History className="w-3.5 h-3.5" /> Pending
                            </span>
                        )}
                    </div>

                    {/* Financial Summary Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 mb-6 text-white shadow-lg">
                        <div className="mb-4">
                            <div className="text-slate-400 text-xs font-medium mb-1">Total Tagihan</div>
                            <div className="text-2xl font-bold font-mono">{formatCurrency(invoice.total_amount)}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                            <div>
                                <div className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider mb-1">Telah Dibayar</div>
                                <div className="font-mono text-sm">{formatCurrency(invoice.paid_amount)}</div>
                            </div>
                            <div>
                                <div className="text-rose-400 text-[10px] uppercase font-bold tracking-wider mb-1">Sisa Tagihan</div>
                                <div className="font-mono text-sm">{formatCurrency(remainingBalance)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-4 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-teal-600" />
                            Informasi Pelanggan
                        </h4>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                            <div>
                                <div className="text-xs text-slate-500 mb-0.5">Nama Pelanggan</div>
                                <div className="font-semibold text-slate-800">{invoice.customer_name || customer.name || "-"}</div>
                            </div>
                            {customer.phone && (
                                <div className="flex items-start gap-2">
                                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <span className="text-sm text-slate-600">{customer.phone}</span>
                                </div>
                            )}
                            {customer.address && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <span className="text-sm text-slate-600">{customer.address}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Tgl Pesan
                                </div>
                                <div className="font-medium text-sm text-slate-800">{formatDate(invoice.order_date)}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Estimasi Selesai
                                </div>
                                <div className="font-medium text-sm text-slate-800">{formatDate(invoice.completion_date)}</div>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
                                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mb-1">
                                    <Info className="w-3.5 h-3.5" /> Catatan Pesanan
                                </div>
                                <p className="text-sm text-amber-800">{invoice.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Tabs & Content */}
                <div className="w-full md:w-2/3 flex flex-col h-[50vh] md:h-auto overflow-hidden bg-slate-50/50">
                    {/* Header with Close & Print */}
                    <div className="hidden md:flex justify-end p-4 border-b border-slate-200/60 bg-white">
                        <div className="flex gap-2">
                            <button
                                onClick={onPrint}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm text-sm"
                            >
                                <Printer className="w-4 h-4" />
                                Cetak Nota
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200 border border-transparent"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex p-2 bg-white/60 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10 gap-2">
                        <button
                            onClick={() => setActiveTab("items")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                                activeTab === "items"
                                    ? "bg-white text-teal-600 shadow-sm border border-slate-200/60"
                                    : "text-slate-500 hover:bg-slate-100/50"
                            }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Rincian Pesanan
                        </button>
                        <button
                            onClick={() => setActiveTab("bom")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                                activeTab === "bom"
                                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60"
                                    : "text-slate-500 hover:bg-slate-100/50"
                            }`}
                        >
                            <Layers className="w-4 h-4" />
                            Kebutuhan Bahan Gudang
                        </button>
                        <button
                            onClick={() => setActiveTab("production")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-bold transition-all ${
                                activeTab === "production"
                                    ? "bg-white text-emerald-600 shadow-sm border border-slate-200/60"
                                    : "text-slate-500 hover:bg-slate-100/50"
                            }`}
                        >
                            <Scissors className="w-4 h-4" />
                            Progres Produksi
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                                                {activeTab === "production" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <Scissors className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-lg font-bold text-slate-800">Progres Langkah Produksi</h3>
                                </div>
                                <div className="space-y-6">
                                    {items.map((item, idx) => (
                                        <div key={item.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold text-slate-800">{item.item_name}</span>
                                                    <span className="text-xs text-slate-500 ml-2">{item.qty} {item.unit}</span>
                                                </div>
                                            </div>
                                            <div className="p-0 overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                                        <tr>
                                                            <th className="px-4 py-3">Langkah</th>
                                                            <th className="px-4 py-3 min-w-[200px]">Pekerja</th>
                                                            <th className="px-4 py-3 text-center min-w-[120px]">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {item.production_steps && item.production_steps.length > 0 ? item.production_steps.map((step) => (
                                                            <tr key={step.id} className="hover:bg-slate-50/50">
                                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                                    {step.step_name}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <select
                                                                        value={step.assigned_to || ""}
                                                                        onChange={(e) => handleAssignWorker(step.id, e.target.value)}
                                                                        className="text-xs border-slate-200 rounded-md bg-white w-full"
                                                                    >
                                                                        <option value="">-- Belum Ditugaskan --</option>
                                                                        {users.map(u => (
                                                                            <option key={u.id} value={u.id}>{u.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <button
                                                                        onClick={() => handleToggleStatus(step.id, step.status)}
                                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                                                            step.status === 'SELESAI' 
                                                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
                                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                                                        }`}
                                                                    >
                                                                        {step.status === 'SELESAI' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                                        {step.status === 'SELESAI' ? 'Selesai' : 'Pending'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr><td colSpan="3" className="px-4 py-6 text-center">
    <div className="text-slate-400 italic mb-3">Belum ada langkah produksi (Pesanan Lama).</div>
    <button onClick={handleGenerateSteps} className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-md hover:bg-indigo-100 transition-colors text-xs border border-indigo-200">
        Generate Langkah Produksi
    </button>
</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "items" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {items.map((item, idx) => {
                                    const breakdown = item.size_breakdown || {};
                                    const breakdownEntries = Object.entries(breakdown);
                                    const productSteps = item.product?.production_steps || [];
                                    
                                    // Build a size-name → category map from product.sizes
                                    const sizeInfoMap = {};
                                    (item.product?.sizes || []).forEach(ps => {
                                        const sName = ps.size?.size_name;
                                        const sCat  = ps.size?.category;
                                        if (sName) sizeInfoMap[sName] = sCat || null;
                                    });

                                    // Group breakdown entries by category
                                    const groupedBreakdown = {};
                                    breakdownEntries.forEach(([size, qty]) => {
                                        const cat = sizeInfoMap[size] || 'Lainnya';
                                        if (!groupedBreakdown[cat]) groupedBreakdown[cat] = [];
                                        groupedBreakdown[cat].push({ size, qty });
                                    });
                                    const hasGrouped = Object.keys(groupedBreakdown).length > 0;

                                    return (
                                        <div key={item.id || idx} className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                            {/* Item Header */}
                                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-base">{item.item_name}</h5>
                                                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                                            {item.qty} {item.unit}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="font-mono">{formatCurrency(item.unit_price)} / {item.unit}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Subtotal</div>
                                                    <div className="font-bold text-teal-600 font-mono text-lg">{formatCurrency(item.subtotal)}</div>
                                                </div>
                                            </div>

                                            {/* Breakdown & Production Steps Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                                
                                                {/* Size Breakdown */}
                                                <div className="p-4">
                                                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3">
                                                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                        Rincian Ukuran
                                                    </div>
                                                    {hasGrouped ? (
                                                        <div className="space-y-3">
                                                            {Object.entries(groupedBreakdown).map(([cat, sizes]) => (
                                                                <div key={cat}>
                                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                                        <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full border border-teal-100">{cat}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-1.5">
                                                                        {sizes.map(({ size, qty }, sIdx) => (
                                                                            <div key={sIdx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                                                                                <span className="font-bold text-slate-700 text-sm">{size}</span>
                                                                                <span className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded border border-slate-200">{qty} Pcs</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-200">
                                                                <span className="text-xs font-bold text-slate-600">Total</span>
                                                                <span className="text-xs font-bold text-teal-600">{item.qty} {item.unit}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200 text-center">
                                                            Tidak ada rincian ukuran
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Production Steps */}
                                                <div className="p-4 bg-slate-50/30">
                                                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3">
                                                        <Scissors className="w-3.5 h-3.5 text-slate-400" />
                                                        Estimasi Upah Jahit <span className="normal-case text-slate-400 font-medium">(per {item.unit})</span>
                                                    </div>
                                                    {productSteps.length > 0 ? (
                                                        <div className="space-y-1.5">
                                                            {productSteps.map((step, sIdx) => (
                                                                <div key={sIdx} className="flex justify-between items-center text-xs py-1.5 border-b border-dashed border-slate-200 last:border-0">
                                                                    <div className="flex items-center gap-2 text-slate-600">
                                                                        <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[9px] font-bold shrink-0">{sIdx + 1}</span>
                                                                        <span className="line-clamp-1">{step.production_step?.name || step.custom_name || `Langkah ${step.production_step_id}`}</span>
                                                                    </div>
                                                                    <span className="font-mono font-medium text-slate-700">{formatCurrency(step.wage)}</span>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-200">
                                                                <span className="text-xs font-bold text-slate-800">Total Upah:</span>
                                                                <span className="font-mono text-sm font-bold text-indigo-600">
                                                                    {formatCurrency(productSteps.reduce((sum, s) => sum + Number(s.wage || 0), 0))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-slate-400 italic bg-white p-3 rounded-lg border border-dashed border-slate-200 text-center">
                                                            Tidak ada data upah produksi
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {items.length === 0 && (
                                    <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                        <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">Tidak ada item pesanan dalam invoice ini.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "bom" && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            <Layers className="w-5 h-5 text-indigo-500" />
                                            Estimasi Total Kebutuhan Bahan Baku
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Berdasarkan total kuantitas produk dikalikan dengan resep bahan (BOM) masing-masing produk.
                                        </p>
                                    </div>

                                    {bomList.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                                        <th className="p-3 font-semibold">Bahan Baku</th>
                                                        <th className="p-3 font-semibold text-center">Kebutuhan</th>
                                                        <th className="p-3 font-semibold text-center">Stok Gudang</th>
                                                        <th className="p-3 font-semibold text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {bomList.map((bom, idx) => {
                                                        const isShortage = bom.currentStock !== "-" && bom.totalRequired > bom.currentStock;
                                                        
                                                        return (
                                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="p-3">
                                                                    <div className="font-semibold text-slate-800 text-sm">{bom.name}</div>
                                                                    <div className="text-xs text-slate-400 font-mono mt-0.5">{bom.code}</div>
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    <span className="font-bold text-indigo-600">{bom.totalRequired}</span>
                                                                    <span className="text-xs text-slate-500 ml-1">{bom.unit}</span>
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    <span className="font-medium text-slate-700">{bom.currentStock}</span>
                                                                    <span className="text-xs text-slate-400 ml-1">{bom.unit}</span>
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    {bom.currentStock === "-" ? (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
                                                                            No Data
                                                                        </span>
                                                                    ) : isShortage ? (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
                                                                            <AlertCircle className="w-3 h-3" /> Kurang
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">
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
                                    ) : (
                                        <div className="p-8 text-center text-slate-500">
                                            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                            Tidak ada data kebutuhan bahan baku (BOM belum diatur).
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Mobile Print Button */}
                    <div className="md:hidden p-4 border-t border-slate-200/60 bg-white">
                        <button
                            onClick={onPrint}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 transition-colors"
                        >
                            <Printer className="w-5 h-5" />
                            Cetak Nota
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default InvoiceDetailModal;
