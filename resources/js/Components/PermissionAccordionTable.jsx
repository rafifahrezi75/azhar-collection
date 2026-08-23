import React, { memo, useRef, useEffect } from "react";
import { Shield, Lock, Unlock } from "lucide-react";

// Indeterminate Checkbox Component with native DOM .indeterminate property support
const IndeterminateCheckbox = memo(function IndeterminateCheckbox({
    checked,
    indeterminate,
    onChange,
    disabled,
    className = "",
}) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = Boolean(indeterminate);
        }
    }, [indeterminate]);

    return (
        <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className={`rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500/25 focus:ring-2 focus:ring-offset-1 w-4 h-4 cursor-pointer disabled:cursor-not-allowed ${className}`}
        />
    );
});

const PermissionAccordionTable = memo(function PermissionAccordionTable({
    groupedPermissions = {},
    selectedPermissions = [],
    canUpdate = false,
    onTogglePermission,
    onToggleGroup,
    targetTitle = "",
    targetBadge = null,
    isProtected = false,
    headerAction = null,
}) {
    // Helper to find permission by action type in group
    const getPermByAction = (groupPerms, actionType) => {
        return groupPerms.find((p) => {
            const name = p.name.toLowerCase();
            if (actionType === "view") return name.endsWith(".view");
            if (actionType === "create") return name.endsWith(".create");
            if (actionType === "update") return name.endsWith(".update");
            if (actionType === "delete") return name.endsWith(".delete");
            return false;
        });
    };

    return (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-soft-sm">
            {/* Control Header Bar */}
            <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
                        <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-tight">
                            Matriks Hak Akses Modul
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Centang kolom aksi untuk mengatur hak akses setiap modul.
                        </p>
                    </div>
                </div>

                {/* Target Context Info (non-button indicator) */}
                <div className="flex items-center gap-2 flex-wrap">
                    {targetTitle && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-soft-2xs">
                            <span className="text-[11px] text-slate-400 font-medium">Target:</span>
                            <span className="font-bold text-slate-900">{targetTitle}</span>
                            {targetBadge}
                        </div>
                    )}

                    {isProtected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Lock className="w-2.5 h-2.5 text-slate-500" />
                            Modul Terproteksi
                        </span>
                    )}

                    {headerAction}
                </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                            <th className="px-4 py-2.5 w-64">Nama Modul / Menu</th>
                            <th className="px-3 py-2.5 text-center w-20">Lihat</th>
                            <th className="px-3 py-2.5 text-center w-20">Buat</th>
                            <th className="px-3 py-2.5 text-center w-20">Ubah</th>
                            <th className="px-3 py-2.5 text-center w-20">Hapus</th>
                            <th className="px-4 py-2.5 text-right w-36">Status Akses</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {Object.entries(groupedPermissions).map(([groupName, groupPerms]) => {
                            const activeCount = groupPerms.filter((p) => selectedPermissions.includes(p.id)).length;
                            const isAllSelected = groupPerms.length > 0 && activeCount === groupPerms.length;
                            const isIndeterminate = activeCount > 0 && !isAllSelected;

                            const viewPerm = getPermByAction(groupPerms, "view");
                            const createPerm = getPermByAction(groupPerms, "create");
                            const updatePerm = getPermByAction(groupPerms, "update");
                            const deletePerm = getPermByAction(groupPerms, "delete");

                            // Check if this module group is 'Hak Akses' (strictly protected for admin only)
                            const isHakAksesGroup = groupName.toLowerCase().includes("hak akses");
                            const isRowDisabled = !canUpdate || isHakAksesGroup;

                            return (
                                <tr key={groupName} className={`transition-colors select-none ${isHakAksesGroup ? "bg-amber-50/30" : "hover:bg-slate-50/70"}`}>
                                    {/* Modul Name + Select All Indeterminate Checkbox */}
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <IndeterminateCheckbox
                                                checked={isAllSelected}
                                                indeterminate={isIndeterminate}
                                                disabled={isRowDisabled}
                                                onChange={() => onToggleGroup(groupPerms)}
                                            />
                                            <span className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                                                {groupName}
                                                {isHakAksesGroup && (
                                                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200">
                                                        Khusus Admin
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Action Column 1: Lihat */}
                                    <td className="px-3 py-2.5 text-center">
                                        {viewPerm ? (
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(viewPerm.id)}
                                                disabled={isRowDisabled}
                                                onChange={() => onTogglePermission(viewPerm.id)}
                                                className="rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500/25 focus:ring-2 focus:ring-offset-1 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                        ) : (
                                            <span className="text-slate-300 font-mono text-xs">-</span>
                                        )}
                                    </td>

                                    {/* Action Column 2: Buat */}
                                    <td className="px-3 py-2.5 text-center">
                                        {createPerm ? (
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(createPerm.id)}
                                                disabled={isRowDisabled}
                                                onChange={() => onTogglePermission(createPerm.id)}
                                                className="rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500/25 focus:ring-2 focus:ring-offset-1 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                        ) : (
                                            <span className="text-slate-300 font-mono text-xs">-</span>
                                        )}
                                    </td>

                                    {/* Action Column 3: Ubah */}
                                    <td className="px-3 py-2.5 text-center">
                                        {updatePerm ? (
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(updatePerm.id)}
                                                disabled={isRowDisabled}
                                                onChange={() => onTogglePermission(updatePerm.id)}
                                                className="rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500/25 focus:ring-2 focus:ring-offset-1 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                        ) : (
                                            <span className="text-slate-300 font-mono text-xs">-</span>
                                        )}
                                    </td>

                                    {/* Action Column 4: Hapus */}
                                    <td className="px-3 py-2.5 text-center">
                                        {deletePerm ? (
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(deletePerm.id)}
                                                disabled={isRowDisabled}
                                                onChange={() => onTogglePermission(deletePerm.id)}
                                                className="rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500/25 focus:ring-2 focus:ring-offset-1 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                        ) : (
                                            <span className="text-slate-300 font-mono text-xs">-</span>
                                        )}
                                    </td>

                                    {/* Status Column */}
                                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                        {activeCount === 0 ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                                <Lock className="w-2.5 h-2.5" />
                                                Terkunci
                                            </span>
                                        ) : isAllSelected ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <Unlock className="w-2.5 h-2.5" />
                                                Akses Penuh
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                                                <Shield className="w-2.5 h-2.5" />
                                                {activeCount} Akses
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default PermissionAccordionTable;
