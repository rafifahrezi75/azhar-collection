import React, { useRef } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Printer, Download, ArrowLeft, Receipt } from "lucide-react";

export default function PrintPreview({ invoice }) {
    const iframeRef = useRef(null);
    const pdfUrl = `/dashboard/invoice/${invoice?.id}/print`;

    const handlePrint = () => {
        if (iframeRef.current) iframeRef.current.contentWindow.print();
    };

    if (!invoice) {
        return (
            <DashboardLayout>
                <Head title="Nota Tidak Ditemukan" />
                <div className="flex items-center justify-center h-64">
                    <p className="text-sm text-slate-500 font-medium">
                        Data nota/struk penjualan tidak ditemukan
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Head
                title={`#${invoice.invoice_number} - Preview Cetak Nota - Azhar Collection`}
            />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-130px)] min-h-[620px]">
                    {/* HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Tombol Kembali & Judul */}
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    title="Kembali ke Detail Invoice"
                                    onClick={() =>
                                        router.visit(
                                            `/dashboard/invoice/${invoice.id}`
                                        )
                                    }
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Receipt className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                            Preview Cetak Nota / Struk
                                        </h3>
                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold shadow-2xs">
                                            #{invoice.invoice_number}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {invoice.customer_name || "Pelanggan Umum"}{" "}
                                        &bull; Dokumen cetak fisik transaksi kasir dan tanda terima pelanggan.
                                    </p>
                                </div>
                            </div>

                            {/* Tombol Aksi Download & Cetak */}
                            <div className="flex items-center justify-end gap-2 shrink-0">
                                <a
                                    href={pdfUrl}
                                    download={`Struk-${invoice.invoice_number}.pdf`}
                                    className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-300 shadow-2xs transition-all cursor-pointer"
                                    title="Unduh PDF"
                                >
                                    <Download className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="mt-0.5">Unduh PDF</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-semibold rounded-lg border border-teal-200 shadow-2xs transition-all cursor-pointer"
                                    title="Cetak"
                                >
                                    <Printer className="w-3.5 h-3.5 text-teal-600" />
                                    <span className="mt-0.5">Cetak</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PDF VIEWER AREA */}
                    <div className="flex-1 w-full bg-slate-100/60 p-2 sm:p-3 overflow-hidden">
                        <div className="w-full h-full rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
                            <iframe
                                ref={iframeRef}
                                src={pdfUrl}
                                className="w-full h-full border-none block bg-white"
                                title="Pratinjau PDF Nota Penjualan"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}