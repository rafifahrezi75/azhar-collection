import React, { memo, useCallback, useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Boxes,
    ShieldCheck,
    Users,
    ChevronLeft,
    ChevronRight,
    CircleDot,
    Sparkles,
    Activity,
    X,
    PanelLeftClose,
    PanelLeftOpen,
    Scale,
    Package
} from "lucide-react";

const Sidebar = memo(function Sidebar({
    menus = [],
    isCollapsed = false,
    isMobileOpen = false,
    onCloseMobile,
    onToggleCollapse
}) {
    const { url, props } = usePage();
    const effectiveMenus = useMemo(() => {
        return menus.length > 0 ? menus : (props.auth?.menus || []);
    }, [menus, props.auth?.menus]);

    const getIconComponent = useCallback((iconName, permName) => {
        const name = (iconName || permName || "").toLowerCase();
        if (name.includes("dashboard")) return <LayoutDashboard className="w-5 h-5 shrink-0" />;
        if (name.includes("kategori") || name.includes("category")) return <Boxes className="w-5 h-5 shrink-0" />;
        if (name.includes("satuan") || name.includes("scale") || name.includes("unit")) return <Scale className="w-5 h-5 shrink-0" />;
        if (name.includes("barang") || name.includes("package") || name.includes("item")) return <Package className="w-5 h-5 shrink-0" />;
        if (name.includes("security") || name.includes("hak_akses") || name.includes("hak-akses")) return <ShieldCheck className="w-5 h-5 shrink-0" />;
        if (name.includes("people") || name.includes("user")) return <Users className="w-5 h-5 shrink-0" />;
        return <CircleDot className="w-4 h-4 shrink-0" />;
    }, []);

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isMobileOpen && (
                <div
                    onClick={onCloseMobile}
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity animate-in fade-in"
                />
            )}

            {/* Sidebar Main Container */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800/80 shadow-xl select-none transition-all duration-300 ease-in-out ${
                    isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
                } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
            >
                {/* Header / Brand */}
                <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-900/90">
                    <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/30 group-hover:scale-105 transition-transform shrink-0">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="truncate flex flex-col">
                                <span className="font-extrabold text-base tracking-tight text-white leading-tight truncate">
                                    Azhar Collection
                                </span>
                                <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                                    Management Portal
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
                        title="Tutup Menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <div>
                        {!isCollapsed ? (
                            <div className="flex items-center justify-between px-3 mb-3">
                                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                                    Navigasi Utama
                                </span>
                            </div>
                        ) : (
                            <div className="w-full text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Menu
                            </div>
                        )}

                        {effectiveMenus.length === 0 ? (
                            <div className="px-3 py-4 text-xs text-slate-500 italic text-center bg-slate-800/40 rounded-lg border border-slate-800">
                                Tidak ada menu.
                            </div>
                        ) : (
                            <nav className="space-y-2">
                                {effectiveMenus.map((menu) => {
                                    const isActive =
                                        url === menu.path ||
                                        (menu.path !== "/dashboard" && url.startsWith(menu.path));

                                    return (
                                        <div key={menu.id} className="space-y-1">
                                            {menu.path ? (
                                                <Link
                                                    href={menu.path}
                                                    title={isCollapsed ? menu.title : undefined}
                                                    className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                                                        isCollapsed ? "justify-center px-0" : "justify-between"
                                                    } ${
                                                        isActive
                                                            ? "bg-slate-800 text-teal-400 font-semibold border border-slate-700/60 shadow-xs"
                                                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={isActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-200"}>
                                                            {getIconComponent(menu.icon, menu.permission_name)}
                                                        </span>
                                                        {!isCollapsed && (
                                                            <span className="truncate">{menu.title}</span>
                                                        )}
                                                    </div>
                                                    {!isCollapsed && (
                                                        isActive ? (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                                                        ) : (
                                                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                                                        )
                                                    )}
                                                </Link>
                                            ) : (
                                                !isCollapsed && (
                                                    <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-4">
                                                        {menu.title}
                                                    </div>
                                                )
                                            )}

                                            {!isCollapsed && menu.children?.length > 0 && (
                                                <div className="ml-5 pl-2 border-l border-slate-800 space-y-1 mt-1">
                                                    {menu.children.map((child) => {
                                                        const isChildActive = url === child.path;
                                                        return (
                                                            <Link
                                                                key={child.id}
                                                                href={child.path}
                                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                                                    isChildActive
                                                                        ? "bg-slate-800 text-teal-400 font-semibold"
                                                                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                                                                }`}
                                                            >
                                                                {getIconComponent(child.icon, child.permission_name)}
                                                                <span className="truncate">{child.title}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>
                        )}
                    </div>
                </div>

                {/* Sidebar Footer Badge */}
                <div className="p-3 bg-slate-900 border-t border-slate-800">
                    {!isCollapsed ? (
                        <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="font-mono text-[11px] text-slate-300 font-medium">System Online</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-500">v1.2.0</span>
                        </div>
                    ) : (
                        <div className="flex justify-center py-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
});

export default Sidebar;
