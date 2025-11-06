import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../layout/MainLayout.jsx';

function formatDate(d) {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

const REASONS = [
  'Personal reasons',
  'Career advancement',
  'Relocation',
  'Higher education',
  'Health reasons',
  'Other',
];

export default function Resignation() {
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [totalAllowance] = useState(12);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [notify, setNotify] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const reqKey = 'employee_requests';
    const hisKey = 'employee_history';
    const storedReq = JSON.parse(localStorage.getItem(reqKey) || '[]');
    const storedHis = JSON.parse(localStorage.getItem(hisKey) || '[]');
    if (storedReq.length === 0 && storedHis.length === 0) {
      const seedReq = [
        { id: 1, createdAt: new Date(), start: new Date(), end: new Date(), reason: 'Personal reasons', status: 'pending' },
        { id: 2, createdAt: new Date(), start: new Date(), end: new Date(), reason: 'Personal reasons', status: 'pending' },
      ];
      const seedHis = [
        { id: 11, createdAt: new Date('2025-10-24T08:30:00'), start: new Date('2025-10-24'), end: new Date('2025-10-25'), reason: 'Personal reasons', approvedBy: 'Van TD' },
        { id: 12, createdAt: new Date('2025-10-08T06:52:00'), start: new Date('2025-10-08'), end: new Date('2025-10-09'), reason: 'Health reasons', approvedBy: 'Van TD' },
      ];
      localStorage.setItem(reqKey, JSON.stringify(seedReq));
      localStorage.setItem(hisKey, JSON.stringify(seedHis));
      setRequests(seedReq);
      setHistory(seedHis);
    } else {
      setRequests(storedReq.map(deser));
      setHistory(storedHis.map(deser));
    }

    const onReq = () => setRequests(JSON.parse(localStorage.getItem(reqKey) || '[]').map(deser));
    const onHis = () => setHistory(JSON.parse(localStorage.getItem(hisKey) || '[]').map(deser));
    window.addEventListener('employee_requests_updated', onReq);
    window.addEventListener('employee_history_updated', onHis);
    window.addEventListener('storage', (e) => {
      if (e.key === reqKey) onReq();
      if (e.key === hisKey) onHis();
    });
  }, []);

  const usedDays = useMemo(() => {
    const all = [
      ...history.map(h => ({ start: new Date(h.start), end: new Date(h.end) })),
      ...requests.filter(r => r.status === 'pending').map(r => ({ start: new Date(r.start), end: new Date(r.end) })),
    ];
    return all.reduce((sum, r) => sum + diffDays(r.start, r.end), 0);
  }, [history, requests]);

  const remain = Math.max(0, totalAllowance - usedDays);

  const pageSize = 2;
  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const pageData = requests.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  return (
    <MainLayout title="Resignation" breadcrumb={["Request Leave"]}>
      <div style={styles.toolbarRow}>
        <div style={styles.totalCard}>
          <div>Total day off: <strong>{String(usedDays).padStart(2, '0')}</strong> days / <strong>{totalAllowance}</strong> days</div>
        </div>
        <button
          onClick={() => remain > 0 && setModalOpen(true)}
          disabled={remain <= 0}
          style={{
            ...styles.requestBtn,
            ...(remain <= 0 ? { background:'#9ca3af', cursor:'not-allowed' } : {}),
          }}
          title={remain <= 0 ? 'You have no remaining leave days' : undefined}
        >
          + Request Leave
        </button>
      </div>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>Leave Request</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Date of Request</th>
              <th style={styles.th}>Start Date</th>
              <th style={styles.th}>End Date</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r, idx) => (
              <tr key={r.id}>
                <td style={styles.td}>{(page - 1) * pageSize + idx + 1}</td>
                <td style={styles.td}>{formatDate(r.createdAt)}</td>
                <td style={styles.td}>{formatDate(r.start)}</td>
                <td style={styles.td}>{formatDate(r.end)}</td>
                <td style={styles.td}>{r.reason}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(r.status==='pending' ? { background:'#fef9c3', color:'#3f3f46' } :
                         r.status==='approved' ? { background:'#dcfce7', color:'#065f46' } :
                         { background:'#fee2e2', color:'#991b1b' }),
                    }}
                  >
                    {capitalize(r.status)}
                  </span>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr><td colSpan={6} style={{...styles.td, textAlign:'center'}}>No requests</td></tr>
            )}
          </tbody>
        </table>
        <div style={styles.pagination}>
          <button style={styles.pageBtn} disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Previous</button>
          {Array.from({length: totalPages}).map((_,i)=> (
            <button key={i} style={{...styles.pageNumber, ...(page===i+1?styles.pageNumberActive:{})}} onClick={()=>setPage(i+1)}>{i+1}</button>
          ))}
          <button style={styles.pageBtn} disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>Leave History</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Date of Request</th>
              <th style={styles.th}>Start Date</th>
              <th style={styles.th}>End Date</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Approved By</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r, idx) => (
              <tr key={r.id}>
                <td style={styles.td}>{idx + 1}</td>
                <td style={styles.td}>{formatDate(r.createdAt)}</td>
                <td style={styles.td}>{formatDate(r.start)}</td>
                <td style={styles.td}>{formatDate(r.end)}</td>
                <td style={styles.td}>{r.reason}</td>
                <td style={styles.td}>{r.approvedBy}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan={6} style={{...styles.td, textAlign:'center'}}>No history</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {modalOpen && (
        <LeaveModal
          remain={remain}
          onClose={()=>setModalOpen(false)}
          onSubmit={(payload)=>{
            const id = Math.max(0, ...requests.map(r=>r.id)) + 1;
            const newReq = { id, createdAt: new Date(), start: new Date(payload.from), end: new Date(payload.to), reason: payload.reason==='Other'? payload.details : payload.reason, status: 'pending' };
            // Update local state
            setRequests(prev => { const next = [ newReq, ...prev]; localStorage.setItem('employee_requests', JSON.stringify(next)); return next; });
            // Notify employee requests update
            window.dispatchEvent(new Event('employee_requests_updated'));
            // Save also into manager's pending approvals
            try {
              const key = 'pending_approvals';
              const list = JSON.parse(localStorage.getItem(key) || '[]');
              const entry = { ...ser(newReq), requester: 'A Nguyen Van' };
              const updated = [entry, ...list];
              localStorage.setItem(key, JSON.stringify(updated));
              window.dispatchEvent(new CustomEvent('pending_approvals_updated', { detail: updated }));
            } catch {}
            setPage(1);
            setModalOpen(false);
            setNotify('You have successfully submitted');
          }}
        />
      )}
      {notify && (
        <NotifyDialog message={notify} onClose={()=>setNotify(null)} />
      )}
    </MainLayout>
  );
}

function LeaveModal({ remain, onClose, onSubmit }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const days = useMemo(() => {
    if (!from || !to) return 0;
    return diffDays(new Date(from), new Date(to));
  }, [from, to]);

  const exceeded = days > remain && from && to;
  const invalidOther = reason === 'Other' && details.trim().length === 0;
  const canSubmit = from && to && reason && !exceeded && !invalidOther;

  const onChangeFrom = (v) => {
    setFrom(v);
    if (to) {
      const df = new Date(v);
      const dt = new Date(to);
      if (df > dt) {
        // normalize by moving 'to' to match 'from'
        setTo(v);
      }
    }
  };

  const onChangeTo = (v) => {
    setTo(v);
    if (from) {
      const df = new Date(from);
      const dt = new Date(v);
      if (dt < df) {
        // normalize by moving 'from' to match 'to'
        setFrom(v);
      }
    }
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalCard}>
        <div style={styles.modalTitle}>Resignation Request</div>
        <div style={styles.modalBody}>
          <div style={styles.fieldsetTitle}>Select Leave Day</div>
          <div style={styles.fieldRow}> 
            <div style={styles.field}> 
              <label style={styles.label}>From Date <span style={{color:'#ef4444'}}>*</span></label>
              <input style={styles.input} type="date" value={from} onChange={e=>onChangeFrom(e.target.value)} />
            </div>
            <div style={styles.spacer} />
            <div style={styles.field}> 
              <label style={styles.label}>To Date <span style={{color:'#ef4444'}}>*</span></label>
              <input style={styles.input} type="date" value={to} onChange={e=>onChangeTo(e.target.value)} />
            </div>
          </div>
          {from && to && !exceeded && (
            <div style={{ color:'#6b7280', fontSize:12, marginTop:6 }}>{days} day(s) selected</div>
          )}
          {exceeded && <div style={styles.errorText}>* Leave days exceeded</div>}

          <div style={styles.fieldsetTitle}>Resignation Details</div>
          <div style={styles.field}> 
            <label style={styles.label}>Reason for Resignation <span style={{color:'#ef4444'}}>*</span></label>
            <div style={styles.selectWrap}>
              <select style={styles.select} value={reason} onChange={e=>setReason(e.target.value)}>
                <option value="" disabled>Select reason</option>
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Additional Details</label>
            <textarea style={styles.textarea} placeholder="Please provide additional details about your resignation..." value={details} onChange={e=>setDetails(e.target.value)} />
            {invalidOther && <div style={styles.errorText}>* Please provide details for Other</div>}
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.btnGhost} onClick={onClose}>Cancel</button>
          <button style={{...styles.btnPrimary, opacity: canSubmit?1:0.5, cursor: canSubmit?'pointer':'not-allowed'}} disabled={!canSubmit} onClick={()=>onSubmit({ from, to, reason, details })}>Submit Request</button>
        </div>
      </div>
    </div>
  );
}

function NotifyDialog({ message, onClose }){
  React.useEffect(() => {
    const t = setTimeout(() => onClose?.(), 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={styles.modalBackdrop}>
      <div style={{ ...styles.notifyCard }}>
        <div style={styles.notifyHeader}>
          <div style={styles.notifyTitle}>NOTIFY</div>
          <button onClick={onClose} style={styles.notifyCloseBtn}>×</button>
        </div>
        <div style={styles.notifyBodyCenter}>{message}</div>
      </div>
    </div>
  );
}

function diffDays(a, b) {
  const start = new Date(a);
  const end = new Date(b);
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / (1000*60*60*24)) + 1;
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

// serialize/deserialize dates for localStorage
function ser(obj){
  return { ...obj, createdAt: new Date(obj.createdAt).toISOString(), start: new Date(obj.start).toISOString(), end: new Date(obj.end).toISOString() };
}
function deser(obj){
  return { ...obj, createdAt: new Date(obj.createdAt), start: new Date(obj.start), end: new Date(obj.end) };
}

const styles = {
  toolbarRow: { display:'flex', alignItems:'center', gap:16 },
  totalCard: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'14px 16px', color:'#0f172a', flex:1 },
  requestBtn: { background:'#ff6a00', border:'none', color:'#fff', padding:'10px 14px', borderRadius:8, cursor:'pointer', fontWeight:600 },
  section: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, marginTop:16 },
  sectionHeader: { padding:'12px 16px', borderBottom:'1px solid #e5e7eb', fontWeight:700 },
  table: { width:'100%', borderCollapse:'separate', borderSpacing:0 },
  th: { textAlign:'left', padding:'10px 12px', color:'#6b7280', borderBottom:'1px solid #eef2f7', fontWeight:600 },
  td: { padding:'10px 12px', borderBottom:'1px solid #f3f4f6', color:'#111827' },
  badge: { padding:'4px 10px', borderRadius:999, display:'inline-block', fontSize:12 },
  pagination: { display:'flex', alignItems:'center', gap:8, padding:12, justifyContent:'flex-end' },
  pageBtn: { padding:'6px 10px', border:'1px solid #e5e7eb', background:'#fff', borderRadius:8, cursor:'pointer' },
  pageNumber: { padding:'6px 10px', border:'1px solid #e5e7eb', background:'#fff', borderRadius:8, cursor:'pointer' },
  pageNumberActive: { background:'#0f172a', color:'#fff', borderColor:'#0f172a' },
  modalBackdrop: { position:'fixed', inset:0, background:'rgba(15,34,57,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 },
  modalCard: { width:560, background:'#fff', borderRadius:12, boxShadow:'0 10px 30px rgba(0,0,0,0.2)', overflow:'hidden' },
  modalTitle: { padding:'16px 20px', fontSize:18, fontWeight:800, borderBottom:'1px solid #eef2f7' },
  modalBody: { padding:'16px 20px' },
  fieldsetTitle: { marginTop:4, marginBottom:8, fontWeight:700, color:'#111827' },
  fieldRow: { display:'flex', gap:16 },
  field: { display:'flex', flexDirection:'column', flex:1 },
  label: { fontSize:14, color:'#111827', marginBottom:6 },
  input: { height:38, border:'1px solid #e5e7eb', borderRadius:8, padding:'0 10px' },
  selectWrap: { position:'relative' },
  select: { height:38, width:'100%', border:'1px solid #e5e7eb', borderRadius:8, padding:'0 10px', background:'#fff' },
  textarea: { minHeight:76, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', resize:'vertical' },
  errorText: { color:'#ef4444', marginTop:6, fontSize:12 },
  spacer: { width:8 },
  modalFooter: { display:'flex', justifyContent:'flex-end', gap:10, padding:'12px 16px', borderTop:'1px solid #eef2f7' },
  btnGhost: { border:'1px solid #e5e7eb', background:'#fff', borderRadius:8, padding:'8px 12px', cursor:'pointer' },
  btnPrimary: { border:'none', background:'#ff6a00', color:'#fff', borderRadius:8, padding:'8px 12px', cursor:'pointer', fontWeight:700 },
  notifyCard: { width:380, background:'#fff', borderRadius:14, boxShadow:'0 16px 40px rgba(0,0,0,0.25)', overflow:'hidden' },
  notifyHeader: { position:'relative', display:'flex', alignItems:'center', justifyContent:'center', padding:'14px 16px', background:'#12243a', color:'#fff' },
  notifyTitle: { fontWeight:800, letterSpacing:1, fontSize:20, color:'#ff7a18' },
  notifyCloseBtn: { position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', color:'#d1d5db', fontSize:18, cursor:'pointer' },
  notifyBodyCenter: { padding:'20px 16px', color:'#111827', textAlign:'center', fontWeight:600, fontSize:18 },
};
