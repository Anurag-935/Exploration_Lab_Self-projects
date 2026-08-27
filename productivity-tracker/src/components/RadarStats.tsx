import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import { Skill } from "../types"

export default function RadarStats({ skills }: { skills: Skill[] }) {
  const data = skills.length > 0 ? skills : [
    { name: "Focus", level: 1 },
    { name: "Tech", level: 1 },
    { name: "Life", level: 1 }
  ]

  return (
    <div className="bg-brand-dark p-6 rounded-xl shadow-lg border border-brand-900/30">
      <h3 className="font-semibold text-brand-light mb-4 text-center tracking-wide uppercase text-sm">Skill Levels</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#5A1420" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#EFE7DE', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 1']} tick={false} axisLine={false} />
            <Radar name="Level" dataKey="level" stroke="#B14858" fill="#892535" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {skills.length === 0 && (
        <p className="text-center text-xs text-brand-light/50 mt-2">Complete tasks to level up skills!</p>
      )}
    </div>
  )
}
