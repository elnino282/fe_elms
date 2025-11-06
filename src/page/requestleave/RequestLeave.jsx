import React, { useState, useEffect } from 'react';
import MainLayout from '../../layout/MainLayout.jsx';

export default function RequestLeave() {
  const [leaveBalance, setLeaveBalance] = useState({ usedDays: 0, totalDays: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      dateOfRequest: '11/05/2025 - 05:32',
      startDate: '11/05/2025',
      endDate: '11/05/2025',
      reason: 'Personal reasons',
      status: 'Pending'
    },
    {
      id: 2,
      dateOfRequest: '11/05/2025 - 05:32',
      startDate: '11/05/2025',
      endDate: '11/05/2025',
      reason: 'Personal reasons',
      status: 'Pending'
    }
  ]);
  
  const [leaveHistory, setLeaveHistory] = useState([
    {
      id: 1,
      dateOfRequest: '10/24/2025 - 08:30',
      startDate: '10/24/2025',
      endDate: '10/25/2025',
      reason: 'Personal reasons',
      approvedBy: 'Van TD'
    },
    {
      id: 2,
      dateOfRequest: '10/08/2025 - 06:52',
      startDate: '10/08/2025',
      endDate: '10/09/2025',
      reason: 'Health reasons',
      approvedBy: 'Van TD'
    }
  ]);

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8080/api/leave-balances/my-balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setLeaveBalance({
          usedDays: data.usedDays || 3,
          totalDays: data.totalDays || 12
        });
      } else {
        // Fallback to demo data
        setLeaveBalance({ usedDays: 3, totalDays: 12 });
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      // Fallback to demo data
      setLeaveBalance({ usedDays: 3, totalDays: 12 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Resignation" breadcrumb={[]}>
      <div style={styles.topBar}>
        <div style={styles.balanceSection}>
          <span style={styles.balanceLabel}>Total day off:</span>
          <span style={styles.balanceValue}>
            {loading ? '...' : `${String(leaveBalance.usedDays).padStart(2, '0')} days / ${leaveBalance.totalDays} days`}
          </span>
        </div>
        <button style={styles.requestBtn} onClick={() => setShowModal(true)}>
          <span style={styles.plusIcon}>+</span>
          Request Leave
        </button>
      </div>

      {/* Leave Request Section */}
      <div style={styles.tableCard}>
        <div style={styles.tableTitle}>Leave Request</div>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}></th>
              <th style={styles.th}>Date of Request</th>
              <th style={styles.th}>Start Date</th>
              <th style={styles.th}>End Date</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request, index) => (
              <tr key={request.id} style={styles.bodyRow}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>{request.dateOfRequest}</td>
                <td style={styles.td}>{request.startDate}</td>
                <td style={styles.td}>{request.endDate}</td>
                <td style={styles.td}>{request.reason}</td>
                <td style={styles.td}>
                  <span style={styles.statusBadge}>{request.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={styles.pagination}>
          <button style={styles.paginationBtn} disabled>Previous</button>
          <button style={{...styles.paginationBtn, ...styles.paginationActive}}>1</button>
          <button style={styles.paginationBtn}>2</button>
          <button style={styles.paginationBtn}>Next</button>
        </div>
      </div>

      {/* Leave History Section */}
      <div style={styles.tableCard}>
        <div style={styles.tableTitle}>Leave History</div>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}></th>
              <th style={styles.th}>Date of Request</th>
              <th style={styles.th}>Start Date</th>
              <th style={styles.th}>End Date</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Approved By</th>
            </tr>
          </thead>
          <tbody>
            {leaveHistory.map((history, index) => (
              <tr key={history.id} style={styles.bodyRow}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>{history.dateOfRequest}</td>
                <td style={styles.td}>{history.startDate}</td>
                <td style={styles.td}>{history.endDate}</td>
                <td style={styles.td}>{history.reason}</td>
                <td style={styles.td}>{history.approvedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={styles.pagination}>
          <button style={styles.paginationBtn} disabled>Previous</button>
          <button style={{...styles.paginationBtn, ...styles.paginationActive}}>1</button>
          <button style={styles.paginationBtn}>2</button>
          <button style={styles.paginationBtn}>Next</button>
        </div>
      </div>

      {/* Request Leave Modal */}
      {showModal && (
        <RequestLeaveModal 
          onClose={() => setShowModal(false)}
          onSubmit={(data) => {
            console.log('Submit leave request:', data);
            setShowModal(false);
            setShowSuccessPopup(true);
            // TODO: API call to submit request
          }}
        />
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <SuccessPopup onClose={() => setShowSuccessPopup(false)} />
      )}
    </MainLayout>
  );
}

function SuccessPopup({ onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.successPopup} onClick={(e) => e.stopPropagation()}>
        <div style={styles.successHeader}>
          <p style={styles.successTitle}>NOTIFY</p>
          <button style={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>
        <p style={styles.successMessage}>You have successfully submitted</p>
      </div>
    </div>
  );
}

function RequestLeaveModal({ onClose, onSubmit }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fromDate || !toDate || !reason) {
      return;
    }

    // Simple validation: check if dates are valid
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (to < from) {
      setError('End date must be after start date');
      return;
    }

    onSubmit({ fromDate, toDate, reason, additionalDetails });
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Resignation Request</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.modalSection}>
            <div style={styles.sectionLabel}>Select Leave Day</div>
            
            <div style={styles.dateRow}>
              <div style={styles.dateCol}>
                <label style={styles.label}>
                  From Date <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={styles.dateInput}
                  required
                />
              </div>
              
              <div style={styles.dateCol}>
                <label style={styles.label}>
                  To Date <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={styles.dateInput}
                  required
                />
              </div>
            </div>
            
            {error && <div style={styles.errorText}>* {error}</div>}
          </div>

          <div style={styles.modalSection}>
            <div style={styles.sectionLabel}>Resignation Details</div>
            
            <label style={styles.label}>
              Reason for Resignation <span style={styles.required}>*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Select reason</option>
              <option value="Personal reasons">Personal reasons</option>
              <option value="Health reasons">Health reasons</option>
              <option value="Family reasons">Family reasons</option>
              <option value="Other">Other</option>
            </select>

            <label style={{...styles.label, marginTop: 16}}>Additional Details</label>
            <textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Please provide additional details about your resignation..."
              style={styles.textarea}
              rows={4}
            />
          </div>

          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    padding: '20px 24px',
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  balanceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: 500,
  },
  balanceValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: 600,
  },
  requestBtn: {
    background: '#ff6a00',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 2px 4px rgba(255, 106, 0, 0.2)',
  },
  plusIcon: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
  },
  tableCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 600,
    fontStyle: 'italic',
    color: '#111827',
    marginBottom: 20,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #e5e7eb',
  },
  headerRow: {
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    borderRight: '1px solid #e5e7eb',
  },
  bodyRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    color: '#111827',
    borderRight: '1px solid #e5e7eb',
  },
  statusBadge: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '4px 12px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    display: 'inline-block',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  paginationBtn: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 14,
    color: '#6b7280',
    cursor: 'pointer',
    minWidth: 36,
  },
  paginationActive: {
    background: '#ff6a00',
    color: '#fff',
    border: '1px solid #ff6a00',
  },
  
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modalCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 28,
    maxWidth: 520,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 24,
    marginTop: 0,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 16,
  },
  dateRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  dateCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: 14,
    color: '#374151',
    fontWeight: 500,
    marginBottom: 8,
    display: 'block',
  },
  required: {
    color: '#dc2626',
  },
  dateInput: {
    border: '1px solid #d1d5db',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 14,
    background: '#f9fafb',
    color: '#111827',
    outline: 'none',
  },
  select: {
    border: '1px solid #d1d5db',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 14,
    background: '#f9fafb',
    color: '#6b7280',
    outline: 'none',
    width: '100%',
  },
  textarea: {
    border: '1px solid #d1d5db',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 14,
    background: '#f9fafb',
    color: '#111827',
    outline: 'none',
    width: '100%',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginTop: 8,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
  },
  submitBtn: {
    background: '#ff6a00',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(255, 106, 0, 0.2)',
  },
  
  // Success Popup styles
  successPopup: {
    background: '#fff',
    borderRadius: 15,
    width: 328,
    height: 143,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  },
  successHeader: {
    background: '#1a2332',
    border: '1px solid #c5bdbd',
    height: 62,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  successTitle: {
    fontFamily: 'Arimo, sans-serif',
    fontWeight: 700,
    fontSize: 24,
    color: '#ff6900',
    margin: 0,
    letterSpacing: '0.5px',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 24,
    cursor: 'pointer',
    opacity: 0.7,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
  },
  successMessage: {
    fontFamily: 'Arimo, sans-serif',
    fontSize: 20,
    textAlign: 'center',
    color: '#000',
    margin: 0,
    padding: '32px 16px',
  },
};

