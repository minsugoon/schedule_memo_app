'use client';

import { useState, useEffect, useRef } from 'react';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { ScheduleItem, TabKey } from '@/lib/types';
import { isRange, extractTime, dateKey, getToday, getBadgeInfo, fmtDateLine, fmtShortNoPad } from '@/lib/dateUtils';
import TabSelectModal from './TabSelectModal';

interface ItemCardProps {
  item: ScheduleItem;
  currentTab: TabKey | 'memo';
  expanded: boolean;
  editing: boolean;
  availableTabs: Array<{ id: string; name: string; color: string | null }>;
  tabName?: string;
  tabType?: 'all' | 'personal' | 'work' | 'memo' | null;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
  onStartEdit: (id: number) => void;
  onSaveEdit: (id: number, dateRaw: string, dateEndRaw: string, memo: string, tabId: string) => void;
  onSaveEditWithTime?: (
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
}

export default function ItemCard({
  item, currentTab, expanded, editing, availableTabs, tabName, tabType,
  onToggleDone, onDelete, onStartEdit, onSaveEdit, onSaveEditWithTime, onCancelEdit, onToggleExpand,
}: ItemCardProps) {
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDateEnd, setEditDateEnd] = useState('');
  const [editTimeEnd, setEditTimeEnd] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [showTabSelect, setShowTabSelect] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const memoLineRef = useRef<HTMLSpanElement>(null);

  // item.memo가 바뀔 때마다 잘림 여부 재감지
  useEffect(() => {
    const el = memoLineRef.current;
    if (!el) return;

    // 한 프레임 후 측정 (렌더링 완료 후 정확한 값 얻기 위함)
    const timer = setTimeout(() => {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }, 0);
    return () => clearTimeout(timer);
  }, [item.memo, isContentExpanded]);

  // editing이 true가 될 때 펼치기 상태 초기화
  useEffect(() => {
    if (editing) {
      setIsContentExpanded(false);
    }
  }, [editing]);

  useEffect(() => {
    if (editing) {
      setEditDate(item.dateRaw || '');
      setEditDateEnd(item.dateEndRaw || '');
      setEditMemo(item.memo);
      setShowTabSelect(false);

      const st = item.isAllDay === false ? extractTime(item.startedAt) : null;
      setEditTime(st ? `${String(st.h).padStart(2, '0')}:${String(st.m).padStart(2, '0')}` : '');

      const et = (item.isAllDay === false && isRange(item)) ? extractTime(item.endedAt) : null;
      setEditTimeEnd(et ? `${String(et.h).padStart(2, '0')}:${String(et.m).padStart(2, '0')}` : '');
    }
  }, [editing, item]);

  const { isToday, isOngoing } = getBadgeInfo(item);
  const showTabBadge = currentTab === 'all' && !!tabName;
  const isCardToday = isToday;

  const todayKey = dateKey(getToday());
  const endKey = item.dateEnd ? dateKey(item.dateEnd) : item.date ? dateKey(item.date) : null;
  const isPast = !item.done && endKey !== null && endKey < todayKey;

  const dateLine = fmtDateLine(
    item.startedAt,
    item.endedAt,
    item.isAllDay ?? true,
    item.dateRaw,
    item.dateEndRaw,
    item.dateEnd
  );

  const cls = [
    'item',
    isCardToday && !item.done ? 'today-item' : '',
    item.done ? 'done-item' : '',
    isPast ? 'past-item' : '',
    expanded ? 'expanded' : '',
    isContentExpanded ? 'content-expanded' : '',
  ].filter(Boolean).join(' ');

  const editMemoCharLen = [...editMemo].length;
  const editMemoCharClass = editMemoCharLen > 50 ? 'char-over' : editMemoCharLen > 40 ? 'char-warn' : 'char-ok';

  const handleSaveClick = () => {
    const trimmed = editMemo.trim();
    if (!trimmed) { alert('메모를 입력해주세요.'); return; }
    if ([...trimmed].length > 50) { alert('50자 이내로 입력해주세요.'); return; }

    // 날짜/시간 입력 여부 감지
    const hasDateOrTime =
      editDate.trim() !== '' ||
      editDateEnd.trim() !== '' ||
      editTime.trim() !== '' ||
      editTimeEnd.trim() !== '';

    if (!hasDateOrTime) {
      // 날짜/시간 없음 → 메모탭에 바로 저장 (모달 없음)
      handleSaveDirect();
    } else {
      // 날짜/시간 있음 → 탭 선택 모달 표시
      setShowTabSelect(true);
    }
  };

  const handleSaveDirect = () => {
    // 메모탭 유지 (tab_id 변경 없이 현재 탭 그대로)
    if (onSaveEditWithTime) {
      onSaveEditWithTime(
        item.id,
        '',   // dateRaw 없음
        '',   // timeRaw 없음
        '',   // dateEndRaw 없음
        '',   // timeEndRaw 없음
        editMemo.trim(),
        item.tabId ?? null  // 기존 tab_id 유지
      );
    }
  };

  const handleTabSelected = (tabId: string) => {
    setShowTabSelect(false);
    const trimmed = editMemo.trim();
    if (onSaveEditWithTime) {
      onSaveEditWithTime(item.id, editDate, editTime, editDateEnd, editTimeEnd, trimmed, tabId);
    } else {
      onSaveEdit(item.id, editDate, editDateEnd, trimmed, tabId);
    }
  };

  const handleTabSelectCancel = () => {
    setShowTabSelect(false);
  };

  const handleCancelEdit = () => {
    setEditDate('');
    setEditTime('');
    setEditDateEnd('');
    setEditTimeEnd('');
    setEditMemo('');
    setShowTabSelect(false);
    onCancelEdit(item.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // 체크박스, 아이콘 버튼, 인라인 액션 버튼 클릭은 무시
    if ((e.target as HTMLElement).closest(
      '.check-box, .icon-btn, .edit-row, .card-action-inline'
    )) return;
    if (editing) return;

    if (isContentExpanded) {
      // 펼쳐진 상태 → 접기
      setIsContentExpanded(false);
    } else if (isTruncated) {
      // 잘린 내용 있음 → 펼치기
      setIsContentExpanded(true);
    } else {
      // 잘린 내용 없음 → 기존 아이콘 오버레이 토글
      onToggleExpand(item.id);
    }
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
              onKeyDown={e => { if (e.key === 'Enter') handleSaveClick(); }}
            />
            <span className={`memo-char-count ${editMemoCharClass}`}>
              {editMemoCharLen} / 50
            </span>
          </div>

          {/* 저장 / 취소 버튼 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="edit-action-btn edit-save-btn"
              onClick={e => { e.stopPropagation(); handleSaveClick(); }}
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

          <TabSelectModal
            isOpen={showTabSelect}
            currentTabId={item.tabId ?? null}
            tabs={availableTabs}
            onSelect={handleTabSelected}
            onCancel={handleTabSelectCancel}
          />
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
                  <span className="item-date-line">
                    {dateLine}
                    {isTruncated && !isContentExpanded && (
                      <span className="memo-expand-hint">더보기</span>
                    )}
                  </span>
                )}
                <span
                  ref={memoLineRef}
                  className={`item-memo-line${isCardToday && !item.done ? ' font-bold' : ''}${isContentExpanded ? ' expanded' : ''}`}
                >
                  {item.memo}
                </span>
                {isContentExpanded && (
                  <div className="item-badge-bottom">
                    {isToday && !item.done && (
                      <span className="item-badge today-badge-v2">오늘</span>
                    )}
                    {isOngoing && !item.done && (
                      <span className="item-badge ongoing-badge">진행중</span>
                    )}
                    {showTabBadge && (
                      <span className={`item-badge cat-badge tab-type-${tabType ?? 'custom'}`}>
                        {tabName}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {(isContentExpanded || isToday || isOngoing || showTabBadge) && (
                <div className="item-badge-col">
                  {isContentExpanded ? (
                    <>
                      {/* 펼친 상태: 수정/삭제 버튼 */}
                      <button
                        className="card-action-inline edit"
                        onClick={e => { e.stopPropagation(); onStartEdit(item.id); }}
                        aria-label="수정"
                      >
                        <IconPencil size={13} aria-hidden />
                      </button>
                      <button
                        className="card-action-inline del"
                        onClick={e => { e.stopPropagation(); onDelete(item.id); }}
                        aria-label="삭제"
                      >
                        <IconTrash size={13} aria-hidden />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* 1. 오늘 뱃지 */}
                      {isToday && !item.done && (
                        <span className="item-badge today-badge-v2">오늘</span>
                      )}

                      {/* 2. 진행중 뱃지 */}
                      {isOngoing && !item.done && (
                        <span className="item-badge ongoing-badge">진행중</span>
                      )}

                      {/* 3. 탭이름 뱃지 (전체 탭에서만) */}
                      {showTabBadge && (
                        <span className={`item-badge cat-badge tab-type-${tabType ?? 'custom'}`}>
                          {tabName}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 편집/삭제 오버레이 (펼친 상태에서는 인라인 버튼으로 대체되므로 숨김) */}
          {!isContentExpanded && (
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
          )}
        </>
      )}
    </div>
  );
}
