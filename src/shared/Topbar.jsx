import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      localStorage.removeItem('auth_token');
    } catch {}
    navigate('/login', { replace: true });
  };
  return (
    <header style={styles.header}>
      <div style={styles.title}>{title}</div>
      <div style={styles.rightWrap}>
        <div style={styles.userPill}>
          <div style={styles.avatar}>A</div>
          <div style={styles.userName}>A Nguyen Van</div>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <span style={styles.iconInner}>{logoutIcon}</span>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 64,
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px 0 20px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  title: { color: '#111827', fontSize: 18, fontWeight: 400 },
  rightWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  iconBtn: {
    border: '1px solid #e5e7eb',
    background: '#fff',
    borderRadius: 8,
    width: 36,
    height: 36,
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6b7280',
  },
  iconInner: { display: 'inline-flex', lineHeight: 0 },
  userPill: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f3f4f6',
    borderRadius: 999,
    padding: '6px 10px',
  },
  avatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#e5e7eb', color: '#111827',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700,
  },
  userName: { color: '#374151', fontSize: 14, fontWeight: 600 },
  logoutBtn: {
    border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 36,
  },
};

const bellIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const logoutIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);
