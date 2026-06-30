'use client';

import { IconCircleCheck, IconNotes } from '@tabler/icons-react';
import type { ScheduleItem, TabKey, ViewMode } from '@/lib/types';

interface TabBarProps {
  currentTab: TabKey;
  items: ScheduleItem[];
  onSwitchTab: (tab: TabKey) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  showDone: boolean;
  onToggleShowDone: () => void;
}

export default function TabBar({
  currentTab, items, onSwitchTab, viewMode, onToggleViewMode, showDone, onToggleShowDone,
}: TabBarProps) {
  const totalCount = items.filter(i => !i.done && i.date !== null).length;
  const personalCount = items.filter(i => i.category === 'personal' && !i.done && i.date !== null).length;
  const workCount = items.filter(i => i.category === 'work' && !i.done && i.date !== null).length;

  return (
    <div className="tab-bar-wrapper">
      <div className="tab-bar-actions">
        <button
          className={`tab-action-btn${showDone ? ' done-on' : ''}`}
          onClick={onToggleShowDone}
          aria-label={showDone ? '완료 항목 숨기기' : '완료 항목 보기'}
          aria-pressed={showDone}
        >
          <IconCircleCheck size={18} aria-hidden />
        </button>
        <button
          className={`tab-action-btn${viewMode === 'memo' ? ' active' : ''}`}
          onClick={onToggleViewMode}
          aria-label="메모"
        >
          <IconNotes size={18} aria-hidden />
        </button>
      </div>
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
    </div>
  );
}
