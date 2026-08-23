export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-semibold text-slate-600 uppercase tracking-wide ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
