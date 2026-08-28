import sys
import re

with open("pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add import
text = text.replace('import ProjectsWidget from "../components/ProjectsWidget"', 'import ProjectsWidget from "../components/ProjectsWidget"\nimport ProjectsGallery from "../components/ProjectsGallery"\nimport { Project } from "../types"')

# Add selectedProject state
text = text.replace('const [showProjectsGallery, setShowProjectsGallery] = useState(false)', 'const [showProjectsGallery, setShowProjectsGallery] = useState(false)\n  const [selectedProject, setSelectedProject] = useState<Project | null>(null)')

# Add Gallery modal to bottom
modal = """
      {showProjectsGallery && (
        <ProjectsGallery 
          projects={projects || []}
          onClose={() => setShowProjectsGallery(false)}
          onSelectProject={(p) => {
            setSelectedProject(p)
            // Phase C detail view will open here
            alert("Phase C: Opening details for " + p.title)
          }}
        />
      )}
    </div>
  )
}"""
text = re.sub(r'    </div>\s*\)\s*}\s*$', modal, text)

with open("pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(text)
