import { Task } from "../types"

export default function DatePendingWidget({ tasks }: { tasks: Task[] }) {
  const openTasksCount = tasks.filter(t => t.status === "open").length
  const now = new Date()
  
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" })
  const dateName = now.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return (
    <div className="w-full h-full bg-brand-dark p-4 rounded-xl border border-brand-900/30 flex flex-col justify-between">
      <div className="text-right">
        <div className="text-lg font-bold text-brand-light leading-tight">{dayName}</div>
        <div className="text-sm font-medium text-brand-500 uppercase tracking-widest">{dateName}</div>
      </div>
      
      <div className="mt-4 flex items-end justify-between">
        <span className="text-brand-light/70 text-sm">Pending</span>
        <span className="text-3xl font-bold text-brand-light leading-none">{openTasksCount}</span>
      </div>
    </div>
  )
}
