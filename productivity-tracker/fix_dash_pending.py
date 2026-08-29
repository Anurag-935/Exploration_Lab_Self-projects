import sys
import re

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    text = f.read()

active_tasks_logic = """  const activeTasks = tasks.filter((t: any) => {
    if ((t.carried_over_count || 0) < 0) return false
    if (t.task_type === "Short Task" && t.status === "done") {
      if (t.completed_at) {
        const completedStr = new Date(t.completed_at).toISOString().split("T")[0]
        const todayStr = new Date().toISOString().split("T")[0]
        if (completedStr < todayStr) return false
      }
    }
    return true
  })"""

text = text.replace('  if (loading) return <div className="p-8 text-center text-brand-light/50">Loading your workspace...</div>', f'  if (loading) return <div className="p-8 text-center text-brand-light/50">Loading your workspace...</div>\n\n{active_tasks_logic}')

text = text.replace('<DatePendingWidget tasks={tasks} />', '<DatePendingWidget tasks={activeTasks} />')
text = text.replace('<MainTaskTable tasks={tasks as any} refetch={refetch} />', '<MainTaskTable tasks={activeTasks as any} refetch={refetch} />')
text = text.replace('<Timer activeTasks={tasks.filter(t => (t.carried_over_count || 0) >= 0 && t.status === "open")} onStop={refetch} />', '<Timer activeTasks={activeTasks.filter((t: any) => t.status === "open")} onStop={refetch} />')

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(text)
