import sys

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('      if (updated && updated.progress_percent !== selectedProject.progress_percent) {', '      if (updated) {')

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(text)
