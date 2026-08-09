import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (username: string, pw: string) => Promise<void>;
  errorMessage?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErr('Please enter both username and password.');
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      await onLogin(username.trim(), password);
    } catch (error: any) {
      setErr(error.message || 'Login failed. Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen">
      <div className="lbox">
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
            <div className="lsub">Process Audit Workflow</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="lfield">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div className="lfield">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <div className="lerr">{err || errorMessage}</div>

          <button type="submit" className="lbtn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In →'}
          </button>
        </form>

        <div className="lhint">
          <strong>Default credentials</strong>
          <br />
          Admin/Lead: <code>admin</code> / <code>Audit@2026</code>
          <br />
          Auditor: <code>auditor1</code> / <code>Audit@2026</code>
          <br />
          SPOC sample: <code>spoc.mis</code> / <code>Spoc@2026</code>
        </div>
      </div>
    </div>
  );
};
