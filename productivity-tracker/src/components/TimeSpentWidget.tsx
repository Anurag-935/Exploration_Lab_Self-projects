import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function TimeSpentWidget({ refreshTrigger }: { refreshTrigger: number }) {
 const [todaySeconds, setTodaySeconds] = useState(0)
 const [avgSeconds, setAvgSeconds] = useState(0)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 const fetchData = async () => {
 setLoading(true)
 const now = new Date()
 const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
 
 const { data, error } = await supabase
 .from("time_logs")
 .select("start_time, duration_seconds")
 .gte("start_time", firstDayOfMonth.toISOString())
 
 if (error) {
 console.error(error)
 setLoading(false)
 return
 }

 let todaySum = 0
 let monthSum = 0

 const todayStr = now.toISOString().split("T")[0]

 data?.forEach(log => {
 if (!log.duration_seconds) return
 monthSum += log.duration_seconds
 
 const logDateStr = new Date(log.start_time).toISOString().split("T")[0]
 if (logDateStr === todayStr) {
 todaySum += log.duration_seconds
 }
 })

 const daysElapsed = now.getDate()
 const avg = daysElapsed > 0 ? monthSum / daysElapsed : 0

 setTodaySeconds(todaySum)
 setAvgSeconds(avg)
 setLoading(false)
 }

 fetchData()
 }, [refreshTrigger])

 const formatTime = (totalSeconds: number) => {
 if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`
 const hours = Math.floor(totalSeconds / 3600)
 const minutes = Math.floor((totalSeconds % 3600) / 60)
 if (hours > 0) return `${hours}h ${minutes}m`
 return `${minutes}m`
 }

 return (
 <div className="w-full h-full bg-brand-dark p-4 rounded-xl border-2 border-brand-900 flex flex-col justify-between shadow-neo">
 <h3 className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Time Spent</h3>
 
 {loading ? (
 <div className="flex-1 flex items-center justify-center text-brand-light/50 text-sm">...</div>
 ) : (
 <div className="flex flex-col justify-around flex-1">
 <div className="flex items-end justify-between">
 <span className="text-brand-light/70 text-sm">Today</span>
 <span className="text-2xl font-bold text-brand-light leading-none">{formatTime(todaySeconds)}</span>
 </div>
 
 <div className="w-full h-[1px] bg-brand-900/30 my-2"></div>
 
 <div className="flex items-end justify-between">
 <span className="text-brand-light/70 text-sm">Avg/Day</span>
 <span className="text-lg font-semibold text-brand-light/80 leading-none">{formatTime(avgSeconds)}</span>
 </div>
 </div>
 )}
 </div>
 )
}
