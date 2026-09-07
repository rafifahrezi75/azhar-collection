import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import Pagination from "@/Components/Pagination";
import UserRoleModal from "@/Components/UserRoleModal";
import UserModal from "@/Components/UserModal";
import SimpleFilterModal from "@/Components/SimpleFilterModal";
import { hasPermission } from "@/utils/permissions";
import { Toast, confirmDialog } from "@/utils/sweetalert";
import { Shield, SquarePen, Trash2 } from "lucide-react";

export default function Index() {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;
    const permissions = auth?.permissions || [];

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [editingRoleUser, setEditingRoleUser] = useState(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [savingRole, setSavingRole] = useState(false);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
        password: "",
        role_ids: [],
    });
    const [userSubmitting, setUserSubmitting] = useState(false);

    const canUpdate = useMemo(() => {
        const userRoles = auth?.user?.roles || [];
        const isAdmin = userRoles.some((r) =>
            typeof r === "string"
                ? r.toLowerCase() === "admin"
                : r.name?.toLowerCase() === "admin",
        );
        return (
            isAdmin ||
            hasPermission(permissions, "user.update") ||
            hasPermission(permissions, "user.create") ||
            hasPermission(permissions, "user.view")
        );
    }, [permissions, auth]);

    const loadData = useCallback(() => {
        setLoading(true);

        axios
            .get("/api/users-management")
            .then((response) => {
                setUsers(response.data.users || []);
                setRoles(response.data.roles || []);
            })
            .catch((err) => {
                Toast.error(
                    err.response?.data?.message || "Gagal memuat data user.",
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const closeFilter = useCallback(() => {
        setIsFilterModalOpen(false);
    }, []);

    const handleFilterClick = useCallback(() => {
        setIsFilterModalOpen((prev) => !prev);
    }, []);

    const handleRefresh = useCallback(() => {
        closeFilter();
        loadData();
    }, [closeFilter, loadData]);

    const isFilterActive = useMemo(
        () => selectedRoleId !== "",
        [selectedRoleId],
    );

    const handleResetFilters = useCallback(() => {
        setSelectedRoleId("");
        setCurrentPage(1);
    }, []);

    const filteredUsers = useMemo(() => {
        const search = searchTerm.toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                !searchTerm ||
                user.name?.toLowerCase().includes(search) ||
                user.email?.toLowerCase().includes(search);

            const matchesRole =
                !selectedRoleId ||
                user.roles?.some(
                    (role) => String(role.id) === String(selectedRoleId),
                );

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, selectedRoleId]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;

        return filteredUsers.slice(start, start + itemsPerPage);
    }, [filteredUsers, currentPage, itemsPerPage]);

    useEffect(() => {
        const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [filteredUsers.length, itemsPerPage, currentPage]);

    const handleSearchChange = useCallback((val) => {
        setSearchTerm(val);
        setCurrentPage(1);
    }, []);

    const openRoleModal = useCallback(
        (user) => {
            closeFilter();
            setEditingRoleUser(user);
            setSelectedRoleIds(user.roles?.map((role) => role.id) || []);
        },
        [closeFilter],
    );

    const closeRoleModal = useCallback(() => {
        setEditingRoleUser(null);
        setSelectedRoleIds([]);
    }, []);

    const toggleRole = useCallback((roleId) => {
        setSelectedRoleIds((current) => {
            if (current.includes(roleId)) {
                return current.filter((id) => id !== roleId);
            }

            return [...current, roleId];
        });
    }, []);

    const handleSaveUserRoles = useCallback(async () => {
        if (!editingRoleUser || !canUpdate) {
            return;
        }

        setSavingRole(true);

        try {
            const res = await axios.put(
                `/api/users-management/${editingRoleUser.id}/roles`,
                {
                    role_ids: selectedRoleIds,
                },
            );

            Toast.success(res.data.message || "Role user berhasil diperbarui.");
            closeRoleModal();
            loadData();
        } catch (err) {
            Toast.error(
                err.response?.data?.message || "Gagal memperbarui role user.",
            );
        } finally {
            setSavingRole(false);
        }
    }, [editingRoleUser, canUpdate, selectedRoleIds, closeRoleModal, loadData]);

    const openUserModal = useCallback((user = null) => {
        setEditingUser(user);
        if (user) {
            setUserForm({
                name: user.name || "",
                email: user.email || "",
                password: "",
                role_ids: user.roles?.map((r) => r.id) || [],
            });
        } else {
            setUserForm({
                name: "",
                email: "",
                password: "",
                role_ids: [],
            });
        }
        setIsUserModalOpen(true);
    }, []);

    const closeUserModal = useCallback(() => {
        setIsUserModalOpen(false);
        setEditingUser(null);
    }, []);

    const handleUserFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setUserForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleUserToggleRole = useCallback((roleId) => {
        setUserForm((prev) => {
            const exists = prev.role_ids.includes(roleId);
            return {
                ...prev,
                role_ids: exists
                    ? prev.role_ids.filter((id) => id !== roleId)
                    : [...prev.role_ids, roleId],
            };
        });
    }, []);

    const handleUserSubmit = useCallback(async (e) => {
        e.preventDefault();
        setUserSubmitting(true);

        try {
            if (editingUser) {
                const res = await axios.put(
                    `/api/users-management/${editingUser.id}`,
                    userForm,
                );
                Toast.success(res.data.message || "Data pengguna berhasil diperbarui.");
            } else {
                const res = await axios.post(
                    "/api/users-management",
                    userForm,
                );
                Toast.success(res.data.message || "Pengguna baru berhasil ditambahkan.");
            }
            closeUserModal();
            loadData();
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(", ")
                    : "Gagal menyimpan data pengguna.");
            Toast.error(errorMsg);
        } finally {
            setUserSubmitting(false);
        }
    }, [editingUser, userForm, closeUserModal, loadData]);

    const handleDeleteUser = useCallback(async (user) => {
        if (!canUpdate) return;
        if (user.id === currentUserId) {
            Toast.error("Anda tidak dapat menghapus akun Anda sendiri.");
            return;
        }

        const isConfirmed = await confirmDialog({
            title: "Hapus Pengguna?",
            text: `Apakah Anda yakin ingin menghapus pengguna "${user.name}" (${user.email})?`,
            confirmButtonText: "Ya, Hapus Pengguna",
            icon: "warning",
        });

        if (!isConfirmed) return;

        try {
            const res = await axios.delete(`/api/users-management/${user.id}`);
            Toast.success(res.data.message || "Pengguna berhasil dihapus.");
            loadData();
        } catch (err) {
            Toast.error(
                err.response?.data?.message || "Gagal menghapus pengguna.",
            );
        }
    }, [canUpdate, currentUserId, loadData]);

    return (
        <DashboardLayout>
            <Head title="Manajemen Pengguna" />

            <div className="space-y-4">
                <PageHeaderBar
                    breadcrumbs={[
                        {
                            label: "Pengaturan Sistem",
                        },
                        {
                            label: "Manajemen User",
                        },
                    ]}
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Cari user / email..."
                    onFilterClick={handleFilterClick}
                    isFilterActive={isFilterActive}
                    filterContent={
                        <SimpleFilterModal
                            isOpen={isFilterModalOpen}
                            title="Filter User"
                            statusFilter="all"
                            extraFilter={
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Pilih Role
                                    </label>

                                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedRoleId("");
                                                setCurrentPage(1);
                                            }}
                                            className={`min-w-0 px-2 py-1.5 rounded-md border text-[11px] font-semibold transition-all cursor-pointer text-center ${
                                                selectedRoleId === ""
                                                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                            }`}
                                        >
                                            Semua Role
                                        </button>

                                        {roles.map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRoleId(
                                                        String(role.id),
                                                    );
                                                    setCurrentPage(1);
                                                }}
                                                title={role.label || role.name}
                                                className={`min-w-0 px-2 py-1.5 rounded-md border text-[11px] font-semibold transition-all cursor-pointer text-center truncate ${
                                                    String(selectedRoleId) ===
                                                    String(role.id)
                                                        ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                                }`}
                                            >
                                                {role.label || role.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            }
                            onReset={handleResetFilters}
                            onClose={closeFilter}
                        />
                    }
                    onRefresh={handleRefresh}
                    refreshing={loading}
                    onAdd={() => openUserModal(null)}
                    addTitle="Tambah"
                    canCreate={canUpdate}
                />

                <div className="bg-white border border-slate-200/90 rounded-md overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                                    <th className="px-3.5 py-2.5 w-16 text-center">
                                        No
                                    </th>

                                    <th className="px-3.5 py-2.5">Nama User</th>

                                    <th className="px-3.5 py-2.5">Email</th>

                                    <th className="px-3.5 py-2.5">
                                        Role Dimiliki
                                    </th>

                                    <th className="px-3.5 py-2.5 w-32 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-3.5 py-8 text-center text-slate-400"
                                        >
                                            <div className="inline-flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />

                                                <span>Memuat data user...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-3.5 py-10 text-center text-slate-400"
                                        >
                                            Belum ada data user yang sesuai.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user, idx) => {
                                        const rowNumber =
                                            (currentPage - 1) * itemsPerPage +
                                            idx +
                                            1;

                                        return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-slate-50/70 transition-colors"
                                            >
                                                <td className="px-3.5 py-2.5 text-slate-400 font-mono text-xs font-medium text-center">
                                                    {rowNumber}
                                                </td>

                                                <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                                                    {user.name}
                                                </td>

                                                <td className="px-3.5 py-2.5 text-slate-600 font-mono text-xs">
                                                    {user.email}
                                                </td>

                                                <td className="px-3.5 py-2.5">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {user.roles &&
                                                        user.roles.length >
                                                            0 ? (
                                                            user.roles.map(
                                                                (role) => (
                                                                    <span
                                                                        key={
                                                                            role.id
                                                                        }
                                                                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 uppercase"
                                                                    >
                                                                        {role.label ||
                                                                            role.name}
                                                                    </span>
                                                                ),
                                                            )
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">
                                                                Tanpa Role
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                                                    {canUpdate && (
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openRoleModal(
                                                                        user,
                                                                    )
                                                                }
                                                                title="Atur Role"
                                                                aria-label="Atur Role"
                                                                className="w-7 h-7 inline-flex items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md transition-all duration-200 border border-teal-200/80 cursor-pointer shadow-2xs"
                                                            >
                                                                <Shield className="w-3.5 h-3.5" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openUserModal(
                                                                        user,
                                                                    )
                                                                }
                                                                title="Edit Pengguna"
                                                                aria-label="Edit Pengguna"
                                                                className="w-7 h-7 inline-flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md transition-all duration-200 border border-amber-200/80 cursor-pointer shadow-2xs"
                                                            >
                                                                <SquarePen className="w-3.5 h-3.5" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteUser(
                                                                        user,
                                                                    )
                                                                }
                                                                disabled={
                                                                    user.id ===
                                                                    currentUserId
                                                                }
                                                                title={
                                                                    user.id ===
                                                                    currentUserId
                                                                        ? "Tidak dapat menghapus akun sendiri"
                                                                        : "Hapus Pengguna"
                                                                }
                                                                aria-label="Hapus Pengguna"
                                                                className="w-7 h-7 inline-flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-all duration-200 border border-rose-200/80 cursor-pointer shadow-2xs"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredUsers.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(newSize) => {
                                setItemsPerPage(newSize);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                </div>

                <UserModal
                    isOpen={isUserModalOpen}
                    isEditing={Boolean(editingUser)}
                    form={userForm}
                    roles={roles}
                    submitting={userSubmitting}
                    onClose={closeUserModal}
                    onChange={handleUserFormChange}
                    onToggleRole={handleUserToggleRole}
                    onSubmit={handleUserSubmit}
                />

                <UserRoleModal
                    isOpen={Boolean(editingRoleUser)}
                    user={editingRoleUser}
                    roles={roles}
                    selectedRoleIds={selectedRoleIds}
                    saving={savingRole}
                    onClose={closeRoleModal}
                    onToggleRole={toggleRole}
                    onSave={handleSaveUserRoles}
                />
            </div>
        </DashboardLayout>
    );
}
