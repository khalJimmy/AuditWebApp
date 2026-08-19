import React, { useState, useEffect } from 'react';
import { AuditTask } from '../types';
import { api } from '../services/api';

interface SpocRespondOverlayProps {
  token: string;
  onClose: () => void;
}

export const SpocRespondOverlay: React.FC<SpocRespondOverlayProps> = ({ token, onClose }) => {
  const [task, setTask] = useState<AuditTask | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [formState, setFormState] = useState<Record<string, { imm?: string; rc?: string; capa?: string; mitigation?: string }>>({});

  useEffect(() => {
    async function loadTask() {
      try {
        setLoading(true);
        const fetched = await api.getTaskByToken(token);
        setTask(fetched);
      } catch (err: any) {
        setError(err.message || 'Task not found or link expired.');
      } finally {
        setLoading(false);
      }
    }
    if (token) loadTask();
  }, [token]);

  const updateField = (findingId: string, field: string, val: string) => {
    setFormState(prev => ({
      ...prev,
      [findingId]: {
        ...(prev[findingId] || {}),
        [field]: val
      }
    }));
  };

  const handleSubmit = async () => {
    if (!task) return;
    const actionF = task.findings.filter(f => f.type !== 't1');
    const responses: Record<string, any> = {};

    let valid = true;
    actionF.forEach(f => {
      const cur = formState[f.id] || {};
      if (f.type === 't2' || f.type === 't4') {
        const imm = cur.imm !== undefined ? cur.imm : f.imm || '';
        if (!imm.trim()) valid = false;
        responses[f.id] = {
          imm,
          rc: cur.rc !== undefined ? cur.rc : f.rc || '',
          capa: cur.capa !== undefined ? cur.capa : f.capa || ''
        };
      } else if (f.type === 't3') {
        const mit = cur.mitigation !== undefined ? cur.mitigation : f.mitigation || '';
        if (!mit.trim()) valid = false;
        responses[f.id] = { mitigation: mit };
      }
    });

    if (!valid) {
      alert('Please fill all required fields before submitting.');
      return;
    }

    try {
      await api.submitResponse({ token, responses });
      setSuccess(true);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    }
  };

  return (
    <div id="roverlay" className="on">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="cg-icon">P</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>Audit — Corrective Action Response</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {task ? `Task ${task.taskId} — ${task.fn} — Due: ${new Date(task.dueAt).toLocaleString()}` : ''}
              </div>
            </div>
          </div>
          <button className="btn btn-o btn-sm" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
            Loading audit task details...
          </div>
        ) : error ? (
          <div className="alert ae">{error}</div>
        ) : success ? (
          <div className="alert as" style={{ padding: '24px', fontSize: '14px' }}>
            Thank you. Your corrective actions have been submitted successfully.
            <br />
            The audit team will review the submissions and finalize task closure.
            <br />
            <strong>Task Reference ID: {task?.taskId}</strong>
          </div>
        ) : task ? (
          <div>
            {(() => {
              const due = new Date(task.dueAt).getTime();
              const hoursLeft = Math.round((due - Date.now()) / 3600000);
              return (
                <div className={`alert ${hoursLeft < 0 ? 'ae' : hoursLeft < 12 ? 'aw' : 'ai'}`}>
                  {hoursLeft < 0
                    ? `Overdue by ${Math.abs(hoursLeft)} hours — Immediate submission required.`
                    : `${hoursLeft} hours remaining in corrective action window.`}
                </div>
              );
            })()}

            {task.findings.filter(f => f.type !== 't1').map(f => {
              const cur = formState[f.id] || {};
              return (
                <div key={f.id} className={`rf ${f.type}`} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
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
                          rows={3}
                          value={cur.imm !== undefined ? cur.imm : f.imm || ''}
                          onChange={e => updateField(f.id, 'imm', e.target.value)}
                          placeholder="Action taken immediately"
                        />
                      </div>
                      <div className="field">
                        <label>Root Cause Analysis *</label>
                        <textarea
                          rows={3}
                          value={cur.rc !== undefined ? cur.rc : f.rc || ''}
                          onChange={e => updateField(f.id, 'rc', e.target.value)}
                          placeholder="Why did this issue occur?"
                        />
                      </div>
                      <div className="field">
                        <label>CAPA *</label>
                        <textarea
                          rows={3}
                          value={cur.capa !== undefined ? cur.capa : f.capa || ''}
                          onChange={e => updateField(f.id, 'capa', e.target.value)}
                          placeholder="Preventive action"
                        />
                      </div>
                    </div>
                  )}

                  {f.type === 't3' && (
                    <div className="field" style={{ marginTop: '8px' }}>
                      <label>Mitigation Plan * ({f.subtype || 'Process risk'})</label>
                      <textarea
                        rows={3}
                        value={cur.mitigation !== undefined ? cur.mitigation : f.mitigation || ''}
                        onChange={e => updateField(f.id, 'mitigation', e.target.value)}
                        placeholder="Plan to mitigate the risk"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <div className="brow">
              <button className="btn btn-g" onClick={handleSubmit}>
                Submit Corrective Actions
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
