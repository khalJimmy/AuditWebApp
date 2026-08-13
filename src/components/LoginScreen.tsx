import React, { useState } from 'react';
import { getSupabaseConfigStatus } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: (username: string, pw: string) => Promise<any>;
  errorMessage?: string | null;
  toast?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, errorMessage, toast }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const configStatus = getSupabaseConfigStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErr('Please enter both username/email and password.');
      return;
    }
    setErr(null);
    setSuccessInfo(null);
    setLoading(true);
    try {
      await onLogin(identifier.trim(), password);
    } catch (error: any) {
      setErr(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setIdentifier(u);
    setPassword(p);
    setErr(null);
  };

  return (
    <div id="login-screen">
      <div className="lbox">
        {/* LOGO & BRANDING */}
        <div className="llogo">
          <div className="lmark">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M3 9.5L12 3L21 9.5V21H15V15H9V21H3V9.5Z" fill="rgba(255,255,255,0.95)" />
            </svg>
          </div>
          <div>
            <div className="ltitle">
              <span>CASAGRAND</span>
            </div>
            <div className="lsub">Process Audit &amp; Quality Workflow</div>
          </div>
        </div>

        {/* SUPABASE STATUS BADGE */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: configStatus.configured ? '#ecfdf5' : '#fffbeb',
          border: `1px solid ${configStatus.configured ? '#a7f3d0' : '#fde68a'}`,
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '11px',
          color: configStatus.configured ? '#065f46' : '#92400e',
          marginBottom: '14px'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '12px' }}>{configStatus.configured ? '⚡' : '⚠️'}</span>
            <strong>Supabase Auth:</strong> {configStatus.configured ? 'Connected' : 'Configuration Pending'}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#64748b' }}>
            {configStatus.urlHost}
          </span>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="lfield">
            <label>Username or Email Address</label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="e.g. admin or admin@casagrand.co.in"
              autoComplete="username"
              required
            />
          </div>

          <div className="lfield">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your account password"
              autoComplete="current-password"
              required
            />
          </div>

          {/* ERROR OR SUCCESS MESSAGE */}
          {(err || errorMessage) && (
            <div className="lerr" style={{ display: 'block', marginBottom: '10px' }}>
              {err || errorMessage}
            </div>
          )}

          {successInfo && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#166534',
              fontSize: '11.5px',
              padding: '8px 10px',
              borderRadius: '6px',
              marginBottom: '12px'
            }}>
              {successInfo}
            </div>
          )}

          {toast && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              fontSize: '11px',
              padding: '6px 10px',
              borderRadius: '6px',
              marginBottom: '10px'
            }}>
              {toast}
            </div>
          )}

          <button type="submit" className="lbtn" disabled={loading} style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Authenticating with Supabase...' : 'Sign In with Supabase →'}
          </button>
        </form>

        {/* DEFAULT DEMO / TEST CREDENTIALS ASSISTANCE */}
        <div className="lhint" style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <strong>Casagrand Role Profiles:</strong>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Click to auto-fill</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
            <div 
              onClick={() => handleQuickFill('admin', 'Audit@2026')}
              style={{ cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              👑 <strong>Admin / Lead:</strong> <code>admin</code> or <code>admin@casagrand.co.in</code>
            </div>
            <div 
              onClick={() => handleQuickFill('auditor1', 'Audit@2026')}
              style={{ cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              🔍 <strong>Auditor (Chennai):</strong> <code>auditor1</code> or <code>auditor1@casagrand.co.in</code>
            </div>
            <div 
              onClick={() => handleQuickFill('spoc.mis', 'Spoc@2026')}
              style={{ cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              📋 <strong>SPOC (MIS):</strong> <code>spoc.mis</code> or <code>spoc.mis@casagrand.co.in</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
