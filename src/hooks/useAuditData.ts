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
      const isAuditor = currentUser.role === 'auditor';
      
      const scopeParams = isAuditor ? { auditorId: currentUser.id, role: 'auditor' } : undefined;

      const [d, u, a, p, t, s] = await Promise.all([
        api.getDepts(scopeParams),
        isAdmin || isAuditor ? api.getUsers(scopeParams) : Promise.resolve([currentUser]),
        api.getAudits(scopeParams),
        api.getPlans(scopeParams),
        api.getTasks(scopeParams),
        isAdmin ? api.getSettings() : Promise.resolve(null)
      ]);

      // Auditor Scoping & Client-side Assurance:
      // Remember and restrict auditor to only their departments and linked SPOCs/users
      if (isAuditor) {
        const auditorDepts = currentUser.depts || [];
        const auditorZone = currentUser.zone || '';
        const auditorName = (currentUser.name || '').toLowerCase();

        // Filter departments to auditor's assigned departments
        const filteredDepts = auditorDepts.length > 0
          ? d.filter(dp => auditorDepts.includes(dp.ref) || auditorDepts.includes(dp.id || '') || auditorDepts.includes(dp.dept))
          : d;

        // Filter users to only admins, self, and SPOCs for the auditor's departments & zone
        const filteredUsers = u.filter(user =>
          user.role === 'admin' ||
          user.id === currentUser.id ||
          (user.role === 'spoc' && (
            (!auditorZone || !user.zone || user.zone === auditorZone) &&
            (user.depts?.some(deptRef => auditorDepts.includes(deptRef)) || auditorDepts.includes(user.name) || auditorDepts.includes(user.username))
          ))
        );

        // Filter plans and audits
        const filteredAudits = a.filter(audit =>
          auditorDepts.includes(audit.ref) ||
          auditorDepts.includes(audit.dept) ||
          (auditorZone && audit.zone === auditorZone) ||
          (audit.auditor && audit.auditor.toLowerCase().includes(auditorName)) ||
          audit.submittedBy === currentUser.username
        );

        const filteredPlans = p.filter(plan =>
          auditorDepts.includes(plan.ref) ||
          auditorDepts.includes(plan.dept) ||
          (auditorZone && plan.zone === auditorZone) ||
          (plan.auditor && plan.auditor.toLowerCase().includes(auditorName))
        );

        const filteredTasks = t.filter(task =>
          auditorDepts.includes(task.dept) ||
          filteredDepts.some(dp => (dp.dept === task.dept || dp.fn === task.fn) && auditorDepts.includes(dp.ref))
        );

        setDepts(filteredDepts);
        setUsers(filteredUsers);
        setAudits(filteredAudits);
        setPlans(filteredPlans);
        setTasks(filteredTasks);
      } else if (currentUser.role === 'spoc') {
        const userEmail = (currentUser.email || '').toLowerCase();
        const userDepts = currentUser.depts || [];
        const userUsername = (currentUser.username || '').toLowerCase();

        setDepts(d);
        setUsers(u);

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
        setDepts(d);
        setUsers(u);
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
  }, [currentUser?.id, currentUser?.role, currentUser?.email, currentUser?.username, currentUser?.depts, currentUser?.zone]);

  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role;

  useEffect(() => {
    if (currentUserId) {
      fetchAll();
    }
  }, [currentUserId, currentUserRole, fetchAll]);

  // Actions
  const submitAudit = async (audit: Partial<AuditReport>) => {
    try {
      const res = await api.submitAudit(audit);
      await fetchAll();
      addToast('Audit report submitted successfully');
      return res.audit;
    } catch (err: any) {
      setError(err.message);
      addToast(`Error: ${err.message}`);
      throw err;
    }
  };

  const savePlan = async (plan: Partial<PlanItem>) => {
    try {
      const res = await api.savePlan(plan);
      await fetchAll();
      addToast('Audit schedule saved successfully');
      return res.plan;
    } catch (err: any) {
      setError(err.message);
      addToast(`Error: ${err.message}`);
      throw err;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await api.deletePlan(id);
      await fetchAll();
      addToast('Schedule removed successfully');
    } catch (err: any) {
      setError(err.message);
      addToast(`Error: ${err.message}`);
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
        addToast(`Email delivered to ${params.spocMail || 'SPOC'} via ${res.serverName || 'SMTP'}`);
      } else {
        addToast('Audit findings dispatched and 72h SLA clock initiated');
      }
      return res.task;
    } catch (err: any) {
      setError(err.message);
      addToast(`Dispatch Error: ${err.message}`);
      throw err;
    }
  };

  const submitSpocResponse = async (params: { taskId?: string; token?: string; responses: Record<string, any> }) => {
    try {
      const res = await api.submitResponse(params);
      await fetchAll();
      addToast('Corrective actions submitted successfully');
      return res.task;
    } catch (err: any) {
      setError(err.message);
      addToast(`Submission Error: ${err.message}`);
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
      addToast(`Reminder #${res.reminderCount} sent to department SPOC`);
      return res.reminderCount;
    } catch (err: any) {
      setError(err.message);
      addToast(`Reminder Error: ${err.message}`);
      throw err;
    }
  };

  const closeTask = async (taskId: string) => {
    try {
      const res = await api.closeTask(taskId);
      await fetchAll();
      addToast('Task closed successfully');
      return res.task;
    } catch (err: any) {
      setError(err.message);
      addToast(`Error: ${err.message}`);
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
      addToast('Department updated successfully');
    } catch (err: any) {
      setError(err.message);
      addToast(`Error: ${err.message}`);
      throw err;
    }
  };

  const deleteDept = async (ref: string) => {
    try {
      await api.deleteDept(ref);
      setDepts((prev) => prev.filter((d) => d.ref.toLowerCase() !== ref.toLowerCase()));
      addToast('Department deleted');
    } catch (err: any) {
      setError(err.message);
      addToast(`Error: ${err.message}`);
      throw err;
    }
  };

  const importDepts = async (importedDepts: Department[]) => {
    try {
      const res = await api.importDepts(importedDepts);
      await fetchAll();
      addToast(`Imported ${res.added} department(s)`);
      return res;
    } catch (err: any) {
      setError(err.message);
      addToast(`Error: ${err.message}`);
      throw err;
    }
  };

  const saveUser = async (user: Partial<User>) => {
    try {
      await api.saveUser(user);
      await fetchAll();
      addToast('User saved successfully');
    } catch (err: any) {
      setError(err.message);
      addToast(`Error: ${err.message}`);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      await fetchAll();
      addToast('User deleted');
    } catch (err: any) {
      setError(err.message);
      addToast(`Error: ${err.message}`);
      throw err;
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const res = await api.saveSettings(newSettings);
      await fetchAll();
      addToast('Settings saved');
    } catch (err: any) {
      setError(err.message);
      addToast(`Error: ${err.message}`);
      throw err;
    }
  };

  const resetData = async () => {
    try {
      await api.resetData();
      await fetchAll();
      addToast('Data reset to default state');
    } catch (err: any) {
      setError(err.message);
      addToast(`Reset Error: ${err.message}`);
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
