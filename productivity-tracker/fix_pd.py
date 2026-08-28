import sys

with open("src/components/ProjectDetail.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("const today = new Date()\n    // adjust for local timezone offset", "let today = new Date()\n    // adjust for local timezone offset")

with open("src/components/ProjectDetail.tsx", "w", encoding="utf-8") as f:
    f.write(text)
