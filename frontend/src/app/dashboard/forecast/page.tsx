"use client";

import { useState } from 'react';
import { ForecastChart } from '@/components/charts/forecast-chart';
import { TrendingUp } from 'lucide-react';

const mockData = Array.from({ length: 48 }).map((_, i) => {
  const isForecast = i >= 24;
  const baseValue = 20 + Math.sin(i / 3) * 10;
  return {
    time: `${Math.floor(i / 2)}:00`,
    value: isForecast ? null : baseValue,
    yhat: isForecast ? baseValue : null,
    yhat_lower: isForecast ? baseValue - 5 : null,
    yhat_upper: isForecast ? baseValue + 5 : null,
  };
});

export default function ForecastPage() {
  const [station, setStation] = useState('1');
  const [metric, setMetric] = useState('pm25');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">AI Forecasting</h1>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors">
          <TrendingUp className="h-4 w-4" /> Generate Forecast
        </button>
      </div>

      <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
        <select value={station} onChange={e => setStation(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-transparent dark:text-white">
          <option value="1">Berlin Central</option>
        </select>
        <select value={metric} onChange={e => setMetric(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-transparent dark:text-white">
          <option value="pm25">PM2.5</option>
          <option value="pm10">PM10</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm p-6 h-[500px]">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">{metric.toUpperCase()} 24h Forecast</h3>
        <ForecastChart data={mockData} xAxisKey="time" />
      </div>
    </div>
  );
}
