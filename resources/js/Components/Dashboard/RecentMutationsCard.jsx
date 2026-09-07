import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowDownUp, ArrowUpRight, History, PackageOpen } from "lucide-react";

export default function RecentMutationsCard({ mutations }) {
    const list = mutations || [];

    return (
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <ArrowDownUp className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                            Arus Mutasi Bahan Baku
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Catatan keluar masuk bahan kain & aksesoris terkini
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/barang"
                    className="text-[11px] font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
                >
                    <span>Gudang</span>
                    <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                {list.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50/70 border border-slate-200/80 rounded-md my-auto">
                        <PackageOpen className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-400 italic">Belum ada mutasi stok barang tercatat</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {list.map((m) => {
                            const isIn = m.type === "in";
                            return (
                                <div
                                    key={m.id}
                                    className="p-2.5 rounded-md border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${
                                                isIn
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                            }`}>
                                                {isIn ? "Masuk" : "Keluar"}
                                            </span>
                                            <span className="font-semibold text-xs text-slate-900 truncate">
                                                {m.item_name}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                            {m.item_code} • {m.user_name} • {m.date_formatted}
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <span className={`font-bold text-xs ${isIn ? "text-emerald-700" : "text-rose-600"}`}>
                                            {isIn ? "+" : "-"}{m.quantity} {m.unit_symbol}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                        <History className="w-3 h-3 text-slate-400" />
                        <span>Log pergerakan persediaan gudang</span>
                    </span>
                    <span className="font-bold text-slate-700">{list.length} Transaksi</span>
                </div>
            </div>
        </div>
    );
}
