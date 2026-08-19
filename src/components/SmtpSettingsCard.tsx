import React, { useState, useEffect } from 'react';
import { Settings, SmtpServerConfig, EmailProviderType, EmailConnectionStatus } from '../types';
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
  Star,
  ExternalLink,
  ShieldCheck,
  Send,
  RefreshCw,
  Activity,
  Check
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
  const defaultEmail = currentUserEmail || settings.systemEmail || 'onboarding@resend.dev';

  const initialServers: SmtpServerConfig[] = settings.smtpServers && settings.smtpServers.length > 0
    ? settings.smtpServers
    : [
        {
          id: 'cfg_resend_default',
          name: 'Resend HTTPS API (Primary Cloud Delivery)',
          provider: 'resend',
          apiKey: settings.resendApiKey || '',
          fromName: 'Casagrand Quality & Process Audit',
          fromEmail: 'onboarding@resend.dev',
          isDefault: true,
          status: 'untested'
        },
        {
          id: 'cfg_gmail_backup',
          name: 'Gmail / Google Workspace Relay (Fallback)',
          provider: 'gmail',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          user: 'jimelliot.sf@casagrand.co.in',
          pass: 'ftgm nuwx tdrz pyfs',
          fromName: 'Casagrand Quality & Process Audit',
          fromEmail: 'jimelliot.sf@casagrand.co.in',
          isDefault: false,
          status: 'verified'
        }
      ];

  const [servers, setServers] = useState<SmtpServerConfig[]>(initialServers);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showApiKeyHelp, setShowApiKeyHelp] = useState<boolean>(false);

  // Connection Status State
  const [connStatus, setConnStatus] = useState<EmailConnectionStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [isCheckingPing, setIsCheckingPing] = useState<boolean>(false);

  // Edit / Add Form Buffer
  const [editForm, setEditForm] = useState<SmtpServerConfig>({
    id: 'cfg_resend_new',
    name: 'Resend Cloud Delivery',
    provider: 'resend',
    apiKey: '',
    fromName: 'Casagrand Quality & Process Audit',
    fromEmail: 'onboarding@resend.dev',
    isDefault: false,
    status: 'untested'
  });

  // Test Connection State
  const [testRecipient, setTestRecipient] = useState<string>(currentUserEmail || 'delivered@resend.dev');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; messageId?: string; verifiedAt?: string } | null>(null);

  const activeServer = servers.find(s => s.id === selectedServerId) || servers.find(s => s.isDefault) || servers[0];

  // Fetch connection status on mount and when settings change
  const loadConnectionStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const res = await api.getEmailConnectionStatus();
      setConnStatus(res);
      if (settings.smtpServers && settings.smtpServers.length > 0) {
        setServers(settings.smtpServers);
      }
    } catch (err: any) {
      console.warn('Could not load email connection status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadConnectionStatus();
  }, [settings]);

  const handlePingResend = async () => {
    try {
      setIsCheckingPing(true);
      const res = await api.checkEmailConnection({ serverId: activeServer?.id });
      setConnStatus(res);
      onToast(res.message || 'Resend API authenticated successfully.');
    } catch (err: any) {
      onToast(`Connection check error: ${err.message}`);
    } finally {
      setIsCheckingPing(false);
    }
  };

  const handleStartEdit = (server: SmtpServerConfig) => {
    setIsAddingNew(false);
    setEditingServerId(server.id);
    setEditForm({ ...server });
  };

  const handleStartAdd = (presetType: EmailProviderType = 'resend') => {
    const newId = `cfg_${presetType}_${Date.now()}`;
    setEditingServerId(newId);
    setIsAddingNew(true);
    if (presetType === 'resend') {
      setEditForm({
        id: newId,
        name: `Resend Cloud API #${servers.length + 1}`,
        provider: 'resend',
        apiKey: '',
        fromName: 'Casagrand Quality & Process Audit',
        fromEmail: 'onboarding@resend.dev',
        isDefault: servers.length === 0,
        status: 'untested'
      });
    } else {
      setEditForm({
        id: newId,
        name: `SMTP Relay #${servers.length + 1}`,
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
    }
  };

  const handleApplyPreset = (preset: 'resend' | 'gmail_tls' | 'office365' | 'custom') => {
    if (preset === 'resend') {
      setEditForm(prev => ({
        ...prev,
        provider: 'resend',
        name: 'Resend HTTPS API (Port 443)',
        apiKey: prev.apiKey || '',
        fromEmail: prev.fromEmail && !prev.fromEmail.includes('gmail') ? prev.fromEmail : 'onboarding@resend.dev',
        fromName: prev.fromName || 'Casagrand Quality & Process Audit'
      }));
    } else if (preset === 'gmail_tls') {
      setEditForm(prev => ({
        ...prev,
        provider: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        name: 'Gmail / Google Workspace (Port 587)'
      }));
    } else if (preset === 'office365') {
      setEditForm(prev => ({
        ...prev,
        provider: 'office365',
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        name: 'Microsoft 365 Exchange Relay'
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        provider: 'custom',
        host: 'smtp.casagrand.co.in',
        port: 587,
        secure: false,
        name: 'Custom SMTP Relay'
      }));
    }
  };

  const handleSaveServer = async () => {
    if (!editForm.name.trim()) {
      alert('Please provide a configuration display name.');
      return;
    }

    if (editForm.provider === 'resend') {
      if (!editForm.apiKey?.trim() && !connStatus?.hasEnvKey && !settings.resendApiKey) {
        alert('Please provide your Resend API Key (starts with "re_") or configure RESEND_API_KEY in Vercel.');
        return;
      }
    } else {
      if (!editForm.user?.trim()) {
        alert('Please provide the account email or username.');
        return;
      }
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
        activeSmtpServerId: editForm.isDefault ? editForm.id : selectedServerId,
        resendApiKey: editForm.provider === 'resend' && editForm.apiKey ? editForm.apiKey : settings.resendApiKey
      };
      await onUpdateSettings(newSettings);
      onToast('Email configuration saved successfully.');
    } catch (err: any) {
      onToast(`Error saving email configuration: ${err.message}`);
    }
  };

  const handleSetDefault = async (id: string) => {
    const updatedList = servers.map(s => ({
      ...s,
      isDefault: s.id === id
    }));
    setServers(updatedList);
    onSelectServerId(id);

    const target = updatedList.find(s => s.id === id);

    try {
      const newSettings: Settings = {
        ...settings,
        smtpServers: updatedList,
        activeSmtpServerId: id,
        resendApiKey: target?.provider === 'resend' && target.apiKey ? target.apiKey : settings.resendApiKey
      };
      await onUpdateSettings(newSettings);
      onToast(`Active delivery channel switched to "${target?.name || id}".`);
    } catch (err: any) {
      onToast(`Error setting active config: ${err.message}`);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (servers.length <= 1) {
      alert('You must retain at least one configured email delivery channel.');
      return;
    }
    const target = servers.find(s => s.id === id);
    if (!confirm(`Delete configuration profile "${target?.name || id}"?`)) return;

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
      onToast('Configuration profile removed.');
    } catch (err: any) {
      onToast(`Error removing configuration: ${err.message}`);
    }
  };

  const handleTestConnection = async () => {
    if (!activeServer) {
      onToast('No active email delivery configuration selected.');
      return;
    }

    if (activeServer.provider === 'resend' && !activeServer.apiKey?.trim() && !connStatus?.hasEnvKey && !settings.resendApiKey) {
      onToast('Please enter and save your Resend API Key (starts with "re_") or add RESEND_API_KEY in Vercel first.');
      return;
    }

    if (activeServer.provider !== 'resend' && (!activeServer.user || !activeServer.pass)) {
      onToast('Please enter Account Email and App Password for SMTP relay first.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await api.testSmtpConnection(activeServer, testRecipient);
      if (res.success) {
        setTestResult({
          success: true,
          message: res.message || 'Delivery channel verified and live test email dispatched!',
          messageId: res.messageId,
          verifiedAt: res.verifiedAt || new Date().toISOString()
        });
        const updatedList = servers.map(s => s.id === activeServer.id ? { ...s, status: 'verified' as const, lastTestedAt: new Date().toISOString(), testMessageId: res.messageId } : s);
        setServers(updatedList);
        onToast(`Live verification succeeded! Dispatched to ${testRecipient}`);
      } else {
        setTestResult({
          success: false,
          message: 'Connection test failed.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Verification failed. Please check your credentials.'
      });
      const updatedList = servers.map(s => s.id === activeServer.id ? { ...s, status: 'failed' as const } : s);
      setServers(updatedList);
      onToast(`Verification failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="card">
      <div className="ctitle">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={16} style={{ color: 'var(--brand)' }} />
          <span>Outbound Email Delivery &amp; Resend API Configuration</span>
        </div>
        {!editingServerId && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-g btn-xs"
              onClick={() => handleStartAdd('resend')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Zap size={12} />
              <span>Connect Resend API</span>
            </button>
            <button
              type="button"
              className="btn btn-o btn-xs"
              onClick={() => handleStartAdd('gmail')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={12} />
              <span>Add Custom Relay</span>
            </button>
          </div>
        )}
      </div>

      <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '14px', lineHeight: '1.5' }}>
        Configure the outbound delivery provider used for dispatching audit reports, CAPA notices, and 72-hour SLA reminders to SPOCs and HODs. <strong>Resend HTTPS API</strong> operates over standard port 443 with instant delivery and zero port restrictions.
      </p>

      {/* VERCEL / CLOUD LIVE CONNECTION STATUS BANNER */}
      <div
        style={{
          background: connStatus?.connected
            ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
          border: connStatus?.connected
            ? '1px solid rgba(5, 150, 105, 0.35)'
            : '1px solid rgba(234, 88, 12, 0.35)',
          borderRadius: '8px',
          padding: '16px 18px',
          marginBottom: '18px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: connStatus?.connected ? '#059669' : '#ea580c',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: connStatus?.connected ? '0 2px 8px rgba(5, 150, 105, 0.25)' : '0 2px 8px rgba(234, 88, 12, 0.25)'
              }}
            >
              {isLoadingStatus ? (
                <Loader2 size={19} className="animate-spin" />
              ) : connStatus?.connected ? (
                <CheckCircle2 size={19} />
              ) : (
                <AlertTriangle size={19} />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--ink)' }}>
                  {connStatus?.connected ? 'Resend API Connected' : 'Resend API Not Connected'}
                </span>

                {connStatus?.connected ? (
                  <span
                    className="badge bg"
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600
                    }}
                  >
                    <ShieldCheck size={12} /> Active &amp; Verified
                  </span>
                ) : (
                  <span
                    className="badge by"
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <AlertTriangle size={12} /> Key Required
                  </span>
                )}

                {connStatus?.hasEnvKey && (
                  <span
                    className="badge bb"
                    style={{
                      fontSize: '10.5px',
                      padding: '2px 7px',
                      fontWeight: 600
                    }}
                  >
                    Vercel Environment Variable Detected
                  </span>
                )}
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: '1.5', maxWidth: '680px' }}>
                {connStatus?.connected ? (
                  <>
                    Outbound email dispatch is authenticated via <strong>{connStatus.envSource}</strong>. Audit notices and CAPA reminders will route cleanly via HTTPS without SMTP socket timeouts.
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px', fontSize: '12px', color: 'var(--ink)' }}>
                      <span><strong>Key:</strong> <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: '4px', fontSize: '11.5px', fontFamily: 'monospace' }}>{connStatus.apiKeyMasked || 're_••••••••'}</code></span>
                      <span><strong>Sender:</strong> <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: '4px', fontSize: '11.5px', fontFamily: 'monospace' }}>{connStatus.fromEmail}</code></span>
                      {connStatus.latencyMs !== undefined && (
                        <span><strong>Latency:</strong> <span style={{ color: '#059669', fontWeight: 600 }}>{connStatus.latencyMs}ms</span></span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    No <code>RESEND_API_KEY</code> detected in the active runtime. If you have added it to Vercel Project Settings, click <strong>"Check Connection"</strong> below or save your key in the form.
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons on the banner */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-g btn-xs"
              onClick={handlePingResend}
              disabled={isCheckingPing || isLoadingStatus}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
              title="Ping Resend HTTPS API to verify authentication and check latency"
            >
              {isCheckingPing ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
              <span>{isCheckingPing ? 'Verifying...' : 'Check Connection'}</span>
            </button>

            <button
              type="button"
              className="btn btn-o btn-xs"
              onClick={loadConnectionStatus}
              disabled={isLoadingStatus}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              title="Fetch fresh connection status from backend"
            >
              <RefreshCw size={12} className={isLoadingStatus ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* SAVED PROFILES & CONFIGURATIONS TABLE */}
      <div className="tbl-wrap" style={{ marginBottom: '16px' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>Active</th>
              <th>Channel / Profile Label</th>
              <th>Provider &amp; Protocol</th>
              <th>Sender Identifier</th>
              <th>Status</th>
              <th>Default</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {servers.map(server => {
              const isSelected = server.id === selectedServerId;
              const isResend = server.provider === 'resend';
              const hasCredentials = isResend ? Boolean(server.apiKey?.trim() || connStatus?.hasEnvKey) : Boolean(server.pass?.trim());
              const isFromEnv = server.isEnvConfigured || (isResend && connStatus?.hasEnvKey);

              return (
                <tr
                  key={server.id}
                  style={{
                    background: isSelected ? 'var(--surface2)' : undefined,
                    borderLeft: isSelected ? '3px solid var(--brand)' : undefined
                  }}
                >
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="radio"
                      name="selected_email_config"
                      checked={isSelected}
                      onChange={() => onSelectServerId(server.id)}
                      title="Select this configuration as the active outbound delivery channel"
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{server.name}</span>
                      {isFromEnv && (
                        <span className="badge bb" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                          Vercel Env
                        </span>
                      )}
                    </div>
                    {isResend ? (
                      <span style={{ fontSize: '11px', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={11} /> HTTPS REST API (Port 443)
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        SMTP {server.host}:{server.port}
                      </span>
                    )}
                  </td>
                  <td>
                    {isResend ? (
                      <span className="badge bg" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Zap size={10} /> Resend API
                      </span>
                    ) : (
                      <span className="badge bb" style={{ textTransform: 'capitalize' }}>
                        {server.provider} Relay
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>
                      {isResend ? (
                        <span>
                          <strong>From:</strong> {server.fromEmail || 'onboarding@resend.dev'}
                        </span>
                      ) : (
                        <span>{server.user || <span style={{ color: 'var(--muted)' }}>—</span>}</span>
                      )}
                    </div>
                    {!hasCredentials && (
                      <span className="badge by" style={{ marginTop: '2px', fontSize: '9.5px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <AlertTriangle size={10} /> {isResend ? 'API Key Missing' : 'Password Required'}
                      </span>
                    )}
                  </td>
                  <td>
                    {server.status === 'verified' || (isResend && connStatus?.connected) ? (
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
                        style={{ fontSize: '10.5px', padding: '2px 8px' }}
                        onClick={() => handleSetDefault(server.id)}
                      >
                        Set Active
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
                          title="Delete Configuration Profile"
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

      {/* EDIT / ADD CONFIGURATION MODAL / CARD */}
      {editingServerId && (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isAddingNew ? <Plus size={15} style={{ color: 'var(--brand)' }} /> : <Edit3 size={15} style={{ color: 'var(--brand)' }} />}
              {isAddingNew ? 'Create New Email Delivery Profile' : `Configure: ${editForm.name}`}
            </div>

            {/* Quick Provider Presets */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Presets:</span>
              <button
                type="button"
                className={`btn btn-xs ${editForm.provider === 'resend' ? 'btn-g' : 'btn-o'}`}
                onClick={() => handleApplyPreset('resend')}
                title="Resend HTTPS REST API (Recommended)"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <Zap size={11} /> Resend API
              </button>
              <button
                type="button"
                className={`btn btn-xs ${editForm.provider === 'gmail' ? 'btn-r' : 'btn-o'}`}
                onClick={() => handleApplyPreset('gmail_tls')}
                title="Google Gmail / Workspace Relay"
              >
                Gmail SMTP
              </button>
              <button
                type="button"
                className={`btn btn-xs ${editForm.provider === 'office365' ? 'btn-r' : 'btn-o'}`}
                onClick={() => handleApplyPreset('office365')}
                title="Microsoft 365 Exchange"
              >
                Office 365
              </button>
              <button
                type="button"
                className={`btn btn-xs ${editForm.provider === 'custom' ? 'btn-r' : 'btn-o'}`}
                onClick={() => handleApplyPreset('custom')}
                title="Custom Mail Server"
              >
                Custom
              </button>
            </div>
          </div>

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Configuration Profile Label *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="e.g. Resend Production Cloud Delivery"
                required
              />
            </div>

            <div className="field">
              <label>Delivery Provider</label>
              <select
                value={editForm.provider}
                onChange={e => {
                  const prov = e.target.value as EmailProviderType;
                  handleApplyPreset(prov === 'resend' ? 'resend' : prov === 'gmail' ? 'gmail_tls' : prov === 'office365' ? 'office365' : 'custom');
                }}
              >
                <option value="resend">Resend HTTPS API (Recommended — Port 443)</option>
                <option value="gmail">Google Workspace / Gmail Relay</option>
                <option value="office365">Microsoft Office 365 Exchange</option>
                <option value="custom">Custom SMTP Server</option>
              </select>
            </div>
          </div>

          {/* RESEND API FIELDS */}
          {editForm.provider === 'resend' ? (
            <div>
              <div className="field" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontWeight: 600 }}>Resend API Key (starts with &ldquo;re_&rdquo;) *</label>
                  <button
                    type="button"
                    onClick={() => setShowApiKeyHelp(!showApiKeyHelp)}
                    style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    <HelpCircle size={12} /> {showApiKeyHelp ? 'Hide API Key Guide' : 'How to get Resend API Key?'}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editForm.apiKey || ''}
                    onChange={e => setEditForm({ ...editForm, apiKey: e.target.value.trim() })}
                    placeholder="re_123456789_abcdefghijklmnopqrstuvwxyz"
                    style={{ fontFamily: 'monospace', paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--muted)' }}
                    title={showPassword ? 'Hide API key' : 'Show API key'}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {showApiKeyHelp && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '12px 14px', marginBottom: '12px', fontSize: '12px', color: '#166534', lineHeight: '1.5' }}>
                  <strong>How to get your free Resend API Key:</strong>
                  <ol style={{ margin: '6px 0 0 18px', padding: 0 }}>
                    <li>Sign up or log in at <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" style={{ color: '#15803d', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>resend.com/api-keys <ExternalLink size={10} /></a>.</li>
                    <li>Click <strong>&ldquo;Create API Key&rdquo;</strong>, give it Full Access (e.g. <em>Casagrand Audit Dispatcher</em>).</li>
                    <li>Copy the key (starts with <code>re_</code>) and paste it into the field above.</li>
                    <li><strong>Domain notes:</strong> For testing without a custom domain, use <code>onboarding@resend.dev</code> as the From Address. Once your domain (e.g. <code>casagrand.co.in</code>) is verified on Resend, you can use any custom email address!</li>
                  </ol>
                </div>
              )}

              <div className="fg c2" style={{ marginBottom: '12px' }}>
                <div className="field">
                  <label>Sender From Email Address *</label>
                  <input
                    type="text"
                    value={editForm.fromEmail || 'onboarding@resend.dev'}
                    onChange={e => setEditForm({ ...editForm, fromEmail: e.target.value.trim() })}
                    placeholder="onboarding@resend.dev or audit@casagrand.co.in"
                    required
                  />
                  <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    Use <code>onboarding@resend.dev</code> for test sandbox, or your verified domain.
                  </span>
                </div>

                <div className="field">
                  <label>Sender Display Name</label>
                  <input
                    type="text"
                    value={editForm.fromName || 'Casagrand Quality & Process Audit'}
                    onChange={e => setEditForm({ ...editForm, fromName: e.target.value })}
                    placeholder="Casagrand Quality & Process Audit"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* LEGACY SMTP FIELDS */
            <div>
              <div className="fg c2" style={{ marginBottom: '12px' }}>
                <div className="field">
                  <label>SMTP Host &amp; Port</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      style={{ flex: 3 }}
                      value={editForm.host || ''}
                      onChange={e => setEditForm({ ...editForm, host: e.target.value })}
                      placeholder="smtp.gmail.com"
                    />
                    <input
                      type="number"
                      style={{ flex: 1 }}
                      value={editForm.port || 587}
                      onChange={e => setEditForm({ ...editForm, port: Number(e.target.value) || 587 })}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Account Email / Username *</label>
                  <input
                    type="email"
                    value={editForm.user || ''}
                    onChange={e => setEditForm({ ...editForm, user: e.target.value, fromEmail: editForm.fromEmail || e.target.value })}
                    placeholder="e.g. sfjimelliot@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="fg c2" style={{ marginBottom: '12px' }}>
                <div className="field">
                  <label>App Password / SMTP Secret *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editForm.pass || ''}
                      onChange={e => setEditForm({ ...editForm, pass: e.target.value })}
                      placeholder="Google 16-character App Password"
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

                <div className="field">
                  <label>From Email Address</label>
                  <input
                    type="email"
                    value={editForm.fromEmail || ''}
                    onChange={e => setEditForm({ ...editForm, fromEmail: e.target.value })}
                    placeholder="sfjimelliot@gmail.com"
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editForm.isDefault}
                onChange={e => setEditForm({ ...editForm, isDefault: e.target.checked })}
              />
              <span>Set as Default Outbound Delivery Channel</span>
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
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      )}

      {/* TEST CONNECTION & REAL DELIVERY VERIFICATION BAR */}
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={14} style={{ color: 'var(--brand)' }} />
              Test Active Delivery Channel ({activeServer?.name || 'Resend API'})
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'block' }}>
              Send an authenticated verification email to confirm credentials and deliverability.
            </span>
          </div>

          {activeServer?.provider === 'resend' ? (
            activeServer?.apiKey ? (
              <span className="badge bg" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={10} /> Resend Key Ready
              </span>
            ) : (
              <span className="badge by" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <AlertTriangle size={10} /> API Key Missing
              </span>
            )
          ) : (
            activeServer?.pass ? (
              <span className="badge bg" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={10} /> Credentials Ready
              </span>
            ) : (
              <span className="badge by" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <AlertTriangle size={10} /> Password Missing
              </span>
            )
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
                <span>Verifying Channel...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Test Connection &amp; Send Verification</span>
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div
            style={{
              marginTop: '10px',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              background: testResult.success ? 'var(--green-bg)' : '#fef2f2',
              color: testResult.success ? 'var(--green2)' : '#991b1b',
              border: `1px solid ${testResult.success ? '#a7f3d0' : '#fecaca'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              {testResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>{testResult.success ? 'Verification Successful' : 'Verification Failed'}</span>
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
              {testResult.message}
            </div>

            {testResult.messageId && (
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                Delivery ID: {testResult.messageId}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
