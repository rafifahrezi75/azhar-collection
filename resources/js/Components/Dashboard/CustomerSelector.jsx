import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { Search, ChevronDown, Check, Users, Building2, X } from "lucide-react";

const CustomerSelector = memo(function CustomerSelector({
    customers = [],
    value = "ALL",
    onChange,
    placeholder = "Semua Pelanggan",
    allLabel,
    label,
}) {
    const allText = allLabel || placeholder;
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return customers;
        return customers.filter(
            (c) =>
                (c.name || "").toLowerCase().includes(q) ||
                (c.code || "").toLowerCase().includes(q) ||
                (c.institution_name || "").toLowerCase().includes(q)
        );
    }, [customers, query]);

    const selected = useMemo(() => {
        if (value === "ALL") return null;
        return customers.find((c) => String(c.customer_id ?? c.id) === String(value));
    }, [customers, value]);

    const handleSelect = useCallback(
        (id) => {
            onChange(id);
            setIsOpen(false);
            setQuery("");
        },
        [onChange]
    );

    return (
        <div className={`relative ${label ? "" : "w-full sm:w-72"}`} ref={containerRef}>
            {label && (
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 bg-white border rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-all select-none shadow-soft-2xs ${
                    isOpen
                        ? "border-teal-500 ring-2 ring-teal-500/20"
                        : "border-slate-200 hover:border-slate-300"
                }`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        {selected ? (
                            <Building2 className="w-3.5 h-3.5" />
                        ) : (
                            <Users className="w-3.5 h-3.5" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">
                            {selected ? selected.name : allText}
                        </div>
                        {selected && (
                            <div className="text-[10px] text-slate-400 truncate">
                                {[selected.code, selected.institution_name].filter(Boolean).join(" · ") || "-"}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    {value !== "ALL" && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect("ALL");
                            }}
                            title="Reset ke Semua Pelanggan"
                            className="p-0.5 hover:text-slate-600 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180 text-teal-600" : ""}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-40 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-soft-lg overflow-hidden animate-in fade-in duration-150">
                    <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari nama / kode pelanggan..."
                            className="w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 p-0.5"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        <button
                            type="button"
                            onClick={() => handleSelect("ALL")}
                            className={`w-full px-3 py-2.5 flex items-center gap-2 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                                value === "ALL" ? "bg-teal-50/60" : ""
                            }`}
                        >
                            <Users className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 flex-1">{allText}</span>
                            {value === "ALL" && <Check className="w-3.5 h-3.5 text-teal-600" />}
                        </button>
                        {filtered.map((c) => {
                            const id = String(c.customer_id ?? c.id);
                            const active = id === String(value);
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => handleSelect(id)}
                                    className={`w-full px-3 py-2.5 flex items-center gap-2 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                                        active ? "bg-teal-50/60" : ""
                                    }`}
                                >
                                    <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                                        {(c.name || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-slate-800 truncate">{c.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate">
                                            {[c.code, c.institution_name].filter(Boolean).join(" · ") || "-"}
                                        </div>
                                    </div>
                                    {active && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                                </button>
                            );
                        })}
                        {filtered.length === 0 && (
                            <div className="px-3 py-6 text-center text-xs text-slate-400 italic">
                                Tidak ada pelanggan cocok.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default CustomerSelector;
