import React from "react";
import {
    Award,
    Package,
    CheckCircle2,
    Clock,
    Truck,
    Scissors,
    Activity,
    CreditCard,
    Sparkles,
    Building,
    Phone,
    MapPin,
    Crown,
} from "lucide-react";

const formatShortRp = (num) => {
    if (!num || num === 0) return "Rp 0";
    if (num >= 1000000000) return `Rp ${(num / 1000000000).toFixed(2)} M`;
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)} Jt`;
    if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)} Rb`;
    return `Rp ${num}`;
};

export default function TopProductsCard({
    topProducts = [],
    productionStatuses = [],
    paymentBreakdown = {},
    topCustomers = [],
    isAllCustomers = true,
    selectedCustomerInfo = null,
}) {
    const totalProdCount = productionStatuses.reduce((acc, curr) => acc + (curr.count || 0), 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* ========================================================= */}
            {/* 1. TOP 5 PRODUK TERLARIS                                 */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                                style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#d97706" }}
                            >
                                <Award className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    Top 5 Produk Terlaris
                                </h3>
                                <p className="text-[11px] text-slate-400">Berdasarkan volume pcs seragam</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                            <Crown className="w-3 h-3 text-amber-600" />
                            Best Seller
                        </span>
                    </div>

                    <div className="mt-4 space-y-3.5">
                        {topProducts.length === 0 ? (
                            <div className="py-10 text-center text-xs text-slate-400 font-medium">
                                Belum ada data transaksi produk pada periode ini.
                            </div>
                        ) : (
                            topProducts.map((p, idx) => (
                                <div key={p.product_id || p.name || idx} className="group space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2.5 max-w-[68%]">
                                            <span
                                                style={{
                                                    background:
                                                        idx === 0
                                                            ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                                            : idx === 1
                                                            ? "linear-gradient(135deg, #94a3b8, #64748b)"
                                                            : idx === 2
                                                            ? "linear-gradient(135deg, #b45309, #78350f)"
                                                            : "#f1f5f9",
                                                    color: idx < 3 ? "#ffffff" : "#475569",
                                                }}
                                                className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm"
                                            >
                                                {idx + 1}
                                            </span>
                                            <div className="truncate">
                                                <span className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors block truncate">
                                                    {p.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block truncate font-mono">
                                                    {p.category_name} {p.code && p.code !== '-' ? `• ${p.code}` : ""}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="font-extrabold font-mono text-slate-900 block text-xs">
                                                {p.total_qty.toLocaleString("id-ID")}{" "}
                                                <span className="font-sans font-semibold text-[10px] text-slate-500">
                                                    Pcs
                                                </span>
                                            </span>
                                            <span className="text-[10px] font-mono text-teal-700 font-bold block">
                                                {formatShortRp(p.total_revenue)}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Animated Progress Bar */}
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                background: "linear-gradient(to right, #0d9488, #14b8a6, #10b981)",
                                                backgroundColor: "#0d9488",
                                                width: `${Math.min(100, Math.max(10, p.revenue_percentage || (idx === 0 ? 100 : 50)))}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. STATUS PRODUKSI KONVEKSI                              */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                                style={{ backgroundColor: "rgba(13, 148, 136, 0.15)", color: "#0f766e" }}
                            >
                                <Scissors className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    Alur Produksi Konveksi
                                </h3>
                                <p className="text-[11px] text-slate-400">Distribusi tahap pengerjaan pesanan</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-extrabold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200">
                            {totalProdCount} Order
                        </span>
                    </div>

                    <div className="mt-4 space-y-3">
                        {productionStatuses.map((st) => {
                            const pct = totalProdCount > 0 ? Math.round((st.count / totalProdCount) * 100) : 0;
                            return (
                                <div key={st.key} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                                                style={{ backgroundColor: st.color }}
                                            />
                                            <span className="text-slate-700 font-semibold text-xs">
                                                {st.label}
                                            </span>
                                        </div>
                                        <span className="font-mono font-extrabold text-slate-900 text-xs">
                                            {st.count}{" "}
                                            <span className="text-[10px] font-semibold text-slate-400 font-sans">
                                                ({pct}%)
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                backgroundColor: st.color,
                                                width: `${Math.max(st.count > 0 ? 6 : 0, pct)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 3. TOP PELANGGAN ATAU DETAIL PROFIL                      */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                                style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#047857" }}
                            >
                                <CreditCard className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    {isAllCustomers ? "Top Pelanggan Terbesar" : "Profil Pelanggan"}
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    {isAllCustomers ? "Kontribusi omzet pelanggan tertinggi" : "Informasi kontak pelanggan"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mt-4">
                        {isAllCustomers ? (
                            <div className="space-y-2.5">
                                {topCustomers.length === 0 ? (
                                    <div className="py-10 text-center text-xs text-slate-400 font-medium">
                                        Belum ada data pelanggan pada periode ini.
                                    </div>
                                ) : (
                                    topCustomers.map((c, idx) => (
                                        <div
                                            key={c.customer_id || idx}
                                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-300 hover:bg-teal-50/50 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="truncate max-w-[65%]">
                                                    <span className="font-extrabold text-slate-900 group-hover:text-teal-800 transition-colors block truncate">
                                                        {c.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                                                        {c.institution_name || "Pelanggan Umum"}
                                                    </span>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="font-extrabold font-mono text-teal-700 block text-xs">
                                                        {formatShortRp(c.total_revenue)}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-500 block font-medium">
                                                        {c.invoices_count} Inv • {c.total_qty.toLocaleString("id-ID")} Pcs
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {selectedCustomerInfo && (
                                    <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200 space-y-2.5 text-xs shadow-sm">
                                        <div className="font-black text-teal-950 text-base">
                                            {selectedCustomerInfo.name}
                                        </div>
                                        {selectedCustomerInfo.institution_name && (
                                            <div className="text-teal-800 font-bold flex items-center gap-1.5">
                                                <Building className="w-3.5 h-3.5 text-teal-600" />
                                                <span>{selectedCustomerInfo.institution_name}</span>
                                            </div>
                                        )}
                                        {selectedCustomerInfo.phone && (
                                            <div className="text-slate-700 font-mono text-xs flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{selectedCustomerInfo.phone}</span>
                                            </div>
                                        )}
                                        {selectedCustomerInfo.address && (
                                            <div className="text-slate-600 text-xs leading-relaxed flex items-start gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                                <span>{selectedCustomerInfo.address}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
