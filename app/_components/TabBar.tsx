'use client';

import { useState, useRef, useEffect } from 'react';
import { IconCircleCheck, IconNotes, IconPlus } from '@tabler/icons-react';
import type { ScheduleItem, TabKey, ViewMode } from '@/lib/types';
import type { DbTab } from '@/lib/hooks/useTabs';
import TabNameModal from './TabNameModal';

interface TabBarProps {
  tabs: DbTab[];
  currentTab: TabKey;
  items: ScheduleItem[];
  onSwitchTab: (tab: TabKey) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  showDone: boolean;
  onToggleShowDone: () => void;
  onAddTab: (name: string) => Promise<boolean>;
  onUpdateTabName: (tabId: string, name: string) => Promise<boolean>;
  onDeleteTab: (tabId: string) => Promise<boolean>;
}

const MAX_TABS = 5;

function displayCount(n: number): string {
  return n > 99 ? '99+' : String(n);
}

export default function TabBar({
  tabs, currentTab, items, onSwitchTab, viewMode, onToggleViewMode, showDone, onToggleShowDone,
  onAddTab, onUpdateTabName, onDeleteTab,
}: TabBarProps) {
  const [tabNameModal, setTabNameModal] = useState<{
    mode: 'add' | 'edit';
    tabId?: string;
    currentName?: string;
    canDelete?: boolean;
  } | null>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const memoTab = tabs.find(t => t.tab_type === 'memo');

  const tabBarTabs = tabs
    .filter(t => t.tab_type !== 'memo')
    .sort((a, b) => a.sort_order - b.sort_order);

  const tabCount = tabBarTabs.length;

  const countFor = (tab: DbTab): number => {
    if (tab.tab_type === 'all') {
      return items.filter(i => !i.done && i.date !== null && i.tabId !== memoTab?.id).length;
    }
    return items.filter(i => !i.done && i.date !== null && i.tabId === tab.id).length;
  };

  const handlePressStart = (tab: DbTab) => {
    if (tab.tab_type === 'all') return;
    if (tab.is_default) return;

    longPressTimer.current = setTimeout(() => {
      setTabNameModal({
        mode: 'edit',
        tabId: tab.id,
        currentName: tab.name,
        canDelete: true,
      });
    }, 500);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  return (
    <div className="tab-bar-wrapper">
      {tabNameModal && (
        <TabNameModal
          mode={tabNameModal.mode}
          currentName={tabNameModal.currentName}
          existingNames={tabs.map(t => t.name)}
          onConfirm={async (name) => {
            if (tabNameModal.mode === 'add') {
              const ok = await onAddTab(name);
              if (ok) setTabNameModal(null);
            } else {
              const ok = await onUpdateTabName(tabNameModal.tabId!, name);
              if (ok) setTabNameModal(null);
            }
          }}
          onDelete={tabNameModal.canDelete ? async () => {
            const ok = await onDeleteTab(tabNameModal.tabId!);
            if (ok) setTabNameModal(null);
          } : undefined}
          onCancel={() => setTabNameModal(null)}
        />
      )}
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
      <div className={`tab-bar${tabBarTabs.length >= MAX_TABS ? ' scrollable' : ''}`}>
        {tabBarTabs.map(tab => {
          const key: TabKey = tab.tab_type === 'all' ? 'all' : tab.id;
          return (
            <div
              key={tab.id}
              className={`tab-item${currentTab === key ? ' active' : ''}${tabCount >= 5 ? ' tab-compact' : ''}`}
              onClick={() => onSwitchTab(key)}
              onMouseDown={() => handlePressStart(tab)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={(e) => { e.preventDefault(); handlePressStart(tab); }}
              onTouchEnd={handlePressEnd}
              onTouchCancel={handlePressEnd}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              <span className="tab-name">{tab.name}</span>
              <span className="tab-count">{displayCount(countFor(tab))}</span>
            </div>
          );
        })}
        {tabBarTabs.length < MAX_TABS && (
          <div
            className="tab-item tab-add-btn"
            onClick={() => setTabNameModal({ mode: 'add' })}
            aria-label="탭 추가"
          >
            <IconPlus size={13} aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
