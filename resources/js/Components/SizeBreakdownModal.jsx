import React, { memo, useState, useEffect, useMemo, useRef } from "react";
import { Ruler, X, Check, Plus, Trash2, RotateCcw, RefreshCw } from "lucide-react";

const defaultStandardSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

const SizeBreakdownModal = memo(function SizeBreakdownModal({
    isOpen,
    itemName = "",
    productSizes = [],
    masterSizes = [],
    defaultUnitPrice = 0,
    initialBreakdown = {},
    currentBreakdown = {},
    onClose,
    onSave,
}) {
    const [sizeList, setSizeList] = useState([]);
    const [sizeCategories, setSizeCategories] = useState({});
    const [sizes, setSizes] = useState({});
    const [customPrices, setCustomPrices] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [selectedMasterSizeId, setSelectedMasterSizeId] = useState("");
    const [customSizeName, setCustomSizeName] = useState("");
    const [newSizeQty, setNewSizeQty] = useState("1");
    const [newSizePrice, setNewSizePrice] = useState("");
    const [bulkPriceInput, setBulkPriceInput] = useState("");

    const customInputRef = useRef(null);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const productPriceMap = useMemo(() => {
        const map = {};
        (productSizes || []).forEach((ps) => {
            const name = ps.size_name || ps.size?.size_name;
            if (name) {
                map[name] = parseFloat(ps.price) || defaultUnitPrice || 0;
            }
        });
        return map;
    }, [productSizes, defaultUnitPrice]);

    const groupedMasterSizes = useMemo(() => {
        const groups = {};
        (masterSizes || []).forEach((ms) => {
            const cat = ms.category || "Lainnya";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(ms);
        });
        return groups;
    }, [masterSizes]);

    const getCategoryForSize = (sizeKey) => {
        if (sizeCategories[sizeKey]) return sizeCategories[sizeKey];
        const prodMatch = (productSizes || []).find((ps) => (ps.size_name || ps.size?.size_name) === sizeKey);
        if (prodMatch) return prodMatch.size?.category || prodMatch.category || "";
        const masterMatch = (masterSizes || []).find((ms) => ms.size_name === sizeKey);
        if (masterMatch) return masterMatch.category || "";
        return "";
    };

    useEffect(() => {
        if (isOpen) {
            const incoming = initialBreakdown && Object.keys(initialBreakdown).length > 0
                ? initialBreakdown
                : (currentBreakdown || {});

            const normalizedSizes = {};
            const initialPrices = {};
            const initialCategories = {};

            Object.entries(incoming).forEach(([k, v]) => {
                let qty = 0;
                let price = defaultUnitPrice || 0;
                if (typeof v === "object" && v !== null) {
                    qty = parseInt(v.qty, 10) || 0;
                    price = v.price !== undefined ? parseFloat(v.price) : (productPriceMap[k] || defaultUnitPrice || 0);
                } else {
                    qty = parseInt(v, 10) || 0;
                    price = productPriceMap[k] !== undefined ? productPriceMap[k] : (defaultUnitPrice || 0);
                }
                if (qty > 0) {
                    normalizedSizes[k] = qty;
                    initialPrices[k] = price;
                }
            });

            const initialList = [];
            if (productSizes && productSizes.length > 0) {
                productSizes.forEach((ps) => {
                    const name = ps.size_name || ps.size?.size_name;
                    const cat = ps.size?.category || ps.category || "";
                    if (name && !initialList.includes(name)) {
                        initialList.push(name);
                        initialCategories[name] = cat;
                        if (initialPrices[name] === undefined) {
                            initialPrices[name] = parseFloat(ps.price) || defaultUnitPrice || 0;
                        }
                    }
                });
            } else {
                defaultStandardSizes.forEach((sz) => {
                    if (!initialList.includes(sz)) {
                        initialList.push(sz);
                        const match = (masterSizes || []).find((m) => m.size_name === sz);
                        initialCategories[sz] = match ? match.category : "Dewasa";
                        if (initialPrices[sz] === undefined) {
                            initialPrices[sz] = defaultUnitPrice || 0;
                        }
                    }
                });
            }

            Object.keys(normalizedSizes).forEach((sz) => {
                if (!initialList.includes(sz)) {
                    initialList.push(sz);
                    const match = (masterSizes || []).find((m) => m.size_name === sz);
                    if (match) {
                        initialCategories[sz] = match.category;
                    }
                }
            });

            setSizeList(initialList);
            setSizeCategories(initialCategories);
            setSizes(normalizedSizes);
            setCustomPrices(initialPrices);
            setIsAdding(false);
            setSelectedMasterSizeId("");
            setCustomSizeName("");
            setNewSizeQty("1");
            setNewSizePrice(String(defaultUnitPrice || ""));
            setBulkPriceInput("");
        }
    }, [isOpen, initialBreakdown, currentBreakdown, productSizes, masterSizes, productPriceMap, defaultUnitPrice]);

    useEffect(() => {
        if (isAdding && selectedMasterSizeId === "__CUSTOM__" && customInputRef.current) {
            customInputRef.current.focus();
        }
    }, [isAdding, selectedMasterSizeId]);

    if (!isOpen) return null;

    const getSizePrice = (sizeKey) => {
        if (customPrices[sizeKey] !== undefined && customPrices[sizeKey] !== null) {
            return Number(customPrices[sizeKey]);
        }
        if (productPriceMap[sizeKey] !== undefined) {
            return Number(productPriceMap[sizeKey]);
        }
        return Number(defaultUnitPrice) || 0;
    };

    const handleSizeQtyChange = (sizeKey, val) => {
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

        if (customPrices[sizeKey] === undefined) {
            setCustomPrices((prev) => ({
                ...prev,
                [sizeKey]: productPriceMap[sizeKey] !== undefined ? productPriceMap[sizeKey] : (defaultUnitPrice || 0),
            }));
        }
    };

    const handleStep = (sizeKey, delta) => {
        const current = sizes[sizeKey] || 0;
        const next = Math.max(0, current + delta);
        handleSizeQtyChange(sizeKey, next === 0 ? "" : next);
    };

    const handlePriceChange = (sizeKey, priceVal) => {
        const p = parseFloat(priceVal);
        setCustomPrices((prev) => ({
            ...prev,
            [sizeKey]: isNaN(p) ? 0 : p,
        }));
    };

    const handleOpenAdd = () => {
        setIsAdding(true);
        setSelectedMasterSizeId("");
        setCustomSizeName("");
        setNewSizeQty("1");
        setNewSizePrice(String(defaultUnitPrice || ""));
    };

    const handleSelectMasterSize = (e) => {
        const val = e.target.value;
        setSelectedMasterSizeId(val);
        if (val && val !== "__CUSTOM__") {
            const found = (masterSizes || []).find((m) => String(m.id) === String(val));
            if (found) {
                setCustomSizeName(found.size_name);
            }
        } else {
            setCustomSizeName("");
        }
    };

    const handleSaveNewSize = () => {
        let sizeName = "";
        let categoryName = "";

        if (selectedMasterSizeId === "__CUSTOM__") {
            sizeName = customSizeName.trim();
            categoryName = "Kustom";
        } else if (selectedMasterSizeId) {
            const found = (masterSizes || []).find((m) => String(m.id) === String(selectedMasterSizeId));
            if (found) {
                sizeName = found.size_name;
                categoryName = found.category || "";
            }
        } else if (customSizeName.trim()) {
            sizeName = customSizeName.trim();
        }

        if (!sizeName) return;

        const qty = parseInt(newSizeQty, 10) || 1;
        const price = parseFloat(newSizePrice) || defaultUnitPrice || 0;

        if (!sizeList.includes(sizeName)) {
            setSizeList((prev) => [...prev, sizeName]);
        }

        if (categoryName) {
            setSizeCategories((prev) => ({
                ...prev,
                [sizeName]: categoryName,
            }));
        }

        setSizes((prev) => ({
            ...prev,
            [sizeName]: qty,
        }));

        setCustomPrices((prev) => ({
            ...prev,
            [sizeName]: price,
        }));

        setIsAdding(false);
        setSelectedMasterSizeId("");
        setCustomSizeName("");
        setNewSizeQty("1");
        setNewSizePrice("");
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setSelectedMasterSizeId("");
        setCustomSizeName("");
        setNewSizeQty("1");
        setNewSizePrice("");
    };

    const handleRemoveSizeRow = (sizeKey) => {
        setSizes((prev) => {
            const next = { ...prev };
            delete next[sizeKey];
            return next;
        });
        setSizeList((prev) => prev.filter((s) => s !== sizeKey));
    };

    const handleResetAllQty = () => {
        setSizes({});
    };

    const handleResetToProductPrices = () => {
        const resetPrices = {};
        sizeList.forEach((k) => {
            resetPrices[k] = productPriceMap[k] !== undefined ? productPriceMap[k] : (defaultUnitPrice || 0);
        });
        setCustomPrices(resetPrices);
    };

    const handleApplyBulkPrice = () => {
        const p = parseFloat(bulkPriceInput);
        if (isNaN(p) || p < 0) return;

        setCustomPrices((prev) => {
            const next = { ...prev };
            sizeList.forEach((k) => {
                next[k] = p;
            });
            return next;
        });
        setBulkPriceInput("");
    };

    const { totalQuantity, calculatedSubtotal, hasDifferentPrices } = useMemo(() => {
        let qtySum = 0;
        let subtotalSum = 0;
        const pricesEncountered = new Set();

        Object.entries(sizes).forEach(([sizeKey, val]) => {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num > 0) {
                qtySum += num;
                const unitPrice = getSizePrice(sizeKey);
                subtotalSum += num * unitPrice;
                pricesEncountered.add(unitPrice);
            }
        });

        return {
            totalQuantity: qtySum,
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

    const isCanSaveNewSize = Boolean(
        (selectedMasterSizeId && selectedMasterSizeId !== "__CUSTOM__") ||
        (selectedMasterSizeId === "__CUSTOM__" && customSizeName.trim()) ||
        customSizeName.trim()
    );

    return (
        <div className="fixed inset-0 z-[250] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-4xl w-full shadow-soft-xl border border-slate-100 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden my-auto">
                
                {/* Modal Header */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-200/80 shadow-2xs shrink-0">
                            <Ruler className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                Rincian Ukuran & Kuantitas Pesanan
                            </h3>
                            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                {itemName || "Item Pesanan"} &bull; Tentukan kuantitas dan harga satuan per ukuran pakaian
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all duration-200 cursor-pointer"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                {/* Quick Price Actions Toolbar */}
                <div className="px-5 py-2.5 bg-teal-50/60 border-b border-teal-100 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
                    <div className="flex items-center gap-2">
                        {productSizes && productSizes.length > 0 && (
                            <button
                                type="button"
                                onClick={handleResetToProductPrices}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 font-semibold rounded-md border border-teal-200 shadow-2xs transition-colors cursor-pointer"
                                title="Reset semua harga mengikuti harga dari katalog produk"
                            >
                                <RefreshCw className="w-3 h-3 text-teal-600" />
                                <span>Niru Harga Produk</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleResetAllQty}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 font-semibold rounded-md border border-rose-200 shadow-2xs transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Qty (0)</span>
                        </button>
                    </div>

                    {/* Bulk Set Price Input */}
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-600">Samakan Harga Semua:</span>
                        <div className="relative w-32">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">Rp</span>
                            <input
                                type="number"
                                placeholder={String(defaultUnitPrice || 0)}
                                value={bulkPriceInput}
                                onChange={(e) => setBulkPriceInput(e.target.value)}
                                className="w-full pl-7 pr-2 py-1 text-xs font-mono font-bold border border-slate-300 rounded-md bg-white focus:border-teal-500 shadow-2xs text-right"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleApplyBulkPrice}
                            disabled={!bulkPriceInput}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-md text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                            Terapkan
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                                    <th className="px-3.5 py-2.5 w-12 text-center">No</th>
                                    <th className="px-3.5 py-2.5 w-48">Ukuran</th>
                                    <th className="px-3.5 py-2.5 w-44">Harga Satuan (Rp)</th>
                                    <th className="px-3.5 py-2.5 w-44 text-center">Kuantitas (Pcs)</th>
                                    <th className="px-3.5 py-2.5 text-right">Subtotal</th>
                                    <th className="px-3.5 py-2.5 w-16 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sizeList.map((sizeKey, idx) => {
                                    const qty = sizes[sizeKey] || 0;
                                    const hasQty = qty > 0;
                                    const sizePrice = getSizePrice(sizeKey);
                                    const rowSubtotal = hasQty ? qty * sizePrice : 0;
                                    const category = getCategoryForSize(sizeKey);

                                    return (
                                        <tr
                                            key={sizeKey}
                                            className={`transition-colors ${
                                                hasQty ? "bg-teal-50/25 hover:bg-teal-50/40 font-medium" : "hover:bg-slate-50/60"
                                            }`}
                                        >
                                            <td className="px-3.5 py-2 text-center font-mono text-slate-400 font-medium text-xs">
                                                {idx + 1}
                                            </td>

                                            <td className="px-3.5 py-2 font-bold text-slate-800">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {category && (
                                                        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 uppercase tracking-wide">
                                                            {category}
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                                                        hasQty ? "bg-teal-600 text-white border-teal-600" : "bg-slate-100 text-slate-800 border-slate-200"
                                                    }`}>
                                                        {sizeKey}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-3.5 py-2">
                                                <div className="relative w-36">
                                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">Rp</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={customPrices[sizeKey] !== undefined ? customPrices[sizeKey] : sizePrice}
                                                        onChange={(e) => handlePriceChange(sizeKey, e.target.value)}
                                                        className="w-full h-8 pl-8 pr-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-right shadow-2xs"
                                                    />
                                                </div>
                                            </td>

                                            <td className="px-3.5 py-2">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStep(sizeKey, -1)}
                                                        className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        value={sizes[sizeKey] ?? ""}
                                                        onChange={(e) => handleSizeQtyChange(sizeKey, e.target.value)}
                                                        className={`w-16 h-7 text-center font-bold text-xs font-mono rounded-md border transition-all shadow-2xs ${
                                                            hasQty
                                                                ? "border-teal-600 bg-white text-teal-900 ring-1 ring-teal-600/30"
                                                                : "border-slate-300 bg-white text-slate-700"
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStep(sizeKey, 1)}
                                                        className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                                                {formatCurrency(rowSubtotal)}
                                            </td>

                                            <td className="px-3.5 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSizeRow(sizeKey)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                                    title="Hapus baris ukuran ini"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Baris Pilih / Tambah Ukuran Lain */}
                                {isAdding ? (
                                    <tr className="bg-teal-50/50 border-t-2 border-teal-200">
                                        <td className="px-3.5 py-2 text-center font-mono text-teal-700 font-bold text-xs">
                                            {sizeList.length + 1}
                                        </td>

                                        <td className="px-3.5 py-2 space-y-1.5">
                                            <select
                                                value={selectedMasterSizeId}
                                                onChange={handleSelectMasterSize}
                                                className="w-full h-8 px-2 text-xs font-semibold border border-teal-600 rounded-lg bg-white shadow-2xs focus:ring-1 focus:ring-teal-600"
                                            >
                                                <option value="">-- Pilih Ukuran Master --</option>
                                                {Object.entries(groupedMasterSizes).map(([cat, list]) => (
                                                    <optgroup key={cat} label={`Kategori: ${cat}`}>
                                                        {list.map((ms) => (
                                                            <option key={ms.id} value={ms.id}>
                                                                [{cat}] {ms.size_name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                                <option value="__CUSTOM__">+ Ketik Kustom Sendiri</option>
                                            </select>

                                            {selectedMasterSizeId === "__CUSTOM__" && (
                                                <input
                                                    ref={customInputRef}
                                                    type="text"
                                                    value={customSizeName}
                                                    onChange={(e) => setCustomSizeName(e.target.value)}
                                                    placeholder="Ketik Nama Ukuran Kustom..."
                                                    className="w-full h-8 px-2.5 text-xs font-semibold border border-teal-600 rounded-lg bg-white shadow-2xs focus:ring-1 focus:ring-teal-600"
                                                />
                                            )}
                                        </td>

                                        <td className="px-3.5 py-2">
                                            <div className="relative w-36">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">Rp</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={newSizePrice}
                                                    onChange={(e) => setNewSizePrice(e.target.value)}
                                                    placeholder={String(defaultUnitPrice || 0)}
                                                    className="w-full h-8 pl-8 pr-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-right shadow-2xs"
                                                />
                                            </div>
                                        </td>

                                        <td className="px-3.5 py-2">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={newSizeQty}
                                                    onChange={(e) => setNewSizeQty(e.target.value)}
                                                    placeholder="1"
                                                    className="w-16 h-8 text-center font-bold text-xs font-mono rounded-lg border border-slate-300 bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
                                                />
                                            </div>
                                        </td>

                                        <td className="px-3.5 py-2 text-right font-mono font-bold text-teal-800">
                                            {formatCurrency((parseInt(newSizeQty, 10) || 1) * (parseFloat(newSizePrice) || defaultUnitPrice || 0))}
                                        </td>

                                        <td className="px-3.5 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={handleSaveNewSize}
                                                    disabled={!isCanSaveNewSize}
                                                    className="w-7 h-7 inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-md transition-colors cursor-pointer shadow-2xs"
                                                    title="Tambahkan Ukuran"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelAdd}
                                                    className="w-7 h-7 inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors cursor-pointer"
                                                    title="Batal"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr className="bg-slate-50/40 hover:bg-slate-50 transition-colors border-t border-dashed border-slate-200">
                                        <td className="px-3.5 py-2.5 text-center font-mono text-slate-400 font-medium text-xs">
                                            {sizeList.length + 1}
                                        </td>

                                        <td colSpan="4" className="px-3.5 py-2.5">
                                            <span className="text-xs font-semibold text-slate-500 italic">
                                                Pilih Ukuran Lain
                                            </span>
                                        </td>

                                        <td className="px-3.5 py-2.5 text-center">
                                            <button
                                                type="button"
                                                onClick={handleOpenAdd}
                                                className="w-7 h-7 inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors cursor-pointer shadow-2xs"
                                                title="Tambah / Pilih Ukuran Lain"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer with Calculations */}
                <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-4 text-xs">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Kuantitas</span>
                            <span className="font-bold text-slate-900 text-sm font-mono">{totalQuantity} Pcs</span>
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
                                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rata-rata / Pcs</span>
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
