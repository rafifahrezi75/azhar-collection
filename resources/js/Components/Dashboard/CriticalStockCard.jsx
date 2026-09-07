import React from "react";
import { Link } from "@inertiajs/react";
import { AlertTriangle, ArrowUpRight, ShieldCheck, Package } from "lucide-react";

export default function CriticalStockCard({ items }) {
    const criticalList = items || [];
    const hasCritical = criticalList.length > 0;

    return (
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        hasCritical ? "bg-rose-50 text-rose-700" : "bg-teal-50 text-teal-700"
                    }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                            Bahan Baku & Stok Kritis
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Barang dengan stok di bawah batas minimum restock
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/barang"
                    className="text-[11px] font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
                >
                    <span>Stok</span>
                    <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {!hasCritical ? (
                    <div className="py-6 px-4 text-center bg-slate-50/70 border border-slate-200/80 rounded-md my-auto">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 border border-emerald-200">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">Semua Bahan Baku Aman</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                            Tidak ada bahan baku yang berada di bawah batas minimum pemesanan saat ini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {criticalList.map((item) => (
                            <div
                                key={item.id}
                                className="p-2.5 rounded-md border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-xs text-slate-900 truncate">
                                                {item.name}
                                            </span>
                                            {item.is_out_of_stock ? (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                                                    Habis
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                                    Kritis
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                            {item.code} • {item.category_name}
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <span className={`text-xs font-bold ${item.is_out_of_stock ? "text-rose-600" : "text-amber-700"}`}>
                                            {item.stock}
                                        </span>
                                        <span className="text-[10px] text-slate-400"> / min {item.min_stock} {item.unit_symbol}</span>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            item.is_out_of_stock ? "bg-rose-500" : "bg-amber-500"
                                        }`}
                                        style={{ width: `${Math.max(4, Math.min(100, item.health_ratio))}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-slate-400" />
                        <span>Kebutuhan Restock Cepat</span>
                    </span>
                    <span className="font-bold text-slate-700">{criticalList.length} Item</span>
                </div>
            </div>
        </div>
    );
}
