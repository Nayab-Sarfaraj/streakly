'use client';

import {
  Dumbbell, BookOpen, Briefcase, GraduationCap, Rocket,
  Clapperboard, Video, Send, Search, LucideProps,
} from 'lucide-react';

const iconMap: Record<string, React.FC<LucideProps>> = {
  Dumbbell, BookOpen, Briefcase, GraduationCap, Rocket,
  Clapperboard, Video, Send, Search,
};

interface HabitIconProps extends LucideProps {
  name: string;
}

export default function HabitIcon({ name, ...props }: HabitIconProps) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon {...props} />;
}
