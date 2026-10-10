"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Station } from '@/types';

interface StationMapProps {
  stations: Station[];
}

export default function StationMap({ stations }: StationMapProps) {
  const center: [number, number] = [50.0, 10.0];
  const zoom = 4;

  const getMarkerIcon = (pm25?: number) => {
    let color = '#3b82f6'; // default blue
    if (pm25 !== undefined) {
      if (pm25 < 25) color = '#10b981'; // green
      else if (pm25 < 50) color = '#eab308'; // yellow
      else color = '#ef4444'; // red
    }

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 10 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((station) => (
        <Marker 
          key={station.station_id} 
          position={[station.latitude, station.longitude]}
          icon={getMarkerIcon(station.latest_measurements?.pm25)}
        >
          <Popup>
            <div className="p-1 min-w-[150px]">
              <h3 className="font-bold text-sm mb-1">{station.name}</h3>
              <p className="text-xs text-slate-500 mb-2">{station.city}, {station.country_code}</p>
              {station.latest_measurements ? (
                <div className="space-y-1 text-xs">
                  <p className="flex justify-between"><span>PM2.5:</span> <span className="font-bold">{station.latest_measurements.pm25?.toFixed(1) || 'N/A'} µg/m³</span></p>
                  <p className="flex justify-between"><span>PM10:</span> <span className="font-bold">{station.latest_measurements.pm10?.toFixed(1) || 'N/A'} µg/m³</span></p>
                  <p className="flex justify-between"><span>Temp:</span> <span className="font-bold">{station.latest_measurements.temperature?.toFixed(1) || 'N/A'} °C</span></p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No recent data</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
