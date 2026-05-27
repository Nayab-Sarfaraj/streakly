'use client';

import { AlertTriangle, XCircle, TrendingDown, Flame, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WarningLevel = 'critical' | 'warning' | 'info';

export interface Warning {
  id: string;
  level: WarningLevel;
  icon?: 'alert' | 'x' | 'trend' | 'streak' | 'clock' | 'zap';
  title: string;
  description?: string;
}

const ICON_MAP = {
  alert: AlertTriangle,
  x: XCircle,
  trend: TrendingDown,
  streak: Flame,
  clock: Clock,
  zap: Zap,
};

const LEVEL_STYLES: Record<WarningLevel, { wrapper: string; icon: string }> = {
  critical: {
    wrapper: 'border-red-500/20 bg-red-500/5',
    icon: 'text-red-500',
  },
  warning: {
    wrapper: 'border-amber-500/20 bg-amber-500/5',
    icon: 'text-amber-400',
  },
  info: {
    wrapper: 'border-blue-500/20 bg-blue-500/5',
    icon: 'text-blue-400',
  },
};

function WarningItem({ warning }: { warning: Warning }) {
  const styles = LEVEL_STYLES[warning.level];
  const Icon = ICON_MAP[warning.icon ?? 'alert'];

  return (
    <div className={cn('flex items-start gap-3 rounded-lg border px-4 py-3', styles.wrapper)}>
      <Icon size={15} className={cn('mt-0.5 flex-shrink-0', styles.icon)} strokeWidth={2} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground/90 leading-snug">{warning.title}</p>
        {warning.description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{warning.description}</p>
        )}
      </div>
    </div>
  );
}

interface WarningBannerProps {
  warnings: Warning[];
  className?: string;
}

export default function WarningBanner({ warnings, className }: WarningBannerProps) {
  if (!warnings.length) return null;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {warnings.map(w => (
        <WarningItem key={w.id} warning={w} />
      ))}
    </div>
  );
}
