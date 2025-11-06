import React, { useState, useEffect } from 'react';
import MainLayout from '../../layout/MainLayout.jsx';

// Helper function to format dates to Vietnamese format (DD/MM/YYYY)
const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to get status badge styling based on status
const getStatusBadgeStyle = (status) => {
  const baseStyle = {
    padding: '4px 12px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    display: 'inline-block',
  };

  switch (status) {
    case 'PENDING':
      return {
        ...baseStyle,
        background: '#fef3c7',
        color: '#92400e',
      };
    case 'APPROVED':
      return {
        ...baseStyle,
        background: '#d1fae5',
        color: '#065f46',
      };
    case 'REJECTED':
      return {
        ...baseStyle,
        background: '#fee2e2',
        color: '#991b1b',
      };
    default:
      return {
        ...baseStyle,
        background: '#f3f4f6',
        color: '#374151',
      };
  }
};

// Helper function to calculate weekdays (Monday-Friday) between two dates
const calculateWeekdays = (fromDate, toDate) => {
  if (!fromDate || !toDate) return 0;
  
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  // Reset time to midnight for accurate calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // If end date is before start date, return 0
  if (end < start) return 0;
  
  let weekdayCount = 0;
  const currentDate = new Date(start);
  
  // Loop through each day from start to end (inclusive)
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // Count only Monday (1) to Friday (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      weekdayCount++;
    }
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return weekdayCount;
};

export default function RequestLeave() {
  const [leaveBalance, setLeaveBalance] = useState({ usedDays: 0, totalDays: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  
  // Pagination state
  const [requestsPage, setRequestsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 2; // Match Resignation page size

  useEffect(() => {
    fetchLeaveBalance();
    fetchLeaveRequests();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const employeeId = localStorage.getItem('employee_id');
      
      if (!employeeId) {
        console.error('No employee ID found in localStorage');
        setLeaveBalance({ usedDays: 0, totalDays: 12 });
        setLoading(false);
        return;
      }
      
      const currentYear = new Date().getFullYear();
      const res = await fetch(`http://localhost:8080/api/leave-balances/my-balance?employeeId=${employeeId}&year=${currentYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const response = await res.json();
        // Parse the nested response structure
        const balanceData = response.data;
        setLeaveBalance({
          usedDays: balanceData.used || 0,
          totalDays: balanceData.entitlement || 12
        });
      } else {
        // Fallback to demo data
        console.error('Failed to fetch leave balance:', res.status);
        setLeaveBalance({ usedDays: 0, totalDays: 12 });
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      // Fallback to demo data
      setLeaveBalance({ usedDays: 0, totalDays: 12 });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      setRequestsLoading(true);
      const token = localStorage.getItem('auth_token');
      const employeeIdCode = localStorage.getItem('employee_id_code') || 'EMP004';
      
      const res = await fetch(`http://localhost:8080/api/leave-requests/my-requests?employeeIdCode=${employeeIdCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const response = await res.json();
        const data = response.data || [];
        
        // Separate PENDING from APPROVED/REJECTED
        const pending = data.filter(item => item.status === 'PENDING');
        const history = data.filter(item => item.status === 'APPROVED' || item.status === 'REJECTED');
        
        setLeaveRequests(pending);
        setLeaveHistory(history);
      } else {
        setLeaveRequests([]);
        setLeaveHistory([]);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveRequests([]);
      setLeaveHistory([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const submitLeaveRequest = async (requestData) => {
    try {
      const token = localStorage.getItem('auth_token');
      const employeeIdCode = localStorage.getItem('employee_id_code') || 'EMP004';
      
      const res = await fetch(`http://localhost:8080/api/leave-requests?employeeIdCode=${employeeIdCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: requestData.fromDate,
          endDate: requestData.toDate,
          reason: requestData.reason
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit leave request');
      }

      const data = await res.json();
      
      // Refresh leave requests and balance after successful submission
      await fetchLeaveRequests();
      await fetchLeaveBalance();
      
      return data;
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw error;
    }
  };

  // Calculate pagination for Leave Request table
  const requestsTotalPages = Math.max(1, Math.ceil(leaveRequests.length / pageSize));
  const requestsSafePage = Math.min(requestsPage, requestsTotalPages);
  const requestsStart = (requestsSafePage - 1) * pageSize;
  const requestsPageData = leaveRequests.slice(requestsStart, requestsStart + pageSize);

  // Calculate pagination for Leave History table
  const historyTotalPages = Math.max(1, Math.ceil(leaveHistory.length / pageSize));
  const historySafePage = Math.min(historyPage, historyTotalPages);
  const historyStart = (historySafePage - 1) * pageSize;
  const historyPageData = leaveHistory.slice(historyStart, historyStart + pageSize);

  return (
    <MainLayout title="Request Leave" breadcrumb={[]}>
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
            {requestsLoading ? (
              <tr>
                <td colSpan="6" style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                  Loading...
                </td>
              </tr>
            ) : leaveRequests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{...styles.td, textAlign: 'center', padding: '40px', color: '#6b7280'}}>
                  No pending leave requests
                </td>
              </tr>
            ) : (
              requestsPageData.map((request, index) => (
                <tr key={request.id} style={styles.bodyRow}>
                  <td style={styles.td}>{requestsStart + index + 1}</td>
                  <td style={styles.td}>{formatDate(request.createdAt)}</td>
                  <td style={styles.td}>{formatDate(request.startDate)}</td>
                  <td style={styles.td}>{formatDate(request.endDate)}</td>
                  <td style={styles.td}>{request.reason}</td>
                  <td style={styles.td}>
                    <span style={getStatusBadgeStyle(request.status)}>{request.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {leaveRequests.length > 0 && (
          <div style={styles.pagination}>
            <button 
              style={{
                ...styles.paginationBtn,
                ...(requestsSafePage === 1 ? {opacity: 0.5, cursor: 'not-allowed'} : {})
              }}
              onClick={() => setRequestsPage(Math.max(1, requestsSafePage - 1))}
              disabled={requestsSafePage === 1}
            >
              Previous
            </button>
            {Array.from({length: requestsTotalPages}, (_, i) => i + 1).map(p => (
              <button 
                key={p}
                style={{
                  ...styles.paginationBtn,
                  ...(p === requestsSafePage ? styles.paginationActive : {})
                }}
                onClick={() => setRequestsPage(p)}
              >
                {p}
              </button>
            ))}
            <button 
              style={{
                ...styles.paginationBtn,
                ...(requestsSafePage === requestsTotalPages ? {opacity: 0.5, cursor: 'not-allowed'} : {})
              }}
              onClick={() => setRequestsPage(Math.min(requestsTotalPages, requestsSafePage + 1))}
              disabled={requestsSafePage === requestsTotalPages}
            >
              Next
            </button>
          </div>
        )}
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
            {requestsLoading ? (
              <tr>
                <td colSpan="6" style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                  Loading...
                </td>
              </tr>
            ) : leaveHistory.length === 0 ? (
              <tr>
                <td colSpan="6" style={{...styles.td, textAlign: 'center', padding: '40px', color: '#6b7280'}}>
                  No leave history available
                </td>
              </tr>
            ) : (
              historyPageData.map((history, index) => (
                <tr key={history.id} style={styles.bodyRow}>
                  <td style={styles.td}>{historyStart + index + 1}</td>
                  <td style={styles.td}>{formatDate(history.createdAt)}</td>
                  <td style={styles.td}>{formatDate(history.startDate)}</td>
                  <td style={styles.td}>{formatDate(history.endDate)}</td>
                  <td style={styles.td}>{history.reason}</td>
                  <td style={styles.td}>{history.approvedByName || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {leaveHistory.length > 0 && (
          <div style={styles.pagination}>
            <button 
              style={{
                ...styles.paginationBtn,
                ...(historySafePage === 1 ? {opacity: 0.5, cursor: 'not-allowed'} : {})
              }}
              onClick={() => setHistoryPage(Math.max(1, historySafePage - 1))}
              disabled={historySafePage === 1}
            >
              Previous
            </button>
            {Array.from({length: historyTotalPages}, (_, i) => i + 1).map(p => (
              <button 
                key={p}
                style={{
                  ...styles.paginationBtn,
                  ...(p === historySafePage ? styles.paginationActive : {})
                }}
                onClick={() => setHistoryPage(p)}
              >
                {p}
              </button>
            ))}
            <button 
              style={{
                ...styles.paginationBtn,
                ...(historySafePage === historyTotalPages ? {opacity: 0.5, cursor: 'not-allowed'} : {})
              }}
              onClick={() => setHistoryPage(Math.min(historyTotalPages, historySafePage + 1))}
              disabled={historySafePage === historyTotalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Request Leave Modal */}
      {showModal && (
        <RequestLeaveModal 
          onClose={() => setShowModal(false)}
          onSubmit={async (data) => {
            try {
              await submitLeaveRequest(data);
              setShowModal(false);
              setShowSuccessPopup(true);
            } catch (error) {
              alert('Failed to submit leave request: ' + error.message);
            }
          }}
          leaveBalance={leaveBalance}
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

function RequestLeaveModal({ onClose, onSubmit, leaveBalance }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [error, setError] = useState('');
  const [balanceError, setBalanceError] = useState('');
  const [isExceeded, setIsExceeded] = useState(false);

  // Calculate requested days and validate against balance
  useEffect(() => {
    if (fromDate && toDate) {
      const requestedDays = calculateWeekdays(fromDate, toDate);
      const remainingDays = leaveBalance.totalDays - leaveBalance.usedDays;
      
      if (requestedDays > remainingDays) {
        setBalanceError(
          
        );
        setIsExceeded(true);
      } else {
        setBalanceError('');
        setIsExceeded(false);
      }
    } else {
      setBalanceError('');
      setIsExceeded(false);
    }
  }, [fromDate, toDate, leaveBalance]);

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

    // Validate leave balance
    const requestedDays = calculateWeekdays(fromDate, toDate);
    const remainingDays = leaveBalance.totalDays - leaveBalance.usedDays;
    
    if (requestedDays > remainingDays) {
      setError('Cannot submit. You have exceeded your available leave days.');
      return;
    }

    onSubmit({ fromDate, toDate, reason, additionalDetails });
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Leave Request</h2>
        
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
            {isExceeded && <div style={styles.errorText}>*leave day exceeded</div>}
          </div>

          <div style={styles.modalSection}>
            <div style={styles.sectionLabel}>Leave Details</div>
            
            <label style={styles.label}>
              Reason for Leave <span style={styles.required}>*</span>
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
              placeholder="Please provide additional details about your leave request..."
              style={styles.textarea}
              rows={4}
            />
            
            {balanceError && <div style={styles.errorText}>* {balanceError}</div>}
          </div>

          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button 
              type="submit" 
              style={isExceeded ? styles.submitBtnDisabled : styles.submitBtn}
              disabled={isExceeded}
            >
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
  submitBtnDisabled: {
    background: '#ff6a00',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    cursor: 'not-allowed',
    boxShadow: '0 2px 4px rgba(255, 106, 0, 0.2)',
    opacity: 0.6,
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

