import React from "react";
import { Link } from "@inertiajs/react";
import { Activity, ArrowUpRight, Scissors, Trophy, UserCheck } from "lucide-react";
import { formatRupiah } from "@/utils/format";

export default function ProductionPulseCard({ pulse }) {
    const spkPending = pulse?.spk_pending || 0;
    const spkInProgress = pulse?.spk_in_progress || 0;
    const spkCompleted = pulse?.spk_completed || 0;
    const spkTotal = pulse?.spk_total || 0;
    const topTailors = pulse?.top_tailors || [];

    return (
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                            Denyut Produksi & Produktivitas
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Status pengerjaan pesanan & produktivitas tim jahit
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/production-progress"
                    className="text-[11px] font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
                >
                    <span>Progress</span>
                    <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium text-slate-600">
                        <span>Distribusi Status SPK ({spkTotal} Total)</span>
                        <span className="text-slate-700 font-semibold">{pulse?.monthly_finished_qty || 0} pcs rampung</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-md p-2">
                            <span className="block text-[10px] font-semibold text-amber-800 uppercase tracking-wider">Menunggu</span>
                            <span className="font-bold text-base text-amber-900">{spkPending}</span>
                        </div>
                        <div className="bg-sky-50/70 border border-sky-200/80 rounded-md p-2">
                            <span className="block text-[10px] font-semibold text-sky-800 uppercase tracking-wider">Berjalan</span>
                            <span className="font-bold text-base text-sky-900">{spkInProgress}</span>
                        </div>
                        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-md p-2">
                            <span className="block text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">Selesai</span>
                            <span className="font-bold text-base text-emerald-900">{spkCompleted}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-1.5 text-slate-500 mb-2">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                            Top Penjahit Terproduktif Bulan Ini
                        </span>
                    </div>

                    {topTailors.length === 0 ? (
                        <div className="p-3 text-center bg-slate-50 rounded-md border border-slate-200/80">
                            <p className="text-xs text-slate-400 italic">Belum ada catatan log produksi bulan ini</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {topTailors.map((t, idx) => (
                                <div
                                    key={t.user_id || idx}
                                    className="flex items-center justify-between p-2 rounded-md bg-slate-50/70 hover:bg-slate-50 border border-slate-200/60 text-xs transition-colors"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                            idx === 0
                                                ? "bg-amber-100 text-amber-800"
                                                : idx === 1
                                                ? "bg-slate-200 text-slate-700"
                                                : idx === 2
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-slate-100 text-slate-500"
                                        }`}>
                                            {idx + 1}
                                        </span>
                                        <span className="font-medium text-slate-800 truncate">{t.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="font-bold text-slate-900">{t.qty} pcs</span>
                                        <span className="text-[11px] text-slate-500">{formatRupiah(t.wage_total)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        <span>Karyawan terdata dalam progress log</span>
                    </span>
                    <span className="font-bold text-slate-700">{topTailors.length} Penjahit</span>
                </div>
            </div>
        </div>
    );
}
