import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PiHouse, PiUserMinus, PiCheckSquare } from 'react-icons/pi';

export default function Sidebar() {
  const { pathname } = useLocation();
  const role = (typeof window !== 'undefined' && window.localStorage)
    ? localStorage.getItem('user_role')
    : null;
  const nav = [
    { label: 'My Page', to: '/my-page', icon: <PiHouse size={20} /> },
    { label: 'Request Leave', to: '/resignation', icon: <PiUserMinus size={20} /> },
    ...(role === 'ADMIN'
      ? [{ label: 'Leave Management', to: '/approval-management', icon: <PiCheckSquare size={20} /> }]
      : []),
  ];

  return (
    <aside style={styles.aside}>
      <div style={styles.brand}>T.O.B</div>
      <nav>
        {nav.map((n) => {
          const active = pathname === n.to || (n.to !== '/' && pathname.startsWith(n.to));
          return (
            <Link key={n.label} to={n.to} style={{ ...styles.item, ...(active ? styles.itemActive : {}) }}>
              <span style={{ ...styles.itemIcon, color: active ? '#fff' : '#c9d2dc' }}>{n.icon}</span>
              <span style={{ ...styles.itemLabel, color: active ? '#fff' : '#e5e7eb' }}>{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={styles.bottomStub} />
    </aside>
  );
}

const styles = {
  aside: {
    minHeight: '100vh',
    width: 240,
    background: '#0f2239',
    color: '#e5e7eb',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  brand: { color: '#ff6a00', fontWeight: 800, fontSize: 30, letterSpacing: 2, padding: '8px 12px', marginBottom: 16 },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '0 16px',
    height: 48,
    borderRadius: 8,
    color: '#e5e7eb',
    textDecoration: 'none',
  },
  itemActive: { background: '#ff6a00' },
  itemIcon: { display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: 15, lineHeight: '22px', flex: 1 },
  bottomStub: { marginTop: 'auto' },
};

