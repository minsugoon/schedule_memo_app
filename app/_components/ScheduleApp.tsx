'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { ScheduleItem, ScheduleDate, TabKey, ViewMode } from '@/lib/types'
import { parseDate } from '@/lib/dateUtils'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSchedules, type DbSchedule } from '@/lib/hooks/useSchedules'
import { useTabs } from '@/lib/hooks/useTabs'
import AppHeader from './AppHeader'
import TabBar from './TabBar'
import InputSection from './InputSection'
import ItemList from './ItemList'
import MemoView from './MemoView'
import PWAInstallModal from './PWAInstallModal'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function toISODate(d: ScheduleDate): string {
  return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}T00:00:00Z`
}

function isoToScheduleDate(iso: string | null): ScheduleDate | null {
  if (!iso) return null
  const d = new Date(iso)
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }
}

function isoToDateRaw(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function toScheduleItem(
  row: DbSchedule,
  tabCategoryMap: Record<string, 'personal' | 'work'>
): ScheduleItem {
  return {
    id: new Date(row.created_at).getTime(),
    date: parseDate(row.date_raw),
    dateRaw: row.date_raw,
    dateEnd: isoToScheduleDate(row.ended_at),
    dateEndRaw: isoToDateRaw(row.ended_at),
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
  const [viewMode, setViewMode] = useState<ViewMode>('tabs')
  const [showDone, setShowDone] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [hydrated, setHydrated] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('memo_theme')
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      setTheme('dark')
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      localStorage.removeItem('pwa_installed')
      deferredPrompt.current = e as BeforeInstallPromptEvent
    }

    const handleAppInstalled = () => {
      localStorage.setItem('pwa_installed', 'true')
      deferredPrompt.current = null
      setShowInstallModal(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    if (localStorage.getItem('pwa_installed') === 'true') {
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }

    const timer = setTimeout(() => {
      if (deferredPrompt.current && localStorage.getItem('pwa_installed') !== 'true') {
        setShowInstallModal(true)
      }
    }, 30000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
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
    const hasDate = dateRaw.trim() !== ''
    let tabId: string | null = null

    if (!hasDate) {
      tabId = null
    } else {
      const cat: 'personal' | 'work' = currentTab === 'all' ? 'personal' : currentTab
      tabId = cat === 'work' ? tabs[1]?.id ?? null : tabs[0]?.id ?? null
    }

    const parsed = parseDate(dateRaw)
    const parsedEnd = dateEndRaw ? parseDate(dateEndRaw) : null

    await addSchedule({
      tab_id: tabId,
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

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchTabs(), fetchSchedules()])
    setRefreshing(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleInstallPWA = async () => {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem('pwa_installed', 'true')
    }
    deferredPrompt.current = null
    setShowInstallModal(false)
  }

  if (!hydrated || authLoading) return <div id="app" />

  const memoItems = items.filter(i => i.date === null)

  return (
    <div id="app">
      <h2 className="sr-only">할 일 메모장</h2>
      <AppHeader
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSignOut={handleSignOut}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      <TabBar
        currentTab={currentTab}
        items={items}
        onSwitchTab={handleSwitchTab}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'tabs' ? 'memo' : 'tabs')}
        showDone={showDone}
        onToggleShowDone={() => setShowDone(prev => !prev)}
      />
      {viewMode === 'memo' ? (
        <MemoView
          items={memoItems}
          expandedId={expandedId}
          editingId={editingId}
          onToggleDone={handleToggleDone}
          onDelete={handleDelete}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onToggleExpand={handleToggleExpand}
          onAdd={(memo) => handleAddItem('', '', memo)}
        />
      ) : (
        <>
          <InputSection currentTab={currentTab} onAdd={handleAddItem} />
          <ItemList
            items={items}
            currentTab={currentTab}
            showDone={showDone}
            expandedId={expandedId}
            editingId={editingId}
            onToggleDone={handleToggleDone}
            onDelete={handleDelete}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onToggleExpand={handleToggleExpand}
          />
        </>
      )}
      {showInstallModal && (
        <PWAInstallModal
          onInstall={handleInstallPWA}
          onClose={() => setShowInstallModal(false)}
        />
      )}
    </div>
  )
}
