import { useState, useEffect } from "react"
import { X, Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { Project, ProjectLog } from "../types"
import { supabase } from "../lib/supabase"

const PREDEFINED_SKILLS = ["Technical", "Communication", "Creativity", "Discipline", "Learning", "Wellness"]

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

  const [title, setTitle] = useState(project.title)
  const [desc, setDesc] = useState(project.description || "")

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskPriority, setTaskPriority] = useState(3)
  const [taskExp, setTaskExp] = useState(10)
  const [taskSkills, setTaskSkills] = useState<string[]>([])
  const [taskSaving, setTaskSaving] = useState(false)

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

  const handleUpdateMeta = async () => {
    if (!title.trim()) return
    await supabase.from("projects").update({ title, description: desc }).eq("id", project.id)
    onUpdated()
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"? This will permanently delete the project and all its logs.`)) {
      await supabase.from("projects").delete().eq("id", project.id)
      onUpdated()
      onClose()
    }
  }

  const handleAddLog = async () => {
    if (!newLog.trim()) return
    setSaving(true)
    
    let today = new Date()
    const offset = today.getTimezoneOffset()
    today = new Date(today.getTime() - (offset*60*1000))
    const todayStr = today.toISOString().split("T")[0]

    const existingLog = logs.find(l => l.log_date === todayStr)
    
    if (existingLog) {
      const updatedContent = existingLog.content + "\n\n" + newLog.trim()
      await supabase.from("project_logs").update({ content: updatedContent }).eq("id", existingLog.id)
    } else {
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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setTaskSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: existingSkills } = await supabase.from("skills").select("id, name")
    let skillMap: Record<string, string> = {}
    for (const s of PREDEFINED_SKILLS) {
      const found = existingSkills?.find(es => es.name === s)
      if (found) {
        skillMap[s] = found.id
      } else {
        const { data: newSkill } = await supabase.from("skills").insert({ user_id: userData.user.id, name: s }).select().single()
        if (newSkill) skillMap[s] = newSkill.id
      }
    }

    const { data: newTask } = await supabase.from("tasks").insert({
      user_id: userData.user.id,
      title: title,
      note: `Working on project: ${title}`,
      priority: taskPriority,
      task_type: "Short Task",
      status: "open",
      exp_value: taskExp
    }).select().single()

    if (newTask && taskSkills.length > 0) {
      const inserts = taskSkills.map(s => ({ task_id: newTask.id, skill_id: skillMap[s] }))
      await supabase.from("task_skills").insert(inserts)
    }

    setTaskSaving(false)
    setShowTaskModal(false)
    onUpdated()
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
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-dark rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-brand-900/50 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-brand-900/50 bg-brand-darker/50 flex flex-col gap-3 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={handleDelete}
              className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-all"
              title="Delete Project"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={onClose}
              className="text-brand-light/50 hover:text-brand-light hover:bg-brand-900/50 p-2 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <div className="pr-20">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleUpdateMeta}
              placeholder="Project Title"
              className="w-full bg-transparent text-2xl font-bold text-brand-light outline-none border-b border-transparent focus:border-brand-500/50 transition-colors pb-1"
            />
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              onBlur={handleUpdateMeta}
              placeholder="Add a short description..."
              className="w-full bg-transparent text-brand-light/60 mt-2 outline-none resize-none border-b border-transparent focus:border-brand-500/50 transition-colors h-16"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Progress Slider & Add to Table */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="flex-1 bg-brand-darker p-5 rounded-xl border border-brand-900/30">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-brand-light/70 uppercase tracking-widest">Progress</label>
                <span className={`text-lg font-bold ${progress >= 100 ? 'text-brand-500' : 'text-brand-light'}`}>{Math.round(progress)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="any"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                onMouseUp={(e) => handleProgressChange(Math.round(Number(e.currentTarget.value)))}
                onTouchEnd={(e) => handleProgressChange(Math.round(Number(e.currentTarget.value)))}
                className="w-full accent-brand-500 h-2 bg-brand-900/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <button 
              onClick={() => setShowTaskModal(true)}
              className="flex-1 md:flex-none flex flex-col items-center justify-center bg-brand-500/10 hover:bg-brand-500 hover:text-white text-brand-500 border border-brand-500/30 rounded-xl p-4 transition-all font-medium text-sm gap-2"
            >
              <Plus size={24} />
              Add to Table
            </button>
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

        {/* Task Creation Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-brand-dark rounded-xl w-full max-w-xl overflow-hidden border border-brand-900/50 shadow-2xl">
              <div className="p-4 border-b border-brand-900/50 flex justify-between items-center bg-brand-darker/50">
                <h3 className="font-semibold text-brand-light text-lg">Add Project to Table</h3>
                <button onClick={() => setShowTaskModal(false)} className="text-brand-light/50 hover:text-brand-light"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-light/70 mb-1">Title</label>
                  <input type="text" value={title} disabled className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light/50 outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-light/70 mb-1">Type</label>
                  <input type="text" value="Short Task" disabled className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light/50 outline-none cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-light/70 mb-1">Priority</label>
                    <select value={taskPriority} onChange={e => setTaskPriority(Number(e.target.value))} className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light outline-none focus:border-brand-500">
                      <option value={1}>1 - High</option>
                      <option value={2}>2 - Medium</option>
                      <option value={3}>3 - Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-light/70 mb-1">EXP Reward</label>
                    <select value={taskExp} onChange={e => setTaskExp(Number(e.target.value))} className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light outline-none focus:border-brand-500">
                      <option value={10}>+10 (Trivial)</option>
                      <option value={20}>+20 (Quick)</option>
                      <option value={40}>+40 (Moderate)</option>
                      <option value={80}>+80 (Heavy)</option>
                      <option value={150}>+150 (Epic)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-light/70 mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_SKILLS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTaskSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${taskSkills.includes(s) ? 'bg-brand-500/20 border-brand-500 text-brand-500' : 'bg-brand-darker border-brand-900/50 text-brand-light/60 hover:border-brand-500/50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-brand-light/70 hover:text-brand-light">Cancel</button>
                  <button type="submit" disabled={taskSaving} className="px-6 py-2 bg-brand-500 hover:bg-brand-700 text-brand-light rounded font-medium disabled:opacity-50">
                    {taskSaving ? "Adding..." : "Add to Table"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
