import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      resolved: '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return colors[priority] || '#6b7280';
  };

  const pendingCount = tickets.filter(t => t.status === 'pending').length;
  const processingCount = tickets.filter(t => t.status === 'processing').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Welcome back, {user?.firstName || 'User'}! 👋
          </h1>
          <p style={styles.subtitle}>
            You have {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} in total
          </p>
        </div>
        <button 
          onClick={() => navigate('/app/support-tickets')}
          style={styles.createButton}
        >
          + Create New Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>
          <div style={styles.statInfo}>
            <div style={styles.statNumber}>{tickets.length}</div>
            <div style={styles.statLabel}>Total Tickets</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: 'rgba(245, 158, 11, 0.2)'}}>⏳</div>
          <div style={styles.statInfo}>
            <div style={styles.statNumber}>{pendingCount}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: 'rgba(59, 130, 246, 0.2)'}}>🔄</div>
          <div style={styles.statInfo}>
            <div style={styles.statNumber}>{processingCount}</div>
            <div style={styles.statLabel}>In Progress</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: 'rgba(16, 185, 129, 0.2)'}}>✅</div>
          <div style={styles.statInfo}>
            <div style={styles.statNumber}>{resolvedCount}</div>
            <div style={styles.statLabel}>Resolved</div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Recent Tickets</h2>
          {tickets.length > 0 && (
            <button 
              onClick={() => navigate('/app/support-tickets')}
              style={styles.viewAllButton}
            >
              View All Tickets →
            </button>
          )}
        </div>

        {tickets.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎫</div>
            <h3 style={styles.emptyTitle}>No tickets yet</h3>
            <p style={styles.emptyText}>
              Create your first support ticket to get started
            </p>
            <button 
              onClick={() => navigate('/app/support-tickets')}
              style={styles.emptyButton}
            >
              Create First Ticket
            </button>
          </div>
        ) : (
          <div style={styles.ticketList}>
            {tickets.slice(0, 5).map(ticket => (
              <div 
                key={ticket._id} 
                style={styles.ticketCard}
                onClick={() => navigate('/app/support-tickets')}
              >
                <div style={styles.ticketHeader}>
                  <h3 style={styles.ticketTitle}>{ticket.title}</h3>
                  <div style={styles.badges}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getStatusColor(ticket.status),
                    }}>
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <p style={styles.ticketDescription}>
                  {ticket.description.length > 150 
                    ? ticket.description.substring(0, 150) + '...' 
                    : ticket.description
                  }
                </p>

                <div style={styles.ticketFooter}>
                  <div style={styles.ticketMeta}>
                    <span style={{
                      ...styles.priority,
                      color: getPriorityColor(ticket.priority)
                    }}>
                      {ticket.priority} priority
                    </span>
                    <span style={styles.date}>
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <span style={styles.viewLink}>View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
        <div style={styles.actionGrid}>
          <button 
            style={styles.actionCard}
            onClick={() => navigate('/app/support-tickets')}
          >
            <span style={styles.actionIcon}>📝</span>
            <span style={styles.actionText}>Create Ticket</span>
          </button>
          
          <button 
            style={styles.actionCard}
            onClick={() => navigate('/app/support-tickets')}
          >
            <span style={styles.actionIcon}>📊</span>
            <span style={styles.actionText}>View All Tickets</span>
          </button>
          
          <button 
            style={styles.actionCard}
            onClick={() => window.location.href = 'mailto:support@flowbit.com'}
          >
            <span style={styles.actionIcon}>📧</span>
            <span style={styles.actionText}>Email Support</span>
          </button>
          
          <button 
            style={styles.actionCard}
            onClick={() => alert('Help documentation coming soon!')}
          >
            <span style={styles.actionIcon}>❓</span>
            <span style={styles.actionText}>Help Center</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)',
    color: '#ffffff',
    padding: '32px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    color: 'rgba(255,255,255,0.7)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.1)',
    borderTop: '4px solid #00d4ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
  },
  createButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'transform 0.2s, background 0.2s',
    cursor: 'default',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1,
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  viewAllButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#00d4ff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '24px',
  },
  emptyButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  ticketList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  ticketCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px',
  },
  ticketTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
    flex: 1,
  },
  badges: {
    display: 'flex',
    gap: '8px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
  ticketDescription: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  ticketFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
  },
  priority: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  date: {
    color: 'rgba(255,255,255,0.5)',
  },
  viewLink: {
    fontSize: '13px',
    color: '#00d4ff',
    fontWeight: '500',
  },
  quickActions: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '24px',
  },
  quickActionsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
  },
  actionCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'inherit',
  },
  actionIcon: {
    fontSize: '32px',
  },
  actionText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
};

// Add hover effects via CSS-in-JS simulation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}