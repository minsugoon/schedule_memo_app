'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type DbSchedule = {
  id: string
  user_id: string
  tab_id: string | null
  started_at: string
  ended_at: string | null
  is_all_day: boolean
  date_raw: string
  memo: string
  is_done: boolean
  created_at: string
}

type AddScheduleInput = {
  tab_id: string | null
  started_at: string
  ended_at?: string | null
  is_all_day?: boolean
  date_raw: string
  memo: string
}

type UpdateScheduleInput = {
  tab_id?: string | null
  started_at?: string
  ended_at?: string | null
  is_all_day?: boolean
  date_raw?: string
  memo?: string
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<DbSchedule[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('started_at', { ascending: true, nullsFirst: false })

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('schedules fetch error:', error.message)
      }
      setLoading(false)
      return
    }
    setSchedules((data as DbSchedule[]) ?? [])
    setLoading(false)
  }, [])

  const addSchedule = useCallback(async (input: AddScheduleInput) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const { error } = await supabase.from('schedules').insert({
      user_id: session.user.id,
      tab_id: input.tab_id,
      started_at: input.started_at,
      ended_at: input.ended_at ?? null,
      is_all_day: input.is_all_day ?? true,
      date_raw: input.date_raw,
      memo: input.memo,
      is_done: false,
    })
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('schedule insert error:', error.message)
      }
      return false
    }
    await fetchSchedules()
    return true
  }, [fetchSchedules])

  const updateSchedule = useCallback(async (id: string, input: UpdateScheduleInput) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('schedules')
      .update(input)
      .eq('id', id)
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('schedule update error:', error.message)
      }
      return false
    }
    await fetchSchedules()
    return true
  }, [fetchSchedules])

  const deleteSchedule = useCallback(async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('schedule delete error:', error.message)
      }
      return false
    }
    setSchedules(prev => prev.filter(s => s.id !== id))
    return true
  }, [])

  const toggleDone = useCallback(async (id: string, currentValue: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('schedules')
      .update({ is_done: !currentValue })
      .eq('id', id)
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('schedule toggle error:', error.message)
      }
      return false
    }
    setSchedules(prev =>
      prev.map(s => s.id === id ? { ...s, is_done: !currentValue } : s)
    )
    return true
  }, [])

  return { schedules, loading, fetchSchedules, addSchedule, updateSchedule, deleteSchedule, toggleDone }
}
