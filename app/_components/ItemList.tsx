'use client';

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
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
  onStartEdit: (id: number) => void;
  onSaveEdit: (id: number, dateRaw: string, dateEndRaw: string, memo: string) => void;
  onToggleExpand: (id: number) => void;
}

export default function ItemList({
  items, currentTab, showDone, expandedId, editingId,
  onToggleDone, onDelete, onStartEdit, onSaveEdit, onToggleExpand,
}: ItemListProps) {
  const base = currentTab === 'all' ? items : items.filter(i => i.category === currentTab);
  const filtered = sortItems(showDone ? base : base.filter(i => !i.done));

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
            onToggleDone={onToggleDone}
            onDelete={onDelete}
            onStartEdit={onStartEdit}
            onSaveEdit={onSaveEdit}
            onToggleExpand={onToggleExpand}
          />
        ))
      )}
    </div>
  );
}
