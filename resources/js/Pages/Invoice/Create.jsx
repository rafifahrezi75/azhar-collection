import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import CustomerModal from "@/Components/CustomerModal";
import SizeBreakdownModal from "@/Components/SizeBreakdownModal";
import SearchableSelect from "@/Components/SearchableSelect";
import { Toast } from "@/utils/sweetalert";
import {
    Receipt,
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    Calendar,
    DollarSign,
    Layers,
    UserPlus,
    Clock,
    Zap,
    Shirt,
    Ruler,
    ChevronDown,
    Building2,
    Scissors,
    User,
    X,
} from "lucide-react";

export default function Create({ initialType = "REGULAR", users: initialUsers = [] }) {
    const [orderType, setOrderType] = useState(initialType || "REGULAR");
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingMasters, setLoadingMasters] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showBOMDrawer, setShowBOMDrawer] = useState(false);

    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [customerForm, setCustomerForm] = useState({
        code: "",
        name: "",
        type: "Sekolah / Pendidikan",
        institution_name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
        is_active: true,
    });

    const [activeItemIndexForSize, setActiveItemIndexForSize] = useState(null);

    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [completionDate, setCompletionDate] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("DP");
    const [productionStatus, setProductionStatus] = useState("PROSES");
    const [cutStock, setCutStock] = useState(true);
    const [discount, setDiscount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [notes, setNotes] = useState("");

    const [items, setItems] = useState([
        {
            product_id: "",
            item_name: "",
            unit: "Stel",
            qty: 1,
            unit_price: 0,
            subtotal: 0,
            size_breakdown: {},
            description: "",
        },
    ]);

    const [users, setUsers] = useState(initialUsers || []);
    const [showSpkSection, setShowSpkSection] = useState(false);
    const [spkDrafts, setSpkDrafts] = useState([]);
    const [spkForm, setSpkForm] = useState({ item_index: "", user_id: "", qty: "", target_date: "", steps: [] });

    const handleSwitchMode = (newType) => {
        setOrderType(newType);
        if (newType === "HISTORICAL") {
            setPaymentStatus("LUNAS");
            setProductionStatus("SELESAI");
            setCutStock(false);
            if (!completionDate) setCompletionDate(orderDate);
        } else {
            setPaymentStatus("DP");
            setProductionStatus("PROSES");
            setCutStock(true);
            setOrderDate(new Date().toISOString().split("T")[0]);
        }
    };

    useEffect(() => {
        if (initialType === "HISTORICAL") {
            handleSwitchMode("HISTORICAL");
        }
    }, [initialType]);

    const fetchMasters = useCallback(async () => {
        setLoadingMasters(true);
        try {
            const [custRes, prodRes, numRes, usersRes] = await Promise.all([
                axios.get("/api/customers"),
                axios.get("/api/products"),
                axios.get("/api/invoices/next-number"),
                axios.get("/api/users-management").catch(() => ({ data: { users: [] } })),
            ]);
            setCustomers(custRes.data?.data || []);
            setProducts(prodRes.data?.data || []);
            if (numRes.data?.next_number) {
                setInvoiceNumber(numRes.data.next_number);
            }
            setUsers(usersRes.data?.users || usersRes.data?.data || []);
        } catch {
            Toast.error("Gagal memuat master data pelanggan atau produk");
        } finally {
            setLoadingMasters(false);
        }
    }, []);

    useEffect(() => {
        fetchMasters();
    }, [fetchMasters]);

    const handleCustomerChange = (e) => {
        const cId = e.target.value;
        setCustomerId(cId);
        const found = customers.find((c) => String(c.id) === String(cId));
        if (found) {
            setCustomerName(found.name);
        }
    };

    const handleAddItem = () => {
        setItems((prev) => [
            ...prev,
            {
                product_id: "",
                item_name: "",
                unit: "Stel",
                qty: 1,
                unit_price: 0,
                subtotal: 0,
                size_breakdown: {},
                description: "",
            },
        ]);
    };

    const handleRemoveItem = (index) => {
        if (items.length === 1) {
            Toast.warning("Minimal harus ada 1 item pesanan");
            return;
        }
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        setItems((prev) => {
            const copy = [...prev];
            const current = { ...copy[index], [field]: value };

            if (field === "product_id") {
                const prod = products.find((p) => String(p.id) === String(value));
                if (prod) {
                    current.item_name = prod.name;
                    current.unit = prod.default_unit || "Stel";
                    current.unit_price = prod.base_price || 0;
                }
            }

            const q = Number(current.qty) || 0;
            const p = Number(current.unit_price) || 0;
            current.subtotal = q * p;

            copy[index] = current;
            return copy;
        });
    };

    const handleSaveSizeBreakdown = (breakdownData, totalQty, calculatedSubtotal, effectiveUnitPrice, customPrices) => {
        if (activeItemIndexForSize !== null) {
            setItems((prev) => {
                const copy = [...prev];
                const current = { ...copy[activeItemIndexForSize] };
                const mergedBreakdown = {};
                Object.entries(breakdownData || {}).forEach(([size, qty]) => {
                    const price = customPrices?.[size] !== undefined ? customPrices[size] : (current.unit_price || 0);
                    mergedBreakdown[size] = { qty, price };
                });
                current.size_breakdown = mergedBreakdown;
                if (totalQty > 0) {
                    current.qty = totalQty;
                    if (calculatedSubtotal && calculatedSubtotal > 0) {
                        current.subtotal = calculatedSubtotal;
                        current.unit_price = effectiveUnitPrice;
                    } else {
                        current.subtotal = totalQty * (Number(current.unit_price) || 0);
                    }
                }
                copy[activeItemIndexForSize] = current;
                return copy;
            });
            setActiveItemIndexForSize(null);
        }
    };

    const selectedSpkProduct = useMemo(() => {
        if (spkForm.item_index === "" || spkForm.item_index === null) return null;
        const idx = parseInt(spkForm.item_index, 10);
        const line = items[idx];
        if (!line?.product_id) return null;
        return products.find((p) => String(p.id) === String(line.product_id)) || null;
    }, [spkForm.item_index, items, products]);

    const handleAddSpkDraft = () => {
        if (spkForm.item_index === "" || spkForm.item_index === null || !spkForm.user_id || spkForm.steps.length === 0) {
            Toast.warning("Pilih Item Pesanan, Karyawan, dan minimal 1 langkah produksi");
            return;
        }
        const idx = parseInt(spkForm.item_index, 10);
        const line = items[idx];
        const defaultQty = parseInt(spkForm.qty, 10) || parseInt(line?.qty, 10) || 1;
        const mappedSteps = spkForm.steps.map((s) => {
            const sId = typeof s === "object" ? s.id : s;
            const pStep = selectedSpkProduct?.production_steps?.find((ps) => ps.id === sId);
            return {
                id: sId,
                name: pStep?.production_step?.name || pStep?.custom_name || "Langkah Produksi",
                wage: Number(pStep?.wage) || 0,
                qty: typeof s === "object" && s.qty ? parseInt(s.qty, 10) : defaultQty,
            };
        });

        const totalWage = mappedSteps.reduce((acc, st) => acc + st.qty * st.wage, 0);

        const draft = {
            id: Date.now(),
            item_index: idx,
            item_name: line?.item_name || `Item #${idx + 1}`,
            product_name: selectedSpkProduct?.name || "",
            user_id: spkForm.user_id,
            user_name: users.find((u) => String(u.id) === String(spkForm.user_id))?.name || "Karyawan",
            qty: defaultQty,
            target_date: spkForm.target_date || "",
            steps: mappedSteps,
            total_wage: totalWage,
        };

        setSpkDrafts((prev) => [...prev, draft]);
        setSpkForm({ item_index: "", user_id: "", qty: "", target_date: "", steps: [] });
    };

    const handleRemoveSpkDraft = (draftId) => {
        setSpkDrafts((prev) => prev.filter((d) => d.id !== draftId));
    };

    const toggleSpkStep = (stepId, customQty) => {
        setSpkForm((prev) => {
            const exists = prev.steps.find((s) => (typeof s === "object" ? s.id : s) === stepId);
            if (exists) {
                return { ...prev, steps: prev.steps.filter((s) => (typeof s === "object" ? s.id : s) !== stepId) };
            }
            const fallbackQty = parseInt(spkForm.qty, 10) || parseInt(items[parseInt(prev.item_index, 10)]?.qty, 10) || 1;
            return { ...prev, steps: [...prev.steps, { id: stepId, qty: customQty || fallbackQty }] };
        });
    };

    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    }, [items]);

    const totalAmount = useMemo(() => {
        return Math.max(0, subtotal - (Number(discount) || 0));
    }, [subtotal, discount]);

    const remainingBalance = useMemo(() => {
        return Math.max(0, totalAmount - (Number(paidAmount) || 0));
    }, [totalAmount, paidAmount]);

    const handleSetPaymentPreset = (type) => {
        if (type === "FULL") {
            setPaymentStatus("LUNAS");
            setPaidAmount(totalAmount);
        } else if (type === "DP50") {
            setPaymentStatus("DP");
            setPaidAmount(Math.round(totalAmount * 0.5));
        } else if (type === "ZERO") {
            setPaymentStatus("BELUM_LUNAS");
            setPaidAmount(0);
        }
    };

    const aggregatedBOM = useMemo(() => {
        const bomMap = {};
        items.forEach((line) => {
            if (!line.product_id) return;
            const prod = products.find((p) => String(p.id) === String(line.product_id));
            if (!prod || !prod.materials) return;

            const breakdown = line.size_breakdown || {};
            const hasBreakdown = Object.keys(breakdown).length > 0;
            const totalLineQty = Number(line.qty) || 0;

            prod.materials.forEach((mat) => {
                const raw = mat.item;
                const itemId = mat.item_id;
                const itemName = raw?.name || "Bahan Baku";
                const itemCode = raw?.code || "-";
                const usageUnit = mat.unit_name || raw?.usage_unit || raw?.unit?.name || "Meter";
                const warehouseUnit = raw?.unit?.name || "Kg";
                const convRate = parseFloat(mat.conversion_rate ?? raw?.conversion_rate) || 1.0;
                const yieldQty = parseFloat(mat.yield_qty) || 1.0;
                const reqPerYield = parseFloat(mat.required_qty) || 0.0;

                let lineUsageQty = 0;
                if (hasBreakdown && mat.size_name && mat.size_name !== "ALL") {
                    const sizeData = breakdown[mat.size_name];
                    const sizeQty = typeof sizeData === 'object' ? (Number(sizeData.qty) || 0) : (Number(sizeData) || 0);
                    lineUsageQty = (sizeQty / yieldQty) * reqPerYield;
                } else if (!hasBreakdown || mat.size_name === "ALL" || !mat.size_name) {
                    lineUsageQty = (totalLineQty / yieldQty) * reqPerYield;
                }

                if (lineUsageQty <= 0) return;

                const warehouseDeduction = lineUsageQty / convRate;

                if (!bomMap[itemId]) {
                    bomMap[itemId] = {
                        id: itemId,
                        name: itemName,
                        code: itemCode,
                        usageUnit: usageUnit,
                        warehouseUnit: warehouseUnit,
                        convRate: convRate,
                        currentStock: raw?.real_stock ?? 0,
                        totalUsage: 0,
                        totalWarehouseDeduction: 0,
                    };
                }
                bomMap[itemId].totalUsage += lineUsageQty;
                bomMap[itemId].totalWarehouseDeduction += warehouseDeduction;
            });
        });
        return Object.values(bomMap);
    }, [items, products]);

    const renderFilteredBOM = (item, matchedProduct) => {
        if (!matchedProduct?.materials?.length) return null;
        const breakdown = item.size_breakdown || {};
        const hasBreakdown = Object.keys(breakdown).length > 0;
        const getBreakdownQty = (v) => typeof v === 'object' ? (Number(v.qty) || 0) : (Number(v) || 0);
        const selectedSizes = hasBreakdown ? Object.keys(breakdown).filter(k => getBreakdownQty(breakdown[k]) > 0) : [];

        const materialsBySize = matchedProduct.materials.reduce((acc, mat) => {
            const sizeKey = mat.size_name || 'ALL';
            if (hasBreakdown && sizeKey !== 'ALL' && !selectedSizes.includes(sizeKey)) return acc;
            if (!acc[sizeKey]) acc[sizeKey] = [];
            acc[sizeKey].push(mat);
            return acc;
        }, {});

        const sizeOrder = hasBreakdown ? selectedSizes : ['ALL', ...Object.keys(materialsBySize).filter(k => k !== 'ALL')];

        return (
            <div key="bom-per-size" className="space-y-3">
                <div className="text-[10px] text-slate-500 font-mono">
                    Kebutuhan Bahan untuk {hasBreakdown ? selectedSizes.map(s => `${s}:${getBreakdownQty(breakdown[s])}`).join(', ') : item.qty} {item.unit}:
                </div>
                <div className="space-y-2.5">
                    {sizeOrder.map((sizeKey) => {
                        const sizeMaterials = materialsBySize[sizeKey];
                        if (!sizeMaterials || sizeMaterials.length === 0) return null;
                        const sizeQty = hasBreakdown && sizeKey !== 'ALL' ? getBreakdownQty(breakdown[sizeKey]) : (Number(item.qty) || 0);
                        if (sizeQty <= 0) return null;

                        return (
                            <details key={sizeKey} open className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                                <summary className="bg-slate-50/80 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer list-none hover:bg-slate-100/60 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold flex items-center justify-center">
                                            {sizeKey === 'ALL' ? 'U' : sizeKey}
                                        </span>
                                        <span className="text-xs font-bold text-slate-800">
                                            {sizeKey === 'ALL' ? 'Bahan Umum (Semua Ukuran)' : `Bahan Ukuran ${sizeKey} (${sizeQty} Pcs)`}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                                        {sizeMaterials.length} Bahan
                                    </span>
                                </summary>
                                <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {sizeMaterials.map((mat, mIdx) => {
                                        const reqPerUnit = Number(mat.required_qty) || 0;
                                        const totalReqForThisItem = reqPerUnit * sizeQty;
                                        const currentStock = Number(mat.item?.real_stock) || 0;
                                        const unit = mat.unit_name || mat.item?.unit?.name || "Unit";
                                        const isSufficient = currentStock >= totalReqForThisItem;
                                        return (
                                            <div key={mat.id || mIdx} className="p-2 rounded bg-slate-50/70 border border-slate-200 text-xs space-y-1">
                                                <div className="flex items-start justify-between gap-1">
                                                    <span className="font-bold text-slate-800 truncate" title={mat.item?.name}>{mat.item?.name || "Bahan Baku"}</span>
                                                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">@{reqPerUnit} {unit}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/80">
                                                    <span className="text-[10px] text-slate-500">
                                                        Stok: <strong className={`font-mono ${isSufficient ? "text-slate-700" : "text-amber-600"}`}>{currentStock.toLocaleString("id-ID")}</strong>
                                                    </span>
                                                    <span className="font-bold text-teal-700 font-mono">
                                                        {totalReqForThisItem.toLocaleString("id-ID", { maximumFractionDigits: 2 })} {unit}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </details>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleQuickCreateCustomer = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/customers", customerForm);
            Toast.success("Pelanggan baru berhasil ditambahkan");
            const newCust = res.data?.data;
            if (newCust) {
                setCustomers((prev) => [newCust, ...prev]);
                setCustomerId(newCust.id);
                setCustomerName(newCust.name);
            }
            setIsCustomerModalOpen(false);
        } catch (err) {
            Toast.error(err.response?.data?.message || "Gagal menambah pelanggan baru");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!invoiceNumber.trim()) {
            Toast.warning("Nomor Invoice wajib diisi");
            return;
        }

        if (!customerId && !customerName.trim()) {
            Toast.warning("Pilih atau isi nama pelanggan pemesan");
            return;
        }

        if (items.length === 0 || items.some((i) => !i.item_name.trim() || Number(i.qty) <= 0)) {
            Toast.warning("Pastikan semua baris item memiliki nama dan kuantitas valid");
            return;
        }

        setSubmitting(true);
        const payload = {
            invoice_number: invoiceNumber,
            customer_id: customerId || null,
            customer_name: customerName,
            order_date: orderDate,
            completion_date: completionDate || null,
            type: orderType,
            subtotal: subtotal,
            discount: Number(discount) || 0,
            total_amount: totalAmount,
            paid_amount: Number(paidAmount) || 0,
            payment_status: paymentStatus,
            production_status: productionStatus,
            cut_stock: cutStock,
            notes: notes,
            items: items.map((i) => ({
                product_id: i.product_id || null,
                item_name: i.item_name,
                unit: i.unit,
                qty: Number(i.qty),
                unit_price: Number(i.unit_price),
                subtotal: Number(i.subtotal),
                size_breakdown: i.size_breakdown || {},
                description: i.description || "",
            })),
            assignments: spkDrafts.map((d) => ({
                item_index: d.item_index,
                user_id: d.user_id,
                qty: Number(d.qty),
                target_date: d.target_date || null,
                steps: d.steps.map((s) => ({
                    id: s.id,
                    qty: Number(s.qty),
                })),
            })),
        };

        try {
            const res = await axios.post("/api/invoices", payload);
            Toast.success(res.data?.message || "Invoice pesanan berhasil disimpan!");
            router.visit("/dashboard/invoice");
        } catch (err) {
            Toast.error(err.response?.data?.message || "Gagal menyimpan invoice");
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const selectedCustomerData = customers.find((c) => String(c.id) === String(customerId));

    const customerOptions = useMemo(() => {
        return customers.map((c) => ({
            value: String(c.id),
            label: c.name,
            sublabel: c.institution_name ? `${c.institution_name} • ${c.phone || ""}` : (c.phone || ""),
            badge: c.code,
            searchKey: `${c.name} ${c.institution_name || ""} ${c.code || ""} ${c.phone || ""}`,
        }));
    }, [customers]);

    const productOptions = useMemo(() => {
        return [
            {
                value: "",
                label: "",
                sublabel: "Input nama & harga bebas tanpa resep bahan",
            },
            ...products.map((p) => ({
                value: String(p.id),
                label: p.name,
                sublabel: `${p.category?.name || "Pakaian"} • ${formatCurrency(p.base_price)}`,
                badge: p.code,
                searchKey: `${p.name} ${p.code || ""} ${p.category?.name || ""}`,
            })),
        ];
    }, [products]);

    const userOptions = useMemo(() => {
        return users.map((u) => ({
            value: String(u.id),
            label: u.name,
            sublabel: u.email,
            searchKey: `${u.name} ${u.email || ""}`,
        }));
    }, [users]);

    return (
        <DashboardLayout>
            <Head title={orderType === "HISTORICAL" ? "Input Pesanan Lama - Azhar Collection" : "Buat Pesanan Baru - Azhar Collection"} />

            <form onSubmit={handleSubmit} className="space-y-4 max-w-7xl mx-auto pb-16">
                
                {/* 1 CARD UTUH MENGISI HALAMAN */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    
                    {/* TOP HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => router.visit("/dashboard/invoice")}
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                    title="Kembali ke Daftar Invoice"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Receipt className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                                        {orderType === "HISTORICAL" ? "Input Pesanan Lama (Arsip Historis)" : "Buat Pesanan Baru (Konveksi)"}
                                    </h1>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {orderType === "HISTORICAL"
                                            ? "Pencatatan nota pembukuan lampau (bypass pemotongan stok bahan baku)."
                                            : "Order seragam & pakaian berjalan dengan alokasi otomatis bahan baku gudang."}
                                    </p>
                                </div>
                            </div>

                            {/* Interactive Mode Switcher Pill */}
                            <div className="flex items-center p-1 bg-slate-100/90 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode("REGULAR")}
                                    className={`inline-flex items-center gap-1.5 px-3 h-7 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        orderType === "REGULAR"
                                            ? "bg-white text-teal-800 shadow-2xs font-bold border border-slate-200"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    <Zap className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Pesanan Baru</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode("HISTORICAL")}
                                    className={`inline-flex items-center gap-1.5 px-3 h-7 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        orderType === "HISTORICAL"
                                            ? "bg-white text-amber-900 shadow-2xs font-bold border border-slate-200"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Pesanan Lama</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT INSIDE CARD */}
                    <div className="p-4 sm:p-5 space-y-5">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            
                            {/* KOLOM KIRI: Form Utama (8 Cols) */}
                            <div className="lg:col-span-8 space-y-4">
                                
                                {/* 1. Customer & General Meta Card */}
                                <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 shadow-2xs space-y-3.5">
                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4 text-teal-600" />
                                            <span>Identitas Pemesan & Nomor Nota</span>
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCustomerForm({
                                                    code: "",
                                                    name: "",
                                                    type: "Sekolah / Pendidikan",
                                                    institution_name: "",
                                                    contact_person: "",
                                                    phone: "",
                                                    email: "",
                                                    address: "",
                                                    notes: "",
                                                    is_active: true,
                                                });
                                                setIsCustomerModalOpen(true);
                                            }}
                                            className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                                        >
                                            <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                                            <span className="mt-0.5">Pelanggan</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                No. Invoice <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={invoiceNumber}
                                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                                placeholder="INV-2024-001"
                                                className="w-full h-8 px-2.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 bg-white shadow-2xs"
                                                required
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Pelanggan / Instansi <span className="text-rose-500">*</span>
                                            </label>
                                            <SearchableSelect
                                                value={customerId}
                                                onChange={(val) => {
                                                    setCustomerId(val);
                                                    const cust = customers.find((c) => String(c.id) === String(val));
                                                    if (cust) setCustomerName(cust.name);
                                                }}
                                                options={customerOptions}
                                                placeholder="Cari / Pilih Pelanggan"
                                                searchPlaceholder="Ketik nama pelanggan, sekolah, atau no WA..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    {selectedCustomerData && (
                                        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <span className="font-bold text-slate-800">{selectedCustomerData.name}</span>
                                                {selectedCustomerData.institution_name && (
                                                    <span className="text-slate-500"> &bull; {selectedCustomerData.institution_name}</span>
                                                )}
                                                {selectedCustomerData.phone && (
                                                    <span className="text-slate-500 font-mono"> &bull; {selectedCustomerData.phone}</span>
                                                )}
                                            </div>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                                {selectedCustomerData.type || "Pelanggan"}
                                            </span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Tanggal Pesanan <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={orderDate}
                                                onChange={(e) => setOrderDate(e.target.value)}
                                                className="w-full h-8 px-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white shadow-2xs"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Target Selesai
                                            </label>
                                            <input
                                                type="date"
                                                value={completionDate}
                                                onChange={(e) => setCompletionDate(e.target.value)}
                                                className="w-full h-8 px-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white shadow-2xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Order Items List Card */}
                                <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 shadow-2xs space-y-3.5">
                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                                        <div>
                                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                                <Shirt className="w-4 h-4 text-teal-600" />
                                                <span>Daftar Item Pesanan ({items.length} Item)</span>
                                            </span>
                                            <p className="text-[11px] text-slate-500">Pilih dari katalog model pakaian atau masukkan item kustom.</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="inline-flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5 text-emerald-700" />
                                            <span className="mt-0.5">Item</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {items.map((item, idx) => {
                                            const breakdownEntries = Object.entries(item.size_breakdown || {});
                                            const matchedProduct = products.find((p) => String(p.id) === String(item.product_id));

                                            return (
                                                <div
                                                    key={idx}
                                                    className="p-3.5 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-3"
                                                >
                                                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="w-5 h-5 rounded bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="text-xs font-bold text-slate-800 truncate">
                                                                {item.item_name || "Item Pesanan Baru"}
                                                            </span>
                                                            {matchedProduct && (
                                                                <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
                                                                    BOM: {matchedProduct.materials?.length || 0} Bahan
                                                                </span>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(idx)}
                                                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                                            title="Hapus baris item ini"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                                                        <div className="sm:col-span-5">
                                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                                Katalog Model Produk
                                                            </label>
                                                            <SearchableSelect
                                                                value={item.product_id}
                                                                onChange={(val) => handleItemChange(idx, "product_id", val)}
                                                                options={productOptions}
                                                                placeholder="-- Tanpa Katalog (Item Bebas) --"
                                                                searchPlaceholder="Cari model baju, kode, atau kategori..."
                                                            />
                                                        </div>

                                                        <div className="sm:col-span-7">
                                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                                Nama Item di Nota <span className="text-rose-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={item.item_name}
                                                                onChange={(e) => handleItemChange(idx, "item_name", e.target.value)}
                                                                placeholder="Contoh: Seragam Olahraga SD (Baju + Celana)"
                                                                className="w-full h-8 px-2.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 text-xs">
                                                        <div className="sm:col-span-2">
                                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                                Satuan
                                                            </label>
                                                            <select
                                                                value={item.unit}
                                                                onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                                                                className="w-full h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-medium"
                                                            >
                                                                <option value="Stel">Stel</option>
                                                                <option value="Pcs">Pcs</option>
                                                                <option value="Lusin">Lusin</option>
                                                                <option value="Kodi">Kodi</option>
                                                                <option value="Set">Set</option>
                                                            </select>
                                                        </div>

                                                        <div className="sm:col-span-4">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <label className="block text-[11px] font-semibold text-slate-700">
                                                                    Kuantitas
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveItemIndexForSize(idx)}
                                                                    className="text-[10px] font-bold text-teal-700 hover:text-teal-800 cursor-pointer inline-flex items-center gap-1"
                                                                >
                                                                    <Ruler className="w-2.5 h-2.5" />
                                                                    <span>{breakdownEntries.length > 0 ? "Edit Ukuran" : "+ Rincian Size"}</span>
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.qty}
                                                                    onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                                                                    readOnly={breakdownEntries.length > 0}
                                                                    className={`w-20 h-8 px-2 text-xs font-mono font-bold text-center border rounded-lg shadow-2xs ${
                                                                        breakdownEntries.length > 0
                                                                            ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                                                                            : "border-slate-300 bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900"
                                                                    }`}
                                                                    required
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveItemIndexForSize(idx)}
                                                                    className={`flex-1 h-8 inline-flex items-center justify-center gap-1 px-2 text-[11px] font-semibold rounded-lg border shadow-2xs transition-all cursor-pointer truncate ${
                                                                        breakdownEntries.length > 0
                                                                            ? "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100"
                                                                            : "bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100"
                                                                    }`}
                                                                >
                                                                    <Ruler className="w-3 h-3 text-teal-600 shrink-0" />
                                                                    <span className="truncate">
                                                                        {breakdownEntries.length > 0 ? `${breakdownEntries.length} Ukuran` : "Atur Size"}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="sm:col-span-3">
                                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                                Harga Satuan
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={item.unit_price}
                                                                onChange={(e) => handleItemChange(idx, "unit_price", e.target.value)}
                                                                className="w-full h-8 px-2.5 text-xs text-right font-mono border border-slate-300 rounded-lg bg-white shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="sm:col-span-3 text-right">
                                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                                                Subtotal
                                                            </label>
                                                            <div className="h-8 flex items-center justify-end font-bold text-slate-900 font-mono text-xs">
                                                                {formatCurrency(item.subtotal)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {breakdownEntries.length > 0 && (
                                                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/70 text-xs">
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                <Ruler className="w-3 h-3 text-teal-600" />
                                                                <span>Rincian Size ({breakdownEntries.reduce((s, [, v]) => s + (typeof v === 'object' ? parseInt(v.qty) || 0 : parseInt(v) || 0), 0)} Pcs):</span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-1">
                                                                {breakdownEntries.map(([sz, v]) => {
                                                                    const qty = typeof v === 'object' ? v.qty || 0 : v;
                                                                    return (
                                                                        <span
                                                                            key={sz}
                                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs"
                                                                        >
                                                                            <span>{sz}:</span>
                                                                            <strong className="font-mono">{qty}</strong>
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {matchedProduct && (
                                                        <details className="mt-2 pt-2 border-t border-slate-200/70 group">
                                                            <summary className="flex items-center justify-between cursor-pointer list-none text-[11px] font-bold text-slate-700 hover:text-teal-700 transition-colors">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                                                                    <span>Detail BOM & Produksi Model</span>
                                                                </div>
                                                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
                                                            </summary>
                                                            <div className="mt-3 space-y-3">
                                                                {renderFilteredBOM(item, matchedProduct)}

                                                                {matchedProduct.production_steps && matchedProduct.production_steps.length > 0 && (
                                                                    <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                                                                            <Zap className="w-3 h-3 text-teal-600" /> Langkah Produksi & Upah Borongan:
                                                                        </span>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                            {matchedProduct.production_steps.map((step, sIdx) => (
                                                                                <div key={sIdx} className="flex justify-between items-center bg-white p-2 rounded-md border border-slate-200 text-[11px] shadow-2xs">
                                                                                    <span className="font-semibold text-slate-800 truncate">
                                                                                        {sIdx + 1}. {step.production_step?.name || step.custom_name}
                                                                                    </span>
                                                                                    <span className="font-mono text-teal-700 font-bold shrink-0">
                                                                                        {formatCurrency(step.wage)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 3. Smart Collapsible Live BOM Preview */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setShowBOMDrawer((prev) => !prev)}
                                        className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-100/70 transition-colors text-left cursor-pointer border-b border-slate-100"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-teal-600" />
                                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                Rekapitulasi Kebutuhan Bahan Gudang (BOM)
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-100/80 text-teal-800 border border-teal-200/80">
                                                {aggregatedBOM.length} Bahan
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                                            <span>{showBOMDrawer ? "Tutup" : "Lihat"}</span>
                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showBOMDrawer ? "rotate-180" : ""}`} />
                                        </div>
                                    </button>

                                    {showBOMDrawer && (
                                        <div className="p-4 space-y-3">
                                            {aggregatedBOM.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic text-center py-2">
                                                    Pilih katalog model produk yang memiliki resep bahan untuk melihat estimasi alokasi stok gudang.
                                                </p>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    {aggregatedBOM.map((mat) => (
                                                        <div
                                                            key={mat.id}
                                                            className="p-3 rounded-lg bg-teal-50/40 border border-teal-200/90 text-xs flex items-center justify-between shadow-2xs"
                                                        >
                                                            <div>
                                                                <div className="font-bold text-slate-800">{mat.name}</div>
                                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                                    Stok Gudang: {mat.currentStock.toLocaleString("id-ID")} {mat.warehouseUnit}
                                                                </div>
                                                                {mat.convRate > 1 && (
                                                                    <div className="text-[9px] text-teal-700 mt-0.5">
                                                                        1 {mat.warehouseUnit} = {mat.convRate} {mat.usageUnit}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[10px] text-slate-500 block">Total Potong Gudang:</span>
                                                                <span className="font-bold text-teal-800 font-mono text-sm block">
                                                                    {mat.totalWarehouseDeduction.toLocaleString("id-ID", { maximumFractionDigits: 3 })} {mat.warehouseUnit}
                                                                </span>
                                                                {mat.convRate > 1 && (
                                                                    <span className="text-[10px] text-teal-600 font-mono">
                                                                        ({mat.totalUsage.toLocaleString("id-ID", { maximumFractionDigits: 2 })} {mat.usageUnit})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 4. SPK Drafts Section */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                                    <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Scissors className="w-4 h-4 text-teal-600" />
                                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                Penugasan SPK Karyawan (Opsional)
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${spkDrafts.length > 0 ? "bg-teal-100/80 text-teal-800 border border-teal-200/80" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                                {spkDrafts.length} Tugas
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowSpkSection((prev) => !prev)}
                                            className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
                                        >
                                            <span>{showSpkSection ? "Tutup Form" : "+ Tambah SPK"}</span>
                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSpkSection ? "rotate-180" : ""}`} />
                                        </button>
                                    </div>

                                    {showSpkSection && (
                                        <div className="p-4 bg-teal-50/20 border-b border-teal-100/60 space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                        Pilih Item Pesanan <span className="text-rose-500">*</span>
                                                    </label>
                                                    <select
                                                        value={spkForm.item_index}
                                                        onChange={(e) => {
                                                            const idx = e.target.value;
                                                            const selLine = items[idx];
                                                            setSpkForm((prev) => ({
                                                                ...prev,
                                                                item_index: idx,
                                                                qty: selLine ? selLine.qty : 1,
                                                                steps: [],
                                                            }));
                                                        }}
                                                        className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800 shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                                    >
                                                        <option value="">-- Pilih Item --</option>
                                                        {items.map((it, iIdx) => (
                                                            <option key={iIdx} value={iIdx}>
                                                                {it.item_name || `Item #${iIdx + 1}`} ({it.qty} {it.unit})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                        Karyawan / Penjahit <span className="text-rose-500">*</span>
                                                    </label>
                                                    <SearchableSelect
                                                        value={spkForm.user_id}
                                                        onChange={(val) => setSpkForm((prev) => ({ ...prev, user_id: val }))}
                                                        options={userOptions}
                                                        placeholder="-- Pilih Karyawan --"
                                                        searchPlaceholder="Ketik nama karyawan..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                        Target Qty
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={spkForm.qty}
                                                        onChange={(e) => setSpkForm((prev) => ({ ...prev, qty: e.target.value }))}
                                                        placeholder="Kuantitas"
                                                        className="w-full h-8 px-2.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                        Target Selesai
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={spkForm.target_date}
                                                        onChange={(e) => setSpkForm((prev) => ({ ...prev, target_date: e.target.value }))}
                                                        className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                                    />
                                                </div>
                                            </div>

                                            {selectedSpkProduct?.production_steps && selectedSpkProduct.production_steps.length > 0 && (
                                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                                            Pilih Langkah Produksi yang Ditugaskan:
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const allSteps = selectedSpkProduct.production_steps.map((ps) => ({
                                                                    id: ps.id,
                                                                    qty: parseInt(spkForm.qty, 10) || parseInt(items[parseInt(spkForm.item_index, 10)]?.qty, 10) || 1,
                                                                }));
                                                                setSpkForm((prev) => ({
                                                                    ...prev,
                                                                    steps: prev.steps.length === allSteps.length ? [] : allSteps,
                                                                }));
                                                            }}
                                                            className="text-[10px] text-teal-700 hover:text-teal-800 font-bold cursor-pointer"
                                                        >
                                                            {spkForm.steps.length === selectedSpkProduct.production_steps.length ? "Batal Semua" : "Pilih Semua Langkah"}
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                        {selectedSpkProduct.production_steps.map((ps) => {
                                                            const isChecked = spkForm.steps.some((s) => (typeof s === "object" ? s.id : s) === ps.id);
                                                            const curStep = spkForm.steps.find((s) => (typeof s === "object" ? s.id : s) === ps.id);
                                                            const curQty = typeof curStep === "object" ? curStep.qty : (spkForm.qty || 1);

                                                            return (
                                                                <div
                                                                    key={ps.id}
                                                                    className={`p-2.5 rounded-lg border text-xs transition-colors shadow-2xs ${
                                                                        isChecked
                                                                            ? "bg-teal-50/70 border-teal-300 text-teal-950"
                                                                            : "bg-slate-50/50 border-slate-200 text-slate-700"
                                                                    }`}
                                                                >
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => toggleSpkStep(ps.id, curQty)}
                                                                            className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-600"
                                                                        />
                                                                        <span className="font-bold text-xs truncate">
                                                                            {ps.production_step?.name || ps.custom_name}
                                                                        </span>
                                                                    </label>
                                                                    <div className="flex items-center justify-between mt-1.5 pl-5.5 text-[10px] text-slate-500">
                                                                        <span>Upah: {formatCurrency(ps.wage)}</span>
                                                                        {isChecked && (
                                                                            <div className="flex items-center gap-1">
                                                                                <span>Qty:</span>
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={curQty}
                                                                                    onChange={(e) => {
                                                                                        const nQ = e.target.value;
                                                                                        setSpkForm((prev) => ({
                                                                                            ...prev,
                                                                                            steps: prev.steps.map((s) => {
                                                                                                const sId = typeof s === "object" ? s.id : s;
                                                                                                if (sId === ps.id) return { id: ps.id, qty: nQ };
                                                                                                return s;
                                                                                            }),
                                                                                        }));
                                                                                    }}
                                                                                    className="w-14 px-1 py-0.5 text-[11px] border border-slate-300 rounded text-right bg-white font-mono"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-end pt-1">
                                                <button
                                                    type="button"
                                                    onClick={handleAddSpkDraft}
                                                    className="inline-flex items-center gap-1.5 h-8 px-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Tambahkan Penugasan</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4">
                                        {spkDrafts.length === 0 ? (
                                            <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                                                <Scissors className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                                                <span>Belum ada penugasan SPK dibuat (opsional, bisa dibuat nanti di detail invoice).</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {spkDrafts.map((draft) => (
                                                    <div
                                                        key={draft.id}
                                                        className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <div className="w-6 h-6 rounded-md bg-teal-50 border border-teal-200/80 text-teal-700 font-bold text-[10px] flex items-center justify-center shadow-2xs">
                                                                    {(draft.user_name || "K").charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="font-bold text-xs text-slate-900">{draft.user_name}</span>
                                                                <span className="text-slate-400 text-[11px]">&bull;</span>
                                                                <span className="font-semibold text-xs text-slate-700">{draft.item_name}</span>
                                                                <span className="font-mono text-slate-500 text-[11px]">({draft.qty} Qty)</span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                                                {draft.steps.map((st, sI) => (
                                                                    <span
                                                                        key={sI}
                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-mono"
                                                                    >
                                                                        <span>{st.name} ({st.qty}x)</span>
                                                                        <span className="text-teal-700 font-bold">{formatCurrency(st.wage * st.qty)}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                                            <div className="text-right">
                                                                <span className="text-[10px] text-slate-400 block">Est. Upah Borongan:</span>
                                                                <span className="font-bold text-xs text-teal-800 font-mono">
                                                                    {formatCurrency(draft.total_wage || 0)}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveSpkDraft(draft.id)}
                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200 transition-colors cursor-pointer"
                                                                title="Hapus draft penugasan ini"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* KOLOM KANAN: Ringkasan Sticky & Aksi (4 Cols) */}
                            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
                                <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-200 shadow-2xs space-y-4">
                                    <div className="border-b border-slate-200/80 pb-2.5 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <DollarSign className="w-4 h-4 text-teal-600" />
                                            <span>Ringkasan Transaksi</span>
                                        </span>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                                                paymentStatus === "LUNAS"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : paymentStatus === "DP"
                                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                            }`}
                                        >
                                            {paymentStatus}
                                        </span>
                                    </div>

                                    {/* Status Produksi & Sakelar Potong Stok */}
                                    <div className="space-y-3 text-xs bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                Status Pengerjaan Produksi
                                            </label>
                                            <select
                                                value={productionStatus}
                                                onChange={(e) => setProductionStatus(e.target.value)}
                                                className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-medium shadow-2xs focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                            >
                                                <option value="PROSES">DALAM PROSES</option>
                                                <option value="SELESAI">SELESAI</option>
                                                <option value="PENDING">PENDING</option>
                                                <option value="DIKIRIM">SUDAH DISERAHKAN</option>
                                            </select>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200/80">
                                            <label className="flex items-start gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={cutStock}
                                                    onChange={(e) => setCutStock(e.target.checked)}
                                                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-600 mt-0.5"
                                                />
                                                <div>
                                                    <span className="text-xs font-bold text-slate-800 block">
                                                        {cutStock ? "Potong Stok Gudang (Aktif)" : "Bypass Stok (Tidak Memotong)"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                                                        {cutStock ? "Resep BOM bahan baku otomatis dikurangi dari stok." : "Arsip historis nota lama tanpa mempengaruhi stok fisik."}
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Financial Breakdown */}
                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Subtotal:</span>
                                            <span className="font-bold font-mono text-slate-900">
                                                {formatCurrency(subtotal)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Diskon / Potongan:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={discount}
                                                onChange={(e) => setDiscount(e.target.value)}
                                                className="w-28 h-8 px-2 text-xs text-right border border-slate-300 rounded-lg font-mono focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white shadow-2xs"
                                            />
                                        </div>

                                        <div className="flex justify-between items-center py-2.5 px-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg shadow-sm">
                                            <span className="font-bold text-xs uppercase tracking-wider">Total Tagihan:</span>
                                            <span className="font-extrabold font-mono text-base text-teal-300">
                                                {formatCurrency(totalAmount)}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                                Preset Status Bayar:
                                            </span>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetPaymentPreset("FULL")}
                                                    className={`py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                                                        paymentStatus === "LUNAS"
                                                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs"
                                                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    100% Lunas
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetPaymentPreset("DP50")}
                                                    className={`py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                                                        paymentStatus === "DP"
                                                            ? "bg-amber-50 text-amber-800 border-amber-300 font-bold shadow-2xs"
                                                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    DP 50%
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetPaymentPreset("ZERO")}
                                                    className={`py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                                                        paymentStatus === "BELUM_LUNAS"
                                                            ? "bg-rose-50 text-rose-800 border-rose-300 font-bold shadow-2xs"
                                                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    Belum Bayar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-slate-600 font-medium">Uang Terbayar:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={paidAmount}
                                                onChange={(e) => setPaidAmount(e.target.value)}
                                                className="w-28 h-8 px-2 text-xs text-right border border-slate-300 rounded-lg font-mono text-emerald-700 font-bold focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white shadow-2xs"
                                            />
                                        </div>

                                        <div className="flex justify-between items-center py-2 px-2.5 bg-white rounded-lg border border-slate-200">
                                            <span className="font-bold text-slate-800">Sisa Piutang:</span>
                                            <span className={`font-extrabold font-mono text-sm ${remainingBalance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                                {remainingBalance > 0 ? formatCurrency(remainingBalance) : "LUNAS"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Catatan / Instruksi Khusus
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Contoh: Bordir logo dada kiri, sablon nama sekolah..."
                                            className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white shadow-2xs"
                                        />
                                    </div>

                                    {/* Submit & Cancel Actions */}
                                    <div className="pt-2 space-y-2">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full h-9 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>{submitting ? "Menyimpan Transaksi..." : "Simpan & Terbitkan Invoice"}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => router.visit("/dashboard/invoice")}
                                            className="w-full h-8 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Quick Add Customer Modal */}
            <CustomerModal
                isOpen={isCustomerModalOpen}
                isEditing={false}
                form={customerForm}
                submitting={false}
                onClose={() => setIsCustomerModalOpen(false)}
                onChange={(e) => {
                    const { name, value } = e.target;
                    setCustomerForm((prev) => ({ ...prev, [name]: value }));
                }}
                onSubmit={handleQuickCreateCustomer}
            />

            {/* Size Breakdown Modal */}
            {activeItemIndexForSize !== null && (() => {
                const activeLine = items[activeItemIndexForSize];
                const activeProd = products.find((p) => String(p.id) === String(activeLine?.product_id));
                if (!activeProd) {
                    return (
                        <SizeBreakdownModal
                            isOpen={true}
                            itemName={activeLine?.item_name || "Item Pesanan"}
                            productSizes={[]}
                            defaultUnitPrice={Number(activeLine?.unit_price) || 0}
                            initialBreakdown={{}}
                            currentBreakdown={{}}
                            onClose={() => setActiveItemIndexForSize(null)}
                            onSave={() => {}}
                        />
                    );
                }
                return (
                    <SizeBreakdownModal
                        isOpen={true}
                        itemName={activeLine?.item_name || "Item Pesanan"}
                        productSizes={activeProd?.sizes || []}
                        defaultUnitPrice={Number(activeLine?.unit_price) || 0}
                        initialBreakdown={activeLine?.size_breakdown || {}}
                        currentBreakdown={activeLine?.size_breakdown || {}}
                        onClose={() => setActiveItemIndexForSize(null)}
                        onSave={handleSaveSizeBreakdown}
                    />
                );
            })()}
        </DashboardLayout>
    );
}