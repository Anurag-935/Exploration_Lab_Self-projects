import sys

with open("src/types/index.ts", "a", encoding="utf-8") as f:
    f.write("""
export type Project = {
  id: string
  user_id: string
  title: string
  description: string | null
  progress_percent: number
  created_at: string
}

export type ProjectLog = {
  id: string
  project_id: string
  user_id: string
  log_date: string
  content: string
  created_at: string
}
""")
