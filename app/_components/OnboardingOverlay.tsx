'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

interface OnboardingOverlayProps {
  onFinish: () => void;
}

interface OnboardingStep {
  targetId: string;
  title: string;
  description: string;
}

const STEPS: OnboardingStep[] = [
  {
    targetId: 'onboarding-done-btn',
    title: '완료 항목 보기',
    description: '완료된 일정을 표시하거나 숨깁니다.',
  },
  {
    targetId: 'onboarding-memo-btn',
    title: '메모 보기',
    description: '날짜 없는 메모만 모아보는 전용 화면입니다.',
  },
  {
    targetId: 'onboarding-add-tab-btn',
    title: '탭 추가',
    description: '새 탭을 추가합니다 (최대 5개, 이름 2글자).',
  },
  {
    targetId: 'onboarding-card-area',
    title: '카드 펼치기',
    description: '카드를 누르면 전체 내용과 수정·삭제 버튼이 나타납니다.',
  },
];

const TOOLTIP_WIDTH = 280;
const HIGHLIGHT_PADDING = 6;

export default function OnboardingOverlay({ onFinish }: OnboardingOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  useEffect(() => {
    // 렌더링 완료 후 대상 요소 위치 측정
    const timer = setTimeout(() => {
      const el = document.getElementById(step.targetId);
      setRect(el ? el.getBoundingClientRect() : null);
    }, 0);
    return () => clearTimeout(timer);
  }, [step.targetId]);

  const handleNext = () => {
    if (isLastStep) {
      onFinish();
    } else {
      setStepIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const highlightStyle: CSSProperties = rect
    ? {
        top: rect.top - HIGHLIGHT_PADDING,
        left: rect.left - HIGHLIGHT_PADDING,
        width: rect.width + HIGHLIGHT_PADDING * 2,
        height: rect.height + HIGHLIGHT_PADDING * 2,
      }
    : {};

  let placement: 'bottom' | 'top' | 'center' = 'center';
  let tooltipStyle: CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  if (rect && typeof window !== 'undefined') {
    const centerX = rect.left + rect.width / 2;
    const left = Math.max(
      12,
      Math.min(centerX - TOOLTIP_WIDTH / 2, window.innerWidth - TOOLTIP_WIDTH - 12)
    );

    if (rect.top > window.innerHeight * 0.55) {
      placement = 'top';
      tooltipStyle = { left, top: rect.top - 14, transform: 'translateY(-100%)' };
    } else {
      placement = 'bottom';
      tooltipStyle = { left, top: rect.bottom + 14 };
    }
  }

  return (
    <div className="onboarding-overlay" onClick={handleSkip}>
      {rect && <div className="onboarding-highlight" style={highlightStyle} />}
      <div
        className={`onboarding-tooltip ${placement}`}
        style={{ width: TOOLTIP_WIDTH, ...tooltipStyle }}
        onClick={e => e.stopPropagation()}
      >
        <div className="onboarding-tooltip-title">{step.title}</div>
        <div className="onboarding-tooltip-desc">{step.description}</div>
        <div className="onboarding-tooltip-footer">
          <span className="onboarding-progress">{stepIndex + 1}/{STEPS.length}</span>
          <div className="onboarding-tooltip-actions">
            <button className="onboarding-btn onboarding-btn-skip" onClick={handleSkip}>
              건너뛰기
            </button>
            <button className="onboarding-btn onboarding-btn-next" onClick={handleNext}>
              {isLastStep ? '완료' : '다음 →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
