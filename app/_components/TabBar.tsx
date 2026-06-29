'use client';

import { IconCircleCheck } from '@tabler/icons-react';
import type { ScheduleItem, TabKey } from '@/lib/types';

interface TabBarProps {
  currentTab: TabKey;
  items: ScheduleItem[];
  showDone: boolean;
  onSwitchTab: (tab: TabKey) => void;
  onToggleShowDone: () => void;
}

export default function TabBar({ currentTab, items, showDone, onSwitchTab, onToggleShowDone }: TabBarProps) {
  const totalCount = items.filter(i => !i.done).length;
  const personalCount = items.filter(i => i.category === 'personal' && !i.done).length;
  const workCount = items.filter(i => i.category === 'work' && !i.done).length;

  return (
    <div className="tab-bar">
      <button
        className="tab-done-toggle"
        onClick={onToggleShowDone}
        aria-label={showDone ? '완료 항목 숨기기' : '완료 항목 보기'}
        aria-pressed={showDone}
      >
        <IconCircleCheck size={18} />
      </button>
      {(['all', 'personal', 'work'] as TabKey[]).map(tab => {
        const label = tab === 'all' ? '전체' : tab === 'personal' ? '개인' : '회사';
        const count = tab === 'all' ? totalCount : tab === 'personal' ? personalCount : workCount;
        return (
          <div
            key={tab}
            className={`tab-item${currentTab === tab ? ' active' : ''}`}
            onClick={() => onSwitchTab(tab)}
          >
            {label}
            <span className="tab-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
