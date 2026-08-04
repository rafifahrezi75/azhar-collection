import React from 'react';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
            {/* Decorative Gradients */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/25 mb-4 text-white font-bold text-2xl tracking-wider">
                        AC
                    </div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                        Buat Akun Baru
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Daftar pengguna baru Azhar Collection (Otomatis Role: User)
                    </p>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Nama Lengkap
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                placeholder="Ahmad Azhar"
                                required
                                autoFocus
                            />
                            <InputError message={errors.name} className="mt-1.5 text-xs text-rose-400" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                placeholder="ahmad@example.com"
                                required
                            />
                            <InputError message={errors.email} className="mt-1.5 text-xs text-rose-400" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <InputError message={errors.password} className="mt-1.5 text-xs text-rose-400" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Konfirmasi Password
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-1.5 text-xs text-rose-400" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-2"
                        >
                            {processing ? "Mendaftarkan..." : "Daftar Akun Baru"}
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-slate-800/80">
                        <p className="text-xs text-slate-400">
                            Sudah memiliki akun?{" "}
                            <Link
                                href={route('login')}
                                className="font-semibold text-indigo-400 hover:text-indigo-300 underline transition-colors"
                            >
                                Masuk ke Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
