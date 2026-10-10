"use client";
import { Plus, Edit2, Trash2 } from 'lucide-react';

const mockStations = [
  { id: '1', name: 'Berlin Central', city: 'Berlin', country: 'Germany', active: true, source: 'IoT Sensor' },
  { id: '2', name: 'Paris North', city: 'Paris', country: 'France', active: true, source: 'API' },
  { id: '3', name: 'Milan Station', city: 'Milan', country: 'Italy', active: false, source: 'IoT Sensor' },
];

export default function StationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Stations Management</h1>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Station
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Source</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockStations.map((s) => (
              <tr key={s.id} className="border-b dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <td className="px-6 py-4">{s.id}</td>
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4">{s.city}, {s.country}</td>
                <td className="px-6 py-4">{s.source}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-emerald-600 mr-3 transition-colors"><Edit2 className="h-4 w-4" /></button>
                  <button className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
