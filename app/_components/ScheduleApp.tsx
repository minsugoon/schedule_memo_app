'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { ScheduleItem, ScheduleDate, TabKey } from '@/lib/types'
import { parseDate } from '@/lib/dateUtils'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSchedules, type DbSchedule } from '@/lib/hooks/useSchedules'
import { useTabs } from '@/lib/hooks/useTabs'
import AppHeader from './AppHeader'
import TabBar from './TabBar'
import InputSection from './InputSection'
import ItemList from './ItemList'

function toISODate(d: ScheduleDate): string {
  return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}T00:00:00Z`
}

function toScheduleItem(
  row: DbSchedule,
  tabCategoryMap: Record<string, 'personal' | 'work'>
): ScheduleItem {
  return {
    id: new Date(row.created_at).getTime(),
    date: parseDate(row.date_raw),
    dateRaw: row.date_raw,
    dateEnd: null,
    dateEndRaw: '',
    memo: row.memo,
    done: row.is_done,
    createdAt: new Date(row.created_at).getTime(),
    category: row.tab_id ? (tabCategoryMap[row.tab_id] ?? 'personal') : 'personal',
  }
}

export default function ScheduleApp() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const {
    schedules, fetchSchedules,
    addSchedule, updateSchedule, deleteSchedule, toggleDone,
  } = useSchedules()
  const { tabs, fetchTabs } = useTabs()

  const [currentTab, setCurrentTab] = useState<TabKey>('personal')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('memo_theme')
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      setTheme('dark')
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (user) {
      fetchTabs()
      fetchSchedules()
    }
  }, [user, fetchTabs, fetchSchedules])

  const tabCategoryMap = useMemo<Record<string, 'personal' | 'work'>>(() => {
    const map: Record<string, 'personal' | 'work'> = {}
    if (tabs[0]) map[tabs[0].id] = 'personal'
    if (tabs[1]) map[tabs[1].id] = 'work'
    return map
  }, [tabs])

  const items = useMemo<ScheduleItem[]>(
    () => schedules.map(row => toScheduleItem(row, tabCategoryMap)),
    [schedules, tabCategoryMap]
  )

  const findSchedule = (numericId: number) =>
    schedules.find(s => new Date(s.created_at).getTime() === numericId)

  const handleAddItem = async (dateRaw: string, dateEndRaw: string, memo: string) => {
    const cat: 'personal' | 'work' = currentTab === 'all' ? 'personal' : currentTab
    const tabId = cat === 'work' ? tabs[1]?.id : tabs[0]?.id
    const parsed = parseDate(dateRaw)
    const parsedEnd = dateEndRaw ? parseDate(dateEndRaw) : null

    await addSchedule({
      tab_id: tabId ?? null,
      started_at: parsed ? toISODate(parsed) : new Date().toISOString(),
      ended_at: parsedEnd ? toISODate(parsedEnd) : null,
      is_all_day: true,
      date_raw: dateRaw,
      memo,
    })
  }

  const handleToggleDone = async (id: number) => {
    const schedule = findSchedule(id)
    if (!schedule) return
    await toggleDone(schedule.id, schedule.is_done)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return
    const schedule = findSchedule(id)
    if (!schedule) return
    await deleteSchedule(schedule.id)
    setExpandedId(null)
  }

  const handleStartEdit = (id: number) => {
    setEditingId(id)
    setExpandedId(id)
  }

  const handleSaveEdit = async (id: number, dateRaw: string, dateEndRaw: string, memo: string) => {
    const schedule = findSchedule(id)
    if (!schedule) return
    const parsed = parseDate(dateRaw)
    const parsedEnd = dateEndRaw ? parseDate(dateEndRaw) : null

    await updateSchedule(schedule.id, {
      date_raw: dateRaw,
      memo,
      started_at: parsed ? toISODate(parsed) : undefined,
      ended_at: parsedEnd ? toISODate(parsedEnd) : null,
    })
    setEditingId(null)
  }

  const handleToggleExpand = (id: number) => {
    if (editingId === id) { setEditingId(null); return }
    setExpandedId(prev => prev === id ? null : id)
    setEditingId(null)
  }

  const handleSwitchTab = (tab: TabKey) => {
    setCurrentTab(tab)
    setExpandedId(null)
    setEditingId(null)
  }

  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('memo_theme', next)
    setTheme(next)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (!hydrated || authLoading) return <div id="app" />

  return (
    <div id="app">
      <h2 className="sr-only">할 일 메모장</h2>
      <AppHeader theme={theme} onToggleTheme={handleToggleTheme} onSignOut={handleSignOut} />
      <TabBar currentTab={currentTab} items={items} onSwitchTab={handleSwitchTab} />
      <InputSection currentTab={currentTab} onAdd={handleAddItem} />
      <ItemList
        items={items}
        currentTab={currentTab}
        expandedId={expandedId}
        editingId={editingId}
        onToggleDone={handleToggleDone}
        onDelete={handleDelete}
        onStartEdit={handleStartEdit}
        onSaveEdit={handleSaveEdit}
        onToggleExpand={handleToggleExpand}
      />
    </div>
  )
}
