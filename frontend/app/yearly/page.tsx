'use client';

import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { api, YearMonth } from '@/lib/api';
import { HABITS } from '@/lib/habits';
import YearlyLineChart from '@/components/Charts/YearlyLineChart';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function YearlyPage() {
  const now = dayjs();
  const [year, setYear] = useState(now.year());
  const [data, setData] = useState<YearMonth[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchYear = useCallback((y: number) => {
    setLoading(true);
    api.getYear(y).then(setData).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchYear(year);
    const interval = setInterval(() => fetchYear(year), 60000);
    return () => clearInterval(interval);
  }, [year, fetchYear]);

  const isCurrentYear = year === now.year();
  const hasData = data.some(d => d.completedTotal > 0);

  const bestMonth = [...data].sort((a, b) => b.scoreAvg - a.scoreAvg)[0];
  const bestHabitYear = data.reduce<Record<string, number>>((acc, d) => {
    if (d.bestHabit) acc[d.bestHabit] = (acc[d.bestHabit] ?? 0) + 1;
    return acc;
  }, {});
  const bestHabitId = Object.entries(bestHabitYear).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bestHabitName = HABITS.find(h => h.id === bestHabitId)?.name ?? '—';

  // Build per-habit per-month counts from real backend data
  const allMonthLogs: Record<string, Record<string, number>> = {};
  data.forEach(d => {
    allMonthLogs[d.month] = d.habitCounts ?? {};
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Yearly</div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{year}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setYear(y => y - 1)} style={btnStyle}>{year - 1}</button>
          <button onClick={() => setYear(now.year())} disabled={isCurrentYear} style={{ ...btnStyle, opacity: isCurrentYear ? 0.3 : 1 }}>
            {now.year()}
          </button>
          <button onClick={() => setYear(y => y + 1)} disabled={isCurrentYear} style={{ ...btnStyle, opacity: isCurrentYear ? 0.3 : 1 }}>
            {year + 1}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 200, background: '#0d0d0d', borderRadius: 6 }} />
      ) : !hasData ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#333', fontSize: 13 }}>
          No data for {year}
        </div>
      ) : (
        <>
          {/* Line chart */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 12, color: '#444', marginBottom: 16 }}>Monthly avg score</div>
            <YearlyLineChart data={data} />
          </div>

          {/* Habit x Month heatmap */}
          <div style={{ borderTop: '1px solid #111', paddingTop: 32, marginBottom: 40 }}>
            <div style={{ fontSize: 12, color: '#444', marginBottom: 16 }}>Habit consistency</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: 90, textAlign: 'left', paddingBottom: 10, fontSize: 10, color: '#333', fontWeight: 400 }}>Habit</th>
                    {MONTHS.map(m => (
                      <th key={m} style={{ textAlign: 'center', paddingBottom: 10, fontSize: 10, color: '#333', fontWeight: 400, minWidth: 32 }}>{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HABITS.map(habit => (
                    <tr key={habit.id} style={{ borderTop: '1px solid #0d0d0d' }}>
                      <td style={{ padding: '6px 0', fontSize: 11, color: '#555' }}>{habit.name}</td>
                      {MONTHS.map((m, mi) => {
                        const count = allMonthLogs[m]?.[habit.id] ?? 0;
                        const maxDays = [31,28,31,30,31,30,31,31,30,31,30,31][mi];
                        const intensity = count / maxDays;
                        return (
                          <td key={m} style={{ padding: '6px 2px', textAlign: 'center' }}>
                            <div
                              title={`${habit.name} — ${m}: ~${count} days`}
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 3,
                                margin: '0 auto',
                                background: count === 0
                                  ? '#0d0d0d'
                                  : `${habit.color}${Math.round(intensity * 200 + 40).toString(16).padStart(2, '0')}`,
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'Best month', value: bestMonth?.scoreAvg > 0 ? bestMonth.month : '—', sub: bestMonth?.scoreAvg > 0 ? `${Math.round(bestMonth.scoreAvg * 100)}% avg` : '' },
              { label: 'Best habit', value: bestHabitName, sub: bestHabitId ? `Top in ${bestHabitYear[bestHabitId]} months` : '' },
              { label: 'Active months', value: `${data.filter(d => d.completedTotal > 0).length} / 12`, sub: 'months with data' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#080808', border: '1px solid #111', borderRadius: 6, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: '#444', marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#e5e5e5', letterSpacing: '-0.02em' }}>{stat.value}</div>
                {stat.sub && <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>{stat.sub}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#0d0d0d',
  border: '1px solid #1a1a1a',
  borderRadius: 5,
  color: '#888',
  fontSize: 12,
  cursor: 'pointer',
};
