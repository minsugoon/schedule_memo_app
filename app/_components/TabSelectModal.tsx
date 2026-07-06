'use client';

interface TabSelectModalProps {
  isOpen: boolean;
  currentTabId: string | null;
  tabs: Array<{ id: string; name: string; color: string | null; tab_type?: string | null }>;
  onSelect: (tabId: string) => void;
  onCancel: () => void;
}

export default function TabSelectModal({
  isOpen, currentTabId, tabs, onSelect, onCancel,
}: TabSelectModalProps) {
  if (!isOpen) return null;

  const options = tabs.filter(t => t.tab_type !== 'memo' && t.tab_type !== 'all');

  return (
    <div className="tab-select-overlay" onClick={onCancel}>
      <div className="tab-select-card" onClick={e => e.stopPropagation()}>
        <p className="tab-select-title">탭 선택</p>
        <p className="tab-select-sub">이 일정을 어느 탭으로 저장할까요?</p>
        <div className="tab-select-options">
          {options.map(tab => (
            <button
              key={tab.id}
              className={`tab-select-option${tab.id === currentTabId ? ' current' : ''}`}
              onClick={() => onSelect(tab.id)}
            >
              <span className="tab-select-dot" style={{ background: tab.color ?? 'var(--border2)' }} />
              {tab.name}
              {tab.id === currentTabId && (
                <span className="tab-select-current-badge">현재</span>
              )}
            </button>
          ))}
        </div>
        <button className="tab-select-cancel" onClick={onCancel}>취소</button>
      </div>
    </div>
  );
}
