import React, { useState } from 'react';
import { AuditTask, AuditReport } from '../types';
import * as XLSX from 'xlsx';

interface TrackerViewProps {
  tasks: AuditTask[];
  audits: AuditReport[];
  onOpenResponseModal: (auditId: string) => void;
  onCloseTask: (taskId: string) => void;
  onSendReminder: (taskId: string) => void;
  onToast: (msg: string) => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  tasks,
  audits,
  onOpenResponseModal,
  onCloseTask,
  onSendReminder,
  onToast
}) => {
  const [filterStatus, setFilterStatus] = useState('');

  const getTatStatus = (t: AuditTask) => {
    if (t.status === 'Closed') return 'Closed';
    if (t.status === 'Completed') return 'Completed';
    const now = Date.now();
    const due = new Date(t.dueAt).getTime();
    if (now > due) return 'Delayed';
    if (now > due - 12 * 3600 * 1000) return 'Response Pending';
    return 'Notified';
  };

  const getHoursLeftText = (dueAt: string) => {
    const due = new Date(dueAt).getTime();
    const diff = due - Date.now();
    if (diff < 0) {
      return <span style={{ color: 'var(--red)', fontWeight: 700 }}>Overdue {Math.abs(Math.round(diff / 3600000))}h</span>;
    }
    const h = Math.round(diff / 3600000);
    return <span style={{ color: h < 12 ? '#d97706' : 'var(--green)' }}>{h}h left</span>;
  };

  const notifiedCount = tasks.filter(t => getTatStatus(t) === 'Notified').length;
  const pendingCount = tasks.filter(t => getTatStatus(t) === 'Response Pending').length;
  const delayedCount = tasks.filter(t => getTatStatus(t) === 'Delayed').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const closedCount = tasks.filter(t => t.status === 'Closed').length;

  let filteredTasks = tasks;
  if (filterStatus) {
    filteredTasks = filteredTasks.filter(t => getTatStatus(t) === filterStatus || t.status === filterStatus);
  }

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = tasks.map(t => {
      const a = audits.find(x => x.auditId === t.auditId);
      return {
        'Task ID': t.taskId,
        'Audit ID': t.auditId,
        'Audit Date': a?.auditDate || '—',
        'Auditor': a?.auditor || '—',
        'Zone': a?.zone || '—',
        'Dept': t.dept,
        'Function': t.fn,
        'SPOC Email': t.spocMail || '—',
        'HOD Email': t.hodMail || '—',
        'Dispatched At': new Date(t.dispatchedAt).toLocaleString(),
        'Due At (72hr)': new Date(t.dueAt).toLocaleString(),
        'TAT Status': getTatStatus(t),
        'Reminders Sent': t.reminderCount || 0,
        'Responded At': t.respondedAt ? new Date(t.respondedAt).toLocaleString() : 'Pending'
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'TAT Tracker');
    XLSX.writeFile(wb, `TAT_Tracker_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('✅ Exported TAT tracker to Excel');
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            TAT <em>Tracker</em>
          </div>
          <div className="ps">72-hour corrective action deadline monitor</div>
        </div>
        <button className="btn btn-o btn-sm" onClick={exportExcel}>
          ⬇ Export
        </button>
      </div>

      <div className="stats s5">
        <div className="sc b">
          <div className="sc-n">{notifiedCount}</div>
          <div className="sc-l">Notified</div>
        </div>
        <div className="sc o">
          <div className="sc-n">{pendingCount}</div>
          <div className="sc-l">Pending</div>
        </div>
        <div className="sc r">
          <div className="sc-n">{delayedCount}</div>
          <div className="sc-l">Overdue</div>
        </div>
        <div className="sc g">
          <div className="sc-n">{completedCount}</div>
          <div className="sc-l">Completed</div>
        </div>
        <div className="sc p">
          <div className="sc-n">{closedCount}</div>
          <div className="sc-l">Closed</div>
        </div>
      </div>

      <div className="card">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px', maxWidth: '200px' }}
        >
          <option value="">All Statuses</option>
          <option>Notified</option>
          <option>Response Pending</option>
          <option>Delayed</option>
          <option>Completed</option>
          <option>Closed</option>
        </select>

        <div id="tracker-list">
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '22px', color: 'var(--muted)' }}>No tasks found.</div>
          ) : (
            filteredTasks.map(t => {
              const st = getTatStatus(t);
              const nc = t.findings.filter(f => f.type === 't4').length;
              const obs = t.findings.filter(f => f.type === 't2').length;
              const risk = t.findings.filter(f => f.type === 't3').length;

              const tatBadgeCls = st === 'Closed' || st === 'Completed' ? 'tok' : st === 'Delayed' ? 'tover' : st === 'Response Pending' ? 'twarn' : 'tok';

              return (
                <div
                  key={t.taskId}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '9px',
                    padding: '13px',
                    marginBottom: '9px',
                    background: '#fff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`tat ${tatBadgeCls}`}>
                        {st === 'Delayed' ? '⚠' : st === 'Response Pending' ? '⏳' : '✓'} {st}
                      </span>
                      <strong>{t.taskId}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>→ {t.fn}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {st !== 'Closed' && st !== 'Completed' && getHoursLeftText(t.dueAt)}
                      <span className="badge bm" style={{ fontSize: '10px' }}>
                        {new Date(t.dispatchedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge br">{nc} Non-Compliance</span>
                    <span className="badge by">{obs} Observation</span>
                    <span className="badge bo">{risk} Process Risk</span>
                    <span style={{ color: 'var(--muted)' }}>SPOC: {t.spocMail || '—'}</span>
                    <span style={{ color: 'var(--muted)' }}>Due: {new Date(t.dueAt).toLocaleString()}</span>
                    {t.reminderCount ? <span className="badge bp">{t.reminderCount} reminder(s) sent</span> : null}
                    {t.respondedAt ? (
                      <span style={{ color: 'var(--green)', fontSize: '11px' }}>
                        Responded: {new Date(t.respondedAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  {(st === 'Delayed' || st === 'Response Pending' || st === 'Notified') && (
                    <div className="brow" style={{ marginTop: '8px' }}>
                      <button className="btn btn-o btn-xs" onClick={() => onSendReminder(t.taskId)}>
                        🔔 Send Reminder
                      </button>
                      <button className="btn btn-b btn-xs" onClick={() => onOpenResponseModal(t.auditId)}>
                        📝 Enter Response
                      </button>
                    </div>
                  )}

                  {st === 'Completed' && (
                    <div className="brow" style={{ marginTop: '8px' }}>
                      <button className="btn btn-g btn-xs" onClick={() => onCloseTask(t.taskId)}>
                        ✅ Close Task
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
