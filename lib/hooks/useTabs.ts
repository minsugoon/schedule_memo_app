'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type DbTab = {
  id: string
  user_id: string
  name: string
  sort_order: number
  is_default: boolean
}

export function useTabs() {
  const [tabs, setTabs] = useState<DbTab[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTabs = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tabs')
      .select('id, user_id, name, sort_order, is_default')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('tabs fetch error:', error.message)
      setLoading(false)
      return
    }
    setTabs((data as DbTab[]) ?? [])
    setLoading(false)
  }, [])

  const addTab = useCallback(async (name: string, language = 'ko') => {
    if (tabs.length >= 10) return
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: newTab, error: tabError } = await supabase
      .from('tabs')
      .insert({ user_id: session.user.id, sort_order: tabs.length, is_default: false })
      .select('id')
      .single()

    if (tabError || !newTab) {
      console.error('tab insert error:', tabError?.message)
      return
    }

    const { error: labelError } = await supabase
      .from('tab_labels')
      .insert({ tab_id: newTab.id, name, language })

    if (labelError) {
      console.error('tab_label insert error:', labelError.message)
    }

    await fetchTabs()
  }, [tabs.length, fetchTabs])

  const deleteTab = useCallback(async (id: string) => {
    const tab = tabs.find(t => t.id === id)
    if (!tab || tab.is_default) return

    const supabase = createClient()
    const { error } = await supabase.from('tabs').delete().eq('id', id)
    if (error) {
      console.error('tab delete error:', error.message)
      return
    }
    await fetchTabs()
  }, [tabs, fetchTabs])

  const updateTabOrder = useCallback(async (orderedIds: string[]) => {
    const supabase = createClient()
    const updates = orderedIds.map((id, index) => ({ id, sort_order: index }))
    const { error } = await supabase.from('tabs').upsert(updates)
    if (error) {
      console.error('tab order update error:', error.message)
      return
    }
    await fetchTabs()
  }, [fetchTabs])

  return { tabs, loading, fetchTabs, addTab, deleteTab, updateTabOrder }
}
