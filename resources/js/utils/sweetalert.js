import Swal from 'sweetalert2';

// Toast Notification Configuration
export class Toast {
    static success(title) {
        Swal.fire({
            icon: 'success',
            title: title,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                popup: 'rounded-lg shadow-lg border border-slate-100 font-sans',
            },
        });
    }

    static error(title) {
        Swal.fire({
            icon: 'error',
            title: title,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
            customClass: {
                popup: 'rounded-lg shadow-lg border border-slate-100 font-sans',
            },
        });
    }
}

// Confirmation Dialog
export const confirmDialog = async ({
    title = 'Apakah Anda Yakin?',
    text = 'Tindakan ini tidak dapat dibatalkan.',
    confirmButtonText = 'Ya, Lanjutkan',
    cancelButtonText = 'Batal',
    icon = 'warning',
}) => {
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor: '#4f46e5', // Indigo-600
        cancelButtonColor: '#64748b', // Slate-500
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
        customClass: {
            popup: 'rounded-lg font-sans',
            confirmButton: 'px-4 py-2 text-xs font-bold rounded-lg shadow-md',
            cancelButton: 'px-4 py-2 text-xs font-bold rounded-lg',
        },
    });

    return result.isConfirmed;
};

export default Swal;
