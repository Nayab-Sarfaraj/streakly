'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { YearMonth } from '@/lib/api';

interface YearlyLineChartProps {
  data: YearMonth[];
}

export default function YearlyLineChart({ data }: YearlyLineChartProps) {
  const chartData = data.map(d => ({
    month: d.month,
    score: Math.round(d.scoreAvg * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#111" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: '#333', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip
          contentStyle={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 4, color: '#ccc', fontSize: 12, padding: '6px 10px' }}
          cursor={{ stroke: '#222' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(val: any) => [`${val}%`, 'Avg score']}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#fff"
          strokeWidth={1.5}
          dot={{ fill: '#fff', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
