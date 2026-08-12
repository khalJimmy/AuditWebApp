import { AuditReport, AuditTask } from '../types.js';

const todayStr = new Date().toISOString().split('T')[0];
const due72h = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

export const INITIAL_AUDITS: AuditReport[] = [
  {
    auditId: 'AUD-2026-08-001',
    planId: 'PLN-CHN-001',
    auditDate: todayStr,
    reportDate: todayStr,
    ref: 'AA',
    dept: 'MIS',
    fn: 'MIS',
    zone: 'Chennai',
    auditor: 'Jake (Chennai Auditor)',
    auditType: 'Process Audit',
    auditee: 'Jayalalitha',
    hod: 'Yuvaraj',
    scope: 'Monthly Reporting & Escalation Matrix',
    params: '10',
    sampling: '15 records',
    findings: [
      {
        id: 'f101',
        type: 't1',
        process: 'Weekly MIS Dispatch',
        description: '3 weekly reports were dispatched with 48 hours delay without HOD approval.',
        evidence: 'MIS Log Aug Week 1',
        imm: 'Dispatched updated report immediately.',
        rc: 'System script failed due to schema mismatch.',
        capa: 'Automated schema validation before dispatch.',
        dueDate: todayStr,
        responsible: 'Jayalalitha',
        status: 'Open'
      },
      {
        id: 'f102',
        type: 't2',
        process: 'Data Retention Policy',
        description: 'Backup records not tagged with retention expiry date.',
        evidence: 'Server Drive B',
        imm: 'Tagged current drive.',
        rc: 'Lack of standardized template.',
        capa: 'Introduced mandatory template for backups.',
        dueDate: todayStr,
        responsible: 'Jayalalitha',
        status: 'Open'
      },
      {
        id: 'f103',
        type: 't4',
        process: 'Continuous Improvement',
        description: 'Implemented automated dashboard for real-time tracking.',
        evidence: 'Live Portal',
        status: 'Closed'
      }
    ],
    compliancePct: '85%',
    processScore: 850,
    ncCount: 1,
    obsCount: 1,
    riskCount: 0,
    ciCount: 1,
    closureDate: todayStr,
    closureSpoc: 'Jayalalitha',
    closureSummary: 'Agreed on corrective actions and 72h TAT deadline.',
    preparedBy: 'Jake (Chennai Auditor)',
    approvedBy: 'Audit Lead',
    status: 'Submitted',
    submittedAt: new Date().toISOString(),
    submittedBy: 'auditor1',
    spocMail: 'jayalalitha@casagrand.co.in',
    hodMail: 'yuvaraj@casagrand.co.in'
  }
];

export const INITIAL_TASKS: AuditTask[] = [
  {
    taskId: 'TSK-001',
    auditId: 'AUD-2026-08-001',
    dept: 'MIS',
    fn: 'MIS',
    spocName: 'Jayalalitha',
    spocMail: 'jayalalitha@casagrand.co.in',
    hodMail: 'yuvaraj@casagrand.co.in',
    token: 'TOKEN001AA88992',
    dispatchedAt: new Date().toISOString(),
    dueAt: due72h,
    findings: INITIAL_AUDITS[0].findings,
    status: 'Notified',
    reminderCount: 0,
    response: {}
  }
];
