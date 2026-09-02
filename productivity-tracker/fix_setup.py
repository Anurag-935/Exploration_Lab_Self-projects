import sys

# Update index.html to add Space Grotesk font
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

if "fonts.googleapis.com" not in html:
    font_link = """    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">"""
    html = html.replace('</head>', font_link + '\n  </head>')
    
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)

# Update tailwind.config.js
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
}"""
with open("tailwind.config.js", "w", encoding="utf-8") as f:
    f.write(tailwind)
