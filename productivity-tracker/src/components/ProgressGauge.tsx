import React from "react"

export default function ProgressGauge({ progress }: { progress: number }) {
  const percentage = Math.max(0, Math.min(1, progress / 100))
  const pathLength = 125.6
  const strokeDashoffset = pathLength - (pathLength * percentage)

  // Color logic
  let color = "#3b82f6" // blue-500
  if (progress === 100) color = "#10b981" // emerald-500
  else if (progress === 0) color = "#6b7280" // gray-500

  return (
    <div className="relative flex flex-col items-center justify-end w-14 h-12 bg-brand-dark/90 backdrop-blur-sm rounded-t-full shadow-sm p-1 border border-brand-900/50">
      <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
        {/* Background Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#2A2A2B"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Filled Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Number in the center */}
      <div className="absolute bottom-1 text-xs font-bold text-brand-light">
        {progress}<span className="text-[10px] text-brand-light/50">%</span>
      </div>
    </div>
  )
}
