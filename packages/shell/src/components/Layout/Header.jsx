import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <h2 style={styles.logoText}>Flowbit</h2>
      </div>
      
      <div style={styles.userInfo}>
        <div style={styles.userDetails}>
          <span style={styles.userName}>{user?.email}</span>
          <span style={styles.userTenant}>{user?.customerId}</span>
          <span style={styles.userRole}>{user?.role}</span>
        </div>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'white',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  userTenant: {
    fontSize: '12px',
    color: '#666',
  },
  userRole: {
    fontSize: '11px',
    color: '#999',
    textTransform: 'uppercase',
  },
  logoutButton: {
    padding: '8px 16px',
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};