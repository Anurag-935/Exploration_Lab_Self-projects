import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function AttendancePie({ attended, missed }: { attended: number, missed: number }) {
  const total = attended + missed
  const percent = total === 0 ? 0 : Math.round((attended / total) * 100)
  
  const data = [
    { name: 'Attended', value: attended },
    { name: 'Missed', value: missed }
  ]
  const COLORS = ['#10B981', '#E8342B']

  return (
    <div className="bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 flex flex-col items-center justify-center relative">
      <h2 className="text-xl font-bold text-brand-light mb-4">Overall Attendance</h2>
      <div className="w-48 h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-brand-light">{percent}%</span>
        </div>
      </div>
      <div className="flex gap-4 mt-4 text-sm font-medium">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#10B981] rounded-full"></div><span className="text-brand-light">Attended: {attended}</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-brand-500 rounded-full"></div><span className="text-brand-light">Missed: {missed}</span></div>
      </div>
    </div>
  )
}
