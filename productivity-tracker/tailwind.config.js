/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#5A1420',
          800: '#892535', 
          500: '#B14858',
          dark: '#3B3B3D',
          darker: '#2A2A2B',
          light: '#EFE7DE'
        }
      }
    },
  },
  plugins: [],
}
