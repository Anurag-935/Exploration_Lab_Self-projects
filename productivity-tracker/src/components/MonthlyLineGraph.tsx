import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Task } from "../types"

export default function MonthlyLineGraph({ tasks }: { tasks: Task[] }) {
  const data = useMemo(() => {
    const monthCounts: Record<string, number> = {}
    
    // Initialize last 6 months to 0
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString("en-US", { month: "short" })
      monthCounts[label] = 0
    }

    tasks.forEach(t => {
      if (t.status === "done" && t.completed_at) {
        const d = new Date(t.completed_at)
        const label = d.toLocaleDateString("en-US", { month: "short" })
        if (monthCounts[label] !== undefined) {
          monthCounts[label] += 1
        }
      }
    })

    return Object.entries(monthCounts).map(([month, count]) => ({ month, count }))
  }, [tasks])

  return (
    <div className="w-full bg-brand-dark p-6 rounded-xl shadow-lg border border-brand-900/30">
      <h3 className="font-semibold text-brand-light tracking-wide uppercase text-sm mb-6">Completed Tasks (6 Months)</h3>
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
            <XAxis dataKey="month" stroke="#EFE7DE" fontSize={12} tickLine={false} axisLine={false} />
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
