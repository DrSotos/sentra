"use client";

import { useState } from 'react';
import { TimeSeriesChart } from '@/components/charts/timeseries-chart';

// Simulated data
const mockData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 20) + 10,
}));

export default function AnalyticsPage() {
  const [station, setStation] = useState('1');
  const [metric, setMetric] = useState('pm25');
  const [range, setRange] = useState('24h');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Analytics</h1>
      <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
        <select value={station} onChange={e => setStation(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-transparent dark:text-white">
          <option value="1">Berlin Central</option>
          <option value="2">Paris North</option>
        </select>
        <select value={metric} onChange={e => setMetric(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-transparent dark:text-white">
          <option value="pm25">PM2.5</option>
          <option value="pm10">PM10</option>
          <option value="no2">NO2</option>
        </select>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-1">
          {['24h', '7d', '30d'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm rounded transition-colors ${range === r ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white font-medium' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm p-6 h-[500px]">
        <TimeSeriesChart data={mockData} dataKey="value" xAxisKey="time" title={`${metric.toUpperCase()} Levels`} />
      </div>
    </div>
  );
}
