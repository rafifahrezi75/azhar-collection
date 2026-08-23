export const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Parse "Y-m-d..." string as LOCAL date to avoid timezone shift
const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    const m = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

export const formatDate = (dateString) => {
    const date = parseLocalDate(dateString);
    if (!date) return "-";
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

export const formatDateWithDay = (dateString) => {
    const date = parseLocalDate(dateString);
    if (!date) return "-";
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

// Today's date as local Y-m-d string (avoids UTC offset bug from toISOString)
export const todayLocal = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
