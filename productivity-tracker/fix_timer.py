import sys

with open("src/components/Timer.tsx", "r", encoding="utf-8") as f:
    text = f.read()

old_state = """  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)"""

new_state = """  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  
  // Real-time tracking
  const [accumulated, setAccumulated] = useState(0)
  const [sessionStart, setSessionStart] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)"""

text = text.replace(old_state, new_state)


old_effect = """  useEffect(() => {
    let interval: any
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])"""

new_effect = """  useEffect(() => {
    let interval: any
    if (isRunning && sessionStart) {
      // Use system time to prevent drifting when the tab is backgrounded
      interval = setInterval(() => {
        const now = Date.now()
        const currentSessionSeconds = Math.floor((now - sessionStart) / 1000)
        setElapsed(accumulated + currentSessionSeconds)
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isRunning, sessionStart, accumulated])"""

text = text.replace(old_effect, new_effect)


old_start = """  const handleStart = () => {
    if (!selectedTaskId) {
      alert("Please select a task to focus on first!")
      return
    }
    if (!startTime) setStartTime(new Date())
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = async () => {
    if (!selectedTaskId || !startTime) return
    setIsRunning(false)
    
    // Write to time_logs
    await supabase.from("time_logs").insert({
      task_id: selectedTaskId,
      start_time: startTime.toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: elapsed
    })

    setElapsed(0)
    setStartTime(null)
    onStop()
  }"""

new_start = """  const handleStart = () => {
    if (!selectedTaskId) {
      alert("Please select a task to focus on first!")
      return
    }
    if (!startTime) setStartTime(new Date())
    setSessionStart(Date.now())
    setIsRunning(true)
  }

  const handlePause = () => {
    if (sessionStart) {
      const currentSessionSeconds = Math.floor((Date.now() - sessionStart) / 1000)
      setAccumulated(prev => prev + currentSessionSeconds)
    }
    setIsRunning(false)
    setSessionStart(null)
  }

  const handleStop = async () => {
    if (!selectedTaskId || !startTime) return
    
    let finalElapsed = accumulated
    if (isRunning && sessionStart) {
      finalElapsed += Math.floor((Date.now() - sessionStart) / 1000)
    }
    
    setIsRunning(false)
    setSessionStart(null)
    
    // Write to time_logs
    await supabase.from("time_logs").insert({
      task_id: selectedTaskId,
      start_time: startTime.toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: finalElapsed
    })

    setElapsed(0)
    setAccumulated(0)
    setStartTime(null)
    onStop()
  }"""

text = text.replace(old_start, new_start)


old_format = """  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }"""

new_format = """  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
  }"""

text = text.replace(old_format, new_format)

with open("src/components/Timer.tsx", "w", encoding="utf-8") as f:
    f.write(text)
