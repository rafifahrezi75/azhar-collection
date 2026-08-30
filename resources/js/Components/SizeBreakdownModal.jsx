import React, { memo, useEffect, useMemo, useState } from "react";
import { Ruler, X, Check, Trash2, RefreshCw } from "lucide-react";

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

const SizeBreakdownModal = memo(function SizeBreakdownModal({
    isOpen,
    itemName = "",
    productSizes = EMPTY_ARRAY,
    defaultUnitPrice = 0,
    initialBreakdown = EMPTY_OBJECT,
    currentBreakdown = EMPTY_OBJECT,
    onClose,
    onSave,
}) {
    const [sizes, setSizes] = useState({});
    const [customPrices, setCustomPrices] = useState({});
    const [customSizeCategories, setCustomSizeCategories] = useState({});
    const [newSizeName, setNewSizeName] = useState("");
    const [newSizePrice, setNewSizePrice] = useState("");
    const [newSizeQuantity, setNewSizeQuantity] = useState("1");
    const [bulkPriceInput, setBulkPriceInput] = useState("");
    const [showCustomForm, setShowCustomForm] = useState(false);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const productPresetList = useMemo(() => {
        return (Array.isArray(productSizes) ? productSizes : [])
            .map((ps) => ps?.size?.size_name || ps?.size_name)
            .filter(Boolean);
    }, [productSizes]);

    const productPriceMap = useMemo(() => {
        const map = {};

        (Array.isArray(productSizes) ? productSizes : []).forEach((ps) => {
            const sizeName = ps?.size?.size_name || ps?.size_name;
            const price = ps?.price;

            if (sizeName) {
                map[sizeName] = parseFloat(price) || defaultUnitPrice || 0;
            }
        });

        return map;
    }, [productSizes, defaultUnitPrice]);

    const productCategoryMap = useMemo(() => {
        const map = {};

        (Array.isArray(productSizes) ? productSizes : []).forEach((ps) => {
            const sizeName = ps?.size?.size_name || ps?.size_name;
            const category = ps?.size?.category;

            if (sizeName && category) {
                map[sizeName] = category;
            }
        });

        return map;
    }, [productSizes]);

    useEffect(() => {
        if (!isOpen) return;

        const incoming =
            initialBreakdown && Object.keys(initialBreakdown).length > 0
                ? initialBreakdown
                : currentBreakdown || {};

        const normalizedSizes = {};
        const initialPrices = {};
        const existingCategories = {};

        Object.entries(incoming).forEach(([key, value]) => {
            const quantity = parseInt(value, 10);

            if (!isNaN(quantity) && quantity > 0) {
                normalizedSizes[key] = quantity;
                initialPrices[key] =
                    productPriceMap[key] !== undefined
                        ? productPriceMap[key]
                        : defaultUnitPrice || 0;

                if (!productPresetList.includes(key)) {
                    existingCategories[key] = "Custom";
                }
            }
        });

        (Array.isArray(productSizes) ? productSizes : []).forEach((ps) => {
            const sizeName = ps?.size?.size_name || ps?.size_name;
            const price = ps?.price;

            if (sizeName && initialPrices[sizeName] === undefined) {
                initialPrices[sizeName] =
                    parseFloat(price) || defaultUnitPrice || 0;
            }
        });

        if (
            productSizes &&
            productSizes.length > 0 &&
            Object.keys(normalizedSizes).length === 0
        ) {
            productPresetList.forEach((sizeName) => {
                normalizedSizes[sizeName] = 1;
            });
        }

        setSizes(normalizedSizes);
        setCustomPrices(initialPrices);
        setCustomSizeCategories(existingCategories);
        setNewSizeName("");
        setNewSizePrice("");
        setNewSizeQuantity("1");
        setBulkPriceInput("");
        setShowCustomForm(false);
    }, [
        isOpen,
        initialBreakdown,
        currentBreakdown,
        productSizes,
        productPresetList,
        productPriceMap,
        defaultUnitPrice,
    ]);

    const getSizePrice = (sizeKey) => {
        if (
            customPrices[sizeKey] !== undefined &&
            customPrices[sizeKey] !== null
        ) {
            return Number(customPrices[sizeKey]);
        }

        if (productPriceMap[sizeKey] !== undefined) {
            return Number(productPriceMap[sizeKey]);
        }

        return Number(defaultUnitPrice) || 0;
    };

    const otherActiveSizes = useMemo(() => {
        return Object.entries(sizes).filter(
            ([key, value]) => !productPresetList.includes(key) && Number(value) > 0,
        );
    }, [sizes, productPresetList]);

    const { totalQuantity, calculatedSubtotal, hasDifferentPrices } = useMemo(() => {
        let qtySum = 0;
        let subtotalSum = 0;
        const pricesEncountered = new Set();

        Object.entries(sizes).forEach(([sizeKey, value]) => {
            const quantity = parseInt(value, 10);

            if (!isNaN(quantity) && quantity > 0) {
                const unitPrice =
                    customPrices[sizeKey] !== undefined &&
                    customPrices[sizeKey] !== null
                        ? Number(customPrices[sizeKey])
                        : productPriceMap[sizeKey] !== undefined
                          ? Number(productPriceMap[sizeKey])
                          : Number(defaultUnitPrice) || 0;

                qtySum += quantity;
                subtotalSum += quantity * unitPrice;
                pricesEncountered.add(unitPrice);
            }
        });

        return {
            totalQuantity: qtySum,
            calculatedSubtotal: subtotalSum,
            hasDifferentPrices: pricesEncountered.size > 1,
        };
    }, [sizes, customPrices, productPriceMap, defaultUnitPrice]);

    const handleSizeChange = (sizeKey, value) => {
        if (value === "" || value === null) {
            setSizes((prev) => ({
                ...prev,
                [sizeKey]: 0,
            }));
            return;
        }

        const quantity = parseInt(value, 10);

        if (isNaN(quantity) || quantity < 0) return;

        setSizes((prev) => ({
            ...prev,
            [sizeKey]: quantity,
        }));

        if (customPrices[sizeKey] === undefined) {
            setCustomPrices((prev) => ({
                ...prev,
                [sizeKey]:
                    productPriceMap[sizeKey] !== undefined
                        ? productPriceMap[sizeKey]
                        : defaultUnitPrice || 0,
            }));
        }
    };

    const handlePriceChange = (sizeKey, priceValue) => {
        if (priceValue === "") {
            setCustomPrices((prev) => ({
                ...prev,
                [sizeKey]: "",
            }));
            return;
        }

        const price = parseFloat(priceValue);

        setCustomPrices((prev) => ({
            ...prev,
            [sizeKey]: isNaN(price) ? 0 : price,
        }));
    };

    const handleRemoveSize = (sizeKey) => {
        setSizes((prev) => {
            const next = { ...prev };

            if (productPresetList.includes(sizeKey)) {
                next[sizeKey] = 0;
            } else {
                delete next[sizeKey];
            }

            return next;
        });

        if (!productPresetList.includes(sizeKey)) {
            setCustomPrices((prev) => {
                const next = { ...prev };
                delete next[sizeKey];
                return next;
            });

            setCustomSizeCategories((prev) => {
                const next = { ...prev };
                delete next[sizeKey];
                return next;
            });
        }
    };

    const getNextCustomName = () => {
        const existingNames = new Set([
            ...productPresetList,
            ...Object.keys(sizes),
        ]);

        if (!existingNames.has("Custom")) {
            return "Custom";
        }

        let index = 2;

        while (existingNames.has(`Custom ${index}`)) {
            index += 1;
        }

        return `Custom ${index}`;
    };

    const handleOpenCustomForm = () => {
        setNewSizeName("");
        setNewSizePrice("");
        setNewSizeQuantity("1");
        setShowCustomForm(true);
    };

    const handleAddCustomInline = () => {
        const quantity = parseInt(newSizeQuantity, 10);

        if (isNaN(quantity) || quantity < 1) return;

        const trimmedName = newSizeName.trim();
        const sizeName = trimmedName || getNextCustomName();
        const price =
            newSizePrice === ""
                ? Number(defaultUnitPrice) || 0
                : parseFloat(newSizePrice) || 0;

        setSizes((prev) => ({
            ...prev,
            [sizeName]: quantity,
        }));

        setCustomPrices((prev) => ({
            ...prev,
            [sizeName]: price,
        }));

        setCustomSizeCategories((prev) => ({
            ...prev,
            [sizeName]: "Custom",
        }));

        setNewSizeName("");
        setNewSizePrice("");
        setNewSizeQuantity("1");
        setShowCustomForm(false);
    };

    const handleResetToProductPrices = () => {
        const resetPrices = {};

        Object.keys(sizes).forEach((key) => {
            resetPrices[key] =
                productPriceMap[key] !== undefined
                    ? productPriceMap[key]
                    : customPrices[key] !== undefined
                      ? customPrices[key]
                      : defaultUnitPrice || 0;
        });

        productPresetList.forEach((sizeName) => {
            resetPrices[sizeName] =
                productPriceMap[sizeName] !== undefined
                    ? productPriceMap[sizeName]
                    : defaultUnitPrice || 0;
        });

        setCustomPrices(resetPrices);
    };

    const handleApplyBulkPrice = () => {
        const price = parseFloat(bulkPriceInput);

        if (isNaN(price) || price < 0) return;

        setCustomPrices((prev) => {
            const next = { ...prev };

            Object.entries(sizes).forEach(([key, value]) => {
                if (Number(value) > 0) {
                    next[key] = price;
                }
            });

            return next;
        });

        setBulkPriceInput("");
    };

    const handleApply = () => {
        const cleaned = {};

        Object.entries(sizes).forEach(([key, value]) => {
            const quantity = parseInt(value, 10);

            if (!isNaN(quantity) && quantity > 0) {
                cleaned[key] = quantity;
            }
        });

        const effectiveUnitPrice =
            totalQuantity > 0
                ? Math.round(calculatedSubtotal / totalQuantity)
                : defaultUnitPrice || 0;

        onSave(
            cleaned,
            totalQuantity,
            calculatedSubtotal,
            effectiveUnitPrice,
            customPrices,
        );
        onClose();
    };

    if (!isOpen) return null;

    const newCustomSubtotal =
        (newSizePrice === ""
            ? Number(defaultUnitPrice) || 0
            : parseFloat(newSizePrice) || 0) *
        (parseInt(newSizeQuantity, 10) || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-xs sm:p-4">
            <div className="flex max-h-[92vh] w-full max-w-[960px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft-xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-700 shadow-2xs">
                            <Ruler className="h-4.5 w-4.5" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-sm font-bold leading-tight text-slate-900 sm:text-base">
                                Rincian Ukuran & Harga Satuan Pesanan
                            </h3>
                            <p className="mt-0.5 max-w-sm truncate text-xs font-medium text-slate-500">
                                {itemName || "Item Pesanan"} &bull; Harga bisa custom per ukuran atau tiru dari master produk.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-200/60 hover:text-slate-700"
                    >
                        <X className="h-4.5 w-4.5" />
                    </button>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-teal-100 bg-teal-50/60 px-4 py-2 text-xs">
                    <div className="flex items-center gap-2">
                        {productPresetList.length > 0 && (
                            <button
                                type="button"
                                onClick={handleResetToProductPrices}
                                className="inline-flex cursor-pointer items-center gap-1 rounded border border-teal-300 bg-white px-2.5 py-1 font-semibold text-teal-900 shadow-2xs transition-colors hover:bg-teal-100"
                                title="Reset harga mengikuti katalog produk"
                            >
                                <RefreshCw className="h-3 w-3 text-teal-600" />
                                <span>Niru Harga Produk</span>
                            </button>
                        )}

                        <span className="hidden text-[11px] text-teal-700 sm:inline">
                            Harga dasar standar:{" "}
                            <strong>{formatCurrency(defaultUnitPrice)}</strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-600">
                            Samakan Semua:
                        </span>

                        <div className="relative w-28">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">
                                Rp
                            </span>
                            <input
                                type="number"
                                placeholder="85.000"
                                value={bulkPriceInput}
                                onChange={(e) => setBulkPriceInput(e.target.value)}
                                className="w-full rounded border border-slate-300 bg-white py-0.5 pl-6 pr-2 text-xs font-bold font-mono focus:border-teal-500 focus:outline-none"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleApplyBulkPrice}
                            disabled={!bulkPriceInput}
                            className="cursor-pointer rounded bg-teal-600 px-2 py-1 text-[11px] font-semibold text-white shadow-2xs transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Terapkan
                        </button>
                    </div>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-5">
                    <div className="overflow-hidden rounded-lg border border-slate-300 shadow-2xs">
                        <table className="w-full table-fixed border-collapse text-left text-xs [&_th]:!border-l-0 [&_th]:!border-r-0 [&_td]:!border-l-0 [&_td]:!border-r-0">
                            <colgroup>
                                <col className="w-[6%]" />
                                <col className="w-[19%]" />
                                <col className="w-[16%]" />
                                <col className="w-[19%]" />
                                <col className="w-[14%]" />
                                <col className="w-[19%]" />
                                <col className="w-[7%]" />
                            </colgroup>

                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                    <th className="px-2 py-2 text-center">
                                        No
                                    </th>
                                    <th className="px-3 py-2">
                                        Ukuran
                                    </th>
                                    <th className="px-3 py-2 text-center">
                                        Kategori
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        Harga Satuan
                                    </th>
                                    <th className="px-3 py-2 text-center">
                                        Kuantitas
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                        Subtotal
                                    </th>
                                    <th className="px-2 py-2 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200">
                                {productPresetList.map((size, sizeIdx) => {
                                    const value = sizes[size] ?? 0;
                                    const sizePrice = getSizePrice(size);
                                    const itemSubtotal = Number(value) * sizePrice;

                                    return (
                                        <tr
                                            key={size}
                                            className={`transition-colors hover:bg-slate-50/60 ${
                                                Number(value) > 0
                                                    ? "bg-teal-50/30"
                                                    : "bg-white"
                                            }`}
                                        >
                                            <td className="px-2 py-2 text-center font-mono text-slate-400">
                                                {sizeIdx + 1}
                                            </td>

                                            <td className="px-3 py-2 font-bold text-slate-800">
                                                Ukuran {size}
                                            </td>

                                            <td className="px-3 py-2 text-center text-xs text-slate-500">
                                                <span className="block w-full break-words">
                                                    {productCategoryMap[size] || "-"}
                                                </span>
                                            </td>

                                            <td className="p-1.5">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    value={
                                                        customPrices[size] !== undefined
                                                            ? customPrices[size]
                                                            : sizePrice
                                                    }
                                                    onChange={(e) =>
                                                        handlePriceChange(
                                                            size,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={String(
                                                        defaultUnitPrice || 0,
                                                    )}
                                                    className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-right text-xs font-bold font-mono shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                                                />
                                            </td>

                                            <td className="p-1.5">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={value}
                                                    onChange={(e) =>
                                                        handleSizeChange(
                                                            size,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 w-full rounded-md border border-teal-500 bg-white px-2 text-center text-sm font-bold text-teal-900 shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-teal-500/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                />
                                            </td>

                                            <td className="px-3 py-2 text-right text-[11px] font-bold font-mono text-teal-700">
                                                {formatCurrency(itemSubtotal)}
                                            </td>

                                            <td className="px-2 py-2 text-center">
                                                {Number(value) > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveSize(size)
                                                        }
                                                        className="cursor-pointer p-1 text-slate-400 transition-colors hover:text-rose-600"
                                                        title="Hapus ukuran ini"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {otherActiveSizes.map(([size, value], idx) => {
                                    const sizePrice = getSizePrice(size);
                                    const itemSubtotal = Number(value) * sizePrice;

                                    return (
                                        <tr
                                            key={size}
                                            className="bg-teal-50/30 transition-colors hover:bg-slate-50/60"
                                        >
                                            <td className="px-2 py-2 text-center font-mono text-slate-400">
                                                {productPresetList.length + idx + 1}
                                            </td>

                                            <td className="px-3 py-2 font-bold text-slate-800">
                                                {size}
                                            </td>

                                            <td className="px-3 py-2 text-center text-xs text-slate-500">
                                                {customSizeCategories[size] || "Custom"}
                                            </td>

                                            <td className="p-1.5">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    value={
                                                        customPrices[size] !== undefined
                                                            ? customPrices[size]
                                                            : sizePrice
                                                    }
                                                    onChange={(e) =>
                                                        handlePriceChange(
                                                            size,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-right text-xs font-bold font-mono shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                                                />
                                            </td>

                                            <td className="p-1.5">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={value}
                                                    onChange={(e) =>
                                                        handleSizeChange(
                                                            size,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 w-full rounded-md border border-teal-500 bg-white px-2 text-center text-sm font-bold text-teal-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                />
                                            </td>

                                            <td className="px-3 py-2 text-right text-[11px] font-bold font-mono text-teal-700">
                                                {formatCurrency(itemSubtotal)}
                                            </td>

                                            <td className="px-2 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveSize(size)
                                                    }
                                                    className="cursor-pointer p-1 text-slate-400 transition-colors hover:text-rose-600"
                                                    title="Hapus ukuran ini"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!showCustomForm ? (
                                    <tr className="bg-slate-50/70 transition-colors hover:bg-teal-50/40">
                                        <td className="px-2 py-2 text-center font-mono text-slate-400">
                                            {productPresetList.length +
                                                otherActiveSizes.length +
                                                1}
                                        </td>

                                        <td className="px-3 py-2 text-center font-bold text-slate-600">
                                            Custom
                                        </td>

                                        <td className="px-3 py-2" />
                                        <td className="px-3 py-2" />
                                        <td className="px-3 py-2" />
                                        <td className="px-3 py-2" />

                                        <td className="px-2 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={handleOpenCustomForm}
                                                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-teal-300 bg-white text-base font-bold leading-none text-teal-700 shadow-sm transition-colors hover:bg-teal-50 hover:text-teal-800"
                                                title="Tambah ukuran custom"
                                            >
                                                +
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr className="bg-teal-50/30">
                                        <td className="px-2 py-2 text-center font-mono text-slate-400">
                                            {productPresetList.length +
                                                otherActiveSizes.length +
                                                1}
                                        </td>

                                        <td className="p-1.5">
                                            <input
                                                type="text"
                                                placeholder="Custom"
                                                value={newSizeName}
                                                onChange={(e) =>
                                                    setNewSizeName(e.target.value)
                                                }
                                                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-800 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                                                autoFocus
                                            />
                                        </td>

                                        <td className="p-1.5">
                                            <div className="flex h-8 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-500">
                                                Custom
                                            </div>
                                        </td>

                                        <td className="p-1.5">
                                            <input
                                                type="number"
                                                min="0"
                                                step="100"
                                                placeholder={String(
                                                    defaultUnitPrice || 0,
                                                )}
                                                value={newSizePrice}
                                                onChange={(e) =>
                                                    setNewSizePrice(e.target.value)
                                                }
                                                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-right text-xs font-bold font-mono shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                                            />
                                        </td>

                                        <td className="p-1.5">
                                            <input
                                                type="number"
                                                min="1"
                                                value={newSizeQuantity}
                                                onChange={(e) =>
                                                    setNewSizeQuantity(e.target.value)
                                                }
                                                className="h-8 w-full rounded-md border border-teal-500 bg-white px-2 text-center text-sm font-bold text-teal-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                        </td>

                                        <td className="px-3 py-2 text-right text-[11px] font-bold font-mono text-teal-700">
                                            {formatCurrency(newCustomSubtotal)}
                                        </td>

                                        <td className="px-2 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={handleAddCustomInline}
                                                disabled={
                                                    !newSizeQuantity ||
                                                    Number(newSizeQuantity) < 1
                                                }
                                                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-teal-300 bg-white text-base font-bold leading-none text-teal-700 shadow-sm transition-colors hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-30"
                                                title="Tambahkan ukuran custom"
                                            >
                                                +
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5">
                    <div className="flex items-center gap-4 text-xs">
                        <div>
                            <span className="block text-[10px] font-semibold uppercase text-slate-400">
                                Total Qty
                            </span>
                            <span className="text-sm font-bold font-mono text-slate-900">
                                {totalQuantity} pcs
                            </span>
                        </div>

                        <div className="h-6 w-px bg-slate-200" />

                        <div>
                            <span className="block text-[10px] font-semibold uppercase text-slate-400">
                                Total Subtotal
                            </span>
                            <span className="text-sm font-bold font-mono text-teal-700">
                                {formatCurrency(calculatedSubtotal)}
                            </span>
                        </div>

                        {totalQuantity > 0 && hasDifferentPrices && (
                            <>
                                <div className="hidden h-6 w-px bg-slate-200 sm:block" />
                                <div className="hidden sm:block">
                                    <span className="block text-[10px] font-semibold uppercase text-slate-400">
                                        Rata-rata / pcs
                                    </span>
                                    <span className="text-xs font-bold font-mono text-slate-700">
                                        {formatCurrency(
                                            Math.round(
                                                calculatedSubtotal /
                                                    totalQuantity,
                                            ),
                                        )}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200/60"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={handleApply}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-teal-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-teal-700"
                        >
                            <Check className="h-3.5 w-3.5" />
                            <span>Terapkan ke Pesanan</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SizeBreakdownModal;
