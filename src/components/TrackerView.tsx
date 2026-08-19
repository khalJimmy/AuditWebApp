import React, { useState } from 'react';
import { AuditTask, AuditReport } from '../types';
import * as XLSX from 'xlsx';
import { Download, AlertTriangle, Clock, Check, Bell, FileEdit, CheckCircle2, Mail, ChevronDown, ChevronUp, History, Info } from 'lucide-react';

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
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleLogs = (taskId: string) => {
    setExpandedLogs(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Automatic 72hr SLA breach is paused per user directive
  const getTatStatus = (t: AuditTask) => {
    if (t.status === 'Closed') return 'Closed';
    if (t.status === 'Completed') return 'Completed';
    if (t.status === 'Notified' || t.status === 'Response Pending') {
      return t.status;
    }
    return 'Response Pending';
  };

  const getHoursLeftText = (dueAt: string) => {
    const due = new Date(dueAt).getTime();
    const diff = due - Date.now();
    const h = Math.round(Math.abs(diff) / 3600000);
    if (diff < 0) {
      return (
        <span style={{ color: '#d97706', fontWeight: 600, fontSize: '11px' }}>
          72h SLA Elapsed ({h}h ago) — Auto Breach Disabled
        </span>
      );
    }
    return (
      <span style={{ color: h < 12 ? '#d97706' : 'var(--green)', fontWeight: 600, fontSize: '11px' }}>
        {h}h remaining in window
      </span>
    );
  };

  const notifiedCount = tasks.filter(t => getTatStatus(t) === 'Notified').length;
  const pendingCount = tasks.filter(t => getTatStatus(t) === 'Response Pending').length;
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
      const emailCount = t.emailSentCount || ((t.reminderCount || 0) + 1);
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
        'Status': getTatStatus(t),
        'Action Emails Sent': emailCount,
        'Reminders Sent': t.reminderCount || 0,
        'Responded At': t.respondedAt ? new Date(t.respondedAt).toLocaleString() : 'Pending'
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'TAT Tracker');
    XLSX.writeFile(wb, `TAT_Tracker_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('Exported TAT tracker to Excel');
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            Action &amp; SLA <em>Tracker</em>
          </div>
          <div className="ps">SPOC Action Notice Monitoring &amp; Communication Logs</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-o btn-sm" onClick={exportExcel} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Download size={13} />
            <span>Export Tracker</span>
          </button>
        </div>
      </div>

      <div className="alert as" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}>
        <Info size={16} />
        <span style={{ fontSize: '12.5px' }}>
          <strong>SLA Notification Policy:</strong> Automatic 72h SLA breach trigger is currently <strong>paused</strong>. SPOC action emails and reminders are logged below.
        </span>
      </div>

      <div className="stats s4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="sc b">
          <div className="sc-n">{notifiedCount}</div>
          <div className="sc-l">Notified SPOCs</div>
        </div>
        <div className="sc o">
          <div className="sc-n">{pendingCount}</div>
          <div className="sc-l">Response Pending</div>
        </div>
        <div className="sc g">
          <div className="sc-n">{completedCount}</div>
          <div className="sc-l">Responses Received</div>
        </div>
        <div className="sc p">
          <div className="sc-n">{closedCount}</div>
          <div className="sc-l">Closed Tasks</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', maxWidth: '200px' }}
          >
            <option value="">All Statuses</option>
            <option>Notified</option>
            <option>Response Pending</option>
            <option>Completed</option>
            <option>Closed</option>
          </select>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Showing {filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'}
          </span>
        </div>

        <div id="tracker-list">
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '22px', color: 'var(--muted)' }}>No tasks found for your scoped departments.</div>
          ) : (
            filteredTasks.map(t => {
              const st = getTatStatus(t);
              const nc = t.findings.filter(f => f.type === 't4').length;
              const obs = t.findings.filter(f => f.type === 't2').length;
              const risk = t.findings.filter(f => f.type === 't3').length;
              const emailCount = t.emailSentCount || ((t.reminderCount || 0) + 1);
              const isExpanded = !!expandedLogs[t.taskId];

              const tatBadgeCls = st === 'Closed' || st === 'Completed' ? 'tok' : st === 'Response Pending' ? 'twarn' : 'tok';

              return (
                <div
                  key={t.taskId}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '9px',
                    padding: '14px',
                    marginBottom: '12px',
                    background: '#fff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`tat ${tatBadgeCls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        {st === 'Response Pending' ? <Clock size={11} /> : <Check size={11} />}
                        <span>{st}</span>
                      </span>
                      <strong>{t.taskId}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>→ {t.dept} ({t.fn})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {st !== 'Closed' && st !== 'Completed' && getHoursLeftText(t.dueAt)}
                      <span className="badge bm" style={{ fontSize: '10px' }}>
                        Dispatched: {new Date(t.dispatchedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', fontSize: '11.5px', flexWrap: 'wrap', alignItems: 'center', marginTop: '6px' }}>
                    <span className="badge br">{nc} NC</span>
                    <span className="badge by">{obs} Obs</span>
                    <span className="badge bo">{risk} Risk</span>
                    <span style={{ color: 'var(--muted)' }}>SPOC: <strong>{t.spocMail || '—'}</strong></span>
                    
                    {/* Action Email Log Count Badge */}
                    <span 
                      className="badge bb" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        cursor: 'pointer',
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        fontWeight: 600
                      }}
                      onClick={() => toggleLogs(t.taskId)}
                      title="Click to view full email communication history"
                    >
                      <Mail size={11} />
                      <span>{emailCount} Email{emailCount === 1 ? '' : 's'} Sent to SPOC</span>
                      {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </span>

                    {t.reminderCount ? <span className="badge bp">{t.reminderCount} reminder(s)</span> : null}
                    {t.respondedAt ? (
                      <span style={{ color: 'var(--green)', fontSize: '11px', fontWeight: 600 }}>
                        ✓ Responded: {new Date(t.respondedAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  {/* Expanded Email History Logs */}
                  {isExpanded && (
                    <div style={{ marginTop: '10px', padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        <History size={13} />
                        <span>SPOC Action Email Delivery History ({emailCount} total sent):</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                        {(t.emailLogs && t.emailLogs.length > 0) ? (
                          t.emailLogs.map((log, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: '#ffffff', borderRadius: '4px', border: '1px solid #edf2f7' }}>
                              <span>
                                <strong>#{idx + 1} {log.type === 'initial_dispatch' ? 'Initial Dispatch' : 'Follow-up Reminder'}:</strong> {log.subject || 'Audit Action Notice'}
                              </span>
                              <span style={{ color: 'var(--muted)' }}>
                                {new Date(log.sentAt).toLocaleString()} • <span style={{ color: log.status.includes('Error') ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>{log.status}</span>
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: '#ffffff', borderRadius: '4px' }}>
                            <span><strong>#1 Initial Dispatch:</strong> Process Audit Findings Notification to {t.spocMail || 'SPOC'}</span>
                            <span style={{ color: 'var(--muted)' }}>{new Date(t.dispatchedAt).toLocaleString()} • <span style={{ color: 'var(--green)', fontWeight: 600 }}>Delivered</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(st === 'Response Pending' || st === 'Notified') && (
                    <div className="brow" style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                      <button className="btn btn-o btn-xs" onClick={() => onSendReminder(t.taskId)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Bell size={12} />
                        <span>Send Action Reminder</span>
                      </button>
                      <button className="btn btn-b btn-xs" onClick={() => onOpenResponseModal(t.auditId)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FileEdit size={12} />
                        <span>Enter Response</span>
                      </button>
                    </div>
                  )}

                  {st === 'Completed' && (
                    <div className="brow" style={{ marginTop: '10px' }}>
                      <button className="btn btn-g btn-xs" onClick={() => onCloseTask(t.taskId)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} />
                        <span>Close Task</span>
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
