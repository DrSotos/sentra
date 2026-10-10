export type Role = 'admin' | 'researcher' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  organization: string | null;
  is_active: boolean;
  roles: string[];
}

export interface Station {
  station_id: string;
  name: string;
  city: string | null;
  country_code: string | null;
  latitude: number;
  longitude: number;
  is_active: boolean;
  data_source: string | null;
  metadata_?: Record<string, any>;
  created_at: string;
  // Client-side enrichment
  latest_measurements?: Record<string, number>;
}

export interface Measurement {
  id: number;
  time: string;
  station_id: string;
  pm25?: number | null;
  pm10?: number | null;
  no2?: number | null;
  o3?: number | null;
  temperature?: number | null;
  humidity?: number | null;
  noise_db?: number | null;
  data_source?: string | null;
}

export interface Anomaly {
  detected_at: string;
  metric_name: string;
  anomaly_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  station_id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

export interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  resource: string;
  ip_address: string;
  details: Record<string, any>;
  created_at: string;
}

export interface ForecastPoint {
  time: string;
  value: number;
  lower_bound: number;
  upper_bound: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
