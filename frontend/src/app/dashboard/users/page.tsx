"use client";
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@sentra.eu', role: 'admin', active: true },
  { id: '2', name: 'Researcher One', email: 'researcher@sentra.eu', role: 'researcher', active: true },
  { id: '3', name: 'Guest User', email: 'guest@sentra.eu', role: 'user', active: false },
];

export default function UsersPage() {
  const user = useAuthStore(state => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!isMounted) return null;

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-medium">Access Denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">User Management</h1>

      <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((u) => (
              <tr key={u.id} className="border-b dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4 capitalize">{u.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {u.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select defaultValue={u.role} className="border rounded px-2 py-1 text-xs mr-3 bg-transparent dark:border-slate-700">
                    <option value="admin">Admin</option>
                    <option value="researcher">Researcher</option>
                    <option value="user">User</option>
                  </select>
                  <button className="text-red-500 text-xs hover:underline font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
