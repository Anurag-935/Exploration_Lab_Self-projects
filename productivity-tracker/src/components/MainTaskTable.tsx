import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Task } from "../types"
import { X, Trash2 } from "lucide-react"

const PREDEFINED_SKILLS = ["Technical", "Communication", "Creativity", "Discipline", "Learning", "Wellness"]

type TaskWithSkills = Task & {
  task_skills?: { skills: { name: string } }[]
  time_logs?: { duration_seconds: number }[]
}

export default function MainTaskTable({ tasks, refetch }: { tasks: TaskWithSkills[], refetch: () => void,  }) {
    const activeTasks = tasks
  const [editingTask, setEditingTask] = useState<TaskWithSkills | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form State
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [priority, setPriority] = useState<number>(3)
  const [type, setType] = useState("Short Task")
  const [timeEst, setTimeEst] = useState<number>(15)
  const [exp, setExp] = useState<number>(10)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const openEdit = (t: TaskWithSkills) => {
    setEditingTask(t)
    setTitle(t.title)
    setDesc(t.note || "")
    setPriority(t.priority || 3)
    setType(t.task_type || "Short Task")
    setTimeEst(t.time_estimate || 0)
    setExp(t.exp_value || 0)
    
    const s = t.task_skills?.map(ts => ts.skills?.name).filter(Boolean) as string[] || []
    setSelectedSkills(s)
  }

  const openAdd = () => {
    setEditingTask(null)
    setTitle("")
    setDesc("")
    setPriority(3)
    setType("Short Task")
    setTimeEst(15)
    setExp(10)
    setSelectedSkills([])
    setShowAddModal(true)
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  const handleToggleTask = async (e: React.MouseEvent, taskId: string, currentStatus: string) => {
    e.stopPropagation()
    await supabase.from("tasks").update({
      status: currentStatus === "open" ? "done" : "open",
      completed_at: currentStatus === "open" ? new Date().toISOString() : null
    }).eq("id", taskId)
    refetch()
  }

    const handleDeleteTask = async () => {
    if (!editingTask) return
    if (!window.confirm("Are you sure you want to delete this task? This cannot be undone.")) return
    
    setLoading(true)
    await supabase.from("tasks").delete().eq("id", editingTask.id)
    setEditingTask(null)
    setLoading(false)
    refetch()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    // Ensure all 6 skills exist in the DB so we can link them
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

    if (editingTask) {
      // Update Task
      await supabase.from("tasks").update({
        title,
        note: desc,
        priority,
        task_type: type
      }).eq("id", editingTask.id)

      // Re-link skills
      await supabase.from("task_skills").delete().eq("task_id", editingTask.id)
      const inserts = selectedSkills.map(s => ({ task_id: editingTask.id, skill_id: skillMap[s] }))
      if (inserts.length > 0) await supabase.from("task_skills").insert(inserts)

      setEditingTask(null)
    } else {
      // Insert new task
      const { data: newTask } = await supabase.from("tasks").insert({
        user_id: userData.user.id,
        title,
        note: desc,
        priority,
        task_type: type,
        time_estimate: timeEst,
        exp_value: exp,
        status: "open"
      }).select().single()

      if (newTask) {
        const inserts = selectedSkills.map(s => ({ task_id: newTask.id, skill_id: skillMap[s] }))
        if (inserts.length > 0) await supabase.from("task_skills").insert(inserts)
      }
      setShowAddModal(false)
    }
    
    setLoading(false)
    refetch()
  }

  // Helper to render priority nicely
  const renderPriority = (p: number) => {
    if (p === 1) return <span className="text-red-500 font-bold">P1</span>
    if (p === 2) return <span className="text-yellow-500 font-bold">P2</span>
    return <span className="text-green-500 font-bold">P3</span>
  }

  return (
    <div className="bg-brand-dark p-6 rounded-xl shadow-lg border border-brand-900/30 flex flex-col h-full">
      <h3 className="font-semibold text-lg text-brand-light mb-4">Main Tasks</h3>
      
      <div className="flex-1 overflow-auto mb-4">
        <table className="w-full text-left border-collapse border border-brand-900/30 table-auto">
          <thead>
            <tr className="border-b border-brand-900/30 text-brand-light/50 text-xs uppercase tracking-wider">
              <th className="py-4 px-4 font-semibold text-brand-light/60 bg-brand-darker/50 border-r border-brand-900/30">Priority</th>
              <th className="py-4 px-4 font-semibold text-brand-light/60 bg-brand-darker/50 border-r border-brand-900/30">Title</th>
              <th className="py-4 px-4 font-semibold text-brand-light/60 bg-brand-darker/50 border-r border-brand-900/30">Time Taken</th>
              <th className="py-4 px-4 font-semibold text-brand-light/60 bg-brand-darker/50 border-r border-brand-900/30">EXP</th>
              <th className="py-4 px-4 font-semibold text-brand-light/60 bg-brand-darker/50 border-r border-brand-900/30">Skills</th>
              <th className="py-4 px-4 font-semibold text-brand-light/60 bg-brand-darker/50 border-r border-brand-900/30">Type</th>
              <th className="py-4 px-4 font-semibold text-brand-light/60 bg-brand-darker/50 border-r border-brand-900/30">Description</th>
              <th className="py-4 px-4 font-semibold text-brand-light/60 bg-brand-darker/50 text-center">Check Box</th>
            </tr>
          </thead>
          <tbody>
            {activeTasks.map((task, i) => {
              const sNames = task.task_skills?.map(ts => ts.skills?.name).filter(Boolean) || []
              return (
                <tr 
                  key={task.id} 
                  onClick={() => { if(task.status !== 'done') openEdit(task) }}
                  className={`border-b border-brand-900/20 transition-colors group ${task.status === 'done' ? 'opacity-40 bg-brand-darker/20' : 'hover:bg-brand-darker cursor-pointer'}`}
                >
                  <td className="py-4 px-4 border-r border-brand-900/30">{renderPriority(task.priority || 3)}</td>
                  <td className="py-4 px-4 border-r border-brand-900/30 font-semibold text-brand-light text-base">{task.title}</td>
                  <td className="py-4 px-4 border-r border-brand-900/30 text-brand-light/70">
                  {(() => {
                    if (!task.time_logs || task.time_logs.length === 0) return "-"
                    const totalSecs = task.time_logs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0)
                    if (totalSecs === 0) return "-"
                    const h = Math.floor(totalSecs / 3600)
                    const m = Math.floor((totalSecs % 3600) / 60)
                    const s = totalSecs % 60
                    if (h > 0) return `${h}h ${m}m`
                    if (m > 0) return `${m}m`
                    return `${s}s`
                  })()}
                </td>
                  <td className="py-4 px-4 border-r border-brand-900/30 text-brand-500 font-bold text-lg">+{task.exp_value || 0}</td>
                  <td className="py-4 px-4 border-r border-brand-900/30">
                    <div className="flex flex-wrap gap-1">
                      {sNames.length > 0 ? sNames.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-brand-900/30 text-brand-500 text-[10px] rounded uppercase">{s}</span>
                      )) : <span className="text-brand-light/30 text-xs">-</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4 border-r border-brand-900/30 text-xs font-medium text-brand-light/70 uppercase tracking-wide">{task.task_type || "Short Task"}</td>
                  <td className="py-4 px-4 border-r border-brand-900/30 text-sm text-brand-light/60 whitespace-normal break-words">{task.note || "-"}</td>
                  <td className="py-4 px-4 border-r border-brand-900/30 text-center">
                    <input 
                      type="checkbox" 
                      checked={task.status === "done"} 
                      onChange={(e) => handleToggleTask(e as any, task.id, task.status)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-brand-900 bg-brand-darker text-brand-500 focus:ring-brand-500 cursor-pointer" 
                    />
                  </td>
                </tr>
              )
            })}
            {activeTasks.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-brand-light/50 italic">No tasks found. Add one below.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button onClick={openAdd} className="w-full py-3 bg-brand-500 hover:bg-brand-700 text-brand-light rounded-lg font-medium transition-colors shadow-md">
        Add New Task
      </button>

      {/* Editor Modal */}
      {(editingTask || showAddModal) && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-brand-dark rounded-xl w-full max-w-2xl overflow-hidden border border-brand-900/50">
            <div className="p-4 border-b border-brand-900/50 flex justify-between items-center">
              <h3 className="font-semibold text-brand-light text-lg">{editingTask ? "Edit Task" : "New Task"}</h3>
              <button onClick={() => { setEditingTask(null); setShowAddModal(false) }} className="text-brand-light/50 hover:text-brand-light text-xl"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-brand-light/70 mb-1">Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light outline-none focus:border-brand-500" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-brand-light/70 mb-1">Description</label>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light outline-none focus:border-brand-500 h-20 resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-light/70 mb-1">Priority</label>
                  <select value={priority} onChange={e => setPriority(Number(e.target.value))} className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light outline-none focus:border-brand-500">
                    <option value={1}>1 - High</option>
                    <option value={2}>2 - Medium</option>
                    <option value={3}>3 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-light/70 mb-1">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light outline-none focus:border-brand-500">
                    <option value="Short Task">Short Task</option>
                    <option value="Habit">Habit</option>
                    <option value="Long Plan">Long Plan</option>
                  </select>
                </div>

                

                <div>
                  <label className="block text-sm font-medium text-brand-light/70 mb-1">EXP Reward</label>
                  <input type="number" value={exp} onChange={e => setExp(Number(e.target.value))} disabled={!!editingTask} min={1} required className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light outline-none focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-brand-light/70 mb-2">Skill Tags (Multi-select)</label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_SKILLS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${selectedSkills.includes(s) ? 'bg-brand-500 border-brand-500 text-brand-light' : 'bg-brand-darker border-brand-900/50 text-brand-light/50 hover:border-brand-500/50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

                            <div className="flex justify-between items-center pt-4 border-t border-brand-900/50">
                <div>
                  {editingTask && (
                    <button type="button" onClick={handleDeleteTask} className="flex items-center gap-2 px-3 py-2 text-brand-500 hover:bg-brand-500/10 rounded font-medium transition-colors">
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setEditingTask(null); setShowAddModal(false) }} className="px-4 py-2 text-brand-light/70 hover:text-brand-light">Cancel</button>
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-brand-500 hover:bg-brand-700 text-brand-light rounded font-medium disabled:opacity-50">
                    {loading ? "Saving..." : "Save Task"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}










