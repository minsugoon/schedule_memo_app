'use client';

import { useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { parseDate, getToday, DAYS } from '@/lib/dateUtils';

interface DatePickerModalProps {
  isOpen: boolean;
  value: string;
  label: string;
  onSelect: (dateRaw: string) => void;
  onClose: () => void;
}

interface CalendarCell {
  y: number;
  m: number;
  d: number;
  inCurrentMonth: boolean;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

function buildCalendarCells(y: number, m: number): CalendarCell[] {
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const totalDays = daysInMonth(y, m);

  const prevY = m === 1 ? y - 1 : y;
  const prevM = m === 1 ? 12 : m - 1;
  const prevTotalDays = daysInMonth(prevY, prevM);

  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;

  const cells: CalendarCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ y: prevY, m: prevM, d: prevTotalDays - i, inCurrentMonth: false });
  }

  for (let d = 1; d <= totalDays; d++) {
    cells.push({ y, m, d, inCurrentMonth: true });
  }

  let nextD = 1;
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({ y: nextY, m: nextM, d: nextD, inCurrentMonth: false });
    nextD++;
  }

  return cells;
}

function toDateRaw(y: number, m: number, d: number): string {
  return `${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
}

export default function DatePickerModal({ isOpen, value, label, onSelect, onClose }: DatePickerModalProps) {
  const initial = parseDate(value) ?? getToday();
  const [viewYear, setViewYear] = useState(initial.y);
  const [viewMonth, setViewMonth] = useState(initial.m);

  if (!isOpen) return null;

  const selected = parseDate(value);
  const today = getToday();
  const cells = buildCalendarCells(viewYear, viewMonth);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(y => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(y => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleSelectCell = (cell: CalendarCell) => {
    onSelect(toDateRaw(cell.y, cell.m, cell.d));
    onClose();
  };

  const handleToday = () => {
    onSelect(toDateRaw(today.y, today.m, today.d));
    onClose();
  };

  return (
    <div className="datepicker-overlay" onClick={onClose}>
      <div className="datepicker-card" onClick={e => e.stopPropagation()}>
        <div className="datepicker-title">{label} 선택</div>

        <div className="datepicker-header">
          <button
            className="datepicker-nav-btn"
            onClick={handlePrevMonth}
            aria-label="이전 달"
            type="button"
          >
            <IconChevronLeft size={16} aria-hidden />
          </button>
          <span className="datepicker-month-label">{viewYear}년 {viewMonth}월</span>
          <button
            className="datepicker-nav-btn"
            onClick={handleNextMonth}
            aria-label="다음 달"
            type="button"
          >
            <IconChevronRight size={16} aria-hidden />
          </button>
        </div>

        <div className="datepicker-weekdays">
          {DAYS.map((day, idx) => (
            <span
              key={day}
              className={`datepicker-weekday${idx === 0 ? ' sunday' : idx === 6 ? ' saturday' : ''}`}
            >
              {day}
            </span>
          ))}
        </div>

        <div className="datepicker-grid">
          {cells.map((cell, idx) => {
            const weekday = idx % 7;
            const isToday = cell.y === today.y && cell.m === today.m && cell.d === today.d;
            const isSelected = !!selected && cell.y === selected.y && cell.m === selected.m && cell.d === selected.d;
            const cls = [
              'datepicker-cell',
              !cell.inCurrentMonth ? 'other-month' : '',
              weekday === 0 ? 'sunday' : '',
              weekday === 6 ? 'saturday' : '',
              isToday ? 'today' : '',
              isSelected ? 'selected' : '',
            ].filter(Boolean).join(' ');

            return (
              <button
                key={`${cell.y}-${cell.m}-${cell.d}-${idx}`}
                type="button"
                className={cls}
                onClick={() => handleSelectCell(cell)}
              >
                {cell.d}
              </button>
            );
          })}
        </div>

        <div className="datepicker-footer">
          <button className="datepicker-today-btn" onClick={handleToday} type="button">
            오늘
          </button>
          <button className="datepicker-cancel-btn" onClick={onClose} type="button">
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
