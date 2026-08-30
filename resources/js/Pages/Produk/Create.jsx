import React, { useState, useEffect, useRef } from "react";
import { Head, usePage, router, useForm } from "@inertiajs/react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Tooltip from "@/Components/Tooltip";
import {
    Shirt,
    X,
    RefreshCw,
    Plus,
    Trash2,
    Package,
    Tag,
    DollarSign,
    Layers,
    Image as ImageIcon,
    UploadCloud,
    Star,
    Check,
    Ruler,
    SlidersHorizontal,
    Info,
    Copy,
    Sparkles,
    ArrowRight,
    Scissors,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Wrench,
    ArrowLeft,
} from "lucide-react";
import { formatRupiah } from "@/utils/format";
import { Toast, confirmDialog } from "@/utils/sweetalert";

const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
};
const formatPlain = (val) => {
    if (val === "" || val == null) return "";
    const n = Number(val);
    if (isNaN(n)) return "";
    return n.toLocaleString("id-ID");
};
const parsePlain = (str) => {
    if (!str) return 0;
    const clean = String(str).replace(/\./g, "").replace(/[^0-9]/g, "");
    return clean === "" ? 0 : Number(clean);
};
const formatQty = (val) => {
    if (val === "" || val == null) return "";
    const n = parseFloat(String(val).replace(",", "."));
    if (isNaN(n)) return "";
    return Number(n).toString().replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
};

const adultPreset = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
const numberPreset = ["No. 1", "No. 2", "No. 3", "No. 4", "No. 5", "No. 6", "No. 7", "No. 8", "No. 9", "No. 10", "No. 11", "No. 12"];
const units = ["Stel", "Pcs", "Lusin", "Kodi", "Set", "Meter", "Paket"];

export default function Create() {
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];

    const { data, setData, errors, clearErrors, processing, reset } = useForm({
        code: "",
        name: "",
        category: "",
        default_unit: "Stel",
        base_price: 0,
        description: "",
        is_active: true,
        sizes: [],
        materials: [],
        existing_images: [],
        new_images: [],
        deleted_image_ids: [],
        primary_image_id: null,
        primary_image_index: null,
        production_steps: [],
    });

    const [activeStep, setActiveStep] = useState(0);
    const [isAutoCode, setIsAutoCode] = useState(true);
    const [fetchingCode, setFetchingCode] = useState(false);
    const [rawItems, setRawItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [productCategories, setProductCategories] = useState([]);
    const [masterSteps, setMasterSteps] = useState([]);
    const [masterSizes, setMasterSizes] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [completedSteps, setCompletedSteps] = useState({});
    const fileInputRef = useRef(null);

    const [quickItemSelect, setQuickItemSelect] = useState("");
    const [quickQty, setQuickQty] = useState(1);
    const [quickYieldQty, setQuickYieldQty] = useState(1);
    const [quickConversionRate, setQuickConversionRate] = useState(1);
    const [quickUnit, setQuickUnit] = useState("Meter");
    const [quickNotes, setQuickNotes] = useState("");
    const [showQuickAddAll, setShowQuickAddAll] = useState(false);
    const [openBOMCards, setOpenBOMCards] = useState(new Set());
    const [showSizePopover, setShowSizePopover] = useState(false);
    const [dialogSizeId, setDialogSizeId] = useState("");
    const [dialogPrice, setDialogPrice] = useState(0);
    const [dialogNotes, setDialogNotes] = useState("");
    const [showMaterialDialog, setShowMaterialDialog] = useState(null);
    const [dialogMaterial, setDialogMaterial] = useState({ item_id: "", required_qty: 1, yield_qty: 1, conversion_rate: 1, unit_name: "Meter", notes: "" });
    const [openCopyMenu, setOpenCopyMenu] = useState(null);
    const [openRingkasanCards, setOpenRingkasanCards] = useState(new Set());
    const toggleRingkasanCard = (key) => setOpenRingkasanCards((prev) => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });

    const canCreate = permissions.includes("produk.create") || permissions.includes("admin");

    useEffect(() => {
        fetchCategories();
        fetchRawItems();
        fetchMasterSteps();
        fetchMasterSizes();
        if (isAutoCode) fetchNextCode();
    }, []);

    const fetchNextCode = async () => {
        setFetchingCode(true);
        try {
            const res = await axios.get("/api/products/next-code");
            if (res.data?.code) setData("code", res.data.code);
        } catch {
            setData("code", "PRD-001");
        } finally {
            setFetchingCode(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("/api/product-categories?status=active");
            if (res.data?.data) {
                setProductCategories(res.data.data.map((c) => c.name));
            }
        } catch {
            setProductCategories([]);
        }
    };

    const fetchRawItems = async () => {
        setLoadingItems(true);
        try {
            const res = await axios.get("/api/items?status=active");
            setRawItems(res.data?.data || []);
        } catch {
            setRawItems([]);
        } finally {
            setLoadingItems(false);
        }
    };

    const fetchMasterSteps = async () => {
        try {
            const res = await axios.get("/api/production-steps");
            setMasterSteps(res.data?.data || []);
        } catch {
            setMasterSteps([]);
        }
    };

    const fetchMasterSizes = async () => {
        try {
            const res = await axios.get("/api/sizes");
            setMasterSizes(res.data?.data || []);
        } catch {
            setMasterSizes([]);
        }
    };

    const categories = productCategories.length > 0 ? productCategories : [
        "Seragam Olahraga", "Seragam Batik Sekolah", "Kemeja PDH / PDL", "Jas Almamater",
        "Kaos & Polo Shirt", "Busana Muslim & Gamis", "Celana & Rok Seragam",
    ];

    // Helpers
    const getSizeId = (sizeName) => {
        if (!sizeName || sizeName === "ALL") return null;
        const found = masterSizes.find((ms) => ms.size_name === sizeName);
        return found ? found.id : null;
    };

    const definedSizes = data.sizes || [];
    const definedSizeNames = definedSizes.map((s) => s.size_name).filter(Boolean);
    const materialsWithOriginalIndex = (data.materials || []).map((m, idx) => ({ ...m, _origIndex: idx }));
    const universalMaterials = materialsWithOriginalIndex.filter((m) => !m.size_name || m.size_name === "ALL");
    const toggleBOMCard = (key) => setOpenBOMCards((prev) => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });

    // Image handlers
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const newImages = files.map((file) => ({
            file, preview: URL.createObjectURL(file), is_new: true,
        }));
        setData("new_images", [...(data.new_images || []), ...newImages]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveExistingImage = (imageId) => {
        const updatedExisting = (data.existing_images || []).filter((img) => img.id !== imageId);
        setData("existing_images", updatedExisting);
        setData("deleted_image_ids", [...(data.deleted_image_ids || []), imageId]);
    };

    const handleRemoveNewImage = (index) => {
        setData("new_images", (data.new_images || []).filter((_, idx) => idx !== index));
    };

    const handleSetPrimaryExisting = (imageId) => {
        setData("primary_image_id", imageId);
        setData("primary_image_index", null);
    };

    const handleSetPrimaryNew = (index) => {
        setData("primary_image_index", index);
        setData("primary_image_id", null);
    };

    // Size handlers
    const handleAddSizeRow = () => {
        if (showSizePopover) {
            setShowSizePopover(false);
            return;
        }
        setDialogSizeId("");
        setDialogPrice(data.base_price || 0);
        setDialogNotes("");
        setShowSizePopover(true);
    };
    const handleConfirmSizeDialog = () => {
        if (!dialogSizeId) { Toast.error("Pilih ukuran dulu"); return; }
        if (definedSizes.some((s) => String(s.size_id) === String(dialogSizeId))) { Toast.error("Ukuran sudah ada"); return; }
        const selectedMaster = masterSizes.find((ms) => String(ms.id) === String(dialogSizeId));
        setData("sizes", [...definedSizes, { size_id: dialogSizeId, size_name: selectedMaster ? selectedMaster.size_name : "", price: Number(dialogPrice) || 0, notes: dialogNotes || "" }]);
        setShowSizePopover(false);
        setDialogSizeId(""); setDialogPrice(0); setDialogNotes("");
    };

    const handleApplyPresetSizes = (category) => {
        const currentSizeIds = new Set(definedSizes.map((s) => String(s.size_id)));
        const toAdd = masterSizes
            .filter((ms) => ms.category === category && !currentSizeIds.has(String(ms.id)))
            .map((ms) => ({ size_id: ms.id, size_name: ms.size_name, price: data.base_price || 0, notes: "" }));
        setData("sizes", [...definedSizes, ...toAdd]);
    };

    const handleApplyBasePriceToAllSizes = () => {
        const basePrice = data.base_price || 0;
        setData("sizes", definedSizes.map((s) => ({ ...s, price: basePrice })));
    };

    const handleSizeFieldChange = (index, field, value) => {
        const updated = [...definedSizes];
        if (field === "size_id") {
            const selectedMaster = masterSizes.find((ms) => String(ms.id) === String(value));
            updated[index] = { ...updated[index], size_id: value, size_name: selectedMaster ? selectedMaster.size_name : "" };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setData("sizes", updated);
    };

    const handleRemoveSizeRow = (index) => {
        const targetSizeName = definedSizes[index]?.size_name;
        const updatedSizes = definedSizes.filter((_, idx) => idx !== index);
        setData("sizes", updatedSizes);
        if (targetSizeName) {
            const updatedMaterials = (data.materials || []).filter((m) => m.size_name !== targetSizeName);
            setData("materials", updatedMaterials);
        }
    };

    // BOM Material handlers
    const handleAddMaterialToSize = (sizeName, sizeId) => {
        const targetSizeName = sizeName || "ALL";
        const targetSizeId = sizeId || null;
        if (showMaterialDialog?.sizeName === targetSizeName && String(showMaterialDialog?.sizeId || "") === String(targetSizeId || "")) {
            setShowMaterialDialog(null);
            return;
        }
        const defaultItem = rawItems[0];
        setDialogMaterial({ item_id: defaultItem ? defaultItem.id : "", required_qty: 1, yield_qty: 1, conversion_rate: 1, unit_name: defaultItem?.unit?.name || "Meter", notes: "" });
        setShowMaterialDialog({ sizeName: targetSizeName, sizeId: targetSizeId });
    };
    const handleConfirmMaterialDialog = () => {
        if (!dialogMaterial.item_id) { Toast.error("Pilih bahan baku"); return; }
        if (!showMaterialDialog) return;
        const newRow = {
            item_id: dialogMaterial.item_id, size_id: showMaterialDialog.sizeId || null, size_name: showMaterialDialog.sizeName || "ALL",
            required_qty: Number(dialogMaterial.required_qty) || 1, yield_qty: Number(dialogMaterial.yield_qty) || 1, conversion_rate: Number(dialogMaterial.conversion_rate) || 1,
            unit_name: dialogMaterial.unit_name || "Meter", notes: dialogMaterial.notes || "",
        };
        setData("materials", [...(data.materials || []), newRow]);
        setShowMaterialDialog(null);
    };

    const handleRemoveMaterialRow = (originalIndex) => {
        setData("materials", (data.materials || []).filter((_, idx) => idx !== originalIndex));
    };

    const handleMaterialFieldChange = (originalIndex, field, value) => {
        const updated = [...(data.materials || [])];
        updated[originalIndex] = { ...updated[originalIndex], [field]: value };
        if (field === "item_id") {
            const selectedItem = rawItems.find((i) => String(i.id) === String(value));
            if (selectedItem) {
                updated[originalIndex].unit_name = selectedItem.unit?.name || "Meter";
                updated[originalIndex].conversion_rate = 1;
            }
        }
        setData("materials", updated);
    };

    const handleApplyMaterialToAllSizes = (materialIndex) => {
        const mat = (data.materials || [])[materialIndex];
        if (!mat || !mat.item_id) return;
        const definedSizes = (data.sizes || []).map((s) => ({ name: s.size_name, id: s.size_id })).filter((s) => s.name);
        const targetSizes = definedSizes.length > 0 ? definedSizes : [{ name: "ALL", id: null }];
        const currentMaterials = [...(data.materials || [])];
        const filtered = currentMaterials.filter(
            (m) => String(m.item_id) !== String(mat.item_id) || !targetSizes.some((ts) => ts.name === m.size_name)
        );
        const newRows = targetSizes.map((sz) => ({
            item_id: mat.item_id, size_id: sz.id, size_name: sz.name,
            required_qty: mat.required_qty, yield_qty: mat.yield_qty || 1,
            conversion_rate: mat.conversion_rate || 1, unit_name: mat.unit_name, notes: mat.notes || "",
        }));
        setData("materials", [...filtered, ...newRows]);
    };

    const handleCopyMaterialsBetweenSizes = (sourceSize, targetSize) => {
        if (!sourceSize || !targetSize || sourceSize === targetSize) return;
        const currentMaterials = [...(data.materials || [])];
        const sourceMaterials = currentMaterials.filter((m) => (m.size_name || "ALL") === sourceSize);
        if (sourceMaterials.length === 0) return;
        const keptMaterials = currentMaterials.filter((m) => (m.size_name || "ALL") !== targetSize);
        const targetSizeId = getSizeId(targetSize);
        const newTargetMaterials = sourceMaterials.map((m) => ({ ...m, size_id: targetSizeId, size_name: targetSize }));
        setData("materials", [...keptMaterials, ...newTargetMaterials]);
    };

    const handleQuickAddMaterialToAll = () => {
        if (!quickItemSelect) return;
        const definedSizes = (data.sizes || []).map((s) => ({ name: s.size_name, id: s.size_id })).filter((s) => s.name);
        const targetSizes = definedSizes.length > 0 ? definedSizes : [{ name: "ALL", id: null }];
        const currentMaterials = [...(data.materials || [])];
        const newRows = targetSizes.map((sz) => ({
            item_id: quickItemSelect, size_id: sz.id, size_name: sz.name,
            required_qty: Number(quickQty) || 1, yield_qty: Number(quickYieldQty) || 1,
            conversion_rate: Number(quickConversionRate) || 1, unit_name: quickUnit || "Meter", notes: quickNotes || "",
        }));
        setData("materials", [...currentMaterials, ...newRows]);
        setQuickItemSelect(""); setQuickQty(1); setQuickYieldQty(1); setQuickConversionRate(1); setQuickNotes("");
        setShowQuickAddAll(false);
    };

    // Production Steps handlers
    const handleAddProductionStep = (stepId) => {
        const stepMaster = masterSteps.find((s) => String(s.id) === String(stepId));
        if (!stepMaster) return;
        const currentSteps = data.production_steps || [];
        const maxOrder = currentSteps.length > 0 ? Math.max(...currentSteps.map((s) => s.step_order || 0)) : 0;
        setData("production_steps", [...currentSteps, {
            production_step_id: stepMaster.id, custom_name: null, step_order: maxOrder + 1,
            wage: stepMaster.default_wage, _master_name: stepMaster.name,
        }]);
    };

    const handleAddCustomProductionStep = () => {
        const currentSteps = data.production_steps || [];
        const maxOrder = currentSteps.length > 0 ? Math.max(...currentSteps.map((s) => s.step_order || 0)) : 0;
        const customCount = currentSteps.filter((s) => !s.production_step_id).length + 1;
        setData("production_steps", [...currentSteps, {
            production_step_id: null, custom_name: "Langkah Custom " + customCount, step_order: maxOrder + 1, wage: 0, _master_name: null,
        }]);
    };

    const handleRemoveProductionStep = (index) => {
        const updated = [...(data.production_steps || [])];
        updated.splice(index, 1);
        const reordered = updated.map((s, i) => ({ ...s, step_order: i + 1 }));
        setData("production_steps", reordered);
    };

    const handleStepWageChange = (index, value) => {
        const updated = [...(data.production_steps || [])];
        updated[index] = { ...updated[index], wage: value };
        setData("production_steps", updated);
    };

    const handleStepNameChange = (index, value) => {
        const updated = [...(data.production_steps || [])];
        if (!updated[index].production_step_id) {
            updated[index] = { ...updated[index], custom_name: value };
            setData("production_steps", updated);
        }
    };

    const handleMoveStep = (index, direction) => {
        const updated = [...(data.production_steps || [])];
        if (direction === "up" && index > 0) {
            const temp = updated[index]; updated[index] = updated[index - 1]; updated[index - 1] = temp;
        } else if (direction === "down" && index < updated.length - 1) {
            const temp = updated[index]; updated[index] = updated[index + 1]; updated[index + 1] = temp;
        }
        const reordered = updated.map((s, i) => ({ ...s, step_order: i + 1 }));
        setData("production_steps", reordered);
    };

    // Validation helpers
    const validateStep = (step) => {
        if (step === 0) {
            if (!data.code?.trim()) { Toast.error("Kode produk wajib diisi"); return false; }
            if (!data.name?.trim()) { Toast.error("Nama produk wajib diisi"); return false; }
            if (!data.category) { Toast.error("Kategori wajib dipilih"); return false; }
        }
        if (step === 1) {
            for (const s of data.sizes || []) {
                if (s.size_id && (!s.price || Number(s.price) <= 0)) { Toast.error(`Harga untuk ukuran ${s.size_name} wajib > 0`); return false; }
                if (!s.size_id) { Toast.error("Ada varian ukuran belum dipilih"); return false; }
            }
        }
        if (step === 2) {
            if ((data.materials || []).length === 0 && definedSizes.length > 0) {
                Toast.error("Resep bahan belum diisi untuk ukuran yang ada");
                return false;
            }
            for (let idx = 0; idx < (data.materials || []).length; idx++) {
                const m = data.materials[idx];
                if (!m.item_id) { Toast.error(`Baris bahan #${idx+1}: pilih bahan baku`); setActiveStep(2); return false; }
                if (!m.required_qty || Number(m.required_qty) <= 0) { Toast.error(`Baris bahan #${idx+1}: Kebutuhan wajib > 0`); setActiveStep(2); return false; }
                if (!m.yield_qty || Number(m.yield_qty) <= 0) { Toast.error(`Baris bahan #${idx+1}: Hasil jadi wajib > 0`); setActiveStep(2); return false; }
                if (!m.conversion_rate || Number(m.conversion_rate) <= 0) { Toast.error(`Baris bahan #${idx+1}: Konversi wajib > 0`); setActiveStep(2); return false; }
            }
        }
        if (step === 3) {
            for (let idx = 0; idx < (data.production_steps || []).length; idx++) {
                const s = data.production_steps[idx];
                if (!s.production_step_id && !s.custom_name?.trim()) { Toast.error(`Langkah #${idx+1}: nama langkah kosong`); return false; }
                if (s.wage != null && Number(s.wage) < 0) { Toast.error(`Langkah #${idx+1}: upah tidak valid`); return false; }
            }
        }
        return true;
    };

    const validateAll = () => {
        for (let s = 0; s <= 3; s++) { if (!validateStep(s)) { setActiveStep(s); return false; } }
        return true;
    };

    const canNavigateToStep = (idx) => {
        if (idx <= activeStep) return true;
        if (completedSteps[idx]) return true;
        for (let i = 0; i < idx; i++) { if (!validateStep(i)) return false; }
        return true;
    };

    const handleStepClick = (idx) => {
        if (idx === activeStep) return;
        if (idx < activeStep) { setActiveStep(idx); return; }
        if (!validateStep(activeStep)) return;
        if (!canNavigateToStep(idx)) { Toast.error("Selesaikan step sebelumnya dulu"); return; }
        setCompletedSteps((prev) => ({ ...prev, [activeStep]: true }));
        setActiveStep(idx);
    };

    const handleNext = () => {
        if (!validateStep(activeStep)) return;
        setCompletedSteps((prev) => ({ ...prev, [activeStep]: true }));
        if (activeStep < 4) setActiveStep(activeStep + 1);
    };

    const handleBack = () => {
        if (activeStep > 0) setActiveStep(activeStep - 1);
    };

    // Submit handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;
        if (masterSizes.length === 0 && (data.sizes || []).length > 0) { Toast.error("Master ukuran belum termuat, coba refresh"); return; }
        if (loadingItems) { Toast.error("Data bahan masih dimuat, tunggu sebentar"); return; }
        setSubmitting(true);

        const getSizeId = (sizeName) => {
            if (!sizeName || sizeName === "ALL") return null;
            const found = masterSizes.find((ms) => ms.size_name === sizeName);
            return found ? found.id : null;
        };

        const materialsForBackend = (data.materials || []).map((m) => ({
            item_id: m.item_id ? Number(m.item_id) : null,
            size_id: m.size_id ? Number(m.size_id) : (getSizeId(m.size_name) ? Number(getSizeId(m.size_name)) : null),
            required_qty: Number(m.required_qty) || 0,
            yield_qty: Number(m.yield_qty) || 1,
            conversion_rate: Number(m.conversion_rate) || 1,
            unit_name: m.unit_name || null,
            notes: m.notes || null,
        }));

        const formData = new FormData();
        formData.append("code", data.code || "");
        formData.append("name", data.name || "");
        formData.append("category", data.category || "");
        formData.append("default_unit", data.default_unit || "Stel");
        formData.append("base_price", data.base_price ?? 0);
        formData.append("description", data.description || "");
        formData.append("is_active", data.is_active ? "1" : "0");
        const validSizes = (data.sizes || []).filter((s) => s.size_id).map((s) => ({ size_id: Number(s.size_id), price: Number(s.price) || 0, notes: s.notes || null }));
        const validMaterials = materialsForBackend.filter((m) => m.item_id && m.required_qty > 0);
        const validSteps = (data.production_steps || []).filter((s) => s.production_step_id || s.custom_name?.trim()).map((s, idx) => ({
            production_step_id: s.production_step_id ? Number(s.production_step_id) : null,
            custom_name: s.custom_name || null,
            wage: Number(s.wage) || 0,
            sort_order: idx + 1,
        }));
        formData.append("sizes", JSON.stringify(validSizes));
        formData.append("materials", JSON.stringify(validMaterials));
        formData.append("production_steps", JSON.stringify(validSteps));
        if (data.deleted_image_ids && data.deleted_image_ids.length > 0) formData.append("deleted_image_ids", JSON.stringify(data.deleted_image_ids));
        if (data.primary_image_id) formData.append("primary_image_id", data.primary_image_id);
        if (data.primary_image_index !== null && data.primary_image_index !== undefined) formData.append("primary_image_index", data.primary_image_index);
        if (data.new_images && data.new_images.length > 0) data.new_images.forEach((imgObj) => { if (imgObj.file) formData.append("images[]", imgObj.file); });

        try {
            const res = await axios.post("/api/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
            Toast.success(res.data?.message || "Produk berhasil ditambahkan");
            router.visit("/dashboard/produk");
        } catch (err) {
            const serverErrors = err.response?.data?.errors;
            if (serverErrors) {
                const firstKey = Object.keys(serverErrors)[0];
                const firstMsg = serverErrors[firstKey]?.[0];
                Toast.error(firstMsg || err.response?.data?.message || "Validasi gagal");
            } else {
                const message = err.response?.data?.message || "Terjadi kesalahan saat menyimpan data";
                Toast.error(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        { id: 0, title: "Info & Foto", icon: Shirt },
        { id: 1, title: "Varian Ukuran", icon: Ruler },
        { id: 2, title: "Resep Bahan", icon: Layers },
        { id: 3, title: "Langkah Produksi", icon: SlidersHorizontal },
        { id: 4, title: "Ringkasan", icon: CheckCircle2 },
    ];

    const totalWage = (data.production_steps || []).reduce((sum, s) => sum + Number(s.wage || 0), 0);

    // Total material cost per size for summary
    const getSizeMaterialCost = (sizeName) => {
        const sizeMats = (data.materials || []).filter((m) => m.size_name === sizeName);
        return sizeMats.reduce((sum, m) => {
            const item = rawItems.find((i) => String(i.id) === String(m.item_id));
            const itemPrice = Number(item?.price || 0);
            return sum + Number(m.required_qty || 0) * itemPrice;
        }, 0);
    };

    if (!canCreate) {
        return (
            <DashboardLayout>
                <Head title="Akses Ditolak" />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-700">Akses Ditolak</h2>
                        <p className="text-sm text-slate-500">Anda tidak memiliki izin untuk membuat produk.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Head title="Tambah Produk Baru - Azhar Collection" />

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Tooltip content="Kembali ke daftar produk" position="bottom">
                        <button
                            type="button"
                            onClick={() => router.visit("/dashboard/produk")}
                            className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-sm cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    </Tooltip>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Tambah Produk Baru</h1>
                        <p className="text-xs text-slate-500">Master Produk Jadi & Resep BOM</p>
                    </div>
                </div>

                {/* Stepper Navigation + Next/Back */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Kembali</span>
                    </button>
                    <div className="flex-1 flex items-center gap-1 overflow-x-auto justify-center">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = activeStep === idx;
                            const isCompleted = completedSteps[idx];
                            const isClickable = idx <= activeStep || isCompleted;
                            return (
                                <React.Fragment key={step.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleStepClick(idx)}
                                        disabled={!isClickable && idx > activeStep}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all whitespace-nowrap text-xs font-semibold shrink-0 border ${
                                            isActive
                                                ? "bg-teal-50 text-teal-700 border-teal-200 ring-2 ring-teal-200 cursor-pointer"
                                                : isCompleted
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer hover:bg-emerald-100"
                                                : isClickable
                                                ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-60"
                                        }`}
                                    >
                                        {isCompleted && !isActive ? (
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        ) : (
                                            <Icon className="w-3.5 h-3.5" />
                                        )}
                                        <span>{step.title}</span>
                                    </button>
                                    {idx < steps.length - 1 && (
                                        <div className={`flex-1 h-0.5 rounded min-w-[12px] max-w-[40px] ${
                                            isCompleted ? "bg-emerald-400" : "bg-slate-200"
                                        }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    {activeStep < 4 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 border border-teal-600 rounded-md transition-colors cursor-pointer shadow-sm"
                        >
                            <span className="hidden sm:inline">Lanjut</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e)}
                            disabled={submitting || loadingItems}
                            className="shrink-0 inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                            {submitting ? <><RefreshCw className="w-4 h-4 animate-spin" /> <span className="hidden sm:inline">Menyimpan...</span></> : <><CheckCircle2 className="w-4 h-4" /> <span className="hidden sm:inline">Simpan</span></>}
                        </button>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} id="product-form" className="space-y-4">

                    {/* STEP 0: INFO & FOTO */}
                    {activeStep === 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in duration-150">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Informasi Umum & Galeri Foto</h3>
                                <p className="text-xs text-slate-500">Lengkapi kode, nama produk, kategori, satuan & galeri foto produk</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Kode Produk */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Kode Produk <span className="text-rose-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = !isAutoCode;
                                                setIsAutoCode(next);
                                                if (next) fetchNextCode();
                                            }}
                                            className="text-[11px] text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
                                        >
                                            {isAutoCode ? "Manual" : "Otomatis"}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="code"
                                            value={data.code || ""}
                                            onChange={(e) => setData("code", e.target.value)}
                                            disabled={isAutoCode}
                                            placeholder="Contoh: PRD-001"
                                            className={`w-full px-3 py-2 text-xs border rounded-md font-mono font-semibold ${
                                                isAutoCode ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-white text-slate-800 border-slate-300 focus:border-teal-500"
                                            }`}
                                            required
                                        />
                                        {fetchingCode && (
                                            <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin absolute right-2.5 top-2.5" />
                                        )}
                                    </div>
                                </div>

                                {/* Nama Produk */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Nama Model Produk <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name || ""}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="Contoh: Baju Olahraga SD Lengan Pendek"
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-teal-500 font-semibold"
                                        required
                                    />
                                </div>

                                {/* Kategori */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Kategori Produk <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={data.category || ""}
                                        onChange={(e) => setData("category", e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-teal-500 bg-white"
                                        required
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Satuan & Harga Dasar */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Satuan <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            name="default_unit"
                                            value={data.default_unit || "Stel"}
                                            onChange={(e) => setData("default_unit", e.target.value)}
                                            className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-md focus:border-teal-500 bg-white"
                                            required
                                        >
                                            {units.map((u) => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Harga Dasar
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            name="base_price"
                                            value={formatPlain(data.base_price)}
                                            onChange={(e) => setData("base_price", parsePlain(e.target.value))}
                                            placeholder="75.000"
                                            className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-md focus:border-teal-500 font-mono text-right font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Keterangan & Spesifikasi Model
                                    </label>
                                    <textarea
                                        name="description"
                                        value={data.description || ""}
                                        onChange={(e) => setData("description", e.target.value)}
                                        rows="2"
                                        placeholder="Contoh: Kerah wangki kombinasi, celana panjang kolor karet, saku kanan-kiri"
                                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:border-teal-500 bg-white resize-none"
                                    />
                                </div>
                            </div>

                            {/* MULTI-PHOTO GALLERY */}
                            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4.5 h-4.5 text-teal-600" />
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800">Galeri Foto Produk</h4>
                                            <p className="text-[11px] text-slate-500">Upload foto tampak depan, belakang, detail jahitan. Pilih foto utama.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer"
                                    >
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        <span>+ Upload Foto</span>
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {(data.existing_images?.length === 0 && data.new_images?.length === 0) ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-lg p-6 text-center bg-white cursor-pointer transition-all hover:bg-teal-50/30 group"
                                    >
                                        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-teal-600 mx-auto mb-1.5 transition-colors" />
                                        <p className="text-xs font-bold text-slate-700 group-hover:text-teal-900">Klik untuk memilih foto produk</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Format JPG, PNG, WEBP (Bisa pilih beberapa foto sekaligus)</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {(data.existing_images || []).map((img) => {
                                            const isPrimary = data.primary_image_id ? data.primary_image_id === img.id : Boolean(img.is_primary);
                                            return (
                                                <div key={img.id} className={`relative rounded-lg overflow-hidden border bg-white shadow-2xs group transition-all ${isPrimary ? "border-teal-500 ring-2 ring-teal-500/30" : "border-slate-200 hover:border-slate-300"}`}>
                                                    <img src={img.image_url} alt="Foto Produk" className="w-full h-28 object-cover" />
                                                    {isPrimary && (
                                                        <div className="absolute top-1.5 left-1.5 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                                                            <Star className="w-2.5 h-2.5 fill-current" />
                                                            <span>Utama</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                                        {!isPrimary && (
                                                            <button type="button" onClick={() => handleSetPrimaryExisting(img.id)} title="Jadikan Foto Utama" className="p-1.5 rounded bg-white text-teal-700 hover:bg-teal-50 transition-colors text-[10px] font-bold inline-flex items-center gap-1">
                                                                <Star className="w-3 h-3" />
                                                                <span>Utama</span>
                                                            </button>
                                                        )}
                                                        <button type="button" onClick={() => handleRemoveExistingImage(img.id)} title="Hapus Foto" className="p-1.5 rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(data.new_images || []).map((img, idx) => {
                                            const isPrimary = data.primary_image_index === idx || (data.existing_images?.length === 0 && data.primary_image_index === null && idx === 0);
                                            return (
                                                <div key={idx} className={`relative rounded-lg overflow-hidden border bg-white shadow-2xs group transition-all ${isPrimary ? "border-teal-500 ring-2 ring-teal-500/30" : "border-slate-200 hover:border-slate-300"}`}>
                                                    <img src={img.preview} alt="Foto Baru" className="w-full h-28 object-cover" />
                                                    <div className="absolute top-1.5 right-1.5 bg-sky-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-2xs">Baru</div>
                                                    {isPrimary && (
                                                        <div className="absolute top-1.5 left-1.5 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                                                            <Star className="w-2.5 h-2.5 fill-current" />
                                                            <span>Utama</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                                        {!isPrimary && (
                                                            <button type="button" onClick={() => handleSetPrimaryNew(idx)} title="Jadikan Foto Utama" className="p-1.5 rounded bg-white text-teal-700 hover:bg-teal-50 transition-colors text-[10px] font-bold inline-flex items-center gap-1">
                                                                <Star className="w-3 h-3" />
                                                                <span>Utama</span>
                                                            </button>
                                                        )}
                                                        <button type="button" onClick={() => handleRemoveNewImage(idx)} title="Batal Upload" className="p-1.5 rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 1: VARIAN UKURAN */}
                    {activeStep === 1 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 animate-in fade-in duration-150">
                            <div className="flex items-start justify-between gap-3 overflow-visible">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Varian Ukuran & Harga Jual</h3>
                                    <p className="text-xs text-slate-500">Atur harga jual per ukuran. Kosongkan jika harga seragam untuk semua ukuran</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap shrink-0 bg-teal-50/50 border border-teal-200 rounded-lg p-1.5 overflow-visible">
                                    {[...new Set(masterSizes.map((s) => s.category))].map((category) => (
                                        <button key={category} type="button" onClick={() => handleApplyPresetSizes(category)}
                                            className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-teal-50 text-teal-700 border border-slate-200 rounded shadow-2xs transition-colors cursor-pointer">
                                            + {category}
                                        </button>
                                    ))}
                                    <div className="relative">
                                        <button type="button" onClick={handleAddSizeRow}
                                            className="px-2.5 py-1 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white border border-teal-600 rounded shadow-2xs transition-colors cursor-pointer">
                                            + Ukuran Kustom
                                        </button>
                                        {showSizePopover && (
                                            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-3rem)] bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-30">
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Ukuran <span className="text-rose-500">*</span></label>
                                                        <select value={dialogSizeId} onChange={(e) => setDialogSizeId(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium">
                                                            <option value="">-- Pilih Ukuran --</option>
                                                            {masterSizes.map((ms) => {
                                                                const isSelected = definedSizes.some((s) => String(s.size_id) === String(ms.id));
                                                                return <option key={ms.id} value={ms.id} disabled={isSelected}>{ms.size_name} ({ms.category})</option>;
                                                            })}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Jual</label>
                                                        <input type="text" inputMode="numeric" value={formatPlain(dialogPrice)} onChange={(e) => setDialogPrice(parsePlain(e.target.value))} placeholder="0" className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-md text-right focus:border-teal-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
                                                        <input type="text" value={dialogNotes} onChange={(e) => setDialogNotes(e.target.value)} placeholder="Lingkar Dada 100cm" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:border-teal-500" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                                                    <button type="button" onClick={() => setShowSizePopover(false)} className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer">Batal</button>
                                                    <button type="button" onClick={handleConfirmSizeDialog} className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md cursor-pointer">Terapkan</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {(definedSizes.length === 0) ? (
                                <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                                    <Ruler className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                                    <p className="text-xs font-bold text-slate-700">Belum ada varian ukuran.</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Pilih tombol preset di atas atau tambah ukuran kustom.</p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs bg-white">
                                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                                        <span className="text-xs font-bold text-slate-700">Daftar Varian Ukuran ({definedSizes.length} Varian)</span>
                                        <div className="flex items-center gap-3">
                                            <button type="button" onClick={handleApplyBasePriceToAllSizes}
                                                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer">
                                                Samakan Semua Harga Dasar ({formatCurrency(Number(data.base_price || 0))})
                                            </button>
                                            <button type="button" onClick={() => setData("sizes", [])}
                                                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer bg-rose-50 px-2 py-1 rounded border border-rose-200">
                                                <Trash2 className="w-3 h-3" /> Hapus Semua
                                            </button>
                                        </div>
                                    </div>
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                                <th className="py-2 px-3 w-10 text-center">No</th>
                                                <th className="py-2 px-3 min-w-[200px]">Ukuran <span className="text-rose-500">*</span></th>
                                                <th className="py-2 px-3 w-44">Harga Jual <span className="text-rose-500">*</span></th>
                                                <th className="py-2 px-3">Catatan</th>
                                                <th className="py-2 px-3 w-12 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {definedSizes.map((sz, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                                                    <td className="py-2 px-3">
                                                        <select value={sz.size_id || ""} onChange={(e) => handleSizeFieldChange(idx, "size_id", e.target.value)} required
                                                            className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded focus:border-teal-500 bg-white">
                                                            <option value="">-- Pilih Ukuran --</option>
                                                            {masterSizes.map((ms) => {
                                                                const isSelected = definedSizes.some((s, sIdx) => sIdx !== idx && String(s.size_id) === String(ms.id));
                                                                return <option key={ms.id} value={ms.id} disabled={isSelected}>{ms.size_name} ({ms.category})</option>;
                                                            })}
                                                        </select>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input type="text" inputMode="numeric" value={formatPlain(sz.price)} onChange={(e) => handleSizeFieldChange(idx, "price", parsePlain(e.target.value))}
                                                            required placeholder="0"
                                                            className="w-full px-2.5 py-1.5 text-xs font-bold font-mono border border-slate-200 rounded focus:border-teal-500 text-slate-900 text-right" />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input type="text" value={sz.notes || ""} onChange={(e) => handleSizeFieldChange(idx, "notes", e.target.value)}
                                                            placeholder="Contoh: Lingkar Dada 100cm"
                                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white" />
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <Tooltip content="Hapus ukuran" position="top">
                                                            <button type="button" onClick={() => handleRemoveSizeRow(idx)} className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </Tooltip>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: RESEP BAHAN (BOM) */}
                    {activeStep === 2 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 animate-in fade-in duration-150">
                            <div className="flex items-start justify-between gap-3 overflow-visible">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Resep Kebutuhan Bahan Baku (BOM)</h3>
                                    <p className="text-xs text-slate-500">Kebutuhan bahan per ukuran, otomatis potong stok gudang saat produksi</p>
                                </div>
                                <div className="relative shrink-0">
                                    <button type="button" onClick={() => setShowQuickAddAll((prev) => !prev)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 border border-teal-600 rounded-md transition-colors cursor-pointer shadow-sm">
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                        <span>+ Tambah 1 Bahan ke SEMUA Ukuran</span>
                                    </button>
                                    {showQuickAddAll && (
                                        <div className="absolute right-0 top-full mt-2 w-[520px] max-w-[calc(100vw-3rem)] bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-40">
                                            <div className="flex items-center justify-between gap-3 pb-2.5 mb-3 border-b border-slate-100">
                                                <span className="text-xs font-bold text-slate-900">Tambah 1 Bahan ke Semua Ukuran</span>
                                                <button type="button" onClick={() => setShowQuickAddAll(false)} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">Bahan Baku <span className="text-rose-500">*</span></label>
                                                    <select value={quickItemSelect} onChange={(e) => {
                                                        const itmId = e.target.value;
                                                        setQuickItemSelect(itmId);
                                                        const found = rawItems.find((i) => String(i.id) === String(itmId));
                                                        if (found) { setQuickUnit(found.unit?.name || "Meter"); setQuickConversionRate(1); }
                                                    }} className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-medium">
                                                        <option value="">-- Pilih Bahan --</option>
                                                        {rawItems.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">Kebutuhan</label>
                                                    <input type="text" inputMode="decimal" value={formatQty(quickQty)} onChange={(e) => setQuickQty(parseFloat(e.target.value.replace(",", ".")) || 0)} className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-md text-right" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">Satuan</label>
                                                    <div className="w-full px-2.5 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-bold flex items-center justify-between gap-2">
                                                        <span className="truncate">{quickUnit || "Meter"}</span><span className="text-[9px] font-medium text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 shrink-0">Auto</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">Hasil Jadi</label>
                                                    <input type="text" inputMode="decimal" value={formatQty(quickYieldQty)} onChange={(e) => setQuickYieldQty(parseFloat(e.target.value.replace(",", ".")) || 0)} className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-teal-200 rounded-md text-right bg-teal-50/40" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">Konversi</label>
                                                    <input type="text" inputMode="decimal" value={formatQty(quickConversionRate)} onChange={(e) => setQuickConversionRate(parseFloat(e.target.value.replace(",", ".")) || 0)} className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-md text-right" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">Catatan</label>
                                                    <input type="text" value={quickNotes} onChange={(e) => setQuickNotes(e.target.value)} placeholder="Pola / Komponen" className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                                                <button type="button" onClick={() => setShowQuickAddAll(false)} className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer">Batal</button>
                                                <button type="button" onClick={handleQuickAddMaterialToAll} disabled={!quickItemSelect} className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-md cursor-pointer">Terapkan</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Size Cards - collapsible default tutup */}
                            {(definedSizes.length === 0) ? (
                                <div className="border border-slate-200 rounded-xl shadow-2xs bg-white overflow-visible">
                                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 rounded-t-xl">
                                        <button type="button" onClick={() => toggleBOMCard('ALL')} className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left">
                                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openBOMCards.has('ALL') ? 'rotate-180' : ''}`} />
                                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                                            <h4 className="text-xs font-bold text-slate-900">Card Resep Standar (Semua Ukuran)</h4>
                                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">{universalMaterials.length} Bahan</span>
                                        </button>
                                        <div className="relative">
                                            <button type="button" onClick={() => handleAddMaterialToSize("ALL", null)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-2xs transition-colors cursor-pointer">
                                                <Plus className="w-3.5 h-3.5" /> <span>+ Tambah Bahan</span>
                                            </button>
                                            {showMaterialDialog?.sizeName === "ALL" && (
                                                <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-3rem)] bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-40">
                                                    <div className="flex items-center justify-between gap-3 pb-2.5 mb-3 border-b border-slate-100">
                                                        <span className="text-xs font-bold text-slate-900">Tambah Bahan — Semua Ukuran</span>
                                                        <button type="button" onClick={() => setShowMaterialDialog(null)} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Bahan Baku <span className="text-rose-500">*</span></label>
                                                            <select value={dialogMaterial.item_id || ""} onChange={(e) => { const id = e.target.value; const itm = rawItems.find((item) => String(item.id) === String(id)); setDialogMaterial((prev) => ({ ...prev, item_id: id, unit_name: itm?.unit?.name || "Meter", conversion_rate: 1 })); }} className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-medium">
                                                                <option value="">-- Pilih Bahan --</option>
                                                                {rawItems.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Kebutuhan</label>
                                                            <input type="text" inputMode="decimal" value={formatQty(dialogMaterial.required_qty)} onChange={(e) => setDialogMaterial((prev) => ({ ...prev, required_qty: parseFloat(e.target.value.replace(",", ".")) || 0 }))} className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-md text-right" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Satuan</label>
                                                            <div className="w-full px-2.5 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-bold flex items-center justify-between gap-2">
                                                                <span className="truncate">{dialogMaterial.unit_name || "Meter"}</span><span className="text-[9px] font-medium text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 shrink-0">Auto</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Hasil Jadi</label>
                                                            <input type="text" inputMode="decimal" value={formatQty(dialogMaterial.yield_qty)} onChange={(e) => setDialogMaterial((prev) => ({ ...prev, yield_qty: parseFloat(e.target.value.replace(",", ".")) || 0 }))} className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-teal-200 rounded-md text-right bg-teal-50/40" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Konversi</label>
                                                            <input type="text" inputMode="decimal" value={formatQty(dialogMaterial.conversion_rate)} onChange={(e) => setDialogMaterial((prev) => ({ ...prev, conversion_rate: parseFloat(e.target.value.replace(",", ".")) || 0 }))} className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-md text-right" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Catatan</label>
                                                            <input type="text" value={dialogMaterial.notes || ""} onChange={(e) => setDialogMaterial((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Pola / Komponen" className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md" />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                                                        <button type="button" onClick={() => setShowMaterialDialog(null)} className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer">Batal</button>
                                                        <button type="button" onClick={handleConfirmMaterialDialog} className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md cursor-pointer">Terapkan</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {openBOMCards.has('ALL') && (
                                        universalMaterials.length === 0 ? (
                                            <div className="p-6 text-center text-xs text-slate-400">
                                                <Package className="w-7 h-7 mx-auto text-slate-300 mb-1" />
                                                <p className="font-semibold text-slate-600">Belum ada bahan baku di resep standar.</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Klik "+ Tambah Bahan" untuk menambahkan resep bahan.</p>
                                            </div>
                                        ) : (
                                            <div className="p-3 space-y-3">
                                                {universalMaterials.map((mat) => {
                                                    const originalIndex = mat._origIndex;
                                                    const selectedItem = rawItems.find((i) => String(i.id) === String(mat.item_id));
                                                    return (
                                                        <div key={originalIndex} className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
                                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-start">
                                                                <div className="sm:col-span-3">
                                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Bahan Baku Gudang</label>
                                                                    <select value={mat.item_id || ""} onChange={(e) => handleMaterialFieldChange(originalIndex, "item_id", e.target.value)}
                                                                        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white font-medium">
                                                                        <option value="">-- Pilih Bahan Baku --</option>
                                                                        {rawItems.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code}) - {item.unit?.name || ""}</option>)}
                                                                    </select>
                                                                    {selectedItem && <span className="text-[10px] text-teal-700 block mt-1 font-medium">Stok: {selectedItem.real_stock ?? 0} {selectedItem.unit?.name || "Satuan"}</span>}
                                                                </div>
                                                                <div className="sm:col-span-2">
                                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Kebutuhan Bahan</label>
                                                                    <input type="text" inputMode="decimal" value={formatQty(mat.required_qty)} onChange={(e) => handleMaterialFieldChange(originalIndex, "required_qty", parseFloat(e.target.value.replace(",", ".")) || 0)}
                                                                        className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded focus:border-teal-500 bg-white text-right" />
                                                                </div>
                                                                <div className="sm:col-span-2">
                                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Satuan</label>
                                                                    <div className="w-full px-2.5 py-1.5 text-xs bg-slate-100/90 border border-slate-200 rounded text-slate-700 font-bold flex items-center justify-between">
                                                                        <span>{selectedItem?.unit?.name || "Meter"}</span>
                                                                        <span className="text-[9px] font-medium text-teal-600 bg-teal-50 px-1 py-0.2 rounded border border-teal-200">Auto</span>
                                                                    </div>
                                                                </div>
                                                                <div className="sm:col-span-2">
                                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Hasil Jadi (Baju)</label>
                                                                    <input type="text" inputMode="decimal" value={formatQty(mat.yield_qty)} onChange={(e) => handleMaterialFieldChange(originalIndex, "yield_qty", parseFloat(e.target.value.replace(",", ".")) || 0)}
                                                                        className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-teal-200 rounded focus:border-teal-500 bg-teal-50/40 text-right" />
                                                                </div>
                                                                <div className="sm:col-span-2">
                                                                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Estimasi Konversi</label>
                                                                    <input type="text" inputMode="decimal" value={formatQty(mat.conversion_rate)} onChange={(e) => handleMaterialFieldChange(originalIndex, "conversion_rate", parseFloat(e.target.value.replace(",", ".")) || 0)}
                                                                        className="w-full px-2 py-1.5 text-xs font-mono border border-slate-200 rounded focus:border-teal-500 bg-white" />
                                                                </div>
                                                                <div className="sm:col-span-1 flex items-center justify-center pt-4">
                                                                    <button type="button" onClick={() => handleRemoveMaterialRow(originalIndex)} className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3.5">
                                    {definedSizes.map((sz, szIdx) => {
                                        const sizeName = sz.size_name;
                                        const sizeMaterials = materialsWithOriginalIndex.filter((m) => m.size_name === sizeName);
                                        const otherSizes = definedSizeNames.filter((s) => s !== sizeName);
                                        const isOpen = openBOMCards.has(sizeName);
                                        return (
                                            <div key={szIdx} className="border border-slate-200 rounded-xl shadow-2xs bg-white overflow-visible">
                                                <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 rounded-t-xl">
                                                    <button type="button" onClick={() => toggleBOMCard(sizeName)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left flex-1 min-w-0">
                                                        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                        <div className="w-7 h-7 rounded-md bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">{sizeName}</div>
                                                        <div className="truncate flex items-center gap-1 flex-wrap">
                                                            <span className="text-xs font-bold text-slate-900">Resep Bahan Ukuran {sizeName}</span>
                                                            {(() => { const cat = masterSizes.find((ms) => String(ms.id) === String(sz.size_id))?.category || masterSizes.find((ms) => ms.size_name === sizeName)?.category; return cat ? <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{cat}</span> : null; })()}
                                                            {sz.price > 0 && <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded font-mono">Rp {Number(sz.price).toLocaleString("id-ID")}</span>}
                                                            <span className="text-[10px] text-slate-500 font-medium">{sizeMaterials.length} bahan</span>
                                                        </div>
                                                    </button>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {otherSizes.length > 0 && (
                                                            <div className="relative">
                                                                <button type="button" onClick={() => setOpenCopyMenu(openCopyMenu === sizeName ? null : sizeName)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md shadow-sm transition-colors cursor-pointer">
                                                                    <Copy className="w-3.5 h-3.5" /> Salin Resep <ChevronDown className="w-3 h-3" />
                                                                </button>
                                                                {openCopyMenu === sizeName && (
                                                                    <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-1 w-48 z-20">
                                                                        {otherSizes.map((os) => {
                                                                            const count = materialsWithOriginalIndex.filter((m) => m.size_name === os).length;
                                                                            return (
                                                                                <button key={os} type="button" onClick={() => { handleCopyMaterialsBetweenSizes(os, sizeName); setOpenCopyMenu(null); }}
                                                                                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 rounded flex items-center justify-between">
                                                                                    <span>Salin dari {os}</span><span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{count} bahan</span>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="relative">
                                                            <button type="button" onClick={() => handleAddMaterialToSize(sizeName, sz.size_id)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-2xs transition-colors cursor-pointer">
                                                                <Plus className="w-3.5 h-3.5" /> <span>+ Tambah Bahan</span>
                                                            </button>
                                                            {showMaterialDialog?.sizeName === sizeName && String(showMaterialDialog?.sizeId || "") === String(sz.size_id || "") && (
                                                                <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-3rem)] bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-40">
                                                                    <div className="flex items-center justify-between gap-3 pb-2.5 mb-3 border-b border-slate-100">
                                                                        <span className="text-xs font-bold text-slate-900">Tambah Bahan — Ukuran {showMaterialDialog.sizeName}</span>
                                                                        <button type="button" onClick={() => setShowMaterialDialog(null)} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Bahan Baku <span className="text-rose-500">*</span></label>
                                                                            <select value={dialogMaterial.item_id || ""} onChange={(e) => { const id = e.target.value; const itm = rawItems.find((item) => String(item.id) === String(id)); setDialogMaterial((prev) => ({ ...prev, item_id: id, unit_name: itm?.unit?.name || "Meter", conversion_rate: 1 })); }} className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-medium">
                                                                                <option value="">-- Pilih Bahan --</option>
                                                                                {rawItems.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Kebutuhan</label>
                                                                            <input type="text" inputMode="decimal" value={formatQty(dialogMaterial.required_qty)} onChange={(e) => setDialogMaterial((prev) => ({ ...prev, required_qty: parseFloat(e.target.value.replace(",", ".")) || 0 }))} className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-md text-right" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Satuan</label>
                                                                            <div className="w-full px-2.5 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-bold flex items-center justify-between gap-2">
                                                                                <span className="truncate">{dialogMaterial.unit_name || "Meter"}</span><span className="text-[9px] font-medium text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 shrink-0">Auto</span>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Hasil Jadi</label>
                                                                            <input type="text" inputMode="decimal" value={formatQty(dialogMaterial.yield_qty)} onChange={(e) => setDialogMaterial((prev) => ({ ...prev, yield_qty: parseFloat(e.target.value.replace(",", ".")) || 0 }))} className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-teal-200 rounded-md text-right bg-teal-50/40" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Konversi</label>
                                                                            <input type="text" inputMode="decimal" value={formatQty(dialogMaterial.conversion_rate)} onChange={(e) => setDialogMaterial((prev) => ({ ...prev, conversion_rate: parseFloat(e.target.value.replace(",", ".")) || 0 }))} className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-md text-right" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Catatan</label>
                                                                            <input type="text" value={dialogMaterial.notes || ""} onChange={(e) => setDialogMaterial((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Pola / Komponen" className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                                                                        <button type="button" onClick={() => setShowMaterialDialog(null)} className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer">Batal</button>
                                                                        <button type="button" onClick={handleConfirmMaterialDialog} className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md cursor-pointer">Terapkan</button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isOpen && (
                                                    sizeMaterials.length === 0 ? (
                                                        <div className="p-5 text-center text-xs text-slate-400 bg-slate-50/30">
                                                            <p className="font-semibold text-slate-600">Belum ada bahan untuk Ukuran {sizeName}.</p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">Klik "+ Tambah Bahan" atau salin dari ukuran lain.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="p-3 space-y-3">
                                                            {sizeMaterials.map((mat) => {
                                                                const originalIndex = mat._origIndex;
                                                                const selectedItem = rawItems.find((i) => String(i.id) === String(mat.item_id));
                                                                return (
                                                                    <div key={originalIndex} className="p-3 rounded-lg border border-slate-200 bg-slate-50/80 space-y-2">
                                                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-start">
                                                                            <div className="sm:col-span-3">
                                                                                <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Bahan Baku Gudang</label>
                                                                                <select value={mat.item_id || ""} onChange={(e) => handleMaterialFieldChange(originalIndex, "item_id", e.target.value)}
                                                                                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white font-medium">
                                                                                    <option value="">-- Pilih Bahan Baku --</option>
                                                                                    {rawItems.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code}) - {item.unit?.name || ""}</option>)}
                                                                                </select>
                                                                            </div>
                                                                            <div className="sm:col-span-2">
                                                                                <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Kebutuhan Bahan</label>
                                                                                <input type="text" inputMode="decimal" value={formatQty(mat.required_qty)} onChange={(e) => handleMaterialFieldChange(originalIndex, "required_qty", parseFloat(e.target.value.replace(",", ".")) || 0)}
                                                                                    className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded focus:border-teal-500 bg-white text-right" />
                                                                            </div>
                                                                            <div className="sm:col-span-2">
                                                                                <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Satuan</label>
                                                                                <div className="w-full px-2.5 py-1.5 text-xs bg-slate-100/90 border border-slate-200 rounded text-slate-700 font-bold flex items-center justify-between">
                                                                                    <span>{selectedItem?.unit?.name || "Meter"}</span>
                                                                                    <span className="text-[9px] font-medium text-teal-600 bg-teal-50 px-1 py-0.2 rounded border border-teal-200">Auto</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="sm:col-span-2">
                                                                                <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Hasil Jadi (Baju)</label>
                                                                                <input type="text" inputMode="decimal" value={formatQty(mat.yield_qty)} onChange={(e) => handleMaterialFieldChange(originalIndex, "yield_qty", parseFloat(e.target.value.replace(",", ".")) || 0)}
                                                                                    className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-teal-200 rounded focus:border-teal-500 bg-teal-50/40 text-right" />
                                                                            </div>
                                                                            <div className="sm:col-span-2">
                                                                                <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Estimasi Konversi</label>
                                                                                <input type="text" inputMode="decimal" value={formatQty(mat.conversion_rate)} onChange={(e) => handleMaterialFieldChange(originalIndex, "conversion_rate", parseFloat(e.target.value.replace(",", ".")) || 0)}
                                                                                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-200 rounded focus:border-teal-500 bg-white" />
                                                                            </div>
                                                                            <div className="sm:col-span-1 flex items-center justify-center pt-4">
                                                                                <button type="button" onClick={() => handleApplyMaterialToAllSizes(originalIndex)}
                                                                                    className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded text-xs transition-colors cursor-pointer" title="Terapkan ke SEMUA ukuran">
                                                                                    <Layers className="w-3.5 h-3.5" />
                                                                                </button>
                                                                                <button type="button" onClick={() => handleRemoveMaterialRow(originalIndex)} className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer">
                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: LANGKAH PRODUKSI */}
                    {activeStep === 3 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 animate-in fade-in duration-150">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Langkah Produksi (Jahit)</h3>
                                    <p className="text-xs text-slate-500">Urutan jahit & upah penjahit per langkah</p>
                                </div>
                                <button type="button" onClick={handleAddCustomProductionStep}
                                    className="px-3 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-md shadow-sm transition-colors cursor-pointer">
                                    + Langkah Kustom
                                </button>
                            </div>

                            {(data.production_steps || []).length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                                    <SlidersHorizontal className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                                    <p className="text-xs font-bold text-slate-700">Belum ada langkah produksi.</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Pilih dari master atau tambah langkah kustom.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {(data.production_steps || []).map((step, idx) => (
                                        <div key={idx} className="border border-slate-200 rounded-lg bg-white flex items-center gap-3 p-3 hover:border-teal-300 transition-all">
                                            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">{idx + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                {step.production_step_id ? (
                                                    <span className="text-xs font-bold text-slate-800">{step._master_name || step.production_step?.name}</span>
                                                ) : (
                                                    <input type="text" value={step.custom_name || ""} onChange={(e) => handleStepNameChange(idx, e.target.value)}
                                                        placeholder="Nama langkah kustom..."
                                                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-teal-500 font-bold" />
                                                )}
                                            </div>
                                            <div className="w-32">
                                                <input type="text" inputMode="numeric" value={formatPlain(step.wage)} onChange={(e) => handleStepWageChange(idx, parsePlain(e.target.value))}
                                                    placeholder="0" className="w-full px-2 py-1.5 text-xs font-bold font-mono border border-slate-200 rounded focus:border-teal-500 text-right" />
                                            </div>
                                            <Tooltip content="Pindah ke atas" position="top">
                                                <button type="button" onClick={() => handleMoveStep(idx, "up")} disabled={idx === 0}
                                                    className="p-1 text-slate-400 hover:text-teal-600 disabled:opacity-30 cursor-pointer">
                                                    <ChevronUp className="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                            <Tooltip content="Pindah ke bawah" position="top">
                                                <button type="button" onClick={() => handleMoveStep(idx, "down")} disabled={idx === (data.production_steps || []).length - 1}
                                                    className="p-1 text-slate-400 hover:text-teal-600 disabled:opacity-30 cursor-pointer">
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                            <Tooltip content="Hapus langkah" position="top">
                                                <button type="button" onClick={() => handleRemoveProductionStep(idx)}
                                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Master steps selector */}
                            {masterSteps.length > 0 && (
                                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                                    <label className="block text-xs font-semibold text-slate-700 mb-2">Tambah dari Master Langkah Produksi:</label>
                                    <div className="flex flex-wrap gap-2">
                                        {masterSteps.map((ms) => (
                                            <button key={ms.id} type="button" onClick={() => handleAddProductionStep(ms.id)}
                                                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-teal-50 text-slate-700 border border-slate-300 rounded hover:border-teal-400 transition-colors cursor-pointer">
                                                + {ms.name} ({formatCurrency(ms.default_wage)})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: RINGKASAN */}
                    {activeStep === 4 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in duration-150">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Ringkasan Produk</h3>
                                <p className="text-xs text-slate-500">Periksa kembali data sebelum menyimpan produk</p>
                            </div>

                            {/* Summary Cards - pindah ke atas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                                    <div className="text-[11px] font-semibold text-teal-700 uppercase">Total Upah Jahit</div>
                                    <div className="text-lg font-bold text-teal-800 font-mono">{formatCurrency(totalWage)}</div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="text-[11px] font-semibold text-blue-700 uppercase">Total Biaya Bahan</div>
                                    <div className="text-lg font-bold text-blue-800 font-mono">
                                        {formatCurrency(
                                            (data.materials || []).reduce((sum, m) => {
                                                const item = rawItems.find((i) => String(i.id) === String(m.item_id));
                                                return sum + Number(m.required_qty || 0) * Number(item?.price || 0);
                                            }, 0)
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <div className="text-[11px] font-semibold text-emerald-700 uppercase">Estimasi HPP</div>
                                    <div className="text-lg font-bold text-emerald-800 font-mono">
                                        {formatCurrency(totalWage + (data.materials || []).reduce((sum, m) => {
                                            const item = rawItems.find((i) => String(i.id) === String(m.item_id));
                                            return sum + Number(m.required_qty || 0) * Number(item?.price || 0);
                                        }, 0))}
                                    </div>
                                </div>
                            </div>

                            {/* Info Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Kode</div>
                                    <div className="text-sm font-bold text-slate-800 font-mono">{data.code || "-"}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Nama Produk</div>
                                    <div className="text-sm font-bold text-slate-800">{data.name || "-"}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Kategori</div>
                                    <div className="text-sm font-bold text-slate-800">{data.category || "-"}</div>
                                </div>
                            </div>

                            {/* Varian & Langkah sebelahan */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs bg-white">
                                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-700">Varian Ukuran ({definedSizes.length})</h4>
                                    </div>
                                    {definedSizes.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-slate-500">Harga seragam: <strong>{formatCurrency(Number(data.base_price||0))}</strong> • HPP: <strong>{formatCurrency((() => { const c = (data.materials||[]).reduce((s,m)=> s+ Number(m.required_qty||0)*Number((rawItems.find(i=>String(i.id)===String(m.item_id))?.price||0)),0); return c+totalWage; })())}</strong> • Laba: <strong className={Number(data.base_price||0) - ((data.materials||[]).reduce((s,m)=> s+ Number(m.required_qty||0)*Number((rawItems.find(i=>String(i.id)===String(m.item_id))?.price||0)),0)+totalWage) >=0 ? "text-emerald-600" : "text-rose-600"}>{formatCurrency(Number(data.base_price||0) - ((data.materials||[]).reduce((s,m)=> s+ Number(m.required_qty||0)*Number((rawItems.find(i=>String(i.id)===String(m.item_id))?.price||0)),0)+totalWage))}</strong></div>
                                    ) : (
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                                                    <th className="py-2 px-2 w-8 text-center">No</th>
                                                    <th className="py-2 px-2">Ukuran</th>
                                                    <th className="py-2 px-2 w-28 text-right">Harga Jual</th>
                                                    <th className="py-2 px-2 w-24 text-right">HPP</th>
                                                    <th className="py-2 px-2 w-24 text-right">Laba</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {definedSizes.map((sz, idx) => {
                                                    const cat = masterSizes.find((ms) => String(ms.id) === String(sz.size_id))?.category || "";
                                                    const matsForSize = materialsWithOriginalIndex.filter((m) => m.size_name === sz.size_name);
                                                    const sizeCost = matsForSize.reduce((s,m)=> s+ Number(m.required_qty||0)*Number((rawItems.find(i=>String(i.id)===String(m.item_id))?.price||0)),0);
                                                    const globalCost = universalMaterials.reduce((s,m)=> s+ Number(m.required_qty||0)*Number((rawItems.find(i=>String(i.id)===String(m.item_id))?.price||0)),0);
                                                    const hpp = sizeCost + globalCost + totalWage;
                                                    const laba = Number(sz.price||0) - hpp;
                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-50/60">
                                                            <td className="py-1.5 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                                                            <td className="py-1.5 px-2"><span className="font-bold text-slate-900">{sz.size_name || "-"}</span>{cat && <span className="ml-1 text-[10px] bg-slate-100 px-1 py-0.5 rounded border">{cat}</span>}</td>
                                                            <td className="py-1.5 px-2 text-right font-bold text-teal-700 font-mono">{formatCurrency(Number(sz.price||0))}</td>
                                                            <td className="py-1.5 px-2 text-right font-mono text-slate-600">{formatCurrency(hpp)}</td>
                                                            <td className={`py-1.5 px-2 text-right font-bold font-mono ${laba >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrency(laba)}<span className="text-[10px] font-normal ml-1">{sz.price ? `(${((laba/Number(sz.price||1))*100).toFixed(0)}%)` : ""}</span></td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs bg-white">
                                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-700">Langkah Produksi ({(data.production_steps||[]).length})</h4>
                                    </div>
                                    {(data.production_steps || []).length === 0 ? (
                                        <div className="p-4 text-center text-xs text-slate-400">Belum ada langkah produksi</div>
                                    ) : (
                                        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                                            {(data.production_steps || []).map((step, idx) => (
                                                <div key={idx} className="px-4 py-2 flex items-center justify-between text-xs hover:bg-slate-50/50">
                                                    <span className="font-bold text-slate-800 truncate mr-2">{idx + 1}. {step._master_name || step.custom_name || "-"}</span>
                                                    <span className="font-bold text-teal-700 font-mono shrink-0">{formatCurrency(Number(step.wage || 0))}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BOM per ukuran - card grid */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs bg-white">
                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-700">Resep Bahan Baku — { (data.materials||[]).length} total</h4>
                                </div>
                                {(data.materials || []).length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-400">Belum ada resep bahan</div>
                                ) : definedSizes.length === 0 ? (
                                    <div className="p-3 grid grid-cols-1 gap-3">
                                        <div className="border border-slate-200 rounded-lg bg-slate-50/50 overflow-hidden">
                                            <button type="button" onClick={() => toggleRingkasanCard('ALL')} className="w-full flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200 hover:bg-slate-50 transition-colors text-left">
                                                <div className="flex items-center gap-1.5">
                                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openRingkasanCards.has('ALL') ? 'rotate-180' : ''}`} />
                                                    <span className="text-xs font-bold text-slate-700">Semua Ukuran — {universalMaterials.length} bahan</span>
                                                </div>
                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{universalMaterials.length} bahan</span>
                                            </button>
                                            {openRingkasanCards.has('ALL') && (
                                                <div className="p-3 space-y-1.5 bg-slate-50/50">
                                                    {universalMaterials.map((mat, idx) => {
                                                        const itm = rawItems.find((i) => String(i.id) === String(mat.item_id));
                                                        const cost = Number(mat.required_qty||0) * Number(itm?.price||0);
                                                        return (
                                                            <div key={idx} className="flex items-center justify-between text-xs bg-white rounded px-3 py-2 border border-slate-100">
                                                                <span className="font-medium text-slate-800">{itm?.name || "-"}</span>
                                                                <span className="font-mono text-slate-600">{formatQty(mat.required_qty)} {mat.unit_name} {cost>0?`= ${formatCurrency(cost)}`:""}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {definedSizes.map((sz, sIdx) => {
                                            const mats = materialsWithOriginalIndex.filter((m) => m.size_name === sz.size_name);
                                            const cat = masterSizes.find((ms) => String(ms.id) === String(sz.size_id))?.category || masterSizes.find((ms) => ms.size_name === sz.size_name)?.category || "";
                                            const isOpen = openRingkasanCards.has(sz.size_name);
                                            return (
                                                <div key={sIdx} className="border border-slate-200 rounded-lg bg-slate-50/50 overflow-visible">
                                                    <button type="button" onClick={() => toggleRingkasanCard(sz.size_name)} className="w-full bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between gap-2 rounded-t-lg hover:bg-slate-50 transition-colors text-left">
                                                        <div className="flex items-center gap-1.5">
                                                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                                            <span className="text-xs font-bold text-slate-800">Ukuran {sz.size_name}</span>
                                                            {cat && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{cat}</span>}
                                                        </div>
                                                        <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200 font-mono">{mats.length} bahan</span>
                                                    </button>
                                                    {isOpen && (
                                                        mats.length === 0 ? (
                                                            <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-b-lg">Tidak ada bahan</div>
                                                        ) : (
                                                            <div className="p-2 space-y-1.5 max-h-48 overflow-y-auto bg-slate-50/50 rounded-b-lg">
                                                                {mats.map((mat, mIdx) => {
                                                                    const itm = rawItems.find((i) => String(i.id) === String(mat.item_id));
                                                                    const cost = Number(mat.required_qty||0) * Number(itm?.price||0);
                                                                    return (
                                                                        <div key={mIdx} className="flex items-center justify-between text-xs bg-white rounded px-2.5 py-1.5 border border-slate-100">
                                                                            <span className="font-medium text-slate-700 truncate mr-2">{itm?.name || "-"}</span>
                                                                            <span className="font-mono text-slate-600 shrink-0">{formatQty(mat.required_qty)} {mat.unit_name}{cost>0?` • ${formatCurrency(cost)}`:""}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </form>
            </div>

        </DashboardLayout>
    );
}
