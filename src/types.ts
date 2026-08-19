export type UserRole = 'admin' | 'auditor' | 'spoc' | 'hod';

export type ZoneName = 'Chennai' | 'Coimbatore' | 'Bangalore';

export type FindingType = 't1' | 't2' | 't3' | 't4';

export interface User {
  id: string;
  name: string;
  username: string;
  pw?: string;
  role: UserRole;
  zone?: ZoneName | '';
  depts?: string[];
  email?: string;
  phone?: string;
  active?: boolean;
  lastLogin?: string;
}


export interface KanbanItem {
  id: string;
  title: string;
  category: 'User Rules' | 'Audit Engine' | 'SLA & TAT' | 'Dispatches' | 'Analytics';
  column: 'verified' | 'in_progress' | 'backlog';
  priority: 'High' | 'Medium' | 'Low';
  assignedRole: UserRole | 'all';
  description: string;
  verificationLogRef?: string;
  lastCheckedAt: string;
}

export interface ZoneContact {
  sn: string;      // SPOC Name
  sm: string;      // SPOC Email
  hm: string;      // HOD Email
  hodName?: string;// HOD Name
  phone?: string;
  spocId?: string;
}

export interface Department {
  id?: string;      // Unique Department ID (e.g. dept_aa, dept_ae)
  ref: string;      // Unique Reference code (e.g. AA, AE, AD)
  dept: string;     // Department Name
  fn: string;       // Function Name
  sn?: string;      // Default SPOC Name
  sm?: string;      // Default SPOC Email
  hm?: string;      // Default HOD Email
  hodName?: string; // Default HOD Name
  zoneContacts?: Partial<Record<ZoneName, ZoneContact>>; // Zone-specific SPOC/HOD mapping
}

export interface Finding {
  id: string;
  type: FindingType;
  subtype?: string;
  process?: string;
  description: string;
  evidence?: string;
  imm?: string;
  rc?: string;
  capa?: string;
  mitigation?: string;
  dueDate?: string;
  responsible?: string;
  status?: string;
}

export interface ScoreParam {
  id: string;
  title: string;
  max: number;
  actual?: number;
  remarks?: string;
}

export interface AuditReport {
  auditId: string;
  planId?: string; // Linked Audit Plan ID
  auditDate: string;
  reportDate?: string;
  ref: string;
  dept: string;
  fn: string;
  zone: ZoneName | '';
  auditor: string;
  auditType?: string;
  auditee?: string;
  hod?: string;
  scope?: string;
  params?: string;
  sampling?: string;
  prevRef?: string;
  momDate?: string;
  agenda?: string;
  riskNotes?: string;
  findings: Finding[];
  compliancePct: string;
  processScore: number;
  ncCount: number;
  obsCount: number;
  riskCount: number;
  ciCount: number;
  closureDate?: string;
  closureSpoc?: string;
  closureSummary?: string;
  closureResponse?: string;
  auditorSign?: string;
  hodApproval?: string;
  preparedBy?: string;
  approvedBy?: string;
  status: 'Draft' | 'Submitted' | 'Dispatched' | 'Closed';
  submittedAt?: string;
  submittedBy?: string;
  spocMail?: string;
  hodMail?: string;
}

export interface PlanItem {
  id?: string;
  planId?: string;
  ref: string;
  dept: string;
  fn: string;
  date?: string;
  month?: string;
  planDate?: string;
  auditor?: string;
  auditee?: string;
  hod?: string;
  spocMail?: string;
  hodMail?: string;
  notes?: string;
  remarks?: string;
  type?: 'Plan' | 'Adhoc';
  zone?: ZoneName | '';
  status?: 'Scheduled' | 'COMPLETED' | 'NOT COMPLETED' | 'YET TO AUDIT';
  createdAt?: string;
}

export type AuditPlan = PlanItem;

export interface EmailLogEntry {
  sentAt: string;
  recipient: string;
  type: 'initial_dispatch' | 'reminder' | 'manual_notice';
  status: string;
  subject?: string;
  messageId?: string;
  error?: string;
}

export interface AuditTask {
  taskId: string;
  auditId: string;
  dept: string;
  fn: string;
  spocName?: string;
  spocMail?: string;
  hodMail?: string;
  token: string;
  dispatchedAt: string;
  dueAt: string;
  findings: Finding[];
  status: 'Notified' | 'Response Pending' | 'Delayed' | 'Completed' | 'Closed';
  reminderCount?: number;
  emailSentCount?: number;
  emailLogs?: EmailLogEntry[];
  respondedAt?: string;
  closedAt?: string;
  response?: Record<string, {
    imm?: string;
    rc?: string;
    capa?: string;
    mitigation?: string;
  }>;
}

export interface ZoneAuditors {
  Chennai: string[];
  Coimbatore: string[];
  Bangalore: string[];
}

export type EmailProviderType = 'resend' | 'gmail' | 'office365' | 'custom';

export interface SmtpServerConfig {
  id: string;
  name: string;
  provider: EmailProviderType;
  apiKey?: string; // For Resend API Key (re_...)
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromName: string;
  fromEmail: string;
  isDefault?: boolean;
  lastTestedAt?: string;
  status?: 'verified' | 'failed' | 'untested';
  testMessageId?: string;
}

export type EmailServerConfig = SmtpServerConfig;

export interface EmailAttachment {
  filename: string;
  content: string;
  encoding?: 'base64' | 'utf-8';
  contentType?: string;
}

export interface Settings {
  tatHours: number;
  defaultYear: string;
  systemEmail: string;
  dispatchTemplate: string;
  reminderTemplate: string;
  auditors?: ZoneAuditors;
  params?: { id: string; title: string; max: number }[];
  senderEmail?: string;
  resendApiKey?: string;
  smtpServers?: SmtpServerConfig[];
  activeSmtpServerId?: string;
}

export type SystemSettings = Settings;

export interface AuthState {
  user: User | null;
  token: string | null;
}
