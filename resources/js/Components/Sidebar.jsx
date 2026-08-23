import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Boxes,
    ShieldCheck,
    Users,
    ChevronDown,
    ChevronRight,
    CircleDot,
    Activity,
    X,
    Scale,
    Package,
    GraduationCap,
    School,
    Building2,
    Settings,
    FolderKanban,
    Receipt,
    FileText,
    History,
    Shirt,
    Tags,
    Scissors,
    Ruler,
    ShoppingBag
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

    // Helper for boundary-safe active route matching
    const isRouteActive = useCallback((currentUrl, targetPath) => {
        if (!targetPath) return false;
        const cleanCurrent = (currentUrl || "").split("?")[0].split("#")[0].replace(/\/+$/, "");
        const cleanTarget = (targetPath || "").split("?")[0].split("#")[0].replace(/\/+$/, "");

        if (!cleanCurrent || !cleanTarget) return false;
        if (cleanCurrent === cleanTarget) return true;

        if (cleanTarget === "" || cleanTarget === "/dashboard") {
            return cleanCurrent === cleanTarget;
        }

        return cleanCurrent.startsWith(cleanTarget + "/");
    }, []);

    // Accordion open/close state for parent menus
    const [openMenus, setOpenMenus] = useState({});

    // Auto-open parent menus if child route is active (if not yet manually toggled)
    useEffect(() => {
        setOpenMenus((prev) => {
            const next = { ...prev };
            effectiveMenus.forEach((menu) => {
                if (menu.children && menu.children.length > 0) {
                    const hasActiveChild = menu.children.some((child) => isRouteActive(url, child.path));
                    if (hasActiveChild && prev[menu.id] === undefined) {
                        next[menu.id] = true;
                    }
                }
            });
            return next;
        });
    }, [url, effectiveMenus, isRouteActive]);

    const toggleMenu = (menuId, hasActiveChild) => {
        setOpenMenus((prev) => {
            const currentState = prev[menuId] !== undefined ? prev[menuId] : Boolean(hasActiveChild);
            return {
                ...prev,
                [menuId]: !currentState,
            };
        });
    };

    const getIconComponent = useCallback((iconName, permName) => {
        const name = (iconName || permName || "").toLowerCase();
        if (name.includes("dashboard")) return <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("shoppingbag") || name.includes("belanja") || name.includes("pembelian") || name.includes("kulaan")) return <ShoppingBag className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("pelanggan") || name.includes("pemesan") || name.includes("customer") || name.includes("client")) return <Users className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("sekolah") || name.includes("school") || name.includes("education")) return <GraduationCap className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("receipt") || name.includes("transaksi")) return <Receipt className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("history") || name.includes("lama") || name.includes("historis")) return <History className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("invoice") || name.includes("filetext") || name.includes("faktur")) return <FileText className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("shirt") || name.includes("produk") || name.includes("product")) return <Shirt className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("kategori-produk") || name.includes("tag")) return <Tags className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("kategori") || name.includes("category")) return <Boxes className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("satuan") || name.includes("scale") || name.includes("unit")) return <Scale className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("barang") || name.includes("package") || name.includes("item")) return <Package className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("security") || name.includes("hak_akses") || name.includes("hak-akses")) return <ShieldCheck className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("people") || name.includes("user")) return <Users className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("setting") || name.includes("pengaturan")) return <Settings className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("master") || name.includes("box")) return <FolderKanban className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("langkah") || name.includes("produksi") || name.includes("scissors")) return <Scissors className="w-4.5 h-4.5 shrink-0" />;
        if (name.includes("ukuran") || name.includes("ruler") || name.includes("size")) return <Ruler className="w-4.5 h-4.5 shrink-0" />;
        return <CircleDot className="w-3.5 h-3.5 shrink-0" />;
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
                <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/30 group-hover:scale-105 transition-transform shrink-0">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="truncate flex flex-col">
                                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight truncate">
                                    Azhar Collection
                                </span>
                                <span className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
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
                <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
                    <div>
                        {!isCollapsed ? (
                            <div className="flex items-center justify-between px-3 mb-2">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                    Navigasi Utama
                                </span>
                            </div>
                        ) : (
                            <div className="w-full text-center text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Menu
                            </div>
                        )}

                        {effectiveMenus.length === 0 ? (
                            <div className="px-3 py-3 text-xs text-slate-500 italic text-center bg-slate-800/40 rounded-lg border border-slate-800">
                                Tidak ada menu.
                            </div>
                        ) : (
                            <nav className="space-y-1.5">
                                {effectiveMenus.map((menu) => {
                                    const hasChildren = menu.children && menu.children.length > 0;
                                    const isDirectActive = isRouteActive(url, menu.path);
                                    const hasActiveChild = hasChildren && menu.children.some((child) => isRouteActive(url, child.path));
                                    const isOpen = openMenus[menu.id] !== undefined ? openMenus[menu.id] : Boolean(hasActiveChild);

                                    return (
                                        <div key={menu.id} className="space-y-1">
                                            {/* Direct Single Link (no children) */}
                                            {!hasChildren && menu.path ? (
                                                <Link
                                                    href={menu.path}
                                                    title={isCollapsed ? menu.title : undefined}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 group ${
                                                        isCollapsed ? "justify-center px-0" : "justify-between"
                                                    } ${
                                                        isDirectActive
                                                            ? "bg-slate-800 text-teal-400 font-semibold border border-slate-700/60 shadow-xs"
                                                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={isDirectActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-200"}>
                                                            {getIconComponent(menu.icon, menu.permission_name)}
                                                        </span>
                                                        {!isCollapsed && (
                                                            <span className="truncate">{menu.title}</span>
                                                        )}
                                                    </div>
                                                    {!isCollapsed && isDirectActive && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                                                    )}
                                                </Link>
                                            ) : hasChildren ? (
                                                /* Parent Menu with Collapsible Submenu */
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleMenu(menu.id, hasActiveChild)}
                                                        title={isCollapsed ? menu.title : undefined}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 group cursor-pointer ${
                                                            isCollapsed ? "justify-center px-0" : "justify-between"
                                                        } ${
                                                            hasActiveChild
                                                                ? "bg-slate-800/80 text-teal-300 font-semibold"
                                                                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <span className={hasActiveChild ? "text-teal-400" : "text-slate-400 group-hover:text-slate-200"}>
                                                                {getIconComponent(menu.icon, menu.title)}
                                                            </span>
                                                            {!isCollapsed && (
                                                                <span className="truncate font-semibold">{menu.title}</span>
                                                            )}
                                                        </div>
                                                        {!isCollapsed && (
                                                            <ChevronRight
                                                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                                                                    isOpen ? "rotate-90 text-teal-400" : "group-hover:text-slate-200"
                                                                }`}
                                                            />
                                                        )}
                                                    </button>

                                                    {/* Submenu Items (Anakan) */}
                                                    {!isCollapsed && isOpen && (
                                                        <div className="ml-4 pl-3 border-l-2 border-slate-800 space-y-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                            {menu.children.map((child) => {
                                                                const isChildActive = isRouteActive(url, child.path);
                                                                return (
                                                                    <Link
                                                                        key={child.id}
                                                                        href={child.path}
                                                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                                                                            isChildActive
                                                                                ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30"
                                                                                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={isChildActive ? "text-teal-400" : "text-slate-500"}>
                                                                                {getIconComponent(child.icon, child.permission_name)}
                                                                            </span>
                                                                            <span className="truncate">{child.title}</span>
                                                                        </div>
                                                                        {isChildActive && (
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                                                                        )}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Section Header (if path is null and no children) */
                                                !isCollapsed && (
                                                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-3">
                                                        {menu.title}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>
                        )}
                    </div>
                </div>

                {/* Sidebar Footer Badge */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                    {!isCollapsed ? (
                        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
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
