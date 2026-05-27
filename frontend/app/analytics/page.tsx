'use client';

import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { api, AnalyticsSummary, HabitLog } from '@/lib/api';
import { HABITS, HABIT_MAP } from '@/lib/habits';
import TrendLineChart from '@/components/Charts/TrendLineChart';
import WarningBanner, { Warning } from '@/components/WarningBanner';

function buildWarnings(summary: AnalyticsSummary | null, monthLogs: HabitLog[]): Warning[] {
  if (!summary) return [];
  const warnings: Warning[] = [];

  const logsWithData = monthLogs.filter(l => l.completedCount > 0);
  const totalDays = logsWithData.length;

  // Monthly avg below 50%
  const avgPct = Math.round((summary.avgScoreThisMonth ?? 0) * 100);
  if (totalDays >= 5 && avgPct < 50) {
    warnings.push({
      id: 'low-monthly-avg',
      level: 'critical',
      icon: 'trend',
      title: `Monthly average is ${avgPct}% — below the 50% target`,
      description: 'You need to complete at least 5 habits per day to stay on track.',
    });
  }

  // Streak broken (was active before, now 0)
  if (summary.longestStreak > 0 && summary.currentStreak === 0) {
    warnings.push({
      id: 'streak-broken',
      level: 'critical',
      icon: 'streak',
      title: 'Your streak has been broken',
      description: `Longest streak was ${summary.longestStreak} days. Start a new one today.`,
    });
  }

  // Habits with under 40% completion rate this month
  if (totalDays >= 5) {
    const lowHabits = HABITS.filter(h => {
      const count = summary.habitCounts[h.id] ?? 0;
      const pct = totalDays > 0 ? (count / totalDays) * 100 : 0;
      return pct < 40;
    });
    if (lowHabits.length >= 3) {
      warnings.push({
        id: 'many-low-habits',
        level: 'warning',
        icon: 'alert',
        title: `${lowHabits.length} habits below 40% completion this month`,
        description: lowHabits.map(h => h.name).join(', '),
      });
    } else if (lowHabits.length > 0) {
      lowHabits.forEach(h => {
        const count = summary.habitCounts[h.id] ?? 0;
        const pct = totalDays > 0 ? Math.round((count / totalDays) * 100) : 0;
        warnings.push({
          id: `low-habit-${h.id}`,
          level: 'warning',
          icon: 'trend',
          title: `${h.name} is at ${pct}% this month`,
          description: `Done ${count} out of ${totalDays} logged days.`,
        });
      });
    }
  }

  // More than 5 days this month with zero completions (logged but empty)
  const zeroDays = monthLogs.filter(l => l.completedCount === 0).length;
  if (zeroDays >= 5) {
    warnings.push({
      id: 'many-zero-days',
      level: 'warning',
      icon: 'x',
      title: `${zeroDays} days this month with zero habits logged`,
      description: 'Consistency matters more than perfect days.',
    });
  }

  return warnings;
}

export default function AnalyticsPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.getSummary(),
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });

  const now = dayjs();
  const { data: monthLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['month', now.year(), now.month() + 1],
    queryFn: () => api.getMonth(now.year(), now.month() + 1),
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });

  const loading = loadingSummary || loadingLogs;
  const logsWithData = monthLogs.filter(l => l.completedCount > 0);
  const totalDaysThisMonth = logsWithData.length;

  const warnings = buildWarnings(summary ?? null, monthLogs);

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
          {now.format('MMMM YYYY')}
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <WarningBanner warnings={warnings} />
        </div>
      )}

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
                  <div style={{ width: 36, textAlign: 'right', fontSize: 11, color: pct < 40 ? '#EF4444' : '#444', flexShrink: 0 }}>{pct}%</div>
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
            {HABITS.map(habit => {
              const count = summary?.habitCounts[habit.id] ?? 0;
              const missed = totalDaysThisMonth - count;
              const pct = totalDaysThisMonth > 0 ? Math.round((count / totalDaysThisMonth) * 100) : 0;
              return (
                <tr key={habit.id} style={{ borderBottom: '1px solid #0d0d0d' }}>
                  <td style={{ padding: '10px 0', fontSize: 12, color: '#888' }}>{habit.name}</td>
                  <td style={{ padding: '10px 0', textAlign: 'center', fontSize: 12, color: '#10B981' }}>{count}</td>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
