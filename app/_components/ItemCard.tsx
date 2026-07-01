'use client';

import { useState, useEffect, useRef } from 'react';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { ScheduleItem, TabKey } from '@/lib/types';
import { isTodayInRange, isRange, fmtShort, fmtTime, dateKey, getToday, type FmtShortResult } from '@/lib/dateUtils';

interface ItemCardProps {
  item: ScheduleItem;
  currentTab: TabKey | 'memo';
  expanded: boolean;
  editing: boolean;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
  onStartEdit: (id: number) => void;
  onSaveEdit: (id: number, dateRaw: string, dateEndRaw: string, memo: string) => void;
  onToggleExpand: (id: number) => void;
}

function extractTime(iso: string | null | undefined): { h: number; m: number } | null {
  if (!iso) return null;
  const d = new Date(iso);
  return { h: d.getUTCHours(), m: d.getUTCMinutes() };
}

export default function ItemCard({
  item, currentTab, expanded, editing,
  onToggleDone, onDelete, onStartEdit, onSaveEdit, onToggleExpand,
}: ItemCardProps) {
  const [editDate, setEditDate] = useState(item.dateRaw || '');
  const [editEnd, setEditEnd] = useState(item.dateEndRaw || '');
  const [editMemo, setEditMemo] = useState(item.memo);
  const editMemoRef = useRef<HTMLInputElement>(null);
  const editDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setEditDate(item.dateRaw || '');
      setEditEnd(item.dateEndRaw || '');
      setEditMemo(item.memo);
      setTimeout(() => {
        if (currentTab === 'memo') {
          editDateRef.current?.focus();
        } else {
          editMemoRef.current?.focus();
          editMemoRef.current?.select();
        }
      }, 50);
    }
  }, [editing, item, currentTab]);

  const isToday = isTodayInRange(item.date, item.dateEnd);
  const todayKey = dateKey(getToday());
  const endKey = item.dateEnd ? dateKey(item.dateEnd) : item.date ? dateKey(item.date) : null;
  const isPast = !item.done && endKey !== null && endKey < todayKey;

  const DAY_COLORS = { sat: '#1A56DB', sun: '#C81E1E' } as const;
  const renderDate = (r: FmtShortResult | null, fallback = '날짜 없음') => {
    if (!r) return fallback;
    if (r.dayType === 'normal') return r.text;
    const idx = r.text.lastIndexOf('(');
    return <>{r.text.slice(0, idx)}<span style={{ color: DAY_COLORS[r.dayType] }}>{r.text.slice(idx)}</span></>;
  };

  const sdResult = fmtShort(item.date);
  const edResult = item.dateEnd ? fmtShort(item.dateEnd) : null;

  const startTime = item.isAllDay === false ? extractTime(item.startedAt) : null;
  const endTime = (item.isAllDay === false && isRange(item)) ? extractTime(item.endedAt) : null;

  const dateLine = isRange(item)
    ? <>
        {renderDate(sdResult)}
        {startTime && <> {fmtTime(startTime.h, startTime.m)}</>}
        {' ~ '}
        {renderDate(edResult)}
        {endTime && <> {fmtTime(endTime.h, endTime.m)}</>}
      </>
    : <>
        {renderDate(sdResult)}
        {startTime && <> {fmtTime(startTime.h, startTime.m)}</>}
      </>;

  const cls = [
    'item',
    isToday && !item.done ? 'today-item' : '',
    item.done ? 'done-item' : '',
    isPast ? 'past-item' : '',
    expanded ? 'expanded' : '',
  ].filter(Boolean).join(' ');

  const handleSaveEdit = () => {
    const trimmed = editMemo.trim();
    if (!trimmed) { alert('메모를 입력해주세요.'); return; }
    if ([...trimmed].length > 50) { alert('50자 이내로 입력해주세요.'); return; }
    onSaveEdit(item.id, editDate, editEnd, trimmed);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('.check-box, .icon-btn, .edit-row')) return;
    onToggleExpand(item.id);
  };

  const isMemoMode = currentTab === 'memo';

  return (
    <div className={cls} onClick={handleCardClick}>
      <div className="item-main">
        <div
          className={`check-box${item.done ? ' checked' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleDone(item.id); }}
          role="checkbox"
          aria-checked={item.done}
          aria-label="완료 체크"
        >
          <svg className="check-icon" viewBox="0 0 10 10">
            <polyline points="1.5,5 4,7.5 8.5,2.5" />
          </svg>
        </div>
        <div className="item-body-col">
          <div className="item-lines">
            {!isMemoMode && (
              <span className="item-date-line">{dateLine}</span>
            )}
            <span className="item-memo-line">{item.memo}</span>
          </div>
          {(isToday && !item.done) || (currentTab === 'all') ? (
            <div className="item-badge-col">
              {isToday && !item.done && (
                <span className="today-badge">오늘</span>
              )}
              {currentTab === 'all' && (
                <span className={`cat-badge ${item.category || 'personal'}`}>
                  {item.category === 'work' ? '회사' : '개인'}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* 편집/삭제 오버레이 */}
      <div className="item-icons">
        <button
          className="icon-btn edit-btn"
          onClick={e => { e.stopPropagation(); onStartEdit(item.id); }}
          aria-label="수정"
        >
          <IconPencil size={15} aria-hidden />
        </button>
        <button
          className="icon-btn del-btn"
          onClick={e => { e.stopPropagation(); onDelete(item.id); }}
          aria-label="삭제"
        >
          <IconTrash size={15} aria-hidden />
        </button>
      </div>

      {/* 인라인 편집 폼 */}
      {editing && (
        <div className="edit-row">
          <input
            ref={editDateRef}
            type="text"
            className="edit-date-inp"
            value={editDate}
            placeholder="시작일"
            onChange={e => setEditDate(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); }}
          />
          <input
            type="text"
            className="edit-end-inp"
            value={editEnd}
            placeholder="종료일(선택)"
            onChange={e => setEditEnd(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); }}
          />
          <input
            ref={editMemoRef}
            type="text"
            className="edit-memo-inp"
            value={editMemo}
            placeholder="메모"
            maxLength={55}
            onChange={e => setEditMemo(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); }}
          />
          <button className="edit-save" onClick={handleSaveEdit}>저장</button>
        </div>
      )}
    </div>
  );
}
