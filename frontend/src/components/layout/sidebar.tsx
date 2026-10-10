"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Map, BarChart3, AlertTriangle, TrendingUp, Radio, Users, Settings, Activity, Sliders } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const routes = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/map', label: 'Map View', icon: Map },
  { href: '/dashboard/simulator', label: 'Policy Simulator', icon: Sliders },
  { href: '/dashboard/anomalies', label: 'Explainable AI', icon: AlertTriangle },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/forecast', label: 'Forecast', icon: TrendingUp },
  { href: '/dashboard/stations', label: 'Stations', icon: Radio },
  { href: '/dashboard/users', label: 'Users', icon: Users, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <aside className="w-64 flex-col border-r bg-slate-50 dark:bg-slate-900 hidden md:flex min-h-screen">
      <div className="p-6 border-b">
        <Link className="flex items-center gap-2" href="/dashboard">
          <Activity className="h-6 w-6 text-emerald-600" />
          <span className="font-bold text-xl">SENTRA</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {routes.map((route) => {
          if (route.adminOnly && !user?.roles?.includes('admin')) return null;
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive 
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-50" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
