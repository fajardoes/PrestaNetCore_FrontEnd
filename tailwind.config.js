/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0284c7',
          foreground: '#f0f9ff',
        },
        accent: '#0369a1',
        danger: {
          DEFAULT: '#dc2626',
          foreground: '#fef2f2',
        },
        sidebar: '#0f172a',
      },
    },
  },
  plugins: [],
}
