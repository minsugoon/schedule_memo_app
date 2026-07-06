'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type DbTab = {
  id: string
  user_id: string
  name: string
  color: string | null
  icon: string | null
  sort_order: number
  is_default: boolean
  tab_type: 'all' | 'personal' | 'work' | 'memo' | null
  created_at: string
}

const MAX_TABS = 5
const MAX_NAME_LENGTH = 2

export function useTabs() {
  const [tabs, setTabs] = useState<DbTab[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTabs = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tabs')
      .select('id, user_id, name, color, icon, sort_order, is_default, tab_type, created_at')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('tabs fetch error:', error.message)
      setLoading(false)
      return
    }
    setTabs((data as DbTab[]) ?? [])
    setLoading(false)
  }, [])

  const addTab = useCallback(async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return false
    if ([...trimmed].length > MAX_NAME_LENGTH) {
      alert('탭 이름은 2글자 이내로 입력해주세요.')
      return false
    }
    if (tabs.length >= MAX_TABS) {
      alert('탭은 최대 5개까지 만들 수 있습니다.')
      return false
    }
    if (tabs.some(t => t.name === trimmed)) {
      alert('이미 같은 이름의 탭이 있습니다.')
      return false
    }

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const newSortOrder = tabs.reduce((max, t) => Math.max(max, t.sort_order), 0) + 1

    const { data, error } = await supabase
      .from('tabs')
      .insert({
        user_id: session.user.id,
        name: trimmed,
        sort_order: newSortOrder,
        is_default: false,
        tab_type: null,
      })
      .select('id, user_id, name, color, icon, sort_order, is_default, tab_type, created_at')
      .single()

    if (error || !data) {
      console.error('tab insert error:', error?.message)
      return false
    }

    setTabs(prev => [...prev, data as DbTab].sort((a, b) => a.sort_order - b.sort_order))
    return true
  }, [tabs])

  const updateTabName = useCallback(async (tabId: string, newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed) return false
    if ([...trimmed].length > MAX_NAME_LENGTH) {
      alert('탭 이름은 2글자 이내로 입력해주세요.')
      return false
    }
    if (tabs.some(t => t.name === trimmed && t.id !== tabId)) {
      alert('이미 같은 이름의 탭이 있습니다.')
      return false
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('tabs')
      .update({ name: trimmed })
      .eq('id', tabId)

    if (error) {
      console.error('tab name update error:', error.message)
      return false
    }
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, name: trimmed } : t))
    return true
  }, [tabs])

  const deleteTab = useCallback(async (id: string) => {
    const tab = tabs.find(t => t.id === id)
    if (!tab || tab.is_default) return false

    const supabase = createClient()
    const { error } = await supabase.from('tabs').delete().eq('id', id)
    if (error) {
      console.error('tab delete error:', error.message)
      return false
    }
    setTabs(prev => prev.filter(t => t.id !== id))
    return true
  }, [tabs])

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

  return { tabs, loading, fetchTabs, addTab, updateTabName, deleteTab, updateTabOrder }
}
