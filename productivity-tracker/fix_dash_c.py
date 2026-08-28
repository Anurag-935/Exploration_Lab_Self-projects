import sys

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Fix the render of Timer div
old_timer_div = """            <div className="w-full xl:w-1/3">
              <Timer activeTasks={tasks.filter(t => (t.carried_over_count || 0) >= 0 && t.status === "open")} onStop={refetch} />
            </div>"""
new_timer_div = """            <div className="w-full xl:w-1/3 flex flex-col gap-8">
              <div className="flex-1">
                <Timer activeTasks={tasks.filter(t => (t.carried_over_count || 0) >= 0 && t.status === "open")} onStop={refetch} />
              </div>
              <div className="flex-1">
                <ProjectsWidget projects={projects || []} onClick={() => setShowProjectsGallery(true)} />
              </div>
            </div>"""
text = text.replace(old_timer_div, new_timer_div)

# Import ProjectDetail
text = text.replace('import ProjectsGallery from "../components/ProjectsGallery"', 'import ProjectsGallery from "../components/ProjectsGallery"\nimport ProjectDetail from "../components/ProjectDetail"')

# Add ProjectDetail to the JSX
old_modal = """            // Phase C detail view will open here
            alert("Phase C: Opening details for " + p.title)"""
new_modal = """            setShowProjectsGallery(false)
            setSelectedProject(p)"""
text = text.replace(old_modal, new_modal)

modal_addition = """
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => {
            setSelectedProject(null)
            setShowProjectsGallery(true)
          }}
          onUpdated={refetch}
        />
      )}
    </div>
  )
}"""
text = text.replace('    </div>\n  )\n}', modal_addition)

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(text)
