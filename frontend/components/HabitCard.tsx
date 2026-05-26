'use client';

import { Check } from 'lucide-react';
import { Habit } from '@/lib/habits';
import HabitIcon from '@/components/HabitIcon';

interface HabitCardProps {
  habit: Habit;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function HabitCard({ habit, checked, onToggle, disabled }: HabitCardProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="group flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-150 text-left w-full disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: checked ? habit.color + '10' : 'hsl(0 0% 5%)',
        borderColor: checked ? habit.color + '40' : 'hsl(0 0% 10%)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
          style={{ background: checked ? habit.color + '20' : 'hsl(0 0% 8%)' }}
        >
          <HabitIcon
            name={habit.icon}
            size={14}
            strokeWidth={1.75}
            style={{ color: checked ? habit.color : 'hsl(0 0% 35%)' }}
          />
        </div>
        <span className="text-sm transition-colors" style={{ color: checked ? 'hsl(0 0% 88%)' : 'hsl(0 0% 45%)' }}>
          {habit.name}
        </span>
      </div>
      <div
        className="flex items-center justify-center w-5 h-5 rounded transition-all duration-150 flex-shrink-0"
        style={{
          background: checked ? habit.color : 'transparent',
          border: `1.5px solid ${checked ? habit.color : 'hsl(0 0% 18%)'}`,
        }}
      >
        {checked && <Check size={11} strokeWidth={2.5} className="text-black" />}
      </div>
    </button>
  );
}
