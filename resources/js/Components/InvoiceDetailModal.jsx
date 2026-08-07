import React, { memo } from "react";
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
} from "lucide-react";

const InvoiceDetailModal = memo(function InvoiceDetailModal({
    isOpen,
    invoice,
    onClose,
    onPrint,
}) {
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-3xl w-full p-4 sm:p-6 shadow-xl space-y-5 border border-slate-200 animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar">
                
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                                    Invoice #{invoice.invoice_number}
                                </h3>
                                <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                                        invoice.type === "HISTORICAL"
                                            ? "bg-amber-50 text-amber-800 border-amber-200"
                                            : "bg-teal-50 text-teal-800 border-teal-200"
                                    }`}
                                >
                                    {invoice.type === "HISTORICAL" ? (
                                        <>
                                            <History className="w-3 h-3 text-amber-600" />
                                            <span>Pesanan Lama (Historis)</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-3 h-3 text-teal-600" />
                                            <span>Pesanan Baru (Reguler)</span>
                                        </>
                                    )}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Pemesan: <strong className="text-slate-800">{invoice.customer_name}</strong>
                                {customer.institution_name && ` (${customer.institution_name})`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => onPrint && onPrint(invoice)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors cursor-pointer"
                            title="Cetak Nota Resmi"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Nota</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Status & Financial Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100 space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Tagihan</span>
                        <span className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(invoice.total_amount)}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100 space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Terbayar</span>
                        <span className="text-sm font-bold text-emerald-700 font-mono">{formatCurrency(invoice.paid_amount)}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100 space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Sisa Piutang</span>
                        <span className={`text-sm font-bold font-mono ${remainingBalance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            {remainingBalance > 0 ? formatCurrency(remainingBalance) : "LUNAS"}
                        </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100 space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Status Bayar</span>
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                invoice.payment_status === "LUNAS"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : invoice.payment_status === "DP"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                            }`}
                        >
                            {invoice.payment_status}
                        </span>
                    </div>
                </div>

                {/* Customer & Transaction Timeline Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-md border border-slate-200/80 text-xs">
                    {/* Left: Customer info */}
                    <div className="space-y-1.5">
                        <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-teal-600" />
                            <span>Informasi Pemesan:</span>
                        </div>
                        <div className="pl-5 space-y-1 text-slate-600">
                            <div>Nama: <strong className="text-slate-800">{invoice.customer_name}</strong></div>
                            {customer.institution_name && (
                                <div>Instansi: <span className="text-slate-800 font-medium">{customer.institution_name}</span></div>
                            )}
                            {customer.contact_person && (
                                <div>PIC: <span className="text-slate-800 font-medium">{customer.contact_person}</span></div>
                            )}
                            {customer.phone && (
                                <div>Telepon / WA: <span className="text-slate-800 font-medium">{customer.phone}</span></div>
                            )}
                            {customer.address && (
                                <div>Alamat: <span className="text-slate-800">{customer.address}</span></div>
                            )}
                        </div>
                    </div>

                    {/* Right: Order Dates & Production Status */}
                    <div className="space-y-1.5">
                        <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-teal-600" />
                            <span>Jadwal & Produksi:</span>
                        </div>
                        <div className="pl-5 space-y-1 text-slate-600">
                            <div>Tanggal Pesan: <strong className="text-slate-800">{formatDate(invoice.order_date)}</strong></div>
                            <div>Target Selesai: <strong className="text-slate-800">{formatDate(invoice.completion_date)}</strong></div>
                            <div>Status Pengerjaan: <span className="font-bold text-slate-800">{invoice.production_status || "SELESAI"}</span></div>
                            <div>
                                Potong Stok Gudang:{" "}
                                <span className={`font-bold ${invoice.cut_stock ? "text-emerald-700" : "text-amber-700"}`}>
                                    {invoice.cut_stock ? "Ya (Stok Terpotong)" : "Tidak (Bypass Stok)"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items & Size Breakdown Table */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                        <Package className="w-4 h-4 text-teal-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Rincian Item Pesanan ({items.length} Item)
                        </h4>
                    </div>

                    <div className="border border-slate-200 rounded-md overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                    <th className="py-2 px-3 w-10 text-center">No</th>
                                    <th className="py-2 px-3">Nama Produk & Rincian Ukuran</th>
                                    <th className="py-2 px-3 text-center w-24">Satuan</th>
                                    <th className="py-2 px-3 text-center w-20">Qty</th>
                                    <th className="py-2 px-3 text-right w-28">Harga Satuan</th>
                                    <th className="py-2 px-3 text-right w-28">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, idx) => {
                                    const breakdown = item.size_breakdown || {};
                                    const breakdownEntries = Object.entries(breakdown);

                                    return (
                                        <tr key={item.id || idx} className="hover:bg-slate-50/50">
                                            <td className="py-2.5 px-3 text-center font-medium text-slate-400">
                                                {idx + 1}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="font-bold text-slate-900">
                                                    {item.item_name}
                                                </div>
                                                {item.description && (
                                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                                        {item.description}
                                                    </div>
                                                )}
                                                {/* Size Breakdown Pills */}
                                                {breakdownEntries.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                                        <span className="text-[10px] font-semibold text-slate-500">
                                                            Sebaran Size:
                                                        </span>
                                                        {breakdownEntries.map(([sz, qty]) => (
                                                            <span
                                                                key={sz}
                                                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200"
                                                            >
                                                                {sz}: {qty}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-slate-600">
                                                {item.unit || "Stel"}
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-900">
                                                {item.qty}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                                                {formatCurrency(item.unit_price)}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BOM Warehouse Requirements Summary (If available) */}
                {bomList.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                            <Layers className="w-4 h-4 text-teal-600" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Estimasi Alokasi Bahan Baku Gudang (BOM)
                            </h4>
                        </div>
                        <div className="border border-slate-200 rounded-md overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                        <th className="py-2 px-3">Bahan Baku Gudang</th>
                                        <th className="py-2 px-3 text-center w-36">Total Kebutuhan</th>
                                        <th className="py-2 px-3 text-center w-36">Stok Gudang</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {bomList.map((b, bIdx) => (
                                        <tr key={bIdx} className="hover:bg-slate-50/50">
                                            <td className="py-2 px-3">
                                                <div className="font-bold text-slate-900">{b.name}</div>
                                                <div className="text-[10px] font-mono text-slate-500">{b.code}</div>
                                            </td>
                                            <td className="py-2 px-3 text-center font-bold text-teal-700 font-mono">
                                                {b.totalRequired.toLocaleString("id-ID", { maximumFractionDigits: 2 })} {b.unit}
                                            </td>
                                            <td className="py-2 px-3 text-center text-slate-600 font-mono">
                                                {b.currentStock} {b.unit}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Notes if any */}
                {invoice.notes && (
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200/80 space-y-1 text-xs">
                        <div className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                            <Info className="w-3.5 h-3.5 text-teal-600" />
                            <span>Catatan Transaksi:</span>
                        </div>
                        <p className="text-slate-600 pl-5">
                            {invoice.notes}
                        </p>
                    </div>
                )}

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                        Dicatat pada {formatDate(invoice.created_at)}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onPrint && onPrint(invoice)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors cursor-pointer shadow-2xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Nota</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
});

export default InvoiceDetailModal;
