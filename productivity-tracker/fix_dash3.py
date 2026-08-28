import sys

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Pass onUpdated to ProjectsGallery
old_gallery = """      {showProjectsGallery && (
        <ProjectsGallery 
          projects={projects || []}
          onClose={() => setShowProjectsGallery(false)}
          onSelectProject={(p) => {
            setSelectedProject(p)
            setShowProjectsGallery(false)
            setSelectedProject(p)
          }}
        />
      )}"""
new_gallery = """      {showProjectsGallery && (
        <ProjectsGallery 
          projects={projects || []}
          onClose={() => setShowProjectsGallery(false)}
          onSelectProject={(p) => {
            setShowProjectsGallery(false)
            setSelectedProject(p)
          }}
          onUpdated={refetch}
        />
      )}"""
text = text.replace(old_gallery, new_gallery)

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(text)
