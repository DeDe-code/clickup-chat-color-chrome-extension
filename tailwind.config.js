/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  safelist: ['bg-gray-900', 'text-white', 'bg-white', 'text-black', 'bg-gray-200'],
  plugins: [],
}
