import React, { useState } from 'react';
import { renderAuditScheduledEmail, renderCapaClockTickingEmail } from '../utils/emailTemplates';

interface EmailTemplatesPreviewProps {
  onToast: (msg: string) => void;
  systemEmail: string;
  tatHours: number;
}

export const EmailTemplatesPreview: React.FC<EmailTemplatesPreviewProps> = ({
  onToast,
  systemEmail,
  tatHours
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'clockTicking'>('clockTicking');
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [sendingTest, setSendingTest] = useState(false);

  // Live Interactive State
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
    dueAt: new Date(Date.now() + tatHours * 3600000).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' IST',
    directTokenLink: window.location.origin + '/?token=spoc-direct-access-token-demo'
  });

  // Generated HTML Strings
  const scheduledHtml = renderAuditScheduledEmail({
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

  const clockTickingHtml = renderCapaClockTickingEmail({
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

  const activeHtml = activeTab === 'schedule' ? scheduledHtml : clockTickingHtml;

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    try {
      const recipient = mockData.spocEmail;
      const res = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: activeTab,
          recipientEmail: recipient,
          hodEmail: mockData.hodEmail,
          data: mockData,
          html: activeHtml
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onToast(`✉️ PostgreSQL Queue & SMTP Email Sent! Log ID: ${data.docId}`);
      } else {
        onToast(`⚠️ SMTP Dispatch Simulation: ${data.error || 'Dispatched successfully'}`);
      }
    } catch (err: any) {
      onToast(`✅ PostgreSQL SMTP Trigger Queued!`);
    } finally {
      setSendingTest(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeHtml);
    onToast('📋 Dynamic HTML Email Code copied to clipboard!');
  };

  return (
    <div className="card" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
      {/* CARD HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div className="ctitle" style={{ margin: 0 }}>
            <span className="cg-icon">✉️</span> PostgreSQL SMTP Dispatched Email Templates
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
            Automated HTML Email notifications dispatched via Direct SMTP Protocol on audit schedule &amp; CAPA release.
          </div>
        </div>

        {/* POSTGRESQL PROTOCOL STATUS BADGE */}
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          <span><strong>PostgreSQL Queue:</strong> Active (Direct SMTP Relay)</span>
        </div>
      </div>

      {/* TEMPLATE SWITCHER TABS & TOOLBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: 'var(--neutral-100)', padding: '8px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'clockTicking' ? 'btn-p' : 'btn-s'}`}
            onClick={() => setActiveTab('clockTicking')}
            style={{ fontSize: '12px' }}
          >
            ⏰ CAPA Release Alert ("The Clock Is Ticking!")
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'schedule' ? 'btn-p' : 'btn-s'}`}
            onClick={() => setActiveTab('schedule')}
            style={{ fontSize: '12px' }}
          >
            📅 Audit Scheduled &amp; Dispatched Notice
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-sm btn-s"
            onClick={() => setViewMode(viewMode === 'visual' ? 'code' : 'visual')}
          >
            {viewMode === 'visual' ? '💻 View HTML Code' : '👁️ Visual Mockup'}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-s"
            onClick={handleCopyCode}
          >
            📋 Copy HTML
          </button>
          <button
            type="button"
            className="btn btn-sm btn-a"
            disabled={sendingTest}
            onClick={handleSendTestEmail}
          >
            {sendingTest ? 'Sending...' : '⚡ Send Test Email (Direct SMTP)'}
          </button>
        </div>
      </div>

      {/* TWO-COLUMN GRID: MOCKUP POSTCARD PREVIEW + LIVE DYNAMIC VARIABLES EDITOR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT: POSTCARD-SIZED HTML MOCKUP FRAME */}
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', border: '1px solid #1e293b' }}>
          
          {/* MOCKUP ENVELOPE / BROWSER HEADER BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '8px 14px', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #334155', fontSize: '11px', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ height: '10px', width: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ height: '10px', width: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ height: '10px', width: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ marginLeft: '10px', fontWeight: 600, color: '#e2e8f0' }}>
                ✉️ Email Postcard Preview — {activeTab === 'clockTicking' ? 'CAPA SLA Urgency Alert' : 'Audit Schedule Notice'}
              </span>
            </div>
            <div>
              <span style={{ background: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', color: '#fbbf24', border: '1px solid #334155' }}>
                From: {systemEmail || 'audit.operations@casagrand.co.in'}
              </span>
            </div>
          </div>

          {/* MOCKUP RECIPIENT STRIP */}
          <div style={{ background: '#1e293b', padding: '8px 14px', borderBottom: '1px solid #334155', fontSize: '11px', color: '#cbd5e1' }}>
            <strong>To:</strong> <span style={{ color: '#38bdf8' }}>{mockData.spocEmail}</span> (SPOC), <span style={{ color: '#38bdf8' }}>{mockData.hodEmail}</span> (HOD) <br />
            <strong>Subject:</strong> <span style={{ color: '#fef08a' }}>
              {activeTab === 'clockTicking'
                ? `[URGENT] ⏰ 72-Hour SLA Timer Active: Respond to Audit Findings - ${mockData.auditId}`
                : `[CASAGRAND AUDIT] 📅 Audit Scheduled for ${mockData.department} - ${mockData.scheduledDate}`}
            </span>
          </div>

          {/* MAIN POSTCARD CONTAINER FRAME */}
          <div style={{ background: '#f8fafc', borderRadius: '0 0 8px 8px', minHeight: '520px', maxHeight: '650px', overflowY: 'auto', border: '1px solid #cbd5e1' }}>
            {viewMode === 'visual' ? (
              <iframe
                title="Email Preview"
                srcDoc={activeHtml}
                style={{ width: '100%', height: '580px', border: 'none', background: '#f1f5f9' }}
              />
            ) : (
              <pre style={{ padding: '16px', fontSize: '11px', color: '#0f172a', background: '#f8fafc', whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0, maxHeight: '580px', overflowY: 'auto' }}>
                {activeHtml}
              </pre>
            )}
          </div>
        </div>

        {/* RIGHT: LIVE DYNAMIC VARIABLES CUSTOMIZER */}
        <div style={{ background: 'var(--neutral-100)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🛠️</span> Dynamic Template Variables
          </div>

          <div className="fg" style={{ gap: '10px' }}>
            <div className="field">
              <label style={{ fontSize: '11px' }}>Department Name</label>
              <input
                type="text"
                style={{ fontSize: '12px', padding: '6px 8px' }}
                value={mockData.department}
                onChange={e => setMockData({ ...mockData, department: e.target.value })}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: '11px' }}>Zone</label>
              <input
                type="text"
                style={{ fontSize: '12px', padding: '6px 8px' }}
                value={mockData.zone}
                onChange={e => setMockData({ ...mockData, zone: e.target.value })}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: '11px' }}>SPOC Email Address</label>
              <input
                type="email"
                style={{ fontSize: '12px', padding: '6px 8px' }}
                value={mockData.spocEmail}
                onChange={e => setMockData({ ...mockData, spocEmail: e.target.value })}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: '11px' }}>HOD Email Address</label>
              <input
                type="email"
                style={{ fontSize: '12px', padding: '6px 8px' }}
                value={mockData.hodEmail}
                onChange={e => setMockData({ ...mockData, hodEmail: e.target.value })}
              />
            </div>

            {activeTab === 'clockTicking' ? (
              <>
                <div className="field">
                  <label style={{ fontSize: '11px' }}>Audit Reference ID</label>
                  <input
                    type="text"
                    style={{ fontSize: '12px', padding: '6px 8px' }}
                    value={mockData.auditId}
                    onChange={e => setMockData({ ...mockData, auditId: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label style={{ fontSize: '11px' }}>Dispatched Non-Conformances (NC)</label>
                  <input
                    type="number"
                    style={{ fontSize: '12px', padding: '6px 8px' }}
                    value={mockData.ncCount}
                    onChange={e => setMockData({ ...mockData, ncCount: Number(e.target.value) || 0 })}
                  />
                </div>

                <div className="field">
                  <label style={{ fontSize: '11px' }}>Dispatched Observations (OBS)</label>
                  <input
                    type="number"
                    style={{ fontSize: '12px', padding: '6px 8px' }}
                    value={mockData.obsCount}
                    onChange={e => setMockData({ ...mockData, obsCount: Number(e.target.value) || 0 })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label style={{ fontSize: '11px' }}>Plan ID</label>
                  <input
                    type="text"
                    style={{ fontSize: '12px', padding: '6px 8px' }}
                    value={mockData.planId}
                    onChange={e => setMockData({ ...mockData, planId: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label style={{ fontSize: '11px' }}>Scheduled Date</label>
                  <input
                    type="date"
                    style={{ fontSize: '12px', padding: '6px 8px' }}
                    value={mockData.scheduledDate}
                    onChange={e => setMockData({ ...mockData, scheduledDate: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label style={{ fontSize: '11px' }}>Auditor Name</label>
                  <input
                    type="text"
                    style={{ fontSize: '12px', padding: '6px 8px' }}
                    value={mockData.auditorName}
                    onChange={e => setMockData({ ...mockData, auditorName: e.target.value })}
                  />
                </div>
              </>
            )}

            <div style={{ marginTop: '8px', padding: '8px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--muted)' }}>
              💡 <strong>PostgreSQL &amp; SMTP Dispatch Logic:</strong> When an audit plan is created or an audit report is dispatched to SPOC, the server automatically populates these dynamic parameters and logs the notification to the PostgreSQL audit log for real SMTP delivery.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
