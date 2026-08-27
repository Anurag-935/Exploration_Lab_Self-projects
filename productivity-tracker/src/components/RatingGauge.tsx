import React from "react"

export default function RatingGauge({ rating }: { rating: number }) {
  // We draw a semi-circle from left to right.
  // ViewBox is 100x50. The arc goes from (10,45) to (90,45) with radius 40.
  // The path length of a half circle with radius 40 is PI * 40 ˜ 125.6
  
  const percentage = rating / 5
  const pathLength = 125.6
  const strokeDashoffset = pathLength - (pathLength * percentage)

  return (
    <div className="relative flex flex-col items-center justify-end w-12 h-10 bg-white/90 backdrop-blur-sm rounded-t-full shadow-sm p-1 border border-gray-200">
      <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
        {/* Background Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Filled Track (Gold) */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Number in the center */}
      <div className="absolute bottom-1 text-xs font-bold text-gray-800">
        {rating}<span className="text-[10px] text-gray-400">/5</span>
      </div>
    </div>
  )
}
