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
    <div className="w-full bg-brand-dark p-6 rounded-xl shadow-neo border-2 border-brand-900">
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
            <CartesianGrid  stroke="#000000" vertical={false} />
            <XAxis dataKey="day" stroke="#1A1A1A" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#1A1A1A" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #000000', boxShadow: '4px 4px 0px #000000', borderRadius: '8px' }}
              itemStyle={{ color: '#1A1A1A' }}
            />
            <Area type="monotone" dataKey="count" name="Tasks Completed" stroke="#B14858" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
