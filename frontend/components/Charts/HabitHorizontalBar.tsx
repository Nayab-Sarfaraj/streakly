'use client';

import { HABITS } from '@/lib/habits';
import HabitIcon from '@/components/HabitIcon';

interface HabitHorizontalBarProps {
  habitCounts: Record<string, number>;
  totalDays: number;
}

export default function HabitHorizontalBar({ habitCounts, totalDays }: HabitHorizontalBarProps) {
  const sorted = [...HABITS]
    .map(h => ({ ...h, count: habitCounts[h.id] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const max = Math.max(...sorted.map(h => h.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(habit => {
        const pct = totalDays > 0 ? Math.round((habit.count / totalDays) * 100) : 0;
        const barWidth = (habit.count / max) * 100;
        return (
          <div key={habit.id} className="flex items-center gap-3">
            <div className="w-28 flex items-center gap-2 flex-shrink-0">
              <HabitIcon name={habit.icon} size={12} strokeWidth={1.75} style={{ color: habit.color }} />
              <span className="text-xs text-muted-foreground truncate">{habit.name}</span>
            </div>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${barWidth}%`, background: habit.color }}
              />
            </div>
            <div className="w-16 text-right text-xs text-muted-foreground/50 flex-shrink-0 tabular-nums">
              {habit.count}d <span className="text-muted-foreground/30">({pct}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
