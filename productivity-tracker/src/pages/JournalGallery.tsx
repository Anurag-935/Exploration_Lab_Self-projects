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
  const [isCreating, setIsCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form State
  const [summary, setSummary] = useState("")
  const [body, setBody] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const fetchEntries = async () => {
    setLoading(true)
    const { data } = await supabase.from("daily_journals").select("*").order("date", { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Not authenticated")

      let coverUrl = null

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${userData.user.id}/${fileName}`

        // Ensure you have created a public bucket named "journals" in Supabase!
        const { error: uploadError } = await supabase.storage
          .from('journals')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('journals')
          .getPublicUrl(filePath)
          
        coverUrl = publicUrl
      }

      await supabase.from("daily_journals").insert({
        user_id: userData.user.id,
        date: new Date().toISOString().split("T")[0],
        summary: summary.trim(),
        body: body.trim(),
        cover_image: coverUrl
      })

      setIsCreating(false)
      setSummary("")
      setBody("")
      setFile(null)
      fetchEntries()
    } catch (err: any) {
      console.error(err);
      alert("Error saving entry: " + (err.message || err.details || JSON.stringify(err)));
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading journal...</div>

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Journal</h2>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 text-sm"
          >
            New Entry
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Write a new entry</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Summary (1-2 lines)</label>
              <input 
                type="text" 
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-100 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Entry</label>
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg h-32 focus:ring focus:ring-blue-100 outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={uploading || !summary}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </form>
        </div>
      )}

      {entries.length === 0 && !isCreating ? (
        <div className="text-center p-12 bg-white rounded-xl border border-gray-100 border-dashed">
          <p className="text-gray-500 mb-2">No journal entries yet.</p>
          <p className="text-sm text-gray-400">Click "New Entry" to write your first reflection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map(entry => {
            const dateObj = new Date(entry.date)
            // Add a timezone offset to fix JS date parsing off-by-one day bugs
            dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset())
            
            return (
              <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-72">
                <div className="h-32 bg-gray-100 relative shrink-0">
                  {entry.cover_image ? (
                    <img src={entry.cover_image} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Cover</div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-xs text-blue-600 font-semibold mb-2">
                    {dateObj.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <p className="text-gray-900 font-medium mb-1 line-clamp-2 leading-tight">
                    {entry.summary || "Untitled Entry"}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {entry.body}
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
