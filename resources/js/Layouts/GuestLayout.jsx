import React from 'react';
import { Link } from '@inertiajs/react';
import { Activity } from 'lucide-react';

export default function GuestLayout({
    children,
    title = 'Azhar Collection',
    subtitle = 'Sistem Manajemen Produksi Konveksi',
}) {
    return (
        <div className="min-h-screen min-h-[100dvh] relative flex items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-teal-500 selection:text-white">
            {/* Background Photography with Sophisticated Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
                style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
            >
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/40" />
            </div>

            {/* Auth Container Card */}
            <div className="w-full max-w-md relative z-10 my-auto">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center justify-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-600/35 group-hover:scale-105 transition-transform duration-300">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight mt-3">
                        {title}
                    </h1>
                    <p className="text-xs text-slate-300/80 mt-1 font-medium">
                        {subtitle}
                    </p>
                </div>

                {/* Card Container */}
                <div className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-5 text-slate-800">
                    {children}
                </div>

                {/* Footer Copyright */}
                <div className="text-center mt-6">
                    <p className="text-[11px] text-slate-400 font-medium">
                        &copy; {new Date().getFullYear()} Azhar Collection. Hak Cipta Dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}
