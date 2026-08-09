# 📁 Casagrand Process Audit System - Connected File Hierarchy & Flow Tree

This document provides a complete architectural overview, visual component hierarchy tree, file connection map, data flow diagrams, and directory structure for the **Casagrand Process Audit & Quality Operations Management Platform (v3.4.0)**.

---

## 🌳 1. Complete File Directory Tree

```
casagrand-process-audit/
├── 📄 index.html                       # HTML Entry Point & Metadata
├── 📄 package.json                     # Dependencies & Scripts (Vite + tsx + esbuild)
├── 📄 tsconfig.json                    # TypeScript Configuration
├── 📄 vite.config.ts                   # Vite Bundler Setup
├── 📄 metadata.json                    # Application Identity & Capabilities
├── 📄 server.ts                        # Full-Stack Express Server & In-Memory REST API
├── 📄 FILE_HIERARCHY.md                # [THIS FILE] File Connection & System Architecture Tree
├── 📄 AUDIT_POLICY_SOP_RULES.md        # Quality Audit Policy, SOP, SLA & Rules Governance
│
└── 📁 src/
    ├── 📄 main.tsx                     # React Web App Mounting
    ├── 📄 index.css                    # Design System, Typography, CSS Variables & Themes
    ├── 📄 types.ts                     # Core TypeScript Interfaces, Enums & Models
    │
    ├── 📁 services/
    │   └── 📄 api.ts                   # Frontend REST API Client Service Bridge
    │
    ├── 📁 hooks/
    │   ├── 📄 useAuth.ts               # User Authentication & Session State Hook
    │   └── 📄 useAuditData.ts          # Central React State Engine & Data Sync Hook
    │
    ├── 📁 data/
    │   └── 📄 mockData.ts              # System Initial Mock Database, Users & Default Settings
    │
    └── 📁 components/                  # UI Components & Modules
        ├── 📄 Header.tsx               # Top Navigation, User Badge, Role-Based Navigation Tabs
        ├── 📄 LoginScreen.tsx          # Login Portal & Account Selector
        ├── 📄 Toast.tsx                # Real-Time Notification & Feedback Overlay
        │
        ├── 📄 DashboardView.tsx        # Executive Analytics, Compliance %, SLA Alerts & Charts
        ├── 📄 PlannerView.tsx          # Monthly Audit Schedule Planner & Excel Importer/Exporter
        ├── 📄 AuditFormView.tsx        # Process Audit Inspection Form & Score Engine (Max 1000 Pts)
        ├── 📄 DispatchView.tsx         # Findings Dispatch Center & SLA Clock Starter
        ├── 📄 TrackerView.tsx          # 72h SLA TAT Tracker, Escalations & Reminders
        ├── 📄 RecordsView.tsx          # Archived Reports Repository & Export Engine
        ├── 📄 SpocActionsView.tsx      # SPOC Action Portal for Corrective Actions (CAPA)
        ├── 📄 SpocRespondOverlay.tsx   # Direct SPOC Response Portal (Token Query Link Mode)
        ├── 📄 DepartmentsView.tsx      # Department Master List & SPOC Email Directory
        ├── 📄 UsersView.tsx            # User Account Access Management & Roles
        ├── 📄 SettingsView.tsx         # System Configuration, SLA Timers & SOP Policy Viewer
        │
        └── 📄 Modals.tsx               # Popups: PlanModal, DispatchModal, ResponseModal,
                                        # DeptModal, ImportModal, UserModal
```

---

## 🔁 2. Data & Request Flow Tree

```
[ USER INTERACTION ]
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                 React View Component                    │
│   (DashboardView / AuditFormView / PlannerView / etc.)  │
└───────────────────────────┬─────────────────────────────┘
                            │ Calls Action
                            ▼
┌─────────────────────────────────────────────────────────┐
│              useAuditData React Hook                    │
│      - Manages Local State (audits, tasks, plans, etc)  │
│      - Provides Dispatchers (submitAudit, savePlan)     │
└───────────────────────────┬─────────────────────────────┘
                            │ Async Service Calls
                            ▼
┌─────────────────────────────────────────────────────────┐
│               api.ts Service Layer                      │
│       - HTTP Client (fetch /api/*)                      │
│       - Header Authorization & Error Handling           │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API Calls (HTTP GET/POST/PUT/DELETE)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                Express Server (server.ts)               │
│       - Port 3000 Ingress                               │
│       - Endpoints: /api/audits, /api/dispatch, etc.    │
│       - Token Verification & In-Memory Store            │
└───────────────────────────┬─────────────────────────────┘
                            │ Mutates/Queries
                            ▼
┌─────────────────────────────────────────────────────────┐
│            Mock In-Memory Store (mockData.ts)           │
│       - Initialized with realistic Casagrand data      │
│       - Live persistence during container execution     │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 3. Component Hierarchy Tree

```
App.tsx (Root Controller)
 │
 ├── LoginScreen.tsx (Renders when unauthenticated)
 │
 ├── SpocRespondOverlay.tsx (Renders when ?token=... is present in URL)
 │
 ├── Header.tsx (Persistent Top Bar)
 │    └── Role-based Navigation Tabs (dash, plan, audit, dispatch, tracker, records, spoc, depts, users, settings)
 │
 ├── main (Tab Container)
 │    ├── DashboardView.tsx
 │    │    └── SLA Stat Cards, Department Compliance % Table, Overdue Alerts
 │    │
 │    ├── PlannerView.tsx
 │    │    └── Schedule Table, Status Badges, Excel Export/Import
 │    │
 │    ├── AuditFormView.tsx
 │    │    ├── Header Info (Zone, Dept, Auditor, Report Date)
 │    │    ├── Process Score Calculator (10 Score Parameters, Max 1000 Pts)
 │    │    ├── Audit Scope, Sampling & Risk Notes
 │    │    └── Findings Table (Non-Compliance, Observations, Risk, CI)
 │    │
 │    ├── DispatchView.tsx
 │    │    └── Un-dispatched Audits List & Trigger Dispatch Action
 │    │
 │    ├── TrackerView.tsx
 │    │    └── Active SLA Clock (72h Countdown), Reminder Counter, Escalation Matrix
 │    │
 │    ├── RecordsView.tsx
 │    │    └── Historic Audit Reports Filter & Summary Viewer
 │    │
 │    ├── SpocActionsView.tsx
 │    │    └── Dispatched Action Items list for SPOC & CAPA Submission Form
 │    │
 │    ├── DepartmentsView.tsx
 │    │    └── Master List of Departments, SPOC & HOD Emails
 │    │
 │    ├── UsersView.tsx
 │    │    └── User Account Directory & Password/Role Management
 │    │
 │    └── SettingsView.tsx
 │         ├── SLA Hours Config (Default: 72 hours)
 │         ├── System Email & Email Templates
 │         └── SOP Rules & System Architecture Viewer
 │
 ├── Modals.tsx
 │    ├── PlanModal (Create / Edit Audit Schedule)
 │    ├── DispatchModal (Configure SPOC / HOD emails & start SLA clock)
 │    ├── ResponseModal (Quick CAPA submission modal)
 │    ├── DeptModal (Create / Edit Department Master)
 │    ├── ImportModal (Excel Bulk Import for Departments)
 │    └── UserModal (Create / Edit User Accounts)
 │
 └── Toast.tsx (Floating Notification Overlay)
```

---

## 🔗 4. Detailed File Connections & Role Responsibilities

### Core Configurations & Infrastructure
- **`package.json`**: Configures `tsx server.ts` for development mode, `vite build && esbuild server.ts` for production bundling, and scripts for compilation and linting.
- **`server.ts`**: Node.js Express server running on port 3000. Provides API endpoints (`/api/auth/login`, `/api/depts`, `/api/users`, `/api/audits`, `/api/plans`, `/api/tasks`, `/api/settings`) and serves the Vite static build in production.

### Data & State Architecture
- **`src/types.ts`**: Central source of truth for all TypeScript type definitions: `User`, `Department`, `AuditReport`, `Finding`, `PlanItem`, `AuditTask`, `Settings`.
- **`src/data/mockData.ts`**: Holds default baseline data for Casagrand departments (e.g. AA, Costing, Purchase, Customer Care), default users (Admin, Auditors, SPOCs), initial sample audit reports, monthly schedules, active tasks, and system settings.
- **`src/services/api.ts`**: Encapsulates all backend HTTP interactions using standard `fetch` with error checking and JSON parsing.

### Custom React Hooks
- **`src/hooks/useAuth.ts`**: Manages user session state, local storage authentication tokens, login attempts, and logout procedures.
- **`src/hooks/useAuditData.ts`**: Central data orchestrator for the entire application. Loads state on login, exposes mutate functions (`submitAudit`, `savePlan`, `dispatchTask`, `submitSpocResponse`, `sendReminder`, `closeTask`), handles background re-fetching, and manages toast alerts.

### Views & Presentation Components
- **`src/components/Header.tsx`**: Dynamic header rendering user zone, name, and role badge. Filters navigation tabs based on user permissions (`admin`, `auditor`, `spoc`).
- **`src/components/DashboardView.tsx`**: Displays executive KPIs (Total Audits, Average Compliance %, Open SLA Dispatches, Overdue Tasks), department compliance rankings, and Excel export capabilities.
- **`src/components/AuditFormView.tsx`**: Powerful interactive form to record process audits, score 10 parameters (100 pts each, total 1000 pts), calculate compliance percentage automatically, categorize findings into 4 types (Non-Compliance, Observation, Risk, Continuous Improvement), and save audit reports.
- **`src/components/DispatchView.tsx`**: Allows Auditors/Admins to dispatch findings to SPOCs, launching a unique response token and starting the 72-hour SLA resolution timer.
- **`src/components/TrackerView.tsx`**: Monitored SLA TAT engine showing live time remaining (in hours/minutes), color-coded SLA badges (On Track, Urgent <24h, Overdue Breached), and automated reminder dispatch tools.
- **`src/components/SpocActionsView.tsx`**: Action center for SPOC users to review findings, enter Immediate Correction (Imm), Root Cause Analysis (RC), Corrective & Preventive Action (CAPA), Mitigation plans, and submit for audit closure.
- **`src/components/SettingsView.tsx`**: Manages system TAT SLA hours (72h), default email templates, system sender address, and displays full SOP Policy & Hierarchy Flow Trees directly in the UI.

---

## 🛠 5. Strict Verification & Rules Matrix
Every component in the system strictly respects the relationships defined in this flow tree. Any structural modification, file addition, or API route adjustment must update this hierarchy tree to maintain 100% consistency.
