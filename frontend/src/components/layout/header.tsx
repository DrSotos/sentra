"use client";
import { useAuthStore } from '@/stores/auth-store';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 flex items-center justify-end px-6 border-b bg-white dark:bg-slate-900 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <UserIcon className="h-4 w-4 text-slate-500" />
          <span className="font-medium text-slate-900 dark:text-slate-100">{user?.full_name || 'User'}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500 dark:bg-slate-800 capitalize">{user?.role || 'user'}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
