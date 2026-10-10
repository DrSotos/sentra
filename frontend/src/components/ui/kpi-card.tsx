import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  className?: string;
}

export function KpiCard({ title, value, icon, trend, description, className }: KpiCardProps) {
  return (
    <div className={cn("rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800", className)}>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <div className="text-slate-400 dark:text-slate-500">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      {(trend || description) && (
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
          {trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3 text-emerald-500" />}
          {trend === 'neutral' && <Minus className="h-3 w-3 text-slate-400" />}
          <span className="text-muted-foreground">{description}</span>
        </div>
      )}
    </div>
  );
}
