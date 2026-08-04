import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PageHeaderBar from "@/Components/PageHeaderBar";
import Pagination from "@/Components/Pagination";
import UserRoleModal from "@/Components/UserRoleModal";
import SimpleFilterModal from "@/Components/SimpleFilterModal";
import { hasPermission } from "@/utils/permissions";
import { Toast } from "@/utils/sweetalert";
import { Shield } from "lucide-react";

export default function Index() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [editingUser, setEditingUser] = useState(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [saving, setSaving] = useState(false);

    const canUpdate = useMemo(() => hasPermission(permissions, "user.update"), [permissions]);

    const loadData = useCallback(() => {
        setLoading(true);
        axios
            .get("/api/users-management")
            .then((response) => {
                setUsers(response.data.users || []);
                setRoles(response.data.roles || []);
                setLoading(false);
            })
            .catch((err) => {
                Toast.error(err.response?.data?.message || "Gagal memuat data user.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isFilterActive = useMemo(() => selectedRoleId !== "", [selectedRoleId]);

    const handleResetFilters = useCallback(() => {
        setSelectedRoleId("");
        setCurrentPage(1);
    }, []);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                !searchTerm ||
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole =
                !selectedRoleId ||
                user.roles?.some((r) => String(r.id) === String(selectedRoleId));

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, selectedRoleId]);

    // Paginated users
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(start, start + itemsPerPage);
    }, [filteredUsers, currentPage, itemsPerPage]);

    // Adjust page if out of bounds
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

    const openRoleModal = useCallback((user) => {
        setEditingUser(user);
        setSelectedRoleIds(user.roles.map((r) => r.id));
    }, []);

    const closeModal = useCallback(() => {
        setEditingUser(null);
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
        if (!editingUser || !canUpdate) return;
        setSaving(true);

        try {
            const res = await axios.put(`/api/users-management/${editingUser.id}/roles`, {
                role_ids: selectedRoleIds,
            });
            Toast.success(res.data.message || "Role user berhasil diperbarui.");
            closeModal();

            // Reload Inertia shared props so sidebar/permissions update in real-time
            router.reload();
            loadData();
        } catch (err) {
            Toast.error(err.response?.data?.message || "Gagal memperbarui role user.");
        } finally {
            setSaving(false);
        }
    }, [editingUser, canUpdate, selectedRoleIds, closeModal, loadData]);

    return (
        <DashboardLayout>
            <Head title="Manajemen Pengguna" />
            <div className="space-y-4">
                {/* Header Bar */}
                <PageHeaderBar
                    breadcrumbs={[
                        { label: "Pengaturan Sistem" },
                        { label: "Manajemen User" },
                    ]}
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Cari user / email..."
                    onFilterClick={() => setIsFilterModalOpen(true)}
                    isFilterActive={isFilterActive}
                    onRefresh={loadData}
                    refreshing={loading}
                    canCreate={false}
                />

                {/* User List Table */}
                <div className="bg-white border border-slate-200/90 rounded-md overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                                    <th className="px-3.5 py-2.5">#</th>
                                    <th className="px-3.5 py-2.5">Nama User</th>
                                    <th className="px-3.5 py-2.5">Email</th>
                                    <th className="px-3.5 py-2.5">Role Dimiliki</th>
                                    <th className="px-3.5 py-2.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-3.5 py-8 text-center text-slate-400">
                                            <div className="inline-flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                                                <span>Memuat data user...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-3.5 py-10 text-center text-slate-400">
                                            Belum ada data user yang sesuai.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user, idx) => {
                                        const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                                        return (
                                            <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-3.5 py-2.5 text-slate-400 font-mono text-xs font-medium">
                                                    {rowNumber}
                                                </td>
                                                <td className="px-3.5 py-2.5 font-semibold text-slate-900">{user.name}</td>
                                                <td className="px-3.5 py-2.5 text-slate-600 font-mono text-xs">{user.email}</td>
                                                <td className="px-3.5 py-2.5">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {user.roles && user.roles.length > 0 ? (
                                                            user.roles.map((role) => (
                                                                <span
                                                                    key={role.id}
                                                                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 uppercase"
                                                                >
                                                                    {role.label || role.name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">Tanpa Role</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                                    {canUpdate && (
                                                        <button
                                                            onClick={() => openRoleModal(user)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 rounded-md text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                                                        >
                                                            <Shield className="w-3.5 h-3.5 text-teal-600" />
                                                            <span>Atur Role</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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

                {/* Filter Dialog Modal */}
                <SimpleFilterModal
                    isOpen={isFilterModalOpen}
                    title="Filter Role Pengguna"
                    statusFilter="all"
                    extraFilter={
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Pilih Role
                            </label>
                            <select
                                value={selectedRoleId}
                                onChange={(e) => {
                                    setSelectedRoleId(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white font-medium"
                            >
                                <option value="">Semua Role</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.label || r.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    }
                    onReset={handleResetFilters}
                    onClose={() => setIsFilterModalOpen(false)}
                />

                {/* Role Modal */}
                <UserRoleModal
                    isOpen={Boolean(editingUser)}
                    user={editingUser}
                    roles={roles}
                    selectedRoleIds={selectedRoleIds}
                    saving={saving}
                    onClose={closeModal}
                    onToggleRole={toggleRole}
                    onSave={handleSaveUserRoles}
                />
            </div>
        </DashboardLayout>
    );
}
