import React from 'react';

export default function TicketDetail({ ticket, onClose, onUpdate }) {
  if (!ticket) return null;

  const handleStatusChange = (newStatus) => {
    onUpdate(ticket._id, { status: newStatus });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{ticket.title}</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.section}>
            <label style={styles.label}>Status</label>
            <div style={styles.statusButtons}>
              {['pending', 'processing', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  style={{
                    ...styles.statusButton,
                    ...(ticket.status === status ? styles.statusButtonActive : {}),
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Priority</label>
            <span style={styles.value}>{ticket.priority}</span>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Description</label>
            <p style={styles.description}>{ticket.description}</p>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Created</label>
            <span style={styles.value}>
              {new Date(ticket.createdAt).toLocaleString()}
            </span>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Last Updated</label>
            <span style={styles.value}>
              {new Date(ticket.updatedAt).toLocaleString()}
            </span>
          </div>
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
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #eee',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#999',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
  },
  content: {
    padding: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '8px',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '14px',
    color: '#333',
  },
  description: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  statusButtons: {
    display: 'flex',
    gap: '8px',
  },
  statusButton: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'white',
    textTransform: 'capitalize',
    transition: 'all 0.2s',
  },
  statusButtonActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea',
  },
};