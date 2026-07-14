'use client';

import { useState, useEffect } from 'react';
import { IconMoon, IconSun, IconLogout, IconQuestionMark } from '@tabler/icons-react';
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
        <div className="flex items-center gap-2">
          <button className="theme-btn" onClick={onShowOnboarding} aria-label="사용법 안내">
            <IconQuestionMark size={13} aria-hidden />
          </button>
          {onRefresh && (
            <button className="theme-btn" onClick={onRefresh} aria-label="새로고침" disabled={refreshing}>
              <span className={refreshing ? 'animate-spin inline-block' : 'inline-block'}>🔄</span>
            </button>
          )}
          <button className="theme-btn" onClick={onToggleTheme} aria-label="테마 전환">
            {theme === 'dark'
              ? <><IconSun size={13} aria-hidden /> 밝음</>
              : <><IconMoon size={13} aria-hidden /> 어둠</>
            }
          </button>
          {onSignOut && (
            <button className="theme-btn" onClick={onSignOut} aria-label="로그아웃">
              <IconLogout size={13} aria-hidden /> 로그아웃
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
