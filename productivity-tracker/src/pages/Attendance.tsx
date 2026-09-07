import React, { useState, useMemo } from 'react'
import { useAttendance, Subject, ClassLog, TimetableSlot } from '../hooks/useAttendance'
import AttendancePie from '../components/AttendancePie'
import { X, Check, Minus, Calendar as CalIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Settings, Plus, Trash } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const getLocalYYYYMMDD = (dateInput?: string | Date) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const EVENT_TAGS = [
  { label: 'Exam', color: '#E8342B' },
  { label: 'Assignment', color: '#F59E0B' },
  { label: 'Project', color: '#3B82F6' },
  { label: 'Holiday', color: '#10B981' },
  { label: 'Other', color: '#8B5CF6' }
]

export default function Attendance() {
  const { subjects, labs, classLogs, timetableSlots, calendarEvents, loading, logAttendance, addCalendarEvent, addSubject, deleteSubject, addLab, deleteLab, addTimetableSlot, deleteTimetableSlot } = useAttendance()
  
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  
  const [eventTitle, setEventTitle] = useState('')
  const [eventNotes, setEventNotes] = useState('')
  const [eventTag, setEventTag] = useState(EVENT_TAGS[0].label)

  const [currentLogDate, setCurrentLogDate] = useState(() => getLocalYYYYMMDD())
  const todayStr = useMemo(() => getLocalYYYYMMDD(), [])

  // Setup Modal State
  const [showSetup, setShowSetup] = useState(false)
  const [setupTab, setSetupTab] = useState<'subjects' | 'timetable'>('subjects')
  const [newSubName, setNewSubName] = useState('')
  const [newLabName, setNewLabName] = useState('')
  const [newSlotDay, setNewSlotDay] = useState(1)
  const [newSlotStart, setNewSlotStart] = useState('09:00')
  const [newSlotEnd, setNewSlotEnd] = useState('10:00')
  const [newSlotItem, setNewSlotItem] = useState('')

  const currentLogDayOfWeek = new Date(currentLogDate).getDay()

  const dailyClasses = useMemo(() => {
    return timetableSlots.filter(slot => slot.day_of_week === currentLogDayOfWeek).sort((a,b)=>a.start_time.localeCompare(b.start_time))
  }, [timetableSlots, currentLogDayOfWeek])

  const subjectStats = useMemo(() => {
    return subjects.map(sub => {
      const logs = classLogs.filter(l => l.subject_id === sub.id)
      const held = logs.filter(l => l.status !== 'cancelled').length
      const attended = logs.filter(l => l.status === 'present').length
      const missed = logs.filter(l => l.status === 'absent').length
      const percent = held === 0 ? 100 : Math.round((attended / held) * 100)
      const missableRaw = Math.floor(attended / 0.75) - held
      const missable = missableRaw > 0 ? missableRaw : 0
      return { ...sub, held, attended, missed, percent, missable, logs }
    })
  }, [subjects, classLogs])

  const labStats = useMemo(() => {
    return labs.map(lab => {
      const attended = classLogs.filter(l => l.lab_id === lab.id && l.status === 'present').length
      return { ...lab, attended }
    })
  }, [labs, classLogs])

  const handleLog = (slot: TimetableSlot, status: string) => {
    logAttendance(slot.subject_id || null, slot.lab_id || null, status, currentLogDate)
  }

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !eventTitle) return
    const tagObj = EVENT_TAGS.find(t => t.label === eventTag) || EVENT_TAGS[0]
    addCalendarEvent(selectedDate, eventTitle, eventNotes, tagObj.label, tagObj.color)
    setSelectedDate(null)
    setEventTitle('')
    setEventNotes('')
    setEventTag(EVENT_TAGS[0].label)
  }

  const handlePrevDay = () => {
    const d = new Date(currentLogDate)
    d.setDate(d.getDate() - 1)
    setCurrentLogDate(getLocalYYYYMMDD(d))
  }
  
  const handleNextDay = () => {
    const d = new Date(currentLogDate)
    d.setDate(d.getDate() + 1)
    setCurrentLogDate(getLocalYYYYMMDD(d))
  }

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubName) return
    addSubject(newSubName)
    setNewSubName('')
  }

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSlotItem) return
    const isLab = labs.some(l => l.id === newSlotItem)
    if (isLab) {
      addTimetableSlot(newSlotDay, newSlotStart, newSlotEnd, null, newSlotItem)
    } else {
      addTimetableSlot(newSlotDay, newSlotStart, newSlotEnd, newSlotItem, null)
    }
  }

  const handleAddLab = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLabName) return
    addLab(newLabName)
    setNewLabName('')
  }

  // Generate timetable grid
  const uniqueTimes = useMemo(() => {
    const times = new Set<string>()
    timetableSlots.forEach(t => times.add(t.start_time.slice(0,5)))
    return Array.from(times).sort()
  }, [timetableSlots])
  
  const gridDays = [1, 2, 3, 4, 5, 6] // Mon-Sat

  if (loading) return <div className="flex items-center justify-center min-h-screen text-brand-light">Loading Attendance...</div>

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingDayOfWeek = new Date(year, month, 1).getDay()
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyCells = Array.from({ length: startingDayOfWeek }, (_, i) => i)

  return (
    <div className="flex flex-col gap-6 w-full h-full pb-10">
      
      {/* Persistent Daily Log */}
      <div className="bg-brand-dark border-2 border-brand-900 shadow-neo rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-brand-light">Daily Class Log</h2>
          <div className="flex items-center gap-4">
            <button onClick={handlePrevDay} className="p-1 hover:bg-brand-900 rounded text-brand-light"><ChevronLeft size={20}/></button>
            <span className="font-bold text-brand-light min-w-[100px] text-center">{currentLogDate === todayStr ? 'Today' : currentLogDate}</span>
            <button onClick={handleNextDay} className="p-1 hover:bg-brand-900 rounded text-brand-light"><ChevronRight size={20}/></button>
          </div>
        </div>

        {dailyClasses.length === 0 ? (
          <div className="text-brand-light/50 italic">No classes scheduled for this day.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {dailyClasses.map(slot => {
              const name = slot.subject_id ? subjects.find(s=>s.id===slot.subject_id)?.name : labs.find(l=>l.id===slot.lab_id)?.name
              const existingLog = classLogs.find(log => log.log_date === currentLogDate && ((slot.subject_id && log.subject_id === slot.subject_id) || (slot.lab_id && log.lab_id === slot.lab_id)))
              
              return (
                <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-brand-darker p-4 rounded border-2 border-brand-900 shadow-neo-sm">
                  <div className="mb-3 sm:mb-0 flex items-center gap-3">
                    <span className="font-bold text-brand-light text-lg">{name}</span>
                    <span className="text-brand-light/70 text-sm">{slot.start_time.slice(0,5)}</span>
                    {existingLog && (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${existingLog.status === 'present' ? 'bg-[#10B981]/20 text-[#10B981]' : existingLog.status === 'absent' ? 'bg-brand-500/20 text-brand-500' : 'bg-brand-900/50 text-brand-light/70'}`}>
                        {existingLog.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 font-bold">
                    <button onClick={() => handleLog(slot, 'present')} className={`px-4 py-2 rounded border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm transition-all ${existingLog?.status === 'present' ? 'bg-[#10B981] text-white opacity-50' : 'bg-[#10B981] hover:bg-[#059669] text-white'}`}><Check size={18}/></button>
                    <button onClick={() => handleLog(slot, 'absent')} className={`px-4 py-2 rounded border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm transition-all ${existingLog?.status === 'absent' ? 'bg-brand-500 text-white opacity-50' : 'bg-brand-500 hover:bg-brand-700 text-white'}`}><X size={18}/></button>
                    <button onClick={() => handleLog(slot, 'cancelled')} className={`px-4 py-2 rounded border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm transition-all ${existingLog?.status === 'cancelled' ? 'bg-brand-900 text-white opacity-50' : 'bg-brand-darker hover:bg-brand-900 text-brand-light/70'}`} title="Cancelled"><Minus size={18}/></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 flex flex-col gap-4 flex-1">
            <h2 className="text-xl font-bold text-brand-light mb-2">Subjects</h2>
            {subjectStats.map(sub => {
              const isExpanded = expandedSubjectId === sub.id
              const bgColor = sub.percent >= 80 ? 'bg-[#10B981]/10 border-[#10B981]' : sub.percent >= 75 ? 'bg-yellow-500/10 border-yellow-500' : 'bg-brand-500/10 border-brand-500'
              const textColor = sub.percent >= 80 ? 'text-[#10B981]' : sub.percent >= 75 ? 'text-yellow-500' : 'text-brand-500'
              
              return (
                <div key={sub.id} className={`w-full border-2 shadow-neo-sm rounded-lg overflow-hidden transition-all ${bgColor}`}>
                  <button 
                    onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                    className="w-full p-4 flex justify-between items-center outline-none"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-brand-light text-left">{sub.name}</span>
                      <span className="text-brand-light/60 text-xs text-left">Missable: {sub.missable} classes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-black ${textColor}`}>{sub.percent}%</span>
                      {isExpanded ? <ChevronUp size={20} className={textColor} /> : <ChevronDown size={20} className={textColor} />}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t-2 border-inherit flex flex-col gap-6">
                      <AttendancePie attended={sub.attended} missed={sub.missed} />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-brand-darker p-3 border-2 border-brand-900 rounded text-center">
                          <div className="text-xs text-brand-light/60">Held</div>
                          <div className="text-lg font-bold text-brand-light">{sub.held}</div>
                        </div>
                        <div className="bg-brand-darker p-3 border-2 border-brand-900 rounded text-center">
                          <div className="text-xs text-[#10B981]">Attended</div>
                          <div className="text-lg font-bold text-[#10B981]">{sub.attended}</div>
                        </div>
                      </div>

                      <div className="w-full h-40 border-2 border-brand-900 bg-brand-darker rounded p-2 pt-6 shadow-neo-sm relative">
                        <h4 className="absolute top-2 left-3 text-xs font-bold text-brand-light/50">Cumulative %</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={
                            (() => {
                              let tAtt = 0; let tHeld = 0;
                              const d = sub.logs.sort((a: any, b: any)=>a.log_date.localeCompare(b.log_date)).filter((x: any)=>x.status!=='cancelled').map((log: any, i: number) => {
                                tHeld += 1
                                if(log.status === 'present') tAtt += 1
                                return { index: i+1, percent: Math.round((tAtt/tHeld)*100) }
                              })
                              return d.length ? d : [{index:0,percent:0}]
                            })()
                          }>
                            <YAxis domain={[0, 100]} stroke="#ffffff55" fontSize={10} tickCount={5} />
                            <Tooltip contentStyle={{backgroundColor:'#000', border:'2px solid #fff'}} itemStyle={{color:'#fff'}} />
                            <Line type="stepAfter" dataKey="percent" stroke="#E8342B" strokeWidth={3} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
         {/* Labs Summary */}
            <div className="w-full bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 flex flex-col">
              <h2 className="text-xl font-bold text-brand-light mb-4">Labs Summary</h2>
              <div className="flex flex-col gap-4">
                {labStats.map(lab => (
                  <div key={lab.id} className="bg-brand-darker border-2 border-brand-900 rounded p-4 text-center">
                    <div className="font-bold text-brand-light mb-1">{lab.name}</div>
                    <div className="text-2xl font-black text-brand-light">{lab.attended}</div>
                    <div className="text-brand-light/50 text-xs">Attended</div>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          {/* Timetable Grid */}
          <div className="w-full bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-brand-light">Timetable</h2>
              <button onClick={() => setShowSetup(true)} className="flex items-center gap-2 text-sm font-bold bg-brand-darker px-3 py-1.5 rounded border-2 border-brand-900 hover:text-brand-light text-brand-light/70 shadow-neo active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"><Settings size={16}/> Edit Setup</button>
            </div>
            
            <table className="w-full border-collapse border-2 border-brand-900 min-w-[600px]">
              <thead>
                <tr>
                  <th className="border-2 border-brand-900 p-2 bg-brand-darker text-brand-light/70 w-24">Day</th>
                  {uniqueTimes.map(t => (
                    <th key={t} className="border-2 border-brand-900 p-2 bg-brand-darker text-brand-light font-bold text-sm">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridDays.map(day => {
                  const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]
                  const isToday = day === new Date().getDay()
                  return (
                    <tr key={day} className={`${isToday ? 'bg-brand-500/10 today-glow font-bold' : 'bg-brand-dark'}`}>
                      <td className="border-2 border-brand-900 p-3 text-center text-brand-light">{dayName}</td>
                      {uniqueTimes.map(time => {
                        const slot = timetableSlots.find(s => s.day_of_week === day && s.start_time.slice(0,5) === time)
                        const name = slot ? (slot.subject_id ? subjects.find(s=>s.id===slot.subject_id)?.name : labs.find(l=>l.id===slot.lab_id)?.name) : ''
                        return (
                          <td key={time} className="border-2 border-brand-900 p-2 text-center text-sm text-brand-light/90">
                            {name || '-'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Calendar Box */}
            <div className="w-full bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-brand-light">Calendar</h2>
                <div className="text-brand-light/70 font-semibold">{new Date().toLocaleDateString('en-US', {month:'long', year:'numeric'})}</div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-2">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <div key={d} className="font-bold text-brand-light/50 text-xs sm:text-sm py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {emptyCells.map(i => <div key={`empty-${i}`} className="p-2 sm:p-4" />)}
                {monthDays.map(d => {
                  const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                  const eventsForDate = calendarEvents.filter(e => e.event_date === dateStr)
                  const isToday = d === new Date().getDate()
                  return (
                    <button 
                      key={d}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`relative p-3 sm:p-6 text-lg border-2 rounded transition-colors active:translate-y-[1px]
                        ${isToday ? 'border-brand-500 text-brand-500 font-bold bg-brand-500/10 today-glow' : 'border-brand-900 text-brand-light bg-brand-darker hover:bg-brand-900/50'}
                      `}
                    >
                      <span>{d}</span>
                      {eventsForDate.length > 0 && (
                        <div className="absolute top-1 right-1 flex gap-0.5">
                          {eventsForDate.slice(0,3).map((e, idx) => (
                            <div key={idx} className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color || '#F59E0B' }}></div>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
        </div>
      </div>

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-dark rounded-xl w-full max-w-2xl overflow-hidden border-2 border-brand-900 shadow-neo flex flex-col max-h-[90vh]">
            <div className="p-4 border-b-2 border-brand-900 flex justify-between items-center bg-brand-darker/50 shadow-neo-input">
              <h3 className="font-bold text-brand-light text-lg">Setup Timetable</h3>
              <button onClick={() => setShowSetup(false)} className="text-brand-light/50 hover:text-brand-light"><X size={20}/></button>
            </div>
            <div className="flex border-b-2 border-brand-900">
              <button onClick={()=>setSetupTab('subjects')} className={`flex-1 p-3 font-bold ${setupTab==='subjects'?'bg-brand-500 text-brand-light':'text-brand-light/50 hover:bg-brand-darker'}`}>Subjects & Labs</button>
              <button onClick={()=>setSetupTab('timetable')} className={`flex-1 p-3 font-bold border-l-2 border-brand-900 ${setupTab==='timetable'?'bg-brand-500 text-brand-light':'text-brand-light/50 hover:bg-brand-darker'}`}>Manage Timetable</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {setupTab === 'subjects' && (
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-6">
                    <h4 className="font-bold text-brand-light border-b-2 border-brand-900 pb-2">Subjects</h4>
                    <form onSubmit={handleAddSubject} className="flex gap-3">
                      <input required type="text" placeholder="New Subject Name" value={newSubName} onChange={e=>setNewSubName(e.target.value)} className="flex-1 px-3 py-2 bg-brand-darker border-2 border-brand-900 rounded text-brand-light outline-none focus:border-brand-500 shadow-neo-input" />
                      <button type="submit" className="font-bold px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm flex items-center gap-2"><Plus size={18}/> Add</button>
                    </form>
                    <div className="flex flex-col gap-2">
                      {subjects.map(s => (
                        <div key={s.id} className="flex justify-between items-center p-3 bg-brand-darker border-2 border-brand-900 rounded">
                          <span className="font-bold text-brand-light">{s.name}</span>
                          <button onClick={()=>deleteSubject(s.id)} className="text-brand-500 hover:text-red-400 p-1"><Trash size={18}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <h4 className="font-bold text-brand-light border-b-2 border-brand-900 pb-2">Labs</h4>
                    <form onSubmit={handleAddLab} className="flex gap-3">
                      <input required type="text" placeholder="New Lab Name" value={newLabName} onChange={e=>setNewLabName(e.target.value)} className="flex-1 px-3 py-2 bg-brand-darker border-2 border-brand-900 rounded text-brand-light outline-none focus:border-brand-500 shadow-neo-input" />
                      <button type="submit" className="font-bold px-4 py-2 bg-brand-500 hover:bg-brand-700 text-white rounded border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm flex items-center gap-2"><Plus size={18}/> Add</button>
                    </form>
                    <div className="flex flex-col gap-2">
                      {labs.map(l => (
                        <div key={l.id} className="flex justify-between items-center p-3 bg-brand-darker border-2 border-brand-900 rounded">
                          <span className="font-bold text-brand-light">{l.name}</span>
                          <button onClick={()=>deleteLab(l.id)} className="text-brand-500 hover:text-red-400 p-1"><Trash size={18}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {setupTab === 'timetable' && (
                <div className="flex flex-col gap-6">
                  <form onSubmit={handleAddSlot} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                    <div className="flex flex-col">
                      <label className="text-xs text-brand-light/70 mb-1 font-bold">Day</label>
                      <select value={newSlotDay} onChange={e=>setNewSlotDay(Number(e.target.value))} className="w-full px-2 py-2 bg-brand-darker border-2 border-brand-900 rounded text-brand-light outline-none shadow-neo-input text-sm">
                        {[1,2,3,4,5,6].map(d => <option key={d} value={d}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-brand-light/70 mb-1 font-bold">Start</label>
                      <input type="time" value={newSlotStart} onChange={e=>setNewSlotStart(e.target.value)} className="w-full px-2 py-2 bg-brand-darker border-2 border-brand-900 rounded text-brand-light outline-none shadow-neo-input text-sm" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-brand-light/70 mb-1 font-bold">End</label>
                      <input type="time" value={newSlotEnd} onChange={e=>setNewSlotEnd(e.target.value)} className="w-full px-2 py-2 bg-brand-darker border-2 border-brand-900 rounded text-brand-light outline-none shadow-neo-input text-sm" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-brand-light/70 mb-1 font-bold">Class / Lab</label>
                      <select value={newSlotItem} onChange={e=>setNewSlotItem(e.target.value)} className="w-full px-2 py-2 bg-brand-darker border-2 border-brand-900 rounded text-brand-light outline-none shadow-neo-input text-sm">
                        <option value="">Select...</option>
                        <optgroup label="Subjects">
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </optgroup>
                        <optgroup label="Labs">
                          {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </optgroup>
                      </select>
                    </div>
                    <button type="submit" disabled={!newSlotItem} className="font-bold px-3 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm disabled:opacity-50 h-full">Add</button>
                  </form>
                  
                  <div className="flex flex-col gap-2">
                    {timetableSlots.sort((a,b)=>a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)).map(s => {
                      const name = s.subject_id ? subjects.find(sub=>sub.id===s.subject_id)?.name : labs.find(l=>l.id===s.lab_id)?.name
                      const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][s.day_of_week]
                      return (
                        <div key={s.id} className="flex justify-between items-center p-3 bg-brand-darker border-2 border-brand-900 rounded text-sm">
                          <span className="font-bold text-brand-light w-16">{dayName}</span>
                          <span className="text-brand-light/70 w-24">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</span>
                          <span className="font-medium text-brand-light flex-1 truncate px-2">{name}</span>
                          <button onClick={()=>deleteTimetableSlot(s.id)} className="text-brand-500 hover:text-red-400 p-1"><Trash size={16}/></button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Event Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-dark rounded-xl w-full max-w-md overflow-hidden border-2 border-brand-900 shadow-neo">
            <div className="p-4 border-b-2 border-brand-900 flex justify-between items-center bg-brand-darker/50 shadow-neo-input">
              <h3 className="font-bold text-brand-light text-lg">Events for {selectedDate}</h3>
              <button onClick={() => setSelectedDate(null)} className="text-brand-light/50 hover:text-brand-light"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-3 mb-6">
                {calendarEvents.filter(e => e.event_date === selectedDate).map(e => (
                  <div key={e.id} className="bg-brand-darker border-2 border-brand-900 rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {e.color && <div className="w-3 h-3 rounded-full" style={{backgroundColor: e.color}}></div>}
                      <span className="text-xs font-bold text-brand-light/70 uppercase">{e.tag || 'Event'}</span>
                    </div>
                    <div className="font-bold text-brand-light">{e.title}</div>
                    {e.notes && <div className="text-sm text-brand-light/70 mt-1">{e.notes}</div>}
                  </div>
                ))}
                {calendarEvents.filter(e => e.event_date === selectedDate).length === 0 && (
                  <div className="text-brand-light/50 text-sm italic">No events.</div>
                )}
              </div>
              <form onSubmit={handleSaveEvent} className="border-t-2 border-brand-900 pt-6 space-y-4">
                <h4 className="font-bold text-brand-light">Add Event</h4>
                
                <div className="flex gap-2 flex-wrap">
                  {EVENT_TAGS.map(t => (
                    <button type="button" key={t.label} onClick={()=>setEventTag(t.label)} className={`px-3 py-1 rounded text-xs font-bold border-2 transition-all ${eventTag===t.label ? 'shadow-neo-sm opacity-100' : 'opacity-50 hover:opacity-80 border-transparent bg-brand-darker text-brand-light'}`} style={eventTag===t.label ? {borderColor: t.color, color: t.color, backgroundColor: t.color+'20'} : {}}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <input required type="text" placeholder="Title" value={eventTitle} onChange={e=>setEventTitle(e.target.value)} className="w-full px-3 py-2 bg-brand-darker border-2 border-brand-900 rounded text-brand-light outline-none focus:border-brand-500 shadow-neo-input" />
                <textarea placeholder="Notes (optional)" value={eventNotes} onChange={e=>setEventNotes(e.target.value)} className="w-full px-3 py-2 bg-brand-darker border-2 border-brand-900 rounded text-brand-light outline-none focus:border-brand-500 shadow-neo-input min-h-[80px]" />
                <button type="submit" className="w-full font-bold px-4 py-2 bg-brand-500 text-brand-light hover:bg-brand-700 rounded border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm">Save Event</button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
