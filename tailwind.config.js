/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      colors: {
        sage: {
          DEFAULT: '#6b9b37',
          dark: '#5a8a2e',
          light: '#7fb044',
          tint: '#e8f5e8',
        },
        teal: {
          DEFAULT: '#008b8b',
          dark: '#006d6d',
          light: '#00a3a3',
          tint: '#e0f2f2',
        },
        cream: {
          DEFAULT: '#f5f2eb',
          dark: '#e8e4db',
          light: '#faf8f4',
        },
        charcoal: {
          DEFAULT: '#333333',
          light: '#555555',
        },
        muted: '#6b6b6b',
        amber: {
          DEFAULT: '#b8860b',
          light: '#daa520',
        },
        rust: '#a0522d',
        border: {
          DEFAULT: '#d4cfc4',
          light: '#e5e0d5',
        },
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(51, 51, 51, 0.06)',
        'soft-md': '0 4px 6px rgba(51, 51, 51, 0.08)',
        'soft-lg': '0 10px 15px rgba(51, 51, 51, 0.1)',
      },
    },
  },
  plugins: [],
}
