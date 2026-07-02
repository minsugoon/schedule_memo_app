'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { ScheduleItem, ScheduleDate, TabKey, ViewMode } from '@/lib/types'
import { parseDate, fmtShort, parseTime, timeToISO } from '@/lib/dateUtils'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSchedules, type DbSchedule } from '@/lib/hooks/useSchedules'
import { useTabs } from '@/lib/hooks/useTabs'
import AppHeader from './AppHeader'
import TabBar from './TabBar'
import InputSection from './InputSection'
import ItemList from './ItemList'
import MemoView from './MemoView'
import PWAInstallModal from './PWAInstallModal'
import TabMoveModal from './TabMoveModal'
import HelpModal from './HelpModal'
import PatchNoteModal from './PatchNoteModal'

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
  tabCategoryMap: Record<string, 'personal' | 'work' | 'memo'>
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
    category: row.tab_id && tabCategoryMap[row.tab_id] === 'work' ? 'work' : 'personal',
    startedAt: row.started_at,
    endedAt: row.ended_at,
    isAllDay: row.is_all_day,
    tabId: row.tab_id,
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
  const [showPatchNote, setShowPatchNote] = useState(false)
  const [helpType, setHelpType] = useState<'date' | 'time' | null>(null)
  const [tabMoveTarget, setTabMoveTarget] = useState<{
    id: number
    dateRaw: string
    dateEndRaw: string
    memo: string
  } | null>(null)
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

  useEffect(() => {
    if (!hydrated) return
    const key = 'patch_seen_20260702'
    if (!localStorage.getItem(key)) {
      setShowPatchNote(true)
    }
  }, [hydrated])

  const tabCategoryMap = useMemo<Record<string, 'personal' | 'work' | 'memo'>>(() => {
    const map: Record<string, 'personal' | 'work' | 'memo'> = {}
    const personalTab = tabs.find(t => t.name === '개인')
    const workTab = tabs.find(t => t.name === '회사')
    const memoTab = tabs.find(t => t.name === '메모')
    if (personalTab) map[personalTab.id] = 'personal'
    if (workTab) map[workTab.id] = 'work'
    if (memoTab) map[memoTab.id] = 'memo'
    return map
  }, [tabs])

  const items = useMemo<ScheduleItem[]>(
    () => schedules.map(row => toScheduleItem(row, tabCategoryMap)),
    [schedules, tabCategoryMap]
  )

  const moveTargetTabs = useMemo(
    () => tabs
      .filter(t => t.name === '개인' || t.name === '회사')
      .map(t => ({ id: t.id, name: t.name })),
    [tabs]
  )

  const availableTabs = useMemo(
    () => tabs.filter(t => t.name !== '메모' && t.name !== '전체'),
    [tabs]
  )

  const findSchedule = (numericId: number) =>
    schedules.find(s => new Date(s.created_at).getTime() === numericId)

  const handleAddItem = async (
    dateRaw: string,
    timeRaw: string,
    dateEndRaw: string,
    timeEndRaw: string,
    memo: string
  ) => {
    const hasDate = dateRaw.trim() !== ''
    let tabId: string | null = null

    if (!hasDate) {
      tabId = null
    } else {
      const cat: 'personal' | 'work' = currentTab === 'all' ? 'personal' : currentTab
      tabId = cat === 'work'
        ? tabs.find(t => t.name === '회사')?.id ?? null
        : tabs.find(t => t.name === '개인')?.id ?? null
    }

    const parsed = parseDate(dateRaw)
    const parsedEnd = dateEndRaw ? parseDate(dateEndRaw) : null

    const parsedTime = timeRaw.trim() ? parseTime(timeRaw) : null
    const parsedEndTime = timeEndRaw.trim() ? parseTime(timeEndRaw) : null

    const startedAt = parsed
      ? (parsedTime
          ? timeToISO(parsed, parsedTime.h, parsedTime.m)
          : toISODate(parsed))
      : new Date().toISOString()

    const endedAt = parsedEnd
      ? (parsedEndTime
          ? timeToISO(parsedEnd, parsedEndTime.h, parsedEndTime.m)
          : toISODate(parsedEnd))
      : null

    await addSchedule({
      tab_id: tabId,
      started_at: startedAt,
      ended_at: endedAt,
      is_all_day: !parsedTime,
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

  const handleSaveEdit = async (id: number, dateRaw: string, dateEndRaw: string, memo: string, tabId: string) => {
    const schedule = findSchedule(id)
    if (!schedule) return

    const parsed = parseDate(dateRaw)
    const parsedEnd = dateEndRaw ? parseDate(dateEndRaw) : null

    await updateSchedule(schedule.id, {
      tab_id: tabId,
      date_raw: dateRaw,
      memo,
      started_at: parsed ? toISODate(parsed) : undefined,
      ended_at: parsedEnd ? toISODate(parsedEnd) : null,
    })
    setEditingId(null)
    setExpandedId(null)
  }

  const handleSaveEditWithTime = async (
    id: number,
    dateRaw: string,
    timeRaw: string,
    dateEndRaw: string,
    timeEndRaw: string,
    memo: string,
    tabId: string
  ) => {
    const schedule = findSchedule(id)
    if (!schedule) return

    const parsed = parseDate(dateRaw)
    const parsedEnd = dateEndRaw.trim() ? parseDate(dateEndRaw) : null
    const parsedTime = timeRaw.trim() ? parseTime(timeRaw) : null
    const parsedEndTime = timeEndRaw.trim() ? parseTime(timeEndRaw) : null

    const startedAt = parsed
      ? (parsedTime ? timeToISO(parsed, parsedTime.h, parsedTime.m) : toISODate(parsed))
      : undefined

    const endedAt = parsedEnd
      ? (parsedEndTime ? timeToISO(parsedEnd, parsedEndTime.h, parsedEndTime.m) : toISODate(parsedEnd))
      : null

    await updateSchedule(schedule.id, {
      tab_id: tabId,
      date_raw: dateRaw,
      memo,
      started_at: startedAt,
      ended_at: endedAt,
      is_all_day: !parsedTime,
    })
    setEditingId(null)
    setExpandedId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setExpandedId(null)
  }

  const handleTabMoveSelect = async (tabId: string) => {
    if (!tabMoveTarget) return
    const schedule = findSchedule(tabMoveTarget.id)
    if (!schedule) { setTabMoveTarget(null); return }

    const parsed = parseDate(tabMoveTarget.dateRaw)
    const parsedEnd = tabMoveTarget.dateEndRaw ? parseDate(tabMoveTarget.dateEndRaw) : null

    await updateSchedule(schedule.id, {
      tab_id: tabId,
      date_raw: tabMoveTarget.dateRaw,
      memo: tabMoveTarget.memo,
      started_at: parsed ? toISODate(parsed) : undefined,
      ended_at: parsedEnd ? toISODate(parsedEnd) : null,
    })

    setTabMoveTarget(null)
    setEditingId(null)
  }

  const handleTabMoveCancel = () => {
    setTabMoveTarget(null)
  }

  const handleToggleExpand = (id: number) => {
    if (editingId === id) { setEditingId(null); return }
    setExpandedId(prev => prev === id ? null : id)
    setEditingId(null)
  }

  const handleSwitchTab = (tab: TabKey) => {
    setCurrentTab(tab)
    setViewMode('tabs')
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

  const handleClosePatchNote = () => {
    localStorage.setItem('patch_seen_20260702', 'true')
    setShowPatchNote(false)
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

      {/* 패치 노트 모달 — 최우선 z-index */}
      {showPatchNote && (
        <PatchNoteModal
          isOpen={showPatchNote}
          onClose={handleClosePatchNote}
        />
      )}

      {helpType !== null && (
        <HelpModal
          type={helpType}
          onClose={() => setHelpType(null)}
        />
      )}
      <TabMoveModal
        isOpen={tabMoveTarget !== null}
        memo={tabMoveTarget?.memo ?? ''}
        dateText={tabMoveTarget ? (fmtShort(parseDate(tabMoveTarget.dateRaw))?.text ?? tabMoveTarget.dateRaw) : ''}
        tabs={moveTargetTabs}
        onSelect={handleTabMoveSelect}
        onCancel={handleTabMoveCancel}
      />
      <AppHeader
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSignOut={handleSignOut}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      <TabBar
        tabs={tabs}
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
          availableTabs={availableTabs}
          onToggleDone={handleToggleDone}
          onDelete={handleDelete}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onSaveEditWithTime={handleSaveEditWithTime}
          onCancelEdit={handleCancelEdit}
          onToggleExpand={handleToggleExpand}
          onAdd={(memo) => handleAddItem('', '', '', '', memo)}
        />
      ) : (
        <>
          <InputSection
            currentTab={currentTab}
            onAdd={handleAddItem}
            onHelp={(type) => setHelpType(type)}
          />
          <ItemList
            items={items}
            currentTab={currentTab}
            showDone={showDone}
            expandedId={expandedId}
            editingId={editingId}
            availableTabs={availableTabs}
            onToggleDone={handleToggleDone}
            onDelete={handleDelete}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onSaveEditWithTime={handleSaveEditWithTime}
            onCancelEdit={handleCancelEdit}
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
