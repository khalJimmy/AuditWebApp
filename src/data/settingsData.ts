import { SystemSettings } from '../types.js';

export const INITIAL_SETTINGS: SystemSettings = {
  tatHours: 72,
  defaultYear: '2026-27',
  systemEmail: 'jimelliot.sf@casagrand.co.in',
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
  resendApiKey: '',
  smtpServers: [
    {
      id: 'cfg_resend_default',
      name: 'Resend HTTPS API (Primary Cloud Delivery)',
      provider: 'resend',
      apiKey: '',
      fromName: 'Casagrand Quality & Process Audit',
      fromEmail: 'onboarding@resend.dev',
      isDefault: true,
      status: 'untested'
    },
    {
      id: 'cfg_gmail_backup',
      name: 'Gmail / Google Workspace (jimelliot.sf@casagrand.co.in)',
      provider: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: 'jimelliot.sf@casagrand.co.in',
      pass: 'ftgm nuwx tdrz pyfs',
      fromName: 'Casagrand Quality & Process Audit',
      fromEmail: 'jimelliot.sf@casagrand.co.in',
      isDefault: false,
      status: 'verified'
    }
  ],
  activeSmtpServerId: 'cfg_resend_default'
};
