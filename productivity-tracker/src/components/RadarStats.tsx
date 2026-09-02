import { useMemo } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Skill, Task } from "../types"

const AXES = ["Technical", "Communication", "Creativity", "Discipline", "Learning", "Wellness"]

type TaskWithSkills = Task & {
  task_skills?: { skills: { name: string } }[]
}

type Props = {
  tasks: TaskWithSkills[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-darker border-2 border-brand-900 p-3 rounded shadow-neo">
        <p className="text-brand-500 font-bold mb-1">{data.name}</p>
        <p className="text-brand-light text-sm">Level: <span className="font-semibold">{data.level}</span></p>
        <p className="text-brand-light/70 text-xs">Total XP: {data.xp}</p>
      </div>
    )
  }
  return null
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

    // CONFIGURABLE CONSTANTS FOR LEVELING
    // Steeper curve: each level requires noticeably more XP than the last.
    // L = Math.floor( (XP / BASE)^(1 / EXPONENT) ) + 1
    const XP_BASE = 100;
    const XP_EXPONENT = 1.5;

    let maxLevel = 1
    const data = AXES.map(name => {
      const xp = xpMap[name] || 0
      
      // Calculate level using the exponential threshold curve
      const levelFloat = Math.pow(xp / XP_BASE, 1 / XP_EXPONENT) + 1
      const level = Math.floor(levelFloat)
      
      if (level > maxLevel) maxLevel = level

      return {
        name,
        xp,
        level,
        displayLevel: levelFloat // use the float for fluid visual growth!
      }
    })

    return { data, maxVal: Math.max(maxLevel, 5) } // Ensure domain shows at least up to Level 5
  }, [tasks])

  return (
    <div className="bg-brand-dark p-6 rounded-xl shadow-neo border-2 border-brand-900 flex flex-col h-full">
      <h3 className="font-semibold text-brand-light mb-2 text-center tracking-wide uppercase text-sm">Skill Radar</h3>
      
      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={stats.data}>
            <PolarGrid stroke="#000000" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#1A1A1A', fontSize: 10, fontWeight: 600 }} />
            {/* Setting a static domain ensures the hexagon never distorts, even if some values are 0 */}
            <PolarRadiusAxis angle={30} domain={[0, stats.maxVal]} tick={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Radar name="Level" dataKey="displayLevel" stroke="#B14858" fill="#892535" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

            <div className="mt-2 bg-brand-darker p-4 rounded-lg border-2 border-brand-900 flex flex-col items-center justify-center shadow-neo-input">
        <span className="text-xs font-bold text-brand-light/70 uppercase tracking-wider mb-1">Average Global EXP</span>
        <span className="text-2xl font-bold text-brand-500">{Math.round(stats.data.reduce((sum, s) => sum + s.xp, 0) / 6)}</span>
      </div>
    </div>
  )
}


