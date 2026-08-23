export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-soft-xs transition-all duration-200 hover:bg-teal-700 hover:shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:ring-offset-2 active:shadow-soft-2xs active:translate-y-px ${
                    disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
