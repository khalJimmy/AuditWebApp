import React, { useState } from 'react';
import { User, AuditTask, AuditReport } from '../types';

interface SpocActionsViewProps {
  user: User;
  tasks: AuditTask[];
  audits: AuditReport[];
  onSubmitResponse: (params: { taskId: string; responses: Record<string, any> }) => Promise<void>;
  onToast: (msg: string) => void;
}

export const SpocActionsView: React.FC<SpocActionsViewProps> = ({
  user,
  tasks,
  audits,
  onSubmitResponse,
  onToast
}) => {
  const myDepts = user.depts || [];

  const myTasks = tasks.filter(t => {
    const a = audits.find(x => x.auditId === t.auditId);
    return a && myDepts.includes(a.ref);
  });

  const [formState, setFormState] = useState<Record<string, Record<string, { imm?: string; rc?: string; capa?: string; mitigation?: string }>>>({});

  const updateField = (taskId: string, findingId: string, field: string, val: string) => {
    setFormState(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [findingId]: {
          ...(prev[taskId]?.[findingId] || {}),
          [field]: val
        }
      }
    }));
  };

  const handleSave = async (taskId: string) => {
    const task = myTasks.find(t => t.taskId === taskId);
    if (!task) return;

    const actionF = task.findings.filter(f => f.type !== 't1');
    const taskResponses: Record<string, any> = {};

    let valid = true;
    actionF.forEach(f => {
      const current = formState[taskId]?.[f.id] || {};
      if (f.type === 't2' || f.type === 't4') {
        const imm = current.imm !== undefined ? current.imm : f.imm || '';
        if (!imm.trim()) {
          valid = false;
        }
        taskResponses[f.id] = {
          imm,
          rc: current.rc !== undefined ? current.rc : f.rc || '',
          capa: current.capa !== undefined ? current.capa : f.capa || ''
        };
      } else if (f.type === 't3') {
        const mitigation = current.mitigation !== undefined ? current.mitigation : f.mitigation || '';
        if (!mitigation.trim()) {
          valid = false;
        }
        taskResponses[f.id] = { mitigation };
      }
    });

    if (!valid) {
      onToast('❌ Please fill all required fields before submitting.');
      return;
    }

    try {
      await onSubmitResponse({ taskId, responses: taskResponses });
      onToast('✅ Corrective actions submitted successfully!');
    } catch (err: any) {
      onToast(`❌ Submission error: ${err.message}`);
    }
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            My <em>Action Items</em>
          </div>
          <div className="ps">
            Departments: {myDepts.join(', ') || 'None assigned'} — {myTasks.length} task(s)
          </div>
        </div>
      </div>

      {myDepts.length === 0 ? (
        <div className="alert ai">No departments assigned to your account. Contact Admin.</div>
      ) : myTasks.length === 0 ? (
        <div className="alert as">✅ No open action items for your department(s).</div>
      ) : (
        myTasks.map(t => {
          const actionF = t.findings.filter(f => f.type !== 't1');

          if (!actionF.length) {
            return (
              <div key={t.taskId} className="card">
                <div className="alert as">
                  Task {t.taskId} — All findings are CI/No Finding. No action needed.
                </div>
              </div>
            );
          }

          if (t.status === 'Closed' || t.status === 'Completed') {
            return (
              <div key={t.taskId} className="card">
                <div className="alert as">
                  ✅ Task {t.taskId} — {t.fn} — {t.status}.
                </div>
              </div>
            );
          }

          return (
            <div key={t.taskId} className="card">
              <div className="ctitle">
                <span className="badge bb">{t.status}</span> &nbsp;
                <strong>{t.taskId}</strong> — {t.fn}
                <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: 'auto' }}>
                  Due: {new Date(t.dueAt).toLocaleString()}
                </span>
              </div>

              {actionF.map(f => {
                const currentVal = formState[t.taskId]?.[f.id] || {};
                const immVal = currentVal.imm !== undefined ? currentVal.imm : f.imm || '';
                const rcVal = currentVal.rc !== undefined ? currentVal.rc : f.rc || '';
                const capaVal = currentVal.capa !== undefined ? currentVal.capa : f.capa || '';
                const mitVal = currentVal.mitigation !== undefined ? currentVal.mitigation : f.mitigation || '';

                return (
                  <div key={f.id} className={`rf ${f.type}`}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span className={`badge ${f.type === 't2' ? 'by' : f.type === 't3' ? 'bo' : 'br'}`}>
                        {f.type === 't2' ? 'Observation' : f.type === 't3' ? `Process Risk (${f.subtype || 'Process'})` : 'Non-Compliance (NC)'}
                      </span>
                      <strong>{f.description}</strong>
                    </div>

                    {(f.type === 't2' || f.type === 't4') && (
                      <div className="fg c3" style={{ marginTop: '8px' }}>
                        <div className="field">
                          <label>Immediate Correction *</label>
                          <textarea
                            rows={2}
                            value={immVal}
                            onChange={e => updateField(t.taskId, f.id, 'imm', e.target.value)}
                            placeholder="Immediate action taken"
                          />
                        </div>
                        <div className="field">
                          <label>Root Cause *</label>
                          <textarea
                            rows={2}
                            value={rcVal}
                            onChange={e => updateField(t.taskId, f.id, 'rc', e.target.value)}
                            placeholder="Root cause analysis"
                          />
                        </div>
                        <div className="field">
                          <label>CAPA *</label>
                          <textarea
                            rows={2}
                            value={capaVal}
                            onChange={e => updateField(t.taskId, f.id, 'capa', e.target.value)}
                            placeholder="Preventive action"
                          />
                        </div>
                      </div>
                    )}

                    {f.type === 't3' && (
                      <div className="field" style={{ marginTop: '8px' }}>
                        <label>Mitigation Plan * ({f.subtype || 'Process risk'})</label>
                        <textarea
                          rows={2}
                          value={mitVal}
                          onChange={e => updateField(t.taskId, f.id, 'mitigation', e.target.value)}
                          placeholder="Risk mitigation plan"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="brow">
                <button className="btn btn-g" onClick={() => handleSave(t.taskId)}>
                  ✅ Submit My Response
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
