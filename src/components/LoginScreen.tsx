import React, { useState } from 'react';
import { getSupabaseConfigStatus } from '../lib/supabase';
import { AlertCircle, ArrowRight, Shield, Search, FileText, Mail } from 'lucide-react';

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
      // Ensure smooth delay for background data sync before unmounting
      await new Promise(r => setTimeout(r, 450));
    } catch (error: any) {
      setErr(error.message || 'Login failed. Please verify your credentials.');
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

        {/* DB STATUS INDICATOR */}
        {configStatus.configured ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            color: '#10b981',
            marginBottom: '14px',
            fontWeight: 500
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)'
            }} />
            <span>Connected</span>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            color: '#f59e0b',
            marginBottom: '14px',
            fontWeight: 500
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              display: 'inline-block'
            }} />
            <span>Configuration Pending</span>
          </div>
        )}

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
            <div className="lerr" style={{ display: 'block', marginBottom: '14px', lineHeight: '1.45' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{err || errorMessage}</span>
              </div>
              <div style={{ fontSize: '11px', marginTop: '6px', color: '#fca5a5', borderTop: '1px solid rgba(239, 68, 68, 0.25)', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={12} style={{ flexShrink: 0 }} />
                  <span>Unauthenticated? Please contact our team to request portal access:</span>
                </div>
                <div style={{ paddingLeft: '17px' }}>
                  <a
                    href="mailto:audit@casagrand.co.in?subject=Casagrand%20Portal%20Access%20Request"
                    style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    audit@casagrand.co.in
                  </a>
                  {' · '}
                  <a
                    href="mailto:sfjimelliot@gmail.com?subject=Casagrand%20Audit%20Support"
                    style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    sfjimelliot@gmail.com
                  </a>
                </div>
              </div>
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

          <button
            type="submit"
            className="lbtn"
            disabled={loading}
            style={{
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.85 : 1
            }}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin"
                  style={{ width: '16px', height: '16px' }}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="30"
                    strokeLinecap="round"
                    style={{ opacity: 0.3 }}
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </span>
            )}
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
              style={{ cursor: 'pointer', padding: '5px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Shield size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div><strong>Admin / Lead:</strong> <code>admin</code> or <code>admin@casagrand.co.in</code></div>
            </div>
            <div 
              onClick={() => handleQuickFill('auditor1', 'Audit@2026')}
              style={{ cursor: 'pointer', padding: '5px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Search size={13} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <div><strong>Auditor (Chennai):</strong> <code>auditor1</code> or <code>auditor1@casagrand.co.in</code></div>
            </div>
            <div 
              onClick={() => handleQuickFill('spoc.mis', 'Spoc@2026')}
              style={{ cursor: 'pointer', padding: '5px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={13} style={{ color: '#10b981', flexShrink: 0 }} />
              <div><strong>SPOC (MIS):</strong> <code>spoc.mis</code> or <code>spoc.mis@casagrand.co.in</code></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
