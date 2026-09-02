import React from "react"

export default function RatingGauge({ rating }: { rating: number }) {
 // We draw a semi-circle from left to right.
 // ViewBox is 100x50. The arc goes from (10,45) to (90,45) with radius 40.
 // The path length of a half circle with radius 40 is PI * 40 125.6
 
 const percentage = rating / 5
 const pathLength = 125.6
 const strokeDashoffset = pathLength - (pathLength * percentage)

 return (
 <div className="relative flex flex-col items-center justify-end w-12 h-10 bg-brand-dark/90 backdrop-blur-sm rounded-t-full shadow-neo p-1 border-2 border-brand-900">
 <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
 {/* Background Track */}
 <path
 d="M 10 50 A 40 40 0 0 1 90 50"
 fill="none"
 stroke="#2A2A2B"
 strokeWidth="12"
 strokeLinecap="round"
 />
 {/* Filled Track (Gold) */}
 <path
 d="M 10 50 A 40 40 0 0 1 90 50"
 fill="none"
 stroke="#B14858"
 strokeWidth="12"
 strokeLinecap="round"
 strokeDasharray={pathLength}
 strokeDashoffset={strokeDashoffset}
 className="transition-all duration-700 ease-out"
 />
 </svg>
 {/* Number in the center */}
 <div className="absolute bottom-1 text-xs font-bold text-brand-light">
 {rating}<span className="text-[10px] text-brand-light/50">/5</span>
 </div>
 </div>
 )
}

