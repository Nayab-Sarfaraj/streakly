'use client';

import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { api, AnalyticsSummary, HabitLog } from '@/lib/api';
import { HABITS, HABIT_MAP } from '@/lib/habits';
import TrendLineChart from '@/components/Charts/TrendLineChart';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [monthLogs, setMonthLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    const now = dayjs();
    Promise.all([
      api.getSummary(),
      api.getMonth(now.year(), now.month() + 1),
    ]).then(([s, logs]) => {
      setSummary(s);
      setMonthLogs(logs);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const logsWithData = monthLogs.filter(l => l.completedCount > 0);
  const totalDaysThisMonth = logsWithData.length;

  const consistencyData = HABITS.map(habit => {
    const done = logsWithData.filter(l => l.habits?.[habit.id]).length;
    const missed = totalDaysThisMonth - done;
    const pct = totalDaysThisMonth > 0 ? Math.round((done / totalDaysThisMonth) * 100) : 0;
    return { habit, done, missed, pct };
  }).sort((a, b) => b.pct - a.pct);

  if (loading) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 80, background: '#0d0d0d', borderRadius: 6 }} />
          ))}
        </div>
        <div style={{ height: 200, background: '#0d0d0d', borderRadius: 6 }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Analytics</div>
        <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
          {dayjs().format('MMMM YYYY')}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 32 }}>
        {[
          {
            label: 'Best habit',
            value: summary?.bestHabit ? HABIT_MAP[summary.bestHabit.id]?.name ?? '—' : '—',
            sub: summary?.bestHabit ? `${summary.bestHabit.daysThisMonth} days this month` : '',
            color: summary?.bestHabit ? HABIT_MAP[summary.bestHabit.id]?.color : undefined,
          },
          {
            label: 'Needs work',
            value: summary?.needsWork ? HABIT_MAP[summary.needsWork.id]?.name ?? '—' : '—',
            sub: summary?.needsWork ? `${summary.needsWork.daysThisMonth} days this month` : '',
            color: '#EF4444',
          },
          {
            label: 'Current streak',
            value: `${summary?.currentStreak ?? 0} days`,
            sub: `Longest: ${summary?.longestStreak ?? 0} days`,
            color: '#F59E0B',
          },
          {
            label: 'Monthly avg',
            value: `${Math.round((summary?.avgScoreThisMonth ?? 0) * 100)}%`,
            sub: `${summary?.totalDaysLogged ?? 0} total days logged`,
            color: '#3B82F6',
          },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#080808', border: '1px solid #111', borderRadius: 6, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: '#444', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: stat.color ?? '#e5e5e5', letterSpacing: '-0.02em' }}>
              {stat.value}
            </div>
            {stat.sub && <div style={{ fontSize: 11, color: '#333', marginTop: 4 }}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* Trend chart */}
      {logsWithData.length > 1 && (
        <div style={{ marginBottom: 32, borderTop: '1px solid #111', paddingTop: 24 }}>
          <div style={{ fontSize: 12, color: '#444', marginBottom: 16 }}>Daily score — this month</div>
          <TrendLineChart logs={logsWithData} />
        </div>
      )}

      {/* Horizontal completion bars */}
      {summary && (
        <div style={{ marginBottom: 32, borderTop: '1px solid #111', paddingTop: 24 }}>
          <div style={{ fontSize: 12, color: '#444', marginBottom: 16 }}>Completion rate this month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {HABITS.map(habit => {
              const count = summary.habitCounts[habit.id] ?? 0;
              const pct = totalDaysThisMonth > 0 ? Math.round((count / totalDaysThisMonth) * 100) : 0;
              return (
                <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 80, fontSize: 12, color: '#555', flexShrink: 0 }}>{habit.name}</div>
                  <div style={{ flex: 1, height: 4, background: '#111', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: habit.color, borderRadius: 2, transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ width: 36, textAlign: 'right', fontSize: 11, color: '#444', flexShrink: 0 }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Consistency table */}
      <div style={{ borderTop: '1px solid #111', paddingTop: 24 }}>
        <div style={{ fontSize: 12, color: '#444', marginBottom: 16 }}>Habit consistency</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #111' }}>
              {['Habit', 'Done', 'Missed', 'Rate', ''].map(h => (
                <th key={h} style={{ padding: '0 0 10px 0', textAlign: h === 'Habit' ? 'left' : 'center', fontSize: 10, color: '#333', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consistencyData.map(({ habit, done, missed, pct }) => (
              <tr key={habit.id} style={{ borderBottom: '1px solid #0d0d0d' }}>
                <td style={{ padding: '10px 0', fontSize: 12, color: '#888' }}>{habit.name}</td>
                <td style={{ padding: '10px 0', textAlign: 'center', fontSize: 12, color: '#10B981' }}>{done}</td>
                <td style={{ padding: '10px 0', textAlign: 'center', fontSize: 12, color: '#333' }}>{missed}</td>
                <td style={{ padding: '10px 0', textAlign: 'center', fontSize: 12, color: pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444' }}>
                  {pct}%
                </td>
                <td style={{ padding: '10px 0', paddingLeft: 12, width: 80 }}>
                  <div style={{ height: 2, background: '#111', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: habit.color, borderRadius: 1 }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
