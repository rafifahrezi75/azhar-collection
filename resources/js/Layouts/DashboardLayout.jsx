import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Sidebar";
import { Search, Bell, ChevronDown, LogOut, User as UserIcon, Menu, ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardLayout({ children }) {
    const pageProps = usePage().props;
    const sharedAuth = pageProps.auth || {};

    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Direct reactive references to Inertia shared auth props
    const currentUser = sharedAuth.user || null;
    const currentMenus = sharedAuth.menus || [];

    const userName = currentUser?.name || "User";
    const userEmail = currentUser?.email || "";
    const userRoles = currentUser?.roles?.join(", ") || "User";

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 antialiased">
            {/* Sidebar Component */}
            <Sidebar
                menus={currentMenus}
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar Header */}
                <header className="h-14 sm:h-15 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                    {/* Left: Sidebar Toggle Buttons & Search Bar */}
                    <div className="flex items-center gap-2.5">
                        {/* Mobile Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="flex lg:hidden items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-teal-600 text-white font-semibold text-xs shadow-xs hover:bg-teal-700 transition-colors cursor-pointer"
                            title="Buka Menu Sidebar"
                        >
                            <Menu className="w-4 h-4 shrink-0" />
                            <span>Menu</span>
                        </button>

                        {/* Desktop Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                            title={isSidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                        >
                            {isSidebarCollapsed ? (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                            ) : (
                                <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                            )}
                        </button>

                        {/* Search Bar */}
                        <div className="hidden md:flex items-center gap-2 bg-slate-100/80 border border-slate-200 rounded-md px-2.5 py-1.5 w-56 text-slate-400 text-xs focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 focus-within:bg-white transition-all">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari data..."
                                className="bg-transparent border-none p-0 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0 w-full"
                            />
                        </div>
                    </div>

                    {/* Right User & Controls */}
                    <div className="flex items-center gap-2.5 ml-auto">
                        {/* Notification Bell Badge */}
                        <button className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200/70 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors relative cursor-pointer">
                            <Bell className="w-3.5 h-3.5 text-slate-600" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
                        </button>

                        {/* User Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                            >
                                <div className="w-7 h-7 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
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
                                <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
                            </button>

                            {/* Dropdown Menu */}
                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-3.5 py-1.5 border-b border-slate-100">
                                        <p className="text-xs font-semibold text-slate-800">{userName}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                                    </div>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                                        Edit Profile
                                    </Link>
                                    <div className="border-t border-slate-100 my-1" />
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 text-left px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                        Log Out
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Body with compact padding */}
                <main className="flex-1 p-3.5 sm:p-4 md:p-5 overflow-y-auto flex flex-col justify-between">
                    <div>
                        {children}
                    </div>
                    
                    {/* Footer */}
                    <footer className="mt-8 pt-4 border-t border-slate-200/60 text-center text-[11px] text-slate-500 font-medium">
                        &copy; {new Date().getFullYear()} Azhar Collection. Hak Cipta Dilindungi.
                    </footer>
                </main>
            </div>
        </div>
    );
}
