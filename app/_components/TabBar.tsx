'use client';

import { IconCircleCheck, IconNotes } from '@tabler/icons-react';
import type { ScheduleItem, TabKey, ViewMode } from '@/lib/types';
import type { DbTab } from '@/lib/hooks/useTabs';

interface TabBarProps {
  tabs: DbTab[];
  currentTab: TabKey;
  items: ScheduleItem[];
  onSwitchTab: (tab: TabKey) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  showDone: boolean;
  onToggleShowDone: () => void;
}

const NAME_TO_KEY: Record<string, TabKey> = {
  '전체': 'all',
  '개인': 'personal',
  '회사': 'work',
};

export default function TabBar({
  tabs, currentTab, items, onSwitchTab, viewMode, onToggleViewMode, showDone, onToggleShowDone,
}: TabBarProps) {
  const totalCount = items.filter(i => !i.done && i.date !== null).length;
  const personalCount = items.filter(i => i.category === 'personal' && !i.done && i.date !== null).length;
  const workCount = items.filter(i => i.category === 'work' && !i.done && i.date !== null).length;

  const countByKey: Record<TabKey, number> = {
    all: totalCount,
    personal: personalCount,
    work: workCount,
  };

  const tabBarTabs = tabs
    .filter(t => t.name !== '메모')
    .sort((a, b) => a.sort_order - b.sort_order);

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
        {tabBarTabs.map(tab => {
          const key = NAME_TO_KEY[tab.name];
          if (!key) return null;
          return (
            <div
              key={tab.id}
              className={`tab-item${currentTab === key ? ' active' : ''}`}
              onClick={() => onSwitchTab(key)}
            >
              {tab.name}
              <span className="tab-count">{countByKey[key]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
