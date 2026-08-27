import { useState, useEffect } from "react"

export default function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-4xl font-mono font-bold tracking-tight text-gray-800">
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </div>
  )
}
