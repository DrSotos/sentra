"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, Play, Brain, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

interface AnomalyItem {
  detected_at: string;
  metric_name: string;
  value?: number;
  baseline_mean?: number;
  deviation_factor?: number;
  anomaly_score: number;
  severity: string;
  explanation?: string;
  recommended_action?: string;
  confidence?: number;
}

export default function AnomaliesPage() {
  const [stationId, setStationId] = useState('ATH01');
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);

  const runDetection = async (targetStation = stationId) => {
    setIsRunning(true);
    try {
      const res = await apiService.analytics.detectAnomalies({
        station_id: targetStation,
        metrics: ['pm25', 'pm10', 'no2', 'temperature']
      });
      setAnomalies(res.data);
      if (res.data.length > 0) {
        setSelectedAnomaly(res.data[0]);
        toast.success(`Εντοπίστηκαν ${res.data.length} ανωμαλίες από το μοντέλο Isolation Forest!`);
      } else {
        toast.success("Δεν εντοπίστηκαν ασυνήθιστες τιμές για αυτόν τον σταθμό.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Σφάλμα κατά την εκτέλεση του αλγορίθμου AI.");
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDetection(stationId);
  }, [stationId]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Explainable AI (XAI) Anomaly Detection
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Ανίχνευση ανωμαλιών με Isolation Forest και αυτόματη επιστημονική αιτιολόγηση (XAI Rationale).
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ATH01">📍 ATH01 — Athens Center</option>
            <option value="BER01">📍 BER01 — Berlin Mitte</option>
            <option value="PAR01">📍 PAR01 — Paris 1er</option>
            <option value="AMS01">📍 AMS01 — Amsterdam Central</option>
            <option value="STO01">📍 STO01 — Stockholm City</option>
          </select>

          <button 
            onClick={() => runDetection(stationId)}
            disabled={isRunning}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium transition-colors shadow-sm shrink-0"
          >
            <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Ανάλυση...' : 'Επανεκτέλεση AI'}
          </button>
        </div>
      </div>

      {/* Selected Anomaly Explainable AI Card */}
      {selectedAnomaly && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-emerald-200 dark:border-emerald-900 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Ανάλυση Επεξηγηματικής Τεχνητής Νοημοσύνης (Explainable AI Rationale)
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${selectedAnomaly.severity === 'critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                selectedAnomaly.severity === 'high' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
              {selectedAnomaly.severity} Severity
            </span>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 bg-white/70 dark:bg-slate-800/70 p-3 rounded-lg border border-slate-200/50">
            {selectedAnomaly.explanation || "Εντοπίστηκε στατιστική απόκλιση από την κανονική συμπεριφορά της χρονοσειράς."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border">
              <span className="text-slate-500 block">Μετρηθείσα Τιμή</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedAnomaly.value ?? 'N/A'}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border">
              <span className="text-slate-500 block">Ιστορικός Μέσος Όρος</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedAnomaly.baseline_mean ?? 'N/A'}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border">
              <span className="text-slate-500 block">Απόκλιση (Z-Score)</span>
              <span className="font-bold text-emerald-600 text-sm">+{selectedAnomaly.deviation_factor ?? 0}σ</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border">
              <span className="text-slate-500 block">Βαθμός Βεβαιότητας AI</span>
              <span className="font-bold text-blue-600 text-sm">{Math.round((selectedAnomaly.confidence ?? 0.85) * 100)}%</span>
            </div>
          </div>

          {selectedAnomaly.recommended_action && (
            <div className="flex items-start gap-2 bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 p-3 rounded-lg text-xs font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span><strong>Προτεινόμενη Ενέργεια Έργου:</strong> {selectedAnomaly.recommended_action}</span>
            </div>
          )}
        </div>
      )}

      {/* Anomalies Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
            Όλες οι Εντοπισμένες Ανωμαλίες ({anomalies.length})
          </h3>
          <span className="text-xs text-slate-500">Κάντε κλικ σε μια γραμμή για προβολή της επεξήγησης AI</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs">
              <tr>
                <th className="px-5 py-3">Ημερομηνία & Ώρα</th>
                <th className="px-5 py-3">Μετρική</th>
                <th className="px-5 py-3">Τιμή</th>
                <th className="px-5 py-3">Baseline</th>
                <th className="px-5 py-3">AI Score</th>
                <th className="px-5 py-3">Σοβαρότητα</th>
                <th className="px-5 py-3">Ενέργεια</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Δεν βρέθηκαν ανωμαλίες για την επιλεγμένη περίοδο.
                  </td>
                </tr>
              ) : (
                anomalies.map((a, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedAnomaly(a)}
                    className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedAnomaly === a ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {new Date(a.detected_at).toLocaleString('el-GR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-5 py-3.5 font-bold uppercase text-slate-900 dark:text-slate-100">
                      {a.metric_name}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-rose-600 dark:text-rose-400">
                      {a.value ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {a.baseline_mean ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {a.anomaly_score.toFixed(3)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase
                        ${a.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          a.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'}`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-emerald-600 font-medium">
                      Προβολή XAI →
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
