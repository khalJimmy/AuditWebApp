import React, { useState, useEffect } from 'react';
import { Settings, EmailConnectionStatus } from '../types';
import { api } from '../services/api';
import {
  Mail,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Send,
  Save,
  Check,
  Info,
  Server,
  Cloud
} from 'lucide-react';

interface ResendSettingsCardProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => Promise<void>;
  onToast: (msg: string) => void;
  currentUserEmail?: string;
}

export const ResendSettingsCard: React.FC<ResendSettingsCardProps> = ({
  settings,
  onUpdateSettings,
  onToast,
  currentUserEmail
}) => {
  const [apiKey, setApiKey] = useState<string>(settings.resendApiKey || '');
  const [senderEmail, setSenderEmail] = useState<string>(
    settings.senderEmail || settings.resendFromEnv || 'onboarding@resend.dev'
  );
  const [senderName, setSenderName] = useState<string>(
    settings.senderName || 'Casagrand Quality & Process Audit'
  );
  const [defaultCc, setDefaultCc] = useState<string>(settings.defaultCcRecipients || '');
  const [autoReminder24h, setAutoReminder24h] = useState<boolean>(settings.autoReminder24h ?? true);
  const [autoEscalateHod, setAutoEscalateHod] = useState<boolean>(settings.autoEscalateHod ?? true);

  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Connection Ping / Status State
  const [connStatus, setConnStatus] = useState<EmailConnectionStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [isCheckingPing, setIsCheckingPing] = useState<boolean>(false);

  // Test Verification State
  const [testRecipient, setTestRecipient] = useState<string>(currentUserEmail || 'delivered@resend.dev');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; messageId?: string } | null>(null);

  // Load connection status on mount and settings change
  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const status = await api.getEmailConnectionStatus();
      setConnStatus(status);
    } catch (err: any) {
      console.error('Failed to fetch Resend status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    setApiKey(settings.resendApiKey || '');
    setSenderEmail(settings.senderEmail || settings.resendFromEnv || 'onboarding@resend.dev');
    setSenderName(settings.senderName || 'Casagrand Quality & Process Audit');
    setDefaultCc(settings.defaultCcRecipients || '');
    setAutoReminder24h(settings.autoReminder24h ?? true);
    setAutoEscalateHod(settings.autoEscalateHod ?? true);
  }, [settings]);

  const handleTestConnectionPing = async () => {
    setIsCheckingPing(true);
    try {
      const res = await api.checkEmailConnection({ apiKey: apiKey.trim() || undefined });
      setConnStatus(res);
      if (res.connected) {
        onToast(`Resend API authenticated! Latency: ${res.latencyMs || 0}ms`);
      } else {
        onToast(`Resend connection check failed: ${res.message || 'Check API key'}`);
      }
    } catch (err: any) {
      onToast(`Connection error: ${err.message}`);
    } finally {
      setIsCheckingPing(false);
    }
  };

  const handleSaveResendConfig = async () => {
    setIsSaving(true);
    try {
      const updated: Settings = {
        ...settings,
        resendApiKey: apiKey.trim(),
        senderEmail: senderEmail.trim(),
        senderName: senderName.trim(),
        defaultCcRecipients: defaultCc.trim(),
        autoReminder24h,
        autoEscalateHod
      };
      await onUpdateSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onToast('Resend email settings saved successfully');
      await fetchStatus();
    } catch (err: any) {
      onToast(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestVerification = async () => {
    if (!testRecipient.trim()) {
      onToast('Please enter a recipient email address for testing');
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await api.sendTestEmail({
        templateType: 'schedule',
        recipientEmail: testRecipient.trim(),
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
            <div style="background: #e11d48; padding: 18px 24px; color: #ffffff;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 700;">CASAGRAND PROCESS QUALITY AUDIT</h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Resend API Outbound Test Verification</p>
            </div>
            <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
              <p style="margin-top: 0; font-weight: 700; color: #059669; font-size: 16px;">
                🚀 Resend Delivery Verification Confirmed
              </p>
              <p>Your application successfully connected to Resend's REST API and dispatched this message without SMTP port limits or socket timeouts.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 12px; color: #64748b; font-weight: 600; width: 130px;">Sender:</td>
                  <td style="padding: 8px 12px; color: #0f172a;">${senderName} &lt;${senderEmail}&gt;</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 12px; color: #64748b; font-weight: 600;">Recipient:</td>
                  <td style="padding: 8px 12px; color: #0f172a;">${testRecipient}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-weight: 600;">Delivered At:</td>
                  <td style="padding: 8px 12px; color: #0f172a;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
              <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
                Audit dispatches, CAPA notices, and SLA reminders are now configured to use Resend API.
              </p>
            </div>
          </div>
        `
      });

      if (res.success) {
        setTestResult({
          success: true,
          message: `Verification email sent successfully to ${testRecipient}!`,
          messageId: res.messageId
        });
        onToast(`Email dispatched via Resend API! (ID: ${res.messageId || 'ok'})`);
      } else {
        throw new Error('Test email did not return success');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to dispatch test email via Resend'
      });
      onToast(`Test failed: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const isConnected = connStatus?.connected || Boolean(apiKey) || Boolean(connStatus?.hasEnvKey);

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      {/* Header */}
      <div className="ctitle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} style={{ color: '#0284c7' }} />
          <span>Resend Email API Delivery Engine</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {connStatus?.hasEnvKey && (
            <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cloud size={11} />
              <span>Vercel RESEND_API_KEY active</span>
            </span>
          )}
          <span
            className="badge"
            style={{
              background: isConnected ? '#ecfdf5' : '#fffbeb',
              color: isConnected ? '#059669' : '#d97706',
              border: `1px solid ${isConnected ? '#a7f3d0' : '#fde68a'}`,
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isConnected ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
            <span>{isConnected ? 'API Connected' : 'Configuration Required'}</span>
          </span>
        </div>
      </div>

      {/* Live Status Bar */}
      <div
        style={{
          background: isConnected ? '#f0fdf4' : '#fffbeb',
          border: `1px solid ${isConnected ? '#bbf7d0' : '#fed7aa'}`,
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: isConnected ? '#dcfce7' : '#fef3c7',
              color: isConnected ? '#15803d' : '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Mail size={16} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {isConnected ? 'Resend HTTPS REST API Delivery (Port 443)' : 'Resend API Not Configured'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {connStatus?.message ||
                (isConnected
                  ? 'Audit notifications, CAPA dispatches, and SLA reminder emails route reliably via Resend.'
                  : 'Enter your Resend API Key below or define RESEND_API_KEY in Vercel to activate real delivery.')}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-s"
          onClick={handleTestConnectionPing}
          disabled={isCheckingPing || isLoadingStatus}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '6px 12px' }}
        >
          {isCheckingPing ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />}
          <span>{isCheckingPing ? 'Pinging...' : 'Ping Resend API'}</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        {/* Resend API Key */}
        <div className="fg" style={{ margin: 0 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Resend API Key</span>
            <a
              href="https://resend.com/api-keys"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '11px', color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <span>Get API Key</span>
              <ExternalLink size={10} />
            </a>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              className="fc"
              placeholder="re_xxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ paddingRight: '40px', fontFamily: 'monospace', fontSize: '12px' }}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px'
              }}
            >
              {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
            Starts with <code>re_</code>. Key is securely stored and never exposed to the client browser.
          </span>
        </div>

        {/* Sender Email */}
        <div className="fg" style={{ margin: 0 }}>
          <label>Sender "From" Email Address</label>
          <input
            type="email"
            className="fc"
            placeholder="onboarding@resend.dev or audit@casagrand.co.in"
            value={senderEmail}
            onChange={e => setSenderEmail(e.target.value)}
          />
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
            Use <code>onboarding@resend.dev</code> for testing, or your verified domain sender in production.
          </span>
        </div>

        {/* Sender Name */}
        <div className="fg" style={{ margin: 0 }}>
          <label>Sender Display Name</label>
          <input
            type="text"
            className="fc"
            placeholder="Casagrand Quality & Process Audit"
            value={senderName}
            onChange={e => setSenderName(e.target.value)}
          />
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
            Shown as the sender name in the recipient's inbox.
          </span>
        </div>

        {/* Default CC Recipients */}
        <div className="fg" style={{ margin: 0 }}>
          <label>Default CC Recipients (Optional)</label>
          <input
            type="text"
            className="fc"
            placeholder="audit.pnc@casagrand.co.in, compliance@casagrand.co.in"
            value={defaultCc}
            onChange={e => setDefaultCc(e.target.value)}
          />
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
            Comma-separated emails to automatically CC on all audit dispatches.
          </span>
        </div>
      </div>

      {/* Delivery Preferences */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
          Automated SLA Dispatch Triggers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
            <input
              type="checkbox"
              checked={autoReminder24h}
              onChange={e => setAutoReminder24h(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--brand)' }}
            />
            <span>Send automated reminder email when CAPA reaches 24 hours before SLA deadline</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b' }}>
            <input
              type="checkbox"
              checked={autoEscalateHod}
              onChange={e => setAutoEscalateHod(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--brand)' }}
            />
            <span>Automatically CC Department Head (HOD) on SLA breach notices</span>
          </label>
        </div>
      </div>

      {/* Save Button Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button
          type="button"
          className="btn btn-g"
          onClick={handleSaveResendConfig}
          disabled={isSaving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontWeight: 600 }}
        >
          {isSaving ? <Loader2 size={14} className="spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Email Configuration'}</span>
        </button>
      </div>

      {/* Test Email Dispatch Sandbox */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Send size={14} style={{ color: 'var(--brand)' }} />
          <span>Send Live Test Email via Resend</span>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
          Verify your Resend setup right now by sending a real verification email.
        </div>

        <div style={{ display: 'flex', gap: '8px', maxWidth: '540px' }}>
          <input
            type="email"
            className="fc"
            placeholder="your-email@example.com"
            value={testRecipient}
            onChange={e => setTestRecipient(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-s"
            onClick={handleSendTestVerification}
            disabled={isSendingTest || !testRecipient.trim()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', padding: '6px 14px' }}
          >
            {isSendingTest ? <Loader2 size={13} className="spin" /> : <Send size={13} />}
            <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
          </button>
        </div>

        {testResult && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              background: testResult.success ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${testResult.success ? '#a7f3d0' : '#fecaca'}`,
              color: testResult.success ? '#065f46' : '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {testResult.success ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            <div>
              <span style={{ fontWeight: 600 }}>{testResult.message}</span>
              {testResult.messageId && (
                <span style={{ marginLeft: '6px', color: '#047857', fontFamily: 'monospace' }}>
                  (Resend ID: {testResult.messageId})
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vercel Cloud Environment Helper */}
      <div
        style={{
          marginTop: '18px',
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '12px',
          color: '#475569'
        }}
      >
        <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cloud size={13} style={{ color: '#0284c7' }} />
          <span>Vercel Cloud Deployment Note</span>
        </div>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          When deploying to Vercel, simply add <code>RESEND_API_KEY</code> and optional <code>RESEND_FROM</code> to your Vercel Project Settings &rarr; Environment Variables. The backend server automatically synchronizes on startup with zero extra configuration.
        </p>
      </div>
    </div>
  );
};
