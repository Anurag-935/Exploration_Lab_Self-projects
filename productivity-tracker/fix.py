import sys

with open("src/components/BacklogWidget.tsx", "r", encoding="utf-8") as f:
    text = f.read()

old_confirm = """    // Delete from backlog
    await supabase.from("backlog_tasks").delete().eq("id", activeItem.id)

    setShowAddModal(false)"""
new_confirm = """    // Delete from backlog
    if (!activeItem.id.startsWith("new-")) {
      await supabase.from("backlog_tasks").delete().eq("id", activeItem.id)
    }

    setLocalBacklog(prev => prev.filter(b => b.id !== activeItem.id))

    setShowAddModal(false)"""
text = text.replace(old_confirm, new_confirm)

old_start = """  // --- "Add to Table" logic ---
  const handleStartMoveToTable = (item: BacklogItem) => {
    setActiveItem(item)
    setNewTaskNote("")
    setShowAddModal(true)
  }"""
new_start = """  // --- "Add to Table" logic ---
  const handleStartMoveToTable = (item: BacklogItem) => {
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
  }, [])"""
text = text.replace(old_start, new_start)

old_trash = """                  <button 
                    onClick={() => handleLocalDelete(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>"""
new_trash = """                  <button 
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
                  </button>"""
text = text.replace(old_trash, new_trash)

old_insert = """    // Insert into tasks
    await supabase.from("tasks").insert({
      user_id: userData.user.id,
      title: activeItem.title,
      note: newTaskNote.trim(),
      status: "open"
    })"""
new_insert = """    // Insert into tasks
    await supabase.from("tasks").insert({
      user_id: userData.user.id,
      title: activeItem.title,
      note: newTaskNote.trim(),
      status: "open",
      task_type: "Short Task"
    })"""
text = text.replace(old_insert, new_insert)

with open("src/components/BacklogWidget.tsx", "w", encoding="utf-8") as f:
    f.write(text)
