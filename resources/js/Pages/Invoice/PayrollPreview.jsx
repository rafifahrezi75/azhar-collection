import React, { useRef } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Printer, Download, ArrowLeft, Wallet, User } from "lucide-react";

export default function PayrollPreview({ invoice, assignment, assignmentId: initialAssignmentId }) {
    const iframeRef = useRef(null);
    const assignments = (invoice?.items || []).flatMap((item) => item.production_assignments || []);

    const targetAssignmentId = initialAssignmentId
        ? String(initialAssignmentId)
        : assignment?.id
        ? String(assignment.id)
        : assignments.length > 0
        ? String(assignments[0].id)
        : "";

    const pdfUrl = targetAssignmentId
        ? `/dashboard/invoice/${invoice.id}/payroll-pdf?assignment_id=${targetAssignmentId}`
        : `/dashboard/invoice/${invoice.id}/payroll-pdf`;

    const handlePrint = () => {
        if (iframeRef.current) iframeRef.current.contentWindow.print();
    };

    const currentAssigneeName = assignment?.assignee?.name
        || assignments.find((a) => String(a.id) === String(targetAssignmentId))?.assignee?.name
        || "";

    return (
        <DashboardLayout>
            <Head title={`Preview Penggajian - ${invoice.invoice_number}`} />

            <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
                <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => {
                                const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
                                const returnTo = params?.get("return_to");
                                const returnParam = returnTo ? `?return_to=${encodeURIComponent(returnTo)}` : "";
                                router.visit(`/dashboard/invoice/${invoice.id}${returnParam}`);
                            }}
                            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Kembali"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100 shrink-0">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight truncate">
                                Preview Cetak Slip Penggajian Karyawan
                            </h3>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                {invoice.invoice_number} &bull; {invoice.customer_name} {currentAssigneeName ? `(${currentAssigneeName})` : ""}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {currentAssigneeName && (
                            <div className="inline-flex items-center gap-1.5 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 text-xs font-semibold text-slate-700">
                                <User className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span>{currentAssigneeName}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <a
                                href={pdfUrl}
                                download={`Slip-Gaji-${invoice.invoice_number}.pdf`}
                                className="h-9 px-3 inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                <span>PDF</span>
                            </a>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="h-9 px-3.5 inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full bg-white">
                    <iframe
                        ref={iframeRef}
                        src={pdfUrl}
                        className="w-full h-full border-none block bg-white"
                        title="PDF Preview Penggajian"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
