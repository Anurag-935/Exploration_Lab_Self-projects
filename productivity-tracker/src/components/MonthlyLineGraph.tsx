import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Task } from "../types"

export default function MonthlyLineGraph({ tasks }: { tasks: Task[] }) {
  const data = useMemo(() => {
    const dayCounts: Record<string, number> = {}
    
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    for (let i = 1; i <= daysInMonth; i++) {
      dayCounts[i.toString()] = 0
    }

    tasks.forEach(t => {
      if (t.status === "done" && t.completed_at) {
        const d = new Date(t.completed_at)
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          const label = d.getDate().toString()
          if (dayCounts[label] !== undefined) {
            dayCounts[label] += 1
          }
        }
      }
    })

    return Object.entries(dayCounts).map(([day, count]) => ({ day, count }))
  }, [tasks])

  return (
    <div className="w-full bg-brand-dark p-6 rounded-xl shadow-lg border border-brand-900/30">
      <h3 className="font-semibold text-brand-light tracking-wide uppercase text-sm mb-6">Completed Tasks (This Month)</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B14858" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#B14858" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#5A1420" vertical={false} />
            <XAxis dataKey="day" stroke="#EFE7DE" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#EFE7DE" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#2A2A2B', border: '1px solid #5A1420', borderRadius: '8px' }}
              itemStyle={{ color: '#EFE7DE' }}
            />
            <Area type="monotone" dataKey="count" name="Tasks Completed" stroke="#B14858" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
