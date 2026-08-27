import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import ImageCropper from "../components/ImageCropper"
import { Trash2 } from "lucide-react"
import RatingGauge from "../components/RatingGauge"

type JournalEntry = {
  id: string
  date: string
  summary: string
  body: string
  cover_image: string | null
  rating: number | null
}

export default function JournalGallery() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  // Form State
  const [summary, setSummary] = useState("")
  const [body, setBody] = useState("")
  const [rating, setRating] = useState<number>(0)
  
  // Image State
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchEntries = async () => {
    setLoading(true)
    const { data } = await supabase.from("daily_journals").select("*").order("created_at", { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener("load", () => setRawImageSrc(reader.result?.toString() || null))
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleCropDone = (blob: Blob) => {
    setCroppedBlob(blob)
    setPreviewUrl(URL.createObjectURL(blob))
    setRawImageSrc(null)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this journal note?")) {
      await supabase.from("daily_journals").delete().eq("id", id)
      fetchEntries()
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Not authenticated")

      let coverUrl = null

      if (croppedBlob) {
        const fileName = `${Math.random()}.jpg`
        const filePath = `${userData.user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('journals')
          .upload(filePath, croppedBlob, { contentType: 'image/jpeg' })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('journals')
          .getPublicUrl(filePath)
          
        coverUrl = publicUrl
      }

      const { error: insertError } = await supabase.from("daily_journals").insert({
        user_id: userData.user.id,
        date: new Date().toISOString().split("T")[0],
        summary: summary.trim(),
        body: body.trim(),
        cover_image: coverUrl,
        rating: rating > 0 ? rating : null
      })
      if (insertError) throw insertError

      setIsCreating(false)
      setSummary("")
      setBody("")
      setRating(0)
      setCroppedBlob(null)
      setPreviewUrl(null)
      fetchEntries()
    } catch (err: any) {
      console.error(err)
      alert("Error saving note: " + (err.message || JSON.stringify(err)))
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-brand-light/50">Loading journal...</div>

  return (
    <div className="space-y-6 pb-12">
      {rawImageSrc && (
        <ImageCropper 
          imageSrc={rawImageSrc} 
          onCropDone={handleCropDone} 
          onCancel={() => { setRawImageSrc(null); if (fileInputRef.current) fileInputRef.current.value = "" }} 
        />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Journal</h2>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-brand-700 text-white rounded font-medium hover:bg-brand-500 text-sm shadow-sm"
          >
            New Note
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-brand-dark p-6 rounded-xl shadow-sm border border-brand-900/30 mb-8">
          <h3 className="font-semibold mb-6 text-lg">Write a new note</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Image Upload Dropzone */}
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-medium mb-2">Cover Image (Optional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${previewUrl ? 'border-transparent' : 'border-brand-900/40 hover:border-brand-500 bg-brand-darker/50 hover:bg-brand-900/20'}`}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-sm text-brand-light/50">
                      <span className="text-brand-500 font-medium">Click to upload</span>
                      <p className="text-xs mt-1 text-brand-light/40">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {previewUrl && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setCroppedBlob(null); }} className="text-xs text-red-500 mt-2 hover:underline">
                    Remove Image
                  </button>
                )}
              </div>

              {/* Rating & Summary */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Day Rating (Out of 5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${rating === num ? 'bg-yellow-400 text-yellow-900 border-2 border-yellow-500 shadow-md scale-110' : 'bg-brand-darker text-brand-light/40 hover:bg-brand-dark'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Summary (1-2 lines)</label>
                  <input 
                    type="text" 
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-4 py-2 bg-brand-darker text-brand-light border border-brand-900/50 rounded-lg focus:ring-2 focus:ring-brand-900 focus:border-brand-500 outline-none transition-all"
                    placeholder="What happened today?"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Full Entry</label>
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your detailed thoughts here..."
                className="w-full px-4 py-3 bg-brand-darker text-brand-light border border-brand-900/50 rounded-lg h-40 focus:ring-2 focus:ring-brand-900 focus:border-brand-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-5 py-2.5 text-brand-light/70 hover:bg-brand-darker rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={uploading || !summary}
                className="px-6 py-2.5 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                {uploading ? "Saving..." : "Save Note"}
              </button>
            </div>
          </form>
        </div>
      )}

      {entries.length === 0 && !isCreating ? (
        <div className="text-center p-16 bg-brand-dark rounded-2xl border-2 border-brand-900/30 border-dashed">
          <div className="w-16 h-16 bg-brand-900/20 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">??</div>
          <p className="text-brand-light font-medium mb-1">No notes yet</p>
          <p className="text-sm text-brand-light/50 mb-6 max-w-sm mx-auto">Click "New Note" to write your first reflection. It will appear here as a card.</p>
          <button onClick={() => setIsCreating(true)} className="px-5 py-2 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-500 text-sm shadow-sm">
            Write First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map(entry => {
            const dateObj = new Date(entry.date)
            dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset())
            
            return (
              <div 
                key={entry.id} 
                onClick={() => navigate(`/journal/${entry.id}`)}
                className="bg-brand-dark rounded-xl shadow-sm border border-brand-900/30 overflow-hidden hover:shadow-md hover:border-brand-500/50 transition-all cursor-pointer flex flex-col h-72 relative group"
              >
                {/* Rating Badge */}
                {entry.rating && (
                  <div className="absolute top-3 right-3 z-10">
                    <RatingGauge rating={entry.rating} />
                  </div>
                )}
                
                {/* Delete Button */}
                <button 
                  onClick={(e) => handleDelete(e, entry.id)}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm z-10"
                  title="Delete Note"
                >
                  <Trash2 size={16} />
                </button>

                <div className="h-32 bg-brand-darker/50 relative shrink-0 border-b border-brand-900/30">
                  {entry.cover_image ? (
                    <img src={entry.cover_image} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-brand-light/30">No Cover</div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-xs text-brand-500 font-bold mb-2 uppercase tracking-wider">
                    {dateObj.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <p className="text-brand-light font-semibold mb-2 line-clamp-2 leading-tight">
                    {entry.summary || "Untitled Note"}
                  </p>
                  <p className="text-sm text-brand-light/50 line-clamp-2">
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




