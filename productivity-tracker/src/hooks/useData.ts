import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Task, Habit, LongPlan, Skill, Project } from "../types"

// Daily rollover logic
export const runDailyRollover = async (userId: string) => {
  const now = new Date()
  const todayStr = now.toISOString().split("T")[0]
  
  // 1. Find tasks that are 'open', created before today, and not already rolled over
  const { data: oldTasks } = await supabase
    .from("tasks")
    .select("id, title, created_at, carried_over_count, task_type")
    .eq("status", "open")
    .eq("user_id", userId)
    .gte("carried_over_count", 0) // not rolled over

  if (!oldTasks || oldTasks.length === 0) return

  const toRollover = oldTasks.filter(t => {
    const createdStr = new Date(t.created_at).toISOString().split("T")[0]
    return createdStr < todayStr
  })

  if (toRollover.length === 0) return

  // 2. Insert into backlog
  const backlogInserts = toRollover.map(t => ({
    user_id: userId,
    title: t.title,
    created_at: new Date().toISOString()
  }))
  await supabase.from("backlog_tasks").insert(backlogInserts)

  // 3. Mark as rolled over (carried_over_count = -1 means missed/rolled over)
  const taskIds = toRollover.map(t => t.id)
  for (const id of taskIds) {
    await supabase.from("tasks").update({ carried_over_count: -1 }).eq("id", id)
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






