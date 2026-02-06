/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f9aa7',
          foreground: '#f0fdfa',
        },
        accent: '#0b7285',
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
