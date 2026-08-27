import { useState } from "react"
import { useData } from "../hooks/useData"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
  const { tasks, habits, longPlans, loading, refetch } = useData()
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newHabitTitle, setNewHabitTitle] = useState("")
  const [newPlanTitle, setNewPlanTitle] = useState("")

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    await supabase.from("tasks").insert({ user_id: userData.user.id, title: newTaskTitle.trim(), status: "open" })
    setNewTaskTitle("")
    refetch()
  }

  const handleToggleTask = async (taskId: string, currentStatus: "open" | "done") => {
    await supabase.from("tasks").update({
      status: currentStatus === "open" ? "done" : "open",
      completed_at: currentStatus === "open" ? new Date().toISOString() : null
    }).eq("id", taskId)
    refetch()
  }

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId)
    refetch()
  }

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitTitle.trim()) return
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    await supabase.from("habits").insert({ user_id: userData.user.id, title: newHabitTitle.trim(), schedule: { type: "daily" } })
    setNewHabitTitle("")
    refetch()
  }
  
  const handleDeleteHabit = async (id: string) => {
    await supabase.from("habits").delete().eq("id", id)
    refetch()
  }

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlanTitle.trim()) return
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    await supabase.from("long_plans").insert({ user_id: userData.user.id, title: newPlanTitle.trim(), status: "active" })
    setNewPlanTitle("")
    refetch()
  }
  
  const handleDeletePlan = async (id: string) => {
    await supabase.from("long_plans").delete().eq("id", id)
    refetch()
  }

  if (loading) return <div className="p-4 text-gray-500">Loading dashboard...</div>

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Dashboard (Phase 1 CRUD)</h2>
        
        {/* Tasks Section */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-semibold mb-2">Short Tasks</h3>
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="flex-1 px-3 py-2 border rounded text-sm" placeholder="Add a new task..." />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Add Task</button>
          </form>
          {tasks.length === 0 ? <p className="text-sm text-gray-500">No tasks yet.</p> : (
            <ul className="space-y-2">
              {tasks.map(task => (
                <li key={task.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={task.status === "done"} onChange={() => handleToggleTask(task.id, task.status)} className="w-4 h-4 cursor-pointer" />
                    <span className={task.status === "done" ? "line-through text-gray-400" : ""}>{task.title}</span>
                  </div>
                  <button onClick={() => handleDeleteTask(task.id)} className="text-xs text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habits Section */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Habits</h3>
          <form onSubmit={handleAddHabit} className="flex gap-2 mb-4">
            <input type="text" value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} className="flex-1 px-3 py-2 border rounded text-sm" placeholder="Add a daily habit..." />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Add</button>
          </form>
          {habits.length === 0 ? <p className="text-sm text-gray-500">No habits yet.</p> : (
            <ul className="space-y-2">
              {habits.map(habit => (
                <li key={habit.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                  <span>{habit.title}</span>
                  <button onClick={() => handleDeleteHabit(habit.id)} className="text-xs text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Long Plans Section */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Long Plans</h3>
          <form onSubmit={handleAddPlan} className="flex gap-2 mb-4">
            <input type="text" value={newPlanTitle} onChange={(e) => setNewPlanTitle(e.target.value)} className="flex-1 px-3 py-2 border rounded text-sm" placeholder="Add a long plan..." />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Add</button>
          </form>
          {longPlans.length === 0 ? <p className="text-sm text-gray-500">No long plans yet.</p> : (
            <ul className="space-y-2">
              {longPlans.map(plan => (
                <li key={plan.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                  <span>{plan.title}</span>
                  <button onClick={() => handleDeletePlan(plan.id)} className="text-xs text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
