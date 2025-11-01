import React from 'react';

export default function TicketList({ tickets, onTicketClick }) {
  if (tickets.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>No tickets yet</p>
        <p style={styles.emptySubtext}>Create your first ticket above</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {tickets.map((ticket) => (
        <div
          key={ticket._id}
          style={styles.ticket}
          onClick={() => onTicketClick && onTicketClick(ticket)}
        >
          <div style={styles.header}>
            <h3 style={styles.title}>{ticket.title}</h3>
            <span style={getStatusStyle(ticket.status)}>
              {ticket.status}
            </span>
          </div>
          
          <p style={styles.description}>
            {ticket.description.length > 100
              ? `${ticket.description.substring(0, 100)}...`
              : ticket.description}
          </p>
          
          <div style={styles.footer}>
            <span style={getPriorityStyle(ticket.priority)}>
              {ticket.priority} priority
            </span>
            <span style={styles.date}>
              {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusStyle(status) {
  const baseStyle = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  };

  const colors = {
    pending: { background: '#fff3cd', color: '#856404' },
    processing: { background: '#cfe2ff', color: '#084298' },
    resolved: { background: '#d1e7dd', color: '#0f5132' },
  };

  return { ...baseStyle, ...colors[status] };
}

function getPriorityStyle(priority) {
  const baseStyle = {
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  };

  const colors = {
    low: { color: '#666' },
    medium: { color: '#ff9800' },
    high: { color: '#f44336' },
  };

  return { ...baseStyle, ...colors[priority] };
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  ticket: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '16px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  description: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: '12px',
    color: '#999',
  },
  empty: {
    background: 'white',
    padding: '60px 20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#999',
  },
};