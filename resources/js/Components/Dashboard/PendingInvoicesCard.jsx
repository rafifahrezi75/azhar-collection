import React from "react";
import { Link } from "@inertiajs/react";
import { CreditCard, ArrowUpRight, CheckCircle2, FileText } from "lucide-react";
import { formatRupiah } from "@/utils/format";

export default function PendingInvoicesCard({ invoices }) {
    const list = invoices || [];

    return (
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                            Piutang Perlu Ditagih
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Daftar tagihan berjalan dengan sisa pembayaran terbesar
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/invoice"
                    className="text-[11px] font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
                >
                    <span>Semua Faktur</span>
                    <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                {list.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50/70 border border-slate-200/80 rounded-md my-auto">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
                        <h4 className="text-xs font-bold text-slate-800">Semua Tagihan Lunas</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Tidak ada piutang tertunggak saat ini</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {list.map((inv) => {
                            const isDp = inv.payment_status === "dp" || inv.payment_status === "partial";
                            return (
                                <Link
                                    key={inv.id}
                                    href={`/dashboard/invoice/${inv.id}`}
                                    className="p-2.5 rounded-md border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 group"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-xs text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                                                {inv.customer_name}
                                            </span>
                                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border shrink-0 ${
                                                isDp
                                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                            }`}>
                                                {isDp ? "DP" : "Belum Bayar"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                            <FileText className="w-2.5 h-2.5 text-slate-400" />
                                            <span>{inv.invoice_number}</span>
                                            <span>•</span>
                                            <span>{inv.order_date}</span>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="font-bold text-xs text-rose-600">
                                            {formatRupiah(inv.outstanding)}
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            Total: {formatRupiah(inv.total_amount)}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Fokus penagihan piutang belum terbayar</span>
                    <span className="font-bold text-slate-700">{list.length} Faktur</span>
                </div>
            </div>
        </div>
    );
}
