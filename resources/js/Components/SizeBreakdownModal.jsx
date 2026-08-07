import React, { memo, useState, useEffect, useMemo } from "react";
import { Ruler, X, Check, Plus, Trash2, RotateCcw, Sparkles, Tag, DollarSign, RefreshCw, Layers } from "lucide-react";

const adultSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
const numberSizes = ["No. 1", "No. 2", "No. 3", "No. 4", "No. 5", "No. 6", "No. 7", "No. 8", "No. 9", "No. 10", "No. 11", "No. 12"];

const SizeBreakdownModal = memo(function SizeBreakdownModal({
    isOpen,
    itemName = "",
    productSizes = [],
    defaultUnitPrice = 0,
    initialBreakdown = {},
    currentBreakdown = {},
    onClose,
    onSave,
}) {
    const [sizes, setSizes] = useState({});
    const [customPrices, setCustomPrices] = useState({});
    const [activeTab, setActiveTab] = useState("product"); // 'product' | 'adult' | 'number' | 'custom'
    const [customSizeName, setCustomSizeName] = useState("");
    const [customSizeQty, setCustomSizeQty] = useState("");
    const [customSizePrice, setCustomSizePrice] = useState("");
    const [bulkPriceInput, setBulkPriceInput] = useState("");

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    // Build default price map from product catalog
    const productPriceMap = useMemo(() => {
        const map = {};
        (productSizes || []).forEach((ps) => {
            if (ps.size_name) {
                map[ps.size_name] = parseFloat(ps.price) || defaultUnitPrice || 0;
            }
        });
        return map;
    }, [productSizes, defaultUnitPrice]);

    // Initialize state on open
    useEffect(() => {
        if (isOpen) {
            const incoming = initialBreakdown && Object.keys(initialBreakdown).length > 0
                ? initialBreakdown
                : (currentBreakdown || {});
            
            const normalizedSizes = {};
            const initialPrices = {};

            Object.entries(incoming).forEach(([k, v]) => {
                const num = parseInt(v, 10);
                if (!isNaN(num) && num > 0) {
                    normalizedSizes[k] = num;
                    initialPrices[k] = productPriceMap[k] !== undefined ? productPriceMap[k] : (defaultUnitPrice || 0);
                }
            });

            // Also preload product sizes into price map
            (productSizes || []).forEach((ps) => {
                if (ps.size_name && initialPrices[ps.size_name] === undefined) {
                    initialPrices[ps.size_name] = parseFloat(ps.price) || defaultUnitPrice || 0;
                }
            });

            setSizes(normalizedSizes);
            setCustomPrices(initialPrices);
            setCustomSizeName("");
            setCustomSizeQty("");
            setCustomSizePrice("");
            setBulkPriceInput("");

            if (productSizes && productSizes.length > 0) {
                setActiveTab("product");
            } else {
                const hasNumbers = Object.keys(normalizedSizes).some((k) => k.startsWith("No."));
                if (hasNumbers) {
                    setActiveTab("number");
                } else {
                    setActiveTab("adult");
                }
            }
        }
    }, [isOpen, initialBreakdown, currentBreakdown, productSizes, productPriceMap, defaultUnitPrice]);

    if (!isOpen) return null;

    // Get effective price for a size
    const getSizePrice = (sizeKey) => {
        if (customPrices[sizeKey] !== undefined && customPrices[sizeKey] !== null) {
            return Number(customPrices[sizeKey]);
        }
        if (productPriceMap[sizeKey] !== undefined) {
            return Number(productPriceMap[sizeKey]);
        }
        return Number(defaultUnitPrice) || 0;
    };

    const handleSizeChange = (sizeKey, val) => {
        if (val === "" || val === null) {
            setSizes((prev) => {
                const next = { ...prev };
                delete next[sizeKey];
                return next;
            });
            return;
        }

        const numVal = parseInt(val, 10);
        if (isNaN(numVal) || numVal < 0) return;

        setSizes((prev) => ({
            ...prev,
            [sizeKey]: numVal,
        }));

        // Ensure price is initialized for this size
        if (customPrices[sizeKey] === undefined) {
            setCustomPrices((prev) => ({
                ...prev,
                [sizeKey]: productPriceMap[sizeKey] !== undefined ? productPriceMap[sizeKey] : (defaultUnitPrice || 0),
            }));
        }
    };

    const handlePriceChange = (sizeKey, priceVal) => {
        const p = parseFloat(priceVal);
        setCustomPrices((prev) => ({
            ...prev,
            [sizeKey]: isNaN(p) ? 0 : p,
        }));
    };

    const handleStep = (sizeKey, delta) => {
        const current = sizes[sizeKey] || 0;
        const next = Math.max(0, current + delta);
        if (next === 0) {
            handleSizeChange(sizeKey, "");
        } else {
            handleSizeChange(sizeKey, next);
        }
    };

    const handleAddCustomSize = (e) => {
        e?.preventDefault();
        const trimmed = customSizeName.trim();
        const qty = parseInt(customSizeQty, 10) || 1;
        const price = parseFloat(customSizePrice) || defaultUnitPrice || 0;
        if (!trimmed) return;

        setSizes((prev) => ({
            ...prev,
            [trimmed]: qty,
        }));
        setCustomPrices((prev) => ({
            ...prev,
            [trimmed]: price,
        }));

        setCustomSizeName("");
        setCustomSizeQty("");
        setCustomSizePrice("");
    };

    const handleRemoveSize = (sizeKey) => {
        setSizes((prev) => {
            const next = { ...prev };
            delete next[sizeKey];
            return next;
        });
    };

    const handleResetAll = () => {
        setSizes({});
    };

    // Reset all prices to Product Catalog prices
    const handleResetToProductPrices = () => {
        const resetPrices = {};
        Object.keys(sizes).forEach((k) => {
            resetPrices[k] = productPriceMap[k] !== undefined ? productPriceMap[k] : (defaultUnitPrice || 0);
        });
        (productSizes || []).forEach((ps) => {
            if (ps.size_name) {
                resetPrices[ps.size_name] = parseFloat(ps.price) || defaultUnitPrice || 0;
            }
        });
        setCustomPrices(resetPrices);
    };

    // Apply uniform price to all active sizes
    const handleApplyBulkPrice = () => {
        const p = parseFloat(bulkPriceInput);
        if (isNaN(p) || p < 0) return;

        setCustomPrices((prev) => {
            const next = { ...prev };
            Object.keys(sizes).forEach((k) => {
                next[k] = p;
            });
            activePresetList.forEach((sz) => {
                next[sz] = p;
            });
            return next;
        });
        setBulkPriceInput("");
    };

    // Calculate total quantity, total variants, and total subtotal
    const { totalQuantity, totalVariants, calculatedSubtotal, hasDifferentPrices } = useMemo(() => {
        let qtySum = 0;
        let count = 0;
        let subtotalSum = 0;
        const pricesEncountered = new Set();

        Object.entries(sizes).forEach(([sizeKey, val]) => {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num > 0) {
                qtySum += num;
                count++;
                const unitPrice = getSizePrice(sizeKey);
                subtotalSum += num * unitPrice;
                pricesEncountered.add(unitPrice);
            }
        });

        return {
            totalQuantity: qtySum,
            totalVariants: count,
            calculatedSubtotal: subtotalSum,
            hasDifferentPrices: pricesEncountered.size > 1,
        };
    }, [sizes, customPrices, productPriceMap, defaultUnitPrice]);

    const handleApply = () => {
        const cleaned = {};
        Object.entries(sizes).forEach(([k, v]) => {
            const num = parseInt(v, 10);
            if (!isNaN(num) && num > 0) {
                cleaned[k] = num;
            }
        });

        const effectiveUnitPrice = totalQuantity > 0 ? Math.round(calculatedSubtotal / totalQuantity) : (defaultUnitPrice || 0);
        onSave(cleaned, totalQuantity, calculatedSubtotal, effectiveUnitPrice, customPrices);
        onClose();
    };

    const productPresetList = (productSizes || []).map((ps) => ps.size_name).filter(Boolean);
    const activePresetList = activeTab === "product"
        ? productPresetList
        : activeTab === "adult"
        ? adultSizes
        : activeTab === "number"
        ? numberSizes
        : [];

    const otherActiveSizes = Object.entries(sizes).filter(([k, v]) => !activePresetList.includes(k) && v > 0);

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden">
                
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-700 flex items-center justify-center border border-teal-500/20 shadow-2xs">
                            <Ruler className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                                Rincian Ukuran & Harga Satuan Pesanan
                            </h3>
                            <p className="text-xs text-slate-500 font-medium truncate max-w-sm mt-0.5">
                                {itemName || "Item Pesanan"} &bull; Harga bisa kustom per ukuran atau tiru dari master produk.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                {/* Quick Price Actions Toolbar */}
                <div className="px-4 py-2 bg-teal-50/60 border-b border-teal-100 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
                    <div className="flex items-center gap-2">
                        {productPresetList.length > 0 && (
                            <button
                                type="button"
                                onClick={handleResetToProductPrices}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-900 font-semibold rounded border border-teal-300 shadow-2xs transition-colors cursor-pointer"
                                title="Reset semua harga mengikuti harga dari katalog produk"
                            >
                                <RefreshCw className="w-3 h-3 text-teal-600" />
                                <span>Niru Harga Produk</span>
                            </button>
                        )}
                        <span className="text-[11px] text-teal-700 hidden sm:inline">
                            Harga dasar standar: <strong>{formatCurrency(defaultUnitPrice)}</strong>
                        </span>
                    </div>

                    {/* Bulk Set Price Input */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-600">Samakan Semua:</span>
                        <div className="relative w-28">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">Rp</span>
                            <input
                                type="number"
                                placeholder="85.000"
                                value={bulkPriceInput}
                                onChange={(e) => setBulkPriceInput(e.target.value)}
                                className="w-full pl-6 pr-2 py-0.5 text-xs font-mono font-bold border border-slate-300 rounded bg-white focus:border-teal-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleApplyBulkPrice}
                            disabled={!bulkPriceInput}
                            className="px-2 py-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded text-[11px] shadow-2xs transition-colors cursor-pointer"
                        >
                            Terapkan
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
                    
                    {/* Category Tab Buttons */}
                    <div className="flex items-center p-1 bg-slate-100/90 rounded-lg text-xs font-semibold border border-slate-200/60">
                        {productPresetList.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setActiveTab("product")}
                                className={`flex-1 py-1.5 px-2 rounded-md text-center transition-all cursor-pointer ${
                                    activeTab === "product"
                                        ? "bg-white text-teal-900 shadow-xs font-bold border border-slate-200/50"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Ukuran Produk ({productPresetList.length})
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setActiveTab("adult")}
                            className={`flex-1 py-1.5 px-2 rounded-md text-center transition-all cursor-pointer ${
                                activeTab === "adult"
                                    ? "bg-white text-teal-900 shadow-xs font-bold border border-slate-200/50"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Dewasa (S-5XL)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("number")}
                            className={`flex-1 py-1.5 px-2 rounded-md text-center transition-all cursor-pointer ${
                                activeTab === "number"
                                    ? "bg-white text-teal-900 shadow-xs font-bold border border-slate-200/50"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Nomor (1-12)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("custom")}
                            className={`flex-1 py-1.5 px-2 rounded-md text-center transition-all cursor-pointer ${
                                activeTab === "custom"
                                    ? "bg-white text-teal-900 shadow-xs font-bold border border-slate-200/50"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Kustom
                        </button>
                    </div>

                    {/* Standard / Number / Product Grid with Editable Price & Qty */}
                    {activeTab !== "custom" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {activePresetList.map((size) => {
                                const val = sizes[size] ?? "";
                                const hasValue = val !== "" && Number(val) > 0;
                                const sizePrice = getSizePrice(size);
                                const itemSubtotal = hasValue ? Number(val) * sizePrice : 0;

                                return (
                                    <div
                                        key={size}
                                        className={`rounded-lg p-2.5 transition-all border space-y-2 ${
                                            hasValue
                                                ? "border-teal-500 bg-teal-50/40 ring-1 ring-teal-500/20 shadow-2xs"
                                                : "border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-800 tracking-tight">
                                                Ukuran {size}
                                            </span>
                                            {hasValue && (
                                                <span className="text-[10px] font-bold text-teal-800 bg-teal-100/90 px-1.5 py-0.2 rounded font-mono">
                                                    Sub: {formatCurrency(itemSubtotal)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Qty Stepper */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleStep(size, -1)}
                                                className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer border border-slate-200"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                value={val}
                                                onChange={(e) => handleSizeChange(size, e.target.value)}
                                                className={`flex-1 h-7 text-center font-bold text-xs rounded border transition-colors ${
                                                    hasValue
                                                        ? "border-teal-500 bg-white text-teal-950 font-mono ring-1 ring-teal-500/30"
                                                        : "border-slate-200 bg-white text-slate-700"
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleStep(size, 1)}
                                                className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer border border-slate-200"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Editable Price per Size Input */}
                                        <div className="flex items-center gap-1.5 pt-0.5">
                                            <span className="text-[10px] font-semibold text-slate-500 shrink-0">Rp/pcs:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="100"
                                                value={customPrices[size] !== undefined ? customPrices[size] : sizePrice}
                                                onChange={(e) => handlePriceChange(size, e.target.value)}
                                                placeholder={String(defaultUnitPrice || 0)}
                                                className="w-full px-2 py-0.5 text-xs font-mono font-semibold border border-slate-200 rounded bg-white focus:border-teal-500 text-right"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Custom Size Tab */}
                    {activeTab === "custom" && (
                        <div className="space-y-4">
                            <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800">
                                    Tambah Ukuran Kustom Baru
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <div className="sm:col-span-4">
                                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                            Nama Ukuran (misal: Jumbo, 6XL, Khusus)
                                        </label>
                                        <input
                                            type="text"
                                            value={customSizeName}
                                            onChange={(e) => setCustomSizeName(e.target.value)}
                                            placeholder="Contoh: Jumbo LD 130"
                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:border-teal-500 bg-white"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                            Jumlah (Qty)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={customSizeQty}
                                            onChange={(e) => setCustomSizeQty(e.target.value)}
                                            placeholder="1"
                                            className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded focus:border-teal-500 bg-white text-center font-mono"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                            Harga Satuan (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={customSizePrice}
                                            onChange={(e) => setCustomSizePrice(e.target.value)}
                                            placeholder={String(defaultUnitPrice || 0)}
                                            className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded focus:border-teal-500 bg-white font-mono text-right"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 flex items-end">
                                        <button
                                            type="button"
                                            onClick={handleAddCustomSize}
                                            disabled={!customSizeName.trim()}
                                            className="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Selected Sizes List Overview */}
                    {Object.entries(sizes).some(([_, v]) => v > 0) && (
                        <div className="border-t border-slate-100 pt-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Ringkasan Ukuran Terpilih:</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={handleResetAll}
                                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reset Semua</span>
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {Object.entries(sizes)
                                    .filter(([_, v]) => v > 0)
                                    .map(([szKey, qty]) => {
                                        const pr = getSizePrice(szKey);
                                        return (
                                            <div
                                                key={szKey}
                                                className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-900 border border-teal-200/80 px-2 py-1 rounded-md text-xs font-semibold shadow-2xs"
                                            >
                                                <span>{szKey}:</span>
                                                <span className="font-bold font-mono">{qty} pcs</span>
                                                <span className="text-[10px] text-teal-700 font-mono">(@ {formatCurrency(pr)})</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSize(szKey)}
                                                    className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with Calculations */}
                <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-4 text-xs">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Qty</span>
                            <span className="font-bold text-slate-900 text-sm font-mono">{totalQuantity} pcs</span>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Subtotal</span>
                            <span className="font-bold text-teal-700 text-sm font-mono">{formatCurrency(calculatedSubtotal)}</span>
                        </div>
                        {totalQuantity > 0 && hasDifferentPrices && (
                            <>
                                <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                                <div className="hidden sm:block">
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rata-rata / pcs</span>
                                    <span className="font-bold text-slate-700 text-xs font-mono">
                                        {formatCurrency(Math.round(calculatedSubtotal / totalQuantity))}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>Terapkan ke Pesanan</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
});

export default SizeBreakdownModal;
