import { useMemo } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import { Skill, Task } from "../types"

const AXES = ["Technical", "Communication", "Creativity", "Discipline", "Learning", "Wellness"]

type TaskWithSkills = Task & {
  task_skills?: { skills: { name: string } }[]
}

type Props = {
  tasks: TaskWithSkills[]
}

export default function RadarStats({ tasks }: Props) {
  
  // Calculate XP per axis based on completed tasks
  const stats = useMemo(() => {
    const xpMap: Record<string, number> = {}
    AXES.forEach(a => xpMap[a] = 0)

    tasks.forEach(t => {
      if (t.status === "done" && t.task_skills) {
        const tExp = t.exp_value || 10
        t.task_skills.forEach(ts => {
          if (ts.skills?.name && xpMap[ts.skills.name] !== undefined) {
            xpMap[ts.skills.name] += tExp
          }
        })
      }
    })

    let maxVal = 10
    const data = AXES.map(name => {
      const xp = xpMap[name]
      if (xp > maxVal) maxVal = xp
      
      // Calculate level (e.g. 100 XP per level)
      const level = Math.floor(xp / 100) + 1
      const progress = xp % 100

      return {
        name,
        xp,
        level,
        progress
      }
    })

    return { data, maxVal: Math.max(maxVal, 50) } // Ensure domain is at least 0-50
  }, [tasks])

  return (
    <div className="bg-brand-dark p-6 rounded-xl shadow-lg border border-brand-900/30 flex flex-col h-full">
      <h3 className="font-semibold text-brand-light mb-2 text-center tracking-wide uppercase text-sm">Skill Radar</h3>
      
      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={stats.data}>
            <PolarGrid stroke="#5A1420" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#EFE7DE', fontSize: 10, fontWeight: 600 }} />
            {/* Setting a static domain ensures the hexagon never distorts, even if some values are 0 */}
            <PolarRadiusAxis angle={30} domain={[0, stats.maxVal]} tick={false} axisLine={false} />
            <Radar name="Level" dataKey="xp" stroke="#B14858" fill="#892535" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

            <div className="mt-2 bg-brand-darker p-4 rounded-lg border border-brand-900/50 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-brand-light/70 uppercase tracking-wider mb-1">Average Global EXP</span>
        <span className="text-2xl font-bold text-brand-500">{Math.round(stats.data.reduce((sum, s) => sum + s.xp, 0) / 6)}</span>
      </div>
    </div>
  )
}

