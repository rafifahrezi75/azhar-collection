import React, { memo, useRef } from "react";
import { X, Printer, Scissors } from "lucide-react";

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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto print:p-0 print:bg-white print:static">
            
            {/* F4 Wrapper Container */}
            <div className="relative w-full max-w-[794px] bg-white shadow-2xl mx-auto flex flex-col print:max-w-none print:shadow-none print:w-full">
                
                {/* Print Toolbar (Hidden on Print) */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white print:hidden sticky top-0 z-10 rounded-t-lg">
                    <div className="text-sm font-semibold">
                        Preview Cetak F4 (Folio) - #{invoice.invoice_number}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-md font-bold text-sm transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Cetak
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-300 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* F4 Paper Content Area */}
                {/* A4 is 210x297mm, F4 is 210x330mm. Min-height helps simulate F4 aspect ratio on screen */}
                <div 
                    ref={printAreaRef} 
                    className="bg-white text-black p-8 sm:p-12 print:p-0 min-h-[1122px]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">AZHAR COLLECTION</h1>
                            <p className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">Konveksi & Tailor Seragam</p>
                            <div className="text-xs text-gray-700 space-y-1">
                                <p>Jl. Teratai No. 12, Tasikmalaya</p>
                                <p>Telp/WA: 0812-3456-7890</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-2">INVOICE</h2>
                            <div className="text-sm font-bold">NO: {invoice.invoice_number}</div>
                            <div className="text-xs text-gray-600 mt-1">Tanggal: {formatDate(invoice.order_date)}</div>
                        </div>
                    </div>

                    {/* Customer & Order Info */}
                    <div className="flex justify-between mb-8">
                        <div className="w-1/2">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Ditagihkan Kepada:</div>
                            <div className="font-bold text-lg">{invoice.customer_name || customer.name}</div>
                            <div className="text-sm text-gray-700 max-w-[250px] leading-relaxed mt-1">
                                {customer.address || "-"}
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                                Telp: {customer.phone || "-"}
                            </div>
                        </div>
                        <div className="w-1/2 text-right">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Detail Pesanan:</div>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div className="text-gray-600">Estimasi Selesai:</div>
                                <div className="font-bold">{formatDate(invoice.completion_date)}</div>
                                <div className="text-gray-600">Status Bayar:</div>
                                <div className="font-bold">{invoice.payment_status}</div>
                                <div className="text-gray-600">Status Produksi:</div>
                                <div className="font-bold">{invoice.production_status}</div>
                            </div>
                        </div>
                    </div>

                    {/* Table Items */}
                    <table className="w-full text-left mb-8 border-collapse">
                        <thead>
                            <tr className="border-y-2 border-black">
                                <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider w-12 text-center">No</th>
                                <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider">Deskripsi Item & Rincian</th>
                                <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-center w-24">Qty</th>
                                <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-right w-32">Harga Satuan</th>
                                <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-right w-36">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map((item, idx) => {
                                const breakdown = item.size_breakdown || {};
                                const breakdownEntries = Object.entries(breakdown);
                                const productSteps = item.product?.production_steps || [];

                                return (
                                    <React.Fragment key={item.id || idx}>
                                        <tr className="align-top">
                                            <td className="py-4 px-2 text-center text-sm">{idx + 1}</td>
                                            <td className="py-4 px-2">
                                                <div className="font-bold text-sm">{item.item_name}</div>
                                                
                                                {/* Size Breakdown */}
                                                {breakdownEntries.length > 0 && (
                                                    <div className="mt-2 text-xs text-gray-600">
                                                        <span className="font-bold">Ukuran: </span>
                                                        {breakdownEntries.map(([s, q]) => `${s}(${q})`).join(', ')}
                                                    </div>
                                                )}

                                                {/* Production Steps */}
                                                {productSteps.length > 0 && (
                                                    <div className="mt-2 border-t border-dashed border-gray-300 pt-2">
                                                        <div className="text-[10px] font-bold uppercase flex items-center gap-1 mb-1">
                                                            <Scissors className="w-3 h-3" /> Langkah Produksi
                                                        </div>
                                                        <div className="text-[10px] text-gray-600 grid grid-cols-1 gap-1">
                                                            {productSteps.map((step, sIdx) => (
                                                                <div key={sIdx} className="flex justify-between">
                                                                    <span>{sIdx + 1}. {step.production_step?.name || step.custom_name}</span>
                                                                    <span>{formatCurrency(step.wage)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-2 text-center text-sm font-bold">{item.qty} {item.unit}</td>
                                            <td className="py-4 px-2 text-right text-sm">{formatCurrency(item.unit_price)}</td>
                                            <td className="py-4 px-2 text-right text-sm font-bold">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Summary & Signatures */}
                    <div className="flex justify-between items-start">
                        <div className="w-1/2 pr-8">
                            {invoice.notes && (
                                <div className="mb-6">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-1">Catatan:</div>
                                    <div className="text-xs text-gray-700 italic bg-gray-50 p-3 rounded border border-gray-200">
                                        "{invoice.notes}"
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex gap-16 mt-8">
                                <div className="text-center">
                                    <div className="text-xs mb-16">Hormat Kami,</div>
                                    <div className="text-xs font-bold border-b border-black w-32 mx-auto">Azhar Collection</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs mb-16">Penerima,</div>
                                    <div className="text-xs font-bold border-b border-black w-32 mx-auto">{invoice.customer_name || customer.name}</div>
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2 max-w-[320px]">
                            <div className="border border-black p-4 rounded-lg">
                                <div className="flex justify-between mb-2 text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                {invoice.discount > 0 && (
                                    <div className="flex justify-between mb-2 text-sm text-red-600">
                                        <span>Diskon</span>
                                        <span>-{formatCurrency(invoice.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between mb-2 text-sm font-bold border-t border-black pt-2">
                                    <span>Total Tagihan</span>
                                    <span>{formatCurrency(invoice.total_amount)}</span>
                                </div>
                                <div className="flex justify-between mb-2 text-sm">
                                    <span>Telah Dibayar</span>
                                    <span>{formatCurrency(invoice.paid_amount)}</span>
                                </div>
                                <div className="flex justify-between text-base font-black border-t-2 border-black pt-2 mt-2">
                                    <span>Sisa Tagihan</span>
                                    <span>{formatCurrency(remainingBalance)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer text */}
                    <div className="mt-16 text-center text-[10px] text-gray-400">
                        Dicetak pada: {new Date().toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default InvoicePrintModal;
