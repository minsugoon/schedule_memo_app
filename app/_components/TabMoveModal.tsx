'use client'

interface TabMoveModalProps {
  isOpen: boolean
  memo: string
  dateText: string
  tabs: Array<{ id: string; name: string }>
  onSelect: (tabId: string) => void
  onCancel: () => void
}

export default function TabMoveModal({
  isOpen, memo, dateText, tabs, onSelect, onCancel,
}: TabMoveModalProps) {
  if (!isOpen) return null

  return (
    <div className="tab-move-overlay" onClick={onCancel}>
      <div className="tab-move-card" onClick={e => e.stopPropagation()}>
        <p className="tab-move-title">어느 탭으로 이동할까요?</p>
        <p className="tab-move-subtitle">날짜가 추가되어 메모에서 이동합니다</p>
        <div className="tab-move-preview">
          <p className="tab-move-preview-date">{dateText}</p>
          <p className="tab-move-preview-memo">{memo}</p>
        </div>
        <div className="tab-move-options">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className="tab-move-option-btn"
              onClick={() => onSelect(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <button className="tab-move-cancel-btn" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  )
}
