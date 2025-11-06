import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../layout/MainLayout.jsx';

function formatToDDMMYYYY(dateTimeStr) {
  if (!dateTimeStr) return '';
  const [datePart, timePart] = String(dateTimeStr).split(' - ');
  if (!datePart) return dateTimeStr;
  const parts = datePart.split('/');
  if (parts.length !== 3) return dateTimeStr;
  const [mm, dd, yyyy] = parts;
  const dd2 = String(dd).padStart(2, '0');
  const mm2 = String(mm).padStart(2, '0');
  return `${dd2}/${mm2}/${yyyy}${timePart ? ` - ${timePart}` : ''}`;
}

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let alive = true;
    const normalizeStatus = (s) => {
      const u = String(s || '').toUpperCase();
      if (u === 'APPROVED' || u === 'ACCEPTED') return 'APPROVED';
      if (u === 'REJECTED' || u === 'DENIED') return 'REJECTED';
      if (u === 'PENDING' || u === 'WAITING' || u === 'REQUESTED') return 'PENDING';
      return '';
    };

    const mapItem = (r) => ({
      id: r?.id ?? r?.requestId ?? r?.leaveId,
      name: r?.employeeName ?? r?.name ?? r?.fullName ?? '',
      position: r?.position ?? r?.jobTitle ?? '',
      department: r?.department ?? r?.departmentName ?? '',
      submittedAt: r?.dateOfRequest ?? r?.createdAt ?? '',
      daysTaken: r?.totalDaysTaken ?? (r?.totalDays != null ? `${r.totalDays} days` : ''),
      status: normalizeStatus(r?.status ?? r?.approvalStatus),
      reason: r?.reason ?? r?.note ?? '',
      startDate: r?.startDate ?? '',
      endDate: r?.endDate ?? '',
      createdAt: r?.createdAt ?? '',
      approvedByName: r?.approvedByName ?? r?.approverName ?? '',
      rejectionReason: r?.rejectionReason ?? r?.rejectReason ?? '',
    });

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = (typeof window !== 'undefined' && window.localStorage)
          ? localStorage.getItem('auth_token')
          : null;
        const res = await fetch('/api/leave-requests', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        let list = [];
        if (Array.isArray(json)) {
          list = json;
        } else if (json && Array.isArray(json.data)) {
          list = json.data;
        } else if (json && Array.isArray(json.content)) {
          list = json.content;
        } else if (json && Array.isArray(json.items)) {
          list = json.items;
        } else if (json && json.data && typeof json.data === 'object') {
          list = [json.data];
        } else if (json && typeof json === 'object') {
          // Assume single item object
          // Try to discover an array within the object first
          const firstArray = Object.values(json).find((v) => Array.isArray(v));
          if (firstArray) {
            list = firstArray;
          } else {
            list = [json];
          }
        }
        const mapped = list.map(mapItem);
        const p = mapped.filter((x) => String(x.status).toUpperCase() === 'PENDING');
        const a = mapped.filter((x) => String(x.status).toUpperCase() === 'APPROVED');
        const d = mapped.filter((x) => String(x.status).toUpperCase() === 'REJECTED');
        if (alive) {
          if (mapped.length > 0 && p.length + a.length + d.length === 0) {
            // Unknown statuses -> show in Pending by default
            setPending(mapped);
            setAccepted([]);
            setDenied([]);
          } else {
            setPending(p);
            setAccepted(a);
            setDenied(d);
          }
        }
      } catch (e) {
        if (alive) setError(e?.message || 'Failed to load');
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchData();
    return () => { alive = false; };
  }, []);

  const approveItem = async (item) => {
    const token = (typeof window !== 'undefined' && window.localStorage)
      ? localStorage.getItem('auth_token')
      : null;
    const adminId = (typeof window !== 'undefined' && window.localStorage)
      ? (localStorage.getItem('user_id') || '1')
      : '1';
    setError('');
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/leave-requests/${encodeURIComponent(item.id)}/approve?adminId=${encodeURIComponent(adminId)}` , {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // remove from pending storage
    const list = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    const updatedPending = list.filter((p) => p.id !== item.id);
    localStorage.setItem(PENDING_KEY, JSON.stringify(updatedPending));
    setPending((prev) => prev.filter((p) => p.id !== item.id));
      setAccepted((prev) => [...prev, { ...item, status: 'APPROVED' }]);
    } catch (e) {
      setError(e?.message || 'Approve failed');
    } finally {
      setBusyId(null);
    }
  };

  const rejectItem = async (item) => {
    const token = (typeof window !== 'undefined' && window.localStorage)
      ? localStorage.getItem('auth_token')
      : null;
    const adminId = (typeof window !== 'undefined' && window.localStorage)
      ? (localStorage.getItem('user_id') || '1')
      : '1';
    setError('');
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/leave-requests/${encodeURIComponent(item.id)}/reject?adminId=${encodeURIComponent(adminId)}` , {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // remove from pending storage
    const list = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    const updatedPending = list.filter((p) => p.id !== item.id);
    localStorage.setItem(PENDING_KEY, JSON.stringify(updatedPending));
    setPending((prev) => prev.filter((p) => p.id !== item.id));
      setDenied((prev) => [...prev, { ...item, status: 'REJECTED' }]);
    } catch (e) {
      setError(e?.message || 'Reject failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <MainLayout title="Approval Management" breadcrumb={[]}> 
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>Pending Approval Requests</div>
        <div style={styles.tableWrap}>
          {loading && (
            <div style={styles.emptyCell}>Loading...</div>
          )}
          {!!error && !loading && (
            <div style={{ ...styles.emptyCell, color: '#ef4444' }}>{error}</div>
          )}
          <Table
            data={pending}
            showActions
            onView={(row) => setViewItem(row)}
            onAccept={approveItem}
            onDeny={rejectItem}
            busyId={busyId}
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
  const pageSize = 2;
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
              <tr key={`${row.id}-${start + idx}`}>
                <td style={{ ...styles.tdMuted, ...styles.tdIndex }}>{start + idx + 1}</td>
                <td style={{ ...styles.td, ...styles.tdName }}><span style={styles.nowrap}>{row.name}</span></td>
                <td style={{ ...styles.td, ...styles.tdPosition }}><span style={styles.nowrap}>{row.position}</span></td>
                <td style={{ ...styles.td, ...styles.tdDept }}><span style={styles.nowrap}>{row.department}</span></td>
                <td style={{ ...styles.td, ...styles.tdDate }}><span style={styles.nowrap}>{formatToDDMMYYYY(row.submittedAt)}</span></td>
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
                      <button style={{ ...styles.btn, ...styles.btnSuccess, ...(busyId === row.id ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }} onClick={() => onAccept(row)} disabled={busyId === row.id}>
                        <span style={styles.btnIcon}>{checkIcon}</span>
                        {busyId === row.id ? 'Processing...' : 'Accept'}
                      </button>
                      <button style={{ ...styles.btn, ...styles.btnDanger, ...(busyId === row.id ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }} onClick={() => onDeny(row)} disabled={busyId === row.id}>
                        <span style={styles.btnIcon}>{xIcon}</span>
                        {busyId === row.id ? 'Processing...' : 'Deny'}
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

          <button
            style={{
              ...styles.pageNum,
              ...(safePage === 1 ? styles.pageNumActive : {}),
            }}
            onClick={() => goto(1)}
          >
            1
          </button>

          <button
            style={{
              ...styles.pageNum,
              ...(totalPages === 1 ? styles.pageNumDisabled : {}),
              ...(safePage === 2 && totalPages >= 2 ? styles.pageNumActive : {}),
            }}
            onClick={() => (totalPages >= 2 ? goto(2) : null)}
            disabled={totalPages === 1}
          >
            2
          </button>

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
            <input style={styles.inputDisabled} disabled value={formatToDDMMYYYY(item?.startDate || '')} />
          </div>
          <div style={styles.inputCol}>
            <div style={styles.label}>To Date</div>
            <input style={styles.inputDisabled} disabled value={formatToDDMMYYYY(item?.endDate || '')} />
          </div>
        </div>

        <div style={styles.modalSectionTitle}>Resignation Details</div>
        <hr style={styles.hr} />
        <div style={styles.inputCol}>
          <div style={styles.label}>Reason for Resignation</div>
          <textarea style={{ ...styles.inputDisabled, ...styles.textarea }} disabled placeholder="" value={item?.reason || ''} />
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
  pageNumDisabled: {
    background: '#e5e7eb',
    borderColor: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
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

