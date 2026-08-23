import React, { memo, useMemo } from "react";
import { ChevronRight, Check } from "lucide-react";

const UserCardList = memo(function UserCardList({
    users = [],
    selectedUserId,
    onSelectUser,
    customOnly = true,
}) {
    const displayUsers = useMemo(() => {
        if (!customOnly) return users;
        return users.filter((u) => u.direct_permissions && u.direct_permissions.length > 0);
    }, [users, customOnly]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {customOnly ? "Pengguna Hak Akses Khusus" : "Daftar Pengguna"}
                </span>
                {customOnly && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {displayUsers.length} Khusus
                    </span>
                )}
            </div>

            {displayUsers.length > 0 ? (
                <div className="space-y-1.5">
                    {displayUsers.map((user) => {
                        const isSelected = String(user.id) === String(selectedUserId);
                        const directPermCount = user.direct_permissions?.length || 0;
                        const roleNames = user.roles?.map((r) => r.label || r.name).join(", ") || "Tanpa Role";

                        return (
                            <div
                                key={user.id}
                                onClick={() => onSelectUser(user.id)}
                                className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer select-none flex items-center justify-between shadow-soft-2xs ${
                                    isSelected
                                        ? "bg-slate-900 text-white border-slate-800 ring-1 ring-emerald-500/30"
                                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                            isSelected
                                                ? "bg-emerald-600 text-white shadow-soft-xs"
                                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                                        }`}
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="truncate">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <h4 className="font-bold text-xs sm:text-sm leading-tight truncate">
                                                {user.name}
                                            </h4>
                                        </div>
                                        <p
                                            className={`text-[11px] mt-0.5 font-medium truncate ${
                                                isSelected ? "text-slate-300" : "text-slate-500"
                                            }`}
                                        >
                                            {roleNames} &bull; <span className={isSelected ? "text-amber-300 font-semibold" : "text-amber-700 font-semibold"}>{directPermCount} Akses Khusus</span>
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
            ) : (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-center space-y-1 shadow-soft-2xs">
                    <p className="text-xs font-semibold text-slate-700">Belum Ada Pengguna Hak Akses Khusus</p>
                    <p className="text-[11px] text-slate-400">
                        Pilih pengguna di atas untuk menetapkan hak akses khusus.
                    </p>
                </div>
            )}
        </div>
    );
});

export default UserCardList;
