import React, { memo, useMemo } from "react";
import { X, Printer, Package, CalendarDays, ExternalLink } from "lucide-react";
import {
    formatRupiah,
    formatDate,
    formatDateWithDay,
    PaymentBadge,
    ProductionBadge,
} from "./dashboardShared";

const InvoiceDrillModal = memo(function InvoiceDrillModal({ invoice, onClose }) {
    const totals = useMemo(() => {
        if (!invoice) return { total: 0, paid: 0, sisa: 0 };
        const total = Number(invoice.total) || 0;
        const paid = Number(invoice.paid) || 0;
        return { total, paid, sisa: Math.max(0, total - paid) };
    }, [invoice]);

    if (!invoice) return null;

    const handlePrint = () => {
        window.location.href = route("invoice.print-preview", invoice.id);
    };

    return (
        <div
            className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-soft-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-200 bg-slate-50/70">
                    <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detail Pesanan</div>
                        <h2 className="text-base font-bold text-slate-900 font-mono truncate">{invoice.invoice_number}</h2>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <PaymentBadge value={invoice.payment_status} />
                            <ProductionBadge value={invoice.production_status} />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tgl Order</div>
                            <div className="text-xs font-semibold text-slate-700">{formatDateWithDay(invoice.order_date)}</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Package className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Target Selesai</div>
                            <div className="text-xs font-semibold text-slate-700">{formatDate(invoice.target_date)}</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                    {(invoice.items || []).length === 0 && (
                        <p className="text-sm text-slate-400 italic text-center py-6">Tidak ada item pada invoice ini.</p>
                    )}
                    {(invoice.items || []).map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-200/70 overflow-hidden">
                            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 border-b border-slate-100">
                                <h4 className="text-xs font-bold text-slate-800">{item.product_name}</h4>
                                <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 font-medium shrink-0">
                                    {item.qty} {item.unit || "pcs"}
                                </span>
                            </div>
                            <div className="px-3.5 py-2 divide-y divide-dashed divide-slate-100">
                                {(item.sizes || []).length > 0 ? (
                                    item.sizes.map((s, sIdx) => (
                                        <div key={sIdx} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                                            <span className="font-semibold text-slate-600 w-16 shrink-0">
                                                {s.size}
                                            </span>
                                            <span className="text-slate-500 tabular-nums">×{s.qty}</span>
                                            <span className="text-slate-400 tabular-nums">@ {formatRupiah(s.unit_price)}</span>
                                            <span className="font-mono font-semibold text-slate-700 tabular-nums ml-auto">
                                                {formatRupiah(s.subtotal)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-1.5 flex items-center justify-between gap-2 text-xs">
                                        <span className="text-slate-500 tabular-nums">×{item.qty}</span>
                                        <span className="text-slate-400 tabular-nums">@ {formatRupiah(item.unit_price)}</span>
                                        <span className="font-mono font-semibold text-slate-700 tabular-nums ml-auto">
                                            {formatRupiah(item.subtotal)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between px-3.5 py-2 bg-teal-50/40 border-t border-teal-100/60">
                                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Subtotal</span>
                                <span className="text-sm font-bold text-teal-700 font-mono">{formatRupiah(item.subtotal)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-200 bg-slate-50/70 p-5 space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-500">Total</span>
                        <span className="font-bold text-slate-900 font-mono">{formatRupiah(totals.total)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-500">Dibayar</span>
                        <span className="font-bold text-emerald-600 font-mono">{formatRupiah(totals.paid)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-500">Sisa</span>
                        <span className={`font-bold font-mono ${totals.sisa > 0 ? "text-rose-600" : "text-slate-400"}`}>
                            {formatRupiah(totals.sisa)}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <a
                            href={route("invoice.show", invoice.id)}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-soft-2xs"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Halaman Invoice
                        </a>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-soft-xs cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Cetak Nota
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default InvoiceDrillModal;
