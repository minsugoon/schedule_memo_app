'use client';

import { IconX } from '@tabler/icons-react';

interface HelpModalProps {
  type: 'date' | 'time';
  onClose: () => void;
}

const DATE_ROWS = [
  { input: '0609',           result: '06월 09일' },
  { input: '06.09',          result: '06월 09일' },
  { input: '6월9일',         result: '06월 09일' },
  { input: '20260609',       result: '2026년 06월 09일' },
  { input: '260609',         result: '2026년 06월 09일' },
  { input: '2026-06-09',     result: '2026년 06월 09일' },
  { input: '2026년 6월 9일', result: '2026년 06월 09일' },
];

const TIME_ROWS = [
  { input: '6:30',         result: '오전 6:30' },
  { input: '18:30',        result: '오후 6:30' },
  { input: '0630',         result: '오전 6:30' },
  { input: '오전 6시 30분', result: '오전 6:30' },
  { input: '오후 6시 30분', result: '오후 6:30' },
  { input: '저녁 6시',     result: '오후 6:00' },
  { input: '아침 9시',     result: '오전 9:00' },
];

export default function HelpModal({ type, onClose }: HelpModalProps) {
  const isDate = type === 'date';
  const title = isDate ? '날짜 입력 방법' : '시간 입력 방법';
  const rows = isDate ? DATE_ROWS : TIME_ROWS;
  const footer = isDate
    ? '연도 없이 입력하면 올해 기준으로 자동 적용됩니다.'
    : '오전/오후 없이 입력하면 24시간제로 자동 인식됩니다.';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          border: '0.5px solid var(--border)',
          borderRadius: '14px',
          padding: '20px',
          width: '100%',
          maxWidth: '320px',
        }}
        onClick={e => e.stopPropagation()}
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
            {title}
          </span>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text3)',
              padding: '2px',
            }}
            onClick={onClose}
            aria-label="닫기"
          >
            <IconX size={16} aria-hidden />
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                style={{
                  fontSize: '11px',
                  color: 'var(--text3)',
                  background: 'var(--bg2)',
                  padding: '5px 8px',
                  textAlign: 'left',
                  fontWeight: 400,
                }}
              >
                입력 예시
              </th>
              <th
                style={{
                  fontSize: '11px',
                  color: 'var(--text3)',
                  background: 'var(--bg2)',
                  padding: '5px 8px',
                  textAlign: 'left',
                  fontWeight: 400,
                }}
              >
                인식 결과
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td
                  style={{
                    fontSize: '12px',
                    padding: '6px 8px',
                    borderBottom: '0.5px solid var(--border)',
                    fontFamily: 'monospace',
                    color: 'var(--edit-c)',
                  }}
                >
                  {row.input}
                </td>
                <td
                  style={{
                    fontSize: '12px',
                    padding: '6px 8px',
                    borderBottom: '0.5px solid var(--border)',
                    color: 'var(--text2)',
                  }}
                >
                  {row.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text3)', lineHeight: 1.5 }}>
          {footer}
        </p>

        <button
          style={{
            marginTop: '14px',
            width: '100%',
            padding: '9px',
            borderRadius: '9px',
            border: '0.5px solid var(--border)',
            background: 'none',
            color: 'var(--text2)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
