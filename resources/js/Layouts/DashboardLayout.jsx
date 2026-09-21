import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Sidebar";
import {
    ChevronDown,
    LogOut,
    User as UserIcon,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";

export default function DashboardLayout({ children }) {
    const pageProps = usePage().props;
    const sharedAuth = pageProps.auth || {};

    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const currentUser = sharedAuth.user || null;
    const currentMenus = sharedAuth.menus || [];

    const userName = currentUser?.name || "User";
    const userEmail = currentUser?.email || "";
    const userRoles = currentUser?.roles?.join(", ") || "User";

    return (
        <div className="h-screen h-[100dvh] bg-slate-50 flex font-sans text-slate-900 antialiased overflow-hidden">
            <Sidebar
                menus={currentMenus}
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
                onToggleCollapse={() =>
                    setIsSidebarCollapsed(!isSidebarCollapsed)
                }
            />

            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                <header className="h-14 sm:h-15 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-5 flex items-center justify-between shrink-0 z-30 shadow-soft-2xs">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="flex lg:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-xs shadow-soft-2xs hover:bg-teal-700 transition-all duration-200 cursor-pointer"
                            title="Buka Menu Sidebar"
                        >
                            <Menu className="w-4 h-4 shrink-0" />
                            <span>Menu</span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setIsSidebarCollapsed(!isSidebarCollapsed)
                            }
                            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all duration-200 cursor-pointer shadow-soft-2xs"
                            title={
                                isSidebarCollapsed
                                    ? "Buka Sidebar"
                                    : "Tutup Sidebar"
                            }
                        >
                            {isSidebarCollapsed ? (
                                <PanelLeftOpen className="w-4 h-4 text-slate-600" />
                            ) : (
                                <PanelLeftClose className="w-4 h-4 text-slate-600" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setUserDropdownOpen(!userDropdownOpen)
                                }
                                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-soft-2xs">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden md:block text-left pr-1">
                                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                                        {userName}
                                    </p>
                                    <p className="text-[10px] font-semibold text-teal-700 uppercase tracking-wide">
                                        {userRoles}
                                    </p>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                            </button>

                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-soft-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-3.5 py-2 border-b border-slate-100">
                                        <p className="text-xs font-semibold text-slate-800">
                                            {userName}
                                        </p>
                                        <p className="text-[11px] text-slate-500 truncate">
                                            {userEmail}
                                        </p>
                                    </div>
                                    <Link
                                        href={route("profile.edit")}
                                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                        onClick={() =>
                                            setUserDropdownOpen(false)
                                        }
                                    >
                                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                                        Profil Pengguna
                                    </Link>
                                    <div className="border-t border-slate-100 my-1" />
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                        onClick={() =>
                                            setUserDropdownOpen(false)
                                        }
                                    >
                                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                        Keluar Akun
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 md:p-5 custom-scrollbar bg-slate-50">
                    <div>{children}</div>
                </main>

                <footer className="shrink-0 bg-white border-t border-slate-200/80 px-4 py-2.5 text-center text-[11px] text-slate-500 font-medium">
                    &copy; {new Date().getFullYear()} Azhar Collection. Sistem Manajemen Operasional Konveksi.
                </footer>
            </div>
        </div>
    );
}
