import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';

export default function Sidebar() {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      const response = await api.get('/me/screens');
      setScreens(response.data);
    } catch (error) {
      console.error('Failed to fetch screens:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <aside style={styles.sidebar}>Loading...</aside>;
  }

  return (
    <aside style={styles.sidebar}>
      <nav style={styles.nav}>
        <Link 
          to="/dashboard" 
          style={{
            ...styles.navItem,
            ...(location.pathname === '/dashboard' ? styles.navItemActive : {})
          }}
        >
          Dashboard
        </Link>
        
        {screens.map((screen) => (
          <Link
            key={screen.id}
            to={`/app/${screen.id}`}
            style={{
              ...styles.navItem,
              ...(location.pathname === `/app/${screen.id}` ? styles.navItemActive : {})
            }}
          >
            {screen.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '250px',
    background: 'white',
    borderRight: '1px solid #e0e0e0',
    padding: '24px 0',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    padding: '12px 24px',
    color: '#666',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'background 0.2s',
  },
  navItemActive: {
    background: '#f5f3ff',
    color: '#667eea',
    fontWeight: '500',
    borderLeft: '3px solid #667eea',
  },
};