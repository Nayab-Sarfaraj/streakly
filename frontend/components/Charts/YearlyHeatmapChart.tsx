'use client';

import { HABITS } from '@/lib/habits';
import HabitIcon from '@/components/HabitIcon';
import { YearMonth } from '@/lib/api';

interface YearlyHeatmapChartProps {
  data: YearMonth[];
  allMonthLogs: Record<string, Record<string, number>>;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function YearlyHeatmapChart({ allMonthLogs }: YearlyHeatmapChartProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left pb-3 text-muted-foreground/50 font-normal w-28">Habit</th>
            {MONTHS.map(m => (
              <th key={m} className="pb-3 text-center text-muted-foreground/50 font-normal">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HABITS.map(habit => (
            <tr key={habit.id} className="border-t border-border/30">
              <td className="py-1.5 pr-3">
                <div className="flex items-center gap-1.5">
                  <HabitIcon name={habit.icon} size={11} strokeWidth={1.75} style={{ color: habit.color }} />
                  <span className="text-muted-foreground/60 text-[11px]">{habit.name}</span>
                </div>
              </td>
              {MONTHS.map((m, mi) => {
                const count = allMonthLogs[m]?.[habit.id] ?? 0;
                const maxDays = [31,28,31,30,31,30,31,31,30,31,30,31][mi];
                const intensity = count / maxDays;
                return (
                  <td key={m} className="py-1.5 px-0.5 text-center">
                    <div
                      className="w-5 h-5 rounded mx-auto"
                      title={`${habit.name} — ${m}: ~${count} days`}
                      style={{
                        background: count === 0
                          ? 'hsl(0 0% 6%)'
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
  );
}
