'use client';

import { useState, useMemo } from 'react';
import { IconPlus, IconClipboardText } from '@tabler/icons-react';
import type { ScheduleItem } from '@/lib/types';
import type { DbTab } from '@/lib/hooks/useTabs';
import ItemCard from './ItemCard';

interface MemoViewProps {
  items: ScheduleItem[];
  expandedId: number | null;
  editingId: number | null;
  availableTabs: Array<{ id: string; name: string; color: string | null }>;
  tabs: DbTab[];
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
    tabId: string | null
  ) => void;
  onCancelEdit: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onAdd: (memo: string) => void;
}

export default function MemoView({
  items, expandedId, editingId, availableTabs, tabs,
  onToggleDone, onDelete, onStartEdit, onSaveEdit, onSaveEditWithTime, onCancelEdit, onToggleExpand, onAdd,
}: MemoViewProps) {
  const [memo, setMemo] = useState('');

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.createdAt - a.createdAt),
    [items]
  );

  const charLen = [...memo].length;
  const charClass = charLen > 50 ? 'char-over' : charLen > 40 ? 'char-warn' : 'char-ok';

  const getTabName = (item: ScheduleItem): string | undefined => {
    if (!item.tabId) return undefined;
    return tabs.find(t => t.id === item.tabId)?.name;
  };

  const getTabType = (item: ScheduleItem): DbTab['tab_type'] => {
    if (!item.tabId) return null;
    return tabs.find(t => t.id === item.tabId)?.tab_type ?? null;
  };

  const handleAdd = () => {
    const trimmed = memo.trim();
    if (!trimmed) { alert('메모를 입력해주세요.'); return; }
    if ([...trimmed].length > 50) { alert('50자 이내로 입력해주세요.'); return; }
    onAdd(trimmed);
    setMemo('');
  };

  return (
    <div className="memo-view">
      <div className="memo-view-input">
        <div className="memo-label-row">
          <span className="memo-view-title">
            <IconClipboardText size={15} aria-hidden />
            메모 {sorted.length > 0 && <span className="memo-view-count">{sorted.length}개</span>}
          </span>
          <span className={`char-count ${charClass}`}>{charLen} / 50</span>
        </div>
        <div className="memo-view-add-row">
          <input
            type="text"
            placeholder="메모 입력 (50자 이내)"
            maxLength={55}
            value={memo}
            onChange={e => setMemo(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          />
          <button className="memo-add-btn" onClick={handleAdd} aria-label="메모 추가">
            <IconPlus size={16} aria-hidden />
          </button>
        </div>
      </div>
      <div className="list-section">
        {sorted.length === 0 ? (
          <div className="list-empty">
            <IconClipboardText size={32} aria-hidden style={{ display: 'block', margin: '0 auto 8px' }} />
            날짜 없는 메모가 여기에 표시됩니다
          </div>
        ) : (
          sorted.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              currentTab="memo"
              expanded={expandedId === item.id}
              editing={editingId === item.id}
              availableTabs={availableTabs}
              tabName={getTabName(item)}
              tabType={getTabType(item)}
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
    </div>
  );
}
