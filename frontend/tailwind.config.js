/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12292B',
        teal: {
          DEFAULT: '#0F5257',
          dark: '#0A3A3E',
          light: '#E4F0EF',
        },
        coral: {
          DEFAULT: '#FF6B4A',
          dark: '#E5502F',
        },
        sand: '#F7F4EF',
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
}
