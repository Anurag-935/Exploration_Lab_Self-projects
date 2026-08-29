import sys
import re

with open("src/hooks/useData.ts", "r", encoding="utf-8") as f:
    text = f.read()

pattern = r'export const runDailyRollover = async.*?export function useData\(\) \{'

replacement = """export const runDailyRollover = async (userId: string) => {
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
  const habits = oldTasks.filter(t => t.task_type === "Habit")
  // Long Plans just naturally stay in the UI unchanged, so we do nothing with them.

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

  // --- HABITS ---
  // Find all unique habit titles from the user's active table
  const uniqueHabitTitles = Array.from(new Set(habits.map(h => h.title)))
  
  for (const title of uniqueHabitTitles) {
    // Check if this habit title was already cloned/created TODAY
    const hasTodayInstance = allActive.some(t => t.task_type === "Habit" && t.title === title && new Date(t.created_at).toISOString().split("T")[0] === todayStr)
    
    if (!hasTodayInstance) {
      // Find the most recent instance of this habit to clone its properties
      const latestInstance = habits.filter(h => h.title === title).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      
      const { data: newHabit } = await supabase.from("tasks").insert({
        user_id: userId,
        title: title,
        note: latestInstance.note,
        priority: latestInstance.priority,
        exp_value: latestInstance.exp_value,
        task_type: "Habit",
        status: "open",
        created_at: new Date().toISOString()
      }).select().single()

      if (newHabit && latestInstance.task_skills && latestInstance.task_skills.length > 0) {
        const skillInserts = latestInstance.task_skills.map((ts: any) => ({
          task_id: newHabit.id,
          skill_id: ts.skill_id
        }))
        await supabase.from("task_skills").insert(skillInserts)
      }
    }
  }

  // Mark all old habits as carried_over_count = -1 (hidden from active view)
  for (const h of habits) {
    await supabase.from("tasks").update({ carried_over_count: -1 }).eq("id", h.id)
  }
}

export function useData() {"""

text = re.sub(pattern, replacement, text, flags=re.DOTALL)

with open("src/hooks/useData.ts", "w", encoding="utf-8") as f:
    f.write(text)
