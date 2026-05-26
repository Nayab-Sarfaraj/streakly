'use client';

import dayjs from 'dayjs';
import { HabitLog } from '@/lib/api';
import { getScoreColor } from '@/lib/utils';

interface CalendarHeatmapProps {
  logs: HabitLog[];
  year: number;
  month: number;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarHeatmap({ logs, year, month }: CalendarHeatmapProps) {
  const today = dayjs().format('YYYY-MM-DD');
  const logMap = logs.reduce<Record<string, HabitLog>>((acc, l) => {
    acc[l.date] = l;
    return acc;
  }, {});

  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
  const daysInMonth = firstDay.daysInMonth();

  // day of week for first day (0=Sun..6=Sat → convert to Mon-based: Mon=0)
  const rawDow = firstDay.day(); // 0=Sun
  const startOffset = rawDow === 0 ? 6 : rawDow - 1; // Mon-based offset

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs text-slate-500 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
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
              className={`relative aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all group cursor-default ${
                isToday ? 'ring-2 ring-white/40' : ''
              } ${isFuture ? 'opacity-30' : ''}`}
              style={{
                background: isFuture ? 'rgba(255,255,255,0.03)' : getScoreColor(score),
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span className={score > 0 && !isFuture ? 'text-white/90' : 'text-slate-500'}>
                {day}
              </span>

              {/* Tooltip */}
              {!isFuture && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 hidden group-hover:block pointer-events-none">
                  <div className="bg-[#1e2433] border border-white/10 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap shadow-xl">
                    <div className="font-semibold">{dayjs(dateStr).format('D MMM')}</div>
                    <div className="text-slate-300">{count}/9 habits {count >= 7 ? '✅' : count >= 4 ? '🟡' : '❌'}</div>
                    <div className="text-slate-400">{score}% score</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
        <span>Less</span>
        {[0, 25, 50, 75, 100].map(s => (
          <div
            key={s}
            className="w-4 h-4 rounded"
            style={{ background: getScoreColor(s), border: '1px solid rgba(255,255,255,0.05)' }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
