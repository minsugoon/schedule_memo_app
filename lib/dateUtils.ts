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

export function fmtShort(dt: ScheduleDate | null): string | null {
  if (!dt) return null;
  const day = DAYS[new Date(dt.y, dt.m - 1, dt.d).getDay()];
  return `${String(dt.m).padStart(2, '0')}월 ${String(dt.d).padStart(2, '0')}일(${day})`;
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

export function sortItems(a: ScheduleItem[]): ScheduleItem[] {
  return [...a].sort((a, b) => {
    const ka = dateKey(a.date), kb = dateKey(b.date);
    return ka !== kb ? ka.localeCompare(kb) : a.createdAt - b.createdAt;
  });
}
