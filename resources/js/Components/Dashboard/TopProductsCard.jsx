import React from "react";
import { Link } from "@inertiajs/react";
import { Flame, ArrowUpRight, Shirt, ShoppingBag } from "lucide-react";
import { formatRupiah } from "@/utils/format";

export default function TopProductsCard({ products }) {
    const list = products || [];

    return (
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <Flame className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                            5 Produk Terlaris
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Peringkat berdasarkan kuantitas pesanan terbanyak
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/produk"
                    className="text-[11px] font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
                >
                    <span>Katalog</span>
                    <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {list.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50/70 border border-slate-200/80 rounded-md my-auto">
                        <Shirt className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-400 italic">Belum ada data penjualan produk</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {list.map((p, idx) => (
                            <div key={p.product_id || idx} className="space-y-1">
                                <div className="flex items-center justify-between gap-2 text-xs">
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
                                        <div className="min-w-0">
                                            <span className="font-semibold text-slate-900 truncate block">
                                                {p.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="font-bold text-slate-900">{p.total_qty} pcs</span>
                                        <span className="text-[10px] text-slate-400 block">{formatRupiah(p.total_revenue)}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-teal-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.max(4, Math.min(100, p.percentage))}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-slate-400" />
                        <span>Kategori & variasi model terpopuler</span>
                    </span>
                    <span className="font-bold text-slate-700">{list.length} Produk</span>
                </div>
            </div>
        </div>
    );
}
