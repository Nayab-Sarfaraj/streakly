import axios from 'axios';

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

export interface HabitLog {
  _id?: string;
  userId: string;
  date: string;
  habits: Record<string, boolean>;
  completedCount: number;
  scorePercent: number;
}

export interface YearMonth {
  month: string;
  completedTotal: number;
  scoreAvg: number;
  bestHabit: string | null;
}

export interface AnalyticsSummary {
  bestHabit: { id: string; name: string; daysThisMonth: number };
  needsWork: { id: string; name: string; daysThisMonth: number };
  currentStreak: number;
  longestStreak: number;
  avgScoreThisMonth: number;
  totalDaysLogged: number;
  habitCounts: Record<string, number>;
}

export const api = {
  getToday: () =>
    client.get<HabitLog>('/api/logs/today').then(r => r.data),

  putToday: (habits: Record<string, boolean>) =>
    client.put<HabitLog>('/api/logs/today', { habits }).then(r => r.data),

  getWeek: (start: string) =>
    client.get<HabitLog[]>('/api/logs/week', { params: { start } }).then(r => r.data),

  getMonth: (year: number, month: number) =>
    client.get<HabitLog[]>('/api/logs/month', {
      params: { year, month: String(month).padStart(2, '0') },
    }).then(r => r.data),

  getYear: (year: number) =>
    client.get<YearMonth[]>('/api/logs/year', { params: { year } }).then(r => r.data),

  getSummary: () =>
    client.get<AnalyticsSummary>('/api/analytics/summary').then(r => r.data),
};
