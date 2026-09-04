'use client';

import { IconX, IconSpeakerphone, IconChevronsUpDown } from '@tabler/icons-react';

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
              v0.8 · 2026.09.04
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
            <IconSpeakerphone size={14} color="var(--text2)" aria-hidden /> 업데이트 확인 방식 개선
          </div>
          <ul className="patch-list">
            <li>패치노트가 로그인 시 자동으로 뜨지 않아요. 최초 사용자가 튜토리얼과 패치노트를 동시에 마주치지 않아요</li>
            <li>헤더의 📣 버튼을 누르면 언제든지 업데이트 내역을 다시 볼 수 있어요</li>
            <li>아직 확인하지 않은 업데이트가 있으면 📣 버튼 우상단에 빨간 점으로 표시돼요</li>
          </ul>
        </div>

        <div className="patch-section">
          <div className="patch-section-title">
            <IconChevronsUpDown size={14} color="var(--text2)" aria-hidden /> 입력창 접기/펼치기
          </div>
          <ul className="patch-list">
            <li>목록 위 ▼▲ 버튼으로 일정 입력창을 접고 펼 수 있어요</li>
            <li>입력창을 접으면 카드 목록을 더 넓게 볼 수 있어요</li>
            <li>접은 상태는 기기에 저장되어 다음 접속 때도 그대로 유지돼요</li>
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
