'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { HABITS } from '@/lib/habits';
import { HabitLog } from '@/lib/api';

interface MonthlyHabitBarProps {
  logs: HabitLog[];
}

export default function MonthlyHabitBar({ logs }: MonthlyHabitBarProps) {
  const data = HABITS.map(habit => {
    const count = logs.filter(l => l.habits?.[habit.id]).length;
    return { name: habit.name.split(' ')[0], fullName: habit.name, count, color: habit.color };
  }).sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="hsl(0 0% 10%)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'hsl(0 0% 35%)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'hsl(0 0% 25%)', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'hsl(0 0% 5%)', border: '1px solid hsl(0 0% 12%)', borderRadius: 6, color: 'hsl(0 0% 80%)', fontSize: 12 }}
          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(val: any, _: any, props: any) => [`${val} days`, props?.payload?.fullName ?? '']}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={36}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
