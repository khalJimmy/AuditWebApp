import { SystemSettings } from '../types.js';

export const INITIAL_SETTINGS: SystemSettings = {
  tatHours: 72,
  defaultYear: '2026-27',
  systemEmail: 'sfjimelliot@gmail.com',
  dispatchTemplate: 'Dear SPOC,\n\nPlease review and submit Corrective Action Plans (CAPA) for open audit findings within 72 hours SLA.',
  reminderTemplate: 'Dear SPOC,\n\nThis is an urgent reminder that your audit findings resolution SLA deadline is approaching (<24h).',
  auditors: {
    Chennai: ['Jake', 'Karthik Raja', 'Priya S'],
    Coimbatore: ['Anand', 'Vijay L'],
    Bangalore: ['Deepak', 'Meena K']
  },
  params: [
    { id: 'P1', title: 'SOP & Process Compliance', max: 100 },
    { id: 'P2', title: 'Documentation & Record Keeping', max: 100 },
    { id: 'P3', title: 'TAT & SLA Adherence', max: 100 },
    { id: 'P4', title: 'Data Accuracy & Integrity', max: 100 },
    { id: 'P5', title: 'Approval Hierarchy & Controls', max: 100 },
    { id: 'P6', title: 'Inter-dept Coordination', max: 100 },
    { id: 'P7', title: 'Resource Utilization & Efficiency', max: 100 },
    { id: 'P8', title: 'Risk Controls & Compliance', max: 100 },
    { id: 'P9', title: 'Customer / Vendor Impact', max: 100 },
    { id: 'P10', title: 'Previous Audit Action Implementation', max: 100 }
  ],
  senderEmail: 'audit.pnc@casagrand.co.in',
  smtpServers: [
    {
      id: 'smtp_gmail_default',
      name: 'Gmail SMTP (Google Workspace / @gmail.com)',
      provider: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: 'sfjimelliot@gmail.com',
      pass: '',
      fromName: 'Casagrand Quality & Process Audit',
      fromEmail: 'sfjimelliot@gmail.com',
      isDefault: true,
      status: 'untested'
    }
  ],
  activeSmtpServerId: 'smtp_gmail_default'
};
