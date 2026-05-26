'use client';

import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, HabitLog } from '@/lib/api';
import { HABITS } from '@/lib/habits';
import { getWeekStart } from '@/lib/utils';
import HabitIcon from '@/components/HabitIcon';
import WeeklyBarChart from '@/components/Charts/WeeklyBarChart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(dayjs()));
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeek = useCallback((start: dayjs.Dayjs) => {
    setLoading(true);
    api.getWeek(start.format('YYYY-MM-DD'))
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchWeek(weekStart);
    const interval = setInterval(() => fetchWeek(weekStart), 60000);
    return () => clearInterval(interval);
  }, [weekStart, fetchWeek]);

  const weekEnd = weekStart.add(6, 'day');
  const today = dayjs().format('YYYY-MM-DD');
  const isCurrentWeek = getWeekStart(dayjs()).format('YYYY-MM-DD') === weekStart.format('YYYY-MM-DD');

  const logMap = logs.reduce<Record<string, HabitLog>>((acc, l) => {
    acc[l.date] = l;
    return acc;
  }, {});

  const dates = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Weekly</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {weekStart.format('D MMM')} — {weekEnd.format('D MMM YYYY')}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={() => setWeekStart(w => w.subtract(7, 'day'))}>
            <ChevronLeft size={14} />
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => setWeekStart(getWeekStart(dayjs()))}
            disabled={isCurrentWeek}
          >
            This week
          </Button>
          <Button
            variant="outline" size="icon"
            onClick={() => setWeekStart(w => w.add(7, 'day'))}
            disabled={weekStart.isAfter(dayjs())}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* ── Grid: habits = rows, days = columns ── */}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full border-collapse">

              <thead>
                <tr className="border-b border-border bg-card/60">
                  {/* Habit column — icon-only on mobile, icon+name on desktop */}
                  <th className="py-3 text-left text-xs font-medium text-muted-foreground"
                      style={{ width: 44, paddingLeft: 10 }}>
                    <span className="hidden sm:inline">Habit</span>
                  </th>

                  {/* Day columns */}
                  {dates.map((d, i) => {
                    const dateStr = d.format('YYYY-MM-DD');
                    const isToday = dateStr === today;
                    return (
                      <th
                        key={i}
                        className="py-3 text-center"
                        style={{ width: 36, ...(isToday ? { background: 'hsl(0 0% 8%)' } : {}) }}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-[10px] font-medium ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {DAY_LABELS[i].slice(0, 1)}
                            <span className="hidden sm:inline">{DAY_LABELS[i].slice(1)}</span>
                          </span>
                          <span className={`text-[10px] ${isToday ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                            {d.format('D')}
                          </span>
                        </div>
                      </th>
                    );
                  })}

                  {/* Total column */}
                  <th className="py-3 text-center text-[10px] font-medium text-muted-foreground" style={{ width: 28 }}>
                    /7
                  </th>
                </tr>
              </thead>

              <tbody>
                {HABITS.map((habit) => {
                  const weekTotal = dates.filter(d => {
                    const log = logMap[d.format('YYYY-MM-DD')];
                    return log?.habits?.[habit.id];
                  }).length;

                  return (
                    <tr
                      key={habit.id}
                      className="border-b border-border/40 last:border-0 transition-colors hover:bg-accent/10"
                    >
                      {/* Habit label: icon only on mobile, icon+name on sm+ */}
                      <td className="py-2.5" style={{ paddingLeft: 8, paddingRight: 4 }}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                            style={{ background: habit.color + '18' }}
                          >
                            <HabitIcon
                              name={habit.icon}
                              size={13}
                              strokeWidth={1.75}
                              style={{ color: habit.color }}
                            />
                          </div>
                          <span className="hidden sm:inline text-sm text-muted-foreground whitespace-nowrap">
                            {habit.name}
                          </span>
                        </div>
                      </td>

                      {/* Day cells */}
                      {dates.map((d, di) => {
                        const dateStr = d.format('YYYY-MM-DD');
                        const isFuture = dateStr > today;
                        const isToday = dateStr === today;
                        const log = logMap[dateStr];
                        const done = log?.habits?.[habit.id];

                        return (
                          <td
                            key={di}
                            className="py-2.5 text-center"
                            style={isToday ? { background: 'hsl(0 0% 6%)' } : {}}
                          >
                            {isFuture ? (
                              <div className="w-2 h-2 rounded-full bg-border/20 mx-auto" />
                            ) : done ? (
                              <div
                                className="w-2.5 h-2.5 rounded-full mx-auto"
                                style={{
                                  background: habit.color,
                                  boxShadow: `0 0 6px ${habit.color}60`,
                                }}
                              />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full border border-border/30 mx-auto" />
                            )}
                          </td>
                        );
                      })}

                      {/* Weekly total */}
                      <td className="py-2.5 text-center">
                        <span
                          className="text-[11px] font-medium tabular-nums"
                          style={{ color: weekTotal >= 5 ? habit.color : 'hsl(0 0% 28%)' }}
                        >
                          {weekTotal}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer: daily totals */}
              <tfoot>
                <tr className="border-t border-border bg-card/40">
                  <td className="py-2 text-[10px] text-muted-foreground/40" style={{ paddingLeft: 10 }}>
                    <span className="hidden sm:inline">Daily total</span>
                    <span className="sm:hidden">Tot</span>
                  </td>
                  {dates.map((d, i) => {
                    const dateStr = d.format('YYYY-MM-DD');
                    const isFuture = dateStr > today;
                    const isToday = dateStr === today;
                    const log = logMap[dateStr];
                    const count = log?.completedCount ?? 0;
                    return (
                      <td
                        key={i}
                        className="py-2 text-center"
                        style={isToday ? { background: 'hsl(0 0% 6%)' } : {}}
                      >
                        {isFuture ? (
                          <span className="text-[10px] text-muted-foreground/15">—</span>
                        ) : (
                          <span
                            className="text-[10px] font-semibold tabular-nums"
                            style={{
                              color: count >= 7 ? '#10B981' : count >= 4 ? '#F59E0B' : 'hsl(0 0% 30%)',
                            }}
                          >
                            {count}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bar chart */}
          <div className="mt-8 sm:mt-10">
            <Separator className="mb-6" />
            <p className="text-xs text-muted-foreground mb-5">Daily completions</p>
            <WeeklyBarChart logs={logs} weekStart={weekStart} />
          </div>
        </>
      )}
    </div>
  );
}
