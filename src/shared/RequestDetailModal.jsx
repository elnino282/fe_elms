import React from 'react';

export default function RequestDetailModal({ isOpen, onClose, requestData }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Resignation Request Details</h2>

        <div style={styles.content}>
          {/* Basic Information */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Basic Information</h3>
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Employee Name</label>
                <div style={styles.inputDisabled}>
                  <p style={styles.inputText}>{requestData?.employeeName || 'Tran Thi B'}</p>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Current Position</label>
                <div style={styles.inputDisabled}>
                  <p style={styles.inputText}>{requestData?.position || 'Product Manager'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leave date */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Leave date</h3>
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>From Date</label>
                <div style={styles.inputDisabled}>
                  <p style={styles.inputText}>{requestData?.fromDate || '10/28/2025'}</p>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>To Date</label>
                <div style={styles.inputDisabled}>
                  <p style={styles.inputText}>{requestData?.toDate || '11/28/2025'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resignation Details */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Resignation Details</h3>
            </div>
            <div style={styles.fieldFull}>
              <label style={styles.label}>Reason for Resignation</label>
              <div style={styles.textareaDisabled}>
                <p style={styles.inputText}>{requestData?.reason || 'Career advancement'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 10,
    width: '100%',
    maxWidth: 512,
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#101828',
    margin: 0,
    padding: '25px 25px 16px',
  },
  content: {
    padding: '0 25px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sectionHeader: {
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 400,
    color: '#101828',
    margin: 0,
  },
  row: {
    display: 'flex',
    gap: 16,
  },
  field: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  fieldFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#0a0a0a',
    lineHeight: '14px',
  },
  inputDisabled: {
    background: '#f3f3f5',
    border: '1px solid rgba(0,0,0,0)',
    borderRadius: 8,
    padding: '8px 12px',
    height: 36,
    display: 'flex',
    alignItems: 'center',
    opacity: 0.5,
  },
  textareaDisabled: {
    background: '#f3f3f5',
    border: '1px solid rgba(0,0,0,0)',
    borderRadius: 8,
    padding: '9px 13px',
    minHeight: 64,
    display: 'flex',
    alignItems: 'flex-start',
    opacity: 0.5,
  },
  inputText: {
    fontSize: 14,
    color: '#0a0a0a',
    margin: 0,
    lineHeight: '20px',
  },
  footer: {
    borderTop: '1px solid #e5e7eb',
    padding: '25px 24px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  closeButton: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: '8px 17px',
    fontSize: 14,
    color: '#0a0a0a',
    cursor: 'pointer',
    minWidth: 100,
    height: 36,
    transition: 'all 0.2s',
  },
};
