'use client';

import { useState, useEffect } from 'react';
import {
  IconMoon,
  IconSun,
  IconLogout,
  IconRefresh,
  IconQuestionMark,
} from '@tabler/icons-react';
import { DAYS } from '@/lib/dateUtils';

interface AppHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignOut?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onShowOnboarding: () => void;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function AppHeader({ theme, onToggleTheme, onSignOut, onRefresh, refreshing, onShowOnboarding }: AppHeaderProps) {
  const [clock, setClock] = useState('');
  const [todayDisplay, setTodayDisplay] = useState('');

  const isDark = theme === 'dark';
  const isRefreshing = !!refreshing;

  useEffect(() => {
    const update = () => {
      const n = new Date();
      setClock(`${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`);
      const day = DAYS[n.getDay()];
      setTodayDisplay(`${n.getFullYear()}년 ${pad(n.getMonth() + 1)}월 ${pad(n.getDate())}일 (${day})`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="header">
      <div className="header-top">
        <span className="title">📋 할 일 메모장</span>
        <div className="header-btns">

          {/* ? 온보딩 가이드 버튼 */}
          <button
            className="header-btn"
            onClick={onShowOnboarding}
            aria-label="사용 가이드"
            title="사용 가이드"
          >
            <IconQuestionMark size={15} aria-hidden />
          </button>

          {/* 새로고침 버튼 — onRefresh prop 있을 때만 */}
          {onRefresh && (
            <button
              className={`header-btn${isRefreshing ? ' spinning' : ''}`}
              onClick={onRefresh}
              aria-label="새로고침"
              title="새로고침"
            >
              <IconRefresh size={15} aria-hidden />
            </button>
          )}

          {/* 테마 전환 버튼 */}
          <button
            className="header-btn"
            onClick={onToggleTheme}
            aria-label={isDark ? '라이트 모드' : '다크 모드'}
            title={isDark ? '라이트 모드' : '다크 모드'}
          >
            {isDark
              ? <IconSun size={15} aria-hidden />
              : <IconMoon size={15} aria-hidden />
            }
          </button>

          {/* 로그아웃 버튼 — onSignOut prop 있을 때만 */}
          {onSignOut && (
            <button
              className="header-btn"
              onClick={onSignOut}
              aria-label="로그아웃"
              title="로그아웃"
            >
              <IconLogout size={15} aria-hidden />
            </button>
          )}

        </div>
      </div>
      <div className="today-info">
        <span className="today-date">{todayDisplay}</span>
        <span className="today-time">{clock}</span>
      </div>
    </div>
  );
}
