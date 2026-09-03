import { useState, useEffect } from "react"
import { Play, Square, Pause } from "lucide-react"
import { supabase } from "../lib/supabase"
import { Task } from "../types"

type Props = {
 activeTasks: Task[]
 onStop: () => void
}

export default function Timer({ activeTasks, onStop }: Props) {
 const getSaved = () => {
   const saved = localStorage.getItem("productivityTimer")
   return saved ? JSON.parse(saved) : {}
 }
 const saved = getSaved()

 const [selectedTaskId, setSelectedTaskId] = useState<string>(saved.selectedTaskId || "")
 const [isRunning, setIsRunning] = useState<boolean>(saved.isRunning || false)
 
 // Real-time tracking
 const [accumulated, setAccumulated] = useState<number>(saved.accumulated || 0)
 const [sessionStart, setSessionStart] = useState<number | null>(saved.sessionStart || null)
 const [elapsed, setElapsed] = useState<number>(() => {
   let initialElapsed = saved.accumulated || 0
   if (saved.isRunning && saved.sessionStart) {
     initialElapsed += Math.floor((Date.now() - saved.sessionStart) / 1000)
   }
   return initialElapsed
 })
 const [startTime, setStartTime] = useState<string | null>(saved.startTime || null)

 useEffect(() => {
   localStorage.setItem("productivityTimer", JSON.stringify({
     selectedTaskId, isRunning, accumulated, sessionStart, startTime
   }))
 }, [selectedTaskId, isRunning, accumulated, sessionStart, startTime])


 useEffect(() => {
 let interval: any
 if (isRunning && sessionStart) {
 // Use system time to prevent drifting when the tab is backgrounded
 interval = setInterval(() => {
 const now = Date.now()
 const currentSessionSeconds = Math.floor((now - sessionStart) / 1000)
 setElapsed(accumulated + currentSessionSeconds)
 }, 500)
 }
 return () => clearInterval(interval)
 }, [isRunning, sessionStart, accumulated])

 const handleStart = () => {
 if (!selectedTaskId) {
 alert("Please select a task to focus on first!")
 return
 }
 if (!startTime) setStartTime(new Date().toISOString())
 setSessionStart(Date.now())
 setIsRunning(true)
 }

 const handlePause = () => {
 if (sessionStart) {
 const currentSessionSeconds = Math.floor((Date.now() - sessionStart) / 1000)
 setAccumulated((prev: number) => prev + currentSessionSeconds)
 }
 setIsRunning(false)
 setSessionStart(null)
 }

 const handleStop = async () => {
 if (!selectedTaskId || !startTime) return
 
 let finalElapsed = accumulated
 if (isRunning && sessionStart) {
 finalElapsed += Math.floor((Date.now() - sessionStart) / 1000)
 }
 
 setIsRunning(false)
 setSessionStart(null)
 
 // Write to time_logs
 await supabase.from("time_logs").insert({
 task_id: selectedTaskId,
 start_time: startTime,
 end_time: new Date().toISOString(),
 duration_seconds: finalElapsed
 })

 setElapsed(0)
 setAccumulated(0)
 setStartTime(null)
 onStop()
 }

 const formatTime = (secs: number) => {
 const h = Math.floor(secs / 3600)
 const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0")
 const s = (secs % 60).toString().padStart(2, "0")
 return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
 }

 return (
 <div className="bg-brand-dark p-6 rounded-xl border-2 border-brand-900 flex flex-col h-full items-center justify-center">
 <h3 className="font-semibold text-brand-light tracking-wide uppercase text-sm mb-4">Focus Timer</h3>
 
 <select 
 value={selectedTaskId}
 onChange={(e) => setSelectedTaskId(e.target.value)}
 disabled={isRunning || elapsed > 0}
 className="w-full max-w-[200px] mb-6 px-3 py-2 bg-brand-darker border-2 border-brand-900 rounded text-brand-light outline-none focus:border-brand-500 text-sm disabled:opacity-50 shadow-neo"
 >
 <option value="">Select a task...</option>
 {activeTasks.map(t => (
 <option key={t.id} value={t.id}>{t.title}</option>
 ))}
 </select>

 <div className="text-5xl font-bold text-brand-light font-mono tracking-tighter mb-8 drop-shadow-neo">
 {formatTime(elapsed)}
 </div>

 <div className="flex gap-4">
 {!isRunning ? (
 <button onClick={handleStart} className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-700 hover:scale-105 transition-all border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold ">
 <Play size={20} className="ml-1" />
 </button>
 ) : (
 <button onClick={handlePause} className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-105 transition-all border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold ">
 <Pause size={20} />
 </button>
 )}
 
 <button onClick={handleStop} disabled={elapsed === 0} className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-darker text-brand-500 hover:border-brand-500 hover:text-brand-light hover:bg-brand-500 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-brand-darker disabled:hover:border-brand-900 disabled:hover:text-brand-500 border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold "
 >
 <Square size={16} fill="currentColor" />
 </button>
 </div>
 </div>
 )
}
