import type { ScheduleDate, ScheduleItem } from './types';

export const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function getToday(): ScheduleDate {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
}

export function parseDate(raw: string): ScheduleDate | null {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim().replace(/\s+/g, ' ');
  const y = getToday().y;

  const P: Array<[RegExp, (a: RegExpMatchArray) => [number, number, number] | null]> = [
    [/^(\d{4})[-.\s\/](\d{1,2})[-.\s\/](\d{1,2})$/, (a) => [+a[1], +a[2], +a[3]]],
    [/^(\d{2})(\d{2})(\d{2})$/, (a) => {
      const yy = +a[1], mm = +a[2], dd = +a[3];
      return (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) ? [2000 + yy, mm, dd] : null;
    }],
    [/^(\d{4})(\d{2})(\d{2})$/, (a) => [+a[1], +a[2], +a[3]]],
    [/^(\d{1,2})[-.\s\/](\d{1,2})$/, (a) => [y, +a[1], +a[2]]],
    [/^(\d{1,2})월\s*(\d{1,2})일?$/, (a) => [y, +a[1], +a[2]]],
    [/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일?$/, (a) => [+a[1], +a[2], +a[3]]],
    [/^(\d{1,2})(\d{2})$/, (a) => {
      const mm = +a[1], dd = +a[2];
      return (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) ? [y, mm, dd] : null;
    }],
  ];

  for (const [re, fn] of P) {
    const m = s.match(re);
    if (m) {
      const r = fn(m);
      if (r && r[1] >= 1 && r[1] <= 12 && r[2] >= 1 && r[2] <= 31) {
        return { y: r[0], m: r[1], d: r[2] };
      }
    }
  }
  return null;
}

export type FmtShortResult = { text: string; dayType: 'sat' | 'sun' | 'normal' };

export function fmtShort(dt: ScheduleDate | null): FmtShortResult | null {
  if (!dt) return null;
  const dow = new Date(dt.y, dt.m - 1, dt.d).getDay();
  const text = `${String(dt.m).padStart(2, '0')}월 ${String(dt.d).padStart(2, '0')}일(${DAYS[dow]})`;
  const dayType = dow === 6 ? 'sat' : dow === 0 ? 'sun' : 'normal';
  return { text, dayType };
}

export function dateKey(dt: ScheduleDate | null): string {
  if (!dt) return '99999999';
  return `${String(dt.y).padStart(4, '0')}${String(dt.m).padStart(2, '0')}${String(dt.d).padStart(2, '0')}`;
}

export function isTodayInRange(s: ScheduleDate | null, e: ScheduleDate | null): boolean {
  if (!s) return false;
  const t = getToday();
  const tk = `${String(t.y).padStart(4, '0')}${String(t.m).padStart(2, '0')}${String(t.d).padStart(2, '0')}`;
  if (!e) return dateKey(s) === tk;
  return dateKey(s) <= tk && tk <= dateKey(e);
}

export function isRange(it: ScheduleItem): boolean {
  return !!(it.dateEnd && dateKey(it.dateEnd) !== dateKey(it.date));
}

function startTimeMinutes(it: ScheduleItem): number | null {
  if (it.isAllDay) return null;
  if (!it.startedAt) return null;
  const m = it.startedAt.match(/T(\d{2}):(\d{2})/);
  if (!m) return null;
  return +m[1] * 60 + +m[2];
}

export function sortItems(a: ScheduleItem[]): ScheduleItem[] {
  return [...a].sort((a, b) => {
    const ka = dateKey(a.date), kb = dateKey(b.date);
    if (ka !== kb) return ka.localeCompare(kb);

    const ta = startTimeMinutes(a), tb = startTimeMinutes(b);
    if (ta === null && tb === null) return a.createdAt - b.createdAt;
    if (ta === null) return 1;
    if (tb === null) return -1;
    if (ta !== tb) return ta - tb;

    return a.createdAt - b.createdAt;
  });
}

// ── 시간 유틸 ──

const AM_WORDS = ['오전', '아침', '새벽'];
const PM_WORDS = ['오후', '점심', '저녁', '밤'];

export function parseTime(raw: string): { h: number; m: number } | null {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();

  const hasAM = AM_WORDS.some(w => s.includes(w)) || /\bam\b/i.test(s);
  const hasPM = PM_WORDS.some(w => s.includes(w)) || /\bpm\b/i.test(s);

  let stripped = s;
  for (const w of [...AM_WORDS, ...PM_WORDS]) {
    stripped = stripped.split(w).join('');
  }
  stripped = stripped.replace(/\bam\b/gi, '').replace(/\bpm\b/gi, '').trim();

  type PE = [RegExp, (a: RegExpMatchArray) => [number, number] | null];
  const patterns: PE[] = [
    [/^(\d{1,2}):(\d{2})$/, a => [+a[1], +a[2]]],
    [/^(\d{2})(\d{2})$/, a => {
      const hh = +a[1], mm = +a[2];
      return (hh <= 23 && mm <= 59) ? [hh, mm] : null;
    }],
    [/^(\d)(\d{2})$/, a => [+a[1], +a[2]]],
    [/^(\d{1,2})시\s*(\d{1,2})분$/, a => [+a[1], +a[2]]],
    [/^(\d{1,2})시$/, a => [+a[1], 0]],
    [/^(\d{1,2})$/, a => [+a[1], 0]],
  ];

  let h = -1, m = 0;
  for (const [re, fn] of patterns) {
    const match = stripped.match(re);
    if (match) {
      const result = fn(match);
      if (result) { [h, m] = result; break; }
    }
  }

  if (h === -1) return null;

  if (hasAM) {
    if (h === 12) h = 0;
  } else if (hasPM) {
    if (h !== 12) h = h + 12;
  }

  if (h < 0 || h > 23 || m < 0 || m > 59) return null;

  return { h, m };
}

export function fmtTime(h: number, m: number): string {
  const mStr = String(m).padStart(2, '0');
  if (h < 12) {
    const displayH = h === 0 ? 12 : h;
    return `오전 ${displayH}:${mStr}`;
  } else {
    const displayH = h === 12 ? 12 : h - 12;
    return `오후 ${displayH}:${mStr}`;
  }
}

export function timeToISO(date: ScheduleDate, h: number, m: number): string {
  const y = String(date.y).padStart(4, '0');
  const mo = String(date.m).padStart(2, '0');
  const d = String(date.d).padStart(2, '0');
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${y}-${mo}-${d}T${hh}:${mm}:00Z`;
}

// ── 뱃지 유틸 ──

export const calcDayDiff = (target: ScheduleDate): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(target.y, target.m - 1, target.d);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getBadgeInfo = (item: ScheduleItem): {
  isToday: boolean;
  isOngoing: boolean;
} => {
  const result = { isToday: false, isOngoing: false };
  if (!item.date) return result;

  const diff = calcDayDiff(item.date);
  const hasEnd = !!item.dateEnd;

  if (!hasEnd) {
    // 하루 일정 — 당일만 오늘
    if (diff === 0) result.isToday = true;

  } else {
    // 기간 일정
    const endDiff = calcDayDiff(item.dateEnd!);

    if (diff === 0) {
      // 시작일 = 오늘 → [오늘] + [진행중]
      result.isToday = true;
      result.isOngoing = true;

    } else if (diff < 0 && endDiff > 0) {
      // 오늘이 기간 중간 → [진행중]
      // 오늘이 기간 안에 포함되어 있으므로 [오늘]도 표시
      result.isToday = true;
      result.isOngoing = true;

    } else if (diff < 0 && endDiff === 0) {
      // 종료일 = 오늘 → [오늘] + [진행중]
      result.isToday = true;
      result.isOngoing = true;
    }
    // diff < 0 && endDiff < 0: 완전히 지남 → 없음
    // diff > 0: 아직 시작 전 → 없음
  }

  return result;
};
