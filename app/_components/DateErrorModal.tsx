'use client';

import { IconAlertTriangle } from '@tabler/icons-react';

interface DateErrorModalProps {
  message: string;
  onClose: () => void;
}

export default function DateErrorModal({ message, onClose }: DateErrorModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0,0,0,0.45)',
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
          maxWidth: '300px',
          border: '0.5px solid var(--border)',
        }}
      >
        {/* 경고 아이콘 */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <IconAlertTriangle
            size={32}
            color="var(--del)"
            aria-hidden
          />
        </div>

        {/* 제목 */}
        <div style={{
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--text)',
          textAlign: 'center',
          marginBottom: '8px',
        }}>
          날짜/시간 오류
        </div>

        {/* 오류 메시지 */}
        <div style={{
          fontSize: '13px',
          color: 'var(--text2)',
          textAlign: 'center',
          lineHeight: '1.6',
          marginBottom: '18px',
        }}>
          {message}
        </div>

        {/* 확인 버튼 */}
        <button
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '9px',
            border: 'none',
            background: 'var(--btn-bg)',
            color: 'var(--btn-text)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
}
