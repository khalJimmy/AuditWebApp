import React, { useState } from 'react';
import { renderAuditScheduledEmail, renderCapaClockTickingEmail } from '../utils/emailTemplates';
import { api } from '../services/api';
import {
  Mail,
  Calendar,
  Clock,
  Code,
  Eye,
  Copy,
  Zap,
  Loader2,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface EmailTemplatesPreviewProps {
  onToast: (msg: string) => void;
  systemEmail: string;
  tatHours: number;
  selectedServerId?: string;
}

export const EmailTemplatesPreview: React.FC<EmailTemplatesPreviewProps> = ({
  onToast,
  systemEmail,
  tatHours,
  selectedServerId
}) => {
  const [activeTab, setActiveTab] = useState<'planner' | 'slaReminder'>('slaReminder');
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [testRecipient, setTestRecipient] = useState<string>(systemEmail || 'sfjimelliot@gmail.com');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Mock template parameters to render realistic preview
  const [mockData, setMockData] = useState({
    department: 'Design & Architecture',
    zone: 'Chennai',
    planId: 'PLN-2026-004',
    auditId: 'AUD-CHEN-2026-001',
    scheduledDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    auditorName: 'A. R. Kumar (Lead Auditor)',
    spocName: 'K. Senthil',
    spocEmail: 'spoc.design@casagrand.co.in',
    hodEmail: 'hod.design@casagrand.co.in',
    ncCount: 2,
    obsCount: 3,
    dispatchedAt: new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' IST',
    dueAt: new Date(Date.now() + (tatHours || 72) * 3600000).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' IST',
    directTokenLink: window.location.origin + '/?token=spoc-direct-access-token-demo'
  });

  // Render HTML strings using standard template generators
  const plannerHtml = renderAuditScheduledEmail({
    planId: mockData.planId,
    department: mockData.department,
    zone: mockData.zone,
    scheduledDate: mockData.scheduledDate,
    auditorName: mockData.auditorName,
    spocName: mockData.spocName,
    spocEmail: mockData.spocEmail,
    hodEmail: mockData.hodEmail,
    portalUrl: window.location.origin
  });

  const slaReminderHtml = renderCapaClockTickingEmail({
    auditId: mockData.auditId,
    department: mockData.department,
    zone: mockData.zone,
    dispatchedAt: mockData.dispatchedAt,
    dueAt: mockData.dueAt,
    tatHours: tatHours || 72,
    ncCount: mockData.ncCount,
    obsCount: mockData.obsCount,
    spocEmail: mockData.spocEmail,
    hodEmail: mockData.hodEmail,
    directTokenLink: mockData.directTokenLink
  });

  const activeHtml = activeTab === 'planner' ? plannerHtml : slaReminderHtml;
  const activeSubject = activeTab === 'planner'
    ? `[CASAGRAND AUDIT] Audit Scheduled for ${mockData.department} - ${mockData.scheduledDate}`
    : `[URGENT] 72-Hour SLA Timer Active: Respond to Audit Findings - ${mockData.auditId}`;

  const handleSendTest = async () => {
    if (!testRecipient) {
      onToast('Please provide a test recipient email address.');
      return;
    }

    setIsSending(true);
    try {
      const res = await api.sendTestEmail({
        templateType: activeTab === 'planner' ? 'schedule' : 'clockTicking',
        recipientEmail: testRecipient,
        hodEmail: mockData.hodEmail,
        data: mockData,
        html: activeHtml,
        serverId: selectedServerId
      });

      if (res.success) {
        if (res.realEmailDelivered) {
          onToast(`Live Email sent via SMTP to ${testRecipient}!`);
        } else {
          onToast(`Email dispatched to queue (${res.serverName || 'SMTP Relay'})`);
        }
      } else {
        onToast(`Dispatch warning: Delivery failed`);
      }
    } catch (err: any) {
      onToast(`Failed to send test email: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(activeHtml);
    onToast('Template HTML copied to clipboard.');
  };

  return (
    <div className="card">
      <div className="ctitle">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={15} style={{ color: 'var(--brand)' }} />
          <span>Email Notification Templates (Planner &amp; SLA Reminder)</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn btn-xs ${activeTab === 'planner' ? 'btn-r' : 'btn-o'}`}
            onClick={() => setActiveTab('planner')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Calendar size={12} />
            <span>Planner: Audit Scheduled</span>
          </button>
          <button
            type="button"
            className={`btn btn-xs ${activeTab === 'slaReminder' ? 'btn-r' : 'btn-o'}`}
            onClick={() => setActiveTab('slaReminder')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Clock size={12} />
            <span>SLA Reminder: CAPA 72h Clock</span>
          </button>
        </div>
      </div>

      <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '14px' }}>
        Official HTML templates dispatched automatically via the configured SMTP relay when an audit is planned in Planner or when findings are dispatched with the 72-hour SLA response clock.
      </p>

      {/* TEMPLATE INFO & TEST DISPATCH BAR */}
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
              {activeTab === 'planner' ? 'Trigger: Audit Plan Created in Planner' : 'Trigger: Audit Findings Dispatched to SPOC'}
            </span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
              Subject: {activeSubject}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-o btn-xs"
              onClick={() => setViewMode(viewMode === 'visual' ? 'code' : 'visual')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {viewMode === 'visual' ? <Code size={12} /> : <Eye size={12} />}
              <span>{viewMode === 'visual' ? 'View Code' : 'View Visual'}</span>
            </button>
            <button
              type="button"
              className="btn btn-o btn-xs"
              onClick={handleCopyHtml}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Copy size={12} />
              <span>Copy HTML</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '10px' }}>
          <input
            type="email"
            value={testRecipient}
            onChange={e => setTestRecipient(e.target.value)}
            placeholder="test.email@casagrand.co.in"
            style={{ flex: '1 1 220px', padding: '6px 10px', fontSize: '12px' }}
          />
          <button
            type="button"
            className="btn btn-g btn-sm"
            onClick={handleSendTest}
            disabled={isSending}
            style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            {isSending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Zap size={13} />
                <span>Send Test {activeTab === 'planner' ? 'Planner' : 'SLA Reminder'} Email</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* TWO COLUMN PREVIEW + VARIABLE CUSTOMIZER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '16px', alignItems: 'start' }}>
        {/* PREVIEW FRAME */}
        <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', background: '#ffffff', minHeight: '520px', boxShadow: 'var(--sh1)' }}>
          <div style={{ background: 'var(--surface2)', padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--muted)' }}>
            <span>
              <strong style={{ color: 'var(--ink)' }}>To:</strong> {mockData.spocEmail} &nbsp;|&nbsp; <strong style={{ color: 'var(--ink)' }}>CC:</strong> {mockData.hodEmail}
            </span>
            <span className="badge bb" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {activeTab === 'planner' ? 'Schedule Notification' : 'CAPA Action Notice'}
            </span>
          </div>

          {viewMode === 'visual' ? (
            <iframe
              title="Email Template Preview"
              srcDoc={activeHtml}
              style={{ width: '100%', height: '540px', border: 'none', background: '#f8fafc', display: 'block' }}
            />
          ) : (
            <pre style={{ padding: '14px', fontSize: '11px', color: 'var(--ink)', background: 'var(--surface2)', whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace', margin: 0, maxHeight: '540px', overflowY: 'auto' }}>
              {activeHtml}
            </pre>
          )}
        </div>

        {/* SAMPLE DATA CONTROLS */}
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '10px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sliders size={13} style={{ color: 'var(--brand)' }} />
            <span>Live Template Variables</span>
          </div>

          <div className="fg" style={{ gap: '8px' }}>
            <div className="field">
              <label style={{ fontSize: '10.5px' }}>Department</label>
              <input
                type="text"
                style={{ fontSize: '12px', padding: '5px 8px' }}
                value={mockData.department}
                onChange={e => setMockData({ ...mockData, department: e.target.value })}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: '10.5px' }}>Zone</label>
              <input
                type="text"
                style={{ fontSize: '12px', padding: '5px 8px' }}
                value={mockData.zone}
                onChange={e => setMockData({ ...mockData, zone: e.target.value })}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: '10.5px' }}>SPOC Email</label>
              <input
                type="email"
                style={{ fontSize: '12px', padding: '5px 8px' }}
                value={mockData.spocEmail}
                onChange={e => setMockData({ ...mockData, spocEmail: e.target.value })}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: '10.5px' }}>HOD Email</label>
              <input
                type="email"
                style={{ fontSize: '12px', padding: '5px 8px' }}
                value={mockData.hodEmail}
                onChange={e => setMockData({ ...mockData, hodEmail: e.target.value })}
              />
            </div>

            {activeTab === 'planner' ? (
              <>
                <div className="field">
                  <label style={{ fontSize: '10.5px' }}>Plan ID</label>
                  <input
                    type="text"
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                    value={mockData.planId}
                    onChange={e => setMockData({ ...mockData, planId: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label style={{ fontSize: '10.5px' }}>Target Scheduled Date</label>
                  <input
                    type="date"
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                    value={mockData.scheduledDate}
                    onChange={e => setMockData({ ...mockData, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label style={{ fontSize: '10.5px' }}>Lead Auditor</label>
                  <input
                    type="text"
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                    value={mockData.auditorName}
                    onChange={e => setMockData({ ...mockData, auditorName: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label style={{ fontSize: '10.5px' }}>Audit Reference ID</label>
                  <input
                    type="text"
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                    value={mockData.auditId}
                    onChange={e => setMockData({ ...mockData, auditId: e.target.value })}
                  />
                </div>
                <div className="fg c2" style={{ gap: '8px' }}>
                  <div className="field">
                    <label style={{ fontSize: '10.5px' }}>NC Count</label>
                    <input
                      type="number"
                      style={{ fontSize: '12px', padding: '5px 8px' }}
                      value={mockData.ncCount}
                      onChange={e => setMockData({ ...mockData, ncCount: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: '10.5px' }}>OBS Count</label>
                    <input
                      type="number"
                      style={{ fontSize: '12px', padding: '5px 8px' }}
                      value={mockData.obsCount}
                      onChange={e => setMockData({ ...mockData, obsCount: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
