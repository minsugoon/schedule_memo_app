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

  const fetchSchedules = useCallback(async (tabId?: string | null) => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('schedules')
      .select('*')
      .order('started_at', { ascending: true, nullsFirst: false })

    if (tabId !== undefined && tabId !== null) {
      query = query.eq('tab_id', tabId)
    }

    const { data, error } = await query
    if (error) {
      console.error('schedules fetch error:', error.message)
      setLoading(false)
      return
    }
    setSchedules((data as DbSchedule[]) ?? [])
    setLoading(false)
  }, [])

  const addSchedule = useCallback(async (input: AddScheduleInput) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

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
      console.error('schedule insert error:', error.message)
      return
    }
    await fetchSchedules()
  }, [fetchSchedules])

  const updateSchedule = useCallback(async (id: string, input: UpdateScheduleInput) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('schedules')
      .update(input)
      .eq('id', id)
    if (error) {
      console.error('schedule update error:', error.message)
      return
    }
    await fetchSchedules()
  }, [fetchSchedules])

  const deleteSchedule = useCallback(async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) {
      console.error('schedule delete error:', error.message)
      return
    }
    setSchedules(prev => prev.filter(s => s.id !== id))
  }, [])

  const toggleDone = useCallback(async (id: string, currentValue: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('schedules')
      .update({ is_done: !currentValue })
      .eq('id', id)
    if (error) {
      console.error('schedule toggle error:', error.message)
      return
    }
    setSchedules(prev =>
      prev.map(s => s.id === id ? { ...s, is_done: !currentValue } : s)
    )
  }, [])

  return { schedules, loading, fetchSchedules, addSchedule, updateSchedule, deleteSchedule, toggleDone }
}
