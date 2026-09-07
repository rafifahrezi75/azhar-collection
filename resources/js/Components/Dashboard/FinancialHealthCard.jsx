import React from "react";
import { Link } from "@inertiajs/react";
import { WalletCards, ArrowUpRight, ShoppingBag, Banknote, PiggyBank, ArrowDownRight, ArrowUpRight as ArrowUp, Info } from "lucide-react";
import { formatRupiah } from "@/utils/format";

export default function FinancialHealthCard({ data, periodLabel }) {
    const omset = data?.monthly_omset || 0;
    const cashIn = data?.monthly_cash_in || 0;
    const receivables = data?.monthly_receivables || 0;
    const purchases = data?.monthly_purchases || 0;
    const purchasesCount = data?.monthly_purchases_count || 0;
    const payroll = data?.monthly_payroll || 0;
    const totalExpenses = data?.total_expenses || purchases + payroll;
    const netCashflow = data?.net_cashflow !== undefined ? data.net_cashflow : cashIn - totalExpenses;
    const grossMargin = data?.estimated_gross_margin !== undefined ? data.estimated_gross_margin : omset - totalExpenses;
    const marginPct = data?.margin_percentage || 0;
    const materialRatio = data?.material_ratio || 0;
    const laborRatio = data?.labor_ratio || 0;
    const collectionRate = data?.collection_rate || 0;
    const countLunas = data?.count_lunas || 0;
    const countDp = data?.count_dp || 0;
    const countUnpaid = data?.count_unpaid || 0;

    const isSurplus = netCashflow >= 0;
    const isProfit = grossMargin >= 0;

    return (
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <WalletCards className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                            Kesehatan Finansial & Arus Kas
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Analisis arus kas riil, struktur beban & realisasi laba {periodLabel || "Bulan Ini"}
                        </p>
                    </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 flex items-center gap-1 ${
                    isSurplus
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                }`}>
                    {isSurplus ? <ArrowUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{isSurplus ? "Surplus Kas" : "Defisit Kas"}</span>
                </div>
            </div>

            <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="bg-slate-50/80 rounded-md border border-slate-200/80 p-3">
                    <div className="flex items-center justify-between text-[11px] mb-2 font-medium text-slate-600">
                        <span className="uppercase tracking-wider text-[10px] font-bold text-slate-500">
                            Posisi Arus Kas Bersih (Net Cash Flow)
                        </span>
                        <span className={`font-bold ${isSurplus ? "text-emerald-700" : "text-rose-600"}`}>
                            {isSurplus ? "+" : ""}{formatRupiah(netCashflow)}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pb-2.5 border-b border-slate-200/70">
                        <div className="bg-white rounded p-1.5 border border-slate-200/60">
                            <span className="block text-[10px] text-slate-400">Kas Masuk</span>
                            <span className="font-bold text-emerald-700">+{formatRupiah(cashIn)}</span>
                        </div>
                        <div className="bg-white rounded p-1.5 border border-slate-200/60">
                            <span className="block text-[10px] text-slate-400">Total Beban Keluar</span>
                            <span className="font-bold text-amber-700">-{formatRupiah(totalExpenses)}</span>
                        </div>
                        <div className={`rounded p-1.5 border ${
                            isSurplus ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50/70 border-rose-200"
                        }`}>
                            <span className="block text-[10px] text-slate-500">Saldo Kas Riil</span>
                            <span className={`font-bold ${isSurplus ? "text-emerald-700" : "text-rose-700"}`}>
                                {formatRupiah(netCashflow)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-1.5 text-[10px] text-slate-500 mt-2 leading-relaxed">
                        <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                            {isSurplus
                                ? "Arus kas operasional bulan ini positif. Kas masuk dari pelanggan melampaui seluruh beban kulaan bahan dan upah jahit."
                                : `Arus kas defisit sementara karena belanja stok bahan baku di muka (${formatRupiah(purchases)}). Saldo kas berbalik positif saat piutang pelanggan (${formatRupiah(receivables)}) dicairkan.`}
                        </span>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-600">
                        <span className="uppercase tracking-wider text-[10px] font-bold text-slate-500">
                            Struktur Beban Produksi vs Laba Operasional
                        </span>
                        <span className="text-[10px] text-slate-400">
                            Basis Omzet: {formatRupiah(omset)}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-md border border-slate-200 bg-white">
                            <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                                <ShoppingBag className="w-2.5 h-2.5 text-slate-400" />
                                <span className="text-[10px] uppercase tracking-wider font-semibold">Bahan Baku</span>
                            </div>
                            <div className="font-bold text-slate-900 truncate">
                                {formatRupiah(purchases)}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                                {materialRatio}% omzet ({purchasesCount} nota)
                            </div>
                        </div>

                        <div className="p-2.5 rounded-md border border-slate-200 bg-white">
                            <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                                <Banknote className="w-2.5 h-2.5 text-slate-400" />
                                <span className="text-[10px] uppercase tracking-wider font-semibold">Upah Jahit</span>
                            </div>
                            <div className="font-bold text-slate-900 truncate">
                                {formatRupiah(payroll)}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                                {laborRatio}% omzet (upah SPK)
                            </div>
                        </div>

                        <div className={`p-2.5 rounded-md border ${
                            isProfit ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                        }`}>
                            <div className="flex items-center gap-1 text-slate-600 mb-0.5">
                                <PiggyBank className="w-2.5 h-2.5 text-slate-400" />
                                <span className="text-[10px] uppercase tracking-wider font-semibold">Estimasi Laba</span>
                            </div>
                            <div className={`font-bold truncate ${isProfit ? "text-emerald-700" : "text-rose-700"}`}>
                                {formatRupiah(grossMargin)}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-0.5">
                                Margin: <span className="font-bold">{marginPct}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                        <span>Penagihan:</span>
                        <span className="font-bold text-emerald-700">{collectionRate}% Kas Masuk</span>
                        <span>•</span>
                        <span className="font-bold text-rose-600">{100 - collectionRate}% Piutang</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {countLunas} Lunas
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            {countDp} DP
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            {countUnpaid} Belum Bayar
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
