'use client';

import { useMemo } from 'react';
import { IconNotebook } from '@tabler/icons-react';
import type { ScheduleItem, TabKey } from '@/lib/types';
import { sortItems } from '@/lib/dateUtils';
import ItemCard from './ItemCard';

interface ItemListProps {
  items: ScheduleItem[];
  currentTab: TabKey;
  showDone: boolean;
  expandedId: number | null;
  editingId: number | null;
  availableTabs: Array<{ id: string; name: string; color: string | null }>;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
  onStartEdit: (id: number) => void;
  onSaveEdit: (id: number, dateRaw: string, dateEndRaw: string, memo: string, tabId: string) => void;
  onSaveEditWithTime: (
    id: number,
    dateRaw: string,
    timeRaw: string,
    dateEndRaw: string,
    timeEndRaw: string,
    memo: string,
    tabId: string
  ) => void;
  onCancelEdit: (id: number) => void;
  onToggleExpand: (id: number) => void;
}

export default function ItemList({
  items, currentTab, showDone, expandedId, editingId, availableTabs,
  onToggleDone, onDelete, onStartEdit, onSaveEdit, onSaveEditWithTime, onCancelEdit, onToggleExpand,
}: ItemListProps) {
  const filtered = useMemo(() => {
    let result = currentTab === 'all'
      ? items.filter(i => i.date !== null)
      : items.filter(i => i.category === currentTab && i.date !== null);

    if (!showDone) {
      result = result.filter(i => !i.done);
    }

    return sortItems(result);
  }, [items, currentTab, showDone]);

  return (
    <div className="list-section">
      {filtered.length === 0 ? (
        <div className="list-empty">
          <IconNotebook size={32} aria-hidden style={{ display: 'block', margin: '0 auto 8px' }} />
          일정을 추가해 보세요
        </div>
      ) : (
        filtered.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            currentTab={currentTab}
            expanded={expandedId === item.id}
            editing={editingId === item.id}
            availableTabs={availableTabs}
            onToggleDone={onToggleDone}
            onDelete={onDelete}
            onStartEdit={onStartEdit}
            onSaveEdit={onSaveEdit}
            onSaveEditWithTime={onSaveEditWithTime}
            onCancelEdit={onCancelEdit}
            onToggleExpand={onToggleExpand}
          />
        ))
      )}
    </div>
  );
}
