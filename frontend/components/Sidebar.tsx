'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, CalendarRange, TrendingUp, BarChart2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/',          label: 'Today',     Icon: Home        },
  { href: '/weekly',    label: 'Weekly',    Icon: CalendarDays },
  { href: '/monthly',   label: 'Monthly',   Icon: CalendarRange },
  { href: '/yearly',    label: 'Yearly',    Icon: TrendingUp  },
  { href: '/analytics', label: 'Analytics', Icon: BarChart2   },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 min-h-screen bg-background border-r border-border py-7 px-4 fixed left-0 top-0 z-40">
        <div className="flex items-center gap-2 px-2 mb-8">
          <Zap size={16} className="text-foreground" />
          <span className="text-sm font-semibold tracking-tight text-foreground">Streakly</span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors',
                  active
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
