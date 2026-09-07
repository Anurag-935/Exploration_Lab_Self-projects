import React, { useState, useMemo } from 'react'
import { useAttendance, Subject, ClassLog } from '../hooks/useAttendance'
import AttendancePie from '../components/AttendancePie'
import { X, Check, Minus, Calendar as CalIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const getLocalYYYYMMDD = (dateInput?: string | Date) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Attendance() {
  const { subjects, labs, classLogs, timetableSlots, calendarEvents, loading, logAttendance, addCalendarEvent } = useAttendance()
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  
  const [eventTitle, setEventTitle] = useState('')
  const [eventNotes, setEventNotes] = useState('')

  const todayStr = useMemo(() => getLocalYYYYMMDD(), [])
  const todayDayOfWeek = new Date().getDay()

  const pendingDailyClasses = useMemo(() => {
    return timetableSlots.filter(slot => {
      if (slot.day_of_week !== todayDayOfWeek) return false
      // Has it been logged today?
      const alreadyLogged = classLogs.some(log => 
        log.log_date === todayStr && 
        ((slot.subject_id && log.subject_id === slot.subject_id) || (slot.lab_id && log.lab_id === slot.lab_id))
      )
      return !alreadyLogged
    })
  }, [timetableSlots, classLogs, todayStr, todayDayOfWeek])

  // Aggregate stats
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

  const totalAttended = subjectStats.reduce((sum, s) => sum + s.attended, 0)
  const totalMissed = subjectStats.reduce((sum, s) => sum + s.missed, 0)

  const handleLog = (slot: any, status: string) => {
    logAttendance(slot.subject_id || null, slot.lab_id || null, status, todayStr)
  }

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !eventTitle) return
    addCalendarEvent(selectedDate, eventTitle, eventNotes)
    setSelectedDate(null)
    setEventTitle('')
    setEventNotes('')
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-brand-light">Loading Attendance...</div>

  // Generate calendar grid
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingDayOfWeek = new Date(year, month, 1).getDay()
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyCells = Array.from({ length: startingDayOfWeek }, (_, i) => i)

  return (
    <div className="flex flex-col gap-6 w-full h-full pb-10">
      
      {/* Daily Prompt */}
      {pendingDailyClasses.length > 0 && (
        <div className="bg-brand-500/20 border-2 border-brand-500 shadow-neo rounded-xl p-6">
          <h2 className="text-xl font-bold text-brand-light mb-4">Log Today's Classes</h2>
          <div className="flex flex-col gap-3">
            {pendingDailyClasses.map(slot => {
              const name = slot.subject_id ? subjects.find(s=>s.id===slot.subject_id)?.name : labs.find(l=>l.id===slot.lab_id)?.name
              return (
                <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-brand-dark p-4 rounded border-2 border-brand-900 shadow-neo-sm">
                  <div className="mb-3 sm:mb-0">
                    <span className="font-bold text-brand-light text-lg">{name}</span>
                    <span className="text-brand-light/70 ml-3 text-sm">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}</span>
                  </div>
                  <div className="flex gap-2 font-bold">
                    <button onClick={() => handleLog(slot, 'present')} className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm transition-all"><Check size={18}/></button>
                    <button onClick={() => handleLog(slot, 'absent')} className="px-4 py-2 bg-brand-500 hover:bg-brand-700 text-white rounded border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm transition-all"><X size={18}/></button>
                    <button onClick={() => handleLog(slot, 'cancelled')} className="px-4 py-2 bg-brand-darker hover:bg-brand-900 text-brand-light/70 rounded border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm transition-all" title="Cancelled"><Minus size={18}/></button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <AttendancePie attended={totalAttended} missed={totalMissed} />

          {/* Subjects Bars */}
          <div className="bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 flex flex-col gap-4 flex-1">
            <h2 className="text-xl font-bold text-brand-light mb-2">Subjects</h2>
            {subjectStats.map(sub => {
              const bgColor = sub.percent >= 80 ? 'bg-[#10B981]/20 border-[#10B981]' : sub.percent >= 75 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-brand-500/20 border-brand-500'
              const textColor = sub.percent >= 80 ? 'text-[#10B981]' : sub.percent >= 75 ? 'text-yellow-500' : 'text-brand-500'
              
              return (
                <button 
                  key={sub.id} 
                  onClick={() => setSelectedSubject(sub)}
                  className={`w-full p-4 border-2 shadow-neo-sm rounded-lg flex flex-col items-start transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${bgColor}`}
                >
                  <div className="flex justify-between w-full mb-1">
                    <span className="font-bold text-brand-light text-left">{sub.name}</span>
                    <span className={`font-black ${textColor}`}>{sub.percent}%</span>
                  </div>
                  <span className="text-brand-light/60 text-xs text-left">Missable: {sub.missable} classes</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Timetable */}
            <div className="flex-1 bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6">
              <h2 className="text-xl font-bold text-brand-light mb-4">Timetable</h2>
              <div className="flex flex-col gap-2">
                {[1,2,3,4,5].map(day => {
                  const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]
                  const slots = timetableSlots.filter(t => t.day_of_week === day)
                  const isToday = day === todayDayOfWeek
                  return (
                    <div key={day} className={`p-3 border-2 rounded ${isToday ? 'border-brand-500 bg-brand-500/10 today-glow' : 'border-brand-900 bg-brand-darker'}`}>
                      <div className="font-bold text-brand-light mb-2">{dayName}</div>
                      {slots.length === 0 ? <span className="text-brand-light/30 text-sm">No classes</span> : (
                        <div className="flex flex-col gap-1">
                          {slots.map(s => (
                            <div key={s.id} className="text-sm text-brand-light/80 flex justify-between">
                              <span>{s.subject_id ? subjects.find(x=>x.id===s.subject_id)?.name : labs.find(x=>x.id===s.lab_id)?.name}</span>
                              <span className="text-brand-light/50">{s.start_time.slice(0,5)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Labs Summary */}
            <div className="xl:w-1/3 bg-brand-dark rounded-xl border-2 border-brand-900 shadow-neo p-6 flex flex-col">
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
                const hasEvent = calendarEvents.some(e => e.event_date === dateStr)
                const isToday = d === new Date().getDate()
                return (
                  <button 
                    key={d}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative p-2 sm:p-4 border-2 rounded transition-colors active:translate-y-[1px]
                      ${isToday ? 'border-brand-500 text-brand-500 font-bold bg-brand-500/10 today-glow' : 'border-brand-900 text-brand-light bg-brand-darker hover:bg-brand-900/50'}
                    `}
                  >
                    <span>{d}</span>
                    {hasEvent && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-500"></div>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Detail Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-dark rounded-xl w-full max-w-2xl overflow-hidden border-2 border-brand-900 shadow-neo flex flex-col max-h-[90vh]">
            <div className="p-4 border-b-2 border-brand-900 flex justify-between items-center bg-brand-darker/50 shadow-neo-input">
              <h3 className="font-bold text-brand-light text-lg">{selectedSubject.name} Detail</h3>
              <button onClick={() => setSelectedSubject(null)} className="text-brand-light/50 hover:text-brand-light"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-col gap-6 flex">
              <div className="grid grid-cols-3 gap-4 mb-2">
                <div className="bg-brand-darker p-4 border-2 border-brand-900 rounded text-center">
                  <div className="text-xs text-brand-light/60">Held</div>
                  <div className="text-xl font-bold text-brand-light">{selectedSubject.held}</div>
                </div>
                <div className="bg-[#10B981]/10 p-4 border-2 border-[#10B981] rounded text-center">
                  <div className="text-xs text-[#10B981]">Attended</div>
                  <div className="text-xl font-bold text-[#10B981]">{selectedSubject.attended}</div>
                </div>
                <div className="bg-brand-500/10 p-4 border-2 border-brand-500 rounded text-center">
                  <div className="text-xs text-brand-500">Missed</div>
                  <div className="text-xl font-bold text-brand-500">{selectedSubject.missed}</div>
                </div>
              </div>

              {/* Trend line (Simple fake trend by mapping logs cumulatively) */}
              <div className="w-full h-48 border-2 border-brand-900 bg-brand-darker rounded p-2 pt-6 shadow-neo-sm relative">
                <h4 className="absolute top-2 left-3 text-xs font-bold text-brand-light/50">Cumulative %</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={
                    (() => {
                      let tAtt = 0; let tHeld = 0;
                      const d = selectedSubject.logs.sort((a,b)=>a.log_date.localeCompare(b.log_date)).filter(x=>x.status!=='cancelled').map((log, i) => {
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

              <div>
                <h4 className="font-bold text-brand-light mb-3">Log History</h4>
                <div className="flex flex-col gap-2">
                  {selectedSubject.logs.sort((a,b)=>b.log_date.localeCompare(a.log_date)).map(log => (
                    <div key={log.id} className="flex justify-between items-center bg-brand-darker border-2 border-brand-900 rounded p-3">
                      <span className="font-medium text-brand-light">{log.log_date}</span>
                      <span className={`font-bold text-sm ${log.status === 'present' ? 'text-[#10B981]' : log.status === 'absent' ? 'text-brand-500' : 'text-brand-light/50'}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {selectedSubject.logs.length === 0 && <div className="text-brand-light/50 text-sm">No classes logged yet.</div>}
                </div>
              </div>

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
