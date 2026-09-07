import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import Pagination from "@/Components/Pagination";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Receipt,
    User,
    Phone,
    MapPin,
    Layers,
    Scissors,
    ArrowLeft,
    Plus,
    X,
    Trash2,
    FileText,
    Calendar,
    Building2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ChevronDown,
    Boxes,
    Package,
    Save,
} from "lucide-react";

export default function Show({
    invoice: initialInvoice,
    users: initialUsers = [],
    sizes: initialSizes = [],
    returnTo: initialReturnTo = null,
}) {
    const [invoice, setInvoice] = useState(initialInvoice);
    const [users, setUsers] = useState(initialUsers);
    const [activeTab, setActiveTab] = useState("info");
    const [expandedItems, setExpandedItems] = useState({});
    const [expandedBOM, setExpandedBOM] = useState({});
    const [expandedBOMSizes, setExpandedBOMSizes] = useState({});
    const [expandedSPK, setExpandedSPK] = useState({});
    const [expandedEmployees, setExpandedEmployees] = useState({});

    const handleBack = useCallback(() => {
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const targetUrl = initialReturnTo || params?.get("return_to");
        if (targetUrl) {
            router.visit(targetUrl);
            return;
        }
        if (invoice?.customer_id && typeof document !== "undefined" && document.referrer && document.referrer.includes(`/pelanggan/${invoice.customer_id}`)) {
            router.visit(`/dashboard/pelanggan/${invoice.customer_id}`);
            return;
        }
        router.visit("/dashboard/invoice");
    }, [initialReturnTo, invoice?.customer_id]);

    const toggleItemAccordion = useCallback((itemId) => {
        setExpandedItems((prev) => ({
            ...prev,
            [itemId]: !prev[itemId],
        }));
    }, []);

    const toggleBOMAccordion = useCallback((itemId) => {
        setExpandedBOM((prev) => ({
            ...prev,
            [itemId]: !prev[itemId],
        }));
    }, []);

    const toggleBOMSize = useCallback((key) => {
        setExpandedBOMSizes((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    }, []);

    const toggleSPKAccordion = useCallback((assignmentId) => {
        setExpandedSPK((prev) => ({
            ...prev,
            [assignmentId]: !prev[assignmentId],
        }));
    }, []);

    const toggleEmployeeAccordion = useCallback((employeeId) => {
        setExpandedEmployees((prev) => ({
            ...prev,
            [employeeId]: !prev[employeeId],
        }));
    }, []);

    const getSizeCategory = useCallback(
        (sizeName, lineItem) => {
            if (!sizeName) return null;
            const cleanName = String(sizeName).trim().toLowerCase();

            if (lineItem?.product?.sizes && Array.isArray(lineItem.product.sizes)) {
                const match = lineItem.product.sizes.find(
                    (ps) =>
                        ps.size &&
                        String(ps.size.size_name).trim().toLowerCase() ===
                            cleanName,
                );
                if (match?.size?.category) return match.size.category;
            }

            if (lineItem?.product?.materials && Array.isArray(lineItem.product.materials)) {
                const match = lineItem.product.materials.find(
                    (m) =>
                        m.size &&
                        String(m.size.size_name).trim().toLowerCase() ===
                            cleanName,
                );
                if (match?.size?.category) return match.size.category;
            }

            const nameToCheck = `${lineItem?.item_name || ""} ${lineItem?.product?.name || ""}`.toUpperCase();
            if (/\bSMP\b/.test(nameToCheck)) return "SMP";
            if (/\bSMA\b|\bSMK\b/.test(nameToCheck)) return "SMA";
            if (/\bSD\b|\bMI\b/.test(nameToCheck)) return "SD";
            if (/\bTK\b|\bPAUD\b/.test(nameToCheck)) return "TK";
            if (/\bCELANA\b/.test(nameToCheck) && /^\d+$/.test(cleanName)) return "Celana";
            if (/\bDEWASA\b/.test(nameToCheck)) return "Dewasa";
            if (/\bANAK\b/.test(nameToCheck)) return "Anak-anak";

            if (initialSizes && Array.isArray(initialSizes)) {
                const match = initialSizes.find(
                    (s) =>
                        String(s.size_name).trim().toLowerCase() ===
                        cleanName,
                );
                if (match?.category) return match.category;
            }

            return null;
        },
        [initialSizes],
    );

    useEffect(() => {
        if (initialInvoice) {
            setInvoice(initialInvoice);
        }
    }, [initialInvoice]);

    useEffect(() => {
        if (initialUsers && initialUsers.length > 0) {
            setUsers(initialUsers);
        }
    }, [initialUsers]);

    const [showSPKForm, setShowSPKForm] = useState(false);
    const [spkForm, setSpkForm] = useState({
        invoice_item_id: "",
        user_id: "",
        qty: "",
        target_date: "",
        steps: [],
    });

    const updateInvoiceState = useCallback((updater) => {
        setInvoice((prev) => (prev ? updater(prev) : prev));
    }, []);

    const spkItemOptions = useMemo(() => {
        return (invoice?.items || []).map((i) => ({
            value: String(i.id),
            label: i.item_name,
            sublabel: `${i.qty} ${i.unit}`,
            searchKey: `${i.item_name} ${i.qty} ${i.unit}`,
        }));
    }, [invoice?.items]);

    const spkUserOptions = useMemo(() => {
        return users.map((u) => ({
            value: String(u.id),
            label: u.name,
            sublabel: u.email,
            searchKey: `${u.name} ${u.email || ""}`,
        }));
    }, [users]);

    const formatCurrency = useCallback((val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    }, []);

    const formatDate = useCallback((dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Intl.DateTimeFormat("id-ID", {
                dateStyle: "medium",
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    }, []);

    const parseItemSizes = useCallback(
        (item) => {
            if (!item.size_breakdown) return [];
            let breakdown = item.size_breakdown;
            if (typeof breakdown === "string") {
                try {
                    breakdown = JSON.parse(breakdown);
                } catch {
                    return [];
                }
            }
            if (!breakdown || typeof breakdown !== "object") return [];

            const result = [];
            if (Array.isArray(breakdown)) {
                breakdown.forEach((entry) => {
                    if (entry && (entry.size || entry.name)) {
                        const sizeName = entry.size || entry.name;
                        const category =
                            entry.category || getSizeCategory(sizeName, item);
                        const qty = Number(entry.qty) || 0;
                        const price =
                            Number(entry.price) ||
                            Number(item.unit_price) ||
                            0;
                        if (qty > 0) {
                            result.push({
                                size: sizeName,
                                category,
                                qty,
                                price,
                                subtotal: qty * price,
                            });
                        }
                    }
                });
            } else {
                Object.entries(breakdown).forEach(([k, v]) => {
                    if (typeof v === "object" && v !== null) {
                        const sizeName = v.size || k;
                        const category =
                            v.category || getSizeCategory(sizeName, item);
                        const qty = Number(v.qty) || 0;
                        const price =
                            Number(v.price) ||
                            Number(item.unit_price) ||
                            0;
                        if (qty > 0) {
                            result.push({
                                size: sizeName,
                                category,
                                qty,
                                price,
                                subtotal: qty * price,
                            });
                        }
                    } else {
                        const sizeName = k;
                        const category = getSizeCategory(sizeName, item);
                        const qty = Number(v) || 0;
                        const price = Number(item.unit_price) || 0;
                        if (qty > 0) {
                            result.push({
                                size: sizeName,
                                category,
                                qty,
                                price,
                                subtotal: qty * price,
                            });
                        }
                    }
                });
            }
            return result;
        },
        [getSizeCategory],
    );

    if (!invoice) {
        return (
            <DashboardLayout>
                <Head title="Invoice Tidak Ditemukan" />
                <div className="flex items-center justify-center h-64">
                    <p className="text-sm text-slate-500 font-medium">
                        Data invoice tidak ditemukan
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    const customer = useMemo(() => invoice.customer || {}, [invoice]);
    const items = useMemo(() => invoice.items || [], [invoice]);
    const [itemsCurrentPage, setItemsCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [spkEmpPages, setSpkEmpPages] = useState({});
    const [spkEmpPageSizes, setSpkEmpPageSizes] = useState({});

    const paginatedItems = useMemo(() => {
        const start = (itemsCurrentPage - 1) * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
    }, [items, itemsCurrentPage, itemsPerPage]);

    const totalAssignments = useMemo(
        () => items.flatMap((i) => i.production_assignments || []).length,
        [items],
    );

    const formatIndonesianStatus = useCallback((rawStatus) => {
        const s = String(rawStatus || "").toLowerCase().trim();
        if (s === "completed" || s === "selesai") {
            return {
                label: "Selesai",
                badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
                pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
            };
        }
        if (s === "in_progress" || s === "in progress" || s === "proses") {
            return {
                label: "Dalam Proses",
                badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
                pillClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
            };
        }
        if (s === "cancelled" || s === "batal" || s === "dibatalkan") {
            return {
                label: "Dibatalkan",
                badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
                pillClass: "bg-rose-50 text-rose-700 border-rose-200",
            };
        }
        return {
            label: "Menunggu",
            badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
            pillClass: "bg-amber-50 text-amber-700 border-amber-200",
        };
    }, []);

    const assignmentsByEmployee = useMemo(() => {
        const map = new Map();

        items.forEach((item) => {
            (item.production_assignments || []).forEach((assignment) => {
                const matchedUser = users.find(
                    (u) => String(u.id) === String(assignment.user_id),
                );
                const empId =
                    assignment.assignee?.id ||
                    assignment.user_id ||
                    `temp-${assignment.id}`;
                const empName =
                    assignment.assignee?.name ||
                    matchedUser?.name ||
                    "Karyawan";
                const empEmail =
                    assignment.assignee?.email || matchedUser?.email || "";

                if (!map.has(empId)) {
                    map.set(empId, {
                        employeeId: empId,
                        employeeName: empName,
                        employeeEmail: empEmail,
                        assignments: [],
                    });
                }

                map.get(empId).assignments.push({
                    ...assignment,
                    item_name: item.item_name,
                    item_unit: item.unit || "Pcs",
                });
            });
        });

        return Array.from(map.values()).map((emp) => {
            let totalWage = 0;
            let totalTargetQty = 0;
            let totalSteps = 0;
            let completedSteps = 0;
            let inProgressCount = 0;
            let completedCount = 0;

            emp.assignments.forEach((assignment) => {
                totalTargetQty += Number(assignment.qty) || 0;
                const normAsStatus = String(assignment.status || "")
                    .toLowerCase()
                    .trim();
                if (normAsStatus === "completed" || normAsStatus === "selesai") {
                    completedCount += 1;
                } else if (
                    normAsStatus === "in_progress" ||
                    normAsStatus === "proses" ||
                    normAsStatus === "in progress"
                ) {
                    inProgressCount += 1;
                }

                (assignment.steps || []).forEach((step) => {
                    totalSteps += 1;
                    const normStepStatus = String(step.status || "")
                        .toLowerCase()
                        .trim();
                    if (
                        normStepStatus === "completed" ||
                        normStepStatus === "selesai"
                    ) {
                        completedSteps += 1;
                    } else if (
                        normStepStatus === "in_progress" ||
                        normStepStatus === "proses" ||
                        normStepStatus === "in progress"
                    ) {
                        inProgressCount += 1;
                    }

                    const sQty =
                        Number(step.qty) || Number(assignment.qty) || 0;
                    const sWage = Number(step.wage) || 0;
                    totalWage += sQty * sWage;
                });
            });

            let employeeStatus = "Menunggu";
            let statusStyle = "bg-amber-50 text-amber-700 border-amber-200";

            if (
                emp.assignments.length > 0 &&
                completedCount === emp.assignments.length &&
                (totalSteps === 0 || completedSteps === totalSteps)
            ) {
                employeeStatus = "Selesai";
                statusStyle =
                    "bg-emerald-50 text-emerald-700 border-emerald-200";
            } else if (
                inProgressCount > 0 ||
                completedSteps > 0 ||
                completedCount > 0
            ) {
                employeeStatus = "Dalam Proses";
                statusStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
            }

            return {
                ...emp,
                totalWage,
                totalTargetQty,
                totalSteps,
                completedSteps,
                employeeStatus,
                statusStyle,
            };
        });
    }, [items, users]);

    const getItemProductionSteps = useCallback((item) => {
        const customSteps = item.production_steps || item.productionSteps || [];
        if (customSteps.length > 0) {
            return customSteps.map((s) => ({
                name:
                    s.step_name ||
                    s.production_step?.name ||
                    s.custom_name ||
                    "Langkah Produksi",
                wage: Number(s.wage) || 0,
                assigneeName: s.assignee?.name || null,
                status: s.status || "pending",
            }));
        }
        const productSteps =
            item.product?.production_steps ||
            item.product?.productionSteps ||
            [];
        if (productSteps.length > 0) {
            return productSteps.map((s) => ({
                name:
                    s.production_step?.name ||
                    s.custom_name ||
                    "Langkah Produksi",
                wage: Number(s.wage) || 0,
                assigneeName: null,
                status: "pending",
            }));
        }
        return [];
    }, []);

    const getItemTotalWage = useCallback(
        (item) => {
            const steps = getItemProductionSteps(item);
            const wagePerPcs = steps.reduce((sum, s) => sum + s.wage, 0);
            const itemQty = Number(item.qty) || 0;
            return {
                wagePerPcs,
                totalWage: wagePerPcs * itemQty,
                stepsCount: steps.length,
                steps,
            };
        },
        [getItemProductionSteps],
    );

    const totalProductionWage = useMemo(() => {
        return items.reduce((sum, item) => {
            const { totalWage } = getItemTotalWage(item);
            return sum + totalWage;
        }, 0);
    }, [items, getItemTotalWage]);

    const bomPerItem = useMemo(
        () =>
            items.map((line) => {
                const prod = line.product;
                const lineQty = Number(line.qty) || 0;
                const breakdownMap = {};
                const materialsList = [];

                if (line.size_breakdown) {
                    let parsed = line.size_breakdown;
                    if (typeof parsed === "string") {
                        try {
                            parsed = JSON.parse(parsed);
                        } catch {}
                    }
                    if (typeof parsed === "object" && parsed !== null) {
                        Object.entries(parsed).forEach(([k, v]) => {
                            if (typeof v === "object" && v !== null && (v.size || v.name)) {
                                const s = v.size || v.name || k;
                                const q = Number(v.qty) || 0;
                                if (q > 0) breakdownMap[s] = q;
                            } else {
                                const q = Number(v) || 0;
                                if (q > 0) breakdownMap[k] = q;
                            }
                        });
                    }
                }

                if (prod && prod.materials && prod.materials.length > 0) {
                    const hasSizeBreakdown = Object.keys(breakdownMap).length > 0;

                    if (hasSizeBreakdown) {
                        Object.entries(breakdownMap).forEach(([sizeName, sizeQty]) => {
                            if (sizeQty <= 0) return;

                            const relevantMaterials = prod.materials.filter((mat) => {
                                const matSize = mat.size?.size_name || mat.size_name;
                                const isUniversal =
                                    !mat.size_id &&
                                    !mat.size &&
                                    (!mat.size_name ||
                                        mat.size_name === "ALL" ||
                                        mat.size_name === "Universal");
                                if (isUniversal) return true;
                                if (
                                    matSize &&
                                    String(matSize).trim().toLowerCase() ===
                                        String(sizeName).trim().toLowerCase()
                                ) {
                                    return true;
                                }
                                return false;
                            });

                            const hasSpecificMatch = relevantMaterials.some(
                                (m) =>
                                    m.size_id ||
                                    m.size ||
                                    (m.size_name &&
                                        m.size_name !== "ALL" &&
                                        m.size_name !== "Universal"),
                            );

                            if (!hasSpecificMatch) {
                                const existingItemIds = new Set(
                                    relevantMaterials.map((m) => m.item_id),
                                );
                                const missingMaterials = prod.materials.filter(
                                    (m) => !existingItemIds.has(m.item_id),
                                );
                                const addedItemIds = new Set();
                                missingMaterials.forEach((m) => {
                                    if (!addedItemIds.has(m.item_id)) {
                                        addedItemIds.add(m.item_id);
                                        relevantMaterials.push(m);
                                    }
                                });
                            }

                            relevantMaterials.forEach((mat) => {
                                const itemName =
                                    mat.item?.name || "Bahan Baku";
                                const itemCode = mat.item?.code || "-";
                                const unit =
                                    mat.unit_name ||
                                    mat.item?.unit?.name ||
                                    "Unit";
                                const required =
                                    Number(mat.required_qty) || 0;
                                const yieldQty = Math.max(
                                    0.0001,
                                    Number(mat.yield_qty) || 1,
                                );
                                const usageQty =
                                    (sizeQty / yieldQty) * required;

                                materialsList.push({
                                    id: mat.id,
                                    itemId: mat.item_id,
                                    name: itemName,
                                    code: itemCode,
                                    size: sizeName,
                                    sizeQty,
                                    unit,
                                    requiredPerUnit: required,
                                    yieldQty,
                                    usageQty,
                                    itemStock: Number(mat.item?.stock) || 0,
                                });
                            });
                        });
                    } else if (lineQty > 0) {
                        const seenItems = new Set();
                        prod.materials.forEach((mat) => {
                            if (seenItems.has(mat.item_id)) return;
                            seenItems.add(mat.item_id);

                            const itemName = mat.item?.name || "Bahan Baku";
                            const itemCode = mat.item?.code || "-";
                            const unit =
                                mat.unit_name || mat.item?.unit?.name || "Unit";
                            const required = Number(mat.required_qty) || 0;
                            const yieldQty = Math.max(
                                0.0001,
                                Number(mat.yield_qty) || 1,
                            );
                            const usageQty = (lineQty / yieldQty) * required;

                            materialsList.push({
                                id: mat.id,
                                itemId: mat.item_id,
                                name: itemName,
                                code: itemCode,
                                size: "Universal",
                                sizeQty: lineQty,
                                unit,
                                requiredPerUnit: required,
                                yieldQty,
                                usageQty,
                                itemStock: Number(mat.item?.stock) || 0,
                            });
                        });
                    }
                }

                const sizeGroupsMap = {};
                materialsList.forEach((mat) => {
                    const sName = mat.size || "Universal";
                    if (!sizeGroupsMap[sName]) {
                        sizeGroupsMap[sName] = {
                            size: sName,
                            category:
                                sName !== "Universal"
                                    ? getSizeCategory(sName, line)
                                    : null,
                            sizeQty: mat.sizeQty || lineQty,
                            materials: [],
                        };
                    }
                    sizeGroupsMap[sName].materials.push(mat);
                });

                return {
                    itemId: line.id,
                    itemName: line.item_name,
                    productName: prod?.name || line.item_name,
                    hasProduct: !!prod,
                    qty: lineQty,
                    unit: line.unit || "Pcs",
                    materials: materialsList,
                    sizeGroups: Object.values(sizeGroupsMap),
                };
            }),
        [items, getSizeCategory],
    );

    const [bomCurrentPage, setBomCurrentPage] = useState(1);
    const [bomPerPage, setBomPerPage] = useState(5);

    const paginatedBomPerItem = useMemo(() => {
        const start = (bomCurrentPage - 1) * bomPerPage;
        return bomPerItem.slice(start, start + bomPerPage);
    }, [bomPerItem, bomCurrentPage, bomPerPage]);

    const aggregatedBOM = useMemo(() => {
        const map = {};
        bomPerItem.forEach((item) => {
            item.materials.forEach((mat) => {
                if (!map[mat.itemId]) {
                    map[mat.itemId] = {
                        id: mat.itemId,
                        name: mat.name,
                        code: mat.code,
                        unit: mat.unit,
                        currentStock: mat.itemStock,
                        totalUsage: 0,
                    };
                }
                map[mat.itemId].totalUsage += mat.usageQty;
            });
        });
        return Object.values(map);
    }, [bomPerItem]);

    const handleCreateSPK = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!spkForm.invoice_item_id || !spkForm.user_id) {
            Swal.fire(
                "Peringatan",
                "Pilih Item dan Karyawan terlebih dahulu",
                "warning",
            );
            return;
        }

        try {
            const selectedItem = items.find(
                (i) => i.id == spkForm.invoice_item_id,
            );
            const targetQty =
                Number(spkForm.qty) || Number(selectedItem?.qty) || 1;

            const payload = {
                invoice_item_id: spkForm.invoice_item_id,
                user_id: spkForm.user_id,
                qty: targetQty,
                target_date: spkForm.target_date || null,
                steps: spkForm.steps.map((s) => ({
                    id: s.id,
                    qty: Number(s.qty) || targetQty,
                })),
            };

            const res = await axios.post(
                "/api/production-assignments",
                payload,
            );
            const newAssignment = res.data?.data;

            if (newAssignment) {
                updateInvoiceState((prev) => ({
                    ...prev,
                    items: prev.items.map((item) => {
                        if (item.id == spkForm.invoice_item_id) {
                            return {
                                ...item,
                                production_assignments: [
                                    ...(item.production_assignments || []),
                                    newAssignment,
                                ],
                            };
                        }
                        return item;
                    }),
                }));
            }

            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Penugasan SPK berhasil dibuat",
                timer: 1500,
                showConfirmButton: false,
            });

            setShowSPKForm(false);
            setSpkForm({
                invoice_item_id: "",
                user_id: "",
                qty: "",
                target_date: "",
                steps: [],
            });
        } catch (err) {
            Swal.fire(
                "Error",
                err.response?.data?.message || "Gagal membuat SPK",
                "error",
            );
        }
    };

    const handleDeleteSPK = useCallback(
        (id) => {
            Swal.fire({
                title: "Hapus SPK?",
                text: "Data penugasan ini akan dihapus permanen.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ef4444",
                cancelButtonColor: "#64748b",
                confirmButtonText: "Ya, hapus!",
                cancelButtonText: "Batal",
            }).then((result) => {
                if (result.isConfirmed) {
                    updateInvoiceState((prev) => ({
                        ...prev,
                        items: prev.items.map((item) => ({
                            ...item,
                            production_assignments: (
                                item.production_assignments || []
                            ).filter((as) => as.id !== id),
                        })),
                    }));

                    axios
                        .delete(`/api/production-assignments/${id}`)
                        .then(() => {
                            Swal.fire({
                                icon: "success",
                                title: "Terhapus!",
                                text: "SPK berhasil dihapus.",
                                timer: 1000,
                                showConfirmButton: false,
                            });
                        })
                        .catch(() => {
                            Swal.fire("Error", "Gagal menghapus", "error");
                        });
                }
            });
        },
        [updateInvoiceState],
    );

    const selectedItemForSPK = useMemo(
        () => items.find((i) => i.id == spkForm.invoice_item_id),
        [items, spkForm.invoice_item_id],
    );

    const remainingBalance = Math.max(
        0,
        Number(invoice.total_amount || 0) - Number(invoice.paid_amount || 0),
    );

    return (
        <DashboardLayout>
            <Head
                title={`#${invoice.invoice_number} - Detail Invoice - Azhar Collection`}
            />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    {/* HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Tombol Kembali & Judul */}
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    title="Kembali"
                                    onClick={handleBack}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Receipt className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                            Detail Invoice
                                        </h3>
                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold shadow-2xs">
                                            #{invoice.invoice_number}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {customer.name ||
                                            invoice.customer_name ||
                                            "Pelanggan Umum"}{" "}
                                        &bull; {formatDate(invoice.order_date)}
                                    </p>
                                </div>
                            </div>

                            {/* Navigasi Tab & Tombol Aksi Dokumen */}
                            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0">
                                <div className="flex items-center gap-2 h-8 border-b border-slate-200/80">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("info")}
                                        className={`inline-flex items-center gap-1.5 h-full px-2.5 text-xs font-semibold rounded-t-md transition-all cursor-pointer border-b-2 -mb-px ${
                                            activeTab === "info"
                                                ? "border-teal-600 text-teal-700 bg-teal-50/80 font-bold"
                                                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <FileText
                                            className={`w-3.5 h-3.5 ${
                                                activeTab === "info"
                                                    ? "text-teal-600"
                                                    : "text-slate-400"
                                            }`}
                                        />
                                        <span>Rincian Pesanan</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("bom")}
                                        className={`inline-flex items-center gap-1.5 h-full px-2.5 text-xs font-semibold rounded-t-md transition-all cursor-pointer border-b-2 -mb-px ${
                                            activeTab === "bom"
                                                ? "border-teal-600 text-teal-700 bg-teal-50/80 font-bold"
                                                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <Layers
                                            className={`w-3.5 h-3.5 ${
                                                activeTab === "bom"
                                                    ? "text-teal-600"
                                                    : "text-slate-400"
                                            }`}
                                        />
                                        <span>Bahan (BOM)</span>
                                        <span
                                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                                activeTab === "bom"
                                                    ? "bg-teal-100/80 text-teal-800 border border-teal-200/80"
                                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                            }`}
                                        >
                                            {aggregatedBOM.length}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("spk")}
                                        className={`inline-flex items-center gap-1.5 h-full px-2.5 text-xs font-semibold rounded-t-md transition-all cursor-pointer border-b-2 -mb-px ${
                                            activeTab === "spk"
                                                ? "border-teal-600 text-teal-700 bg-teal-50/80 font-bold"
                                                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                        }`}
                                    >
                                        <Scissors
                                            className={`w-3.5 h-3.5 ${
                                                activeTab === "spk"
                                                    ? "text-teal-600"
                                                    : "text-slate-400"
                                            }`}
                                        />
                                        <span>Penugasan SPK</span>
                                        <span
                                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                                activeTab === "spk"
                                                    ? "bg-teal-100/80 text-teal-800 border border-teal-200/80"
                                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                            }`}
                                        >
                                            {totalAssignments}
                                        </span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
                                            const targetUrl = initialReturnTo || params?.get("return_to");
                                            const returnParam = targetUrl ? `?return_to=${encodeURIComponent(targetUrl)}` : "";
                                            router.visit(
                                                `/dashboard/invoice/${invoice.id}/print-preview${returnParam}`,
                                            );
                                        }}
                                        className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-semibold rounded-lg border border-teal-200 shadow-2xs transition-all cursor-pointer"
                                        title="Cetak Nota"
                                    >
                                        <Receipt className="w-3.5 h-3.5 text-teal-600" />
                                        <span className="mt-0.5">Cetak Nota</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="p-4 sm:p-5">
                        {activeTab === "info" && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                {/* KOLOM KIRI: Identitas, Status & Finansial */}
                                <div className="lg:col-span-4 space-y-4">
                                    {/* Identitas Pelanggan */}
                                    <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 shadow-2xs space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                    Pelanggan Pemesan
                                                </span>
                                                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight truncate mt-0.5">
                                                    {customer.name ||
                                                        invoice.customer_name ||
                                                        "Pelanggan Umum"}
                                                </h4>
                                                <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                                                    {customer.institution_name && (
                                                        <p className="flex items-center gap-1.5">
                                                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            Instansi:{" "}
                                                            <strong className="text-slate-800 font-semibold truncate">
                                                                {
                                                                    customer.institution_name
                                                                }
                                                            </strong>
                                                        </p>
                                                    )}
                                                    {customer.phone && (
                                                        <p className="flex items-center gap-1.5">
                                                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            Kontak:{" "}
                                                            <span className="font-mono text-slate-700 font-medium">
                                                                {customer.phone}
                                                            </span>
                                                        </p>
                                                    )}
                                                    {customer.address && (
                                                        <p className="flex items-start gap-1.5">
                                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                            <span className="text-slate-600 line-clamp-2 leading-tight">
                                                                {
                                                                    customer.address
                                                                }
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {(() => {
                                                const pStatus = String(invoice.payment_status || "").toUpperCase();
                                                const isLunas = pStatus === "LUNAS";
                                                const isDp = pStatus === "DP" || pStatus === "PARTIAL";
                                                return (
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                                                            isLunas
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                : isDp
                                                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                                : "bg-rose-50 text-rose-700 border border-rose-200"
                                                        }`}
                                                    >
                                                        {isLunas ? (
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                        ) : (
                                                            <AlertTriangle className="w-3 h-3" />
                                                        )}
                                                        {isDp ? "DP" : invoice.payment_status || "BELUM_LUNAS"}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Status & Jadwal Produksi */}
                                    <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">
                                                Status Produksi:
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                                    invoice.production_status ===
                                                    "SELESAI"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : invoice.production_status ===
                                                            "PROSES"
                                                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                                          : "bg-slate-100 text-slate-600 border border-slate-200"
                                                }`}
                                            >
                                                {invoice.production_status ===
                                                "SELESAI" ? (
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                ) : (
                                                    <Clock className="w-3 h-3" />
                                                )}
                                                {invoice.production_status ||
                                                    "PENDING"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                                            <span className="text-slate-500 font-medium">
                                                Tanggal Pemesanan:
                                            </span>
                                            <span className="font-semibold text-slate-800 font-mono">
                                                {formatDate(invoice.order_date)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">
                                                Target Selesai:
                                            </span>
                                            <span className="font-semibold text-slate-800 font-mono">
                                                {invoice.completion_date
                                                    ? formatDate(
                                                          invoice.completion_date,
                                                      )
                                                    : "Tidak Ditentukan"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">
                                                Tipe Pengerjaan:
                                            </span>
                                            <span className="font-semibold text-slate-800 uppercase font-mono text-[11px]">
                                                {invoice.type || "REGULAR"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Ringkasan Finansial Tagihan */}
                                    <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-200 space-y-2 text-xs shadow-2xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">
                                                Subtotal Item:
                                            </span>
                                            <span className="font-semibold text-slate-800 font-mono">
                                                {formatCurrency(
                                                    invoice.subtotal,
                                                )}
                                            </span>
                                        </div>

                                        {Number(invoice.discount) > 0 && (
                                            <div className="flex items-center justify-between text-rose-600">
                                                <span className="font-medium">
                                                    Potongan Diskon:
                                                </span>
                                                <span className="font-mono font-semibold">
                                                    -{" "}
                                                    {formatCurrency(
                                                        invoice.discount,
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                                            <span className="text-slate-500 font-medium">
                                                Total Tagihan:
                                            </span>
                                            <span className="font-bold text-teal-700 font-mono text-sm">
                                                {formatCurrency(
                                                    invoice.total_amount,
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">
                                                Sudah Terbayar:
                                            </span>
                                            <span className="font-semibold text-emerald-700 font-mono">
                                                {formatCurrency(
                                                    invoice.paid_amount,
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                                            <span className="text-slate-500 font-medium">
                                                Sisa Piutang:
                                            </span>
                                            <span className="font-bold text-rose-600 font-mono text-sm">
                                                {formatCurrency(
                                                    remainingBalance,
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                                            <span className="text-slate-500 font-medium flex items-center gap-1">
                                                <Scissors className="w-3.5 h-3.5 text-teal-600" />
                                                Estimasi Upah Jahit:
                                            </span>
                                            <span className="font-bold text-teal-800 font-mono text-xs">
                                                {formatCurrency(
                                                    totalProductionWage,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* KOLOM KANAN: Hero Card & Rincian Item */}
                                <div className="lg:col-span-8 space-y-4">
                                    {/* Hero Card Akumulasi Tagihan */}
                                    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 border border-slate-200 shadow-2xs space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                            <span className="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
                                                <Layers className="w-4 h-4 text-teal-600" />
                                                Akumulasi Tagihan Penjualan
                                            </span>
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                                {items.length} Item Pesanan
                                            </span>
                                        </div>
                                        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                                                Total Nilai Pesanan:
                                            </span>
                                            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-mono">
                                                {formatCurrency(
                                                    invoice.total_amount,
                                                )}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium pt-0.5">
                                                Telah diterima pembayaran
                                                sebesar{" "}
                                                <strong className="font-bold text-emerald-800 font-mono">
                                                    {formatCurrency(
                                                        invoice.paid_amount,
                                                    )}
                                                </strong>
                                                {remainingBalance > 0 ? (
                                                    <span>
                                                        {" "}
                                                        dengan sisa tagihan{" "}
                                                        <strong className="font-bold text-rose-700 font-mono">
                                                            {formatCurrency(
                                                                remainingBalance,
                                                            )}
                                                        </strong>
                                                        .
                                                    </span>
                                                ) : (
                                                    <span>
                                                        {" "}
                                                        (Lunas sepenuhnya).
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card Rincian Item Pesanan */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                                        <div className="p-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <Receipt className="w-4 h-4 text-teal-600" />
                                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                    Rincian Item & Spesifikasi Ukuran
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                                    {items.length} Item
                                                </span>
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                                    {items.reduce(
                                                        (sum, it) =>
                                                            sum + (Number(it.qty) || 0),
                                                        0
                                                    )}{" "}
                                                    Total Pcs
                                                </span>
                                            </div>
                                        </div>

                                        <div className="overflow-hidden">
                                            <table className="w-full text-left border-collapse table-fixed text-[11px]">
                                                <thead>
                                                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <th className="py-2 px-2.5 w-[38%]">Item Pesanan</th>
                                                        <th className="py-2 px-1.5 text-center w-[15%]">Kuantitas</th>
                                                        <th className="py-2 px-1.5 text-right w-[15%]">Harga Satuan</th>
                                                        <th className="py-2 px-1.5 text-right w-[16%]">Upah Jahit</th>
                                                        <th className="py-2 px-2 text-right w-[16%]">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                                    {paginatedItems.map((item, idx) => {
                                                        const sizesList = parseItemSizes(item);
                                                        const isExpanded = !!expandedItems[item.id];
                                                        const itemWageInfo = getItemTotalWage(item);
                                                        return (
                                                            <React.Fragment key={item.id || idx}>
                                                                <tr className="hover:bg-slate-50/70 transition-colors">
                                                                    <td
                                                                        onClick={() => toggleItemAccordion(item.id)}
                                                                        className="py-2 px-2.5 align-middle cursor-pointer select-none"
                                                                    >
                                                                        <div className="flex items-start gap-1.5 min-w-0">
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleItemAccordion(item.id);
                                                                                }}
                                                                                className="p-0.5 mt-0.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer shrink-0"
                                                                                title={
                                                                                    isExpanded
                                                                                        ? "Sembunyikan rincian"
                                                                                        : "Lihat rincian"
                                                                                }
                                                                            >
                                                                                <ChevronDown
                                                                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                                                                        isExpanded
                                                                                            ? "rotate-180 text-teal-600"
                                                                                            : ""
                                                                                    }`}
                                                                                />
                                                                            </button>
                                                                            <div className="min-w-0 flex-1">
                                                                                <div
                                                                                    className="font-semibold text-slate-900 truncate leading-tight"
                                                                                    title={item.item_name}
                                                                                >
                                                                                    {item.item_name}
                                                                                </div>
                                                                                <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                                                                                    {sizesList.length > 0
                                                                                        ? `${sizesList.length} spesifikasi ukuran`
                                                                                        : "Ukuran standar"}
                                                                                    {item.description
                                                                                        ? ` • ${item.description}`
                                                                                        : ""}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-2 px-1.5 text-center whitespace-nowrap align-middle">
                                                                        <span className="font-bold text-slate-800 font-mono">
                                                                            {item.qty}
                                                                        </span>{" "}
                                                                        <span className="text-[10px] text-slate-500">
                                                                            {item.unit || "Pcs"}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-2 px-1.5 text-right whitespace-nowrap font-mono text-[10px] text-slate-600 align-middle">
                                                                        {formatCurrency(item.unit_price)}
                                                                    </td>
                                                                    <td className="py-2 px-1.5 text-right whitespace-nowrap font-mono text-[10px] align-middle">
                                                                        {itemWageInfo.wagePerPcs > 0 ? (
                                                                            <div>
                                                                                <span className="font-bold text-teal-700">
                                                                                    {formatCurrency(itemWageInfo.totalWage)}
                                                                                </span>
                                                                                <span className="text-[9px] text-slate-400 block">
                                                                                    ({formatCurrency(itemWageInfo.wagePerPcs)}/pcs)
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-slate-400">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 px-2 text-right whitespace-nowrap font-mono font-bold text-slate-900 align-middle">
                                                                        {formatCurrency(item.subtotal)}
                                                                    </td>
                                                                </tr>
                                                                 {isExpanded && (
                                                                    <tr className="bg-slate-50/40">
                                                                        <td
                                                                            colSpan={5}
                                                                            className="p-0 border-t border-slate-200/80"
                                                                        >
                                                                            {sizesList.length > 0 ? (
                                                                                <table className="w-full text-left border-collapse table-fixed text-[10px] bg-white">
                                                                                    <thead>
                                                                                        <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                                                                                            <th className="py-1.5 pl-8 pr-2.5 w-[38%]">Ukuran</th>
                                                                                            <th className="py-1.5 px-1.5 text-center w-[15%]">Kuantitas</th>
                                                                                            <th className="py-1.5 px-1.5 text-right w-[15%]">Harga Satuan</th>
                                                                                            <th className="py-1.5 px-1.5 text-center w-[16%]"></th>
                                                                                            <th className="py-1.5 px-2 text-right w-[16%]">Subtotal</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                                                                        {sizesList.map((sz, sIdx) => (
                                                                                            <tr key={sIdx} className="hover:bg-slate-50/70">
                                                                                                <td className="py-1.5 pl-8 pr-2.5 font-bold text-slate-800 align-middle">
                                                                                                    <div className="flex items-center gap-1.5">
                                                                                                        {sz.category && (
                                                                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200/80 text-teal-800 font-bold tracking-wide uppercase font-sans">
                                                                                                                {sz.category}
                                                                                                            </span>
                                                                                                        )}
                                                                                                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                                                                                                            {sz.size}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="py-1.5 px-1.5 text-center font-mono text-slate-800 align-middle">
                                                                                                    {sz.qty} {item.unit || "Pcs"}
                                                                                                </td>
                                                                                                <td className="py-1.5 px-1.5 text-right font-mono text-slate-600 align-middle">
                                                                                                    {formatCurrency(sz.price)}
                                                                                                </td>
                                                                                                <td className="py-1.5 px-1.5 text-center text-slate-300 align-middle">
                                                                                                    -
                                                                                                </td>
                                                                                                <td className="py-1.5 px-2 text-right font-bold text-slate-900 font-mono align-middle">
                                                                                                    {formatCurrency(sz.subtotal)}
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            ) : (
                                                                                <div className="py-2.5 px-4 text-center text-xs text-slate-400 bg-white">
                                                                                    Tidak ada rincian spesifikasi ukuran khusus untuk item ini.
                                                                                </div>
                                                                            )}

                                                                            {itemWageInfo.steps.length > 0 && (
                                                                                <div className="border-t border-slate-200 bg-white">
                                                                                    <div className="px-4 py-1.5 bg-slate-100/75 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-[10px]">
                                                                                        <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                                                                            <Scissors className="w-3.5 h-3.5 text-teal-600" />
                                                                                            Langkah Produksi & Upah Jahit (Borongan)
                                                                                        </span>
                                                                                        <span className="font-mono text-slate-600 font-medium text-[9px]">
                                                                                            Total Tarif: <strong className="text-teal-700 font-bold">{formatCurrency(itemWageInfo.wagePerPcs)}</strong>/{item.unit || "Pcs"} &bull; Total Upah: <strong className="text-teal-800 font-extrabold">{formatCurrency(itemWageInfo.totalWage)}</strong>
                                                                                        </span>
                                                                                    </div>

                                                                                    <table className="w-full text-left border-collapse table-fixed text-[10px]">
                                                                                        <thead>
                                                                                            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                                                                                                <th className="py-1.5 pl-4 pr-2 w-[8%] text-center">No</th>
                                                                                                <th className="py-1.5 px-2 w-[42%]">Tahapan Kerja</th>
                                                                                                <th className="py-1.5 px-1.5 text-center w-[16%]">Target Qty</th>
                                                                                                <th className="py-1.5 px-1.5 text-right w-[17%]">Tarif Satuan</th>
                                                                                                <th className="py-1.5 pr-4 pl-2 text-right w-[17%]">Total Upah</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                                                                            {itemWageInfo.steps.map((step, sIdx) => {
                                                                                                const stepTotal =
                                                                                                    step.wage * (Number(item.qty) || 0);
                                                                                                return (
                                                                                                    <tr key={sIdx} className="hover:bg-slate-50/60">
                                                                                                        <td className="py-1.5 pl-4 pr-2 text-center font-mono text-slate-500 text-[10px] align-middle">
                                                                                                            {sIdx + 1}
                                                                                                        </td>
                                                                                                        <td className="py-1.5 px-2 font-semibold text-slate-800 truncate align-middle" title={step.name}>
                                                                                                            {step.name}
                                                                                                        </td>
                                                                                                        <td className="py-1.5 px-1.5 text-center font-mono text-slate-800 align-middle">
                                                                                                            {item.qty} {item.unit || "Pcs"}
                                                                                                        </td>
                                                                                                        <td className="py-1.5 px-1.5 text-right font-mono text-slate-600 align-middle">
                                                                                                            {formatCurrency(step.wage)}
                                                                                                        </td>
                                                                                                        <td className="py-1.5 pr-4 pl-2 text-right font-bold text-teal-800 font-mono align-middle">
                                                                                                            {formatCurrency(stepTotal)}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                );
                                                                                            })}
                                                                                        </tbody>
                                                                                        <tfoot className="bg-slate-50/90 border-t border-slate-200 font-semibold text-[10px] text-slate-800">
                                                                                            <tr>
                                                                                                <td colSpan={2} className="py-1.5 pl-4 pr-2 font-bold text-slate-700 align-middle">
                                                                                                    Total Upah Borongan Item Ini
                                                                                                </td>
                                                                                                <td className="py-1.5 px-1.5 text-center font-mono font-bold text-slate-700 align-middle">
                                                                                                    {item.qty} {item.unit || "Pcs"}
                                                                                                </td>
                                                                                                <td className="py-1.5 px-1.5 text-right font-mono font-bold text-teal-700 align-middle">
                                                                                                    {formatCurrency(itemWageInfo.wagePerPcs)}
                                                                                                </td>
                                                                                                <td className="py-1.5 pr-4 pl-2 text-right font-mono font-extrabold text-teal-800 align-middle">
                                                                                                    {formatCurrency(itemWageInfo.totalWage)}
                                                                                                </td>
                                                                                            </tr>
                                                                                        </tfoot>
                                                                                    </table>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {items.length > 0 && (
                                            <div className="border-t border-slate-200/80 bg-white [&_button]:w-7 [&_button]:h-7 [&_button]:text-[11px] [&>div]:px-3 [&>div]:py-2 text-[11px]">
                                                <Pagination
                                                    totalItems={items.length}
                                                    itemsPerPage={itemsPerPage}
                                                    currentPage={itemsCurrentPage}
                                                    onPageChange={setItemsCurrentPage}
                                                    onItemsPerPageChange={(val) => {
                                                        setItemsPerPage(val);
                                                        setItemsCurrentPage(1);
                                                    }}
                                                    pageSizeOptions={[5, 10, 20, 50]}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "bom" && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 space-y-3 shadow-2xs">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-2 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-teal-600" />
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                Alokasi & Kebutuhan Bahan Baku
                                                Gudang
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-semibold text-slate-600">
                                                Status Auto-Potong:
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    invoice.cut_stock
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : "bg-slate-100 text-slate-600 border border-slate-200"
                                                }`}
                                            >
                                                {invoice.cut_stock
                                                    ? "Aktif"
                                                    : "Nonaktif"}
                                            </span>
                                        </div>
                                    </div>

                                    {aggregatedBOM.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-lg border border-slate-200">
                                            Item pesanan pada invoice ini belum
                                            memiliki konfigurasi resep bahan
                                            baku (BOM).
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Ringkasan Agregat Bahan Baku - Tabel */}
                                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                                                        <tr>
                                                            <th className="px-3 py-2 w-10 text-center">
                                                                No
                                                            </th>
                                                            <th className="px-3 py-2">
                                                                Bahan Baku
                                                            </th>
                                                            <th className="px-3 py-2">
                                                                Kode SKU
                                                            </th>
                                                            <th className="px-3 py-2 text-right">
                                                                Stok Gudang
                                                            </th>
                                                            <th className="px-3 py-2 text-right">
                                                                Total Kebutuhan
                                                            </th>
                                                            <th className="px-3 py-2 text-center w-32">
                                                                Status Stok
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                                                        {aggregatedBOM.map(
                                                            (mat, idx) => {
                                                                const isDeficit =
                                                                    mat.currentStock <
                                                                    mat.totalUsage;
                                                                const diff =
                                                                    mat.currentStock -
                                                                    mat.totalUsage;
                                                                return (
                                                                    <tr
                                                                        key={
                                                                            mat.id ||
                                                                            idx
                                                                        }
                                                                        className="hover:bg-slate-50/80 transition-colors"
                                                                    >
                                                                        <td className="px-3 py-1.5 text-center font-mono text-slate-400 text-[11px]">
                                                                            {idx +
                                                                                1}
                                                                        </td>
                                                                        <td className="px-3 py-1.5 font-bold text-slate-800">
                                                                            {
                                                                                mat.name
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-1.5 font-mono text-slate-500 text-[10px]">
                                                                            {
                                                                                mat.code
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-1.5 text-right font-mono font-semibold text-slate-700">
                                                                            {mat.currentStock.toLocaleString(
                                                                                "id-ID",
                                                                            )}{" "}
                                                                            {
                                                                                mat.unit
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-1.5 text-right font-mono font-extrabold text-teal-800">
                                                                            {mat.totalUsage.toLocaleString(
                                                                                "id-ID",
                                                                                {
                                                                                    maximumFractionDigits: 2,
                                                                                },
                                                                            )}{" "}
                                                                            {
                                                                                mat.unit
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-1.5 text-center">
                                                                            {isDeficit ? (
                                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                                                    <AlertTriangle className="w-3 h-3" />{" "}
                                                                                    Kurang{" "}
                                                                                    {Math.abs(
                                                                                        diff,
                                                                                    ).toLocaleString(
                                                                                        "id-ID",
                                                                                        {
                                                                                            maximumFractionDigits: 1,
                                                                                        },
                                                                                    )}{" "}
                                                                                    {
                                                                                        mat.unit
                                                                                    }
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                                    <CheckCircle2 className="w-3 h-3" />{" "}
                                                                                    Stok
                                                                                    Cukup
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            },
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Rincian Kebutuhan Bahan per Item & per Ukuran */}
                                            <div className="pt-2">
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                                                    <div className="p-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
                                                        <div className="flex items-center gap-2">
                                                            <Boxes className="w-4 h-4 text-teal-600" />
                                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                                Rincian Bahan per Ukuran Produk
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                                                {bomPerItem.length} Item
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="overflow-hidden">
                                                        <table className="w-full text-left border-collapse table-fixed text-[11px]">
                                                            <thead>
                                                                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                    <th className="py-2 px-2.5 w-[42%]">Item Produk</th>
                                                                    <th className="py-2 px-1.5 text-center w-[18%]">Target Qty</th>
                                                                    <th className="py-2 px-1.5 text-center w-[20%]">Varian Ukuran</th>
                                                                    <th className="py-2 px-2 text-center w-[20%]">Bahan Terhubung</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                                                {paginatedBomPerItem.map(
                                                                    (bomItem, bIdx) => {
                                                                        const isExpanded =
                                                                            !!expandedBOM[
                                                                                bomItem
                                                                                    .itemId
                                                                            ];
                                                                        return (
                                                                            <React.Fragment
                                                                                key={
                                                                                    bomItem.itemId ||
                                                                                    bIdx
                                                                                }
                                                                            >
                                                                                <tr className="hover:bg-slate-50/70 transition-colors">
                                                                                    <td
                                                                                        onClick={() =>
                                                                                            toggleBOMAccordion(
                                                                                                bomItem.itemId
                                                                                            )
                                                                                        }
                                                                                        className="py-2 px-2.5 align-middle cursor-pointer select-none"
                                                                                    >
                                                                                        <div className="flex items-start gap-1.5 min-w-0">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    toggleBOMAccordion(
                                                                                                        bomItem.itemId
                                                                                                    );
                                                                                                }}
                                                                                                className="p-0.5 mt-0.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer shrink-0"
                                                                                                title={
                                                                                                    isExpanded
                                                                                                        ? "Sembunyikan rincian"
                                                                                                        : "Lihat rincian"
                                                                                                }
                                                                                            >
                                                                                                <ChevronDown
                                                                                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                                                                                        isExpanded
                                                                                                            ? "rotate-180 text-teal-600"
                                                                                                            : ""
                                                                                                    }`}
                                                                                                />
                                                                                            </button>
                                                                                            <div className="min-w-0 flex-1">
                                                                                                <div
                                                                                                    className="font-semibold text-slate-900 truncate leading-tight"
                                                                                                    title={
                                                                                                        bomItem.itemName
                                                                                                    }
                                                                                                >
                                                                                                    {
                                                                                                        bomItem.itemName
                                                                                                    }
                                                                                                </div>
                                                                                                <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                                                                                                    Katalog:{" "}
                                                                                                    {
                                                                                                        bomItem.productName
                                                                                                    }
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="py-2 px-1.5 text-center whitespace-nowrap align-middle">
                                                                                        <span className="font-bold text-slate-800 font-mono">
                                                                                            {
                                                                                                bomItem.qty
                                                                                            }
                                                                                        </span>{" "}
                                                                                        <span className="text-[10px] text-slate-500">
                                                                                            {
                                                                                                bomItem.unit
                                                                                            }
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="py-2 px-1.5 text-center whitespace-nowrap align-middle">
                                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                                                            {
                                                                                                bomItem
                                                                                                    .sizeGroups
                                                                                                    .length
                                                                                            }{" "}
                                                                                            Ukuran
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="py-2 px-2 text-center whitespace-nowrap align-middle">
                                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                                                                                            {
                                                                                                bomItem
                                                                                                    .materials
                                                                                                    .length
                                                                                            }{" "}
                                                                                            Bahan Terhubung
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                                {isExpanded && (
                                                                                    <tr className="bg-slate-50/40">
                                                                                        <td
                                                                                            colSpan={4}
                                                                                            className="p-0 border-t border-slate-200/80"
                                                                                        >
                                                                                            {bomItem.sizeGroups.length === 0 ? (
                                                                                                <div className="py-2.5 px-4 text-center text-xs text-slate-400 bg-white">
                                                                                                    Item ini belum memiliki pemetaan resep bahan baku per ukuran.
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="divide-y divide-slate-200">
                                                                                                    {bomItem.sizeGroups.map((group, gIdx) => {
                                                                                                        const sizeKey = `${bomItem.itemId}_${group.size}`;
                                                                                                        const isSizeExpanded = !!expandedBOMSizes[sizeKey];
                                                                                                        return (
                                                                                                            <div key={gIdx} className="bg-white">
                                                                                                                <div
                                                                                                                    onClick={() => toggleBOMSize(sizeKey)}
                                                                                                                    className="py-2 px-3 bg-slate-100/75 border-b border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-200/60 transition-colors select-none"
                                                                                                                >
                                                                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                                                                        <div className="p-0.5 text-slate-500 shrink-0">
                                                                                                                            <ChevronDown
                                                                                                                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                                                                                                                    isSizeExpanded
                                                                                                                                        ? "rotate-180 text-teal-600"
                                                                                                                                        : "text-slate-400"
                                                                                                                                }`}
                                                                                                                            />
                                                                                                                        </div>
                                                                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                                                                            {group.category && (
                                                                                                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 uppercase font-sans">
                                                                                                                                    {group.category}
                                                                                                                                </span>
                                                                                                                            )}
                                                                                                                            <span className="text-xs font-bold text-slate-900">
                                                                                                                                {group.size === "Universal"
                                                                                                                                    ? "Semua Ukuran (Bahan Umum)"
                                                                                                                                    : `Ukuran ${group.size}`}
                                                                                                                            </span>
                                                                                                                            <span className="text-[11px] text-slate-500 font-mono">
                                                                                                                                &bull; Target:{" "}
                                                                                                                                <strong className="text-slate-700">
                                                                                                                                    {group.sizeQty} {bomItem.unit}
                                                                                                                                </strong>
                                                                                                                            </span>
                                                                                                                        </div>
                                                                                                                    </div>

                                                                                                                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs shrink-0">
                                                                                                                        {group.materials.length} Bahan
                                                                                                                    </span>
                                                                                                                </div>

                                                                                                                {isSizeExpanded && (
                                                                                                                    <table className="w-full text-left border-collapse table-fixed text-[10px] bg-white">
                                                                                                                        <thead>
                                                                                                                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                                                                                                                                <th className="py-1.5 pl-4 pr-2 w-[6%] text-center">No</th>
                                                                                                                                <th className="py-1.5 px-2 w-[28%]">Bahan Baku</th>
                                                                                                                                <th className="py-1.5 px-2 w-[16%]">Kode SKU</th>
                                                                                                                                <th className="py-1.5 px-2 text-center w-[12%]">Target Qty</th>
                                                                                                                                <th className="py-1.5 px-2 text-right w-[12%]">Kebutuhan / Unit</th>
                                                                                                                                <th className="py-1.5 px-2 text-right w-[13%]">Total Kebutuhan</th>
                                                                                                                                <th className="py-1.5 pr-4 pl-2 text-right w-[13%]">Stok Gudang</th>
                                                                                                                            </tr>
                                                                                                                        </thead>
                                                                                                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                                                                                                            {group.materials.map((mat, mIdx) => {
                                                                                                                                const isDeficit = mat.itemStock < mat.usageQty;
                                                                                                                                return (
                                                                                                                                    <tr key={mat.id || mIdx} className="hover:bg-slate-50/70 transition-colors">
                                                                                                                                        <td className="py-1.5 pl-4 pr-2 text-center font-mono text-slate-400 text-[10px] align-middle">
                                                                                                                                            {mIdx + 1}
                                                                                                                                        </td>
                                                                                                                                        <td className="py-1.5 px-2 font-bold text-slate-800 truncate align-middle" title={mat.name}>
                                                                                                                                            {mat.name}
                                                                                                                                        </td>
                                                                                                                                        <td className="py-1.5 px-2 font-mono text-slate-500 text-[10px] truncate align-middle">
                                                                                                                                            {mat.code}
                                                                                                                                        </td>
                                                                                                                                        <td className="py-1.5 px-2 text-center font-mono text-slate-700 align-middle">
                                                                                                                                            {group.sizeQty} {bomItem.unit}
                                                                                                                                        </td>
                                                                                                                                        <td className="py-1.5 px-2 text-right font-mono text-slate-600 align-middle">
                                                                                                                                            {mat.requiredPerUnit} {mat.unit}
                                                                                                                                        </td>
                                                                                                                                        <td className="py-1.5 px-2 text-right font-mono font-bold text-teal-800 align-middle">
                                                                                                                                            {mat.usageQty.toLocaleString("id-ID", { maximumFractionDigits: 2 })}{" "}
                                                                                                                                            {mat.unit}
                                                                                                                                        </td>
                                                                                                                                        <td className="py-1.5 pr-4 pl-2 text-right font-mono align-middle">
                                                                                                                                            <span className={isDeficit ? "text-rose-600 font-bold" : "text-slate-600"}>
                                                                                                                                                {mat.itemStock.toLocaleString("id-ID")}{" "}
                                                                                                                                                {mat.unit}
                                                                                                                                            </span>
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                );
                                                                                                                            })}
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        );
                                                                                                    })}
                                                                                                </div>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                )}
                                                                            </React.Fragment>
                                                                        );
                                                                    }
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {bomPerItem.length > 0 && (
                                                        <div className="border-t border-slate-200/80 bg-white [&_button]:w-7 [&_button]:h-7 [&_button]:text-[11px] [&>div]:px-3 [&>div]:py-2 text-[11px]">
                                                            <Pagination
                                                                totalItems={bomPerItem.length}
                                                                itemsPerPage={bomPerPage}
                                                                currentPage={bomCurrentPage}
                                                                onPageChange={setBomCurrentPage}
                                                                onItemsPerPageChange={(val) => {
                                                                    setBomPerPage(val);
                                                                    setBomCurrentPage(1);
                                                                }}
                                                                pageSizeOptions={[5, 10, 20, 50]}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "spk" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Scissors className="w-4 h-4 text-teal-600" />
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                            Daftar Surat Perintah Kerja (SPK)
                                        </h4>
                                    </div>

                                    {/* Trigger Popover Dropdown Form */}
<div className="relative">
    <button
        type="button"
        onClick={() => setShowSPKForm((prev) => !prev)}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-semibold rounded-lg border border-teal-200 shadow-2xs transition-all cursor-pointer"
    >
        <Plus className="w-3.5 h-3.5 text-teal-600" />
        <span>Penugasan</span>
    </button>

    {showSPKForm && (
        <>
            {/* Backdrop transparan penutup klik luar */}
            <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSPKForm(false)}
            />

            {/* Popover Card Dialog (Dua Grid Kolom) */}
            <div className="absolute right-0 top-full mt-2 w-[92vw] sm:w-[620px] max-w-[620px] bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header Popover */}
                <div className="grid grid-cols-[32px_1fr_32px] items-center gap-2 pb-2.5 mb-3 border-b border-slate-100">
                    <button
                        type="button"
                        onClick={() => setShowSPKForm(false)}
                        title="Batal"
                        className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md border border-slate-200 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-bold text-slate-900 text-center">
                        Tambah Penugasan SPK
                    </span>

                    <button
                        type="button"
                        onClick={handleCreateSPK}
                        title="Simpan Penugasan"
                        className="w-8 h-8 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-md border border-teal-700/20 shadow-2xs transition-colors cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                </div>

                {/* Grid 2 Kolom Konten */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
                    {/* KOLOM KIRI: Form Input Utama (Span 6) */}
                    <div className="md:col-span-6 space-y-2.5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Pilih Item Pesanan <span className="text-rose-500">*</span>
                            </label>
                            <SearchableSelect
                                value={spkForm.invoice_item_id}
                                onChange={(val) => {
                                    const selected = items.find((i) => String(i.id) === String(val));
                                    setSpkForm((prev) => ({
                                        ...prev,
                                        invoice_item_id: val,
                                        qty: selected?.qty || "",
                                        steps: [],
                                    }));
                                }}
                                options={spkItemOptions}
                                placeholder="-- Pilih Item Pesanan --"
                                searchPlaceholder="Cari item pesanan..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Karyawan / Penjahit <span className="text-rose-500">*</span>
                            </label>
                            <SearchableSelect
                                value={spkForm.user_id}
                                onChange={(val) =>
                                    setSpkForm((prev) => ({ ...prev, user_id: val }))
                                }
                                options={spkUserOptions}
                                placeholder="-- Pilih Karyawan --"
                                searchPlaceholder="Ketik nama karyawan..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Target Qty
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={spkForm.qty}
                                    onChange={(e) =>
                                        setSpkForm((prev) => ({ ...prev, qty: e.target.value }))
                                    }
                                    placeholder="0"
                                    className="w-full h-8 px-2.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Batas Waktu
                                </label>
                                <input
                                    type="date"
                                    value={spkForm.target_date}
                                    onChange={(e) =>
                                        setSpkForm((prev) => ({
                                            ...prev,
                                            target_date: e.target.value,
                                        }))
                                    }
                                    className="w-full h-8 px-2 text-[11px] border border-slate-300 rounded-lg bg-white shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN: Daftar Tahapan Kerja Borongan (Span 6) */}
                    <div className="md:col-span-6 space-y-1">
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700">
                                Tahapan Kerja Borongan:
                            </label>
                            {selectedItemForSPK?.product?.production_steps && (
                                <span className="text-[10px] font-mono text-slate-500">
                                    {spkForm.steps.length} dipilih
                                </span>
                            )}
                        </div>

                        {selectedItemForSPK?.product?.production_steps &&
                        selectedItemForSPK.product.production_steps.length > 0 ? (
                            <div className="h-[188px] overflow-y-auto space-y-1.5 p-2 bg-slate-50/70 rounded-lg border border-slate-200 shadow-2xs">
                                {selectedItemForSPK.product.production_steps.map((ps) => {
                                    const isChecked = spkForm.steps.some((s) => s.id === ps.id);
                                    return (
                                        <label
                                            key={ps.id}
                                            className={`p-2 rounded-md border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                                isChecked
                                                    ? "bg-teal-50 border-teal-300 text-teal-950 font-semibold shadow-2xs"
                                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        setSpkForm((prev) => {
                                                            const exists = prev.steps.find(
                                                                (s) => s.id === ps.id
                                                            );
                                                            if (exists) {
                                                                return {
                                                                    ...prev,
                                                                    steps: prev.steps.filter(
                                                                        (s) => s.id !== ps.id
                                                                    ),
                                                                };
                                                            }
                                                            return {
                                                                ...prev,
                                                                steps: [
                                                                    ...prev.steps,
                                                                    {
                                                                        id: ps.id,
                                                                        qty:
                                                                            prev.qty ||
                                                                            selectedItemForSPK.qty ||
                                                                            1,
                                                                    },
                                                                ],
                                                            };
                                                        });
                                                    }}
                                                    className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-600 shrink-0"
                                                />
                                                <span className="truncate leading-tight text-[11px]">
                                                    {ps.production_step?.name || ps.custom_name}
                                                </span>
                                            </div>
                                            <span className="font-mono text-[10px] text-teal-800 font-bold shrink-0">
                                                {formatCurrency(ps.wage)}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-[188px] flex items-center justify-center p-4 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
                                {spkForm.invoice_item_id
                                    ? "Item ini tidak memiliki tahapan kerja borongan."
                                    : "Pilih item pesanan terlebih dahulu."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )}
</div>
                                </div>

                                {totalAssignments === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-xs bg-slate-50/50 rounded-lg border border-slate-200">
                                        Belum ada surat perintah kerja (SPK)
                                        yang ditugaskan untuk invoice ini.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {assignmentsByEmployee.map((emp) => {
                                            const isEmpExpanded = !!expandedEmployees[emp.employeeId];
                                            const empPage = spkEmpPages[emp.employeeId] || 1;
                                            const empPageSize = spkEmpPageSizes[emp.employeeId] || 5;
                                            const totalEmpItems = emp.assignments.length;
                                            const totalEmpPages = Math.ceil(totalEmpItems / empPageSize) || 1;
                                            const currentEmpPage = Math.min(empPage, totalEmpPages);
                                            const startIdx = (currentEmpPage - 1) * empPageSize;
                                            const paginatedAssignments = emp.assignments.slice(
                                                startIdx,
                                                startIdx + empPageSize
                                            );
                                            return (
                                                <div
                                                    key={emp.employeeId}
                                                    className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <div
                                                            onClick={() => toggleEmployeeAccordion(emp.employeeId)}
                                                            className={`p-3.5 bg-slate-50/80 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/80 transition-colors select-none ${
                                                                isEmpExpanded ? "border-b border-slate-200/80" : ""
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200 shadow-2xs shrink-0">
                                                                    {emp.employeeName
                                                                        .charAt(0)
                                                                        .toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <h5 className="font-bold text-xs text-slate-900 truncate">
                                                                            {emp.employeeName}
                                                                        </h5>
                                                                        <span
                                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${emp.statusStyle}`}
                                                                        >
                                                                            {emp.employeeStatus}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[11px] text-slate-500 truncate block">
                                                                        {emp.assignments.length} Item Pesanan &bull; Target: {emp.totalTargetQty} Pcs
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <div className="text-right">
                                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                                        Total Upah
                                                                    </div>
                                                                    <div className="font-mono font-bold text-xs text-teal-800 bg-teal-50/80 px-2 py-0.5 rounded border border-teal-200/60">
                                                                        {formatCurrency(emp.totalWage)}
                                                                    </div>
                                                                </div>
                                                                <div className="p-1 rounded bg-white border border-slate-200 shadow-2xs text-slate-500 shrink-0">
                                                                    <ChevronDown
                                                                        className={`w-4 h-4 transition-transform duration-200 ${
                                                                            isEmpExpanded
                                                                                ? "rotate-180 text-teal-600"
                                                                                : "text-slate-400"
                                                                        }`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isEmpExpanded && (
                                                            <>
                                                                {emp.totalSteps > 0 && (
                                                                    <div className="px-3.5 pt-2.5 pb-1 bg-white">
                                                                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-medium">
                                                                            <span>Kemajuan Tahapan Kerja</span>
                                                                            <span className="font-mono font-semibold text-slate-700">
                                                                                {emp.completedSteps} / {emp.totalSteps} Selesai ({Math.round((emp.completedSteps / emp.totalSteps) * 100)}%)
                                                                            </span>
                                                                        </div>
                                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                            <div
                                                                                className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                                                                                style={{
                                                                                    width: `${Math.round((emp.completedSteps / emp.totalSteps) * 100)}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="overflow-hidden">
                                                                    <table className="w-full text-left border-collapse table-fixed text-[11px]">
                                                                        <thead>
                                                                            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                                <th className="py-2 px-2.5 w-[38%]">Item Pesanan</th>
                                                                                <th className="py-2 px-1.5 text-center w-[18%]">Target</th>
                                                                                <th className="py-2 px-1.5 text-center w-[20%]">Batas Waktu</th>
                                                                                <th className="py-2 px-1 text-center w-[16%]">Status</th>
                                                                                <th className="py-2 px-1 text-center w-[8%]">Aksi</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                                                            {paginatedAssignments.map((assignment) => {
                                                                                const isExpanded =
                                                                                    !!expandedSPK[assignment.id];
                                                                                const asStatus =
                                                                                    formatIndonesianStatus(assignment.status);
                                                                                const hasSteps =
                                                                                    (assignment.steps || []).length > 0;
                                                                                return (
                                                                                    <React.Fragment key={assignment.id}>
                                                                                        <tr className="hover:bg-slate-50/70 transition-colors">
                                                                                            <td
                                                                                                onClick={() =>
                                                                                                    hasSteps &&
                                                                                                    toggleSPKAccordion(assignment.id)
                                                                                                }
                                                                                                className={`py-2 px-2.5 align-middle ${
                                                                                                    hasSteps
                                                                                                        ? "cursor-pointer select-none"
                                                                                                        : ""
                                                                                                }`}
                                                                                            >
                                                                                                <div className="flex items-start gap-1.5 min-w-0">
                                                                                                    {hasSteps && (
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={(e) => {
                                                                                                                e.stopPropagation();
                                                                                                                toggleSPKAccordion(
                                                                                                                    assignment.id
                                                                                                                );
                                                                                                            }}
                                                                                                            className="p-0.5 mt-0.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer shrink-0"
                                                                                                            title={
                                                                                                                isExpanded
                                                                                                                    ? "Sembunyikan tahapan kerja"
                                                                                                                    : "Lihat tahapan kerja"
                                                                                                            }
                                                                                                        >
                                                                                                            <ChevronDown
                                                                                                                className={`w-3 h-3 transition-transform duration-200 ${
                                                                                                                    isExpanded
                                                                                                                        ? "rotate-180 text-teal-600"
                                                                                                                        : ""
                                                                                                                }`}
                                                                                                            />
                                                                                                        </button>
                                                                                                    )}
                                                                                                    <div className="min-w-0 flex-1">
                                                                                                        <div
                                                                                                            className="font-semibold text-slate-900 truncate leading-tight"
                                                                                                            title={assignment.item_name}
                                                                                                        >
                                                                                                            {assignment.item_name}
                                                                                                        </div>
                                                                                                        {hasSteps && (
                                                                                                            <div className="text-[9px] text-slate-400 mt-0.5">
                                                                                                                {assignment.steps.length} tahapan kerja
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </td>
                                                                                            <td className="py-2 px-1.5 text-center whitespace-nowrap align-middle">
                                                                                                <span className="font-bold text-slate-800 font-mono">
                                                                                                    {assignment.qty}
                                                                                                </span>{" "}
                                                                                                <span className="text-[10px] text-slate-500">
                                                                                                    {assignment.item_unit}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="py-2 px-1.5 text-center whitespace-nowrap font-mono text-[10px] text-slate-600 align-middle">
                                                                                                {assignment.target_date
                                                                                                    ? formatDate(
                                                                                                          assignment.target_date
                                                                                                      )
                                                                                                    : "-"}
                                                                                            </td>
                                                                                            <td className="py-2 px-1 text-center whitespace-nowrap align-middle">
                                                                                                <span
                                                                                                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold border ${asStatus.badgeClass}`}
                                                                                                >
                                                                                                    {asStatus.label}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="py-2 px-1 text-center whitespace-nowrap align-middle">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() =>
                                                                                                        handleDeleteSPK(
                                                                                                            assignment.id
                                                                                                        )
                                                                                                    }
                                                                                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition-colors cursor-pointer inline-flex items-center justify-center"
                                                                                                    title="Hapus Penugasan SPK"
                                                                                                >
                                                                                                    <Trash2 className="w-3 h-3" />
                                                                                                </button>
                                                                                            </td>
                                                                                        </tr>
                                                                                        {isExpanded && hasSteps && (
                                                                                            <tr className="bg-slate-50/40">
                                                                                                <td
                                                                                                    colSpan={5}
                                                                                                    className="p-0 border-t border-slate-200/80"
                                                                                                >
                                                                                                    <table className="w-full text-left border-collapse table-fixed text-[10px] bg-white">
                                                                                                        <thead>
                                                                                                            <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                                                                                                                <th className="py-1.5 pl-8 pr-2 w-[38%]">Tahapan Kerja</th>
                                                                                                                <th className="py-1.5 px-1.5 text-center w-[16%]">Qty</th>
                                                                                                                <th className="py-1.5 px-1.5 text-right w-[15%]">Tarif</th>
                                                                                                                <th className="py-1.5 px-1.5 text-right w-[15%]">Upah</th>
                                                                                                                <th className="py-1.5 px-1 text-center w-[16%]">Status</th>
                                                                                                            </tr>
                                                                                                        </thead>
                                                                                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                                                                                            {assignment.steps.map(
                                                                                                                (step) => {
                                                                                                                    const stepQty =
                                                                                                                        step.qty ||
                                                                                                                        assignment.qty ||
                                                                                                                        1;
                                                                                                                    const stepWage =
                                                                                                                        Number(
                                                                                                                            step.wage
                                                                                                                        ) || 0;
                                                                                                                    const stepStatus =
                                                                                                                        formatIndonesianStatus(
                                                                                                                            step.status
                                                                                                                        );
                                                                                                                    return (
                                                                                                                        <tr
                                                                                                                            key={
                                                                                                                                step.id
                                                                                                                            }
                                                                                                                            className="hover:bg-slate-50/70"
                                                                                                                        >
                                                                                                                            <td
                                                                                                                                className="py-1.5 pl-8 pr-2 font-medium text-slate-800 truncate align-middle"
                                                                                                                                title={
                                                                                                                                    step.step_name
                                                                                                                                }
                                                                                                                            >
                                                                                                                                {step.step_name}
                                                                                                                            </td>
                                                                                                                            <td className="py-1.5 px-1.5 text-center whitespace-nowrap font-mono text-slate-600 align-middle">
                                                                                                                                {stepQty}{" "}
                                                                                                                                {assignment.item_unit}
                                                                                                                            </td>
                                                                                                                            <td className="py-1.5 px-1.5 text-right whitespace-nowrap font-mono text-slate-500 align-middle">
                                                                                                                                {formatCurrency(
                                                                                                                                    stepWage
                                                                                                                                )}
                                                                                                                            </td>
                                                                                                                            <td className="py-1.5 px-1.5 text-right whitespace-nowrap font-mono font-bold text-teal-800 align-middle">
                                                                                                                                {formatCurrency(
                                                                                                                                    stepQty *
                                                                                                                                        stepWage
                                                                                                                                )}
                                                                                                                            </td>
                                                                                                                            <td className="py-1.5 px-1 text-center whitespace-nowrap align-middle">
                                                                                                                                <span
                                                                                                                                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold border ${stepStatus.badgeClass}`}
                                                                                                                                >
                                                                                                                                    {stepStatus.label}
                                                                                                                                </span>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    );
                                                                                                                }
                                                                                                            )}
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                </td>
                                                                                            </tr>
                                                                                        )}
                                                                                    </React.Fragment>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {isEmpExpanded && totalEmpItems > 0 && (
                                                        <div className="border-t border-slate-200/80 bg-white [&_button]:w-7 [&_button]:h-7 [&_button]:text-[11px] [&>div]:px-3 [&>div]:py-2 text-[11px]">
                                                            <Pagination
                                                                totalItems={totalEmpItems}
                                                                itemsPerPage={empPageSize}
                                                                currentPage={currentEmpPage}
                                                                onPageChange={(page) =>
                                                                    setSpkEmpPages((prev) => ({
                                                                        ...prev,
                                                                        [emp.employeeId]: page,
                                                                    }))
                                                                }
                                                                onItemsPerPageChange={(size) => {
                                                                    setSpkEmpPageSizes((prev) => ({
                                                                        ...prev,
                                                                        [emp.employeeId]: size,
                                                                    }));
                                                                    setSpkEmpPages((prev) => ({
                                                                        ...prev,
                                                                        [emp.employeeId]: 1,
                                                                    }));
                                                                }}
                                                                pageSizeOptions={[5, 10, 20]}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}