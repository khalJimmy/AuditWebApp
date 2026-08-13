import { User, Department, AuditReport, PlanItem, AuditTask, Settings } from '../types';
import { DepartmentModel } from '../models/DepartmentModel';
import { supabase } from '../lib/supabase';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

let cachedAuthToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  cachedAuthToken = token;
}

async function getAccessToken(): Promise<string | null> {
  if (cachedAuthToken) return cachedAuthToken;

  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      cachedAuthToken = data.session.access_token;
      return cachedAuthToken;
    }
  } catch {
    // Ignore error during serverless or early startup
  }

  if (typeof window !== 'undefined') {
    try {
      const legacyToken = localStorage.getItem('cpa_token');
      if (legacyToken) return legacyToken;
    } catch {
      // Storage access blocked or restricted
    }
  }
  return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(data.error || `HTTP ${res.status}: Failed request to ${endpoint}`, res.status);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network request failed. Please check your connection.', 0);
  }
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  // Departments
  getDepts: async (): Promise<DepartmentModel[]> => {
    const data = await request<Department[]>('/api/depts');
    return DepartmentModel.fromList(data);
  },

  saveDept: (dept: Department) =>
    request<{ success: boolean; department: Department }>('/api/depts', {
      method: 'POST',
      body: JSON.stringify(dept)
    }),

  deleteDept: (ref: string) =>
    request<{ success: boolean }>(`/api/depts/${encodeURIComponent(ref)}`, {
      method: 'DELETE'
    }),

  importDepts: (depts: Department[]) =>
    request<{ success: boolean; added: number; skipped: number }>('/api/depts/import', {
      method: 'POST',
      body: JSON.stringify(depts)
    }),

  // Users
  getUsers: () => request<User[]>('/api/users'),

  saveUser: (user: Partial<User>) =>
    request<{ success: boolean; user: User }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    }),

  deleteUser: (id: string) =>
    request<{ success: boolean }>(`/api/users/${id}`, {
      method: 'DELETE'
    }),

  // Audits
  getAudits: () => request<AuditReport[]>('/api/audits'),

  submitAudit: (audit: Partial<AuditReport>) =>
    request<{ success: boolean; audit: AuditReport }>('/api/audits', {
      method: 'POST',
      body: JSON.stringify(audit)
    }),

  // Plans
  getPlans: () => request<PlanItem[]>('/api/plans'),

  savePlan: (plan: Partial<PlanItem>) =>
    request<{ success: boolean; plan: PlanItem }>('/api/plans', {
      method: 'POST',
      body: JSON.stringify(plan)
    }),

  deletePlan: (id: string) =>
    request<{ success: boolean }>(`/api/plans/${id}`, {
      method: 'DELETE'
    }),

  // Tasks
  getTasks: () => request<AuditTask[]>('/api/tasks'),

  getTaskByToken: (token: string) =>
    request<AuditTask>(`/api/tasks/token/${token}`),

  dispatchAudit: (auditId: string, spocMail?: string, hodMail?: string) =>
    request<{ success: boolean; task: AuditTask }>('/api/dispatch', {
      method: 'POST',
      body: JSON.stringify({ auditId, spocMail, hodMail })
    }),

  submitResponse: (params: { taskId?: string; token?: string; responses: Record<string, any> }) =>
    request<{ success: boolean; task: AuditTask }>('/api/response', {
      method: 'POST',
      body: JSON.stringify(params)
    }),

  sendReminder: (taskId: string) =>
    request<{ success: boolean; reminderCount: number }>(`/api/tasks/${taskId}/reminder`, {
      method: 'POST'
    }),

  closeTask: (taskId: string) =>
    request<{ success: boolean; task: AuditTask }>(`/api/tasks/${taskId}/close`, {
      method: 'POST'
    }),

  // Settings
  getSettings: () => request<Settings>('/api/settings'),

  saveSettings: (settings: Partial<Settings>) =>
    request<{ success: boolean; settings: Settings }>('/api/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    }),

  resetData: () =>
    request<{ success: boolean }>('/api/reset', {
      method: 'POST'
    }),

  // Spark Plan Usage Metrics
  getUsageMetrics: () =>
    request<{
      sparkLimits: { readsDaily: number; writesDaily: number; deletesDaily: number; storageMb: number; egressMbMonth: number };
      today: { date: string; reads: number; writes: number; deletes: number; egressMb: number };
      currentStorageMb: number;
      dailyLogs: Array<{ date: string; reads: number; writes: number; deletes: number; egressMb: number }>;
      analytics: {
        peakWindow: string;
        avgReadsPerDay: number;
        avgWritesPerDay: number;
        quotaStatus: 'Healthy' | 'Warning' | 'Critical';
        throttledRequests: number;
        readCapacityPercent: number;
        writeCapacityPercent: number;
        storageCapacityPercent: number;
      };
    }>('/api/metrics/usage')
};
