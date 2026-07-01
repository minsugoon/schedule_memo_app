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

  const timeRawRef = useRef<HTMLInputElement>(null);
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
      <div className="date-row">
        <input
          type="text"
          placeholder="시작일 (0609…)"
          value={dateRaw}
          onChange={e => setDateRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') timeRawRef.current?.focus(); }}
        />
        <input
          ref={timeRawRef}
          type="text"
          placeholder="시간 (선택)"
          value={timeRaw}
          onChange={e => setTimeRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') dateEndRef.current?.focus(); }}
          style={{ flex: '0 0 110px' }}
        />
      </div>
      <div className="date-row">
        <input
          ref={dateEndRef}
          type="text"
          placeholder="종료일 (선택)"
          value={dateEndRaw}
          onChange={e => setDateEndRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') timeEndRef.current?.focus(); }}
        />
        <input
          ref={timeEndRef}
          type="text"
          placeholder="시간 (선택)"
          value={timeEndRaw}
          onChange={e => setTimeEndRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') memoRef.current?.focus(); }}
          style={{ flex: '0 0 110px' }}
        />
      </div>
      <div className="memo-input-wrap">
        <input
          ref={memoRef}
          type="text"
          className="memo-input-field"
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
