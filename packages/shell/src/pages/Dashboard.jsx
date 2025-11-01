import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={styles.title}>Welcome to Flowbit</h1>
      <p style={styles.subtitle}>Multi-Tenant Support Platform</p>
      
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Your Account</h2>
        <div style={styles.info}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Email:</span>
            <span style={styles.infoValue}>{user?.email}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Company:</span>
            <span style={styles.infoValue}>{user?.customerId}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Role:</span>
            <span style={styles.infoValue}>{user?.role}</span>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🎉 Setup Complete!</h2>
        <p style={styles.text}>
          Your Flowbit platform is ready. Navigate to "Support Tickets" from the sidebar to start managing tickets.
        </p>
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '32px',
  },
  card: {
    background: 'white',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '16px',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    gap: '12px',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
    minWidth: '100px',
  },
  infoValue: {
    fontSize: '14px',
    color: '#333',
  },
  text: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
  },
};