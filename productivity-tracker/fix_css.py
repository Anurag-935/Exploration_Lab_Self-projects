import sys
with open("src/index.css", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('rgba(239, 231, 222, 0.2)', 'rgba(232, 52, 43, 0.3)')
text = text.replace('rgba(239, 231, 222, 0.6)', 'rgba(232, 52, 43, 0.8)')

with open("src/index.css", "w", encoding="utf-8") as f:
    f.write(text)
