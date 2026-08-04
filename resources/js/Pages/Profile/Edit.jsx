import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User as UserIcon } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <DashboardLayout>
            <Head title="Profile" />

            <div className="space-y-4">
                {/* Header Banner */}
                <div className="flex items-center gap-3 bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs">
                    <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">Edit Pengaturan Profile</h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Perbarui informasi akun, alamat email, dan kata sandi Anda.
                        </p>
                    </div>
                </div>

                {/* 2 Grid Columns Layout (Kiri: Informasi Profil, Kanan: Keamanan & Akun) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    {/* Grid Kiri: Informasional Profil */}
                    <div className="bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="w-full"
                        />
                    </div>

                    {/* Grid Kanan: Keamanan Akun (Update Password & Delete Akun) */}
                    <div className="bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs space-y-4">
                        <UpdatePasswordForm className="w-full" />
                        <div className="pt-2 border-t border-slate-100">
                            <DeleteUserForm className="w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
