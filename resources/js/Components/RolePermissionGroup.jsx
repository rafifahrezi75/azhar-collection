import React, { memo } from "react";

const RolePermissionGroup = memo(function RolePermissionGroup({
    groupName,
    groupPerms = [],
    selectedPermissions = [],
    canUpdate = false,
    onToggleGroup,
    onTogglePermission,
}) {
    const allSelected = groupPerms.length > 0 && groupPerms.every((p) => selectedPermissions.includes(p.id));

    return (
        <div className="bg-white border border-slate-200/80 rounded-md overflow-hidden shadow-2xs flex flex-col">
            <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                    {groupName}
                </h3>
                {canUpdate && (
                    <button
                        type="button"
                        onClick={() => onToggleGroup(groupPerms)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-bold transition-colors cursor-pointer"
                    >
                        {allSelected ? "Batal Semua" : "Pilih Semua"}
                    </button>
                )}
            </div>

            <div className="p-3 space-y-2 flex-1">
                {groupPerms.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id);
                    return (
                        <label
                            key={perm.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-md border transition-all cursor-pointer select-none ${
                                isChecked
                                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950 font-medium"
                                    : "bg-slate-50/30 border-slate-200/80 hover:bg-slate-50 text-slate-700"
                            } ${!canUpdate ? "cursor-not-allowed opacity-75" : ""}`}
                        >
                            <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={!canUpdate}
                                onChange={() => onTogglePermission(perm.id)}
                                className="mt-0.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <div>
                                <p className="text-xs font-bold leading-tight">
                                    {perm.label || perm.name}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                    {perm.name}
                                </p>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
});

export default RolePermissionGroup;
