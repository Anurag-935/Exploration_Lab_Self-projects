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
          900: '#000000',
          800: '#F5E6C6', 
          500: '#E8342B',
          dark: '#FFFFFF',
          darker: '#FAF3E0',
          light: '#1A1A1A',
          muted: '#333333'
        }
      },
      boxShadow: {
        'neo': '4px 4px 0px #000000',
        'neo-sm': '2px 2px 0px #000000',
        'neo-input': '2px 2px 0px #000000',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}