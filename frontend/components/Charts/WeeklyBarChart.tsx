'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import dayjs from 'dayjs';
import { HabitLog } from '@/lib/api';

interface WeeklyBarChartProps {
  logs: HabitLog[];
  weekStart: dayjs.Dayjs;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyBarChart({ logs, weekStart }: WeeklyBarChartProps) {
  const today = dayjs().format('YYYY-MM-DD');

  const logMap = logs.reduce<Record<string, HabitLog>>((acc, l) => {
    acc[l.date] = l;
    return acc;
  }, {});

  const data = Array.from({ length: 7 }, (_, i) => {
    const d = weekStart.add(i, 'day');
    const dateStr = d.format('YYYY-MM-DD');
    const isFuture = dateStr > today;
    const log = logMap[dateStr];
    return {
      day: DAY_LABELS[i],
      count: isFuture ? 0 : (log?.completedCount ?? 0),
      isFuture,
      isToday: dateStr === today,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barSize={24}>
        <CartesianGrid strokeDasharray="2 4" stroke="#111" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: '#444', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 9]}
          ticks={[0, 3, 6, 9]}
          tick={{ fill: '#333', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#0d0d0d',
            border: '1px solid #1a1a1a',
            borderRadius: 4,
            color: '#ccc',
            fontSize: 12,
            padding: '6px 10px',
          }}
          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(val: any) => [`${val} habits`, '']}
          labelStyle={{ color: '#555', marginBottom: 2 }}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.isFuture ? '#111' : entry.isToday ? '#fff' : '#222'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
