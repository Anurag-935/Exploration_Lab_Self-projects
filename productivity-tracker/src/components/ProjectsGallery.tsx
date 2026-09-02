import { X, FolderKanban, Plus } from "lucide-react"
import { supabase } from "../lib/supabase"
import { useState } from "react"
import { Project } from "../types"
import { createPortal } from "react-dom"
import ProgressGauge from "./ProgressGauge"

type Props = {
  projects: Project[]
  onClose: () => void
  onSelectProject: (p: Project) => void
  onUpdated: () => void
}

export default function ProjectsGallery({ projects, onClose, onSelectProject, onUpdated }: Props) {
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
  }
  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-dark rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col border-2 border-brand-900 shadow-neo overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b-2 border-brand-900 flex justify-between items-center bg-brand-darker/50 shadow-neo-input">
          <div>
            <h2 className="text-xl font-bold text-brand-light flex items-center gap-3">
              <FolderKanban className="text-brand-500" />
              Projects
            </h2>
            <p className="text-brand-light/50 text-sm mt-1">Track your technical projects.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleCreateProject} disabled={creating} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded text-sm font-medium flex items-center gap-2 transition-colors border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold "
            >
              <Plus size={16} />
              {creating ? "Creating..." : "New Project"}
            </button>
            <button onClick={onClose} className="text-brand-light/50 hover:text-brand-light hover:bg-brand-900/50 p-2 rounded-full transition-all border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold "
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {projects.length === 0 ? (
            <div className="text-center py-20 text-brand-light/40 italic">
              No projects uploaded yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div 
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="bg-brand-darker border-2 border-brand-900 rounded-xl p-5 hover:border-brand-500 hover:-translate-y-1 transition-all cursor-pointer group shadow-neo hover:shadow-brand-500/10 flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-brand-light text-lg leading-tight group-hover:text-brand-500 transition-colors flex-1 pr-4">{project.title}</h3>
                    <div className="shrink-0">
                      <ProgressGauge progress={project.progress_percent} />
                    </div>
                  </div>
                  <p className="text-sm text-brand-light/60 flex-1 line-clamp-3">
                    {project.description || "No description provided."}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t-2 border-brand-900 flex justify-between items-center">
                    <span className="text-[10px] text-brand-light/40 uppercase tracking-widest font-semibold">
                      {project.progress_percent === 100 ? "Done" : project.progress_percent === 0 ? "Pending" : "Active"}
                    </span>
                    <span className="text-xs text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open details &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  )
}
