import React, { useState } from 'react';
import { Settings, User } from '../types';

interface SettingsViewProps {
  settings: Settings;
  currentUser: User;
  onSaveSettings: (settings: Settings) => Promise<void>;
  onResetData: () => Promise<void>;
  onToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  currentUser,
  onSaveSettings,
  onResetData,
  onToast
}) => {
  const [form, setForm] = useState<Settings>({ ...settings });
  const [activeDoc, setActiveDoc] = useState<'none' | 'hierarchy' | 'sop'>('hierarchy');
  const [docContent, setDocContent] = useState<string>('');
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);

  const fetchDoc = async (type: 'hierarchy' | 'sop') => {
    setActiveDoc(type);
    setLoadingDoc(true);
    try {
      const endpoint = type === 'hierarchy' ? '/api/docs/hierarchy' : '/api/docs/sop';
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed loading document');
      const text = await res.text();
      setDocContent(text);
    } catch (err: any) {
      onToast(`❌ Error loading doc: ${err.message}`);
    } finally {
      setLoadingDoc(false);
    }
  };

  React.useEffect(() => {
    fetchDoc('hierarchy');
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSaveSettings(form);
      onToast('✅ Settings saved successfully');
    } catch (err: any) {
      onToast(`❌ Error saving settings: ${err.message}`);
    }
  };

  const handleReset = async () => {
    if (confirm('⚠️ Are you sure you want to reset all data to default mock data? This cannot be undone.')) {
      try {
        await onResetData();
        onToast('🔄 System data reset to default mock state.');
      } catch (err: any) {
        onToast(`❌ Reset error: ${err.message}`);
      }
    }
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            System <em>Settings</em>
          </div>
          <div className="ps">SLA TAT · Email Notifications · Standard Criteria Configuration</div>
        </div>
        <button className="btn btn-g" onClick={handleSave}>
          💾 Save Settings
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="card">
          <div className="ctitle">
            <span className="cg-icon">S</span> SLA & Audit Parameters
          </div>
          <div className="fg c3">
            <div className="field">
              <label>Corrective Action TAT (Hours)</label>
              <input
                type="number"
                value={form.tatHours}
                onChange={e => setForm({ ...form, tatHours: Number(e.target.value) || 72 })}
              />
              <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                Standard TAT deadline for SPOC response (Default: 72 hrs)
              </span>
            </div>

            <div className="field">
              <label>Default Audit Year</label>
              <input
                type="text"
                value={form.defaultYear}
                onChange={e => setForm({ ...form, defaultYear: e.target.value })}
              />
            </div>

            <div className="field">
              <label>System Email Address</label>
              <input
                type="email"
                value={form.systemEmail}
                onChange={e => setForm({ ...form, systemEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="ctitle">
            <span className="cg-icon">E</span> Email Notification Templates
          </div>
          <div className="field" style={{ marginBottom: '14px' }}>
            <label>Dispatch Notification Template (SPOC & HOD)</label>
            <textarea
              rows={4}
              value={form.dispatchTemplate}
              onChange={e => setForm({ ...form, dispatchTemplate: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Reminder Email Template</label>
            <textarea
              rows={4}
              value={form.reminderTemplate}
              onChange={e => setForm({ ...form, reminderTemplate: e.target.value })}
            />
          </div>
        </div>

        <div className="card">
          <div className="ctitle">
            <span className="cg-icon">M</span> Master Checklist Items Count
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
            The process audit system features 16 mandatory audit checklist sections covering process compliance across Customer Experience, Design, Sales, Engineering, Finance, CRM, Handover, and Facilities.
          </p>
          <div className="brow">
            <span className="badge bb" style={{ padding: '6px 12px', fontSize: '12px' }}>
              ✓ 16 Standard Audit Checklists Active
            </span>
          </div>
        </div>

        {/* GOVERNANCE & ARCHITECTURE FILE VIEWER */}
        <div className="card" style={{ borderLeft: '4px solid var(--navy)' }}>
          <div className="ctitle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><span className="cg-icon">📜</span> System Governance & Architecture Flow Tree</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn btn-xs ${activeDoc === 'hierarchy' ? 'btn-g' : 'btn-o'}`}
                onClick={() => fetchDoc('hierarchy')}
              >
                🌳 1. Connected File Hierarchy Tree
              </button>
              <button
                type="button"
                className={`btn btn-xs ${activeDoc === 'sop' ? 'btn-g' : 'btn-o'}`}
                onClick={() => fetchDoc('sop')}
              >
                📜 2. Operations SOP & Rules Policy
              </button>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
            Official operational rules, 72h SLA TAT policy, scoring formulas, finding classifications, and connected file hierarchy trees (`FILE_HIERARCHY.md` & `AUDIT_POLICY_SOP_RULES.md`).
          </p>

          <div
            style={{
              background: '#0f172a',
              color: '#e2e8f0',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '420px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5',
              border: '1px solid #334155'
            }}
          >
            {loadingDoc ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Loading governance document...</div>
            ) : (
              docContent || 'No document loaded'
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Target Files: {activeDoc === 'hierarchy' ? 'FILE_HIERARCHY.md' : 'AUDIT_POLICY_SOP_RULES.md'}
            </span>
            <button
              type="button"
              className="btn btn-o btn-xs"
              onClick={() => {
                navigator.clipboard.writeText(docContent);
                onToast('📋 Copied document to clipboard');
              }}
            >
              📋 Copy Document Text
            </button>
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <div className="card" style={{ borderColor: '#fca5a5' }}>
            <div className="ctitle" style={{ color: 'var(--red)' }}>
              ⚠️ Danger Zone — System Reset
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
              Resetting will clear all current audits, schedules, and custom tasks, restoring the demo system to its factory default state.
            </p>
            <button type="button" className="btn btn-r" onClick={handleReset}>
              🔄 Reset System Data to Default
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
