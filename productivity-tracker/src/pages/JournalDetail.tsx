import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import RatingGauge from "../components/RatingGauge"

type JournalEntry = {
 id: string
 date: string
 summary: string
 body: string
 cover_image: string | null
 rating: number | null
}

export default function JournalDetail() {
 const { id } = useParams()
 const navigate = useNavigate()
 const [entry, setEntry] = useState<JournalEntry | null>(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 const fetchEntry = async () => {
 if (!id) return
 const { data, error } = await supabase.from("daily_journals").select("*").eq("id", id).single()
 if (error) {
 console.error(error)
 } else {
 setEntry(data)
 }
 setLoading(false)
 }
 fetchEntry()
 }, [id])

 if (loading) return <div className="p-8 text-center text-brand-light/50">Loading note...</div>
 if (!entry) return <div className="p-8 text-center text-brand-light/50">Note not found.</div>

 const dateObj = new Date(entry.date)
 dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset())

 return (
 <div className="max-w-3xl mx-auto space-y-6 pb-12">
 <button onClick={() => navigate('/journal')} className="text-brand-500 hover:underline text-sm font-medium border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold ">
 &larr; Back to Gallery
 </button>

 <div className="bg-brand-dark rounded-xl border-2 border-brand-900 overflow-hidden relative">
 {entry.rating && (
 <div className="absolute top-4 right-4 z-10 scale-125 origin-top-right">
 <RatingGauge rating={entry.rating} />
 </div>
 )}
 
 {entry.cover_image && (
 <div className="h-64 bg-brand-darker w-full shadow-neo">
 <img src={entry.cover_image} alt="Cover" className="w-full h-full object-cover" />
 </div>
 )}
 
 <div className="p-8">
 <div className="text-sm text-brand-500 font-semibold mb-2 uppercase tracking-wider">
 {dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
 </div>
 <h1 className="text-3xl font-bold text-brand-light mb-6">{entry.summary}</h1>
 <div className="prose max-w-none text-brand-light/90 whitespace-pre-wrap">
 {entry.body}
 </div>
 </div>
 </div>
 </div>
 )
}


