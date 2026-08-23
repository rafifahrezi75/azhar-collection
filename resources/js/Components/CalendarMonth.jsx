import React from "react";
import { todayLocal } from "@/utils/format";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CalendarMonth({ year, month, daysMap, selectedDate, onSelectDate, filteredDate, rangeStart, rangeEnd }) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const todayStr = todayLocal();

    return (
        <div>
            <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayLogs = daysMap?.[day] || [];
                    const totalQty = dayLogs.reduce((s, l) => s + l.qty, 0);
                    const isSelected = selectedDate === dateStr;
                    const isFiltered = filteredDate === dateStr;
                    const isToday = todayStr === dateStr;
                    const inRange = rangeStart && rangeEnd && dateStr >= rangeStart && dateStr <= rangeEnd;

                    let cls;
                    if (isSelected || isFiltered) {
                        cls = "bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-1";
                    } else if (dayLogs.length > 0) {
                        cls = "bg-teal-500/90 hover:bg-teal-600 text-white shadow-sm";
                    } else if (isToday) {
                        cls = "bg-slate-800 hover:bg-slate-700 text-white";
                    } else if (inRange) {
                        cls = "bg-teal-50 text-teal-600 font-semibold hover:bg-teal-100";
                    } else {
                        cls = "bg-white hover:bg-slate-50 text-slate-600";
                    }

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => onSelectDate(dateStr)}
                            className={`
                                relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all cursor-pointer border
                                ${dayLogs.length > 0 || isSelected || isFiltered || isToday || inRange ? "border-transparent" : "border-slate-200"}
                                ${cls}
                            `}
                        >
                            <span className="text-[11px] font-bold">{day}</span>
                            {dayLogs.length > 0 && (
                                <span className="text-[9px] font-semibold leading-tight opacity-90">{totalQty}pcs</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
