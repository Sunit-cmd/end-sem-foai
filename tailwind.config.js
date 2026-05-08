/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dashboard-beige': '#FDFCF0',
        'dashboard-cream': '#FEFEFB',
      }
    },
  },
  plugins: [],
}

