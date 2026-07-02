'use client';

import { useState, useEffect } from 'react';
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
  onSaveEditWithTime?: (
    id: number,
    dateRaw: string,
    timeRaw: string,
    dateEndRaw: string,
    timeEndRaw: string,
    memo: string
  ) => void;
  onCancelEdit: (id: number) => void;
  onToggleExpand: (id: number) => void;
}

function extractTime(iso: string | null | undefined): { h: number; m: number } | null {
  if (!iso) return null;
  const d = new Date(iso);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  if (h === 0 && m === 0) return null;
  return { h, m };
}

export default function ItemCard({
  item, currentTab, expanded, editing,
  onToggleDone, onDelete, onStartEdit, onSaveEdit, onSaveEditWithTime, onCancelEdit, onToggleExpand,
}: ItemCardProps) {
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDateEnd, setEditDateEnd] = useState('');
  const [editTimeEnd, setEditTimeEnd] = useState('');
  const [editMemo, setEditMemo] = useState('');

  useEffect(() => {
    if (editing) {
      setEditDate(item.dateRaw || '');
      setEditDateEnd(item.dateEndRaw || '');
      setEditMemo(item.memo);

      const st = item.isAllDay === false ? extractTime(item.startedAt) : null;
      setEditTime(st ? `${String(st.h).padStart(2, '0')}:${String(st.m).padStart(2, '0')}` : '');

      const et = (item.isAllDay === false && isRange(item)) ? extractTime(item.endedAt) : null;
      setEditTimeEnd(et ? `${String(et.h).padStart(2, '0')}:${String(et.m).padStart(2, '0')}` : '');
    }
  }, [editing, item]);

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

  const editMemoCharLen = [...editMemo].length;
  const editMemoCharClass = editMemoCharLen > 50 ? 'char-over' : editMemoCharLen > 40 ? 'char-warn' : 'char-ok';

  const handleSaveEdit = () => {
    const trimmed = editMemo.trim();
    if (!trimmed) { alert('메모를 입력해주세요.'); return; }
    if ([...trimmed].length > 50) { alert('50자 이내로 입력해주세요.'); return; }

    if (onSaveEditWithTime) {
      onSaveEditWithTime(item.id, editDate, editTime, editDateEnd, editTimeEnd, trimmed);
    } else {
      onSaveEdit(item.id, editDate, editDateEnd, trimmed);
    }
  };

  const handleCancelEdit = () => {
    setEditDate('');
    setEditTime('');
    setEditDateEnd('');
    setEditTimeEnd('');
    setEditMemo('');
    onCancelEdit(item.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('.check-box, .icon-btn, .edit-input-row, .memo-input-wrap, .edit-action-btn')) return;
    if (editing) return;
    onToggleExpand(item.id);
  };

  const isMemoMode = currentTab === 'memo';

  return (
    <div className={cls} onClick={handleCardClick}>
      {editing ? (
        <>
          {/* 읽기 전용: 저장된 날짜+메모 표시 */}
          <div className="edit-current-info">
            {!isMemoMode && (
              <span className="edit-current-date">{dateLine}</span>
            )}
            <span className="edit-current-memo">{item.memo}</span>
          </div>

          <div style={{ borderTop: '0.5px solid var(--border)', margin: '10px 0' }} />

          {/* 날짜 입력 행 */}
          <div className="edit-input-row">
            <input
              type="text"
              style={{ fontSize: '11px' }}
              placeholder="시작일 (0609…)"
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
            />
            <span className="row-sep">~</span>
            <input
              type="text"
              style={{ fontSize: '11px' }}
              placeholder="종료일 (선택)"
              value={editDateEnd}
              onChange={e => setEditDateEnd(e.target.value)}
            />
          </div>

          {/* 시간 입력 행 */}
          <div className="edit-input-row">
            <input
              type="text"
              style={{ fontSize: '11px' }}
              placeholder="시작시간 (선택)"
              value={editTime}
              onChange={e => setEditTime(e.target.value)}
            />
            <span className="row-sep">~</span>
            <input
              type="text"
              style={{ fontSize: '11px' }}
              placeholder="종료시간 (선택)"
              value={editTimeEnd}
              onChange={e => setEditTimeEnd(e.target.value)}
            />
          </div>

          {/* 메모 입력 */}
          <div className="memo-input-wrap" style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="수정할 메모 내용"
              maxLength={55}
              value={editMemo}
              onChange={e => setEditMemo(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); }}
            />
            <span className={`memo-char-count ${editMemoCharClass}`}>
              {editMemoCharLen} / 50
            </span>
          </div>

          {/* 저장 / 취소 버튼 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="edit-action-btn edit-save-btn"
              onClick={e => { e.stopPropagation(); handleSaveEdit(); }}
            >
              저장
            </button>
            <button
              className="edit-action-btn edit-cancel-btn"
              onClick={e => { e.stopPropagation(); handleCancelEdit(); }}
            >
              취소
            </button>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
