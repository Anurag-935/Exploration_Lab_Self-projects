import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type Subject = { id: string, name: string }
export type Lab = { id: string, name: string }
export type ClassLog = { id: string, subject_id?: string, lab_id?: string, log_date: string, status: 'present'|'absent'|'cancelled' }
export type TimetableSlot = { id: string, day_of_week: number, start_time: string, end_time: string, subject_id?: string, lab_id?: string }
export type CalendarEvent = { id: string, event_date: string, title: string, notes?: string }

export function useAttendance() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [labs, setLabs] = useState<Lab[]>([])
  const [classLogs, setClassLogs] = useState<ClassLog[]>([])
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    try {
      let { data: sData, error: sErr } = await supabase.from('subjects').select('*')
      if (sErr) throw sErr
      
      let { data: lData } = await supabase.from('labs').select('*')
      
      if (sData?.length === 0) {
        const seedSubjects = [1,2,3,4,5].map(i => ({ user_id: user.id, name: `Subject ${i}` }))
        await supabase.from('subjects').insert(seedSubjects)
        const res = await supabase.from('subjects').select('*')
        sData = res.data
      }
      if (lData?.length === 0) {
        const seedLabs = [1,2].map(i => ({ user_id: user.id, name: `Lab ${i}` }))
        await supabase.from('labs').insert(seedLabs)
        const res = await supabase.from('labs').select('*')
        lData = res.data
      }

      let { data: tData } = await supabase.from('timetable_slots').select('*').order('start_time')
      if (tData?.length === 0 && sData && sData.length >= 5) {
        const today = new Date().getDay()
        const seedSlots = [
          { user_id: user.id, day_of_week: today, start_time: "09:00", end_time: "10:00", subject_id: sData[0].id },
          { user_id: user.id, day_of_week: today, start_time: "10:00", end_time: "11:00", subject_id: sData[1].id },
          { user_id: user.id, day_of_week: today, start_time: "11:00", end_time: "12:00", subject_id: sData[2].id },
          { user_id: user.id, day_of_week: today, start_time: "13:00", end_time: "14:00", subject_id: sData[3].id },
          { user_id: user.id, day_of_week: today, start_time: "14:00", end_time: "15:00", subject_id: sData[4].id },
        ]
        await supabase.from('timetable_slots').insert(seedSlots)
        const res = await supabase.from('timetable_slots').select('*').order('start_time')
        tData = res.data
      }

      const { data: logsData } = await supabase.from('class_logs').select('*')
      const { data: calData } = await supabase.from('calendar_events').select('*')

      setSubjects(sData || [])
      setLabs(lData || [])
      setTimetableSlots(tData || [])
      setClassLogs(logsData || [])
      setCalendarEvents(calData || [])
    } catch (e) {
      console.error("Attendance tables might not exist yet.", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const logAttendance = async (subjectId: string | null, labId: string | null, status: string, logDate: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload: any = { user_id: user.id, log_date: logDate, status }
    if (subjectId) payload.subject_id = subjectId
    if (labId) payload.lab_id = labId
    await supabase.from('class_logs').insert(payload)
    fetchData()
  }
  
  const addCalendarEvent = async (eventDate: string, title: string, notes: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('calendar_events').insert({
      user_id: user.id,
      event_date: eventDate,
      title,
      notes
    })
    fetchData()
  }

  return { subjects, labs, classLogs, timetableSlots, calendarEvents, loading, refetch: fetchData, logAttendance, addCalendarEvent }
}
