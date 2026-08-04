import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

const UserSelectAutocomplete = memo(function UserSelectAutocomplete({
    users = [],
    selectedUserId,
    onSelectUser,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef(null);

    const selectedUser = useMemo(() => {
        return users.find((u) => String(u.id) === String(selectedUserId));
    }, [users, selectedUserId]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const q = searchQuery.toLowerCase();
        return users.filter((u) => {
            const nameMatch = u.name?.toLowerCase().includes(q);
            const emailMatch = u.email?.toLowerCase().includes(q);
            const roleMatch = u.roles?.some(r => r.name?.toLowerCase().includes(q) || r.label?.toLowerCase().includes(q));
            return nameMatch || emailMatch || roleMatch;
        });
    }, [users, searchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = useCallback((userId) => {
        onSelectUser(userId);
        setIsOpen(false);
        setSearchQuery("");
    }, [onSelectUser]);

    return (
        <div className="relative w-full" ref={containerRef}>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Pilih Pengguna Sistem
            </label>

            {/* Select Trigger Box */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-2.5 bg-white border rounded-md cursor-pointer flex items-center justify-between transition-all select-none shadow-2xs ${
                    isOpen
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
            >
                {selectedUser ? (
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {selectedUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                                {selectedUser.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                                {selectedUser.email}
                            </p>
                        </div>
                    </div>
                ) : (
                    <span className="text-xs text-slate-400 font-medium">
                        -- Cari / Pilih Pengguna --
                    </span>
                )}

                <div className="flex items-center gap-1.5 text-slate-400">
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-600" : ""}`} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden animate-in fade-in duration-150">
                    {/* Autocomplete Search Input */}
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ketik nama, email, atau role..."
                            className="w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 p-0.5"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* User Options List */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 p-1">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                                const isSelected = String(user.id) === String(selectedUserId);
                                const hasCustom = user.direct_permissions && user.direct_permissions.length > 0;
                                const roleNames = user.roles?.map((r) => r.label || r.name).join(", ") || "Tanpa Role";

                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => handleSelect(user.id)}
                                        className={`p-2.5 rounded-md cursor-pointer flex items-center justify-between transition-colors ${
                                            isSelected
                                                ? "bg-emerald-50 text-emerald-950 font-medium"
                                                : "hover:bg-slate-50 text-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <div className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                                                isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                                            }`}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="truncate">
                                                <div className="flex items-center gap-1.5">
                                                    <h5 className="text-xs font-bold text-slate-800 truncate">
                                                        {user.name}
                                                    </h5>
                                                    {hasCustom ? (
                                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1 py-0.2 rounded border border-amber-200 shrink-0">
                                                            Custom ({user.direct_permissions.length})
                                                        </span>
                                                    ) : (
                                                        <span className="bg-slate-100 text-slate-600 text-[9px] font-medium px-1 py-0.2 rounded shrink-0">
                                                            Role
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 truncate">
                                                    {user.email} &bull; <span className="font-semibold text-slate-500">{roleNames}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="w-4.5 h-4.5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-3 text-center text-xs text-slate-400 font-medium">
                                Pengguna tidak ditemukan.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default UserSelectAutocomplete;
