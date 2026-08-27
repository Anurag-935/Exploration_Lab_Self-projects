import { useState } from "react"
import { useData } from "../hooks/useData"
import { supabase } from "../lib/supabase"
import Clock from "../components/Clock"
import QuickCapture from "../components/QuickCapture"
import ConsistencyGraph from "../components/ConsistencyGraph"
import RadarStats from "../components/RadarStats"
import Timer from "../components/Timer"

export default function Dashboard() {
  const { tasks, habits, skills, loading, refetch } = useData()
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const handleToggleTask = async (taskId: string, currentStatus: "open" | "done") => {
    await supabase.from("tasks").update({
      status: currentStatus === "open" ? "done" : "open",
      completed_at: currentStatus === "open" ? new Date().toISOString() : null
    }).eq("id", taskId)
    
    // If completing the active task, stop tracking it
    if (currentStatus === "open" && taskId === activeTaskId) {
      setActiveTaskId(null)
    }
    
    refetch()
  }

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId)
    if (taskId === activeTaskId) setActiveTaskId(null)
    refetch()
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your workspace...</div>

  const openTasks = tasks.filter(t => t.status === "open")
  const doneTasks = tasks.filter(t => t.status === "done")
  const activeTaskObj = tasks.find(t => t.id === activeTaskId) || null

  return (
    <div className="space-y-8 pb-12">
      {/* Top Row */}
      <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Today</h2>
          <Clock />
        </div>
        <div className="flex-1 max-w-2xl">
          <QuickCapture onCaptured={refetch} />
        </div>
      </div>

      <ConsistencyGraph tasks={tasks} habits={habits} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Short Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Timer (if task selected) */}
          <Timer activeTask={activeTaskObj} onStop={refetch} />

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg mb-4">Pending Tasks</h3>
            {openTasks.length === 0 ? (
              <p className="text-gray-500 text-sm italic">All caught up!</p>
            ) : (
              <ul className="space-y-3">
                {openTasks.map(task => (
                  <li key={task.id} className="flex items-start justify-between group">
                    <div className="flex items-start gap-3 flex-1">
                      <input 
                        type="checkbox" 
                        checked={false} 
                        onChange={() => handleToggleTask(task.id, task.status)} 
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                      />
                      <div>
                        <p className="text-gray-900 font-medium">{task.title}</p>
                        {task.note && <p className="text-sm text-gray-500">{task.note}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeTaskId !== task.id && (
                        <button 
                          onClick={() => setActiveTaskId(task.id)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Focus
                        </button>
                      )}
                      <button onClick={() => handleDeleteTask(task.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {doneTasks.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-sm text-gray-500 mb-4">Completed Today</h3>
              <ul className="space-y-2">
                {doneTasks.slice(0, 5).map(task => (
                  <li key={task.id} className="flex items-center gap-3 opacity-60">
                    <input type="checkbox" checked={true} onChange={() => handleToggleTask(task.id, task.status)} className="w-4 h-4 rounded" />
                    <span className="line-through text-sm">{task.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Col: Stats, Habits, Plans */}
        <div className="space-y-6">
          
          <RadarStats skills={skills} />

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-4">Daily Habits</h3>
            {habits.length === 0 ? (
              <p className="text-gray-500 text-sm">No habits active.</p>
            ) : (
              <ul className="space-y-3">
                {habits.map(habit => (
                  <li key={habit.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-medium text-gray-700">{habit.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

