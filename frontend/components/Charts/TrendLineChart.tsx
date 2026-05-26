'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { HabitLog } from '@/lib/api';
import dayjs from 'dayjs';

interface TrendLineChartProps {
  logs: HabitLog[];
}

export default function TrendLineChart({ logs }: TrendLineChartProps) {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const data = sorted.map(l => ({
    date: dayjs(l.date).format('D MMM'),
    score: l.scorePercent,
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fff" stopOpacity={0.08} />
            <stop offset="95%" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="#111" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={{ fill: '#333', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip
          contentStyle={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 4, color: '#ccc', fontSize: 12, padding: '6px 10px' }}
          cursor={{ stroke: '#222' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(val: any) => [`${val}%`, 'Score']}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#fff"
          strokeWidth={1.5}
          fill="url(#scoreGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
