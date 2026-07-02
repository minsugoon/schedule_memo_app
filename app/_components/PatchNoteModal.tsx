'use client';

import { IconX, IconPencil, IconLayoutColumns, IconKeyboard, IconUser } from '@tabler/icons-react';

interface PatchNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatchNoteModal({ isOpen, onClose }: PatchNoteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0,0,0,0.55)',
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
          padding: '22px 20px',
          width: '100%',
          maxWidth: '340px',
          border: '0.5px solid var(--border)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                background: 'var(--bg-accent, var(--bg3))',
                color: 'var(--text-accent, var(--edit-c))',
                borderRadius: '4px',
                padding: '2px 8px',
                marginBottom: '6px',
                display: 'inline-block',
              }}
            >
              v0.7 · 2026.07.02
            </span>
            <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)', marginBottom: '16px' }}>
              📋 할 일 메모장 업데이트
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text3)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconX size={16} aria-hidden />
          </button>
        </div>

        <div className="patch-section">
          <div className="patch-section-title">
            <IconPencil size={14} color="var(--text2)" aria-hidden /> 일정 수정 개선
          </div>
          <ul className="patch-list">
            <li>카드 수정 모드에서 시작일·시작시간·종료일·종료시간을 직접 편집할 수 있어요</li>
            <li>수정 저장 시 탭을 선택해서 일정을 원하는 탭으로 이동할 수 있어요</li>
            <li>수정 중에는 ✏️ 삭제 버튼이 숨겨져 실수로 삭제되지 않아요</li>
          </ul>
        </div>

        <div className="patch-section">
          <div className="patch-section-title">
            <IconLayoutColumns size={14} color="var(--text2)" aria-hidden /> 탭 구조 정리
          </div>
          <ul className="patch-list">
            <li>전체 탭: 날짜가 있는 일정만 표시돼요 (메모 제외)</li>
            <li>메모 탭(📝): 날짜 없이 메모만 입력하면 자동으로 저장되는 전용 공간이에요</li>
            <li>탭 순서가 전체 → 개인 → 회사 순으로 정리됐어요</li>
          </ul>
        </div>

        <div className="patch-section">
          <div className="patch-section-title">
            <IconKeyboard size={14} color="var(--text2)" aria-hidden /> 입력 편의 개선
          </div>
          <ul className="patch-list">
            <li>시작일·종료일을 한 줄로, 시작시간·종료시간을 한 줄로 입력할 수 있어요</li>
            <li>❓ 버튼을 누르면 날짜·시간 입력 방법을 언제든지 확인할 수 있어요</li>
            <li>메모 입력란 글자 수가 입력창 오른쪽 끝에 바로 표시돼요</li>
          </ul>
        </div>

        <div className="patch-section">
          <div className="patch-section-title">
            <IconUser size={14} color="var(--text2)" aria-hidden /> 계정
          </div>
          <ul className="patch-list">
            <li>로그인 화면에서 &apos;다른 계정으로 로그인하기&apos;로 계정 전환이 가능해요</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '11px',
            background: 'var(--btn-bg)',
            color: 'var(--btn-text)',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          확인했어요 ✓
        </button>
      </div>
    </div>
  );
}
