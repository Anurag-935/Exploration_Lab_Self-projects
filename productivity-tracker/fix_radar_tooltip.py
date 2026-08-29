import sys

with open("src/components/RadarStats.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add Tooltip to imports
text = text.replace('import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"', 'import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"')

# Add CustomTooltip component outside the main function
custom_tooltip = """const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-brand-darker border border-brand-900/50 p-3 rounded shadow-xl">
        <p className="text-brand-500 font-bold mb-1">{data.name}</p>
        <p className="text-brand-light text-sm">Level: <span className="font-semibold">{data.level}</span></p>
        <p className="text-brand-light/70 text-xs">Total XP: {data.xp}</p>
      </div>
    )
  }
  return null
}

export default function RadarStats"""
text = text.replace('export default function RadarStats', custom_tooltip)

# Add Tooltip inside RadarChart
text = text.replace('<Radar name="Level" dataKey="displayLevel" stroke="#B14858" fill="#892535" fillOpacity={0.6} />', '<Tooltip content={<CustomTooltip />} />\n            <Radar name="Level" dataKey="displayLevel" stroke="#B14858" fill="#892535" fillOpacity={0.6} />')

with open("src/components/RadarStats.tsx", "w", encoding="utf-8") as f:
    f.write(text)
