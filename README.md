<div align="center">

# 🌿 SENTRA

### Smart Environmental Network for Territorial Resilience Analytics

[![License: EUPL-1.2](https://img.shields.io/badge/License-EUPL--1.2-blue.svg)](https://opensource.org/licenses/EUPL-1.2)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://docker.com)

**An EU Horizon Europe research prototype for real-time environmental monitoring,
anomaly detection, and predictive analytics across European urban areas.**

</div>

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24.0
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.20

### Launch

```bash
git clone https://github.com/YOUR_USERNAME/sentra.git
cd sentra
cp .env.example .env
docker compose up --build -d
```

### Access

| Service | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost:3000 |
| ⚙️ API Docs | http://localhost:8000/docs |
| 🔄 Proxy | http://localhost |

### Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sentra.eu | admin123 |
| Researcher | researcher@sentra.eu | research123 |
| Viewer | viewer@sentra.eu | viewer123 |

---

## 🏗️ Architecture

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + Recharts + Leaflet
- **Backend:** Python 3.11 + FastAPI + SQLAlchemy 2.0
- **Database:** PostgreSQL 16 + TimescaleDB
- **Cache:** Redis 7
- **ML/AI:** scikit-learn (Isolation Forest) + Prophet
- **DevOps:** Docker Compose + Nginx

---

## 📄 License

EUPL-1.2 — See [LICENSE](LICENSE) for details.

