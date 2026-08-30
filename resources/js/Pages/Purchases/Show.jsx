import React from "react";
import { Head, Link } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import { ArrowLeft, Printer, CheckCircle, Calendar, User, Package } from "lucide-react";
import { formatRupiah, formatDate } from "@/utils/format";

const resolveUnitMeta = (row) => {
    const chosen = row.unit;
    const item = row.item;
    const baseUnit = item?.unit;
    const isBase = String(row.unit_id) === String(item?.unit_id);
    const conversion = (item?.conversions || []).find(
        (c) => String(c.unit_id) === String(row.unit_id)
    );
    const multiplier = isBase ? 1 : (parseInt(conversion?.multiplier, 10) || 1);
    const name = chosen?.name || conversion?.unit?.name || baseUnit?.name || "-";
    const symbol = chosen?.symbol || conversion?.unit?.symbol || baseUnit?.symbol || "";
    const baseSymbol = baseUnit?.symbol || baseUnit?.name || "pcs";

    return { name, symbol, multiplier, baseSymbol, equivalentQty: Number(row.quantity || 0) * multiplier };
};

export default function Show({ purchase }) {
    return (
        <DashboardLayout>
            <Head title={`Detail Pembelian - ${purchase.reference_no}`} />

            <div className="w-full space-y-4">
                <PageHeaderBar
                    title="Detail Pembelian"
                    extraActions={
                        <div className="flex items-center gap-1.5">
                            <Link
                                href={route("purchases.index")}
                                className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs"
                                title="Kembali ke daftar"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <a
                                href={route("purchases.pdf", purchase.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
                                title="Cetak Nota PDF"
                            >
                                <Printer className="w-4 h-4" />
                                Cetak PDF
                            </a>
                        </div>
                    }
                    canCreate={false}
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-3.5">
                        <p className="text-[11px] font-medium text-slate-500 mb-0.5">No. Referensi</p>
                        <p className="font-bold text-slate-800 text-sm font-mono">{purchase.reference_no}</p>
                    </div>
                    <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-3.5">
                        <p className="text-[11px] font-medium text-slate-500 mb-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Tanggal
                        </p>
                        <p className="font-semibold text-slate-700 text-sm">{formatDate(purchase.date)}</p>
                    </div>
                    <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-3.5">
                        <p className="text-[11px] font-medium text-slate-500 mb-0.5 flex items-center gap-1">
                            <Package className="w-3 h-3" /> Supplier
                        </p>
                        <p className="font-semibold text-slate-700 text-sm">{purchase.supplier_name || <span className="text-slate-400">-</span>}</p>
                    </div>
                    <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-3.5">
                        <p className="text-[11px] font-medium text-slate-500 mb-0.5 flex items-center gap-1">
                            <User className="w-3 h-3" /> Dibuat Oleh
                        </p>
                        <p className="font-semibold text-slate-700 text-sm">{purchase.creator?.name || "-"}</p>
                    </div>
                </div>

                <div className="bg-white rounded-md shadow-2xs border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rincian Barang</h2>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Stok Bertambah
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="px-3.5 py-2.5 w-10 text-center">#</th>
                                    <th className="px-3.5 py-2.5">Nama Barang</th>
                                    <th className="px-3.5 py-2.5">Kode</th>
                                    <th className="px-3.5 py-2.5 text-right">Kuantitas</th>
                                    <th className="px-3.5 py-2.5">Satuan</th>
                                    <th className="px-3.5 py-2.5 text-right">Setara Satuan Dasar</th>
                                    <th className="px-3.5 py-2.5 text-right">Harga Satuan</th>
                                    <th className="px-3.5 py-2.5 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {purchase.items.map((item, idx) => {
                                    const unit = resolveUnitMeta(item);
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-3.5 py-2.5 text-center text-slate-400">{idx + 1}</td>
                                            <td className="px-3.5 py-2.5 font-semibold text-slate-800">{item.item?.name}</td>
                                            <td className="px-3.5 py-2.5 text-slate-500 font-mono text-xs">{item.item?.code}</td>
                                            <td className="px-3.5 py-2.5 text-right font-medium text-slate-700">{item.quantity}</td>
                                            <td className="px-3.5 py-2.5 text-slate-600">
                                                {unit.name}
                                                {unit.symbol && (
                                                    <span className="ml-1 text-slate-400">({unit.symbol})</span>
                                                )}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right text-teal-700 font-medium">
                                                {unit.equivalentQty} {unit.baseSymbol}
                                                {unit.multiplier > 1 && (
                                                    <span className="block text-[10px] text-slate-400 font-normal">
                                                        1 {unit.symbol || unit.name} = {unit.multiplier} {unit.baseSymbol}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right text-slate-600">{formatRupiah(item.unit_price)}</td>
                                            <td className="px-3.5 py-2.5 text-right font-semibold text-slate-800">{formatRupiah(item.subtotal)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-slate-200 bg-slate-50">
                                    <td colSpan="7" className="px-3.5 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Total Pembelian:
                                    </td>
                                    <td className="px-3.5 py-3.5 text-right font-bold text-teal-600 text-sm">
                                        {formatRupiah(purchase.total_amount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {purchase.notes && (
                    <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-4">
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Catatan</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{purchase.notes}</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
