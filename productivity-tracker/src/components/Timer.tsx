import { useState, useEffect } from "react"
import { Task } from "../types"
import { supabase } from "../lib/supabase"

type Props = {
  activeTask: Task | null
  onStop: () => void
}

export default function Timer({ activeTask, onStop }: Props) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  useEffect(() => {
    let interval: any
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const toggleTimer = () => {
    if (!isRunning) {
      setStartTime(new Date())
      setIsRunning(true)
    } else {
      stopAndSave()
    }
  }

  const stopAndSave = async () => {
    setIsRunning(false)
    if (activeTask && startTime) {
      const endTime = new Date()
      // Save time log
      await supabase.from("time_logs").insert({
        task_id: activeTask.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: seconds
      })
      
      // In a real app, we'd also grant XP to the task's skills here.
      // E.g. fetch task_skills, calculate XP = seconds / 60, update skills.
    }
    setSeconds(0)
    setStartTime(null)
    onStop()
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0")
    const s = (totalSeconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  if (!activeTask) return null

  return (
    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Active Task</p>
        <p className="font-medium text-gray-900">{activeTask.title}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-2xl font-mono font-bold text-blue-700 w-20 text-right">
          {formatTime(seconds)}
        </div>
        <button 
          onClick={toggleTimer}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-colors shadow-sm ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isRunning ? "¦" : "?"}
        </button>
      </div>
    </div>
  )
}
