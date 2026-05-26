export interface Habit {
  id: string;
  name: string;
  icon: string;   // lucide icon name
  color: string;  // accent hex
}

export const HABITS: Habit[] = [
  { id: 'gym',         name: 'Gym',          icon: 'Dumbbell',    color: '#3B82F6' },
  { id: 'reading',     name: 'Reading',      icon: 'BookOpen',    color: '#10B981' },
  { id: 'company',     name: 'Company',      icon: 'Briefcase',   color: '#F59E0B' },
  { id: 'learning',    name: 'Learning',     icon: 'GraduationCap', color: '#8B5CF6' },
  { id: 'sideproject', name: 'Side Project', icon: 'Rocket',      color: '#EC4899' },
  { id: 'pixlreel',    name: 'Pixl Reel',    icon: 'Clapperboard',color: '#06B6D4' },
  { id: 'kastreel',    name: 'Kast Reel',    icon: 'Video',       color: '#F97316' },
  { id: 'post',        name: 'Post',         icon: 'Send',        color: '#EF4444' },
  { id: 'jobhunt',     name: 'Job Hunt',     icon: 'Search',      color: '#84CC16' },
];

export const HABIT_MAP = HABITS.reduce<Record<string, Habit>>((acc, h) => {
  acc[h.id] = h;
  return acc;
}, {});

export const HABIT_IDS = HABITS.map(h => h.id);
