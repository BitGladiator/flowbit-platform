import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const quickLogin = (userEmail) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Flowbit Platform</h1>
        <p style={styles.subtitle}>Multi-Tenant Support System</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@logisticsco.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.quickLogin}>
          <p style={styles.quickLoginTitle}>Quick Login:</p>
          <button 
            onClick={() => quickLogin('admin@logisticsco.com')}
            style={styles.quickButton}
          >
            LogisticsCo Admin
          </button>
          <button 
            onClick={() => quickLogin('admin@retailgmbh.com')}
            style={styles.quickButton}
          >
            RetailGmbH Admin
          </button>
        </div>

        <p style={styles.hint}>
          Default password: <code>password123</code>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '32px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '14px',
  },
  quickLogin: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #eee',
  },
  quickLoginTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px',
  },
  quickButton: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  hint: {
    marginTop: '16px',
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
  },
};