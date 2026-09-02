import React, { useRef } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Printer, Download, ArrowLeft, Scissors } from "lucide-react";

export default function ProductionPreview({ invoice }) {
    const iframeRef = useRef(null);
    const pdfUrl = `/dashboard/invoice/${invoice.id}/production-pdf`;

    const handlePrint = () => {
        if (iframeRef.current) iframeRef.current.contentWindow.print();
    };

    return (
        <DashboardLayout>
            <Head title={`Preview SPK - ${invoice.invoice_number}`} />

            <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
                <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => router.visit(`/dashboard/invoice/${invoice.id}`)}
                            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Kembali ke Detail Invoice"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 shrink-0">
                            <Scissors className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight truncate">
                                Preview Cetak Surat Perintah Kerja (SPK)
                            </h3>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                {invoice.invoice_number} &bull; {invoice.customer_name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={pdfUrl}
                            download={`SPK-${invoice.invoice_number}.pdf`}
                            className="h-9 px-3 inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-colors"
                        >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            <span>PDF</span>
                        </a>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="h-9 px-3.5 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 w-full bg-white">
                    <iframe
                        ref={iframeRef}
                        src={pdfUrl}
                        className="w-full h-full border-none block bg-white"
                        title="PDF Preview SPK"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
