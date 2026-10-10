---
title: SENTRA - Smart Environmental Network
emoji: 🌿
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
license: eupl-1.2
---

<div align="center">

# 🌿 SENTRA
### Smart Environmental Network for Territorial Resilience Analytics

[![License: EUPL-1.2](https://img.shields.io/badge/License-EUPL--1.2-blue.svg)](https://opensource.org/licenses/EUPL-1.2)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![TimescaleDB](https://img.shields.io/badge/TimescaleDB-PostgreSQL_16-FDB515.svg)](https://www.timescale.com)
[![Docker](https://img.shields.io/badge/Docker-Compose_Ready-2496ED.svg)](https://docker.com)
[![Copernicus](https://img.shields.io/badge/Copernicus-CAMS_Integrated-003399.svg)](https://atmosphere.copernicus.eu)

**An EU Horizon Europe (Cluster 6) & Digital Europe Research Prototype (TRL 5)**  
*Real-time urban environmental telemetry, Explainable AI anomaly detection, What-If policy simulation, and FAIR open data stewardship across European metropolitan zones.*

</div>

---

## 🏛️ Executive Summary & EU Context

**SENTRA** addresses the European Green Deal and the Zero Pollution Action Plan by unifying atmospheric telemetry from IoT ground stations and the **European Copernicus Atmosphere Monitoring Service (CAMS)**.

### Core Scientific & Technical Pillars:
1. **Live Atmospheric Telemetry Pipeline:** Continuous ingestion from Open-Meteo & Copernicus CAMS for major European capitals (Athens, Berlin, Paris, Amsterdam, Stockholm).
2. **Explainable AI (XAI) Anomaly Detection:** Scikit-learn `IsolationForest` combined with statistical z-score baselines, providing human-readable rationales and actionable municipal interventions.
3. **What-If Policy Intervention Simulator:** Interactive decision support system (DSS) evaluating Low Emission Zones (LEZ), urban green canopy expansion, and municipal EV electrification against WHO guidelines.
4. **Citizen Science & Public Health Advisory:** Dynamic European Air Quality Index (AQI) translation into localized health recommendations for outdoor sports, residential ventilation, and vulnerable demographics.
5. **Open Science & FAIR Compliance:** INSPIRE-directive compliant GeoJSON spatial exports and open CSV timeseries downloads.

---

## 🏗️ System Architecture

```
                       ┌──────────────────────────────────────────┐
                       │          Nginx Reverse Proxy             │
                       │             (Port 80)                    │
                       └──────────────────┬───────────────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
     ┌───────────────────────────┐                 ┌───────────────────────────┐
     │     Next.js 14 Frontend   │                 │     FastAPI Backend       │
     │      (Port 3000)          │◄─── REST/WS ───►│      (Port 8000)          │
     │   Tailwind + Recharts     │                 │   Python 3.11 + AsyncIO   │
     │   Leaflet GIS Heatmap     │                 │   Scikit-Learn XAI Engine │
     └───────────────────────────┘                 └─────────────┬─────────────┘
                                                                 │
                                          ┌──────────────────────┴───────────────┐
                                          ▼                                      ▼
                            ┌───────────────────────────┐          ┌───────────────────────────┐
                            │   TimescaleDB (Postgres)  │          │      Redis 7 Cache        │
                            │        (Port 5432)        │          │       (Port 6379)         │
                            │   Hypertables & RBAC      │          │   Tokens & Rate Limiting  │
                            └───────────────────────────┘          └───────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) ≥ 24.0
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.20
- Git

### 2. Clone & Spin Up
```bash
git clone https://github.com/DrSotos/sentra.git
cd sentra
docker compose up --build -d
```

### 3. Service Endpoints

| Service | URL | Credentials |
|---------|-----|-------------|
| 🖥️ **Web Application** | [http://localhost:3000](http://localhost:3000) | `admin@sentra.eu` / `admin123` |
| 🎛️ **What-If Simulator** | [http://localhost:3000/dashboard/simulator](http://localhost:3000/dashboard/simulator) | Authenticated |
| 🧠 **Explainable AI (XAI)** | [http://localhost:3000/dashboard/anomalies](http://localhost:3000/dashboard/anomalies) | Authenticated |
| 🗺️ **GIS Geospatial Map** | [http://localhost:3000/dashboard/map](http://localhost:3000/dashboard/map) | Authenticated |
| ⚙️ **OpenAPI / Swagger** | [http://localhost:8000/docs](http://localhost:8000/docs) | Public |
| 🔄 **Nginx Reverse Proxy** | [http://localhost](http://localhost) | Public |

### 4. Default Seed Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@sentra.eu` | `admin123` | Full access, user management, audit logs |
| **Researcher** | `researcher@sentra.eu` | `research123` | ML inference, scenario simulations, station edit |
| **Viewer** | `viewer@sentra.eu` | `viewer123` | Read-only telemetry, maps, public citizen advisory |

---

## 🔬 Scientific & Analytical Modules

### 1. What-If Policy Simulator
Simulates urban interventions and predicts particulate matter ($PM_{2.5}$) and Nitrogen Dioxide ($NO_2$) attenuation:
- **Traffic Calming (LEZ):** Direct impact on mobile combustion emissions.
- **Urban Green Canopy:** Biophilic particulate deposition modeling ($v_d \times LAI$).
- **Transit Electrification:** Municipal fleet decarbonization.

### 2. Explainable AI (XAI)
Runs an unsupervised Isolation Forest combined with a sliding-window statistical baseline. For every flagged observation, the engine produces:
- Anomaly score $\in [-1, 1]$
- Z-score deviation $\sigma = \frac{x - \mu}{\sigma_s}$
- Natural language clinical rationale
- Suggested municipal policy response

### 3. FAIR Data Stewardship
- **GeoJSON:** Output conforms to the EU INSPIRE Directive for spatial data infrastructure.
- **CSV Timeseries:** Formatted with ISO 8601 timestamps and SI units ($\mu g/m^3$, $^\circ C$).

---

## 🛠️ Tech Stack Details

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts, Leaflet / React-Leaflet, Zustand.
- **Backend:** FastAPI, Python 3.11, SQLAlchemy 2.0 (Asyncpg), Pydantic v2, Scikit-Learn, APScheduler, Passlib / BCrypt.
- **Database:** PostgreSQL 16 + TimescaleDB Extension (time-series hypertable chunking).
- **Caching & Broker:** Redis 7 Alpine.
- **Reverse Proxy:** Nginx Alpine.

---

## 📜 License & Compliance

Distributed under the **European Union Public Licence (EUPL-1.2)**.  
Compatible with Horizon Europe Open Science and FAIR data management principles.
