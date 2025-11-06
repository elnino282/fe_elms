import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../layout/MainLayout.jsx';

export default function ApprovalManagement() {
  const [viewItem, setViewItem] = useState(null);
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [denied, setDenied] = useState([]);

  const PENDING_KEY = 'pending_approvals';
  const EMP_REQ_KEY = 'employee_requests';
  const EMP_HIS_KEY = 'employee_history';

  const loadPending = () => {
    const list = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    // transform to table shape while preserving raw
    const rows = list.map((raw) => ({
      id: raw.id,
      name: raw.requester || '-',
      position: '-',
      department: '-',
      submittedAt: formatDateTime(raw.createdAt),
      daysTaken: `${String(diffDays(new Date(raw.start), new Date(raw.end))).padStart(2,'0')}/12 days`,
      raw,
    }));
    setPending(rows);
  };

  useEffect(() => {
    loadPending();
    const onCustom = (e) => loadPending();
    const onStorage = (e) => { if (e.key === PENDING_KEY) loadPending(); };
    window.addEventListener('pending_approvals_updated', onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('pending_approvals_updated', onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const acceptItem = (item) => {
    // remove from pending storage
    const list = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    const updatedPending = list.filter((p) => p.id !== item.id);
    localStorage.setItem(PENDING_KEY, JSON.stringify(updatedPending));
    setPending((prev) => prev.filter((p) => p.id !== item.id));
    setAccepted((prev) => [{ ...item }, ...prev]);

    // update employee requests -> status approved
    const req = JSON.parse(localStorage.getItem(EMP_REQ_KEY) || '[]');
    const reqUpdated = req.map((r) => (r.id === item.id ? { ...r, status: 'approved' } : r));
    localStorage.setItem(EMP_REQ_KEY, JSON.stringify(reqUpdated));
    window.dispatchEvent(new Event('employee_requests_updated'));

    // append to employee history
    const raw = item.raw || {};
    const history = JSON.parse(localStorage.getItem(EMP_HIS_KEY) || '[]');
    const hisEntry = { id: Date.now(), createdAt: new Date().toISOString(), start: raw.start, end: raw.end, reason: raw.reason, approvedBy: 'Manager' };
    const hisUpdated = [hisEntry, ...history];
    localStorage.setItem(EMP_HIS_KEY, JSON.stringify(hisUpdated));
    window.dispatchEvent(new Event('employee_history_updated'));
  };

  const denyItem = (item) => {
    // remove from pending storage
    const list = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    const updatedPending = list.filter((p) => p.id !== item.id);
    localStorage.setItem(PENDING_KEY, JSON.stringify(updatedPending));
    setPending((prev) => prev.filter((p) => p.id !== item.id));
    setDenied((prev) => [{ ...item }, ...prev]);

    // update employee requests -> status denied (not added to history)
    const req = JSON.parse(localStorage.getItem(EMP_REQ_KEY) || '[]');
    const reqUpdated = req.map((r) => (r.id === item.id ? { ...r, status: 'denied' } : r));
    localStorage.setItem(EMP_REQ_KEY, JSON.stringify(reqUpdated));
    window.dispatchEvent(new Event('employee_requests_updated'));
  };

  return (
    <MainLayout title="Approval Management" breadcrumb={[]}> 
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>Pending Approval Requests</div>
        <div style={styles.tableWrap}>
          <Table
            data={pending}
            showActions
            onView={(row) => setViewItem(row)}
            onAccept={acceptItem}
            onDeny={denyItem}
            emptyText="No pending requests found"
          />
        </div>
      </div>

      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>Accepted Requests</div>
        <div style={styles.tableWrap}>
          <Table data={accepted} emptyText="No accepted requests found" onView={(row) => setViewItem(row)} />
        </div>
      </div>

      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>Denied Requests</div>
        <div style={styles.tableWrap}>
          <Table data={denied} emptyText="No resignation requests found" onView={(row) => setViewItem(row)} />
        </div>
      </div>

      {viewItem && (
        <DetailsModal item={viewItem} onClose={() => setViewItem(null)} />
      )}
    </MainLayout>
  );
}

function diffDays(a, b) {
  const start = new Date(a); const end = new Date(b);
  start.setHours(0,0,0,0); end.setHours(0,0,0,0);
  const ms = end - start; if (ms < 0) return 0;
  return Math.floor(ms / (1000*60*60*24)) + 1;
}

function formatDateTime(dt){
  const d = new Date(dt);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2,'0');
  const mi = String(d.getMinutes()).padStart(2,'0');
  return `${dd}/${mm}/${yy} - ${hh}:${mi}`;
}

function Table({ data, showActions = false, emptyText, onView = () => {}, onAccept = () => {}, onDeny = () => {} }) {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);

  const goto = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div style={styles.tableCard}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, ...styles.thIndex }}></th>
            <th style={{ ...styles.th, ...styles.thName }}>Employee Name</th>
            <th style={{ ...styles.th, ...styles.thPosition }}>Position</th>
            <th style={{ ...styles.th, ...styles.thDept }}>Department</th>
            <th style={{ ...styles.th, ...styles.thDate }}>Date of Request</th>
            <th style={{ ...styles.th, ...styles.thDays }}>Total Days Taken</th>
            <th style={{ ...styles.th, ...styles.thDetail }}>Detail</th>
            {showActions && <th style={{ ...styles.th, ...styles.thActions }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 8 : 7} style={styles.emptyCell}>{emptyText}</td>
            </tr>
          ) : (
            pageData.map((row, idx) => (
              <tr key={row.id}>
                <td style={{ ...styles.tdMuted, ...styles.tdIndex }}>{start + idx + 1}</td>
                <td style={{ ...styles.td, ...styles.tdName }}><span style={styles.nowrap}>{row.name}</span></td>
                <td style={{ ...styles.td, ...styles.tdPosition }}><span style={styles.nowrap}>{row.position}</span></td>
                <td style={{ ...styles.td, ...styles.tdDept }}><span style={styles.nowrap}>{row.department}</span></td>
                <td style={{ ...styles.td, ...styles.tdDate }}><span style={styles.nowrap}>{row.submittedAt}</span></td>
                <td style={{ ...styles.td, ...styles.tdDays }}><span style={styles.nowrap}>{row.daysTaken}</span></td>
                <td style={{ ...styles.td, ...styles.tdDetail }}>
                  <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => onView(row)}>
                    <span style={styles.btnIcon}>{docIcon}</span>
                    View
                  </button>
                </td>
                {showActions && (
                  <td style={{ ...styles.td, ...styles.nowrap, ...styles.tdActions }}>
                    <div style={styles.actionRow}>
                      <button style={{ ...styles.btn, ...styles.btnSuccess }} onClick={() => onAccept(row)}>
                        <span style={styles.btnIcon}>{checkIcon}</span>
                        Accept
                      </button>
                      <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={() => onDeny(row)}>
                        <span style={styles.btnIcon}>{xIcon}</span>
                        Deny
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {data.length > 0 && (
        <div style={styles.paginationWrap}>
          <button
            style={{ ...styles.pageBtn, ...(safePage === 1 ? styles.pageBtnDisabled : {}) }}
            onClick={() => goto(safePage - 1)}
            disabled={safePage === 1}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              style={{
                ...styles.pageNum,
                ...(p === safePage ? styles.pageNumActive : {}),
              }}
              onClick={() => goto(p)}
            >
              {p}
            </button>
          ))}

          <button
            style={{ ...styles.pageBtn, ...(safePage === totalPages ? styles.pageBtnDisabled : {}) }}
            onClick={() => goto(safePage + 1)}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function DetailsModal({ item, onClose }) {
  const initial = (item?.name || '?').trim().charAt(0).toUpperCase();
  return (
    <div style={styles.modalOverlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>Resignation Request Details</div>
        </div>

        <div style={styles.modalSectionTitle}>Basic Information</div>
        <hr style={styles.hr} />
        <div style={styles.inputRow}>
          <div style={styles.inputCol}>
            <div style={styles.label}>Employee Name</div>
            <input style={styles.inputDisabled} disabled value={item?.name || ''} />
          </div>
          <div style={styles.inputCol}>
            <div style={styles.label}>Current Position</div>
            <input style={styles.inputDisabled} disabled value={item?.position || ''} />
          </div>
        </div>

        <div style={styles.modalSectionTitle}>Leave date</div>
        <hr style={styles.hr} />
        <div style={styles.inputRow}>
          <div style={styles.inputCol}>
            <div style={styles.label}>From Date</div>
            <input style={styles.inputDisabled} disabled value={item?.submittedAt || ''} />
          </div>
          <div style={styles.inputCol}>
            <div style={styles.label}>To Date</div>
            <input style={styles.inputDisabled} disabled value={item?.daysTaken || ''} />
          </div>
        </div>

        <div style={styles.modalSectionTitle}>Resignation Details</div>
        <hr style={styles.hr} />
        <div style={styles.inputCol}>
          <div style={styles.label}>Reason for Resignation</div>
          <textarea style={{ ...styles.inputDisabled, ...styles.textarea }} disabled placeholder="" value={''} />
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.modalCloseBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sectionCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  sectionHeader: { fontWeight: 700, color: '#111827', marginBottom: 12 },
  tableWrap: { overflowX: 'auto' },
  tableCard: {
    border: '1px solid #eef2f7',
    borderRadius: 10,
    overflow: 'hidden',
    background: '#fff',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#f9fafb',
    color: '#6b7280',
    borderBottom: '1px solid #eef2f7',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    wordBreak: 'keep-all',
    overflowWrap: 'normal',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #f1f5f9',
    color: '#111827',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    wordBreak: 'normal',
    overflowWrap: 'normal',
  },
  tdMuted: {
    padding: '12px 14px',
    borderBottom: '1px solid #f1f5f9',
    color: '#6b7280',
    width: 48,
  },
  emptyCell: {
    padding: 24,
    textAlign: 'center',
    color: '#9ca3af',
  },
  actionRow: { display: 'inline-flex', gap: 6, whiteSpace: 'nowrap', flexWrap: 'nowrap' },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    padding: '0 8px',
    borderRadius: 6,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontSize: 12,
    lineHeight: 1,
  },
  btnIcon: { display: 'inline-flex', lineHeight: 0 },
  btnGhost: {
    background: '#fff',
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  btnSuccess: {
    background: '#22c55e',
    borderColor: '#16a34a',
    color: '#fff',
  },
  btnDanger: {
    background: '#ef4444',
    borderColor: '#dc2626',
    color: '#fff',
  },
  nowrap: {
    display: 'inline-block',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
  },
  thIndex: { width: 32 },
  thName: { minWidth: 0 },
  thPosition: { minWidth: 0 },
  thDept: { minWidth: 0 },
  thDate: { minWidth: 0 },
  thDays: { minWidth: 0 },
  thDetail: { minWidth: 0 },
  thActions: { minWidth: 0 },
  tdIndex: { width: 32 },
  tdName: { minWidth: 0 },
  tdPosition: { minWidth: 0 },
  tdDept: { minWidth: 0 },
  tdDate: { minWidth: 0 },
  tdDays: { minWidth: 0 },
  tdDetail: { minWidth: 0 },
  tdActions: { whiteSpace: 'nowrap' },
  paginationWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    justifyContent: 'flex-end',
    background: '#fff',
  },
  pageBtn: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
    fontSize: 12,
  },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  pageNum: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
    fontSize: 12,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumActive: {
    background: '#ff7a18',
    borderColor: '#ff7a18',
    color: '#fff',
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16, zIndex: 1000,
  },
  modal: {
    width: 'min(720px, 100%)', background: '#fff', borderRadius: 14,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: 20,
  },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 22, color: '#0f172a', fontWeight: 700 },
  modalAvatarWrap: { position: 'relative' },
  modalAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
  modalSectionTitle: { fontSize: 18, color: '#0f172a', fontWeight: 700, marginTop: 10 },
  hr: { border: 0, borderTop: '1px solid #e5e7eb', margin: '8px 0 12px' },
  label: { fontSize: 14, color: '#111827', marginBottom: 6 },
  inputRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  inputCol: { display: 'flex', flexDirection: 'column', marginBottom: 12 },
  inputDisabled: {
    background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 10,
    padding: '10px 12px', color: '#6b7280', fontSize: 14,
  },
  textarea: { minHeight: 88, resize: 'vertical' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: 12 },
  modalCloseBtn: {
    border: '1px solid #e5e7eb', background: '#fff', borderRadius: 10,
    padding: '10px 16px', cursor: 'pointer'
  },
};

const checkIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const xIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const docIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

