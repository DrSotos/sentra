"use client";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

interface ForecastChartProps {
  data: any[];
  historicalKey?: string;
  forecastKey?: string;
  lowerKey?: string;
  upperKey?: string;
  xAxisKey: string;
}

export function ForecastChart({
  data,
  historicalKey = "value",
  forecastKey = "yhat",
  lowerKey = "yhat_lower",
  upperKey = "yhat_upper",
  xAxisKey
}: ForecastChartProps) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorYhat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip />
          
          {/* Confidence Band (Lower to Upper) */}
          <Area 
            type="monotone" 
            dataKey={upperKey} 
            stroke="none" 
            fill="url(#colorYhat)" 
            isAnimationActive={false}
          />
          <Area 
            type="monotone" 
            dataKey={lowerKey} 
            stroke="none" 
            fill="#ffffff" 
            isAnimationActive={false}
          />
          
          {/* Forecast Line */}
          <Line 
            type="monotone" 
            dataKey={forecastKey} 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          
          {/* Historical Data Line */}
          <Line 
            type="monotone" 
            dataKey={historicalKey} 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
