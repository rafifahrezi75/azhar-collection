import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MailCheck, LogOut, Send } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout subtitle="Verifikasi Alamat Email">
            <Head title="Verifikasi Email" />

            <div className="space-y-1 text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-2">
                    <MailCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Verifikasi Alamat Email
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Terima kasih telah mendaftar! Sebelum memulai, silakan verifikasi alamat email Anda dengan mengeklik tautan yang baru saja kami kirimkan ke email Anda.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl">
                    Tautan verifikasi baru telah berhasil dikirim ke alamat email yang Anda daftarkan.
                </div>
            )}

            <form onSubmit={submit} className="space-y-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                    <Send className="w-4 h-4" />
                    <span>{processing ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}</span>
                </button>

                <div className="text-center pt-2">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar (Logout)</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
