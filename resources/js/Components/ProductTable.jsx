import React, { memo } from "react";
import {
    Edit2,
    Trash2,
    Eye,
    Shirt,
    Layers,
    Ruler,
} from "lucide-react";
import Pagination from "./Pagination";

const ProductTable = memo(function ProductTable({
    products = [],
    loading = false,
    canUpdate = false,
    canDelete = false,
    onViewDetail,
    onEdit,
    onDelete,
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    onItemsPerPageChange,
}) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const getPriceDisplay = (item) => {
        const sizes = item.sizes || [];

        if (sizes.length === 0) {
            return {
                text: formatCurrency(item.base_price),
                isRange: false,
            };
        }

        const prices = sizes
            .map((size) => parseFloat(size.price || 0))
            .filter((price) => price > 0);

        if (prices.length === 0) {
            return {
                text: formatCurrency(item.base_price),
                isRange: false,
            };
        }

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        if (min === max) {
            return {
                text: formatCurrency(min),
                isRange: false,
            };
        }

        return {
            text: `${formatCurrency(min)} - ${formatCurrency(max)}`,
            isRange: true,
        };
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-2.5 px-3.5 w-12 text-center">
                                No
                            </th>

                            <th className="py-2.5 px-3.5 min-w-[240px]">
                                Produk & Foto
                            </th>

                            <th className="py-2.5 px-3.5 w-32">
                                Rentang Harga
                            </th>

                            <th className="py-2.5 px-3.5 w-36">
                                Varian Ukuran
                            </th>

                            <th className="py-2.5 px-3.5 w-40">
                                Resep & Produksi
                            </th>

                            <th className="py-2.5 px-3.5 w-24 text-center">
                                Status
                            </th>

                            <th className="py-2.5 px-3.5 w-28 text-center">
                                Aksi
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="py-8 text-center text-slate-400"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />

                                        <span>
                                            Memuat data produk...
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="py-8 text-center text-slate-400"
                                >
                                    <Shirt className="w-8 h-8 mx-auto text-slate-300 mb-1" />

                                    <p className="font-medium text-slate-500">
                                        Belum ada data produk
                                    </p>

                                    <p className="text-[11px] text-slate-400">
                                        Silakan tambahkan produk baru
                                        beserta foto dan resep bahan
                                        bakunya.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            products.map((item, index) => {
                                const rowNumber =
                                    (currentPage - 1) *
                                        itemsPerPage +
                                    index +
                                    1;

                                const materials =
                                    item.materials || [];

                                const images =
                                    item.images || [];

                                const sizes =
                                    item.sizes || [];

                                const primaryImg =
                                    images.find(
                                        (image) =>
                                            image.is_primary,
                                    ) || images[0];

                                const priceInfo =
                                    getPriceDisplay(item);

                                return (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/70 transition-colors"
                                    >
                                        <td className="py-2.5 px-3.5 text-center text-slate-400 font-medium">
                                            {rowNumber}
                                        </td>

                                        <td className="py-2.5 px-3.5">
                                            <div className="flex items-start gap-2.5">
                                                <div className="relative shrink-0">
                                                    {primaryImg?.image_url ? (
                                                        <img
                                                            src={
                                                                primaryImg.image_url
                                                            }
                                                            alt={
                                                                item.name
                                                            }
                                                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-soft-2xs"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                                                            <Shirt className="w-5 h-5" />
                                                        </div>
                                                    )}

                                                    {images.length >
                                                        1 && (
                                                        <span className="absolute -bottom-1 -right-1 bg-slate-900/85 text-white text-[9px] font-bold px-1 rounded-full border border-white">
                                                            +
                                                            {images.length -
                                                                1}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                                                        <span>
                                                            {
                                                                item.name
                                                            }
                                                        </span>

                                                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                            {
                                                                item.code
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="text-[11px] text-slate-500">
                                                        {item.category ||
                                                            "Tanpa Kategori"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                                            <div className="font-bold text-slate-900 font-mono">
                                                {
                                                    priceInfo.text
                                                }
                                            </div>
                                        </td>

                                        <td className="py-2.5 px-3.5">
                                            <div className="mt-0.5">
                                                {sizes.length >
                                                0 ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                                        <Ruler className="w-2.5 h-2.5 text-teal-600" />

                                                        <span>
                                                            {
                                                                sizes.length
                                                            }{" "}
                                                            Ukuran
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400">
                                                        Harga seragam
                                                        semua ukuran
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="py-2.5 px-3.5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                                                    <Layers className="w-3 h-3 text-teal-600" />

                                                    {materials.length >
                                                    0 ? (
                                                        <span>
                                                            <strong className="text-slate-800">
                                                                {
                                                                    materials.length
                                                                }
                                                            </strong>{" "}
                                                            Bahan Baku
                                                        </span>
                                                    ) : (
                                                        <span className="italic">
                                                            Belum ada
                                                            bahan
                                                        </span>
                                                    )}
                                                </span>

                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                                                    <Shirt className="w-3 h-3 text-teal-600" />

                                                    {item
                                                        .production_steps
                                                        ?.length >
                                                    0 ? (
                                                        <span>
                                                            <strong className="text-slate-800">
                                                                {
                                                                    item
                                                                        .production_steps
                                                                        .length
                                                                }
                                                            </strong>{" "}
                                                            Langkah Jahit
                                                        </span>
                                                    ) : (
                                                        <span className="italic">
                                                            Belum ada
                                                            langkah
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-2.5 px-3.5 text-center">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    item.is_active
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : "bg-rose-50 text-rose-700 border border-rose-200"
                                                }`}
                                            >
                                                {item.is_active
                                                    ? "Aktif"
                                                    : "Non-Aktif"}
                                            </span>
                                        </td>

                                        <td className="py-2.5 px-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onViewDetail &&
                                                        onViewDetail(
                                                            item,
                                                        )
                                                    }
                                                    title="Detail"
                                                    aria-label="Detail"
                                                    className="w-7 h-7 inline-flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition-all duration-200 border border-sky-200/80 cursor-pointer shadow-soft-2xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>

                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onEdit(
                                                                item,
                                                            )
                                                        }
                                                        title="Edit"
                                                        aria-label="Edit"
                                                        className="w-7 h-7 inline-flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all duration-200 border border-indigo-200/80 cursor-pointer shadow-soft-2xs"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onDelete(
                                                                item,
                                                            )
                                                        }
                                                        title="Hapus"
                                                        aria-label="Hapus"
                                                        className="w-7 h-7 inline-flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-all duration-200 border border-rose-200/80 cursor-pointer shadow-soft-2xs"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {totalItems > 0 && onPageChange && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                    onItemsPerPageChange={
                        onItemsPerPageChange
                    }
                />
            )}
        </div>
    );
});

export default ProductTable;
