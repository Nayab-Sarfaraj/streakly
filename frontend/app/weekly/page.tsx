'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, HabitLog } from '@/lib/api';
import { HABITS } from '@/lib/habits';
import { getWeekStart } from '@/lib/utils';
import HabitIcon from '@/components/HabitIcon';
import WeeklyBarChart from '@/components/Charts/WeeklyBarChart';
import WarningBanner, { Warning } from '@/components/WarningBanner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildWarnings(logs: HabitLog[], weekStart: dayjs.Dayjs, isCurrentWeek: boolean): Warning[] {
  if (!isCurrentWeek) return [];
  const warnings: Warning[] = [];
  const today = dayjs();
  const dayOfWeek = today.day() === 0 ? 6 : today.day() - 1; // 0=Mon … 6=Sun
  const daysElapsed = dayOfWeek + 1; // how many days have passed incl. today

  const logMap = logs.reduce<Record<string, HabitLog>>((acc, l) => { acc[l.date] = l; return acc; }, {});

  // Total dots so far this week
  const pastDates = Array.from({ length: daysElapsed }, (_, i) =>
    weekStart.add(i, 'day').format('YYYY-MM-DD')
  );
  const totalDone = pastDates.reduce((sum, d) => sum + (logMap[d]?.completedCount ?? 0), 0);
  const maxPossible = daysElapsed * 9;
  const weekPacePct = maxPossible > 0 ? (totalDone / maxPossible) * 100 : 0;

  // Mid-week (Wed+) with low overall pace
  if (daysElapsed >= 3 && weekPacePct < 40) {
    warnings.push({
      id: 'low-week-pace',
      level: 'warning',
      icon: 'trend',
      title: `Week pace is at ${Math.round(weekPacePct)}% — below target`,
      description: `${totalDone} completions out of ${maxPossible} possible so far this week.`,
    });
  }

  // Any habit with 0 completions by Wednesday or later
  if (daysElapsed >= 3) {
    const zeroHabits = HABITS.filter(habit =>
      pastDates.every(d => !logMap[d]?.habits?.[habit.id])
    );
    if (zeroHabits.length > 0) {
      warnings.push({
        id: 'zero-habits',
        level: zeroHabits.length >= 3 ? 'critical' : 'warning',
        icon: 'x',
        title: `${zeroHabits.length} habit${zeroHabits.length > 1 ? 's' : ''} not done once this week`,
        description: zeroHabits.map(h => h.name).join(', '),
      });
    }
  }

  // Today not logged yet and it's past noon
  const todayStr = today.format('YYYY-MM-DD');
  if (today.hour() >= 12 && (logMap[todayStr]?.completedCount ?? 0) === 0) {
    warnings.push({
      id: 'today-empty',
      level: 'warning',
      icon: 'clock',
      title: "Today hasn't been logged yet",
      description: "Head to Today view to check off your habits.",
    });
  }

  return warnings;
}

export default function WeeklyPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(dayjs()));

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['week', weekStart.format('YYYY-MM-DD')],
    queryFn: () => api.getWeek(weekStart.format('YYYY-MM-DD')),
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });

  const weekEnd = weekStart.add(6, 'day');
  const today = dayjs().format('YYYY-MM-DD');
  const isCurrentWeek = getWeekStart(dayjs()).format('YYYY-MM-DD') === weekStart.format('YYYY-MM-DD');

  const logMap = logs.reduce<Record<string, HabitLog>>((acc, l) => {
    acc[l.date] = l;
    return acc;
  }, {});

  const dates = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  const warnings = buildWarnings(logs, weekStart, isCurrentWeek);

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

      {/* Warnings */}
      {warnings.length > 0 && (
        <WarningBanner warnings={warnings} className="mb-6" />
      )}

      {isLoading ? (
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
                  <th className="py-3 text-left text-xs font-medium text-muted-foreground"
                      style={{ width: 44, paddingLeft: 10 }}>
                    <span className="hidden sm:inline">Habit</span>
                  </th>

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
