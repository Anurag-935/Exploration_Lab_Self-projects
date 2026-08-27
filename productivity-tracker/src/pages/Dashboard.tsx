import { useState } from "react"
import { useData } from "../hooks/useData"
import { supabase } from "../lib/supabase"
import Clock from "../components/Clock"
import BacklogWidget from "../components/BacklogWidget"
import TimeSpentWidget from "../components/TimeSpentWidget"
import DatePendingWidget from "../components/DatePendingWidget"
import QuickCapture from "../components/QuickCapture"
import MainTaskTable from "../components/MainTaskTable"
import RadarStats from "../components/RadarStats"
import CalendarHeatmap from "../components/CalendarHeatmap"
import MonthlyLineGraph from "../components/MonthlyLineGraph"
import Timer from "../components/Timer"

export default function Dashboard() {
  const { tasks, habits, skills, loading, refetch, lastRefreshed } = useData()
  

  const handleToggleTask = async (taskId: string, currentStatus: "open" | "done") => {
    await supabase.from("tasks").update({
      status: currentStatus === "open" ? "done" : "open",
      completed_at: currentStatus === "open" ? new Date().toISOString() : null
    }).eq("id", taskId)
    
    if (currentStatus === "open" && taskId === activeTaskId) setActiveTaskId(null)
    refetch()
  }

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId)
    if (taskId === activeTaskId) setActiveTaskId(null)
    refetch()
  }

  if (loading) return <div className="p-8 text-center text-brand-light/50">Loading your workspace...</div>

  const openTasks = tasks.filter(t => t.status === "open")
  const doneTasks = tasks.filter(t => t.status === "done")
  const activeTaskObj = tasks.find(t => t.id === activeTaskId) || null

  return (
    <div className="space-y-8 pb-12">
      {/* Top Row: Clock | Recommendation | Time-Spent | Date/Pending */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
        {/* 1. Clock (~20%) */}
        <div className="w-full md:w-[20%] flex justify-center md:justify-start">
          <Clock />
        </div>
        
        {/* 2. Recommendation (~35%) */}
        <div className="w-full md:w-[35%] ">
          <BacklogWidget onTaskAdded={refetch} />
        </div>
        
        {/* 3. Time-Spent (~20%) */}
        <div className="w-full md:w-[20%]">
          <TimeSpentWidget refreshTrigger={lastRefreshed} />
        </div>
        
        {/* 4. Date/Pending (~20%) */}
        <div className="w-full md:w-[20%]">
          <DatePendingWidget tasks={tasks} />
        </div>
      </div>

      
                  {/* Main Content Area */}
      <div className="flex flex-col gap-8">
        
              {/* Full width Main Task Table */}
      <div className="w-full mb-8">
        <MainTaskTable tasks={tasks as any} refetch={refetch} } />
      </div>

      {/* Radar | Calendar | Timer */}
      <div className="flex flex-col md:flex-row gap-8 items-stretch mb-8">
        <div className="w-full md:w-1/3">
          <RadarStats tasks={tasks as any} />
        </div>
        <div className="w-full md:w-1/3">
          <CalendarHeatmap tasks={tasks as any} />
        </div>
        <div className="w-full md:w-1/3">
          <Timer activeTasks={tasks.filter(t => (t.carried_over_count || 0) >= 0 && t.status === "open")} onStop={refetch} />
        </div>
      </div>

      {/* Line Graph */}
      <div className="w-full">
        <MonthlyLineGraph tasks={tasks as any} />
      </div>
    </div>
  )
}


