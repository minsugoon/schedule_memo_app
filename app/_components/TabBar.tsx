'use client';

import type { ScheduleItem, TabKey } from '@/lib/types';

interface TabBarProps {
  currentTab: TabKey;
  items: ScheduleItem[];
  onSwitchTab: (tab: TabKey) => void;
}

export default function TabBar({ currentTab, items, onSwitchTab }: TabBarProps) {
  const totalCount = items.length;
  const personalCount = items.filter(i => i.category === 'personal').length;
  const workCount = items.filter(i => i.category === 'work').length;

  return (
    <div className="tab-bar">
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
