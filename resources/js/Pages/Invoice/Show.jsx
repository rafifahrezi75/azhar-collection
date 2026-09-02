import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
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
}) {
    const [invoice, setInvoice] = useState(initialInvoice);
    const [users, setUsers] = useState(initialUsers);
    const [activeTab, setActiveTab] = useState("info");
    const [expandedItems, setExpandedItems] = useState({});
    const [expandedBOM, setExpandedBOM] = useState({});
    const [expandedSPK, setExpandedSPK] = useState({});

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

    const toggleSPKAccordion = useCallback((assignmentId) => {
        setExpandedSPK((prev) => ({
            ...prev,
            [assignmentId]: !prev[assignmentId],
        }));
    }, []);

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

    const parseItemSizes = useCallback((item) => {
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
                    const qty = Number(entry.qty) || 0;
                    const price =
                        Number(entry.price) || Number(item.unit_price) || 0;
                    if (qty > 0) {
                        result.push({
                            size: sizeName,
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
                    const qty = Number(v.qty) || 0;
                    const price =
                        Number(v.price) || Number(item.unit_price) || 0;
                    if (qty > 0) {
                        result.push({
                            size: v.size || k,
                            qty,
                            price,
                            subtotal: qty * price,
                        });
                    }
                } else {
                    const qty = Number(v) || 0;
                    const price = Number(item.unit_price) || 0;
                    if (qty > 0) {
                        result.push({
                            size: k,
                            qty,
                            price,
                            subtotal: qty * price,
                        });
                    }
                }
            });
        }
        return result;
    }, []);

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
    const totalAssignments = useMemo(
        () => items.flatMap((i) => i.production_assignments || []).length,
        [items],
    );

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
                            if (typeof v === "object" && v.size && v.qty) {
                                breakdownMap[v.size] = Number(v.qty) || 0;
                            } else {
                                breakdownMap[k] = Number(v) || 0;
                            }
                        });
                    }
                }

                if (prod && prod.materials) {
                    if (Object.keys(breakdownMap).length > 0) {
                        Object.entries(breakdownMap).forEach(
                            ([sizeName, sizeQty]) => {
                                if (sizeQty <= 0) return;

                                let sizeMaterials = prod.materials.filter(
                                    (m) => m.size_name === sizeName,
                                );
                                if (sizeMaterials.length === 0) {
                                    sizeMaterials = prod.materials.filter(
                                        (m) =>
                                            !m.size_name ||
                                            m.size_name === "ALL",
                                    );
                                }

                                sizeMaterials.forEach((mat) => {
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
                            },
                        );
                    } else if (lineQty > 0) {
                        prod.materials.forEach((mat) => {
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
        [items],
    );

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
                                    title="Kembali ke Daftar Invoice"
                                    onClick={() =>
                                        router.visit("/dashboard/invoice")
                                    }
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
                                        onClick={() =>
                                            router.visit(
                                                `/dashboard/invoice/${invoice.id}/print-preview`,
                                            )
                                        }
                                        className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-semibold rounded-lg border border-teal-200 shadow-2xs transition-all cursor-pointer"
                                        title="Cetak Nota Dokumen"
                                    >
                                        <Receipt className="w-3.5 h-3.5 text-teal-600" />
                                        <span>Cetak Nota</span>
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

                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                                                    invoice.payment_status ===
                                                    "LUNAS"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : invoice.payment_status ===
                                                            "DP"
                                                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                          : "bg-rose-50 text-rose-700 border border-rose-200"
                                                }`}
                                            >
                                                {invoice.payment_status ===
                                                "LUNAS" ? (
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                ) : (
                                                    <AlertTriangle className="w-3 h-3" />
                                                )}
                                                {invoice.payment_status ||
                                                    "BELUM_LUNAS"}
                                            </span>
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
                                    <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 space-y-3 shadow-2xs">
                                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                            <div className="flex items-center gap-2">
                                                <Receipt className="w-4 h-4 text-teal-600" />
                                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                    Rincian Item & Spesifikasi
                                                    Ukuran
                                                </h4>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                                {items.reduce(
                                                    (sum, it) =>
                                                        sum +
                                                        (Number(it.qty) || 0),
                                                    0,
                                                )}{" "}
                                                Total Pcs
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {items.map((item, idx) => {
                                                const sizesList =
                                                    parseItemSizes(item);
                                                const isExpanded =
                                                    !!expandedItems[item.id];
                                                return (
                                                    <div
                                                        key={item.id || idx}
                                                        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
                                                    >
                                                        <div
                                                            onClick={() =>
                                                                toggleItemAccordion(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="p-1 rounded bg-white border border-slate-200 shadow-2xs text-slate-500 shrink-0">
                                                                    <ChevronDown
                                                                        className={`w-4 h-4 transition-transform duration-200 ${
                                                                            isExpanded
                                                                                ? "rotate-180 text-teal-600"
                                                                                : "text-slate-400"
                                                                        }`}
                                                                    />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                                                                        {
                                                                            item.item_name
                                                                        }
                                                                    </h5>
                                                                    {item.description && (
                                                                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                                            {
                                                                                item.description
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                                                <div className="text-left sm:text-right">
                                                                    <span className="font-bold text-xs sm:text-sm text-slate-900 font-mono block">
                                                                        {formatCurrency(
                                                                            item.subtotal,
                                                                        )}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-500 block font-mono">
                                                                        {
                                                                            item.qty
                                                                        }{" "}
                                                                        {item.unit ||
                                                                            "Pcs"}{" "}
                                                                        &times;{" "}
                                                                        {formatCurrency(
                                                                            item.unit_price,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div>
                                                                {sizesList.length >
                                                                0 ? (
                                                                    <div className="overflow-x-auto">
                                                                        <table className="w-full text-left text-xs">
                                                                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                                                                                <tr>
                                                                                    <th className="px-3 py-2">
                                                                                        Ukuran
                                                                                    </th>
                                                                                    <th className="px-3 py-2 text-center">
                                                                                        Kuantitas
                                                                                    </th>
                                                                                    <th className="px-3 py-2 text-right">
                                                                                        Harga
                                                                                        Satuan
                                                                                    </th>
                                                                                    <th className="px-3 py-2 text-right">
                                                                                        Subtotal
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-100 bg-white font-medium">
                                                                                {sizesList.map(
                                                                                    (
                                                                                        sz,
                                                                                        sIdx,
                                                                                    ) => (
                                                                                        <tr
                                                                                            key={
                                                                                                sIdx
                                                                                            }
                                                                                            className="hover:bg-slate-50/80 transition-colors"
                                                                                        >
                                                                                            <td className="px-3 py-1.5 font-bold text-slate-800">
                                                                                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700">
                                                                                                    {
                                                                                                        sz.size
                                                                                                    }
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="px-3 py-1.5 text-center font-mono text-slate-800">
                                                                                                {
                                                                                                    sz.qty
                                                                                                }{" "}
                                                                                                {item.unit ||
                                                                                                    "Pcs"}
                                                                                            </td>
                                                                                            <td className="px-3 py-1.5 text-right font-mono text-slate-600">
                                                                                                {formatCurrency(
                                                                                                    sz.price,
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="px-3 py-1.5 text-right font-bold text-slate-900 font-mono">
                                                                                                {formatCurrency(
                                                                                                    sz.subtotal,
                                                                                                )}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ),
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-3 text-center text-xs text-slate-400 bg-white">
                                                                        Tidak
                                                                        ada
                                                                        rincian
                                                                        spesifikasi
                                                                        ukuran
                                                                        khusus
                                                                        untuk
                                                                        item
                                                                        ini.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
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
                                            {/* Ringkasan Agregat Bahan Baku */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {aggregatedBOM.map((mat) => {
                                                    const isDeficit =
                                                        mat.currentStock <
                                                        mat.totalUsage;
                                                    return (
                                                        <div
                                                            key={mat.id}
                                                            className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs flex flex-col justify-between"
                                                        >
                                                            <div className="border-b border-slate-100 pb-2 mb-2">
                                                                <span className="font-bold text-slate-900 block text-xs truncate">
                                                                    {mat.name}
                                                                </span>
                                                                <span className="font-mono text-[10px] text-slate-500 block">
                                                                    SKU:{" "}
                                                                    {mat.code}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <div className="p-2 bg-slate-50 rounded border border-slate-200/80">
                                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block">
                                                                        Stok
                                                                        Gudang
                                                                    </span>
                                                                    <span
                                                                        className={`font-mono font-extrabold text-sm block mt-0.5 ${
                                                                            isDeficit
                                                                                ? "text-rose-600"
                                                                                : "text-slate-800"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            mat.currentStock
                                                                        }{" "}
                                                                        {
                                                                            mat.unit
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="p-2 bg-teal-50/70 rounded border border-teal-200/80">
                                                                    <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wide block">
                                                                        Total
                                                                        Butuh
                                                                    </span>
                                                                    <span className="font-mono font-extrabold text-teal-950 text-sm block mt-0.5">
                                                                        {mat.totalUsage.toLocaleString(
                                                                            "id-ID",
                                                                            {
                                                                                maximumFractionDigits: 2,
                                                                            },
                                                                        )}{" "}
                                                                        {
                                                                            mat.unit
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Rincian Kebutuhan Bahan per Item & per Ukuran */}
                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                                                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Boxes className="w-3.5 h-3.5 text-teal-600" />
                                                        Rincian Bahan per Ukuran
                                                        Produk
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-500">
                                                        Klik item untuk
                                                        buka/tutup rincian
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    {bomPerItem.map(
                                                        (bomItem, bIdx) => {
                                                            const isExpanded =
                                                                !!expandedBOM[
                                                                    bomItem
                                                                        .itemId
                                                                ];
                                                            return (
                                                                <div
                                                                    key={
                                                                        bomItem.itemId ||
                                                                        bIdx
                                                                    }
                                                                    className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
                                                                >
                                                                    <div
                                                                        onClick={() =>
                                                                            toggleBOMAccordion(
                                                                                bomItem.itemId,
                                                                            )
                                                                        }
                                                                        className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
                                                                    >
                                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                                            <div className="p-1 rounded bg-white border border-slate-200 shadow-2xs text-slate-500 shrink-0">
                                                                                <ChevronDown
                                                                                    className={`w-4 h-4 transition-transform duration-200 ${
                                                                                        isExpanded
                                                                                            ? "rotate-180 text-teal-600"
                                                                                            : "text-slate-400"
                                                                                    }`}
                                                                                />
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                                                                                    {
                                                                                        bomItem.itemName
                                                                                    }
                                                                                </h5>
                                                                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                                                    Katalog:{" "}
                                                                                    {
                                                                                        bomItem.productName
                                                                                    }{" "}
                                                                                    &bull;{" "}
                                                                                    {
                                                                                        bomItem
                                                                                            .materials
                                                                                            .length
                                                                                    }{" "}
                                                                                    Bahan
                                                                                    Terhubung
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs self-start sm:self-auto">
                                                                            {
                                                                                bomItem.qty
                                                                            }{" "}
                                                                            {
                                                                                bomItem.unit
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    {isExpanded && (
                                                                        <div className="p-3.5 space-y-3 bg-slate-50/30">
                                                                            {bomItem
                                                                                .sizeGroups
                                                                                .length ===
                                                                            0 ? (
                                                                                <p className="text-xs text-slate-400 text-center py-2">
                                                                                    Item
                                                                                    ini
                                                                                    belum
                                                                                    memiliki
                                                                                    pemetaan
                                                                                    resep
                                                                                    bahan
                                                                                    baku
                                                                                    per
                                                                                    ukuran.
                                                                                </p>
                                                                            ) : (
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                                    {bomItem.sizeGroups.map(
                                                                                        (
                                                                                            group,
                                                                                            gIdx,
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    gIdx
                                                                                                }
                                                                                                className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs space-y-2.5 flex flex-col justify-between"
                                                                                            >
                                                                                                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                                                                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200/80 shadow-2xs">
                                                                                                        {group.size ===
                                                                                                        "Universal"
                                                                                                            ? "Semua Ukuran"
                                                                                                            : `Ukuran ${group.size}`}
                                                                                                    </span>
                                                                                                    <span className="text-[10px] font-mono font-semibold text-slate-500">
                                                                                                        {
                                                                                                            group.sizeQty
                                                                                                        }{" "}
                                                                                                        {
                                                                                                            bomItem.unit
                                                                                                        }
                                                                                                    </span>
                                                                                                </div>

                                                                                                <div className="space-y-2">
                                                                                                    {group.materials.map(
                                                                                                        (
                                                                                                            mat,
                                                                                                            mIdx,
                                                                                                        ) => {
                                                                                                            const isDeficit =
                                                                                                                mat.itemStock <
                                                                                                                mat.usageQty;
                                                                                                            return (
                                                                                                                <div
                                                                                                                    key={
                                                                                                                        mat.id ||
                                                                                                                        mIdx
                                                                                                                    }
                                                                                                                    className="p-2 bg-slate-50/70 rounded border border-slate-200/80 shadow-2xs space-y-1.5 text-xs"
                                                                                                                >
                                                                                                                    <div className="flex items-start justify-between gap-1">
                                                                                                                        <div className="min-w-0">
                                                                                                                            <span className="font-bold text-slate-900 block truncate leading-tight text-[11px]">
                                                                                                                                {
                                                                                                                                    mat.name
                                                                                                                                }
                                                                                                                            </span>
                                                                                                                            <span className="font-mono text-[9px] text-slate-500 block">
                                                                                                                                {
                                                                                                                                    mat.code
                                                                                                                                }
                                                                                                                            </span>
                                                                                                                        </div>
                                                                                                                        <span className="font-mono font-bold text-teal-800 text-xs shrink-0">
                                                                                                                            {mat.usageQty.toLocaleString(
                                                                                                                                "id-ID",
                                                                                                                                {
                                                                                                                                    maximumFractionDigits: 2,
                                                                                                                                },
                                                                                                                            )}{" "}
                                                                                                                            {
                                                                                                                                mat.unit
                                                                                                                            }
                                                                                                                        </span>
                                                                                                                    </div>

                                                                                                                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                                                                                                                        <span>
                                                                                                                            Stok
                                                                                                                            Gudang:
                                                                                                                        </span>
                                                                                                                        <span
                                                                                                                            className={`font-mono font-semibold ${
                                                                                                                                isDeficit
                                                                                                                                    ? "text-rose-600 font-bold"
                                                                                                                                    : "text-slate-700"
                                                                                                                            }`}
                                                                                                                        >
                                                                                                                            {
                                                                                                                                mat.itemStock
                                                                                                                            }{" "}
                                                                                                                            {
                                                                                                                                mat.unit
                                                                                                                            }
                                                                                                                            {isDeficit &&
                                                                                                                                " (Kurang)"}
                                                                                                                        </span>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            );
                                                                                                        },
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        },
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
        <span>Tambah Penugasan</span>
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
                            <select
                                value={spkForm.invoice_item_id}
                                onChange={(e) => {
                                    const itemId = e.target.value;
                                    const selected = items.find((i) => i.id == itemId);
                                    setSpkForm((prev) => ({
                                        ...prev,
                                        invoice_item_id: itemId,
                                        qty: selected?.qty || "",
                                        steps: [],
                                    }));
                                }}
                                className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800 shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            >
                                <option value="">-- Pilih Item Pesanan --</option>
                                {items.map((i) => (
                                    <option key={i.id} value={i.id}>
                                        {i.item_name} ({i.qty} {i.unit})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Karyawan / Penjahit <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={spkForm.user_id}
                                onChange={(e) =>
                                    setSpkForm((prev) => ({ ...prev, user_id: e.target.value }))
                                }
                                className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800 shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            >
                                <option value="">-- Pilih Karyawan --</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
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

                                {/* DAFTAR PENUGASAN SPK */}
                                {totalAssignments === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-xs bg-slate-50/50 rounded-lg border border-slate-200">
                                        Belum ada surat perintah kerja (SPK)
                                        yang ditugaskan untuk invoice ini.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {items.map((item) =>
                                            (
                                                item.production_assignments ||
                                                []
                                            ).map((assignment) => {
                                                const isExpanded =
                                                    !!expandedSPK[
                                                        assignment.id
                                                    ];
                                                return (
                                                    <div
                                                        key={assignment.id}
                                                        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
                                                    >
                                                        <div
                                                            onClick={() =>
                                                                toggleSPKAccordion(
                                                                    assignment.id,
                                                                )
                                                            }
                                                            className="p-3 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="p-1 rounded bg-white border border-slate-200 shadow-2xs text-slate-500 shrink-0">
                                                                    <ChevronDown
                                                                        className={`w-4 h-4 transition-transform duration-200 ${
                                                                            isExpanded
                                                                                ? "rotate-180 text-teal-600"
                                                                                : "text-slate-400"
                                                                        }`}
                                                                    />
                                                                </div>
                                                                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200/80 shadow-2xs shrink-0">
                                                                    {(
                                                                        assignment
                                                                            .assignee
                                                                            ?.name ||
                                                                        "K"
                                                                    )
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="font-bold text-xs text-slate-900">
                                                                            {assignment
                                                                                .assignee
                                                                                ?.name ||
                                                                                "Karyawan"}
                                                                        </span>
                                                                        <span
                                                                            className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                                                                                assignment.status ===
                                                                                    "SELESAI" ||
                                                                                assignment.status ===
                                                                                    "completed"
                                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                                    : assignment.status ===
                                                                                            "IN_PROGRESS" ||
                                                                                        assignment.status ===
                                                                                            "in_progress"
                                                                                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                                                                      : "bg-slate-100 text-slate-600 border border-slate-200"
                                                                            }`}
                                                                        >
                                                                            {assignment.status ||
                                                                                "PENDING"}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[11px] text-slate-500 truncate block">
                                                                        {
                                                                            item.item_name
                                                                        }{" "}
                                                                        &bull;
                                                                        Target:{" "}
                                                                        {
                                                                            assignment.qty
                                                                        }{" "}
                                                                        {
                                                                            item.unit
                                                                        }{" "}
                                                                        &bull;
                                                                        Batas:{" "}
                                                                        {assignment.target_date
                                                                            ? formatDate(
                                                                                  assignment.target_date,
                                                                              )
                                                                            : "-"}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteSPK(
                                                                        assignment.id,
                                                                    );
                                                                }}
                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200 transition-colors cursor-pointer self-end sm:self-auto shrink-0"
                                                                title="Hapus Penugasan SPK"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="p-3 bg-white">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                                    {(
                                                                        assignment.steps ||
                                                                        []
                                                                    ).map(
                                                                        (
                                                                            step,
                                                                        ) => {
                                                                            const stepQty =
                                                                                step.qty ||
                                                                                assignment.qty ||
                                                                                item.qty;
                                                                            const stepWage =
                                                                                Number(
                                                                                    step.wage,
                                                                                ) ||
                                                                                0;
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        step.id
                                                                                    }
                                                                                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                                                                                >
                                                                                    <div className="flex items-center justify-between gap-1 mb-1">
                                                                                        <span className="font-semibold text-xs text-slate-800 truncate">
                                                                                            {
                                                                                                step.step_name
                                                                                            }
                                                                                        </span>
                                                                                        <span
                                                                                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                                                                                step.status ===
                                                                                                    "SELESAI" ||
                                                                                                step.status ===
                                                                                                    "completed"
                                                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                                                    : step.status ===
                                                                                                            "IN_PROGRESS" ||
                                                                                                        step.status ===
                                                                                                            "in_progress"
                                                                                                      ? "bg-indigo-100 text-indigo-800"
                                                                                                      : "bg-slate-200 text-slate-600"
                                                                                            }`}
                                                                                        >
                                                                                            {step.status ||
                                                                                                "PENDING"}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/80">
                                                                                        <span>
                                                                                            {
                                                                                                stepQty
                                                                                            }{" "}
                                                                                            {
                                                                                                item.unit
                                                                                            }{" "}
                                                                                            &times;{" "}
                                                                                            {formatCurrency(
                                                                                                stepWage,
                                                                                            )}
                                                                                        </span>
                                                                                        <span className="font-mono font-bold text-teal-800">
                                                                                            {formatCurrency(
                                                                                                stepQty *
                                                                                                    stepWage,
                                                                                            )}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }),
                                        )}
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