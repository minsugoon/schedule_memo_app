'use client';

import { useState, useRef } from 'react';
import { IconPlus } from '@tabler/icons-react';
import type { TabKey } from '@/lib/types';
import type { DbTab } from '@/lib/hooks/useTabs';

interface InputSectionProps {
  currentTab: TabKey;
  tabs: DbTab[];
  onAdd: (
    dateRaw: string,
    timeRaw: string,
    dateEndRaw: string,
    timeEndRaw: string,
    memo: string
  ) => void;
  onHelp: (type: 'date' | 'time') => void;
}

export default function InputSection({ currentTab, tabs, onAdd, onHelp }: InputSectionProps) {
  const [dateRaw, setDateRaw] = useState('');
  const [timeRaw, setTimeRaw] = useState('');
  const [dateEndRaw, setDateEndRaw] = useState('');
  const [timeEndRaw, setTimeEndRaw] = useState('');
  const [memo, setMemo] = useState('');

  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const dateEndRef = useRef<HTMLInputElement>(null);
  const timeEndRef = useRef<HTMLInputElement>(null);
  const memoRef = useRef<HTMLInputElement>(null);

  const charLen = [...memo].length;
  const charClass = charLen > 40 ? 'char-over' : 'char-ok';

  const handleAdd = () => {
    if (!memo.trim()) { alert('메모를 입력해주세요.'); return; }
    if ([...memo.trim()].length > 40) { alert('40자 이내로 입력해주세요.'); return; }
    onAdd(dateRaw, timeRaw, dateEndRaw, timeEndRaw, memo.trim());
    setDateRaw('');
    setTimeRaw('');
    setDateEndRaw('');
    setTimeEndRaw('');
    setMemo('');
  };

  const currentTabObj = tabs.find(t => t.id === currentTab);
  const btnLabel = currentTab === 'all'
    ? '추가 (개인 탭에 저장)'
    : `${currentTabObj?.name ?? '개인'} 일정 추가 (Enter)`;

  return (
    <div className="input-section">

      {/* 1줄: 날짜 */}
      <div className="date-time-row">
        <input
          ref={dateRef}
          type="text"
          style={{ fontSize: '11px' }}
          placeholder="시작일 (0609…)"
          value={dateRaw}
          onChange={e => setDateRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') timeRef.current?.focus(); }}
        />
        <span className="row-sep">~</span>
        <input
          ref={dateEndRef}
          type="text"
          style={{ fontSize: '11px' }}
          placeholder="종료일 (선택)"
          value={dateEndRaw}
          onChange={e => setDateEndRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') timeRef.current?.focus(); }}
        />
        <button
          className="help-btn"
          onClick={() => onHelp('date')}
          aria-label="날짜 입력 방법 안내"
        >❓</button>
      </div>

      {/* 2줄: 시간 */}
      <div className="date-time-row">
        <input
          ref={timeRef}
          type="text"
          style={{ fontSize: '11px' }}
          placeholder="시작시간 (선택)"
          value={timeRaw}
          onChange={e => setTimeRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') timeEndRef.current?.focus(); }}
        />
        <span className="row-sep">~</span>
        <input
          ref={timeEndRef}
          type="text"
          style={{ fontSize: '11px' }}
          placeholder="종료시간 (선택)"
          value={timeEndRaw}
          onChange={e => setTimeEndRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') memoRef.current?.focus(); }}
        />
        <button
          className="help-btn"
          onClick={() => onHelp('time')}
          aria-label="시간 입력 방법 안내"
        >❓</button>
      </div>

      {/* 3줄: 메모 */}
      <div className="memo-input-wrap">
        <input
          ref={memoRef}
          type="text"
          placeholder="할 일 메모 (40자 이내)"
          maxLength={44}
          value={memo}
          onChange={e => setMemo(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
        />
        <span className={`memo-char-count ${charClass}`}>{charLen} / 40</span>
      </div>

      {/* 추가 버튼 */}
      <button className="add-btn" onClick={handleAdd}>
        <IconPlus size={15} aria-hidden /> {btnLabel}
      </button>

    </div>
  );
}
