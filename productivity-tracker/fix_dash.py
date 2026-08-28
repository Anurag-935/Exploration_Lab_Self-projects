import sys

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add imports
text = text.replace('import Timer from "../components/Timer"', 'import Timer from "../components/Timer"\nimport ProjectsWidget from "../components/ProjectsWidget"\nimport { useState } from "react"')

# Add destructuring of projects
text = text.replace('const { tasks, loading, refetch, lastRefreshed } = useData()', 'const { tasks, projects, loading, refetch, lastRefreshed } = useData()\n  const [showProjectsGallery, setShowProjectsGallery] = useState(false)')

# Modify the Timer div
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

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(text)
