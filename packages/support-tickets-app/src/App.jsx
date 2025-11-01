import React, { useState } from 'react';
import { useTickets } from './hooks/useTickets';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';

export default function App() {
  const { tickets, loading, error, createTicket, updateTicket } = useTickets();
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleCreateTicket = async (ticketData) => {
    const result = await createTicket(ticketData);
    if (result.success) {
      setShowForm(false);
    }
    return result;
  };

  const handleUpdateTicket = async (ticketId, updates) => {
    await updateTicket(ticketId, updates);
  };

  if (loading && tickets.length === 0) {
    return (
      <div style={styles.loading}>
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>Error: {error}</p>
        <p style={styles.errorHint}>Make sure you're logged in and the API is running</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Support Tickets</h1>
          <p style={styles.subtitle}>{tickets.length} ticket(s)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.newButton}>
          {showForm ? 'Cancel' : '+ New Ticket'}
        </button>
      </div>

      {showForm && (
        <TicketForm
          onSubmit={handleCreateTicket}
          onCancel={() => setShowForm(false)}
        />
      )}

      <TicketList tickets={tickets} onTicketClick={setSelectedTicket} />

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdateTicket}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  newButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    fontSize: '16px',
    color: '#666',
  },
  error: {
    padding: '24px',
    background: '#fee',
    borderRadius: '8px',
    color: '#c33',
    textAlign: 'center',
  },
  errorHint: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#999',
  },
};