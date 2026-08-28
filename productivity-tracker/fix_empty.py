import sys

with open("src/components/ProjectsGallery.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("No projects found. Use SQL to insert test data for now.", "No projects uploaded yet")

with open("src/components/ProjectsGallery.tsx", "w", encoding="utf-8") as f:
    f.write(text)
