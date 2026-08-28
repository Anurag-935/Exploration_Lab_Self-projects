import sys
import re

with open("src/components/MainTaskTable.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = re.sub(r'<th[^>]*>Time est\.</th>', '<th className="p-3 text-brand-light/70 font-semibold text-xs uppercase tracking-wider text-left border-r border-brand-900/30">Time Taken</th>', text)

old_tr = r'<tr\s*key=\{t\.id\}\s*className="border-b border-brand-900/30 hover:bg-brand-darker/50 transition-colors cursor-pointer group"\s*onClick=\{\(\) => setEditingTask\(t\)\}\s*>'
new_tr = """<tr 
                key={t.id} 
                className={`border-b border-brand-900/30 transition-colors group ${t.status === 'done' ? 'opacity-40 bg-brand-darker/20' : 'hover:bg-brand-darker/50 cursor-pointer'}`}
                onClick={() => { if(t.status !== 'done') setEditingTask(t) }}
              >"""
text = re.sub(old_tr, new_tr, text)

old_td = r'<td className="p-3 text-sm text-brand-light/90 border-r border-brand-900/30">\{t\.time_estimate \? `\$\{t\.time_estimate\}m` : "-"}</td>'
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
text = re.sub(old_td, new_td, text)

# Remove the two inputs containing "Time Estimate (mins)"
# We can just match the <div> block containing the label
pattern = r'<div>\s*<label[^>]*>Time Estimate \(mins\)</label>[\s\S]*?</div>'
text = re.sub(pattern, '', text)


with open("src/components/MainTaskTable.tsx", "w", encoding="utf-8") as f:
    f.write(text)
