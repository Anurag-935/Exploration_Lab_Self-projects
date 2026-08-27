import { useMemo } from "react"
import { Task } from "../types"

export default function CalendarHeatmap({ tasks }: { tasks: Task[] }) {
  const { daysInMonth, startingDayOfWeek, monthName, year } = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startingDayOfWeek = new Date(year, month, 1).getDay() // 0 = Sunday
    const monthName = now.toLocaleDateString("en-US", { month: "long" })
    return { daysInMonth, startingDayOfWeek, monthName, year }
  }, [])

  const dayStats = useMemo(() => {
    const stats: Record<number, { total: number, done: number }> = {}
    
    // Group tasks by creation date
    tasks.forEach(t => {
      const d = new Date(t.created_at)
      if (d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear()) {
        const dateNum = d.getDate()
        if (!stats[dateNum]) stats[dateNum] = { total: 0, done: 0 }
        stats[dateNum].total += 1
        if (t.status === "done") {
          stats[dateNum].done += 1
        }
      }
    })
    return stats
  }, [tasks])

  const getDayColor = (dateNum: number) => {
    const stat = dayStats[dateNum]
    if (!stat || stat.total === 0) return "bg-brand-900/10 border-brand-900/30 text-brand-light/20" // grey/empty
    
    const pct = stat.done / stat.total
    
    // 0% -> Red, 100% -> Green
    if (pct === 1) return "bg-green-500/80 border-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.4)]"
    if (pct === 0) return "bg-red-500/80 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]"
    
    // In between
    if (pct > 0.5) return "bg-yellow-500/80 border-yellow-500 text-white shadow-[0_0_8px_rgba(234,179,8,0.4)]"
    return "bg-orange-500/80 border-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]"
  }

  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="bg-brand-dark p-6 rounded-xl shadow-lg border border-brand-900/30 flex flex-col h-full w-full">
      <div className="flex justify-between items-end mb-4">
        <h3 className="font-semibold text-brand-light tracking-wide uppercase text-sm">Monthly Consistency</h3>
        <span className="text-brand-500 font-bold">{monthName} {year}</span>
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {weekdays.map(d => (
          <div key={d} className="text-center text-[10px] uppercase font-bold text-brand-light/50 pb-1">{d}</div>
        ))}
        
        {blanks.map(b => (
          <div key={`b-${b}`} className="aspect-square rounded-md bg-transparent"></div>
        ))}
        
        {days.map(d => (
          <div 
            key={d} 
            className={`aspect-square rounded-md border flex items-center justify-center text-xs font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default ${getDayColor(d)}`}
          >
            {d}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-4 mt-4 text-[10px] text-brand-light/50 uppercase font-medium">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-brand-900/10 border border-brand-900/30"></div> None</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-500/80"></div> 0%</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-yellow-500/80"></div> 50%</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-green-500/80"></div> 100%</div>
      </div>
    </div>
  )
}
