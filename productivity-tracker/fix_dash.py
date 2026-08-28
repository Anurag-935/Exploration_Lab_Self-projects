import sys

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add useEffect import if not present
if "useEffect" not in text:
    text = text.replace('import { useState } from "react"', 'import { useState, useEffect } from "react"')

# Add useEffect for sync
sync_effect = """  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    if (selectedProject && projects) {
      const updated = projects.find(p => p.id === selectedProject.id)
      if (updated && updated.progress_percent !== selectedProject.progress_percent) {
        setSelectedProject(updated)
      }
    }
  }, [projects])"""

text = text.replace('  const [selectedProject, setSelectedProject] = useState<Project | null>(null)', sync_effect)

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(text)
