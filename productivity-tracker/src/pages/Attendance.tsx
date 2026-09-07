import React from 'react'

export default function Attendance() {
  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        {/* Pie Chart Placeholder */}
        <div className="bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-xl font-bold text-brand-light mb-4">Overall Attendance</h2>
          <div className="w-40 h-40 rounded-full border-4 border-brand-900 border-dashed flex items-center justify-center">
            <span className="text-brand-light/50 font-bold">Chart</span>
          </div>
        </div>

        {/* Subjects Placeholder */}
        <div className="bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 flex flex-col gap-4 flex-1">
          <h2 className="text-xl font-bold text-brand-light mb-2">Subjects</h2>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-full h-16 bg-brand-darker border-2 border-brand-900 shadow-neo-sm rounded-lg flex items-center justify-center">
              <span className="text-brand-light/50 font-bold">Subject {i} Bar</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        {/* Top Row: Timetable & Labs */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Timetable */}
          <div className="flex-1 bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 min-h-[250px] flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold text-brand-light mb-4">Today's Timetable</h2>
            <div className="w-full h-full border-2 border-brand-900 border-dashed rounded flex items-center justify-center">
              <span className="text-brand-light/50 font-bold">Timetable Grid</span>
            </div>
          </div>
          
          {/* Labs Summary */}
          <div className="flex-1 bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 min-h-[250px] flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold text-brand-light mb-4">Labs Summary</h2>
            <div className="w-full h-full border-2 border-brand-900 border-dashed rounded flex items-center justify-center">
              <span className="text-brand-light/50 font-bold">Labs List</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Calendar */}
        <div className="w-full bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 flex-1 min-h-[400px] flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-brand-light mb-4">Events Calendar</h2>
          <div className="w-full h-full border-2 border-brand-900 border-dashed rounded flex items-center justify-center">
            <span className="text-brand-light/50 font-bold">Month View Grid</span>
          </div>
        </div>
      </div>
    </div>
  )
}
