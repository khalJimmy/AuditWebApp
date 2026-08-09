# 📜 Casagrand Process Audit System - Operational SOP, Policy & Rules Governance

**Document Identifier:** CG-SOP-AUDIT-2026-V3.4  
**Effective Date:** Financial Year 2025-26 / 2026-27  
**Organization:** Casagrand Builder Private Limited (P&C Quality & Process Audit)  
**Applicability:** All Regional Zones (Chennai, Coimbatore, Bangalore) & Operating Departments  

---

## 📌 1. Operational Overview & Purpose

This policy defines the standard operating procedures (SOP), governance rules, scoring models, SLA turnaround time (TAT) deadlines, and role-based access rules for the **Casagrand Process & Quality Audit Operations Platform**.

The objective is to drive zero-defect operational compliance, enforce transparent 72-hour issue resolution SLA, mandate root-cause analysis (RCA), and maintain continuous process improvements across all departmental functions.

---

## ⏱ 2. SLA Turnaround Time (TAT) Policy & Escalation Matrix

### 2.1 The 72-Hour Resolution Mandate
- **Standard SLA:** Every dispatched audit finding carries a strict **72-Hour Turnaround Time (TAT)** deadline starting from the exact minute of dispatch (`dispatchedAt`).
- **SLA Clock Trigger:** The SLA clock starts immediately when an Auditor/Admin clicks **"Dispatch Findings"** and generates the SPOC access token.

### 2.2 Status & SLA Classification Logic
| Status Badge | Time Remaining / Condition | Description & Action |
| :--- | :--- | :--- |
| **🟢 On Track** | > 24 Hours Remaining | SPOC has sufficient time to complete Immediate Correction, RCA & CAPA. |
| **🟡 Urgent (<24h)** | 0 - 24 Hours Remaining | Approaching SLA breach limit. Automated reminder sent to SPOC. |
| **🔴 Overdue Breached** | < 0 Hours (Past Due) | SLA limit exceeded. Escalated to Department Head (HOD) & Management. |
| **🔵 Completed** | Submitted within SLA | SPOC has submitted CAPA responses; awaiting Auditor verification. |
| **✅ Closed** | Verified & Approved | Audit findings verified by Auditor/Lead and closed. |

### 2.3 Escalation Protocol
1. **At T + 0 Hours (Dispatch):** Automated notification dispatched to SPOC email with direct access token link.
2. **At T + 48 Hours (24h Before Due):** Reminder #1 dispatched if CAPA response is still pending.
3. **At T + 72 Hours (SLA Breach):** Task status transitions to **Delayed / Overdue**. Escalate directly to Department HOD (`hodMail`) and Quality Lead.

---

## 📊 3. Audit Scoring Model & Compliance Formulas

### 3.1 Scoring Engine Specifications
Each audit report consists of **10 Standardized Evaluation Parameters**.
- Each parameter carries a **Maximum Score of 100 Points**.
- **Total Maximum Score per Audit Report:** **1,000 Points**.

### 3.2 Standard Evaluation Parameters (100 Points Each)
1. **SOP & Process Compliance** (Max: 100)
2. **Documentation & Record Keeping** (Max: 100)
3. **TAT & SLA Adherence** (Max: 100)
4. **Data Accuracy & Integrity** (Max: 100)
5. **Approval Hierarchy & Controls** (Max: 100)
6. **Communication & Inter-dept Coordination** (Max: 100)
7. **Resource Utilization & Efficiency** (Max: 100)
8. **Risk Management & Internal Controls** (Max: 100)
9. **Customer / Vendor Satisfaction Impact** (Max: 100)
10. **Previous Audit Closure Implementation** (Max: 100)

### 3.3 Mathematical Formulas
- **Actual Score Sum:**  
  $$\text{Actual Score} = \sum_{i=1}^{10} \min(\text{Actual Points}_i, \text{Max Points}_i)$$
- **Compliance Percentage:**  
  $$\text{Compliance \%} = \left( \frac{\text{Actual Total Score}}{\text{Max Total Score}} \right) \times 100$$

### 3.4 Compliance Rating Scale
- **90% - 100%:** 🌟 **Exemplary / Compliant** (High process maturity)
- **75% - 89%:** 🟢 **Satisfactory** (Minor process observations)
- **60% - 74%:** 🟡 **Needs Improvement** (Significant NCs identified)
- **< 60%:** 🔴 **Critical Risk / Non-Compliant** (Immediate management review required)

---

## 🔍 4. Finding Classification & CAPA Rules

Every audit finding must be classified into one of four standard types:

| Finding Type | Code | Severity | CAPA Requirement |
| :--- | :--- | :--- | :--- |
| **Non-Compliance** | `t1` | 🔴 High | Mandatory Immediate Correction + RCA + CAPA + Preventive Action |
| **Observation** | `t2` | 🟡 Medium | Immediate Correction + Process Alignment |
| **Process Risk** | `t3` | 🟠 High | Mitigation Plan + Risk Control Matrix Update |
| **Continuous Improvement** | `t4` | 🔵 Low | Best Practice Recommendation |

### 4.1 Required Elements for SPOC Response
When responding to dispatched findings, the SPOC must provide all 4 CAPA pillars:
1. **Immediate Correction (Imm):** Action taken immediately to contain the issue.
2. **Root Cause Analysis (RCA):** Underlying system or human reason why the failure occurred.
3. **Corrective & Preventive Action (CAPA):** Long-term process fix to ensure zero recurrence.
4. **Mitigation / Evidence:** Target completion dates, procedural updates, or verification files.

---

## 🔒 5. Role-Based Access Control (RBAC) Policy

The system strictly enforces three role levels (`admin`, `auditor`, `spoc`):

| Feature / Module | Admin / Audit Lead | Auditor | SPOC (Dept Representative) |
| :--- | :---: | :---: | :---: |
| **Executive Dashboard** | Full Access | View Only | View Only |
| **Monthly Planner** | Create / Edit / Delete | View Only | No Access |
| **Audit Form (New Audit)** | Full Access | Full Access | No Access |
| **Dispatch Center** | Dispatch & Re-assign | Dispatch Only | No Access |
| **TAT SLA Tracker** | Send Reminders / Close | Send Reminders | View My Tasks |
| **SPOC Action Portal** | View All Responses | View All Responses | Submit CAPA Responses |
| **Department Master** | Create / Edit / Import | View Only | View Only |
| **User Directory** | Manage Users & PWs | No Access | No Access |
| **System Settings** | Edit SLA, Templates | View Only | No Access |

---

## 🔄 6. Audit Lifecycle Flow & Rules Sequence

```
1. SCHEDULING (Planner)
   └─ Auditor/Admin schedules department audit for specific zone & date.

2. INSPECTION (Audit Form)
   └─ Auditor evaluates 10 parameters (max 1000 pts), records NCs/Observations.
   └─ Compliance % calculated automatically. Report submitted as "Submitted".

3. DISPATCH (Dispatch View)
   └─ Lead/Auditor selects SPOC & HOD email addresses.
   └─ Clicks "Dispatch Findings": 72h SLA clock triggers, unique token created.

4. CAPA RESPONSE (SPOC Actions / Token Link)
   └─ SPOC receives notification/link, logs in or uses direct token URL.
   └─ Submits Immediate Correction, Root Cause, and CAPA.

5. VERIFICATION & CLOSURE (TAT Tracker / Dispatch)
   └─ Auditor reviews SPOC responses.
   └─ If satisfied, Auditor closes task ("Closed"). Status changes to "Closed".
```

---

## 🛡 7. Policy Enforcement & Compliance Assurance
- **Data Integrity:** Past audit reports and dispatched findings are immutable once closed.
- **Audit Trail:** Every action (submission, dispatch, reminder, response, closure) records exact timestamp and user metadata.
- **Strict Adherence:** All internal system configurations, background services, and code logic MUST strictly conform to the policies outlined in this document.
