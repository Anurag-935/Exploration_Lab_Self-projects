import sys
import re

with open("src/hooks/useData.ts", "r", encoding="utf-8") as f:
    text = f.read()

pattern = r'const habits = oldTasks\.filter.*?for \(const h of habits\) \{\n\s*await supabase\.from\("tasks"\)\.update\(\{ carried_over_count: -1 \}\)\.eq\("id", h\.id\)\n\s*\}'

replacement = """const recurringTasks = oldTasks.filter(t => t.task_type === "Habit" || t.task_type === "Long Plan")

  // --- SHORT TASKS ---
  // If open, they go to backlog. If done, they just disappear.
  const openShortTasks = shortTasks.filter(t => t.status === "open")
  if (openShortTasks.length > 0) {
    const backlogInserts = openShortTasks.map(t => ({
      user_id: userId,
      title: t.title,
      created_at: new Date().toISOString()
    }))
    await supabase.from("backlog_tasks").insert(backlogInserts)
  }
  
  // Mark all old short tasks as carried_over_count = -1 (hidden from active view)
  for (const t of shortTasks) {
    await supabase.from("tasks").update({ carried_over_count: -1 }).eq("id", t.id)
  }

  // --- RECURRING TASKS (Habits & Long Plans) ---
  // Find all unique type+title combinations
  const uniqueRecurring = Array.from(new Set(recurringTasks.map(t => `${t.task_type}|${t.title}`)))
  
  for (const unique of uniqueRecurring) {
    const [type, title] = unique.split("|")
    // Check if an instance was already created TODAY
    const hasTodayInstance = allActive.some(t => t.task_type === type && t.title === title && new Date(t.created_at).toISOString().split("T")[0] === todayStr)
    
    if (!hasTodayInstance) {
      // Find the most recent instance to clone its properties
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

  // Mark all old recurring tasks as carried_over_count = -1 (hidden from active view)
  for (const t of recurringTasks) {
    await supabase.from("tasks").update({ carried_over_count: -1 }).eq("id", t.id)
  }"""

# Actually, I should match starting from `const habits = ` up to the end of the Habits block. Let's make the regex more precise or just rewrite the whole runDailyRollover again.

import re
full_pattern = r'export const runDailyRollover = async.*?export function useData\(\) \{'

full_replacement = """export const runDailyRollover = async (userId: string) => {
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

export function useData() {"""

text = re.sub(full_pattern, full_replacement, text, flags=re.DOTALL)

with open("src/hooks/useData.ts", "w", encoding="utf-8") as f:
    f.write(text)
