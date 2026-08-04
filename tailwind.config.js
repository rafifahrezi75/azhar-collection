import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'system-ui', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                clinova: {
                    50: '#fdf4fd',
                    100: '#fbe8fb',
                    200: '#f7c6f7',
                    300: '#ed9bed',
                    400: '#df6cdf',
                    500: '#b82eb8',
                    600: '#800080',
                    700: '#700070',
                    800: '#5c005c',
                    900: '#4a004a',
                },
                teal: {
                    50: '#fdf4fd',
                    100: '#fbe8fb',
                    200: '#f7c6f7',
                    300: '#ed9bed',
                    400: '#df6cdf',
                    500: '#b82eb8',
                    600: '#800080',
                    700: '#700070',
                    800: '#5c005c',
                    900: '#4a004a',
                },
                sidebar: {
                    DEFAULT: '#0f172a',
                    foreground: '#94a3b8',
                    primary: '#800080',
                    'primary-foreground': '#ffffff',
                    accent: '#1e293b',
                    border: '#1e293b',
                }
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            }
        },
    },

    plugins: [forms],
};
