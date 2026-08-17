import React, { useState } from 'react';
import { Settings, SmtpServerConfig } from '../types';
import { api } from '../services/api';
import {
  Mail,
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Loader2,
  Star
} from 'lucide-react';

interface SmtpSettingsCardProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => Promise<void>;
  onToast: (msg: string) => void;
  currentUserEmail?: string;
  selectedServerId: string;
  onSelectServerId: (id: string) => void;
}

export const SmtpSettingsCard: React.FC<SmtpSettingsCardProps> = ({
  settings,
  onUpdateSettings,
  onToast,
  currentUserEmail,
  selectedServerId,
  onSelectServerId
}) => {
  const initialServers: SmtpServerConfig[] = settings.smtpServers && settings.smtpServers.length > 0
    ? settings.smtpServers
    : [
        {
          id: 'smtp_gmail_default',
          name: 'Gmail SMTP (Google Workspace / @gmail.com)',
          provider: 'gmail',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          user: currentUserEmail || settings.systemEmail || 'sfjimelliot@gmail.com',
          pass: '',
          fromName: 'Casagrand Quality & Process Audit',
          fromEmail: currentUserEmail || settings.systemEmail || 'sfjimelliot@gmail.com',
          isDefault: true,
          status: 'untested'
        }
      ];

  const [servers, setServers] = useState<SmtpServerConfig[]>(initialServers);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showAppPassHelp, setShowAppPassHelp] = useState<boolean>(false);

  // Edit / Add Form Buffer
  const [editForm, setEditForm] = useState<SmtpServerConfig>({
    id: 'smtp_new',
    name: 'Gmail SMTP Relay',
    provider: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: currentUserEmail || settings.systemEmail || 'sfjimelliot@gmail.com',
    pass: '',
    fromName: 'Casagrand Quality & Process Audit',
    fromEmail: currentUserEmail || settings.systemEmail || 'sfjimelliot@gmail.com',
    isDefault: false,
    status: 'untested'
  });

  // Test Connection State
  const [testRecipient, setTestRecipient] = useState<string>(currentUserEmail || settings.systemEmail || 'sfjimelliot@gmail.com');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; verifiedAt?: string } | null>(null);

  const activeServer = servers.find(s => s.id === selectedServerId) || servers.find(s => s.isDefault) || servers[0];

  const handleStartEdit = (server: SmtpServerConfig) => {
    setIsAddingNew(false);
    setEditingServerId(server.id);
    setEditForm({ ...server });
  };

  const handleStartAdd = () => {
    const newId = `smtp_${Date.now()}`;
    setEditingServerId(newId);
    setIsAddingNew(true);
    setEditForm({
      id: newId,
      name: `Outgoing Relay #${servers.length + 1}`,
      provider: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: currentUserEmail || settings.systemEmail || '',
      pass: '',
      fromName: 'Casagrand Quality & Process Audit',
      fromEmail: currentUserEmail || settings.systemEmail || '',
      isDefault: servers.length === 0,
      status: 'untested'
    });
  };

  const handleApplyPreset = (preset: 'gmail' | 'office365' | 'custom') => {
    if (preset === 'gmail') {
      setEditForm(prev => ({
        ...prev,
        provider: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        name: prev.name.includes('Relay') ? 'Gmail / Google Workspace Relay' : prev.name
      }));
    } else if (preset === 'office365') {
      setEditForm(prev => ({
        ...prev,
        provider: 'office365',
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        name: 'Microsoft Office 365 Exchange'
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        provider: 'custom',
        host: 'smtp.yourdomain.com',
        port: 587,
        secure: false
      }));
    }
  };

  const handleSaveServer = async () => {
    if (!editForm.name.trim()) {
      alert('Please provide a server display name.');
      return;
    }
    if (!editForm.user.trim()) {
      alert('Please provide the account email or username.');
      return;
    }

    let updatedList: SmtpServerConfig[];
    if (isAddingNew) {
      updatedList = [...servers, editForm];
    } else {
      updatedList = servers.map(s => s.id === editForm.id ? editForm : s);
    }

    if (editForm.isDefault) {
      updatedList = updatedList.map(s => ({
        ...s,
        isDefault: s.id === editForm.id
      }));
    }

    setServers(updatedList);
    setEditingServerId(null);
    setIsAddingNew(false);

    try {
      const newSettings: Settings = {
        ...settings,
        smtpServers: updatedList,
        activeSmtpServerId: editForm.isDefault ? editForm.id : selectedServerId
      };
      await onUpdateSettings(newSettings);
      onToast('✅ SMTP server configuration saved.');
    } catch (err: any) {
      onToast(`❌ Error saving SMTP server: ${err.message}`);
    }
  };

  const handleSetDefault = async (id: string) => {
    const updatedList = servers.map(s => ({
      ...s,
      isDefault: s.id === id
    }));
    setServers(updatedList);
    onSelectServerId(id);

    try {
      const newSettings: Settings = {
        ...settings,
        smtpServers: updatedList,
        activeSmtpServerId: id
      };
      await onUpdateSettings(newSettings);
      onToast(`Default SMTP Server updated.`);
    } catch (err: any) {
      onToast(`Error setting default: ${err.message}`);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (servers.length <= 1) {
      alert('You must retain at least one configured SMTP server.');
      return;
    }
    const target = servers.find(s => s.id === id);
    if (!confirm(`Delete SMTP configuration "${target?.name || id}"?`)) return;

    const updatedList = servers.filter(s => s.id !== id);
    if (target?.isDefault && updatedList.length > 0) {
      updatedList[0].isDefault = true;
    }
    setServers(updatedList);
    if (selectedServerId === id) {
      onSelectServerId(updatedList[0].id);
    }

    try {
      const newSettings: Settings = {
        ...settings,
        smtpServers: updatedList,
        activeSmtpServerId: updatedList[0].id
      };
      await onUpdateSettings(newSettings);
      onToast('SMTP server removed.');
    } catch (err: any) {
      onToast(`Error removing server: ${err.message}`);
    }
  };

  const handleTestConnection = async () => {
    if (!activeServer) {
      onToast('No active SMTP server selected.');
      return;
    }
    if (!activeServer.user || !activeServer.pass) {
      onToast('Please enter an Account Email and Google 16-digit App Password first.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await api.testSmtpConnection(activeServer, testRecipient);
      if (res.success) {
        setTestResult({
          success: true,
          message: res.message || 'SMTP verified and test email delivered!',
          verifiedAt: res.verifiedAt || new Date().toISOString()
        });
        const updatedList = servers.map(s => s.id === activeServer.id ? { ...s, status: 'verified' as const, lastTestedAt: new Date().toISOString() } : s);
        setServers(updatedList);
        onToast(`Live SMTP verified! Test email sent to ${testRecipient}`);
      } else {
        setTestResult({
          success: false,
          message: 'Connection failed.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Authentication error. Verify App Password.'
      });
      const updatedList = servers.map(s => s.id === activeServer.id ? { ...s, status: 'failed' as const } : s);
      setServers(updatedList);
      onToast(`SMTP verification failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="card">
      <div className="ctitle">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={15} style={{ color: 'var(--brand)' }} />
          <span>Outgoing Mail Servers (SMTP Relay)</span>
        </div>
        {!editingServerId && (
          <button type="button" className="btn btn-o btn-xs" onClick={handleStartAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={12} />
            <span>Add SMTP Server</span>
          </button>
        )}
      </div>

      <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '14px' }}>
        Configure and select the outgoing SMTP mail relay (Gmail / Google Workspace, Office 365, or Custom SMTP) used for delivering Planner audit assignments, 72-hour SLA alerts, and attached findings reports to SPOCs and HODs.
      </p>

      {/* SAVED SERVERS TABLE */}
      <div className="tbl-wrap" style={{ marginBottom: '16px' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>Select</th>
              <th>Server Label</th>
              <th>Host : Port</th>
              <th>Account Email (Sender)</th>
              <th>Status</th>
              <th>Default</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {servers.map(server => {
              const isSelected = server.id === selectedServerId;
              const hasPassword = Boolean(server.pass && server.pass.trim());
              return (
                <tr key={server.id} style={{ background: isSelected ? 'var(--surface2)' : undefined }}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="radio"
                      name="selected_smtp"
                      checked={isSelected}
                      onChange={() => onSelectServerId(server.id)}
                      title="Select this server for testing and outbound dispatches"
                    />
                  </td>
                  <td>
                    <strong>{server.name}</strong>
                    {server.provider === 'gmail' && (
                      <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Gmail Relay</span>
                    )}
                  </td>
                  <td>
                    <code>{server.host}:{server.port}</code>
                    {server.secure && <span style={{ fontSize: '10px', color: 'var(--blue)', marginLeft: '4px' }}>[SSL]</span>}
                  </td>
                  <td>
                    {server.user || <span style={{ color: 'var(--muted)' }}>—</span>}
                    {!hasPassword && (
                      <span className="badge by" style={{ marginLeft: '6px', fontSize: '9.5px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <AlertTriangle size={10} /> App Password Required
                      </span>
                    )}
                  </td>
                  <td>
                    {server.status === 'verified' ? (
                      <span className="badge bg" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    ) : server.status === 'failed' ? (
                      <span className="badge br" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <XCircle size={10} /> Failed
                      </span>
                    ) : (
                      <span className="badge by" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <AlertTriangle size={10} /> Untested
                      </span>
                    )}
                  </td>
                  <td>
                    {server.isDefault ? (
                      <span className="badge bb" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={10} /> Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-o btn-xs"
                        style={{ fontSize: '10.5px', padding: '2px 6px' }}
                        onClick={() => handleSetDefault(server.id)}
                      >
                        Set Default
                      </button>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-o btn-xs"
                        onClick={() => handleStartEdit(server)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Edit3 size={11} /> Edit
                      </button>
                      {servers.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-o btn-xs"
                          style={{ color: 'var(--red)', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center' }}
                          onClick={() => handleDeleteServer(server.id)}
                          title="Delete Server"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EDIT / ADD CONFIGURATION FORM */}
      {editingServerId && (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isAddingNew ? <Plus size={14} /> : <Edit3 size={14} />}
              {isAddingNew ? 'Add New SMTP Server Configuration' : `Edit Server: ${editForm.name}`}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)', alignSelf: 'center' }}>Presets:</span>
              <button
                type="button"
                className={`btn btn-xs ${editForm.provider === 'gmail' ? 'btn-r' : 'btn-o'}`}
                onClick={() => handleApplyPreset('gmail')}
              >
                Gmail
              </button>
              <button
                type="button"
                className={`btn btn-xs ${editForm.provider === 'office365' ? 'btn-r' : 'btn-o'}`}
                onClick={() => handleApplyPreset('office365')}
              >
                Office 365
              </button>
              <button
                type="button"
                className={`btn btn-xs ${editForm.provider === 'custom' ? 'btn-r' : 'btn-o'}`}
                onClick={() => handleApplyPreset('custom')}
              >
                Custom
              </button>
            </div>
          </div>

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Server Label / Display Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="e.g. Gmail Outgoing Relay"
                required
              />
            </div>
            <div className="field">
              <label>SMTP Host &amp; Port</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  style={{ flex: 3 }}
                  value={editForm.host}
                  onChange={e => setEditForm({ ...editForm, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
                <input
                  type="number"
                  style={{ flex: 1 }}
                  value={editForm.port}
                  onChange={e => setEditForm({ ...editForm, port: Number(e.target.value) || 587 })}
                  placeholder="587"
                />
              </div>
            </div>
          </div>

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Sender Account Email / Username *</label>
              <input
                type="email"
                value={editForm.user}
                onChange={e => setEditForm({ ...editForm, user: e.target.value, fromEmail: editForm.fromEmail || e.target.value })}
                placeholder="e.g. sfjimelliot@gmail.com"
                required
              />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>16-Digit App Password *</label>
                <button
                  type="button"
                  onClick={() => setShowAppPassHelp(!showAppPassHelp)}
                  style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '10.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <HelpCircle size={11} /> {showAppPassHelp ? 'Hide Help' : 'How to get App Password?'}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={editForm.pass}
                  onChange={e => setEditForm({ ...editForm, pass: e.target.value })}
                  placeholder="xxxx xxxx xxxx xxxx"
                  style={{ paddingRight: '36px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--muted)' }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {showAppPassHelp && (
            <div style={{ background: '#fffbeb', border: '1px solid #fef08a', borderRadius: '6px', padding: '10px 14px', marginBottom: '12px', fontSize: '11.5px', color: '#92400e', lineHeight: '1.5' }}>
              <strong>Google Account Security Notice:</strong> Google requires an App Password when sending from automated systems.
              <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li>Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" style={{ color: 'var(--brand)', fontWeight: 600 }}>Google Account &gt; Security</a> and enable <strong>2-Step Verification</strong>.</li>
                <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: 'var(--brand)', fontWeight: 600 }}>App Passwords</a>.</li>
                <li>Enter App Name &ldquo;Casagrand Audit&rdquo; &rarr; Click Create &rarr; Paste the generated 16-character key here.</li>
              </ol>
            </div>
          )}

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Sender Display Name</label>
              <input
                type="text"
                value={editForm.fromName}
                onChange={e => setEditForm({ ...editForm, fromName: e.target.value })}
                placeholder="Casagrand Quality & Process Audit"
              />
            </div>
            <div className="field">
              <label>From Email Address</label>
              <input
                type="email"
                value={editForm.fromEmail}
                onChange={e => setEditForm({ ...editForm, fromEmail: e.target.value })}
                placeholder="sfjimelliot@gmail.com"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editForm.isDefault}
                onChange={e => setEditForm({ ...editForm, isDefault: e.target.checked })}
              />
              <span>Set as Default Outbound Server</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editForm.secure}
                onChange={e => setEditForm({ ...editForm, secure: e.target.checked })}
              />
              <span>Use SSL/TLS (Direct Port 465)</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-o btn-sm"
              onClick={() => { setEditingServerId(null); setIsAddingNew(false); }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-g btn-sm"
              onClick={handleSaveServer}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Save size={13} />
              <span>Save SMTP Configuration</span>
            </button>
          </div>
        </div>
      )}

      {/* TEST CONNECTION & VERIFICATION BAR */}
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={13} style={{ color: 'var(--brand)' }} />
              Test Selected SMTP Server ({activeServer?.name || 'Default'})
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'block' }}>
              Verify authentication and dispatch a live verification email.
            </span>
          </div>
          {activeServer?.pass ? (
            <span className="badge bg" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle2 size={10} /> Credentials Ready
            </span>
          ) : (
            <span className="badge by" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <AlertTriangle size={10} /> App Password Missing
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="email"
            value={testRecipient}
            onChange={e => setTestRecipient(e.target.value)}
            placeholder="test.recipient@casagrand.co.in"
            style={{ flex: '1 1 240px', padding: '7px 10px', fontSize: '12.5px' }}
          />
          <button
            type="button"
            className="btn btn-g"
            onClick={handleTestConnection}
            disabled={isTesting}
            style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            {isTesting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <Zap size={13} />
                <span>Test Connection &amp; Send Verification</span>
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              background: testResult.success ? 'var(--green-bg)' : 'var(--red-bg)',
              color: testResult.success ? 'var(--green2)' : 'var(--red)',
              border: `1px solid ${testResult.success ? '#a7f3d0' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {testResult.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            <div>
              <strong>{testResult.success ? 'Success: ' : 'Error: '}</strong>
              {testResult.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
