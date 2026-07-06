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

export default function TabBar({
  tabs, currentTab, items, onSwitchTab, viewMode, onToggleViewMode, showDone, onToggleShowDone,
}: TabBarProps) {
  const memoTab = tabs.find(t => t.tab_type === 'memo');

  const tabBarTabs = tabs
    .filter(t => t.tab_type !== 'memo')
    .sort((a, b) => a.sort_order - b.sort_order);

  const countFor = (tab: DbTab): number => {
    if (tab.tab_type === 'all') {
      return items.filter(i => !i.done && i.date !== null && i.tabId !== memoTab?.id).length;
    }
    return items.filter(i => !i.done && i.date !== null && i.tabId === tab.id).length;
  };

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
          const key: TabKey = tab.tab_type === 'all' ? 'all' : tab.id;
          return (
            <div
              key={tab.id}
              className={`tab-item${currentTab === key ? ' active' : ''}`}
              onClick={() => onSwitchTab(key)}
            >
              {tab.name}
              <span className="tab-count">{countFor(tab)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
