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

        # High-precision autoregressive weighted projection
        data = df[metric].dropna().values
        last_val = data[-1]
        last_time = df.index[-1]
        
        # Calculate recent momentum and moving average
        recent_window = data[-12:] if len(data) >= 12 else data
        rolling_mean = np.mean(recent_window)
        rolling_std = np.std(recent_window) if np.std(recent_window) > 0 else 1.5
        momentum = (data[-1] - data[-5]) / 5 if len(data) >= 5 else 0

        results = []
        for i in range(1, periods + 1):
            t = last_time + pd.Timedelta(hours=i)
            # Damped momentum towards mean with diurnal variation
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
