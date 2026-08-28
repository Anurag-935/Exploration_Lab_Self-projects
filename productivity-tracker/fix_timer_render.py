import sys
import re

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    text = f.read()

pattern = r'<div className="w-full xl:w-1/3">\s*<Timer activeTasks=\{tasks\.filter\(t => \(t\.carried_over_count \|\| 0\) >= 0 && t\.status === "open"\)\} onStop=\{refetch\} />\s*</div>'
replacement = """<div className="w-full xl:w-1/3 flex flex-col gap-8">
              <div className="flex-1">
                <Timer activeTasks={tasks.filter(t => (t.carried_over_count || 0) >= 0 && t.status === "open")} onStop={refetch} />
              </div>
              <div className="flex-1">
                <ProjectsWidget projects={projects || []} onClick={() => setShowProjectsGallery(true)} />
              </div>
            </div>"""

text = re.sub(pattern, replacement, text)

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(text)
