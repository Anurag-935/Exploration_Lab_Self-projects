import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import { Skill } from "../types"

type Props = {
  skills: Skill[]
}

export default function RadarStats({ skills }: Props) {
  // If no skills yet, show some placeholders so the chart doesn't look broken
  const data = skills.length > 0 ? skills : [
    { name: "Focus", level: 1 },
    { name: "Technical", level: 1 },
    { name: "Creative", level: 1 }
  ]

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-semibold mb-4 text-center">Skill Levels</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 1']} tick={false} axisLine={false} />
            <Radar name="Level" dataKey="level" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {skills.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-2">Complete tasks to level up skills!</p>
      )}
    </div>
  )
}
