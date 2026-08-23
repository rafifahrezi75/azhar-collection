import React, { memo } from "react";

const Tooltip = memo(function Tooltip({
    content,
    children,
    position = "bottom",
    className = "",
}) {
    if (!content) return children;

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
        left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
        right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent border-[4px]",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent border-[4px]",
        left: "left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent border-[4px]",
        right: "right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent border-[4px]",
    };

    return (
        <div className={`relative group inline-flex items-center justify-center ${className}`}>
            {children}
            <div
                role="tooltip"
                className={`absolute ${positionClasses[position] || positionClasses.bottom} hidden group-hover:flex group-focus-within:flex flex-col items-center pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-100`}
            >
                <div className={`w-0 h-0 absolute ${arrowClasses[position] || arrowClasses.bottom}`} />
                <div className="bg-slate-900 text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-lg shadow-soft-lg whitespace-nowrap select-none">
                    {content}
                </div>
            </div>
        </div>
    );
});

export default Tooltip;
