'use client';

import { HABITS } from '@/lib/habits';
import HabitCard from './HabitCard';

interface HabitGridProps {
  habits: Record<string, boolean>;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export default function HabitGrid({ habits, onToggle, disabled }: HabitGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {HABITS.map(habit => (
        <HabitCard
          key={habit.id}
          habit={habit}
          checked={!!habits[habit.id]}
          onToggle={() => onToggle(habit.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
