'use client';

import { useState, useEffect } from 'react';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { DAYS } from '@/lib/dateUtils';

interface AppHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function AppHeader({ theme, onToggleTheme }: AppHeaderProps) {
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
        <button className="theme-btn" onClick={onToggleTheme} aria-label="테마 전환">
          {theme === 'dark'
            ? <><IconSun size={13} aria-hidden /> 밝음</>
            : <><IconMoon size={13} aria-hidden /> 어둠</>
          }
        </button>
      </div>
      <div className="today-info">
        <span className="today-date">{todayDisplay}</span>
        <span className="today-time">{clock}</span>
      </div>
    </div>
  );
}
