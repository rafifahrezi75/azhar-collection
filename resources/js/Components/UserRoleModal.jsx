import React, { memo } from "react";
import { X, Shield } from "lucide-react";

const UserRoleModal = memo(function UserRoleModal({
    isOpen,
    user,
    roles = [],
    selectedRoleIds = [],
    saving = false,
    onClose,
    onToggleRole,
    onSave,
}) {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-md max-w-md w-full p-5 sm:p-6 shadow-xl space-y-3.5 border border-slate-200 animate-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Shield className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                Atur Role Pengguna
                            </h3>
                            <p className="text-xs text-slate-500">
                                User: <span className="font-semibold text-slate-800">{user.name}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                <p className="text-xs text-slate-500">
                    Pilih satu atau beberapa role yang diberikan kepada pengguna ini.
                </p>

                {/* Role List */}
                <div className="space-y-2 py-1 max-h-60 overflow-y-auto pr-1">
                    {roles.map((role) => {
                        const isChecked = selectedRoleIds.includes(role.id);
                        return (
                            <label
                                key={role.id}
                                className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition-colors ${
                                    isChecked
                                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-900 font-semibold"
                                        : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/60"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => onToggleRole(role.id)}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                    />
                                    <div>
                                        <p className="text-xs font-semibold">{role.label}</p>
                                        <p className="text-[11px] font-mono text-slate-400">{role.name}</p>
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default UserRoleModal;
