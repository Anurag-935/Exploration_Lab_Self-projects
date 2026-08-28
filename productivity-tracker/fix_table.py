import sys

with open("src/components/MainTaskTable.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update Type
old_type = """type TaskWithSkills = Task & {
  task_skills?: { skills: { name: string } }[]
}"""
new_type = """type TaskWithSkills = Task & {
  task_skills?: { skills: { name: string } }[]
  time_logs?: { duration_seconds: number }[]
}"""
text = text.replace(old_type, new_type)

# 2. Update activeTasks filter
old_filter = """  const activeTasks = tasks.filter(t => {
    if ((t.carried_over_count || 0) < 0) return false // hidden if rolled over
    if (t.task_type === "Short Task" && t.status === "done") return false // short tasks disappear when completed
    return true
  })"""
new_filter = """  const activeTasks = tasks.filter(t => {
    if ((t.carried_over_count || 0) < 0) return false // hidden if rolled over
    if (t.task_type === "Short Task" && t.status === "done") {
      if (t.completed_at) {
        // Hide if completed before today
        const completedStr = new Date(t.completed_at).toISOString().split("T")[0]
        const todayStr = new Date().toISOString().split("T")[0]
        if (completedStr < todayStr) return false
      }
    }
    return true
  })"""
text = text.replace(old_filter, new_filter)

# 3. Update the table headers
old_th = """<th className="p-3 text-brand-light/70 font-semibold text-xs uppercase tracking-wider text-left border-r border-brand-900/30">Time est.</th>"""
new_th = """<th className="p-3 text-brand-light/70 font-semibold text-xs uppercase tracking-wider text-left border-r border-brand-900/30">Time Taken</th>"""
text = text.replace(old_th, new_th)

# 4. Update the row rendering
old_tr = """              <tr 
                key={t.id} 
                className="border-b border-brand-900/30 hover:bg-brand-darker/50 transition-colors cursor-pointer group"
                onClick={() => setEditingTask(t)}
              >"""
new_tr = """              <tr 
                key={t.id} 
                className={`border-b border-brand-900/30 transition-colors group ${t.status === 'done' ? 'opacity-40 bg-brand-darker/20' : 'hover:bg-brand-darker/50 cursor-pointer'}`}
                onClick={() => { if(t.status !== 'done') setEditingTask(t) }}
              >"""
text = text.replace(old_tr, new_tr)

# 5. Update the time cell
old_td = """<td className="p-3 text-sm text-brand-light/90 border-r border-brand-900/30">{t.time_estimate ? `${t.time_estimate}m` : "-"}</td>"""
new_td = """<td className="p-3 text-sm text-brand-light/90 border-r border-brand-900/30">
                  {(() => {
                    if (!t.time_logs || t.time_logs.length === 0) return "-"
                    const totalSecs = t.time_logs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0)
                    if (totalSecs === 0) return "-"
                    const h = Math.floor(totalSecs / 3600)
                    const m = Math.floor((totalSecs % 3600) / 60)
                    const s = totalSecs % 60
                    if (h > 0) return `${h}h ${m}m`
                    if (m > 0) return `${m}m`
                    return `${s}s`
                  })()}
                </td>"""
text = text.replace(old_td, new_td)

# 6. Remove Time Estimate from Edit form
# We just replace the whole div
old_edit_est = """              <div>
                <label className="block text-sm font-medium text-brand-light/70 mb-1">Time Estimate (mins)</label>
                <input 
                  type="number" 
                  value={editingTask.time_estimate || ""} 
                  onChange={(e) => setEditingTask({...editingTask, time_estimate: parseInt(e.target.value) || undefined})}
                  className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light focus:ring-1 focus:ring-brand-500 outline-none"
                  min="1"
                />
              </div>"""
text = text.replace(old_edit_est, "")

# Remove Time Estimate from Create form
old_add_est = """              <div>
                <label className="block text-sm font-medium text-brand-light/70 mb-1">Time Estimate (mins)</label>
                <input 
                  name="time_estimate"
                  type="number" 
                  className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light focus:ring-1 focus:ring-brand-500 outline-none"
                  min="1"
                />
              </div>"""
text = text.replace(old_add_est, "")

with open("src/components/MainTaskTable.tsx", "w", encoding="utf-8") as f:
    f.write(text)
