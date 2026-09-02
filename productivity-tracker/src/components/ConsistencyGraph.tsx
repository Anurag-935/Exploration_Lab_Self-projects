import React, { useMemo, useState } from "react"
import Calendar from "react-calendar"
import { Task, Habit } from "../types"

// To apply custom styles without importing the default css, we'll write them in index.css or inline
import "./CalendarOverrides.css"

type Props = {
  tasks: Task[]
  habits: Habit[]
}

export default function ConsistencyGraph({ tasks, habits }: Props) {
  const [date, setDate] = useState(new Date())

  // Map dates to completion counts
  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach(task => {
      if (task.status === "done" && task.completed_at) {
        const dStr = new Date(task.completed_at).toISOString().split("T")[0]
        counts[dStr] = (counts[dStr] || 0) + 1
      }
    })
    return counts
  }, [tasks])

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === "month") {
      // Because JS dates are tricky with timezones, we build a local ISO-like string
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      const dStr = localDate.toISOString().split("T")[0]
      const count = taskCounts[dStr]
      
      if (count > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_4px_rgba(177,72,88,0.8)]"></div>
          </div>
        )
      }
    }
    return null
  }

  return (
    <div className="bg-brand-dark p-6 rounded-xl shadow-neo border-2 border-brand-900">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-brand-light tracking-wide uppercase text-sm">Consistency Tracker</h3>
      </div>
      
      <div className="w-full flex justify-center custom-calendar-wrapper">
        <Calendar 
          onChange={(val) => setDate(val as Date)} 
          value={date}
          tileContent={tileContent}
          prev2Label={null}
          next2Label={null}
          className="bg-transparent border-none w-full max-w-3xl"
        />
      </div>
    </div>
  )
}
