import React, { memo } from "react";
import { UserPlus, User, Save, X, Shield } from "lucide-react";

const UserModal = memo(function UserModal({
    isOpen,
    isEditing,
    form,
    roles = [],
    submitting,
    onClose,
    onChange,
    onToggleRole,
    onSubmit,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-xl p-4 sm:p-5 shadow-soft-xl border border-slate-100 animate-in zoom-in-95 duration-150 my-auto max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-32px)] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2.5">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
                        {isEditing ? (
                            <User className="w-4.5 h-4.5" />
                        ) : (
                            <UserPlus className="w-4.5 h-4.5" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                            {isEditing ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}
                        </h3>

                        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                            {isEditing
                                ? "Perbarui informasi profil atau ganti password akun pengguna."
                                : "Daftarkan akun staf, admin, atau penjahit baru untuk akses sistem."}
                        </p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-3.5 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Nama Lengkap <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                className="w-full min-w-0 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 placeholder-slate-400 font-medium shadow-soft-2xs"
                                placeholder="Contoh: Ahmad Faisal"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Alamat Email <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={onChange}
                                className="w-full min-w-0 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 placeholder-slate-400 font-medium shadow-soft-2xs font-mono"
                                placeholder="ahmad@azharcollection.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Kata Sandi / Password {isEditing ? <span className="text-slate-400 font-normal text-[11px] normal-case">(Opsional)</span> : <span className="text-rose-500">*</span>}
                            </label>
                            {isEditing && (
                                <span className="text-[10px] text-slate-400">
                                    Kosongkan jika tidak diganti
                                </span>
                            )}
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={form.password || ""}
                            onChange={onChange}
                            className="w-full min-w-0 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 placeholder-slate-400 font-medium shadow-soft-2xs"
                            placeholder={isEditing ? "Masukkan password baru jika ingin mengubah..." : "Minimal 6 karakter..."}
                            required={!isEditing}
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-teal-600" />
                            <span>Pilih Role Akses Sistem</span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                            {roles.map((role) => {
                                const isChecked = (form.role_ids || []).includes(role.id);
                                return (
                                    <label
                                        key={role.id}
                                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                            isChecked
                                                ? "bg-teal-50/70 border-teal-200 text-teal-900 font-semibold"
                                                : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/60"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => onToggleRole(role.id)}
                                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs truncate font-medium">{role.label || role.name}</p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            title="Kembali"
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            title={submitting ? "Memproses..." : isEditing ? "Simpan" : "Simpan"}
                            className="w-8 h-8 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-md border border-teal-700/20 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default UserModal;
