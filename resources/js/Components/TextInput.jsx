import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-soft-2xs transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:shadow-soft-xs ' +
                className
            }
            ref={localRef}
        />
    );
});
