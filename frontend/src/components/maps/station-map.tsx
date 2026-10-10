"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Station } from '@/types';
import { Layers } from 'lucide-react';

interface StationMapProps {
  stations: Station[];
}

export default function StationMap({ stations }: StationMapProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const center: [number, number] = [50.0, 10.0];
  const zoom = 4;

  const getMarkerColor = (pm25?: number) => {
    if (pm25 === undefined) return '#3b82f6';
    if (pm25 < 15) return '#10b981'; // Green
    if (pm25 < 35) return '#eab308'; // Yellow
    if (pm25 < 55) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getMarkerIcon = (pm25?: number) => {
    const color = getMarkerColor(pm25);
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  };

  return (
    <div className="relative h-full w-full">
      {/* Heatmap Overlay Toggle Button */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-md rounded-lg border p-1.5 flex items-center gap-2">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            showHeatmap
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          {showHeatmap ? '🔥 Heatmap Active' : 'Heatmap Disabled'}
        </button>
      </div>

      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 10 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => {
          const pm25 = station.latest_measurements?.pm25 ?? 15;
          const color = getMarkerColor(pm25);

          return (
            <div key={station.station_id}>
              {/* Pollution Dispersion Plume (Spatial Heatmap Layer) */}
              {showHeatmap && (
                <>
                  <Circle
                    center={[station.latitude, station.longitude]}
                    radius={90000}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.12,
                      stroke: false
                    }}
                  />
                  <Circle
                    center={[station.latitude, station.longitude]}
                    radius={45000}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.22,
                      stroke: false
                    }}
                  />
                </>
              )}

              <Marker 
                position={[station.latitude, station.longitude]}
                icon={getMarkerIcon(station.latest_measurements?.pm25)}
              >
                <Popup>
                  <div className="p-1 min-w-[160px]">
                    <h3 className="font-bold text-sm mb-0.5">{station.name}</h3>
                    <p className="text-xs text-slate-500 mb-2">{station.city}, {station.country_code}</p>
                    {station.latest_measurements ? (
                      <div className="space-y-1 text-xs">
                        <p className="flex justify-between"><span>PM2.5:</span> <span className="font-bold">{station.latest_measurements.pm25?.toFixed(1) || 'N/A'} µg/m³</span></p>
                        <p className="flex justify-between"><span>PM10:</span> <span className="font-bold">{station.latest_measurements.pm10?.toFixed(1) || 'N/A'} µg/m³</span></p>
                        <p className="flex justify-between"><span>Temp:</span> <span className="font-bold">{station.latest_measurements.temperature?.toFixed(1) || 'N/A'} °C</span></p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Live Copernicus Data</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
