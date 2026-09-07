import React, { memo } from "react";
import { X, Shield, Save } from "lucide-react";

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
        <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-lg p-4 sm:p-5 shadow-soft-xl border border-slate-100 animate-in zoom-in-95 duration-150 my-auto max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-32px)] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2.5">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
                        <Shield className="w-4.5 h-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                            Atur Role Pengguna
                        </h3>

                        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed truncate">
                            Pengguna: <span className="font-semibold text-slate-800">{user.name}</span> ({user.email})
                        </p>
                    </div>
                </div>

                <div className="space-y-3 pt-3">
                    <p className="text-xs text-slate-500">
                        Pilih satu atau beberapa role yang diberikan kepada pengguna ini:
                    </p>

                    {/* Role List */}
                    <div className="space-y-2 py-1 max-h-60 overflow-y-auto pr-1">
                        {roles.map((role) => {
                            const isChecked = selectedRoleIds.includes(role.id);
                            return (
                                <label
                                    key={role.id}
                                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                        isChecked
                                            ? "bg-teal-50/70 border-teal-200 text-teal-900 font-semibold"
                                            : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/60"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => onToggleRole(role.id)}
                                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                                        />
                                        <div>
                                            <p className="text-xs font-semibold">{role.label || role.name}</p>
                                            <p className="text-[11px] font-mono text-slate-400">{role.name}</p>
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
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
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            title={saving ? "Memproses..." : "Simpan"}
                            className="w-8 h-8 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-md border border-teal-700/20 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default UserRoleModal;
