"use client";

import { useState, useEffect } from 'react';
import { Sliders, Sparkles, TrendingDown, HeartPulse, ShieldCheck, Car, Trees, Zap, Building2 } from 'lucide-react';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PolicySimulatorPage() {
  const [stationId, setStationId] = useState('ATH01');
  const [trafficReduction, setTrafficReduction] = useState(25);
  const [greenCanopy, setGreenCanopy] = useState(15);
  const [evTransit, setEvTransit] = useState(30);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await apiService.analytics.simulateScenario({
        station_id: stationId,
        traffic_reduction_pct: trafficReduction,
        green_canopy_increase_pct: greenCanopy,
        ev_transit_share_pct: evTransit
      });
      setResult(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Σφάλμα κατά την εκτέλεση της προσομοίωσης.");
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [stationId, trafficReduction, greenCanopy, evTransit]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              «What-If» Environmental Policy Simulator
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Ερευνητικό εργαλείο εκτίμησης περιβαλλοντικών παρεμβάσεων βάσει μοντέλων πηγών ρύπανσης του Ευρωπαϊκού Οργανισμού Περιβάλλοντος (EEA).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Επιλογή Πόλης:</label>
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="px-3.5 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="ATH01">📍 Αθήνα (Athens Center)</option>
            <option value="BER01">📍 Βερολίνο (Berlin Mitte)</option>
            <option value="PAR01">📍 Παρίσι (Paris 1er)</option>
            <option value="AMS01">📍 Άμστερνταμ (Amsterdam Central)</option>
            <option value="STO01">📍 Στοκχόλμη (Stockholm City)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600" />
            Παράμετροι Αστικής Παρέμβασης
          </h3>

          {/* Slider 1 */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <Car className="h-4 w-4 text-rose-500" />
                Μείωση Κυκλοφορίας Οχημάτων (LEZ)
              </span>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded text-xs">
                -{trafficReduction}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={trafficReduction}
              onChange={(e) => setTrafficReduction(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 block">
              Περιορισμοί κυκλοφορίας diesel, ζώνες χαμηλών εκπομπών και πεζοδρομήσεις.
            </span>
          </div>

          {/* Slider 2 */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <Trees className="h-4 w-4 text-emerald-500" />
                Αύξηση Αστικού Πρασίνου & Δέντρων
              </span>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded text-xs">
                +{greenCanopy}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={greenCanopy}
              onChange={(e) => setGreenCanopy(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 block">
              Αστικοί διάδρομοι πρασίνου και φυσικά φίλτρα συγκράτησης αιωρούμενων σωματιδίων.
            </span>
          </div>

          {/* Slider 3 */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <Zap className="h-4 w-4 text-amber-500" />
                Ηλεκτροκίνηση Μέσων Μαζικής Μεταφοράς
              </span>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded text-xs">
                {evTransit}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={evTransit}
              onChange={(e) => setEvTransit(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 block">
              Αντικατάσταση στόλου αστικών λεωφορείων και δημοτικών οχημάτων με ηλεκτρικά.
            </span>
          </div>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <>
              {/* Top Impact Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PM2.5 Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase">Μικροσωματίδια PM2.5</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                          {result.simulated_pm25}
                        </span>
                        <span className="text-xs text-slate-400">µg/m³</span>
                      </div>
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                      <TrendingDown className="h-3.5 w-3.5 mr-1" />
                      -{result.pm25_reduction_pct}%
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Αρχική baseline τιμή: <strong className="text-slate-700 dark:text-slate-300">{result.baseline_pm25} µg/m³</strong>
                  </div>
                </div>

                {/* NO2 Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase">Διοξείδιο Αζώτου NO2</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                          {result.simulated_no2}
                        </span>
                        <span className="text-xs text-slate-400">µg/m³</span>
                      </div>
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                      <TrendingDown className="h-3.5 w-3.5 mr-1" />
                      -{result.no2_reduction_pct}%
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Αρχική baseline τιμή: <strong className="text-slate-700 dark:text-slate-300">{result.baseline_no2} µg/m³</strong>
                  </div>
                </div>
              </div>

              {/* Health & EU Compliance Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl shrink-0">
                    <HeartPulse className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold">
                      Εκτιμώμενο Όφελος Δημόσιας Υγείας
                    </h4>
                    <p className="text-sm text-emerald-100 mt-1 leading-relaxed">
                      Προλαμβάνονται περίπου <strong className="text-white underline">{result.prevented_admissions_annual} νοσηλείες ετησίως</strong> για αναπνευστικά και καρδιαγγειακά νοσήματα ανά 100.000 κατοίκους στην πόλη ({result.city}).
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-200" />
                      <span className="text-xs font-semibold text-emerald-100">
                        Συμμόρφωση με 24ωρο όριο ΠΟΥ (&le;15 µg/m³): {result.who_compliance_reached ? '✅ ΕΠΙΤΕΥΧΘΗΚΕ' : '⚠️ ΑΠΑΙΤΕΙΤΑΙ ΠΕΡΑΙΤΕΡΩ ΜΕΙΩΣΗ'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scientific Rationale Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Επιστημονική Σύνοψη & Εφικτότητα Παρέμβασης
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border">
                  {result.scientific_summary}
                </p>
                <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t">
                  <span>Δείκτης Πολιτικής Εφικτότητας (Feasibility Score):</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {result.policy_feasibility_score} / 10
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border text-slate-400">
              Εκτέλεση προσομοίωσης...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

