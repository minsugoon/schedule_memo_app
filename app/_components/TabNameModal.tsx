'use client'

import { useState, useEffect } from 'react'
import { IconX, IconTrash } from '@tabler/icons-react'

interface RecommendedCategory {
  category: string
  icon: string
  items: string[]
}

const RECOMMENDED: RecommendedCategory[] = [
  { category: '일상', icon: 'ti-sun', items: ['일정', '건강', '취미', '여행', '쇼핑'] },
  { category: '업무', icon: 'ti-briefcase', items: ['업무', '회의', '출장', '교육', '고객'] },
  { category: '가족', icon: 'ti-heart', items: ['가족', '부모', '자녀', '모임'] },
  { category: '돈', icon: 'ti-coin', items: ['지출', '저축', '투자', '세금'] },
  { category: '성장', icon: 'ti-rocket', items: ['공부', '독서', '목표'] },
]

interface TabNameModalProps {
  mode: 'add' | 'edit'
  currentName?: string
  existingNames: string[]
  onConfirm: (name: string) => void
  onDelete?: () => void
  onCancel: () => void
}

export default function TabNameModal({
  mode, currentName, existingNames, onConfirm, onDelete, onCancel,
}: TabNameModalProps) {
  const [customName, setCustomName] = useState('')

  useEffect(() => {
    if (mode === 'edit' && currentName) setCustomName(currentName)
  }, [mode, currentName])

  const handleConfirm = () => {
    const trimmed = customName.trim()
    if (!trimmed) {
      alert('탭 이름을 선택하거나 입력해주세요.')
      return
    }
    if ([...trimmed].length > 2) {
      alert('2글자 이내로 입력해주세요.')
      return
    }
    onConfirm(trimmed)
  }

  const handleDelete = () => {
    if (!confirm('이 탭을 삭제할까요?\n탭의 일정은 삭제되지 않습니다.')) return
    onDelete?.()
  }

  return (
    <div
      className="tab-name-overlay"
      onClick={onCancel}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 55,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)',
          borderRadius: '16px',
          padding: '20px',
          width: '100%',
          maxWidth: '340px',
          maxHeight: '75vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)' }}>
            {mode === 'add' ? '탭 추가' : '탭 이름 수정'}
          </span>
          <button
            onClick={onCancel}
            aria-label="닫기"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '2px' }}
          >
            <IconX size={15} aria-hidden />
          </button>
        </div>

        {RECOMMENDED.map(group => (
          <div key={group.category} style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>
              {group.category}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {group.items.map(item => {
                const disabled = existingNames.includes(item) && item !== currentName
                const selected = customName === item
                return (
                  <button
                    key={item}
                    disabled={disabled}
                    onClick={() => setCustomName(item)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: selected ? '1px solid var(--text)' : '0.5px solid var(--border)',
                      background: selected ? 'var(--bg3)' : 'var(--input-bg)',
                      color: disabled ? 'var(--text3)' : 'var(--text)',
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div style={{ borderTop: '0.5px solid var(--border)', margin: '14px 0' }} />

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text3)' }}>직접 입력</label>
            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
              {[...customName].length}/2
            </span>
          </div>
          <input
            type="text"
            value={customName}
            maxLength={2}
            onChange={e => setCustomName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleConfirm() }}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '9px',
              border: '0.5px solid var(--border)',
              background: 'var(--input-bg)',
              color: 'var(--text)',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {mode === 'edit' && onDelete && (
            <button className="tab-name-delete-btn" onClick={handleDelete}>
              <IconTrash size={14} aria-hidden /> 삭제
            </button>
          )}
          <button className="tab-name-cancel-btn" onClick={onCancel}>취소</button>
          <button className="tab-name-confirm-btn" onClick={handleConfirm}>
            {mode === 'add' ? '탭 추가' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
