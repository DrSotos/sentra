import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api/v1',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sentra_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't redirect if already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('sentra_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  auth: {
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
    register: (data: { email: string; password: string; full_name?: string; organization?: string }) =>
      api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
  },
  stations: {
    getStations: () => api.get('/stations'),
    getStation: (id: string) => api.get(`/stations/${id}`),
    createStation: (data: any) => api.post('/stations', data),
    updateStation: (id: string, data: any) => api.patch(`/stations/${id}`, data),
    deleteStation: (id: string) => api.delete(`/stations/${id}`),
  },
  measurements: {
    getMeasurements: (params?: any) => api.get('/measurements', { params }),
    getLatestMeasurements: () => api.get('/measurements/latest'),
    getAggregate: (params?: any) => api.get('/measurements/aggregate', { params }),
    exportMeasurements: (params?: any) => api.get('/measurements/export', { params }),
  },
  analytics: {
    detectAnomalies: (data: any) => api.post('/analytics/anomalies', data),
    getAnomalies: (params?: any) => api.get('/analytics/anomalies', { params }),
    runForecast: (data: any) => api.post('/analytics/forecast', data),
    getSummary: (stationId: string) => api.get('/analytics/summary', { params: { station_id: stationId } }),
    triggerLiveIngest: () => api.post('/analytics/ingest-live'),
    getPolicyBrief: () => api.get('/analytics/report/policy-brief'),
  },
  alerts: {
    getAlerts: () => api.get('/alerts'),
    resolveAlert: (id: string) => api.patch(`/alerts/${id}/resolve`),
    getAlertStats: () => api.get('/alerts/stats'),
  },
  users: {
    getUsers: () => api.get('/users'),
    updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),
    deleteUser: (id: string) => api.delete(`/users/${id}`),
    assignRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  },
  admin: {
    getHealth: () => api.get('/admin/system/health'),
    getAuditLogs: () => api.get('/admin/audit-logs'),
  },
};

export default api;
