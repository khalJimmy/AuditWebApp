import React, { useState, useEffect } from 'react';
import { Settings, User } from '../types';
import { SparkUsageMetrics } from './SparkUsageMetrics';
import { EmailTemplatesPreview } from './EmailTemplatesPreview';
import { SmtpSettingsCard } from './SmtpSettingsCard';
import {
  Save,
  Sliders,
  FileText,
  ClipboardList,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

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
  const [selectedSmtpId, setSelectedSmtpId] = useState<string>(
    settings.activeSmtpServerId || (settings.smtpServers && settings.smtpServers[0]?.id) || 'smtp_gmail_default'
  );

  useEffect(() => {
    setForm({ ...settings });
    if (settings.activeSmtpServerId) {
      setSelectedSmtpId(settings.activeSmtpServerId);
    }
  }, [settings]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const payload: Settings = {
        ...form,
        activeSmtpServerId: selectedSmtpId
      };
      await onSaveSettings(payload);
      onToast('Settings saved successfully');
    } catch (err: any) {
      onToast(`Error saving settings: ${err.message}`);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all data to default mock data? This cannot be undone.')) {
      try {
        await onResetData();
        onToast('System data reset to default mock state.');
      } catch (err: any) {
        onToast(`Reset error: ${err.message}`);
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
          <div className="ps">SLA TAT · Outgoing SMTP Mail Servers · Planner &amp; SLA Reminder Templates · Metrics</div>
        </div>
        <button type="button" className="btn btn-g" onClick={() => handleSave()} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Save size={13} />
          <span>Save Settings</span>
        </button>
      </div>

      {/* 1. OUTGOING SMTP RELAY SERVERS CARD (SAVE & LIST) */}
      <SmtpSettingsCard
        settings={settings}
        onUpdateSettings={onSaveSettings}
        onToast={onToast}
        currentUserEmail={currentUser.email}
        selectedServerId={selectedSmtpId}
        onSelectServerId={setSelectedSmtpId}
      />

      {/* 2. SLA & AUDIT PARAMETERS */}
      <form onSubmit={handleSave}>
        <div className="card">
          <div className="ctitle">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={15} style={{ color: 'var(--brand)' }} />
              <span>SLA &amp; Audit Parameters</span>
            </div>
          </div>
          <div className="fg c3">
            <div className="field">
              <label>Corrective Action TAT (Hours)</label>
              <input
                type="number"
                value={form.tatHours}
                onChange={e => setForm({ ...form, tatHours: Number(e.target.value) || 72 })}
              />
              <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
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
              <label>System Notification Email Address</label>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={15} style={{ color: 'var(--brand)' }} />
              <span>Email Notification Subject Templates</span>
            </div>
          </div>
          <div className="fg c2" style={{ marginBottom: '10px' }}>
            <div className="field">
              <label>Dispatch Notification Header Subject (SPOC &amp; HOD)</label>
              <textarea
                rows={2}
                value={form.dispatchTemplate}
                onChange={e => setForm({ ...form, dispatchTemplate: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Reminder Email SLA Header Subject</label>
              <textarea
                rows={2}
                value={form.reminderTemplate}
                onChange={e => setForm({ ...form, reminderTemplate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 3. EMAIL TEMPLATES FOR PLANNER & SLA REMINDER (PREVIEW & SEND TEST) */}
        <EmailTemplatesPreview
          onToast={onToast}
          systemEmail={form.systemEmail}
          tatHours={form.tatHours}
          selectedServerId={selectedSmtpId}
        />

        {/* 4. MASTER AUDIT CHECKLIST COUNT */}
        <div className="card">
          <div className="ctitle">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={15} style={{ color: 'var(--brand)' }} />
              <span>Master Checklist Sections</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
            The process audit system features 16 mandatory audit checklist sections covering process compliance across Customer Experience, Design, Sales, Engineering, Finance, CRM, Handover, and Facilities.
          </p>
          <div className="brow">
            <span className="badge bb" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> 16 Standard Audit Checklists Active
            </span>
          </div>
        </div>

        {/* 5. METRICS */}
        <SparkUsageMetrics onToast={onToast} />

        {/* 6. DANGER ZONE */}
        {currentUser.role === 'admin' && (
          <div className="card" style={{ borderColor: '#fca5a5' }}>
            <div className="ctitle" style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={15} />
              <span>Danger Zone — System Reset</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
              Resetting will clear all current audits, schedules, and custom tasks, restoring the demo system to its factory default state.
            </p>
            <button type="button" className="btn btn-r" onClick={handleReset} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <RotateCcw size={13} />
              <span>Reset System Data to Default</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
