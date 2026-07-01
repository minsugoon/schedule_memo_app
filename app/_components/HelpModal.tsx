'use client';

import { IconX } from '@tabler/icons-react';

interface HelpModalProps {
  type: 'date' | 'time';
  onClose: () => void;
}

const DATE_ROWS = [
  { input: '0609',        result: '06월 09일' },
  { input: '06.09',       result: '06월 09일' },
  { input: '6월9일',      result: '06월 09일' },
  { input: '20260609',    result: '2026년 06월 09일' },
  { input: '260609',      result: '2026년 06월 09일' },
  { input: '2026-06-09',  result: '2026년 06월 09일' },
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
    <div className="help-card">
      <div className="help-card-header">
        <span className="help-card-title">{title}</span>
        <button className="help-close-btn" onClick={onClose} aria-label="닫기">
          <IconX size={14} aria-hidden />
        </button>
      </div>
      <table className="help-table">
        <thead>
          <tr>
            <th>입력 예시</th>
            <th>인식 결과</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="help-table-input">{row.input}</td>
              <td className="help-table-result">{row.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="help-card-footer">{footer}</p>
    </div>
  );
}
