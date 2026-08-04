import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { AlertCircle, ArrowLeft, Home, FileQuestion, ShieldAlert } from "lucide-react";

export default function Error({ status = 404, message }) {
    const { auth } = usePage().props;
    const isAuthenticated = Boolean(auth?.user);

    const titleMap = {
        404: "Halaman Tidak Ditemukan",
        403: "Akses Ditolak",
        500: "Kesalahan Server",
        503: "Layanan Dalam Pemeliharaan",
    };

    const descMap = {
        404: "Maaf, rute atau halaman yang Anda tuju tidak ada, telah dihapus, atau alamat URL salah.",
        403: "Maaf, Anda tidak memiliki izin/hak akses untuk membuka halaman ini.",
        500: "Terjadi masalah internal pada server kami. Silakan coba beberapa saat lagi.",
        503: "Sistem sedang dalam proses pemeliharaan berkala. Silakan kembali nanti.",
    };

    const pageTitle = titleMap[status] || "Terjadi Kesalahan";
    const pageDescription = message || descMap[status] || "Terjadi kesalahan saat memuat halaman.";

    const content = (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-lg p-8 text-center shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
                {/* Decorative Ambient Circle */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Big Status Badge */}
                <div className="relative inline-flex items-center justify-center">
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                        {status === 403 ? (
                            <ShieldAlert className="w-12 h-12 text-rose-500 animate-pulse" />
                        ) : status === 404 ? (
                            <FileQuestion className="w-12 h-12 text-indigo-600 animate-bounce" />
                        ) : (
                            <AlertCircle className="w-12 h-12 text-amber-500" />
                        )}
                    </div>
                    <span className="absolute -bottom-2 px-3 py-1 bg-slate-900 text-white font-extrabold text-xs rounded-lg shadow-md font-mono">
                        {status}
                    </span>
                </div>

                {/* Text Description */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        {pageTitle}
                    </h1>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {pageDescription}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </button>

                    <Link
                        href={isAuthenticated ? "/dashboard" : "/login"}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-500/20"
                    >
                        <Home className="w-4 h-4" />
                        <span>{isAuthenticated ? "Ke Dashboard" : "Ke Halaman Login"}</span>
                    </Link>
                </div>
            </div>
        </div>
    );

    if (isAuthenticated) {
        return (
            <DashboardLayout>
                <Head title={`${status} - ${pageTitle}`} />
                {content}
            </DashboardLayout>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <Head title={`${status} - ${pageTitle}`} />
            {content}
        </div>
    );
}
