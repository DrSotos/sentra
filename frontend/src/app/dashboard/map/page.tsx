"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiService } from '@/lib/api';
import { Station } from '@/types';
import { Activity } from 'lucide-react';

const StationMapComponent = dynamic(
  () => import('@/components/maps/station-map'),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-slate-500">Loading map...</p>
        </div>
      </div>
    )
  }
);

const DEMO_STATIONS: Station[] = [
  { station_id: 'ATH01', name: 'Athens Center', city: 'Athens', country_code: 'GR', latitude: 37.9838, longitude: 23.7275, is_active: true, data_source: 'EEA', created_at: '', latest_measurements: { pm25: 22, pm10: 35, temperature: 28 } },
  { station_id: 'BER01', name: 'Berlin Mitte', city: 'Berlin', country_code: 'DE', latitude: 52.52, longitude: 13.405, is_active: true, data_source: 'EEA', created_at: '', latest_measurements: { pm25: 15, pm10: 25, temperature: 18 } },
  { station_id: 'PAR01', name: 'Paris 1er', city: 'Paris', country_code: 'FR', latitude: 48.8566, longitude: 2.3522, is_active: true, data_source: 'EEA', created_at: '', latest_measurements: { pm25: 45, pm10: 60, temperature: 22 } },
  { station_id: 'AMS01', name: 'Amsterdam Central', city: 'Amsterdam', country_code: 'NL', latitude: 52.3676, longitude: 4.9041, is_active: true, data_source: 'EEA', created_at: '', latest_measurements: { pm25: 12, pm10: 20, temperature: 16 } },
  { station_id: 'STO01', name: 'Stockholm City', city: 'Stockholm', country_code: 'SE', latitude: 59.3293, longitude: 18.0686, is_active: true, data_source: 'EEA', created_at: '', latest_measurements: { pm25: 8, pm10: 14, temperature: 12 } },
];

export default function MapPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await apiService.stations.getStations();
        setStations(res.data);
      } catch (error) {
        console.error('API unavailable, using demo stations:', error);
        setStations(DEMO_STATIONS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStations();
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Geospatial Overview</h1>
        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Good (&lt; 25)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Moderate (&lt; 50)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Poor (≥ 50)</div>
        </div>
      </div>
      <div className="flex-1 rounded-xl overflow-hidden border shadow-sm">
        <StationMapComponent stations={stations.length > 0 ? stations : DEMO_STATIONS} />
      </div>
    </div>
  );
}
