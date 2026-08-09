# CASAGRAND Process Audit System — Operations Verification & System Audit Log

**System Version:** v4.0 (Live)  
**Verification Date:** 2026-08-08  
**Auditor Lead:** System Operations & Compliance Team  

---

## 1. Executive Summary & Architecture Overview

The CASAGRAND Process Audit Management System manages multi-zone operational audits across **Chennai**, **Coimbatore**, and **Bangalore** zones. The platform enforces end-to-end SLA tracking, automated email dispatches, corrective action (CAPA) reviews, and role-based access control (RBAC).

---

## 2. User Management & Role Security Rules

| Role | Access Scope | Operational Privileges | Enforcement Rule |
| :--- | :--- | :--- | :--- |
| **Admin / Audit Lead** | Full System Control | Manage Users, Departments, System Settings, Audit Plans, Dispatches, SLA Extensions, & Deletions. | Access to all navigation tabs (`dash`, `plan`, `audit`, `dispatch`, `tracker`, `records`, `depts`, `users`, `kanban`, `settings`). |
| **Auditor** | Zone & Department Audit Entry | Schedule Plans, Conduct Process Audits, Auto-calculate Compliance Scores, Export Audit Excel/HTML Reports. | Access restricted to `dash`, `plan`, `audit`, `records`, `kanban`. Cannot modify system settings or users. |
| **SPOC (Single Point of Contact)** | Department Findings Review | View assigned open findings, submit Immediate Correction, Root Cause, and CAPA responses within 72h SLA. | Restricted to `spoc` action view and `kanban` board. Department filtering strictly enforced. |
| **HOD (Head of Department)** | Department Oversight & Escalations | Review department compliance scores, view escalated SLA breaches (>72h), approve/reject CAPA closures. | High-priority escalation notifications routed to registered HOD emails upon SLA breach. |

### Enforced Security & Account Rules:
- **Active Account Flag (`active: boolean`)**: Suspended/inactive users are immediately blocked from logging in.
- **Password Complexity Rules**: Passwords must meet minimum security thresholds (minimum 6 characters) and are hashed using zero-trust string digests (`h6`).
- **Department Association Matching**: SPOC and Auditor department assignments (`depts: string[]`) automatically filter open action items and prevent cross-department data leakage.
- **Zone Contact Routing**: Dynamic resolution resolves SPOC (`sm`) and HOD (`hm`) emails per zone override if configured, falling back gracefully to corporate department defaults.

---

## 3. Core System Functions — Verification Status Matrix

### Module A: User Management & Authentication Rules
- [x] **User Creation & Editing**: Validates username uniqueness, password strength, role assignment, and zone/department multi-select.
- [x] **Account Deactivation**: Admins can toggle account active status (`Active` / `Suspended`) without deleting historical audit logs.
- [x] **Role Access Navigation**: NavBar dynamically renders accessible modules based on active user role (`Admin`, `Auditor`, `SPOC`, `HOD`).

### Module B: Audit Planning & Auto Pre-fill Engine
- [x] **Scheduled Audit Plans**: Create annual/monthly audit schedules with assigned auditor, function, and target month.
- [x] **Direct "Fill Audit" Bridge**: Clicking "Fill Audit" on a plan pre-populates department reference, zone, auditor, and zone-specific SPOC/HOD contact emails into the audit form.
- [x] **Dropdown Plan Link**: Audit Form includes an optional dropdown selector linking unscheduled audits to open plan items, marking them `COMPLETED` upon report submission.

### Module C: Audit Execution & Finding Auto-Classification
- [x] **Clear Finding Types**: Categorizes findings into explicit non-technical business labels:
  - `Non-Compliance (NC)` (Severe process breach)
  - `Observation` (Minor process deviation)
  - `Process Risk` (Financial/Compliance/Process Risk with subtype)
  - `Continuous Improvement (CI)` (Positive practice/No corrective action required)
- [x] **Compliance Score Calculation**: Automatically computes scoring percentage `(Score / Max Score) * 100` and assigns visual status badges (Green >= 80%, Amber >= 60%, Red < 60%).

### Module D: Email Dispatch & SLA Escalation Engine
- [x] **Automated Dispatching**: Dispatches open action items to department SPOCs with unique secure access tokens.
- [x] **72-Hour TAT Tracker**: Calculates SLA remaining hours and flags overdue breaches.
- [x] **HOD Escalation Trigger**: Breached findings automatically escalate status to `ESCALATED TO HOD` and trigger urgent reminder templates.

### Module E: Operations Kanban & Operational Board
- [x] **Interactive Kanban Tracking**: Live operational board categorizing system items into `Verified & Operational`, `In Progress / Monitoring`, and `Backlog & SLA Rules`.
- [x] **Role & Category Filters**: Allows filtering operational tasks by category (`User Rules`, `Audit Engine`, `SLA & TAT`, `Dispatches`, `Analytics`) and assigned role.

---

## 4. Verification Sign-Off

- **Lead Auditor:** System Lead (admin)
- **Status:** **PASS** (100% Operational)  
- **System Build Hash:** `v4.0.20260808`
