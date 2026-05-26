'use client';

import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { Check } from 'lucide-react';
import { api, HabitLog } from '@/lib/api';
import { HABITS, HABIT_IDS } from '@/lib/habits';
import HabitIcon from '@/components/HabitIcon';
import Toast, { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';

export default function TodayPage() {
  const [log, setLog] = useState<HabitLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchToday = useCallback(() => {
    api.getToday().then(setLog).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchToday();
    const interval = setInterval(fetchToday, 60000);
    return () => clearInterval(interval);
  }, [fetchToday]);

  const handleToggle = useCallback(async (id: string) => {
    if (!log || saving) return;
    const prev = log;
    const newHabits = { ...log.habits, [id]: !log.habits[id] };
    const completedCount = HABIT_IDS.filter(h => newHabits[h]).length;
    const scorePercent = Math.round((completedCount / 9) * 100);

    setLog(l => l ? { ...l, habits: newHabits, completedCount, scorePercent } : l);
    setSaving(true);
    try {
      const updated = await api.putToday(newHabits);
      setLog(updated);
      toast.show('Saved');
    } catch {
      setLog(prev);
      toast.show('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [log, saving, toast]);

  const completedCount = log?.completedCount ?? 0;
  const scorePercent = log?.scorePercent ?? 0;
  const today = dayjs();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {today.format('dddd')}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {today.format('D MMMM YYYY')}
        </p>
      </div>

      {/* Habit list */}
      <div className="flex flex-col gap-1.5">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-card animate-pulse" />
            ))
          : HABITS.map(habit => {
              const checked = !!log?.habits?.[habit.id];
              return (
                <button
                  key={habit.id}
                  onClick={() => handleToggle(habit.id)}
                  className={cn(
                    'group flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-150 text-left w-full',
                    checked
                      ? 'bg-card border-border/60'
                      : 'bg-card/50 border-border/30 hover:border-border hover:bg-card'
                  )}
                  style={checked ? { borderColor: habit.color + '40' } : {}}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
                      style={{
                        background: checked ? habit.color + '18' : 'hsl(0 0% 8%)',
                      }}
                    >
                      <HabitIcon
                        name={habit.icon}
                        size={14}
                        strokeWidth={1.75}
                        style={{ color: checked ? habit.color : 'hsl(0 0% 35%)' }}
                      />
                    </div>

                    <span
                      className="text-sm transition-colors"
                      style={{ color: checked ? 'hsl(0 0% 88%)' : 'hsl(0 0% 45%)' }}
                    >
                      {habit.name}
                    </span>
                  </div>

                  {/* Checkbox */}
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
            })}
      </div>

      {/* Progress */}
      <div className="mt-8 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{completedCount} of 9 completed</span>
          <span>{scorePercent}%</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${scorePercent}%`,
              background: scorePercent >= 80 ? '#10B981' : scorePercent >= 50 ? '#F59E0B' : '#3B82F6',
            }}
          />
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
