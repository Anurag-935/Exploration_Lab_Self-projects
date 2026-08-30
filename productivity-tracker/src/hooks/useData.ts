import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Task, Habit, LongPlan, Skill, Project } from "../types"

// Daily rollover logic
export const runDailyRollover = async (userId: string) => {
  const now = new Date()
  const todayStr = now.toISOString().split("T")[0]
  
  // 1. Fetch ALL tasks that have carried_over_count >= 0 (meaning active/visible in UI logic)
  const { data: allActive } = await supabase
    .from("tasks")
    .select("*, task_skills(skill_id)")
    .eq("user_id", userId)
    .gte("carried_over_count", 0)

  if (!allActive || allActive.length === 0) return

  const oldTasks = allActive.filter(t => {
    const createdStr = new Date(t.created_at).toISOString().split("T")[0]
    return createdStr < todayStr
  })

  if (oldTasks.length === 0) return

  const shortTasks = oldTasks.filter(t => t.task_type === "Short Task")
  const recurringTasks = oldTasks.filter(t => t.task_type === "Habit" || t.task_type === "Long Plan")

  // --- SHORT TASKS ---
  const openShortTasks = shortTasks.filter(t => t.status === "open")
  if (openShortTasks.length > 0) {
    const backlogInserts = openShortTasks.map(t => ({
      user_id: userId,
      title: t.title,
      created_at: new Date().toISOString()
    }))
    await supabase.from("backlog_tasks").insert(backlogInserts)
  }
  
  for (const t of shortTasks) {
    await supabase.from("tasks").update({ carried_over_count: -1 }).eq("id", t.id)
  }

  // --- RECURRING TASKS (Habits & Long Plans) ---
  const uniqueRecurring = Array.from(new Set(recurringTasks.map(t => `${t.task_type}|${t.title}`)))
  
  for (const unique of uniqueRecurring) {
    const [type, title] = unique.split("|")
    const hasTodayInstance = allActive.some(t => t.task_type === type && t.title === title && new Date(t.created_at).toISOString().split("T")[0] === todayStr)
    
    if (!hasTodayInstance) {
      const latestInstance = recurringTasks.filter(t => t.task_type === type && t.title === title).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      
      const { data: newTask } = await supabase.from("tasks").insert({
        user_id: userId,
        title: title,
        note: latestInstance.note,
        priority: latestInstance.priority,
        exp_value: latestInstance.exp_value,
        task_type: type,
        status: "open",
        created_at: new Date().toISOString()
      }).select().single()

      if (newTask && latestInstance.task_skills && latestInstance.task_skills.length > 0) {
        const skillInserts = latestInstance.task_skills.map((ts: any) => ({
          task_id: newTask.id,
          skill_id: ts.skill_id
        }))
        await supabase.from("task_skills").insert(skillInserts)
      }
    }
  }

  for (const t of recurringTasks) {
    await supabase.from("tasks").update({ carried_over_count: -1 }).eq("id", t.id)
  }
}

export function useData() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [longPlans, setLongPlans] = useState<LongPlan[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState(Date.now())

  const fetchData = async () => {
    if (tasks.length === 0) setLoading(true)
    const [
      { data: tasksData },
      { data: habitsData },
      { data: plansData },
      { data: skillsData },
      { data: projectsData }
    ] = await Promise.all([
      supabase.from("tasks").select("*, task_skills(skills(name)), time_logs(duration_seconds)").order("created_at", { ascending: false }),
      supabase.from("habits").select("*").order("created_at", { ascending: false }),
      supabase.from("long_plans").select("*").order("created_at", { ascending: false }),
      supabase.from("skills").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false })
    ])

    if (tasksData) setTasks(tasksData)
    if (habitsData) setHabits(habitsData)
    if (plansData) setLongPlans(plansData)
    if (skillsData) setSkills(skillsData)
    if (projectsData) setProjects(projectsData)
    setLoading(false)
    setLastRefreshed(Date.now())
  }

    useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        runDailyRollover(data.user.id).then(() => fetchData())
      } else {
        fetchData()
      }
    })
  }, [])

  return {
    tasks,
    habits,
    longPlans,
    skills,
    projects,
    loading,
    refetch: fetchData, lastRefreshed
  }
}






