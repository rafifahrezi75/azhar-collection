import React, { useRef } from 'react';
import { Printer, X, Download } from 'lucide-react';

export default function InvoicePrintModal({ isOpen, onClose, invoice }) {
    const iframeRef = useRef(null);

    if (!isOpen || !invoice) return null;

    const handlePrint = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow.print();
        }
    };

    const pdfUrl = `/dashboard/invoice/${invoice.id}/print`;

    return (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50 animate-in fade-in duration-200 backdrop-blur-sm p-4 sm:p-6">
            <div className="bg-slate-100 w-full max-w-5xl h-[90vh] rounded-xl flex flex-col overflow-hidden shadow-soft-xl border border-slate-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">Preview Cetak Nota / Struk</h2>
                            <p className="text-[11px] font-medium text-slate-500">
                                {invoice.invoice_number} &bull; {invoice.customer_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={pdfUrl}
                            download={`Struk-${invoice.invoice_number}.pdf`}
                            className="h-9 px-4 inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-md border border-slate-300 transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </a>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="h-9 px-4 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-md transition-colors shadow-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Cetak
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* PDF Preview Iframe */}
                <div className="flex-1 bg-slate-200/50 p-4 sm:p-6 overflow-hidden flex flex-col">
                    <div className="w-full h-full bg-white shadow-sm rounded border border-slate-300 overflow-hidden">
                        <iframe 
                            ref={iframeRef}
                            src={pdfUrl} 
                            className="w-full h-full border-none"
                            title="PDF Preview"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
