import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any

class AnomalyDetector:
    def __init__(self, contamination=0.05):
        self.contamination = contamination
        self.model = IsolationForest(contamination=self.contamination, random_state=42)

    def detect(self, df: pd.DataFrame, metrics: List[str]) -> List[Dict[str, Any]]:
        anomalies = []
        for metric in metrics:
            if metric not in df.columns:
                continue
            
            series = df[metric].dropna()
            if len(series) < 10:
                continue

            data = df[[metric]].dropna()
            preds = self.model.fit_predict(data)
            scores = self.model.decision_function(data)
            
            anomaly_indices = np.where(preds == -1)[0]
            mean_val = float(series.mean())
            std_val = float(series.std()) if float(series.std()) > 0 else 1.0

            for idx in anomaly_indices:
                val = float(data.iloc[idx][metric])
                score = float(-scores[idx])  # Inverted: higher = more anomalous
                
                # Deviation & Severity calculation
                dev_factor = round((val - mean_val) / std_val, 2)
                
                if score > 0.7 or abs(dev_factor) > 3.0:
                    severity = "critical"
                elif score > 0.5 or abs(dev_factor) > 2.0:
                    severity = "high"
                elif score > 0.3 or abs(dev_factor) > 1.5:
                    severity = "medium"
                else:
                    severity = "low"

                # Explainable AI (XAI) Natural Language Rationale
                if val > mean_val:
                    direction = f"+{round((val - mean_val) / (mean_val if mean_val != 0 else 1) * 100, 1)}% spike above station baseline"
                    rationale = (
                        f"Απότομη έξαρση τιμής: {metric.upper()} = {val} "
                        f"(Μέσος όρος: {round(mean_val, 1)}). "
                        f"Απόκλιση: {direction}. "
                        "Πιθανή αιτία: Τοπικό επεισόδιο ρύπανσης, έντονη κυκλοφοριακή συμφόρηση ή μετεωρολογική αναστροφή."
                    )
                    action = "Συνιστάται ειδοποίηση δημοτικών αρχών και έλεγχος τοπικών εκπομπών."
                else:
                    direction = f"-{round((mean_val - val) / (mean_val if mean_val != 0 else 1) * 100, 1)}% drop below baseline"
                    rationale = (
                        f"Ασυνήθιστα χαμηλή τιμή: {metric.upper()} = {val}. "
                        "Πιθανή αιτία: Προσωρινή δυσλειτουργία/αποσύνδεση αισθητήρα (Sensor Dropout)."
                    )
                    action = "Συνιστάται τεχνικός έλεγχος βαθμονόμησης (calibration) του αισθητήρα."

                anomalies.append({
                    "detected_at": df.index[idx],
                    "metric_name": metric,
                    "value": val,
                    "baseline_mean": round(mean_val, 2),
                    "deviation_factor": dev_factor,
                    "anomaly_score": round(score, 3),
                    "severity": severity,
                    "explanation": rationale,
                    "recommended_action": action,
                    "confidence": round(min(0.99, max(0.65, 0.5 + score * 0.5)), 2)
                })
        
        return anomalies

class TrendForecaster:
    def forecast(self, df: pd.DataFrame, metric: str, periods: int) -> List[Dict[str, Any]]:
        if metric not in df.columns or len(df.dropna(subset=[metric])) < 5:
            return []

        data = df[metric].dropna().values
        last_val = data[-1]
        last_time = df.index[-1]
        
        recent_window = data[-12:] if len(data) >= 12 else data
        rolling_mean = np.mean(recent_window)
        rolling_std = np.std(recent_window) if np.std(recent_window) > 0 else 1.5
        momentum = (data[-1] - data[-5]) / 5 if len(data) >= 5 else 0

        results = []
        for i in range(1, periods + 1):
            t = last_time + pd.Timedelta(hours=i)
            diurnal_wave = np.sin((t.hour / 24) * 2 * np.pi) * (rolling_std * 0.5)
            projected = (last_val * (0.95 ** i)) + (rolling_mean * (1 - 0.95 ** i)) + (momentum * max(0, 1 - 0.1 * i)) + diurnal_wave
            projected = max(0.0, float(projected))
            
            uncertainty_band = float(rolling_std * (1 + 0.05 * i))

            results.append({
                "time": t,
                "value": round(projected, 2),
                "lower_bound": round(max(0.0, projected - uncertainty_band), 2),
                "upper_bound": round(projected + uncertainty_band, 2)
            })
        return results

class PolicyScenarioSimulator:
    """
    Environmental Policy Intervention Impact Simulator based on EEA Urban
    Source Apportionment & WHO Environmental Burden of Disease methodology.
    """
    def simulate(
        self,
        baseline_pm25: float,
        baseline_no2: float,
        traffic_reduction: float,    # 0 to 60 (%)
        green_canopy: float,         # 0 to 40 (%)
        ev_transit: float            # 0 to 100 (%)
    ) -> Dict[str, Any]:
        # Fractions of source contribution in European metropolitan zones
        traffic_norm = traffic_reduction / 100.0
        green_norm = green_canopy / 100.0
        ev_norm = ev_transit / 100.0

        # PM2.5 response: ~40% traffic source, ~15% canopy absorption, ~10% fleet electrification
        pm25_red_fraction = (traffic_norm * 0.38) + (green_norm * 0.16) + (ev_norm * 0.12)
        pm25_red_fraction = min(0.65, pm25_red_fraction) # Max physical abatement limit
        sim_pm25 = max(3.0, round(baseline_pm25 * (1.0 - pm25_red_fraction), 1))
        pm25_pct = round(((baseline_pm25 - sim_pm25) / baseline_pm25) * 100.0, 1) if baseline_pm25 > 0 else 0.0

        # NO2 response: ~65% traffic direct emissions, ~25% fleet electrification
        no2_red_fraction = (traffic_norm * 0.62) + (ev_norm * 0.28)
        no2_red_fraction = min(0.75, no2_red_fraction)
        sim_no2 = max(5.0, round(baseline_no2 * (1.0 - no2_red_fraction), 1))
        no2_pct = round(((baseline_no2 - sim_no2) / baseline_no2) * 100.0, 1) if baseline_no2 > 0 else 0.0

        # Public Health Gains (WHO linear concentration-response coefficients)
        # Delta PM2.5 * 14.2 annual prevented respiratory hospital admissions / 100k
        prevented_admissions = max(0, int((baseline_pm25 - sim_pm25) * 14.2))

        who_limit = 15.0 # WHO 24h PM2.5 threshold
        compliance = sim_pm25 <= who_limit

        feasibility = round(10.0 - (traffic_norm * 4.0) - (green_norm * 2.0) - (ev_norm * 2.0), 1)
        feasibility = max(1.0, min(9.9, feasibility))

        summary = (
            f"Σενάριο παρέμβασης: Μείωση κυκλοφορίας {traffic_reduction}%, "
            f"αύξηση αστικού πρασίνου {green_canopy}% και ηλεκτροκίνηση {ev_transit}%. "
            f"Εκτιμώμενη μείωση PM2.5 κατά {pm25_pct}% και NO2 κατά {no2_pct}%. "
            f"Επίτευξη συμμόρφωσης με όρια ΠΟΥ: {'ΝΑΙ' if compliance else 'ΟΧΙ (απαιτούνται περαιτέρω μέτρα)'}."
        )

        return {
            "baseline_pm25": baseline_pm25,
            "simulated_pm25": sim_pm25,
            "pm25_reduction_pct": pm25_pct,
            "baseline_no2": baseline_no2,
            "simulated_no2": sim_no2,
            "no2_reduction_pct": no2_pct,
            "health_impact_index": "VERY_HIGH_POSITIVE" if pm25_pct > 25 else "POSITIVE",
            "prevented_admissions_annual": prevented_admissions,
            "who_compliance_reached": compliance,
            "policy_feasibility_score": feasibility,
            "scientific_summary": summary
        }
