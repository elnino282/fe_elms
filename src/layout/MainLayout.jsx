import React from 'react';
import Sidebar from '../shared/Sidebar.jsx';
import Topbar from '../shared/Topbar.jsx';

export default function MainLayout({ title, children, breadcrumb = [] }) {
  return (
    <div style={styles.appWrap}>
      <Sidebar />
      <div style={styles.mainCol}>
        <Topbar title={title} />
        <div style={styles.contentWrap}>
          {breadcrumb.length > 0 && (
            <div style={styles.breadcrumb}>
              {breadcrumb.map((b, i, arr) => (
                <React.Fragment key={`${b}-${i}`}>
                  <span style={styles.bcText}>{b}</span>
                  {i < arr.length - 1 && <span aria-hidden style={styles.bcSep}>›</span>}
                </React.Fragment>
              ))}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  appWrap: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f5f7fb',
  },
  mainCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  contentWrap: {
    padding: '16px 24px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: '6px 0 6px',
  },
  bcText: { color: '#6b7280', fontSize: 14, lineHeight: '20px' },
  bcSep: { margin: '0 8px', color: '#cbd5e1', fontSize: 14, lineHeight: '20px' },
  pageTitle: { margin: '10px 0 16px', color: '#111827', fontSize: 28, fontWeight: 800 },
};
