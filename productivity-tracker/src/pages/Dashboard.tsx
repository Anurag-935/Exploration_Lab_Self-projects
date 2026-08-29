import { useData } from "../hooks/useData"
import Clock from "../components/Clock"
import BacklogWidget from "../components/BacklogWidget"
import TimeSpentWidget from "../components/TimeSpentWidget"
import DatePendingWidget from "../components/DatePendingWidget"
import MainTaskTable from "../components/MainTaskTable"
import RadarStats from "../components/RadarStats"
import CalendarHeatmap from "../components/CalendarHeatmap"
import MonthlyLineGraph from "../components/MonthlyLineGraph"
import Timer from "../components/Timer"
import ProjectsWidget from "../components/ProjectsWidget"
import ProjectsGallery from "../components/ProjectsGallery"
import ProjectDetail from "../components/ProjectDetail"
import { Project } from "../types"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const { tasks, projects, loading, refetch, lastRefreshed } = useData()
  const [showProjectsGallery, setShowProjectsGallery] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    if (selectedProject && projects) {
      const updated = projects.find(p => p.id === selectedProject.id)
      if (updated) {
        setSelectedProject(updated)
      }
    }
  }, [projects])
  
  if (loading) return <div className="p-8 text-center text-brand-light/50">Loading your workspace...</div>

  const activeTasks = tasks.filter((t: any) => {
    if ((t.carried_over_count || 0) < 0) return false
    if (t.task_type === "Short Task" && t.status === "done") {
      if (t.completed_at) {
        const completedStr = new Date(t.completed_at).toISOString().split("T")[0]
        const todayStr = new Date().toISOString().split("T")[0]
        if (completedStr < todayStr) return false
      }
    }
    return true
  })

  return (
    <div className="space-y-8 pb-12 w-full">
      {/* Top Row: Clock | Recommendation | Time-Spent | Date/Pending */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
        {/* 1. Clock (~20%) */}
        <div className="w-full md:w-[20%] flex justify-center md:justify-start">
          <Clock />
        </div>
        
        {/* 2. Recommendation (~35%) */}
        <div className="w-full md:w-[35%]">
          <BacklogWidget onTaskAdded={refetch} />
        </div>
        
        {/* 3. Time-Spent (~20%) */}
        <div className="w-full md:w-[20%]">
          <TimeSpentWidget refreshTrigger={lastRefreshed} />
        </div>
        
        {/* 4. Date/Pending (~20%) */}
        <div className="w-full md:w-[20%]">
          <DatePendingWidget tasks={activeTasks} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-8 w-full">
        {/* Full width Main Task Table */}
        <div className="w-full">
          <MainTaskTable tasks={activeTasks as any} refetch={refetch} />
        </div>

        {/* Radar | Calendar | Timer */}
        <div className="flex flex-col xl:flex-row gap-8 items-stretch">
          <div className="w-full xl:w-1/3">
            <RadarStats tasks={tasks as any} />
          </div>
          <div className="w-full xl:w-1/3">
            <CalendarHeatmap tasks={tasks as any} />
          </div>
          <div className="w-full xl:w-1/3 flex flex-col gap-8">
              <div className="flex-1">
                <Timer activeTasks={activeTasks.filter((t: any) => t.status === "open")} onStop={refetch} />
              </div>
              <div className="flex-1">
                <ProjectsWidget projects={projects || []} onClick={() => setShowProjectsGallery(true)} />
              </div>
            </div>
        </div>

        {/* Line Graph */}
        <div className="w-full">
          <MonthlyLineGraph tasks={tasks as any} />
        </div>
      </div>

      {showProjectsGallery && (
        <ProjectsGallery 
          projects={projects || []}
          onClose={() => setShowProjectsGallery(false)}
          onSelectProject={(p) => {
            setShowProjectsGallery(false)
            setSelectedProject(p)
          }}
          onUpdated={refetch}
        />
      )}

      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => {
            setSelectedProject(null)
            setShowProjectsGallery(true)
          }}
          onUpdated={refetch}
        />
      )}
    </div>
  )
}