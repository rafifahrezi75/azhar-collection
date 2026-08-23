export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-300 text-teal-600 shadow-soft-2xs focus:ring-teal-500/25 focus:ring-2 focus:ring-offset-1 ' +
                className
            }
        />
    );
}
