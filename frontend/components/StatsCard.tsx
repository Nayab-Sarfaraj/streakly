interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export default function StatsCard({ icon, label, value, sub, color }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </div>
      <div
        className="text-3xl font-bold tracking-tight"
        style={{ color: color || '#f1f5f9' }}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
