export type Skill = {
  id: string
  user_id: string
  name: string
  xp_total: number
  level: number
  created_at: string
}

export type Task = {
  priority?: number
  time_estimate?: number
  exp_value?: number
  task_type?: string
  id: string
  user_id: string
  title: string
  note: string | null
  status: "open" | "done"
  carried_over_count: number
  created_at: string
  completed_at: string | null
}

export type Habit = {
  id: string
  user_id: string
  title: string
  note: string | null
  schedule: any
  skip_used_this_week: boolean
  streak_current: number
  streak_best: number
  created_at: string
}

export type LongPlan = {
  id: string
  user_id: string
  title: string
  note: string | null
  status: "active" | "paused" | "done"
  target_date: string | null
  created_at: string
}

