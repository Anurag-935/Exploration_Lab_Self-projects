import sys

with open("src/components/ProjectsGallery.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Imports
text = text.replace('import { X, FolderKanban } from "lucide-react"', 'import { X, FolderKanban, Plus } from "lucide-react"\nimport { supabase } from "../lib/supabase"\nimport { useState } from "react"')

# Props
text = text.replace('  onSelectProject: (p: Project) => void\n}', '  onSelectProject: (p: Project) => void\n  onUpdated: () => void\n}')

# Component setup
old_comp = 'export default function ProjectsGallery({ projects, onClose, onSelectProject }: Props) {'
new_comp = """export default function ProjectsGallery({ projects, onClose, onSelectProject, onUpdated }: Props) {
  const [creating, setCreating] = useState(false)

  const handleCreateProject = async () => {
    setCreating(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data } = await supabase.from("projects").insert({
      user_id: userData.user.id,
      title: "Untitled Project",
      description: "",
      progress_percent: 0
    }).select().single()

    setCreating(false)
    if (data) {
      onUpdated()
      onSelectProject(data)
    }
  }"""
text = text.replace(old_comp, new_comp)

# Button in header
old_header = """          <button 
            onClick={onClose}
            className="text-brand-light/50 hover:text-brand-light hover:bg-brand-900/50 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>"""
new_header = """          <div className="flex items-center gap-4">
            <button
              onClick={handleCreateProject}
              disabled={creating}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              {creating ? "Creating..." : "New Project"}
            </button>
            <button 
              onClick={onClose}
              className="text-brand-light/50 hover:text-brand-light hover:bg-brand-900/50 p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>"""
text = text.replace(old_header, new_header)

with open("src/components/ProjectsGallery.tsx", "w", encoding="utf-8") as f:
    f.write(text)
