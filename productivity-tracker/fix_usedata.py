import sys
import re

with open("src/hooks/useData.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Update imports
text = text.replace('import { Task, Habit, LongPlan, Skill } from "../types"', 'import { Task, Habit, LongPlan, Skill, Project } from "../types"')

# Add projects state
text = text.replace('const [skills, setSkills] = useState<Skill[]>([])', 'const [skills, setSkills] = useState<Skill[]>([])\n  const [projects, setProjects] = useState<Project[]>([])')

# Add to Promise.all
old_promise = """    const [
      { data: tasksData },
      { data: habitsData },
      { data: plansData },
      { data: skillsData }
    ] = await Promise.all(["""
new_promise = """    const [
      { data: tasksData },
      { data: habitsData },
      { data: plansData },
      { data: skillsData },
      { data: projectsData }
    ] = await Promise.all(["""
text = text.replace(old_promise, new_promise)

old_queries = """      supabase.from("habits").select("*").order("created_at", { ascending: false }),
      supabase.from("long_plans").select("*").order("created_at", { ascending: false }),
      supabase.from("skills").select("*").order("created_at", { ascending: false })
    ])"""
new_queries = """      supabase.from("habits").select("*").order("created_at", { ascending: false }),
      supabase.from("long_plans").select("*").order("created_at", { ascending: false }),
      supabase.from("skills").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false })
    ])"""
text = text.replace(old_queries, new_queries)

old_setters = """    if (plansData) setLongPlans(plansData)
    if (skillsData) setSkills(skillsData)"""
new_setters = """    if (plansData) setLongPlans(plansData)
    if (skillsData) setSkills(skillsData)
    if (projectsData) setProjects(projectsData)"""
text = text.replace(old_setters, new_setters)

old_return = """    longPlans,
    skills,
    loading,"""
new_return = """    longPlans,
    skills,
    projects,
    loading,"""
text = text.replace(old_return, new_return)

with open("src/hooks/useData.ts", "w", encoding="utf-8") as f:
    f.write(text)
