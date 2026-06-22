/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#faf5f0',
          100: '#f5ede5',
          200: '#ede0d4',
          300: '#e0cbb8',
          400: '#d2b49c',
          500: '#c49e82',
          600: '#a67c5e',
          700: '#8a6550',
          800: '#6e4f40',
          900: '#523a30',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
