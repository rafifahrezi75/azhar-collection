import React from 'react';
import { Activity } from 'lucide-react';

export default function ApplicationLogo({
    className = 'w-10 h-10',
    iconClassName = 'w-5 h-5 text-white',
    ...props
}) {
    return (
        <div
            {...props}
            className={`rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/30 shrink-0 ${className}`}
        >
            <Activity className={iconClassName} />
        </div>
    );
}
