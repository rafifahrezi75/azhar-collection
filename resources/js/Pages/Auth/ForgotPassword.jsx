import React from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout subtitle="Pemulihan Akses Akun Portal">
            <Head title="Lupa Kata Sandi" />

            <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Lupa Kata Sandi?
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Masukkan alamat email Anda yang terdaftar, kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                </p>
            </div>

            {status && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Alamat Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
                            placeholder="nama@email.com"
                            required
                            autoFocus
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-600" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                    <Send className="w-4 h-4" />
                    <span>{processing ? "Mengirim..." : "Kirim Tautan Reset Password"}</span>
                </button>
            </form>

            <div className="text-center pt-3 border-t border-slate-100">
                <Link
                    href={route('login')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Halaman Login</span>
                </Link>
            </div>
        </GuestLayout>
    );
}
