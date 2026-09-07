import React from "react";
import { Link } from "@inertiajs/react";
import { Clock, ArrowUpRight, Calendar, User, Scissors } from "lucide-react";

export default function ActiveDeadlinesCard({ assignments }) {
    const list = assignments || [];

    return (
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                            Antrean SPK & Deadline Terdekat
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Pesanan aktif yang memerlukan pemantauan target
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/production-progress"
                    className="text-[11px] font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
                >
                    <span>Semua SPK</span>
                    <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                {list.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50/70 border border-slate-200/80 rounded-md my-auto">
                        <Scissors className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-400 italic">Tidak ada antrean SPK aktif saat ini</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {list.map((a) => (
                            <div
                                key={a.id}
                                className="p-2.5 rounded-md border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-xs text-slate-900 truncate">
                                            {a.product_name}
                                        </span>
                                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border shrink-0 ${
                                            a.status === "in_progress"
                                                ? "bg-sky-50 text-sky-700 border-sky-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}>
                                            {a.status === "in_progress" ? "Berjalan" : "Menunggu"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                        <span className="truncate">{a.customer_name}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-0.5 text-slate-600 font-medium truncate">
                                            <User className="w-2.5 h-2.5 text-slate-400" />
                                            {a.tailor_name}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="font-bold text-xs text-slate-900">
                                        {a.qty} pcs
                                    </div>
                                    <div className="flex items-center justify-end gap-1 mt-0.5">
                                        <Calendar className="w-2.5 h-2.5 text-slate-400" />
                                        <span className={`text-[10px] ${
                                            a.is_overdue ? "text-rose-600 font-bold" : "text-slate-500"
                                        }`}>
                                            {a.target_date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Prioritas pengerjaan berdasarkan target terdekat</span>
                    <span className="font-bold text-slate-700">{list.length} SPK</span>
                </div>
            </div>
        </div>
    );
}
