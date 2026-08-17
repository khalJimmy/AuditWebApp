import React from 'react';
import { AuditReport, AuditTask } from '../types';
import { Send, FileEdit, CheckCircle2, Bell } from 'lucide-react';

interface DispatchViewProps {
  audits: AuditReport[];
  tasks: AuditTask[];
  depts?: any[];
  onOpenDispatchModal: (auditId: string) => void;
  onOpenResponseModal: (auditId: string) => void;
  onCloseTask?: (taskId: string) => void;
  onSendReminder?: (taskId: string) => void;
  onToast?: (msg: string) => void;
}

export const DispatchView: React.FC<DispatchViewProps> = ({
  audits,
  tasks,
  depts,
  onOpenDispatchModal,
  onOpenResponseModal,
  onCloseTask,
  onSendReminder,
  onToast
}) => {
  const getTatStatus = (task?: AuditTask) => {
    if (!task) return 'Not Dispatched';
    if (task.status === 'Closed') return 'Closed';
    if (task.status === 'Completed') return 'Completed';
    const now = Date.now();
    const due = new Date(task.dueAt).getTime();
    if (now > due) return 'Delayed';
    if (now > due - 12 * 3600 * 1000) return 'Response Pending';
    return 'Notified';
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            Dispatch <em>Centre</em>
          </div>
          <div className="ps">Send audit reports · Start 72-hour corrective action clock</div>
        </div>
      </div>

      <div className="alert ai">
        Select a submitted audit → Click Dispatch → System generates email notification and starts TAT clock via REST API.
      </div>

      <div className="card">
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Date</th>
                <th>Dept / Function</th>
                <th>Zone</th>
                <th>Auditor</th>
                <th>Findings</th>
                <th>Compliance%</th>
                <th>Dispatch Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '22px', color: 'var(--muted)' }}>
                    No submitted audits yet.
                  </td>
                </tr>
              ) : (
                audits.map(a => {
                  const task = tasks.find(t => t.auditId === a.auditId);
                  const dispatched = !!task;
                  const st = getTatStatus(task);
                  const stBadge = dispatched
                    ? st === 'Closed' || st === 'Completed'
                      ? 'bg'
                      : st === 'Delayed'
                      ? 'br'
                      : st === 'Notified'
                      ? 'bb'
                      : 'by'
                    : 'bm';

                  return (
                    <tr key={a.auditId}>
                      <td>
                        <span className="badge bk" style={{ fontSize: '10px' }}>
                          {a.auditId}
                        </span>
                      </td>
                      <td>{a.auditDate}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{a.dept}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{a.fn}</div>
                      </td>
                      <td>{a.zone || '—'}</td>
                      <td>{a.auditor}</td>
                      <td>
                        <span className="badge br">{a.ncCount} NC</span>{' '}
                        <span className="badge by">{a.obsCount} Obs</span>{' '}
                        <span className="badge bo">{a.riskCount} Risk</span>
                      </td>
                      <td>{a.compliancePct}</td>
                      <td>
                        <span className={`badge ${stBadge}`}>{st}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {!dispatched && (
                          <button
                            className="btn btn-r btn-xs"
                            onClick={() => onOpenDispatchModal(a.auditId)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Send size={11} />
                            <span>Dispatch</span>
                          </button>
                        )}
                        {dispatched && st !== 'Closed' && (
                          <button
                            className="btn btn-b btn-xs"
                            style={{ marginLeft: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            onClick={() => onOpenResponseModal(a.auditId)}
                          >
                            <FileEdit size={11} />
                            <span>Enter Response</span>
                          </button>
                        )}
                        {dispatched && (st === 'Completed' || st === 'Response Pending') && (
                          <button
                            className="btn btn-g btn-xs"
                            style={{ marginLeft: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            onClick={() => onCloseTask && onCloseTask(task!.taskId)}
                          >
                            <CheckCircle2 size={11} />
                            <span>Close</span>
                          </button>
                        )}
                        {dispatched && st === 'Delayed' && (
                          <button
                            className="btn btn-o btn-xs"
                            style={{ marginLeft: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            onClick={() => onSendReminder && onSendReminder(task!.taskId)}
                          >
                            <Bell size={11} />
                            <span>Remind</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
