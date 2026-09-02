import { FolderKanban } from "lucide-react"
import { Project } from "../types"

type Props = {
  projects: Project[]
  onClick: () => void
}

export default function ProjectsWidget({ projects, onClick }: Props) {
  const total = projects.length
  const done = projects.filter(p => p.progress_percent === 100).length
  const notStarted = projects.filter(p => p.progress_percent === 0).length
  const inProgress = total - done - notStarted // equivalently: p.progress_percent > 0 && p.progress_percent < 100

  return (
    <div 
      onClick={onClick}
      className="bg-brand-dark p-6 rounded-xl shadow-neo border-2 border-brand-900 flex flex-col justify-center cursor-pointer hover:border-brand-500/50 hover:bg-brand-darker transition-all group h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-brand-light tracking-wide uppercase text-sm flex items-center gap-2">
          <FolderKanban size={16} className="text-brand-500" />
          Projects
        </h3>
        <span className="text-brand-light/40 text-xs font-mono group-hover:text-brand-500 transition-colors">View All &rarr;</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-2 bg-brand-darker rounded border-2 border-brand-900 shadow-neo-input">
          <span className="text-2xl font-bold text-brand-light">{inProgress}</span>
          <span className="text-[10px] text-brand-light/50 uppercase tracking-wider mt-1 text-center">Active</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-brand-darker rounded border-2 border-brand-900 shadow-neo-input">
          <span className="text-2xl font-bold text-brand-light/50">{notStarted}</span>
          <span className="text-[10px] text-brand-light/50 uppercase tracking-wider mt-1 text-center">Pending</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-brand-darker rounded border-2 border-brand-900 shadow-neo-input">
          <span className="text-2xl font-bold text-brand-500">{done}</span>
          <span className="text-[10px] text-brand-light/50 uppercase tracking-wider mt-1 text-center">Done</span>
        </div>
      </div>
    </div>
  )
}
