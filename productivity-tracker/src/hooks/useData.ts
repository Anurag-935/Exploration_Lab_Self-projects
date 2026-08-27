import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Task, Habit, LongPlan, Skill } from "../types"

export function useData() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [longPlans, setLongPlans] = useState<LongPlan[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState(Date.now())

  const fetchData = async () => {
    setLoading(true)
    const [
      { data: tasksData },
      { data: habitsData },
      { data: plansData },
      { data: skillsData }
    ] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("habits").select("*").order("created_at", { ascending: false }),
      supabase.from("long_plans").select("*").order("created_at", { ascending: false }),
      supabase.from("skills").select("*").order("created_at", { ascending: false })
    ])

    if (tasksData) setTasks(tasksData)
    if (habitsData) setHabits(habitsData)
    if (plansData) setLongPlans(plansData)
    if (skillsData) setSkills(skillsData)
    setLoading(false)
    setLastRefreshed(Date.now())
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    tasks,
    habits,
    longPlans,
    skills,
    loading,
    refetch: fetchData, lastRefreshed
  }
}

