import { X, FolderKanban } from "lucide-react"
import { Project } from "../types"
import ProgressGauge from "./ProgressGauge"

type Props = {
  projects: Project[]
  onClose: () => void
  onSelectProject: (p: Project) => void
}

export default function ProjectsGallery({ projects, onClose, onSelectProject }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-brand-dark rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-brand-900/50 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-brand-900/50 flex justify-between items-center bg-brand-darker/50">
          <div>
            <h2 className="text-xl font-bold text-brand-light flex items-center gap-3">
              <FolderKanban className="text-brand-500" />
              Projects
            </h2>
            <p className="text-brand-light/50 text-sm mt-1">Track your technical projects.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-brand-light/50 hover:text-brand-light hover:bg-brand-900/50 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {projects.length === 0 ? (
            <div className="text-center py-20 text-brand-light/40 italic">
              No projects found. Use SQL to insert test data for now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div 
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="bg-brand-darker border border-brand-900/50 rounded-xl p-5 hover:border-brand-500 hover:-translate-y-1 transition-all cursor-pointer group shadow-sm hover:shadow-brand-500/10 flex flex-col h-full"
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
                  
                  <div className="mt-4 pt-4 border-t border-brand-900/30 flex justify-between items-center">
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
    </div>
  )
}
