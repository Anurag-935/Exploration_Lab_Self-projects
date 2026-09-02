import sys

# 1. Update tailwind.config.js for Dark Neobrutalism
tailwind = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#FFFFFF', // borders & shadows
          800: '#2A2A2A', // secondary panel
          500: '#E8342B', // primary accent (red)
          dark: '#1A1A1A', // card bg
          darker: '#000000', // page bg
          light: '#FFFFFF', // main text
          muted: '#A0A0A0' // body text
        }
      },
      boxShadow: {
        'neo': '4px 4px 0px #FFFFFF',
        'neo-sm': '2px 2px 0px #FFFFFF',
        'neo-input': '2px 2px 0px #FFFFFF',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}"""
with open("tailwind.config.js", "w", encoding="utf-8") as f:
    f.write(tailwind)
