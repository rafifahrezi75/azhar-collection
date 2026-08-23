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
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
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
                'xl': '0.625rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'soft-2xs': '0 1px 2px rgba(0,0,0,0.04)',
                'soft-xs': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                'soft-sm': '0 2px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
                'soft-md': '0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)',
                'soft-lg': '0 8px 24px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.03)',
                'soft-xl': '0 12px 36px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.03)',
                'inner-soft': 'inset 0 1px 3px rgba(0,0,0,0.06)',
            },
        },
    },

    plugins: [forms],
};
