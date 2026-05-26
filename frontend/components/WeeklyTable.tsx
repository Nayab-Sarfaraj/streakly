'use client';

import dayjs from 'dayjs';
import { HABITS } from '@/lib/habits';
import { HabitLog } from '@/lib/api';
import HabitIcon from '@/components/HabitIcon';

interface WeeklyTableProps {
  logs: HabitLog[];
  weekStart: dayjs.Dayjs;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyTable({ logs, weekStart }: WeeklyTableProps) {
  const today = dayjs().format('YYYY-MM-DD');
  const logMap = logs.reduce<Record<string, HabitLog>>((acc, l) => {
    acc[l.date] = l;
    return acc;
  }, {});
  const dates = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium w-36">Habit</th>
            {dates.map((d, i) => {
              const dateStr = d.format('YYYY-MM-DD');
              const isToday = dateStr === today;
              return (
                <th key={i} className="px-3 py-3 text-center font-medium">
                  <div className={`inline-flex flex-col items-center gap-0.5 ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                    <span className="text-[10px]">{DAY_LABELS[i]}</span>
                    <span className={`text-xs ${isToday ? 'font-semibold' : 'font-normal'}`}>{d.format('D')}</span>
                  </div>
                </th>
              );
            })}
            <th className="px-3 py-3 text-center text-xs text-muted-foreground font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {HABITS.map(habit => {
            const weekCount = dates.filter(d => {
              const log = logMap[d.format('YYYY-MM-DD')];
              return log?.habits?.[habit.id];
            }).length;
            return (
              <tr key={habit.id} className="border-b border-border/40 hover:bg-accent/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <HabitIcon name={habit.icon} size={12} strokeWidth={1.75} style={{ color: habit.color }} />
                    <span className="text-xs text-muted-foreground">{habit.name}</span>
                  </div>
                </td>
                {dates.map((d, i) => {
                  const dateStr = d.format('YYYY-MM-DD');
                  const isFuture = dateStr > today;
                  const log = logMap[dateStr];
                  const done = log?.habits?.[habit.id];
                  return (
                    <td key={i} className="px-3 py-3 text-center">
                      {isFuture ? (
                        <div className="w-2 h-2 rounded-full bg-border/20 mx-auto" />
                      ) : done ? (
                        <div className="w-2 h-2 rounded-full mx-auto" style={{ background: habit.color, boxShadow: `0 0 5px ${habit.color}55` }} />
                      ) : (
                        <div className="w-2 h-2 rounded-full border border-border/40 mx-auto" />
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center">
                  <span className="text-xs font-medium tabular-nums" style={{ color: weekCount >= 5 ? habit.color : 'hsl(0 0% 30%)' }}>
                    {weekCount}/7
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-card/50">
            <td className="px-4 py-2.5 text-xs text-muted-foreground/50">Daily total</td>
            {dates.map((d, i) => {
              const dateStr = d.format('YYYY-MM-DD');
              const isFuture = dateStr > today;
              const log = logMap[dateStr];
              const count = log?.completedCount ?? 0;
              return (
                <td key={i} className="px-3 py-2.5 text-center">
                  {isFuture ? (
                    <span className="text-xs text-muted-foreground/20">—</span>
                  ) : (
                    <span className={`text-xs font-medium tabular-nums ${count >= 7 ? 'text-emerald-400' : count >= 4 ? 'text-amber-400' : 'text-muted-foreground/40'}`}>
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
  );
}
