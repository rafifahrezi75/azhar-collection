import React, { memo } from "react";
import { ShieldCheck, Shield, ChevronRight, Check } from "lucide-react";

const RoleCardList = memo(function RoleCardList({
    roles = [],
    selectedRoleId,
    onSelectRole,
}) {
    return (
        <div className="space-y-2">
            <div className="px-1 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Daftar Role Sistem
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                    {roles.length} Role
                </span>
            </div>
            <div className="space-y-1.5">
                {roles.map((role) => {
                    const isSelected = String(role.id) === String(selectedRoleId);
                    const permCount = role.permissions?.length || 0;

                    return (
                        <div
                            key={role.id}
                            onClick={() => onSelectRole(role.id)}
                            className={`p-3 rounded-md border transition-all cursor-pointer select-none flex items-center justify-between shadow-2xs ${
                                isSelected
                                    ? "bg-slate-900 text-white border-slate-800 ring-1 ring-emerald-500/30"
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                    className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                        isSelected
                                            ? "bg-emerald-600 text-white shadow-xs"
                                            : "bg-teal-50 text-teal-600"
                                    }`}
                                >
                                    {isSelected ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                </div>
                                <div className="truncate">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <h4 className="font-bold text-xs sm:text-sm leading-tight truncate">
                                            {role.label}
                                        </h4>
                                    </div>
                                    <p
                                        className={`text-[11px] mt-0.5 font-medium truncate ${
                                            isSelected ? "text-slate-300" : "text-slate-500"
                                        }`}
                                    >
                                        {permCount} Hak Akses Aktif
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                {isSelected ? (
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                    </div>
                                ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default RoleCardList;
