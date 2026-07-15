'use client';

import { useEffect, useRef, useState } from 'react';
import { parseTime } from '@/lib/dateUtils';

interface TimePickerModalProps {
  isOpen: boolean;
  value: string;
  label: string;
  onSelect: (timeRaw: string) => void;
  onClose: () => void;
}

const CELL_H = 44;

export default function TimePickerModal({ isOpen, value, label, onSelect, onClose }: TimePickerModalProps) {
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);
  const [selH, setSelH] = useState(0);
  const [selM, setSelM] = useState(0);

  // 현재 입력값(24시간 'HH:MM' 또는 '오후 2:30' 등) 파싱 — parseTime이 두 형식 모두 지원
  useEffect(() => {
    if (!value) return;
    const parsed = parseTime(value);
    if (parsed) {
      setSelH(parsed.h);
      setSelM((Math.round(parsed.m / 5) * 5) % 60);
    }
  }, [value]);

  // 모달이 열릴 때 초기 스크롤 위치 설정
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (hourRef.current) hourRef.current.scrollTop = selH * CELL_H;
      if (minRef.current) minRef.current.scrollTop = (selM / 5) * CELL_H;
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleHourScroll = () => {
    if (!hourRef.current) return;
    const idx = Math.round(hourRef.current.scrollTop / CELL_H);
    setSelH(Math.min(23, Math.max(0, idx)));
  };

  const handleMinScroll = () => {
    if (!minRef.current) return;
    const idx = Math.round(minRef.current.scrollTop / CELL_H);
    setSelM(Math.min(11, Math.max(0, idx)) * 5);
  };

  const handleHourClick = (h: number) => {
    setSelH(h);
    hourRef.current?.scrollTo({ top: h * CELL_H, behavior: 'smooth' });
  };

  const handleMinClick = (m: number) => {
    setSelM(m);
    minRef.current?.scrollTo({ top: (m / 5) * CELL_H, behavior: 'smooth' });
  };

  const handleConfirm = () => {
    onSelect(`${String(selH).padStart(2, '0')}:${String(selM).padStart(2, '0')}`);
    onClose();
  };

  const previewText = `${String(selH).padStart(2, '0')}:${String(selM).padStart(2, '0')}`;

  return (
    <div className="timepicker-overlay" onClick={onClose}>
      <div className="timepicker-card" onClick={e => e.stopPropagation()}>
        <div className="timepicker-header">
          <span className="timepicker-label">{label} 선택</span>
          <span className="timepicker-preview">{previewText}</span>
        </div>

        <div className="timepicker-wheels">
          {/* 시 컬럼 */}
          <div className="timepicker-col">
            <div className="timepicker-fade top" />
            <div className="timepicker-selector" />
            <div className="timepicker-fade bottom" />
            <div
              ref={hourRef}
              className="timepicker-scroll"
              onScroll={handleHourScroll}
            >
              <div className="timepicker-spacer" />
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="timepicker-cell"
                  onClick={() => handleHourClick(i)}
                >
                  {String(i).padStart(2, '0')}
                </div>
              ))}
              <div className="timepicker-spacer" />
            </div>
          </div>

          <span className="timepicker-colon">:</span>

          {/* 분 컬럼 */}
          <div className="timepicker-col">
            <div className="timepicker-fade top" />
            <div className="timepicker-selector" />
            <div className="timepicker-fade bottom" />
            <div
              ref={minRef}
              className="timepicker-scroll"
              onScroll={handleMinScroll}
            >
              <div className="timepicker-spacer" />
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="timepicker-cell"
                  onClick={() => handleMinClick(i * 5)}
                >
                  {String(i * 5).padStart(2, '0')}
                </div>
              ))}
              <div className="timepicker-spacer" />
            </div>
          </div>
        </div>

        <div className="timepicker-footer">
          <button className="timepicker-confirm-btn" onClick={handleConfirm} type="button">
            확인
          </button>
          <button className="timepicker-cancel-btn" onClick={onClose} type="button">
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
