import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import RoleCardList from "@/Components/RoleCardList";
import UserCardList from "@/Components/UserCardList";
import UserSelectAutocomplete from "@/Components/UserSelectAutocomplete";
import PermissionAccordionTable from "@/Components/PermissionAccordionTable";
import Tooltip from "@/Components/Tooltip";
import { hasPermission } from "@/utils/permissions";
import { Toast } from "@/utils/sweetalert";
import { Save, Users, Shield, RotateCcw } from "lucide-react";

export default function Index() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    // Mode tab: 'role' (per Role) or 'user' (per User)
    const [mode, setMode] = useState("role");

    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [permissionItems, setPermissionItems] = useState([]);

    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");

    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const hasUpdatePermission = useMemo(() => hasPermission(permissions, "hak_akses.update"), [permissions]);

    const loadData = useCallback(() => {
        setLoading(true);
        axios
            .get("/api/hak-akses")
            .then((response) => {
                setRoles(response.data.roles || []);
                setUsers(response.data.users || []);
                setPermissionItems(response.data.permissions || []);

                if (response.data.roles?.length > 0 && !selectedRoleId) {
                    setSelectedRoleId(String(response.data.roles[0].id));
                }
                if (response.data.users?.length > 0 && !selectedUserId) {
                    setSelectedUserId(String(response.data.users[0].id));
                }
                setLoading(false);
            })
            .catch((err) => {
                Toast.error(err.response?.data?.message || "Gagal memuat data hak akses.");
                setLoading(false);
            });
    }, [selectedRoleId, selectedUserId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSelectRole = useCallback((id) => {
        setSelectedRoleId(String(id));
    }, []);

    const handleSelectUser = useCallback((id) => {
        setSelectedUserId(String(id));
    }, []);

    const selectedRole = useMemo(() => {
        return roles.find((role) => String(role.id) === String(selectedRoleId));
    }, [roles, selectedRoleId]);

    const selectedUser = useMemo(() => {
        return users.find((user) => String(user.id) === String(selectedUserId));
    }, [users, selectedUserId]);

    const hasUserCustomPermissions = useMemo(() => {
        return Boolean(selectedUser?.direct_permissions && selectedUser.direct_permissions.length > 0);
    }, [selectedUser]);

    // Check if the currently selected item is Admin
    const isAdminRoleSelected = useMemo(() => {
        return mode === "role" && selectedRole?.name === "admin";
    }, [mode, selectedRole]);

    // Determine if updating is allowed for current selection
    const canUpdate = useMemo(() => {
        return hasUpdatePermission;
    }, [hasUpdatePermission]);

    // Update selectedPermissions array based on mode (Role vs User)
    useEffect(() => {
        if (mode === "role" && selectedRole) {
            setSelectedPermissions(selectedRole.permissions?.map((p) => p.id) || []);
        } else if (mode === "user" && selectedUser) {
            const hasCustom = selectedUser.direct_permissions && selectedUser.direct_permissions.length > 0;
            if (hasCustom) {
                setSelectedPermissions(selectedUser.direct_permissions.map((p) => p.id));
            } else {
                // If user has no custom permissions, show active role permissions as starting baseline
                const rolePermIds = selectedUser.roles?.flatMap((r) => r.permissions || []).map((p) => p.id) || [];
                setSelectedPermissions(Array.from(new Set(rolePermIds)));
            }
        }
    }, [mode, selectedRole, selectedUser]);

    const groupedPermissions = useMemo(() => {
        return permissionItems.reduce((groups, permission) => {
            const groupName = permission.group_name || "Lainnya";
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(permission);
            return groups;
        }, {});
    }, [permissionItems]);

    const togglePermission = useCallback((id) => {
        if (!canUpdate) return;
        setSelectedPermissions((current) => {
            if (current.includes(id)) {
                return current.filter((item) => item !== id);
            }
            return [...current, id];
        });
    }, [canUpdate]);

    const toggleGroup = useCallback((groupPerms) => {
        if (!canUpdate) return;
        const groupIds = groupPerms.map((p) => p.id);
        setSelectedPermissions((current) => {
            const allSelected = groupIds.every((id) => current.includes(id));
            if (allSelected) {
                return current.filter((id) => !groupIds.includes(id));
            }
            return Array.from(new Set([...current, ...groupIds]));
        });
    }, [canUpdate]);

    const handleSave = useCallback(async () => {
        if (!canUpdate) return;
        setSaving(true);

        try {
            if (mode === "role" && selectedRoleId) {
                const res = await axios.put(`/api/hak-akses/${selectedRoleId}`, {
                    permission_ids: selectedPermissions,
                });
                Toast.success(res.data.message || "Hak akses role berhasil diperbarui.");
            } else if (mode === "user" && selectedUserId) {
                const res = await axios.put(`/api/hak-akses/user/${selectedUserId}`, {
                    permission_ids: selectedPermissions,
                });
                Toast.success(res.data.message || "Hak akses khusus pengguna berhasil diperbarui.");
            }

            router.reload();
            loadData();
        } catch (err) {
            Toast.error(err.response?.data?.message || "Gagal memperbarui hak akses.");
        } finally {
            setSaving(false);
        }
    }, [mode, selectedRoleId, selectedUserId, canUpdate, selectedPermissions, loadData]);

    const handleResetUser = useCallback(async () => {
        if (!canUpdate || !selectedUserId) return;
        setSaving(true);

        try {
            const res = await axios.put(`/api/hak-akses/user/${selectedUserId}`, {
                reset: true,
            });
            Toast.success(res.data.message || "Hak akses khusus pengguna dihapus. Kembali menggunakan aturan Role.");
            router.reload();
            loadData();
        } catch (err) {
            Toast.error(err.response?.data?.message || "Gagal mereset hak akses pengguna.");
        } finally {
            setSaving(false);
        }
    }, [canUpdate, selectedUserId, loadData]);

    return (
        <DashboardLayout>
            <Head title="Hak Akses" />
            {loading ? (
                <div className="p-8 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        <span>Memuat data Hak Akses...</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-3.5">
                    {/* Header Bar */}
                    <PageHeaderBar
                        onRefresh={loadData}
                        refreshing={loading}
                        canCreate={false}
                        extraActions={
                            <div className="flex items-center gap-1.5">
                                {/* Save Button placed right next to Refresh */}
                                {canUpdate && (
                                    <Tooltip
                                        content={mode === "role" ? "Simpan hak akses role yang dipilih" : "Simpan hak akses pengguna"}
                                        position="bottom"
                                    >
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-md text-xs transition-colors shadow-2xs cursor-pointer"
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                            <span>{saving ? "Menyimpan..." : "Simpan"}</span>
                                        </button>
                                    </Tooltip>
                                )}

                                {/* Mode Switcher (Per Role vs Per User) */}
                                <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-300 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setMode("role")}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                            mode === "role"
                                                ? "bg-slate-900 text-white shadow-xs"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        <Shield className="w-3.5 h-3.5" />
                                        <span>Per Role</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode("user")}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                            mode === "user"
                                                ? "bg-slate-900 text-white shadow-xs"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                        <span>Per User</span>
                                    </button>
                                </div>
                            </div>
                        }
                    />

                    {/* Split Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                        {/* Left Column: Role Cards OR User Autocomplete Select + User List */}
                        <div className="lg:col-span-4 space-y-3">
                            {mode === "role" ? (
                                <RoleCardList
                                    roles={roles}
                                    selectedRoleId={selectedRoleId}
                                    onSelectRole={handleSelectRole}
                                />
                            ) : (
                                <div className="space-y-3">
                                    <UserSelectAutocomplete
                                        users={users}
                                        selectedUserId={selectedUserId}
                                        onSelectUser={handleSelectUser}
                                    />
                                    <UserCardList
                                        users={users}
                                        selectedUserId={selectedUserId}
                                        onSelectUser={handleSelectUser}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right Column: Permission Matrix Table */}
                        <div className="lg:col-span-8">
                            <PermissionAccordionTable
                                groupedPermissions={groupedPermissions}
                                selectedPermissions={selectedPermissions}
                                canUpdate={canUpdate}
                                onTogglePermission={togglePermission}
                                onToggleGroup={toggleGroup}
                                targetTitle={
                                    mode === "role"
                                        ? selectedRole?.label || "Pilih Role"
                                        : selectedUser?.name || "Pilih Pengguna"
                                }
                                targetBadge={
                                    mode === "user" && hasUserCustomPermissions ? (
                                        <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                            Khusus
                                        </span>
                                    ) : null
                                }
                                isProtected={isAdminRoleSelected}
                                headerAction={
                                    mode === "user" && hasUserCustomPermissions && canUpdate ? (
                                        <Tooltip content="Hapus hak akses khusus & kembali ke aturan Role" position="bottom">
                                            <button
                                                type="button"
                                                onClick={handleResetUser}
                                                disabled={saving}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-md text-xs transition-colors border border-slate-300 cursor-pointer shadow-2xs"
                                            >
                                                <RotateCcw className="w-3 h-3 text-slate-500" />
                                                <span>Reset ke Role</span>
                                            </button>
                                        </Tooltip>
                                    ) : null
                                }
                            />
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
