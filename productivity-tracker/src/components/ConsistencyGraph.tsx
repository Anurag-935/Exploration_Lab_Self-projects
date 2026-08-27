import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"
import { Task, Habit } from "../types"
import { useMemo } from "react"

type Props = {
  tasks: Task[]
  habits: Habit[]
}

export default function ConsistencyGraph({ tasks }: Props) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {}
    
    // Count completed tasks per date
    tasks.forEach(task => {
      if (task.status === "done" && task.completed_at) {
        const dateStr = new Date(task.completed_at).toISOString().split("T")[0]
        counts[dateStr] = (counts[dateStr] || 0) + 1
      }
    })

    return Object.entries(counts).map(([date, count]) => ({ date, count }))
  }, [tasks])

  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-brand-light/50 mb-2 uppercase tracking-wide">Consistency</h3>
      <div className="bg-brand-dark p-4 rounded-xl shadow-sm border border-brand-900/30 overflow-hidden">
        <CalendarHeatmap
          startDate={startDate}
          endDate={today}
          values={data}
          classForValue={(value: any) => {
            if (!value) return "color-empty"
            return `color-scale-1`
          }}
          showWeekdayLabels
        />
      </div>
      <style>{`
        .react-calendar-heatmap .color-empty { fill: #2A2A2B; }
        .react-calendar-heatmap .color-scale-1 { fill: #B14858; }
      `}</style>
    </div>
  )
}

