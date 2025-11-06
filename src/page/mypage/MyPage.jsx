import React, { useState, useEffect } from 'react';
import MainLayout from '../../layout/MainLayout.jsx';

export default function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('auth_token');
      const employeeId = localStorage.getItem('employee_id');
      const userRole = localStorage.getItem('user_role');
      
      if (!employeeId) {
        console.error('No employee ID found in localStorage');
        setError('Employee ID not found. Please login again.');
        setLoading(false);
        return;
      }
      
      const res = await fetch(`http://localhost:8080/api/auth/userinfo?employeeId=${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const response = await res.json();
        const data = response.data;
        
        // Handle admin vs employee display
        const isAdmin = userRole === 'ADMIN';
        const position = data.position || (isAdmin ? 'Admin' : 'N/A');
        const department = data.department || (isAdmin ? 'Administration' : 'N/A');
        
        setUserInfo({
          fullName: data.fullName || 'N/A',
          title: position,
          employeeId: data.employeeIdCode || 'N/A',
          email: data.username || 'N/A',
          department: department,
          position: position,
        });
      } else {
        console.error('Failed to fetch user info:', res.status);
        setError('Failed to load user information. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('An error occurred while loading user information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <MainLayout title="Welcome!" breadcrumb={[]}> 
      {loading ? (
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading user information...
          </div>
        </div>
      ) : error ? (
        <div style={styles.card}>
          <div style={styles.errorBox}>
            {error}
          </div>
          <button onClick={fetchUserInfo} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      ) : userInfo ? (
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <div style={styles.avatarWrap}>
              <div style={styles.avatarIcon}>{userIcon}</div>
            </div>
            <div>
              <div style={styles.name}>{userInfo.fullName}</div>
              <div style={styles.subtitle}>{userInfo.title}</div>
            </div>
          </div>

          <hr style={styles.hr} />

          <div style={styles.sectionTitle}>Basic Information</div>

          <div style={styles.infoGrid}>
            <div style={styles.infoCol}>
              <InfoItem icon={personIcon} label="Full Name" value={userInfo.fullName} />
              <InfoItem icon={idIcon} label="User ID" value={userInfo.employeeId} />
              <InfoItem icon={mailIcon} label="Email" value={userInfo.email} />
            </div>
            <div style={{ ...styles.infoCol, ...styles.infoColRight }}>
              <InfoItem icon={deptIcon} label="Department" value={userInfo.department} />
              <InfoItem icon={wrenchIcon} label="Position" value={userInfo.position} />
            </div>
          </div>
        </div>
      ) : null}
    </MainLayout>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={styles.itemRow}>
      <div style={styles.iconBadge}><span style={styles.iconBadgeInner}>{icon}</span></div>
      <div>
        <div style={styles.itemLabel}>{label}</div>
        <div style={styles.itemValue}>{value}</div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
  },
  headerRow: { display: 'flex', alignItems: 'center', gap: 16 },
  avatarWrap: {
    width: 64, height: 64, borderRadius: '50%', background: '#fff7ed',
    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fde68a'
  },
  avatarIcon: { color: '#fb923c' },
  name: { fontSize: 18, fontWeight: 'normal', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 4 },
  hr: { border: 0, borderTop: '1px solid #e5e7eb', margin: '16px 0' },
  sectionTitle: { fontWeight: 700, color: '#111827', marginBottom: 12 },
  infoGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
    border: '1px solid #eef2f7', borderRadius: 10, overflow: 'hidden'
  },
  infoCol: { padding: 16, display: 'grid', gap: 26 },
  infoColRight: { borderLeft: '1px solid #eef2f7' },
  itemRow: { display: 'flex', alignItems: 'center', gap: 18 },
  iconBadge: {
    width: 36, height: 36, borderRadius: 8, background: '#fff7ed',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fb923c',
    border: '1px solid #fde68a'
  },
  iconBadgeInner: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 },
  itemLabel: { color: '#6b7280', fontSize: 12 },
  itemValue: { color: '#111827', fontWeight: 'normal' },
  errorBox: {
    marginTop: 16,
    color: '#b91c1c',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
  },
  retryBtn: {
    marginTop: 16,
    background: '#ff6a00',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(255, 106, 0, 0.2)',
  },
};

const userIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21a8 8 0 1 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Person outline icon for "Full Name"
const personIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21a8 8 0 1 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const idIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="7" y1="8" x2="11" y2="8" />
    <line x1="7" y1="12" x2="11" y2="12" />
  </svg>
);

const badgeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.7 5.47 6.03.88-4.36 4.25 1.03 6.01L12 16.9 6.6 19.6l1.03-6.01L3.27 9.35l6.03-.88L12 3z" />
  </svg>
);

const mailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const deptIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22h18" />
    <path d="M6 18V6h12v12" />
    <path d="M9 10h6" />
  </svg>
);

const calendarIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const phoneIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92V21a1 1 0 0 1-1.09 1A19.86 19.86 0 0 1 3 5.09 1 1 0 0 1 4 4h4.09a1 1 0 0 1 1 .75l1 3a1 1 0 0 1-.27 1L8.91 10.09a16 16 0 0 0 5 5l1.34-1.34a1 1 0 0 1 1-.27l3 1a1 1 0 0 1 .75 1z" />
  </svg>
);

// Diagonal pushpin icon for "Position"
const wrenchIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <g transform="rotate(45 12 12)">
      <path d="M12 17v5" />
      <path d="M5 3 L19 3 L12 10 L12 17" />
    </g>
  </svg>
);
