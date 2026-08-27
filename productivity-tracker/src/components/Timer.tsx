import { useState, useEffect } from "react"
import { Play, Square, Pause } from "lucide-react"
import { supabase } from "../lib/supabase"
import { Task } from "../types"

type Props = {
  activeTasks: Task[]
  onStop: () => void
}

export default function Timer({ activeTasks, onStop }: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)

  useEffect(() => {
    let interval: any
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const handleStart = () => {
    if (!selectedTaskId) {
      alert("Please select a task to focus on first!")
      return
    }
    if (!startTime) setStartTime(new Date())
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = async () => {
    if (!selectedTaskId || !startTime) return
    setIsRunning(false)
    
    // Write to time_logs
    await supabase.from("time_logs").insert({
      task_id: selectedTaskId,
      start_time: startTime.toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: elapsed
    })

    setElapsed(0)
    setStartTime(null)
    onStop()
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  return (
    <div className="bg-brand-dark p-6 rounded-xl shadow-lg border border-brand-900/30 flex flex-col h-full items-center justify-center">
      <h3 className="font-semibold text-brand-light tracking-wide uppercase text-sm mb-4">Focus Timer</h3>
      
      <select 
        value={selectedTaskId}
        onChange={(e) => setSelectedTaskId(e.target.value)}
        disabled={isRunning || elapsed > 0}
        className="w-full max-w-[200px] mb-6 px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light outline-none focus:border-brand-500 text-sm disabled:opacity-50"
      >
        <option value="">Select a task...</option>
        {activeTasks.map(t => (
          <option key={t.id} value={t.id}>{t.title}</option>
        ))}
      </select>

      <div className="text-5xl font-bold text-brand-light font-mono tracking-tighter mb-8 drop-shadow-md">
        {formatTime(elapsed)}
      </div>

      <div className="flex gap-4">
        {!isRunning ? (
          <button onClick={handleStart} className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-700 hover:scale-105 transition-all shadow-lg">
            <Play size={20} className="ml-1" />
          </button>
        ) : (
          <button onClick={handlePause} className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-105 transition-all shadow-lg">
            <Pause size={20} />
          </button>
        )}
        
        <button 
          onClick={handleStop} 
          disabled={elapsed === 0}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-darker border-2 border-brand-900/50 text-brand-500 hover:border-brand-500 hover:text-brand-light hover:bg-brand-500 transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-brand-darker disabled:hover:border-brand-900/50 disabled:hover:text-brand-500"
        >
          <Square size={16} fill="currentColor" />
        </button>
      </div>
    </div>
  )
}
