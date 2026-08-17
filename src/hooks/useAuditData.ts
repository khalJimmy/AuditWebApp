import { useState, useEffect, useCallback, useMemo } from 'react';
import { Department, User, AuditReport, PlanItem, AuditTask, Settings } from '../types';
import { DepartmentModel } from '../models/DepartmentModel';
import { DepartmentCatalog } from '../models/DepartmentCatalog';
import { api } from '../services/api';

export function useAuditData(currentUser: User | null) {
  const [depts, setDepts] = useState<DepartmentModel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [tasks, setTasks] = useState<AuditTask[]>([]);
  const [settings, setSettings] = useState<Settings>({
    tatHours: 72,
    defaultYear: '2026-27',
    systemEmail: 'audit@casagrand.co.in',
    dispatchTemplate: 'Dear SPOC,\n\nPlease log in to review and address the open findings from the process audit.',
    reminderTemplate: 'Dear SPOC,\n\nThis is a reminder that corrective actions for your audit task are pending.'
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const addToast = useCallback((msg: string | null) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchAll = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const isAdmin = currentUser.role === 'admin';
      
      const [d, u, a, p, t, s] = await Promise.all([
        api.getDepts(),
        isAdmin ? api.getUsers() : Promise.resolve([currentUser]),
        api.getAudits(),
        api.getPlans(),
        api.getTasks(),
        isAdmin ? api.getSettings() : Promise.resolve(null)
      ]);

      setDepts(d);
      setUsers(u);

      // Filter audits/tasks based on user role if not admin
      if (currentUser.role === 'spoc') {
        const userEmail = (currentUser.email || '').toLowerCase();
        const userDepts = currentUser.depts || [];
        const userUsername = (currentUser.username || '').toLowerCase();

        const filteredTasks = t.filter(task => 
          (task.spocMail && task.spocMail.toLowerCase() === userEmail) ||
          userDepts.includes(task.dept) ||
          userDepts.some(deptRef => d.find(dp => dp.ref === deptRef && (dp.dept === task.dept || dp.fn === task.fn))) ||
          task.dept?.toLowerCase() === userUsername
        );
        const filteredAudits = a.filter(audit =>
          userDepts.includes(audit.dept) ||
          userDepts.includes(audit.ref) ||
          userDepts.some(deptRef => d.find(dp => dp.ref === deptRef && (dp.dept === audit.dept || dp.fn === audit.fn)))
        );
        setAudits(filteredAudits);
        setPlans(p);
        setTasks(filteredTasks);
      } else {
        setAudits(a);
        setPlans(p);
        setTasks(t);
      }

      if (s) setSettings(s);
    } catch (err: any) {
      console.error('Failed fetching app data', err);
      setError(err.message || 'Failed loading data from server');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchAll();
    }
  }, [currentUser, fetchAll]);

  // Actions
  const submitAudit = async (audit: Partial<AuditReport>) => {
    try {
      const res = await api.submitAudit(audit);
      await fetchAll();
      addToast('✅ Audit report submitted successfully');
      return res.audit;
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  const savePlan = async (plan: Partial<PlanItem>) => {
    try {
      const res = await api.savePlan(plan);
      await fetchAll();
      addToast('✅ Audit schedule saved successfully');
      return res.plan;
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await api.deletePlan(id);
      await fetchAll();
      addToast('✅ Schedule removed successfully');
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  const dispatchTask = async (params: {
    auditId: string;
    spocMail?: string;
    hodMail?: string;
    smtpServerId?: string;
    attachments?: any[];
    includeAttachment?: boolean;
  }) => {
    try {
      const res = await api.dispatchAudit(params);
      await fetchAll();
      if (res.realEmailDelivered) {
        addToast(`✉️ Real Email delivered to ${params.spocMail || 'SPOC'} via ${res.serverName || 'SMTP'}!`);
      } else {
        addToast('🚀 Audit findings dispatched & 72h SLA clock started');
      }
      return res.task;
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Dispatch Error: ${err.message}`);
      throw err;
    }
  };

  const submitSpocResponse = async (params: { taskId?: string; token?: string; responses: Record<string, any> }) => {
    try {
      const res = await api.submitResponse(params);
      await fetchAll();
      addToast('✅ Corrective actions submitted successfully');
      return res.task;
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Submission Error: ${err.message}`);
      throw err;
    }
  };

  const submitResponseByAuditId = async (params: { auditId: string; responses: Record<string, any> }) => {
    const task = tasks.find(t => t.auditId === params.auditId);
    if (!task) {
      throw new Error(`No task found for Audit ID ${params.auditId}`);
    }
    return submitSpocResponse({ taskId: task.taskId, responses: params.responses });
  };

  const sendReminder = async (taskId: string) => {
    try {
      const res = await api.sendReminder(taskId);
      await fetchAll();
      addToast(`🔔 Reminder #${res.reminderCount} sent to SPOC`);
      return res.reminderCount;
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Reminder Error: ${err.message}`);
      throw err;
    }
  };

  const closeTask = async (taskId: string) => {
    try {
      const res = await api.closeTask(taskId);
      await fetchAll();
      addToast('✅ Task closed successfully');
      return res.task;
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  const deptCatalog = useMemo(() => new DepartmentCatalog(depts), [depts]);

  const saveDept = async (dept: Department) => {
    try {
      const res = await api.saveDept(dept);
      const savedModel = DepartmentModel.fromJSON(res.department || dept);
      setDepts((prev) => {
        const index = prev.findIndex((d) => d.ref.toLowerCase() === savedModel.ref.toLowerCase());
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = savedModel;
          return updated;
        }
        return [...prev, savedModel];
      });
      addToast('✅ Department updated successfully');
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  const deleteDept = async (ref: string) => {
    try {
      await api.deleteDept(ref);
      setDepts((prev) => prev.filter((d) => d.ref.toLowerCase() !== ref.toLowerCase()));
      addToast('✅ Department deleted');
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  const importDepts = async (importedDepts: Department[]) => {
    try {
      const res = await api.importDepts(importedDepts);
      await fetchAll();
      addToast(`✅ Imported ${res.added} department(s)`);
      return res;
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  const saveUser = async (user: Partial<User>) => {
    try {
      await api.saveUser(user);
      await fetchAll();
      addToast('✅ User saved successfully');
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      await fetchAll();
      addToast('✅ User deleted');
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const res = await api.saveSettings(newSettings);
      await fetchAll();
      addToast('✅ Settings saved');
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Error: ${err.message}`);
      throw err;
    }
  };

  const resetData = async () => {
    try {
      await api.resetData();
      await fetchAll();
      addToast('🔄 Data reset to default mock state');
    } catch (err: any) {
      setError(err.message);
      addToast(`❌ Reset Error: ${err.message}`);
      throw err;
    }
  };

  return {
    depts,
    deptCatalog,
    users,
    audits,
    plans,
    tasks,
    settings,
    loading,
    error,
    toastMessage,
    addToast,
    refreshData: fetchAll,
    submitAudit,
    savePlan,
    deletePlan,
    dispatchTask,
    submitSpocResponse,
    submitResponseByAuditId,
    sendReminder,
    closeTask,
    saveDept,
    deleteDept,
    importDepts,
    saveUser,
    deleteUser,
    updateSettings,
    resetData
  };
}
