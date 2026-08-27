import { useState, useEffect } from "react"

function FlipDigit({ digit }: { digit: string }) {
  return (
    <div className="relative inline-flex flex-col items-center justify-center bg-brand-darker border border-brand-900/50 rounded-lg w-10 sm:w-12 h-14 sm:h-16 shadow-[0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden mx-0.5">
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent border-b border-black/50"></div>
      <span className="text-3xl sm:text-4xl font-bold text-brand-light z-10 font-mono tracking-tighter drop-shadow-md">{digit}</span>
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/80 z-20 shadow-[0_1px_2px_rgba(255,255,255,0.1)]"></div>
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  )
}

export default function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  // e.g. "14:05" -> ["1", "4", ":", "0", "5"]
  
  return (
    <div className="flex items-center">
      <FlipDigit digit={timeStr[0]} />
      <FlipDigit digit={timeStr[1]} />
      <span className="text-2xl font-bold text-brand-500 mx-1 animate-pulse mb-1">:</span>
      <FlipDigit digit={timeStr[3]} />
      <FlipDigit digit={timeStr[4]} />
    </div>
  )
}
