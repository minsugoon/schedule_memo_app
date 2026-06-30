export interface ScheduleDate {
  y: number;
  m: number;
  d: number;
}

export interface ScheduleItem {
  id: number;
  date: ScheduleDate | null;
  dateRaw: string;
  dateEnd: ScheduleDate | null;
  dateEndRaw: string;
  memo: string;
  done: boolean;
  createdAt: number;
  category: 'personal' | 'work';
}

export type TabKey = 'all' | 'personal' | 'work';
export type ViewMode = 'tabs' | 'memo';
