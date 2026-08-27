import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Task } from "../types"

type BacklogItem = {
  id: string
  title: string
}

export default function BacklogWidget({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [backlog, setBacklog] = useState<BacklogItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modals state
  const [showListModal, setShowListModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Single active item being moved to table
  const [activeItem, setActiveItem] = useState<BacklogItem | null>(null)
  const [newTaskNote, setNewTaskNote] = useState("")

  // List modal local state
  const [localBacklog, setLocalBacklog] = useState<BacklogItem[]>([])
  const [newItemTitle, setNewItemTitle] = useState("")

  const fetchBacklog = async () => {
    setLoading(true)
    const { data } = await supabase.from("backlog_tasks").select("*").order("created_at", { ascending: true })
    if (data) {
      setBacklog(data)
      setLocalBacklog(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBacklog()
  }, [])

  // --- "Add to Table" logic ---
  const handleStartMoveToTable = (item: BacklogItem) => {
    setActiveItem(item)
    setNewTaskNote("")
    setShowAddModal(true)
  }

  const handleConfirmMoveToTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeItem) return

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    // Insert into tasks
    await supabase.from("tasks").insert({
      user_id: userData.user.id,
      title: activeItem.title,
      note: newTaskNote.trim(),
      status: "open"
    })

    // Delete from backlog
    await supabase.from("backlog_tasks").delete().eq("id", activeItem.id)

    setShowAddModal(false)
    setActiveItem(null)
    onTaskAdded() // Refresh dashboard main list
    fetchBacklog()
  }

  // --- Backlog List Modal logic ---
  const handleLocalEdit = (id: string, newTitle: string) => {
    setLocalBacklog(prev => prev.map(item => item.id === id ? { ...item, title: newTitle } : item))
  }

  const handleLocalDelete = (id: string) => {
    setLocalBacklog(prev => prev.filter(item => item.id !== id))
  }

  const handleLocalAdd = () => {
    if (!newItemTitle.trim()) return
    // Generate a fake UUID for local state, will be ignored by Supabase insert (or we just use it)
    const fakeId = 'new-' + Math.random().toString(36).substring(2, 9)
    setLocalBacklog([...localBacklog, { id: fakeId, title: newItemTitle.trim() }])
    setNewItemTitle("")
  }

  const handleSaveListModal = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    // To sync, we delete items that are missing, update existing, insert new.
    // Simpler approach: delete all old items, insert all new items. 
    // BUT we shouldn't wipe IDs if possible, let's just do it cleanly:
    
    const existingIds = backlog.map(b => b.id)
    const localIds = localBacklog.filter(b => !b.id.startsWith('new-')).map(b => b.id)

    // Deletes
    const toDelete = existingIds.filter(id => !localIds.includes(id))
    for (const id of toDelete) {
      await supabase.from("backlog_tasks").delete().eq("id", id)
    }

    // Updates & Inserts
    for (const item of localBacklog) {
      if (item.id.startsWith('new-')) {
        await supabase.from("backlog_tasks").insert({
          user_id: userData.user.id,
          title: item.title
        })
      } else {
        const oldItem = backlog.find(b => b.id === item.id)
        if (oldItem && oldItem.title !== item.title) {
          await supabase.from("backlog_tasks").update({ title: item.title }).eq("id", item.id)
        }
      }
    }

    setShowListModal(false)
    fetchBacklog()
  }

  const recommendedItem = backlog.length > 0 ? backlog[0] : null

  if (loading) return (
    <div className="w-full h-full bg-brand-dark p-4 rounded-xl border border-brand-900/30 flex items-center justify-center">
      <span className="text-brand-light/50 text-sm">Loading Recommendation...</span>
    </div>
  )

  return (
    <>
      {/* Widget UI */}
      <div className="w-full h-full bg-brand-dark p-4 rounded-xl border border-brand-900/30 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2 flex items-center justify-between">
            Recommended Next
            <span className="bg-brand-900/30 text-brand-500 px-2 py-0.5 rounded text-[10px]">{backlog.length} in Backlog</span>
          </h3>
          {recommendedItem ? (
            <p className="text-brand-light font-medium line-clamp-2">{recommendedItem.title}</p>
          ) : (
            <p className="text-brand-light/40 text-sm italic">Backlog is empty. Add items to capture quick thoughts.</p>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => setShowListModal(true)}
            className="flex-1 px-3 py-1.5 bg-brand-darker border border-brand-900/50 text-brand-light rounded text-xs font-medium hover:bg-brand-900 transition-colors"
          >
            Manage Backlog
          </button>
          {recommendedItem && (
            <button 
              onClick={() => handleStartMoveToTable(recommendedItem)}
              className="flex-1 px-3 py-1.5 bg-brand-500 text-brand-light rounded text-xs font-medium hover:bg-brand-700 transition-colors"
            >
              Add to Table
            </button>
          )}
        </div>
      </div>

      {/* Add to Table Modal */}
      {showAddModal && activeItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-brand-dark rounded-xl w-full max-w-md overflow-hidden border border-brand-900/50">
            <div className="p-4 border-b border-brand-900/50">
              <h3 className="font-semibold text-brand-light text-lg">Move to Main Table</h3>
            </div>
            <form onSubmit={handleConfirmMoveToTable} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-light/70 mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={activeItem.title} 
                  disabled
                  className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light/50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-light/70 mb-1">Additional Note (Optional)</label>
                <textarea 
                  value={newTaskNote}
                  onChange={(e) => setNewTaskNote(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-darker border border-brand-900/50 rounded text-brand-light focus:ring-1 focus:ring-brand-500 outline-none resize-none h-24"
                  placeholder="Add details before moving to your active tasks..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-brand-light/70 hover:text-brand-light">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-700 text-brand-light rounded font-medium">Add to Table</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Backlog Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-brand-dark rounded-xl w-full max-w-lg overflow-hidden border border-brand-900/50 flex flex-col h-[70vh]">
            <div className="p-4 border-b border-brand-900/50 flex justify-between items-center">
              <h3 className="font-semibold text-brand-light text-lg">
                Backlog <span className="text-brand-500 text-sm ml-2">({localBacklog.length} total)</span>
              </h3>
              <button onClick={() => { setShowListModal(false); setLocalBacklog(backlog); }} className="text-brand-light/50 hover:text-brand-light text-xl">×</button>
            </div>
            
            <div className="p-4 border-b border-brand-900/30 bg-brand-darker/50">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') handleLocalAdd() }}
                  placeholder="Quick add new idea..."
                  className="flex-1 px-3 py-2 bg-brand-dark border border-brand-900/50 rounded text-brand-light focus:ring-1 focus:ring-brand-500 outline-none text-sm"
                />
                <button onClick={handleLocalAdd} className="px-4 py-2 bg-brand-darker border border-brand-900/50 hover:bg-brand-900 text-brand-light rounded font-medium text-sm">Add</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {localBacklog.length === 0 && (
                <p className="text-center text-brand-light/40 italic py-8">No items in backlog.</p>
              )}
              {localBacklog.map(item => (
                <div key={item.id} className="flex gap-2 group items-center">
                  <input 
                    type="text"
                    value={item.title}
                    onChange={(e) => handleLocalEdit(item.id, e.target.value)}
                    className="flex-1 px-3 py-2 bg-brand-darker border border-transparent hover:border-brand-900/50 focus:border-brand-500 rounded text-brand-light text-sm outline-none transition-colors"
                  />
                  <button 
                    onClick={() => handleLocalDelete(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-brand-900/50 flex justify-end gap-3 bg-brand-darker/30">
              <button onClick={() => { setShowListModal(false); setLocalBacklog(backlog); }} className="px-5 py-2 text-brand-light/70 hover:text-brand-light font-medium">Cancel</button>
              <button onClick={handleSaveListModal} className="px-6 py-2 bg-brand-500 hover:bg-brand-700 text-brand-light rounded font-medium shadow-md">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
