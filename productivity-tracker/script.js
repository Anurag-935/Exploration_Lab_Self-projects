const fs = require('fs')

let content = fs.readFileSync('src/components/BacklogWidget.tsx', 'utf8')

content = content.replace('import { X, Trash2 } from "lucide-react"', 'import { X, Trash2, ArrowRight } from "lucide-react"')

const oldConfirm = `  const handleConfirmMoveToTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeItem || !userData) return

    await supabase.from("tasks").insert({
      user_id: userData.user.id,
      title: activeItem.title,
      note: newTaskNote,
      status: "open",
      task_type: "Short Task"
    })

    await supabase.from("backlog_tasks").delete().eq("id", activeItem.id)

    setShowAddModal(false)
    setActiveItem(null)
    setNewTaskNote("")
    fetchBacklog()
    onTaskAdded()
  }`

const newConfirm = `  const handleConfirmMoveToTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeItem || !userData) return

    await supabase.from("tasks").insert({
      user_id: userData.user.id,
      title: activeItem.title,
      note: newTaskNote,
      status: "open",
      task_type: "Short Task"
    })

    if (!activeItem.id.startsWith("new-")) {
      await supabase.from("backlog_tasks").delete().eq("id", activeItem.id)
    }
    
    setLocalBacklog(prev => prev.filter(b => b.id !== activeItem.id))

    setShowAddModal(false)
    setActiveItem(null)
    setNewTaskNote("")
    fetchBacklog()
    onTaskAdded()
  }`

content = content.replace(oldConfirm.replace(/\r\n/g, '\n'), newConfirm)
content = content.replace(oldConfirm, newConfirm)


const oldStartMove = `  const handleStartMoveToTable = (item: BacklogItem) => {
    setActiveItem(item)
    setNewTaskNote("")
    setShowAddModal(true)
  }`

const newStartMove = `  const handleStartMoveToTable = (item: BacklogItem) => {
    setActiveItem(item)
    setNewTaskNote("")
    setShowAddModal(true)
  }

  const [recIndex, setRecIndex] = useState(0)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true)
      setTimeout(() => {
        setRecIndex(prev => prev + 1)
        setFade(false)
      }, 500)
    }, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])`

content = content.replace(oldStartMove.replace(/\r\n/g, '\n'), newStartMove)
content = content.replace(oldStartMove, newStartMove)


const oldTrash = `<button 
                    onClick={() => handleLocalDelete(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>`

const newTrash = `<button 
                    onClick={() => handleStartMoveToTable(item)}
                    className="w-8 h-8 flex items-center justify-center text-brand-500/70 hover:text-brand-500 hover:bg-brand-500/10 rounded transition-colors"
                    title="Add to Table"
                  >
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => handleLocalDelete(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>`

content = content.replace(oldTrash.replace(/\r\n/g, '\n'), newTrash)
content = content.replace(oldTrash, newTrash)

fs.writeFileSync('src/components/BacklogWidget.tsx', content)
