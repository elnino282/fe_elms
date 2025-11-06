import React, { useState } from 'react';
import MainLayout from '../../layout/MainLayout.jsx';
import RequestDetailModal from '../../shared/RequestDetailModal.jsx';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';

export default function ApprovalManagement() {
  const [pendingPage, setPendingPage] = useState(1);
  const [acceptedPage, setAcceptedPage] = useState(1);
  const [deniedPage, setDeniedPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const pendingRequests = [
    {
      id: 1,
      employeeName: 'Nguyen Van A',
      position: 'Developer',
      department: 'Engineer',
      dateOfRequest: '11/01/2025 - 09:30',
      totalDays: '02/12 days',
      fromDate: '11/05/2025',
      toDate: '11/07/2025',
      reason: 'Personal matters requiring immediate attention',
    },
    {
      id: 2,
      employeeName: 'Le Van C',
      position: 'UI Designer',
      department: 'Design',
      dateOfRequest: '10/25/2025 - 10:15',
      totalDays: '09/12 days',
      fromDate: '11/10/2025',
      toDate: '11/19/2025',
      reason: 'Family vacation',
    },
  ];

  const acceptedRequests = [
    {
      id: 1,
      employeeName: 'Tran Thi B',
      position: 'Product Manager',
      department: 'Product',
      dateOfRequest: '10/28/2025 - 14:00',
      totalDays: '06/12 days',
      fromDate: '10/28/2025',
      toDate: '11/28/2025',
      reason: 'Career advancement',
    },
    {
      id: 2,
      employeeName: 'Tran Thi B',
      position: 'Product Manager',
      department: 'Product',
      dateOfRequest: '10/28/2025 - 14:00',
      totalDays: '06/12 days',
      fromDate: '10/28/2025',
      toDate: '11/28/2025',
      reason: 'Career advancement',
    },
  ];

  const deniedRequests = [
    {
      id: 1,
      employeeName: 'Tran Thi B',
      position: 'Product Manager',
      department: 'Product',
      dateOfRequest: '10/28/2025 - 14:00',
      totalDays: '06/12 days',
      fromDate: '10/28/2025',
      toDate: '11/28/2025',
      reason: 'Career advancement',
    },
    {
      id: 2,
      employeeName: 'Tran Thi B',
      position: 'Product Manager',
      department: 'Product',
      dateOfRequest: '10/28/2025 - 14:00',
      totalDays: '06/12 days',
      fromDate: '10/28/2025',
      toDate: '11/28/2025',
      reason: 'Career advancement',
    },
  ];

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <MainLayout title="Approval Management" breadcrumb={[]}>
      {/* Pending Approval Requests */}
      <ApprovalTable
        title="Pending Approval Requests"
        data={pendingRequests}
        showActions={true}
        currentPage={pendingPage}
        totalPages={2}
        onPageChange={setPendingPage}
        onViewDetails={handleViewDetails}
      />

      {/* Accepted Requests */}
      <ApprovalTable
        title="Accepted Requests"
        data={acceptedRequests}
        showActions={false}
        currentPage={acceptedPage}
        totalPages={2}
        onPageChange={setAcceptedPage}
        onViewDetails={handleViewDetails}
      />

      {/* Denied Requests */}
      <ApprovalTable
        title="Denied Requests"
        data={deniedRequests}
        showActions={false}
        currentPage={deniedPage}
        totalPages={2}
        onPageChange={setDeniedPage}
        onViewDetails={handleViewDetails}
      />

      {/* Detail Modal */}
      <RequestDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        requestData={selectedRequest}
      />
    </MainLayout>
  );
}

function ApprovalTable({ title, data, showActions, currentPage, totalPages, onPageChange, onViewDetails }) {
  const [hoveredButton, setHoveredButton] = React.useState(null);
  const [hoveredRow, setHoveredRow] = React.useState(null);

  return (
    <div style={styles.tableCard}>
      <div style={styles.tableHeader}>
        <h3 style={styles.tableTitle}>{title}</h3>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}></th>
              <th style={{ ...styles.th, textAlign: 'left', paddingLeft: 8 }}>Employee Name</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Position</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Department</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Date of Request</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Total Days Taken</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Detail</th>
              {showActions && <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={index} 
                style={{
                  ...styles.tr,
                  ...(hoveredRow === index ? styles.trHover : {})
                }}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td style={{ ...styles.td, textAlign: 'center' }}>{row.id}</td>
                <td style={{ ...styles.td, paddingLeft: 8 }}>{row.employeeName}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{row.position}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{row.department}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{row.dateOfRequest}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{row.totalDays}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <button 
                    style={{
                      ...styles.viewButton,
                      ...(hoveredButton === `view-${index}` ? styles.viewButtonHover : {})
                    }}
                    onClick={() => onViewDetails(row)}
                    onMouseEnter={() => setHoveredButton(`view-${index}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <FaEye style={styles.viewIcon} />
                    View
                  </button>
                </td>
                {showActions && (
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={styles.actionButtons}>
                      <div style={styles.actionGroup}>
                        <button 
                          style={{
                            ...styles.acceptButton,
                            ...(hoveredButton === `accept-${index}` ? styles.acceptButtonHover : {})
                          }}
                          onMouseEnter={() => setHoveredButton(`accept-${index}`)}
                          onMouseLeave={() => setHoveredButton(null)}
                        >
                          <FaCheck style={styles.buttonIcon} />
                        </button>
                        <span style={styles.acceptLabel}>Accept</span>
                      </div>
                      <div style={styles.actionGroup}>
                        <button 
                          style={{
                            ...styles.denyButton,
                            ...(hoveredButton === `deny-${index}` ? styles.denyButtonHover : {})
                          }}
                          onMouseEnter={() => setHoveredButton(`deny-${index}`)}
                          onMouseLeave={() => setHoveredButton(null)}
                        >
                          <FaTimes style={styles.buttonIcon} />
                        </button>
                        <span style={styles.denyLabel}>Deny</span>
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const [hoveredButton, setHoveredButton] = React.useState(null);

  return (
    <div style={styles.pagination}>
      <button
        style={{
          ...styles.paginationButton,
          ...(currentPage === 1 ? styles.paginationButtonDisabled : {}),
          ...(hoveredButton === 'prev' && currentPage !== 1 ? styles.paginationButtonHover : {}),
        }}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        onMouseEnter={() => setHoveredButton('prev')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        Previous
      </button>
      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;
        return (
          <button
            key={page}
            style={{
              ...styles.paginationButton,
              ...(currentPage === page ? styles.paginationButtonActive : styles.paginationButtonInactive),
              ...(hoveredButton === `page-${page}` && currentPage !== page ? styles.paginationButtonHover : {}),
            }}
            onClick={() => onPageChange(page)}
            onMouseEnter={() => setHoveredButton(`page-${page}`)}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {page}
          </button>
        );
      })}
      <button
        style={{
          ...styles.paginationButton,
          ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}),
          ...(hoveredButton === 'next' && currentPage !== totalPages ? styles.paginationButtonHover : {}),
        }}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        onMouseEnter={() => setHoveredButton('next')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        Next
      </button>
    </div>
  );
}

const styles = {
  tableCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    marginBottom: 24,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  tableHeader: {
    borderBottom: '1px solid #e5e7eb',
    padding: '20px 16px 16px',
  },
  tableTitle: {
    fontSize: 20,
    fontStyle: 'italic',
    color: '#101828',
    margin: 0,
    fontWeight: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    background: '#f3f4f6',
  },
  th: {
    padding: '12px 8px',
    fontSize: 14,
    fontWeight: 700,
    color: '#374151',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    textTransform: 'capitalize',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
  },
  trHover: {
    backgroundColor: '#f9fafb',
  },
  td: {
    padding: '14px 8px',
    fontSize: 14,
    color: '#111827',
    lineHeight: '20px',
  },
  viewButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 14,
    fontWeight: 500,
    color: '#0a0a0a',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  viewButtonHover: {
    background: '#f9fafb',
    borderColor: 'rgba(0,0,0,0.2)',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  viewIcon: {
    fontSize: 16,
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  acceptButton: {
    background: '#00c950',
    border: 'none',
    borderRadius: 8,
    padding: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 29,
    height: 28,
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  acceptButtonHover: {
    background: '#00b347',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0, 201, 80, 0.3)',
  },
  denyButton: {
    background: '#fb2c36',
    border: 'none',
    borderRadius: 8,
    padding: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 29,
    height: 28,
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  denyButtonHover: {
    background: '#e0262f',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(251, 44, 54, 0.3)',
  },
  buttonIcon: {
    color: '#fff',
    fontSize: 16,
  },
  acceptLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: '#0a0a0a',
    whiteSpace: 'nowrap',
  },
  denyLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: '#0a0a0a',
    whiteSpace: 'nowrap',
  },
  pagination: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '16px',
  },
  paginationButton: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: '6px 13px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    minWidth: 31,
    height: 32,
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  paginationButtonActive: {
    background: '#ff6900',
    color: '#fff',
    border: '1px solid #ff6900',
    fontWeight: 600,
  },
  paginationButtonInactive: {
    background: '#c5bdbd',
    color: '#fff',
    border: '1px solid #c5bdbd',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  paginationButtonHover: {
    background: '#f3f4f6',
    borderColor: 'rgba(0,0,0,0.2)',
    transform: 'translateY(-1px)',
  },
};
