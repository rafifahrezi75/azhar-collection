import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, X } from "lucide-react";

export default function SearchableSelect({
    options = [],
    value = "",
    onChange,
    placeholder = "-- Cari / Pilih --",
    searchPlaceholder = "Ketik untuk mencari...",
    disabled = false,
    required = false,
    className = "",
    size = "sm",
    clearable = false,
    emptyMessage = "Data tidak ditemukan",
    actionOption = null,
    onAction = null,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [menuStyle, setMenuStyle] = useState({});

    const triggerRef = useRef(null);
    const searchInputRef = useRef(null);
    const listRef = useRef(null);
    const menuRef = useRef(null);

    const selectedOption = useMemo(() => {
        return options.find((opt) => String(opt.value) === String(value));
    }, [options, value]);

    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase().trim();
        return options.filter((opt) => {
            const labelMatch = opt.label?.toLowerCase().includes(q);
            const sublabelMatch = opt.sublabel?.toLowerCase().includes(q);
            const badgeMatch = opt.badge?.toLowerCase().includes(q);
            const extraMatch = opt.searchKey?.toLowerCase().includes(q);
            return labelMatch || sublabelMatch || badgeMatch || extraMatch;
        });
    }, [options, searchQuery]);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = 280;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        const style = {
            position: "fixed",
            left: `${rect.left}px`,
            width: `${Math.max(rect.width, 260)}px`,
            zIndex: 99999,
        };

        if (openUpward) {
            style.bottom = `${window.innerHeight - rect.top + 4}px`;
            style.maxHeight = `${Math.min(dropdownHeight, Math.max(160, spaceAbove - 16))}px`;
        } else {
            style.top = `${rect.bottom + 4}px`;
            style.maxHeight = `${Math.min(dropdownHeight, Math.max(160, spaceBelow - 16))}px`;
        }

        setMenuStyle(style);
    }, []);

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            const handleScrollOrResize = () => updatePosition();
            window.addEventListener("scroll", handleScrollOrResize, true);
            window.addEventListener("resize", handleScrollOrResize);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 40);
            return () => {
                window.removeEventListener("scroll", handleScrollOrResize, true);
                window.removeEventListener("resize", handleScrollOrResize);
            };
        }
    }, [isOpen, updatePosition]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target) &&
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setIsOpen(false);
                setSearchQuery("");
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = useCallback(
        (val) => {
            onChange(val);
            setIsOpen(false);
            setSearchQuery("");
            setHighlightedIndex(-1);
        },
        [onChange]
    );

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("");
        setSearchQuery("");
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                handleSelect(filteredOptions[highlightedIndex].value);
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            setIsOpen(false);
            setSearchQuery("");
        }
    };

    const isCompact = size === "xs";

    return (
        <div className={`relative w-full ${className}`}>
            {required && (
                <input
                    type="text"
                    value={value || ""}
                    onChange={() => {}}
                    required
                    tabIndex={-1}
                    className="sr-only"
                    aria-hidden="true"
                />
            )}

            <div
                ref={triggerRef}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={disabled ? undefined : handleKeyDown}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between border transition-all select-none shadow-2xs ${
                    isCompact ? "h-7 px-2 text-[11px] rounded-md" : "h-8 px-2.5 text-xs rounded-lg"
                } ${
                    disabled
                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                        : isOpen
                        ? "bg-white border-teal-600 ring-2 ring-teal-600/20 shadow-sm cursor-pointer"
                        : "bg-white border-slate-300 hover:border-slate-400 text-slate-800 cursor-pointer"
                }`}
            >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {selectedOption ? (
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="font-semibold text-slate-800 truncate">
                                {selectedOption.label}
                            </span>
                            {selectedOption.badge && (
                                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded shrink-0">
                                    {selectedOption.badge}
                                </span>
                            )}
                            {selectedOption.sublabel && (
                                <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                                    &bull; {selectedOption.sublabel}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-400 font-medium truncate">
                            {placeholder}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-400 ml-1">
                    {clearable && value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-0.5 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                    <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-teal-600" : ""
                        }`}
                    />
                </div>
            </div>

            {isOpen &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={menuStyle}
                        className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-100 font-sans"
                    >
                        <div className="p-2.5 border-b border-slate-100 bg-slate-50/90 flex items-center gap-2 shrink-0">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setHighlightedIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={searchPlaceholder}
                                className="w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 p-0"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        searchInputRef.current?.focus();
                                    }}
                                    className="text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {actionOption && (
                            <div
                                onClick={() => {
                                    setIsOpen(false);
                                    onAction && onAction();
                                }}
                                className="px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50/70 hover:bg-teal-100 border-b border-teal-100 cursor-pointer flex items-center gap-1.5 transition-colors shrink-0"
                            >
                                {actionOption}
                            </div>
                        )}

                        <div
                            ref={listRef}
                            role="listbox"
                            className="overflow-y-auto divide-y divide-slate-100/60 p-1 flex-1"
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt, idx) => {
                                    const isSelected = String(opt.value) === String(value);
                                    const isHighlighted = highlightedIndex === idx;

                                    return (
                                        <div
                                            key={opt.value || idx}
                                            role="option"
                                            aria-selected={isSelected}
                                            onClick={() => handleSelect(opt.value)}
                                            onMouseEnter={() => setHighlightedIndex(idx)}
                                            className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-colors text-xs ${
                                                isSelected
                                                    ? "bg-teal-50/80 text-teal-950 font-bold"
                                                    : isHighlighted
                                                    ? "bg-slate-100/80 text-slate-900"
                                                    : "hover:bg-slate-50 text-slate-700"
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-bold text-slate-800 truncate">
                                                        {opt.label}
                                                    </span>
                                                    {opt.badge && (
                                                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded shrink-0">
                                                            {opt.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                {opt.sublabel && (
                                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                        {opt.sublabel}
                                                    </p>
                                                )}
                                            </div>

                                            {isSelected && (
                                                <Check className="w-4 h-4 text-teal-600 shrink-0 ml-1" />
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-3 text-center text-xs text-slate-400 font-medium">
                                    {emptyMessage}
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}
