import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

type JournalEntry = {
  id: string
  date: string
  summary: string
  body: string
  cover_image: string | null
}

export default function JournalGallery() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = async () => {
    setLoading(true)
    const { data } = await supabase.from("daily_journals").select("*").order("date", { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-500">Loading journal...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Journal</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 text-sm">
          New Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-gray-100 border-dashed">
          <p className="text-gray-500 mb-2">No journal entries yet.</p>
          <p className="text-sm text-gray-400">Click "New Entry" to write your first reflection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map(entry => {
            const dateObj = new Date(entry.date)
            return (
              <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-64">
                <div className="h-32 bg-gray-100 relative">
                  {entry.cover_image ? (
                    <img src={entry.cover_image} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Cover</div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-xs text-blue-600 font-semibold mb-1">
                    {dateObj.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                    {entry.summary || "No summary provided."}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
