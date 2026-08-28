import { useState, useEffect } from "react"
import { X, Save, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { Project, ProjectLog } from "../types"
import { supabase } from "../lib/supabase"

type Props = {
  project: Project
  onClose: () => void
  onUpdated: () => void
}

export default function ProjectDetail({ project, onClose, onUpdated }: Props) {
  const [progress, setProgress] = useState(project.progress_percent)
  const [logs, setLogs] = useState<ProjectLog[]>([])
  const [newLog, setNewLog] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("project_logs")
      .select("*")
      .eq("project_id", project.id)
      .order("log_date", { ascending: false })
    if (data) setLogs(data)
    setLoading(false)
  }

  const handleProgressChange = async (val: number) => {
    setProgress(val)
    await supabase.from("projects").update({ progress_percent: val }).eq("id", project.id)
    onUpdated()
  }

  const handleAddLog = async () => {
    if (!newLog.trim()) return
    setSaving(true)
    
    let today = new Date()
    // adjust for local timezone offset to get correct YYYY-MM-DD
    const offset = today.getTimezoneOffset()
    today = new Date(today.getTime() - (offset*60*1000))
    const todayStr = today.toISOString().split("T")[0]

    // check if today already has a log
    const existingLog = logs.find(l => l.log_date === todayStr)
    
    if (existingLog) {
      // Append
      const updatedContent = existingLog.content + "\n\n" + newLog.trim()
      await supabase.from("project_logs").update({ content: updatedContent }).eq("id", existingLog.id)
    } else {
      // Insert
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from("project_logs").insert({
          project_id: project.id,
          user_id: userData.user.id,
          log_date: todayStr,
          content: newLog.trim()
        })
      }
    }

    setNewLog("")
    setSaving(false)
    fetchLogs()
  }

  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
      <div className="bg-brand-dark rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-brand-900/50 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-brand-900/50 flex justify-between items-start bg-brand-darker/50">
          <div>
            <h2 className="text-2xl font-bold text-brand-light">{project.title}</h2>
            <p className="text-brand-light/60 mt-2">{project.description || "No description provided."}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-brand-light/50 hover:text-brand-light hover:bg-brand-900/50 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Progress Slider */}
          <div className="bg-brand-darker p-5 rounded-xl border border-brand-900/30">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-brand-light/70 uppercase tracking-widest">Progress</label>
              <span className={`text-lg font-bold ${progress === 100 ? 'text-brand-500' : 'text-brand-light'}`}>{progress}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              onMouseUp={(e) => handleProgressChange(Number(e.currentTarget.value))}
              onTouchEnd={(e) => handleProgressChange(Number(e.currentTarget.value))}
              className="w-full accent-brand-500 h-2 bg-brand-900/30 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Daily Logs */}
          <div>
            <h3 className="text-lg font-semibold text-brand-light mb-4 flex items-center gap-2">
              Daily Logs
            </h3>
            
            {/* Add Log Form */}
            <div className="mb-6 bg-brand-darker p-4 rounded-xl border border-brand-900/30">
              <textarea 
                value={newLog}
                onChange={e => setNewLog(e.target.value)}
                placeholder="Log today's progress..."
                className="w-full px-3 py-2 bg-brand-dark border border-brand-900/50 rounded text-brand-light focus:ring-1 focus:ring-brand-500 outline-none resize-none h-24 text-sm"
              />
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleAddLog}
                  disabled={!newLog.trim() || saving}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  {saving ? "Saving..." : <><Plus size={16} /> Add Entry</>}
                </button>
              </div>
            </div>

            {/* Log List Accordion */}
            {loading ? (
              <div className="text-center text-brand-light/40 italic py-4">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="text-center text-brand-light/40 italic py-4">No progress logged yet.</div>
            ) : (
              <div className="space-y-3">
                {logs.map(log => {
                  const isExpanded = expandedDates.has(log.log_date)
                  return (
                    <div key={log.id} className="border border-brand-900/40 rounded-lg overflow-hidden bg-brand-darker/50">
                      <button 
                        onClick={() => toggleDate(log.log_date)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-brand-darker hover:bg-brand-900/30 transition-colors text-left"
                      >
                        <span className="font-medium text-brand-light/90">{log.log_date}</span>
                        {isExpanded ? <ChevronDown size={18} className="text-brand-light/50" /> : <ChevronRight size={18} className="text-brand-light/50" />}
                      </button>
                      {isExpanded && (
                        <div className="p-4 bg-brand-dark text-brand-light/80 text-sm leading-relaxed whitespace-pre-wrap border-t border-brand-900/30">
                          {log.content}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
