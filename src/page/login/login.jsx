import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      if (demoMode) {
        localStorage.setItem('auth_token', 'demo-token');
        navigate('/my-page');
        return;
      }
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Backend expects 'username'
        body: JSON.stringify({ username: email, password }),
      });
      if (!res.ok) {
        let msg = `Login failed (${res.status})`;
        try {
          const data = await res.json();
          msg = data?.message || data?.error || msg;
          if (data?.data && typeof data.data === 'object') {
            setFieldErrors(data.data);
          }
        } catch {}
        setError(msg);
        return;
      }
      const data = await res.json();
      if (data?.token) {
        localStorage.setItem('auth_token', data.token);
      }
      const role = (data?.data && data.data.role) ? data.data.role : data?.role;
      if (role) {
        localStorage.setItem('user_role', role);
      }
      navigate('/my-page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrap}>
      <div style={styles.gradientBg} />
      <div style={styles.card}>
        <div style={styles.headerWrap}>
          <div style={styles.brand}>T.O.B</div>
          <div style={styles.title}>Welcome Back</div>
          <div style={styles.subtitle}>
            Sign in to access your resignation management system
          </div>
        </div>

        <form onSubmit={onSubmit} style={styles.form}>
          <label style={styles.label}>Email Address</label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon} aria-hidden>{mailIcon}</span>
            <input
              type="email"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          {fieldErrors?.username ? (
            <div style={styles.fieldError}>{String(fieldErrors.username)}</div>
          ) : null}

          <label style={{ ...styles.label, marginTop: 14 }}>Password</label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon} aria-hidden>{lockIcon}</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={styles.eyeBtn}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? eyeOffIcon : eyeIcon}
            </button>
          </div>
          {fieldErrors?.password ? (
            <div style={styles.fieldError}>{String(fieldErrors.password)}</div>
          ) : null}

          <button type="submit" style={styles.signInBtn} disabled={loading}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={styles.btnIcon} aria-hidden>{arrowRightIcon}</span>
              {loading ? 'Signing In...' : 'Sign In'}
            </span>
          </button>
        </form>
        {error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : null}
      </div>
    </div>
  );
}

// Simple inline SVG icons to avoid extra dependencies
const mailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

const lockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const eyeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const eyeOffIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.8 21.8 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const arrowRightIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const styles = {
  pageWrap: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    padding: 16,
  },
  gradientBg: {
    position: 'absolute',
    inset: 0,
    // Add a base (non-transparent) background to avoid showing white
    background:
      'radial-gradient(1200px 400px at -10% 60%, rgba(255,127,80,0.18), transparent 60%), ' +
      'radial-gradient(900px 400px at 110% -10%, rgba(255,165,0,0.18), transparent 60%), ' +
      'linear-gradient(180deg, #FFF5EC 0%, #FFE7D3 55%, #FFF5EC 100%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 520,
    background: '#fff',
    borderRadius: 16,
    boxShadow:
      '0 2px 6px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.08)',
    padding: 32,
  },
  headerWrap: { textAlign: 'center', marginBottom: 16 },
  brand: { color: '#ff6a00', fontWeight: 800, fontSize: 28, letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 26, fontWeight: 700, color: '#1f2937' },
  subtitle: { color: '#6b7280', marginTop: 6 },
  form: { marginTop: 18 },
  label: { display: 'block', fontSize: 14, color: '#374151', marginBottom: 6, fontWeight: 600 },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid #e5e7eb',
    background: '#f3f4f6',
    borderRadius: 8,
    padding: '10px 12px',
  },
  inputIcon: { display: 'inline-flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  input: {
    border: 'none',
    outline: 'none',
    flex: 1,
    background: 'transparent',
    color: '#111827',
    fontSize: 14,
  },
  eyeBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
  },
  signInBtn: {
    width: '100%',
    marginTop: 18,
    border: 'none',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#fff',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #ff6a00, #ff3d00)',
    boxShadow: '0 8px 20px rgba(255, 107, 0, 0.35)',
    cursor: 'pointer',
  },
  btnIcon: { display: 'inline-flex', transform: 'translateY(1px)' },
  demoWrap: { marginTop: 22 },
  demoLabel: { textAlign: 'center', color: '#6b7280', fontSize: 13, marginBottom: 8 },
  credBox: {
    borderRadius: 8,
    background: '#f3f4f6',
    color: '#374151',
    padding: 12,
    lineHeight: 1.6,
  },
  errorBox: {
    marginTop: 16,
    color: '#b91c1c',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
  },
  fieldError: {
    color: '#b91c1c',
    marginTop: 6,
    fontSize: 12,
  },
};

