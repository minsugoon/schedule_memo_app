'use client';

import { useState, useEffect } from 'react';
import type { ScheduleItem, TabKey } from '@/lib/types';
import { parseDate } from '@/lib/dateUtils';
import AppHeader from './AppHeader';
import TabBar from './TabBar';
import InputSection from './InputSection';
import ItemList from './ItemList';

export default function ScheduleApp() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [currentTab, setCurrentTab] = useState<TabKey>('personal');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('schedule_memo_v2');
    if (raw) {
      try { setItems(JSON.parse(raw) as ScheduleItem[]); } catch { /* 무시 */ }
    }
    const tab = localStorage.getItem('memo_tab');
    if (tab === 'all' || tab === 'personal' || tab === 'work') setCurrentTab(tab);
    const t = document.documentElement.getAttribute('data-theme');
    setTheme(t === 'dark' ? 'dark' : 'light');
    setHydrated(true);
  }, []);

  const save = (newItems: ScheduleItem[]) => {
    setItems(newItems);
    localStorage.setItem('schedule_memo_v2', JSON.stringify(newItems));
  };

  const handleAddItem = (dateRaw: string, dateEndRaw: string, memo: string) => {
    const cat: 'personal' | 'work' = currentTab === 'all' ? 'personal' : currentTab;
    const parsed = parseDate(dateRaw);
    const parsedEnd = parseDate(dateEndRaw);
    const newItem: ScheduleItem = {
      id: Date.now(),
      date: parsed,
      dateRaw,
      dateEnd: parsedEnd || null,
      dateEndRaw: dateEndRaw || '',
      memo,
      done: false,
      createdAt: Date.now(),
      category: cat,
    };
    save([...items, newItem]);
  };

  const handleToggleDone = (id: number) => {
    const updated = items.map(i => i.id === id ? { ...i, done: !i.done } : i);
    save(updated);
  };

  const handleDelete = (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    save(items.filter(i => i.id !== id));
    setExpandedId(null);
  };

  const handleStartEdit = (id: number) => {
    setEditingId(id);
    setExpandedId(id);
  };

  const handleSaveEdit = (id: number, dateRaw: string, dateEndRaw: string, memo: string) => {
    const updated = items.map(i => {
      if (i.id !== id) return i;
      return {
        ...i,
        dateRaw,
        date: parseDate(dateRaw) || i.date,
        dateEndRaw,
        dateEnd: parseDate(dateEndRaw) || null,
        memo,
      };
    });
    save(updated);
    setEditingId(null);
  };

  const handleToggleExpand = (id: number) => {
    if (editingId === id) { setEditingId(null); return; }
    setExpandedId(prev => prev === id ? null : id);
    setEditingId(null);
  };

  const handleSwitchTab = (tab: TabKey) => {
    setCurrentTab(tab);
    localStorage.setItem('memo_tab', tab);
    setExpandedId(null);
    setEditingId(null);
  };

  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('memo_theme', next);
    setTheme(next);
  };

  if (!hydrated) return <div id="app" />;

  return (
    <div id="app">
      <h2 className="sr-only">할 일 메모장</h2>
      <AppHeader theme={theme} onToggleTheme={handleToggleTheme} />
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
  );
}
