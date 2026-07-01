'use client';

import { useState, useRef } from 'react';
import { IconPlus } from '@tabler/icons-react';
import type { TabKey } from '@/lib/types';

interface InputSectionProps {
  currentTab: TabKey;
  onAdd: (
    dateRaw: string,
    timeRaw: string,
    dateEndRaw: string,
    timeEndRaw: string,
    memo: string
  ) => void;
}

export default function InputSection({ currentTab, onAdd }: InputSectionProps) {
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
  const charClass = charLen > 50 ? 'char-over' : charLen > 40 ? 'char-warn' : 'char-ok';

  const handleAdd = () => {
    if (!memo.trim()) { alert('메모를 입력해주세요.'); return; }
    if ([...memo.trim()].length > 50) { alert('50자 이내로 입력해주세요.'); return; }
    onAdd(dateRaw, timeRaw, dateEndRaw, timeEndRaw, memo.trim());
    setDateRaw('');
    setTimeRaw('');
    setDateEndRaw('');
    setTimeEndRaw('');
    setMemo('');
  };

  const btnLabel = currentTab === 'all'
    ? '추가 (개인 탭에 저장)'
    : `${currentTab === 'work' ? '회사' : '개인'} 일정 추가 (Enter)`;

  return (
    <div className="input-section">
      {/* 1줄: 날짜 */}
      <div className="date-time-row">
        <input
          ref={dateRef}
          type="text"
          placeholder="시작일 (0609…)"
          value={dateRaw}
          onChange={e => setDateRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') timeRef.current?.focus(); }}
        />
        <span className="row-sep">~</span>
        <input
          ref={dateEndRef}
          type="text"
          placeholder="종료일 (선택)"
          value={dateEndRaw}
          onChange={e => setDateEndRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') timeEndRef.current?.focus(); }}
        />
      </div>
      {/* 2줄: 시간 */}
      <div className="date-time-row">
        <input
          ref={timeRef}
          type="text"
          placeholder="06:30 또는 18:30"
          value={timeRaw}
          onChange={e => setTimeRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') dateEndRef.current?.focus(); }}
        />
        <span className="row-sep">~</span>
        <input
          ref={timeEndRef}
          type="text"
          placeholder="06:30 또는 18:30"
          value={timeEndRaw}
          onChange={e => setTimeEndRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') memoRef.current?.focus(); }}
        />
      </div>
      {/* 3줄: 메모 (글자수 overlay) */}
      <div className="memo-input-wrap">
        <input
          ref={memoRef}
          type="text"
          placeholder="할 일 메모 (50자 이내)"
          maxLength={55}
          value={memo}
          onChange={e => setMemo(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
        />
        <span className={`memo-char-count ${charClass}`}>{charLen} / 50</span>
      </div>
      <button className="add-btn" onClick={handleAdd}>
        <IconPlus size={15} aria-hidden /> {btnLabel}
      </button>
    </div>
  );
}
