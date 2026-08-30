import React, {
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";
import {
    Head,
    router,
    usePage,
} from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import RoleCardList from "@/Components/RoleCardList";
import UserCardList from "@/Components/UserCardList";
import UserSelectAutocomplete from "@/Components/UserSelectAutocomplete";
import PermissionAccordionTable from "@/Components/PermissionAccordionTable";
import { hasPermission } from "@/utils/permissions";
import { Toast } from "@/utils/sweetalert";
import {
    Save,
    Users,
    Shield,
    RotateCcw,
} from "lucide-react";

export default function Index() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const [mode, setMode] = useState("role");

    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [
        permissionItems,
        setPermissionItems,
    ] = useState([]);

    const [
        selectedRoleId,
        setSelectedRoleId,
    ] = useState("");

    const [
        selectedUserId,
        setSelectedUserId,
    ] = useState("");

    const [
        selectedPermissions,
        setSelectedPermissions,
    ] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const hasUpdatePermission = useMemo(
        () =>
            hasPermission(
                permissions,
                "hak_akses.update",
            ),
        [permissions],
    );

    const loadData = useCallback(() => {
        setLoading(true);

        axios
            .get("/api/hak-akses")
            .then((response) => {
                setRoles(
                    response.data.roles || [],
                );

                setUsers(
                    response.data.users || [],
                );

                setPermissionItems(
                    response.data
                        .permissions || [],
                );

                if (
                    response.data.roles
                        ?.length > 0 &&
                    !selectedRoleId
                ) {
                    setSelectedRoleId(
                        String(
                            response.data
                                .roles[0].id,
                        ),
                    );
                }

                if (
                    response.data.users
                        ?.length > 0 &&
                    !selectedUserId
                ) {
                    setSelectedUserId(
                        String(
                            response.data
                                .users[0].id,
                        ),
                    );
                }
            })
            .catch((err) => {
                Toast.error(
                    err.response?.data
                        ?.message ||
                        "Gagal memuat data hak akses.",
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, [
        selectedRoleId,
        selectedUserId,
    ]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSelectRole =
        useCallback((id) => {
            setSelectedRoleId(
                String(id),
            );
        }, []);

    const handleSelectUser =
        useCallback((id) => {
            setSelectedUserId(
                String(id),
            );
        }, []);

    const selectedRole = useMemo(() => {
        return roles.find(
            (role) =>
                String(role.id) ===
                String(selectedRoleId),
        );
    }, [roles, selectedRoleId]);

    const selectedUser = useMemo(() => {
        return users.find(
            (user) =>
                String(user.id) ===
                String(selectedUserId),
        );
    }, [users, selectedUserId]);

    const hasUserCustomPermissions =
        useMemo(() => {
            return Boolean(
                selectedUser
                    ?.direct_permissions &&
                    selectedUser
                        .direct_permissions
                        .length > 0,
            );
        }, [selectedUser]);

    const isAdminRoleSelected =
        useMemo(() => {
            return (
                mode === "role" &&
                selectedRole?.name ===
                    "admin"
            );
        }, [mode, selectedRole]);

    const canUpdate = useMemo(
        () => hasUpdatePermission,
        [hasUpdatePermission],
    );

    useEffect(() => {
        if (
            mode === "role" &&
            selectedRole
        ) {
            setSelectedPermissions(
                selectedRole.permissions?.map(
                    (permission) =>
                        permission.id,
                ) || [],
            );
        } else if (
            mode === "user" &&
            selectedUser
        ) {
            const hasCustom =
                selectedUser
                    .direct_permissions &&
                selectedUser
                    .direct_permissions
                    .length > 0;

            if (hasCustom) {
                setSelectedPermissions(
                    selectedUser.direct_permissions.map(
                        (permission) =>
                            permission.id,
                    ),
                );
            } else {
                const rolePermissionIds =
                    selectedUser.roles
                        ?.flatMap(
                            (role) =>
                                role.permissions ||
                                [],
                        )
                        .map(
                            (permission) =>
                                permission.id,
                        ) || [];

                setSelectedPermissions(
                    Array.from(
                        new Set(
                            rolePermissionIds,
                        ),
                    ),
                );
            }
        }
    }, [
        mode,
        selectedRole,
        selectedUser,
    ]);

    const groupedPermissions =
        useMemo(() => {
            return permissionItems.reduce(
                (
                    groups,
                    permission,
                ) => {
                    const groupName =
                        permission.group_name ||
                        "Lainnya";

                    if (
                        !groups[
                            groupName
                        ]
                    ) {
                        groups[
                            groupName
                        ] = [];
                    }

                    groups[
                        groupName
                    ].push(
                        permission,
                    );

                    return groups;
                },
                {},
            );
        }, [permissionItems]);

    const togglePermission =
        useCallback(
            (id) => {
                if (!canUpdate) return;

                setSelectedPermissions(
                    (current) => {
                        if (
                            current.includes(
                                id,
                            )
                        ) {
                            return current.filter(
                                (item) =>
                                    item !== id,
                            );
                        }

                        return [
                            ...current,
                            id,
                        ];
                    },
                );
            },
            [canUpdate],
        );

    const toggleGroup = useCallback(
        (groupPermissions) => {
            if (!canUpdate) return;

            const groupIds =
                groupPermissions.map(
                    (permission) =>
                        permission.id,
                );

            setSelectedPermissions(
                (current) => {
                    const allSelected =
                        groupIds.every(
                            (id) =>
                                current.includes(
                                    id,
                                ),
                        );

                    if (allSelected) {
                        return current.filter(
                            (id) =>
                                !groupIds.includes(
                                    id,
                                ),
                        );
                    }

                    return Array.from(
                        new Set([
                            ...current,
                            ...groupIds,
                        ]),
                    );
                },
            );
        },
        [canUpdate],
    );

    const handleSave =
        useCallback(async () => {
            if (!canUpdate) return;

            setSaving(true);

            try {
                if (
                    mode === "role" &&
                    selectedRoleId
                ) {
                    const res =
                        await axios.put(
                            `/api/hak-akses/${selectedRoleId}`,
                            {
                                permission_ids:
                                    selectedPermissions,
                            },
                        );

                    Toast.success(
                        res.data
                            .message ||
                            "Hak akses role berhasil diperbarui.",
                    );
                } else if (
                    mode === "user" &&
                    selectedUserId
                ) {
                    const res =
                        await axios.put(
                            `/api/hak-akses/user/${selectedUserId}`,
                            {
                                permission_ids:
                                    selectedPermissions,
                            },
                        );

                    Toast.success(
                        res.data
                            .message ||
                            "Hak akses khusus pengguna berhasil diperbarui.",
                    );
                }

                router.reload();
                loadData();
            } catch (err) {
                Toast.error(
                    err.response?.data
                        ?.message ||
                        "Gagal memperbarui hak akses.",
                );
            } finally {
                setSaving(false);
            }
        }, [
            mode,
            selectedRoleId,
            selectedUserId,
            canUpdate,
            selectedPermissions,
            loadData,
        ]);

    const handleResetUser =
        useCallback(async () => {
            if (
                !canUpdate ||
                !selectedUserId
            ) {
                return;
            }

            setSaving(true);

            try {
                const res =
                    await axios.put(
                        `/api/hak-akses/user/${selectedUserId}`,
                        {
                            reset: true,
                        },
                    );

                Toast.success(
                    res.data.message ||
                        "Hak akses khusus pengguna dihapus. Kembali menggunakan aturan Role.",
                );

                router.reload();
                loadData();
            } catch (err) {
                Toast.error(
                    err.response?.data
                        ?.message ||
                        "Gagal mereset hak akses pengguna.",
                );
            } finally {
                setSaving(false);
            }
        }, [
            canUpdate,
            selectedUserId,
            loadData,
        ]);

    return (
        <DashboardLayout>
            <Head title="Hak Akses" />

            {loading ? (
                <div className="p-8 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />

                        <span>
                            Memuat data Hak
                            Akses...
                        </span>
                    </div>
                </div>
            ) : (
                <div className="space-y-3.5">
                    <PageHeaderBar
                        onRefresh={
                            loadData
                        }
                        refreshing={
                            loading
                        }
                        canCreate={
                            false
                        }
                        extraActions={
                            <div className="flex items-center gap-1.5">
                                {canUpdate && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleSave
                                        }
                                        disabled={
                                            saving
                                        }
                                        title={
                                            saving
                                                ? "Menyimpan..."
                                                : "Simpan"
                                        }
                                        aria-label={
                                            saving
                                                ? "Menyimpan..."
                                                : "Simpan"
                                        }
                                        className="w-8 h-8 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-md border border-teal-700/20 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <Save
                                            className={`w-4 h-4 ${
                                                saving
                                                    ? "animate-pulse"
                                                    : ""
                                            }`}
                                        />
                                    </button>
                                )}

                                <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-300 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMode(
                                                "role",
                                            )
                                        }
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                            mode ===
                                            "role"
                                                ? "bg-slate-900 text-white shadow-xs"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        <Shield className="w-3.5 h-3.5" />

                                        <span>
                                            Per Role
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMode(
                                                "user",
                                            )
                                        }
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                            mode ===
                                            "user"
                                                ? "bg-slate-900 text-white shadow-xs"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        <Users className="w-3.5 h-3.5" />

                                        <span>
                                            Per User
                                        </span>
                                    </button>
                                </div>
                            </div>
                        }
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                        <div className="lg:col-span-4 space-y-3">
                            {mode ===
                            "role" ? (
                                <RoleCardList
                                    roles={
                                        roles
                                    }
                                    selectedRoleId={
                                        selectedRoleId
                                    }
                                    onSelectRole={
                                        handleSelectRole
                                    }
                                />
                            ) : (
                                <div className="space-y-3">
                                    <UserSelectAutocomplete
                                        users={
                                            users
                                        }
                                        selectedUserId={
                                            selectedUserId
                                        }
                                        onSelectUser={
                                            handleSelectUser
                                        }
                                    />

                                    <UserCardList
                                        users={
                                            users
                                        }
                                        selectedUserId={
                                            selectedUserId
                                        }
                                        onSelectUser={
                                            handleSelectUser
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-8">
                            <PermissionAccordionTable
                                groupedPermissions={
                                    groupedPermissions
                                }
                                selectedPermissions={
                                    selectedPermissions
                                }
                                canUpdate={
                                    canUpdate
                                }
                                onTogglePermission={
                                    togglePermission
                                }
                                onToggleGroup={
                                    toggleGroup
                                }
                                targetTitle={
                                    mode ===
                                    "role"
                                        ? selectedRole?.label ||
                                          "Pilih Role"
                                        : selectedUser?.name ||
                                          "Pilih Pengguna"
                                }
                                targetBadge={
                                    mode ===
                                        "user" &&
                                    hasUserCustomPermissions ? (
                                        <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                            Khusus
                                        </span>
                                    ) : null
                                }
                                isProtected={
                                    isAdminRoleSelected
                                }
                                headerAction={
                                    mode ===
                                        "user" &&
                                    hasUserCustomPermissions &&
                                    canUpdate ? (
                                        <button
                                            type="button"
                                            onClick={
                                                handleResetUser
                                            }
                                            disabled={
                                                saving
                                            }
                                            title="Hapus hak akses khusus & kembali ke aturan Role"
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-md text-xs transition-colors border border-slate-300 cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <RotateCcw className="w-3 h-3 text-slate-500" />

                                            <span>
                                                Reset
                                                ke Role
                                            </span>
                                        </button>
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
