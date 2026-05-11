# Asset & Incident Management System

A full stack IT operations platform with AI-powered ticket triage, role-based access control, and automated workflow monitoring. Built to simulate enterprise-grade asset and incident management used by real IT departments.

**[Live Demo](https://asset-incident-management.vercel.app)** · **[API](https://asset-incident-management-jyarijarla.onrender.com)** · **[GitHub](https://github.com/jyarijarla/asset-incident-management)**

---

## Overview

Most IT teams manage assets and incidents through disconnected spreadsheets and manual processes. This system centralizes asset tracking, incident reporting, and workflow automation into a single platform — with an AI layer that automatically triages incoming tickets and overrides incorrect priority assessments based on actual severity.

---

## Features

### Core System
- **Asset Management** — full lifecycle tracking for laptops, monitors, servers, networking equipment, and peripherals with status management (active, inactive, under maintenance)
- **Incident Ticketing** — end-to-end ticket lifecycle from open → in progress → resolved → closed with priority levels (low, medium, high, critical)
- **Role-Based Access Control** — three-tier permission system (Admin, Technician, Viewer) enforced at both the API middleware and UI levels
- **JWT Authentication** — stateless auth with bcrypt password hashing and token-based session management

### AI-Powered Triage
- Automatically analyzes every incoming ticket using the Claude API
- Suggests correct priority level based on description severity, overriding user input when necessary
- Categorizes issue type (hardware, software, network, security, access, performance)
- Provides actionable resolution recommendations to the assigned technician

### Python Automation
- **Weekly Report** (`weekly_report.py`) — generates CSV reports of ticket status, asset health, and open incidents; designed to run as a scheduled cron job
- **SLA Monitor** (`sla_monitor.py`) — scans all open tickets every hour, automatically escalates tickets breaching the 48-hour threshold to critical priority, and logs breaches to an audit table
- **Asset Audit** (`asset_audit.py`) — identifies stale assets not updated in 90+ days, flags unassigned equipment, and generates per-asset ticket history reports

### Dashboard & Reporting
- Real-time stats on total assets, open tickets, in-progress incidents, and resolved tickets
- Recent asset and ticket activity feed with color-coded status badges
- Role-aware UI — admins see full management controls, technicians see operational tools, viewers see read-only data

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| React Router | Client-side routing |
| Axios | HTTP client with interceptors |
| Vite | Build tool |
| CSS-in-JS | Styling |

### Backend
| Technology | Purpose |
|---|---|
| Node.js / Express | REST API server |
| PostgreSQL | Relational database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Helmet | Security headers |
| CORS | Cross-origin resource sharing |

### AI & Automation
| Technology | Purpose |
|---|---|
| Claude API (Anthropic) | AI ticket triage |
| Python 3 | Automation scripts |
| psycopg2 | PostgreSQL driver for Python |
| ReportLab | PDF/CSV report generation |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase | Cloud PostgreSQL database |
| Render | Backend hosting |
| Vercel | Frontend hosting |
| GitHub Actions | CI/CD pipeline |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│              (Vercel — vercel.app)                   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS / REST
┌───────────────────────▼─────────────────────────────┐
│              Express.js Backend                      │
│              (Render — onrender.com)                 │
│                                                      │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │  Routes  │→ │Controllers │→ │   AI Triage     │  │
│  └──────────┘  └─────┬──────┘  │ (Claude API)    │  │
│                       │         └─────────────────┘  │
│               ┌───────▼──────┐                       │
│               │  Middleware  │                       │
│               │ JWT + RBAC   │                       │
│               └───────┬──────┘                       │
└───────────────────────┼─────────────────────────────┘
                        │ SSL
┌───────────────────────▼─────────────────────────────┐
│              PostgreSQL Database                     │
│              (Supabase — supabase.com)               │
│                                                      │
│  roles │ users │ assets │ asset_types │ tickets      │
│  sla_breaches                                        │
└─────────────────────────────────────────────────────┘
                        ▲
┌───────────────────────┴─────────────────────────────┐
│              Python Automation                       │
│                                                      │
│  weekly_report.py  │  sla_monitor.py  │  asset_audit │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

6 tables with typed constraints, foreign key relationships, and PostgreSQL ENUMs:

```
roles ──────────── users ──────────── assets
                     │                  │
                     └──── tickets ─────┘
                               │
                          sla_breaches
```

| Table | Purpose |
|---|---|
| `roles` | Admin, Technician, Viewer with JSON permissions |
| `users` | User accounts with role assignments |
| `asset_types` | Lookup table for asset categories |
| `assets` | Asset inventory with status tracking |
| `tickets` | Incident tickets with AI triage fields |
| `sla_breaches` | Audit log of SLA violations |

---

## API Endpoints

**Auth**
```
POST /api/auth/register
POST /api/auth/login
```

**Users** (Admin only except /me)
```
GET    /api/users/me
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

**Assets**
```
GET    /api/assets          (all roles)
GET    /api/assets/:id      (all roles)
POST   /api/assets          (admin only)
PUT    /api/assets/:id      (admin only)
DELETE /api/assets/:id      (admin only)
```

**Tickets**
```
GET    /api/tickets         (all roles)
GET    /api/tickets/:id     (all roles)
POST   /api/tickets         (admin + technician) → triggers AI triage
PUT    /api/tickets/:id     (admin + technician)
DELETE /api/tickets/:id     (admin only)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+ (or Supabase account)

### Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
NODE_ENV=development
ANTHROPIC_API_KEY=your_claude_api_key
```

Run database migrations in your PostgreSQL instance using the schema in `/backend/schema.sql`, then:

```bash
npm run seed    # seed roles and asset types
npm run dev     # start development server
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Python Automation Setup

```bash
cd automation
python -m venv venv
venv\Scripts\activate     # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

Create `automation/.env`:
```env
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=5432
```

Run scripts:
```bash
python weekly_report.py    # generate weekly CSV report
python sla_monitor.py      # check for SLA breaches
python asset_audit.py      # audit asset health
```

---

## Role Permissions

| Action | Admin | Technician | Viewer |
|---|---|---|---|
| View assets | ✅ | ✅ | ✅ |
| Create/edit/delete assets | ✅ | ❌ | ❌ |
| View tickets | ✅ | ✅ | ✅ |
| Create/update tickets | ✅ | ✅ | ❌ |
| Delete tickets | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| View dashboard | ✅ | ✅ | ✅ |

---

## AI Ticket Triage

When a ticket is created via the API, the system automatically calls the Claude API to analyze the description and returns:

```json
{
  "ai_priority_suggestion": "critical",
  "ai_category": "hardware",
  "ai_recommendation": "Immediately investigate the production server. Initiate emergency response procedures and notify on-call team."
}
```

The AI uses the following priority guidelines:
- **Critical** — system down, security breach, data loss, multiple users affected
- **High** — major functionality impaired, workaround unavailable
- **Medium** — partial functionality affected, workaround exists
- **Low** — minor issue, cosmetic, single user affected

---

## Python Automation Details

### SLA Monitor
Tickets open for more than 48 hours are automatically escalated to critical priority and logged to the `sla_breaches` table. Designed to run hourly via cron:

```bash
# crontab entry
0 * * * * /path/to/venv/bin/python /path/to/sla_monitor.py
```

### Weekly Report Output
```
============================================================
  WEEKLY SYSTEM REPORT — May 09, 2026
============================================================
📊 TICKET SUMMARY
╭────────────────────┬─────────╮
│ Open               │       4 │
│ In Progress        │       1 │
│ Resolved           │       0 │
│ Created This Week  │       6 │
╰────────────────────┴─────────╯
```

---

## Project Structure

```
asset-incident-management/
├── backend/
│   ├── src/
│   │   ├── config/         # db connection, seed data
│   │   ├── controllers/    # business logic
│   │   ├── middleware/      # JWT auth, RBAC
│   │   ├── routes/         # API route definitions
│   │   └── services/       # AI triage service
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, ProtectedRoute
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Login, Dashboard, Assets, Tickets, Users
│   │   └── utils/          # axios config
│   └── package.json
└── automation/
    ├── weekly_report.py
    ├── sla_monitor.py
    ├── asset_audit.py
    ├── db.py
    └── requirements.txt
```

---

## Author

**Joseph Yarijarla**  
[josephyarijarla.dev](https://josephyarijarla.dev) · [LinkedIn](https://linkedin.com/in/joseph-yarijarla) · [GitHub](https://github.com/jyarijarla)
