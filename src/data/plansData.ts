import { AuditPlan } from '../types';

const todayStr = new Date().toISOString().split('T')[0];
const nextWeekDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

export const INITIAL_PLANS: AuditPlan[] = [
  {
    planId: 'PLN-CHN-001',
    ref: 'AA',
    dept: 'MIS',
    fn: 'MIS',
    month: 'August',
    planDate: todayStr,
    auditor: 'Jake (Chennai Auditor)',
    spocMail: 'jayalalitha@casagrand.co.in',
    hodMail: 'yuvaraj@casagrand.co.in',
    remarks: 'Monthly MIS Process Audit - Chennai',
    type: 'Plan',
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  },
  {
    planId: 'PLN-CHN-002',
    ref: 'AE',
    dept: 'RETENTION',
    fn: 'RETENTION',
    month: 'August',
    planDate: nextWeekDate,
    auditor: 'Jake (Chennai Auditor)',
    spocMail: 'seshadri@casagrand.co.in',
    hodMail: 'dinesh.r@casagrand.co.in',
    remarks: 'Quarterly Customer Retention Audit',
    type: 'Plan',
    status: 'YET TO AUDIT',
    createdAt: new Date().toISOString()
  },
  {
    planId: 'PLN-CBE-001',
    ref: 'R1',
    dept: 'HUMAN RESOURCES',
    fn: 'HR - RECRUITMENT',
    month: 'August',
    planDate: todayStr,
    auditor: 'Anand (Coimbatore Auditor)',
    spocMail: 'vignesh.kumar@casagrand.co.in',
    hodMail: 'naveenkumar.v@casagrand.co.in',
    remarks: 'Recruitment SLAs & Onboarding Compliance',
    type: 'Plan',
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  },
  {
    planId: 'PLN-BLR-001',
    ref: 'AC',
    dept: 'P&L',
    fn: 'P&L',
    month: 'August',
    planDate: nextWeekDate,
    auditor: 'Deepak (Bangalore Auditor)',
    spocMail: 'karthik.pnl@casagrand.co.in',
    hodMail: 'venkat@casagrand.co.in',
    remarks: 'P&L Variance Review - Bangalore Zone',
    type: 'Plan',
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  }
];
