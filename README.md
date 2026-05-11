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
