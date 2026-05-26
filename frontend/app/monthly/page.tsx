'use client';

import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, HabitLog } from '@/lib/api';
import { HABITS } from '@/lib/habits';
import { getScoreColor } from '@/lib/utils';
import HabitIcon from '@/components/HabitIcon';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MonthlyPage() {
  const now = dayjs();
  const [year, setYear] = useState(now.year());
  const [month, setMonth] = useState(now.month() + 1);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonth = useCallback((y: number, m: number) => {
    setLoading(true);
    api.getMonth(y, m).then(setLogs).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMonth(year, month);
    const interval = setInterval(() => fetchMonth(year, month), 60000);
    return () => clearInterval(interval);
  }, [year, month, fetchMonth]);

  const isCurrentMonth = year === now.year() && month === now.month() + 1;
  const today = dayjs().format('YYYY-MM-DD');
  const monthLabel = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('MMMM YYYY');

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const logMap = logs.reduce<Record<string, HabitLog>>((acc, l) => {
    acc[l.date] = l;
    return acc;
  }, {});

  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
  const daysInMonth = firstDay.daysInMonth();
  const rawDow = firstDay.day();
  const startOffset = rawDow === 0 ? 6 : rawDow - 1;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const logsWithData = logs.filter(l => l.completedCount > 0);
  const hasData = logsWithData.length > 0;
  const bestDay = hasData ? [...logsWithData].sort((a, b) => b.completedCount - a.completedCount)[0] : null;
  const avgScore = hasData ? Math.round(logsWithData.reduce((s, l) => s + l.scorePercent, 0) / logsWithData.length) : 0;
  const totalCompletions = logsWithData.reduce((s, l) => s + l.completedCount, 0);

  const habitCounts = HABITS.map(h => ({
    habit: h,
    count: logsWithData.filter(l => l.habits?.[h.id]).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Monthly</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft size={14} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setYear(now.year()); setMonth(now.month() + 1); }} disabled={isCurrentMonth}>
            This month
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} disabled={isCurrentMonth}>
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square rounded bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Calendar */}
          <div className="rounded-lg border border-border p-4">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-[10px] text-muted-foreground/50 pb-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isFuture = dateStr > today;
                const isToday = dateStr === today;
                const log = logMap[dateStr];
                const score = log?.scorePercent ?? 0;
                const count = log?.completedCount ?? 0;

                return (
                  <div
                    key={i}
                    title={!isFuture ? `${dayjs(dateStr).format('D MMM')} — ${count}/9` : ''}
                    className="aspect-square rounded flex items-center justify-center text-[11px] cursor-default transition-colors relative"
                    style={{
                      background: isFuture ? 'hsl(0 0% 4%)' : getScoreColor(score),
                      outline: isToday ? '1.5px solid hsl(0 0% 70%)' : 'none',
                      outlineOffset: '-1px',
                      color: score > 0 && !isFuture ? 'hsl(0 0% 65%)' : 'hsl(0 0% 22%)',
                      opacity: isFuture ? 0.4 : 1,
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground/40">Less</span>
              {[0, 25, 50, 75, 100].map(s => (
                <div key={s} className="w-3 h-3 rounded-sm" style={{ background: getScoreColor(s) }} />
              ))}
              <span className="text-[10px] text-muted-foreground/40">More</span>
            </div>
          </div>

          {!hasData ? (
            <p className="text-center py-12 text-sm text-muted-foreground/40">No data for this month</p>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { label: 'Best day', value: bestDay ? dayjs(bestDay.date).format('D MMM') : '—', sub: bestDay ? `${bestDay.completedCount}/9 habits` : '' },
                  { label: 'Avg score', value: `${avgScore}%`, sub: `${logsWithData.length} days logged` },
                  { label: 'Completions', value: String(totalCompletions), sub: 'this month' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-[11px] text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-lg font-semibold tracking-tight text-foreground">{stat.value}</p>
                    {stat.sub && <p className="text-[11px] text-muted-foreground/50 mt-0.5">{stat.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Per-habit bars */}
              <div className="mt-6">
                <Separator className="mb-5" />
                <p className="text-xs text-muted-foreground mb-4">Habit completions</p>
                <div className="space-y-3">
                  {habitCounts.map(({ habit, count }) => {
                    const pct = daysInMonth > 0 ? (count / daysInMonth) * 100 : 0;
                    return (
                      <div key={habit.id} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-28 flex-shrink-0">
                          <HabitIcon name={habit.icon} size={12} strokeWidth={1.75} style={{ color: habit.color }} />
                          <span className="text-xs text-muted-foreground truncate">{habit.name}</span>
                        </div>
                        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: habit.color }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground/50 w-6 text-right tabular-nums">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
