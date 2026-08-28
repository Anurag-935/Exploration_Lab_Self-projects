import sys
import re

with open("src/components/MainTaskTable.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update the table header
text = text.replace(
    '<th className="py-4 px-4 font-semibold text-brand-light/60 bg-brand-darker/50 border-r border-brand-900/30">Est. Time</th>',
    '<th className="py-4 px-4 font-semibold text-brand-light/60 bg-brand-darker/50 border-r border-brand-900/30">Time Taken</th>'
)

# 2. Update the row rendering
old_tr = """                <tr 
                  key={task.id} 
                  onClick={() => openEdit(task)}
                  className="border-b border-brand-900/20 hover:bg-brand-darker transition-colors cursor-pointer group"
                >"""
new_tr = """                <tr 
                  key={task.id} 
                  onClick={() => { if(task.status !== 'done') openEdit(task) }}
                  className={`border-b border-brand-900/20 transition-colors group ${task.status === 'done' ? 'opacity-40 bg-brand-darker/20' : 'hover:bg-brand-darker cursor-pointer'}`}
                >"""
text = text.replace(old_tr, new_tr)

# 3. Update the time cell
old_td = '<td className="py-4 px-4 border-r border-brand-900/30 text-brand-light/70">{task.time_estimate || 0}m</td>'
new_td = """<td className="py-4 px-4 border-r border-brand-900/30 text-brand-light/70">
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
                </td>"""
text = text.replace(old_td, new_td)

with open("src/components/MainTaskTable.tsx", "w", encoding="utf-8") as f:
    f.write(text)
