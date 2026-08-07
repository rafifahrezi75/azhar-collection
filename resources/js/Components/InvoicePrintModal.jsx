import React, { memo, useRef } from "react";
import { X, Printer, Receipt } from "lucide-react";

const InvoicePrintModal = memo(function InvoicePrintModal({
    isOpen,
    invoice,
    onClose,
}) {
    const printAreaRef = useRef(null);

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

    const handlePrint = () => {
        window.print();
    };

    const remainingBalance = Math.max(0, (invoice.total_amount || 0) - (invoice.paid_amount || 0));

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-md max-w-4xl w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col print:max-w-none print:max-h-none print:shadow-none print:border-none">
                
                {/* Modal Action Bar (Hidden on Print) */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 print:hidden shrink-0">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                        <Receipt className="w-4 h-4 text-teal-600" />
                        <span>Pratinjau Cetak Nota #{invoice.invoice_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors cursor-pointer shadow-xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Sekarang</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Sheet */}
                <div ref={printAreaRef} className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white">
                    
                    {/* Header: Company Info & Invoice Meta */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 pb-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                                    AZHAR COLLECTION
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-teal-100 text-teal-800 rounded">
                                    Konveksi & Tailor
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 max-w-sm">
                                Produsen Seragam Sekolah, Olahraga, Kemeja PDH/PDL, Jas Almamater, Kaos & Busana Muslim Berkualitas.
                            </p>
                            <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3">
                                <span>Jl. Teratai No. 12, Tasikmalaya</span>
                                <span>Telp/WA: 0812-3456-7890</span>
                            </div>
                        </div>

                        <div className="text-left sm:text-right space-y-1">
                            <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                                #{invoice.invoice_number}
                            </div>
                            <div className="text-xs text-slate-600">
                                Tanggal: <strong>{formatDate(invoice.order_date)}</strong>
                            </div>
                            {invoice.completion_date && (
                                <div className="text-xs text-slate-500">
                                    Selesai: {formatDate(invoice.completion_date)}
                                </div>
                            )}
                            <div className="pt-1">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                                        invoice.payment_status === "LUNAS"
                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                            : invoice.payment_status === "DP"
                                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                                            : "bg-rose-100 text-rose-800 border border-rose-300"
                                    }`}
                                >
                                    {invoice.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Order Information Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-md bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="space-y-1.5">
                            <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                Ditujukan Kepada (Pemesan):
                            </div>
                            <div className="font-bold text-slate-900 text-sm">
                                {invoice.customer_name}
                            </div>
                            {customer.type && (
                                <div className="text-slate-600">
                                    Kategori: <span className="font-medium text-slate-800">{customer.type}</span>
                                </div>
                            )}
                            {customer.institution_name && (
                                <div className="text-slate-600">
                                    Instansi: <span className="font-medium text-slate-800">{customer.institution_name}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                Kontak & Alamat:
                            </div>
                            {customer.contact_person && (
                                <div className="text-slate-600">
                                    PIC: <span className="font-medium text-slate-800">{customer.contact_person}</span>
                                </div>
                            )}
                            {customer.phone && (
                                <div className="text-slate-600">
                                    Telepon / WA: <span className="font-medium text-slate-800">{customer.phone}</span>
                                </div>
                            )}
                            {customer.address && (
                                <div className="text-slate-600">
                                    Alamat: <span className="font-medium text-slate-800">{customer.address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Invoice Line Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-800 text-[11px] uppercase tracking-wider text-slate-700 font-bold bg-slate-100">
                                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                                    <th className="py-2.5 px-3">Item Pesanan & Rincian Ukuran</th>
                                    <th className="py-2.5 px-3 text-center w-24">Satuan</th>
                                    <th className="py-2.5 px-3 text-center w-20">Qty</th>
                                    <th className="py-2.5 px-3 text-right w-32">Harga Satuan</th>
                                    <th className="py-2.5 px-3 text-right w-32">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs">
                                {items.map((item, idx) => {
                                    const breakdown = item.size_breakdown || {};
                                    const breakdownEntries = Object.entries(breakdown);

                                    return (
                                        <tr key={item.id || idx}>
                                            <td className="py-3 px-3 text-center font-medium text-slate-400">
                                                {idx + 1}
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="font-bold text-slate-900">
                                                    {item.item_name}
                                                </div>
                                                {item.description && (
                                                    <div className="text-[11px] text-slate-500 italic mt-0.5">
                                                        {item.description}
                                                    </div>
                                                )}
                                                {/* Size Breakdown Pills */}
                                                {breakdownEntries.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                                        <span className="text-[10px] font-semibold text-slate-500">
                                                            Rincian Size:
                                                        </span>
                                                        {breakdownEntries.map(([sz, qty]) => (
                                                            <span
                                                                key={sz}
                                                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300"
                                                            >
                                                                {sz}: {qty}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-center font-medium text-slate-700">
                                                {item.unit || "Stel"}
                                            </td>
                                            <td className="py-3 px-3 text-center font-bold font-mono text-slate-900">
                                                {item.qty}
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-slate-700">
                                                {formatCurrency(item.unit_price)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Summary & Signatures */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2 items-start">
                        {/* Left: Notes & Terms */}
                        <div className="sm:col-span-7 space-y-3">
                            <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
                                <div className="font-bold text-slate-700 text-[11px]">Catatan / Keterangan:</div>
                                <p className="text-slate-600 leading-relaxed text-[11px]">
                                    {invoice.notes || "Barang yang sudah diproses atau dipotong tidak dapat dibatalkan. Terima kasih atas kepercayaan Anda kepada Azhar Collection."}
                                </p>
                            </div>

                            {/* Payment Stamp Indicator */}
                            <div className="pt-2">
                                <div className="border-2 border-dashed border-slate-300 rounded p-3 text-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                        Stempel & Tanda Tangan
                                    </span>
                                    <div className="h-14 flex items-center justify-center">
                                        <span className={`text-sm font-black uppercase tracking-widest px-3 py-1 border-2 rotate-[-5deg] rounded ${
                                            invoice.payment_status === "LUNAS"
                                                ? "border-emerald-600 text-emerald-600"
                                                : "border-amber-600 text-amber-600"
                                        }`}>
                                            {invoice.payment_status === "LUNAS" ? "LUNAS / PAID" : "UANG MUKA / DP"}
                                        </span>
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-700">
                                        Azhar Collection Management
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Calculations */}
                        <div className="sm:col-span-5 space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                                <span>Subtotal:</span>
                                <span className="font-bold font-mono text-slate-900">
                                    {formatCurrency(invoice.subtotal)}
                                </span>
                            </div>

                            {invoice.discount > 0 && (
                                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                                    <span>Diskon / Potongan:</span>
                                    <span className="font-bold font-mono">
                                        -{formatCurrency(invoice.discount)}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between py-2 border-b-2 border-slate-900 text-slate-900 font-bold text-sm">
                                <span>Total Tagihan:</span>
                                <span className="font-mono">
                                    {formatCurrency(invoice.total_amount)}
                                </span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                                <span>Jumlah Terbayar:</span>
                                <span className="font-bold font-mono">
                                    {formatCurrency(invoice.paid_amount)}
                                </span>
                            </div>

                            <div className="flex justify-between py-1.5 text-slate-900 font-bold">
                                <span>Sisa Tagihan:</span>
                                <span className={`font-mono ${remainingBalance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                    {formatCurrency(remainingBalance)}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Modal Footer (Hidden on Print) */}
                <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50 print:hidden shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 rounded transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors cursor-pointer shadow-xs"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Nota</span>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default InvoicePrintModal;
