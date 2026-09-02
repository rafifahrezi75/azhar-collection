import React, { useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    Printer,
    Download,
    ArrowLeft,
    Wallet,
    Calendar,
    User as UserIcon,
    ChevronDown,
} from "lucide-react";

export default function Preview({
    users = [],
    selectedUserId: initialUserId,
    selectedMonth: initialMonth,
    selectedYear: initialYear,
}) {
    const iframeRef = useRef(null);

    const [selectedUserId, setSelectedUserId] = useState(
        initialUserId || (users.length > 0 ? String(users[0].id) : ""),
    );
    const [selectedMonth, setSelectedMonth] = useState(
        initialMonth || new Date().getMonth() + 1,
    );
    const [selectedYear, setSelectedYear] = useState(
        initialYear || new Date().getFullYear(),
    );

    const pdfUrl = `/dashboard/payroll/pdf?user_id=${selectedUserId}&month=${selectedMonth}&year=${selectedYear}`;

    const handlePrint = () => {
        if (iframeRef.current) iframeRef.current.contentWindow.print();
    };

    const monthOptions = [
        { val: 1, label: "Januari" },
        { val: 2, label: "Februari" },
        { val: 3, label: "Maret" },
        { val: 4, label: "April" },
        { val: 5, label: "Mei" },
        { val: 6, label: "Juni" },
        { val: 7, label: "Juli" },
        { val: 8, label: "Agustus" },
        { val: 9, label: "September" },
        { val: 10, label: "Oktober" },
        { val: 11, label: "November" },
        { val: 12, label: "Desember" },
    ];

    const currentUserName =
        users.find((u) => String(u.id) === String(selectedUserId))?.name ||
        "Karyawan";
    const currentMonthName =
        monthOptions.find((m) => m.val === Number(selectedMonth))?.label || "";

    return (
        <DashboardLayout>
            <Head
                title={`${currentUserName} - Slip Gaji (${currentMonthName} ${selectedYear}) - Azhar Collection`}
            />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-130px)] min-h-[620px]">
                    {/* HEADER AREA */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                            {/* Tombol Kembali & Info Judul */}
                            <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                    type="button"
                                    title="Kembali"
                                    onClick={() =>
                                        router.visit(
                                            `/dashboard/payroll?month=${selectedMonth}&year=${selectedYear}`,
                                        )
                                    }
                                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/60 flex items-center justify-center shadow-2xs shrink-0 font-bold">
                                    <Wallet className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                            Slip Penggajian Karyawan
                                        </h3>
                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold shadow-2xs">
                                            {currentMonthName} {selectedYear}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {currentUserName} &bull; Pratinjau slip
                                        honorarium, tunjangan, dan rekapitulasi
                                        kehadiran.
                                    </p>
                                </div>
                            </div>

                            {/* Toolbar Filter & Aksi */}
                            <div className="flex flex-wrap items-center justify-between xl:justify-end gap-2.5 shrink-0">
                                {/* Filter Karyawan */}
                                {users.length > 0 && (
                                    <div className="flex items-center h-8 bg-white border border-slate-300 rounded-lg px-2 text-xs shadow-2xs focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition-all">
                                        <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5 pointer-events-none" />
                                        <select
                                            value={selectedUserId}
                                            onChange={(e) =>
                                                setSelectedUserId(
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-transparent text-[11px] font-semibold text-slate-700 border-none outline-none ring-0 focus:ring-0 cursor-pointer py-0 px-3.5 text-center [text-align-last:center] bg-[position:right_-3px_center]"
                                        >
                                            {users.map((u) => (
                                                <option
                                                    key={u.id}
                                                    value={u.id}
                                                    className="text-left"
                                                >
                                                    {u.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Filter Periode Bulan & Tahun */}
                                <div className="flex items-center h-8 bg-white border border-slate-300 rounded-lg px-2 text-xs shadow-2xs focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition-all">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5 pointer-events-none" />

                                    {/* Bulan */}
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) =>
                                            setSelectedMonth(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="bg-transparent text-[11px] font-semibold text-slate-700 border-none outline-none ring-0 focus:ring-0 cursor-pointer py-0 px-3.5 text-center [text-align-last:center] bg-[position:right_-3px_center]"
                                    >
                                        {monthOptions.map((m) => (
                                            <option
                                                key={m.val}
                                                value={m.val}
                                                className="text-left"
                                            >
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>

                                    <span className="h-3.5 w-px bg-slate-200 mx-1.5 shrink-0" />

                                    {/* Tahun */}
                                    <select
                                        value={selectedYear}
                                        onChange={(e) =>
                                            setSelectedYear(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="bg-transparent text-[11px] font-semibold text-slate-700 border-none outline-none ring-0 focus:ring-0 cursor-pointer py-0 px-3.5 font-mono text-center [text-align-last:center] bg-[position:right_-3px_center]"
                                    >
                                        {[2024, 2025, 2026, 2027].map((y) => (
                                            <option
                                                key={y}
                                                value={y}
                                                className="text-left"
                                            >
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="flex items-center gap-1.5">
                                    <a
                                        href={pdfUrl}
                                        download={`Slip-Gaji-${currentUserName}-${currentMonthName}-${selectedYear}.pdf`}
                                        className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-300 shadow-2xs transition-all cursor-pointer"
                                        title="Unduh PDF"
                                    >
                                        <Download className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="mt-0.5">
                                            Unduh PDF
                                        </span>
                                    </a>

                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-semibold rounded-lg border border-teal-200 shadow-2xs transition-all cursor-pointer"
                                        title="Cetak PDF"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-teal-600" />
                                        <span className="mt-0.5">Cetak</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PDF VIEWER AREA */}
                    <div className="flex-1 w-full bg-slate-100/60 p-2 sm:p-3 overflow-hidden">
                        <div className="w-full h-full rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
                            <iframe
                                ref={iframeRef}
                                src={pdfUrl}
                                className="w-full h-full border-none block bg-white"
                                title="Pratinjau PDF Slip Gaji"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
