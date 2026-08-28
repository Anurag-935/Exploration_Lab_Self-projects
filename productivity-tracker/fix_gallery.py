import sys
with open("src/components/ProjectsGallery.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"', 'className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"')

with open("src/components/ProjectsGallery.tsx", "w", encoding="utf-8") as f:
    f.write(text)
