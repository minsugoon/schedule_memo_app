'use client';

import { useState, useRef } from 'react';
import { IconPlus } from '@tabler/icons-react';
import type { TabKey } from '@/lib/types';

interface InputSectionProps {
  currentTab: TabKey;
  onAdd: (dateRaw: string, dateEndRaw: string, memo: string) => void;
}

export default function InputSection({ currentTab, onAdd }: InputSectionProps) {
  const [dateRaw, setDateRaw] = useState('');
  const [dateEndRaw, setDateEndRaw] = useState('');
  const [memo, setMemo] = useState('');
  const dateEndRef = useRef<HTMLInputElement>(null);
  const memoRef = useRef<HTMLInputElement>(null);

  const charLen = [...memo].length;
  const charClass = charLen > 50 ? 'char-over' : charLen > 40 ? 'char-warn' : 'char-ok';

  const handleAdd = () => {
    if (!memo.trim()) { alert('메모를 입력해주세요.'); return; }
    if ([...memo.trim()].length > 50) { alert('50자 이내로 입력해주세요.'); return; }
    onAdd(dateRaw, dateEndRaw, memo.trim());
    setDateRaw('');
    setDateEndRaw('');
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
          onKeyDown={e => { if (e.key === 'Enter') dateEndRef.current?.focus(); }}
        />
        <input
          ref={dateEndRef}
          type="text"
          placeholder="종료일 (선택)"
          value={dateEndRaw}
          onChange={e => setDateEndRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') memoRef.current?.focus(); }}
        />
      </div>
      <div className="memo-group">
        <div className="memo-label-row">
          <span className="memo-label">메모</span>
          <span className={`char-count ${charClass}`}>{charLen} / 50</span>
        </div>
        <input
          ref={memoRef}
          type="text"
          placeholder="할 일 메모 (50자 이내)"
          maxLength={55}
          value={memo}
          onChange={e => setMemo(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
        />
      </div>
      <button className="add-btn" onClick={handleAdd}>
        <IconPlus size={15} aria-hidden /> {btnLabel}
      </button>
    </div>
  );
}
