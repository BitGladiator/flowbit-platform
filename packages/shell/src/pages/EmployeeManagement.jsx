import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeManagement() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'User',
    department: '',
    phone: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/employees/invite', formData);
      alert(`Employee invited! Temporary password: ${response.data.tempPassword}`);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'User',
        department: '',
        phone: ''
      });
      setShowInviteForm(false);
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to invite employee');
    }
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    
    try {
      await api.delete(`/employees/${employeeId}`);
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete employee');
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div style={styles.container}>
        <h2>Access Denied</h2>
        <p>Only administrators can access employee management.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Employee Management</h1>
          <p style={styles.subtitle}>Manage your team members</p>
        </div>
        <button 
          onClick={() => setShowInviteForm(!showInviteForm)}
          style={styles.inviteButton}
        >
          {showInviteForm ? '✕ Cancel' : '+ Invite Employee'}
        </button>
      </div>

      {showInviteForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Invite New Employee</h3>
          <form onSubmit={handleInvite} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={styles.input}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  style={styles.input}
                  placeholder="e.g., Engineering"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={styles.input}
                placeholder="+1 234 567 8900"
              />
            </div>

            <button type="submit" style={styles.submitButton}>
              Send Invitation
            </button>
          </form>
        </div>
      )}

      <div style={styles.employeeGrid}>
        {employees.map((employee) => (
          <div key={employee._id} style={styles.employeeCard}>
            <div style={styles.employeeHeader}>
              <div style={styles.avatar}>
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
              <div style={styles.employeeInfo}>
                <h3 style={styles.employeeName}>
                  {employee.firstName} {employee.lastName}
                </h3>
                <p style={styles.employeeEmail}>{employee.email}</p>
              </div>
            </div>

            <div style={styles.employeeDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Role:</span>
                <span style={{
                  ...styles.roleBadge,
                  backgroundColor: employee.role === 'Admin' ? '#ef4444' : '#3b82f6'
                }}>
                  {employee.role}
                </span>
              </div>
              {employee.department && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Department:</span>
                  <span style={styles.detailValue}>{employee.department}</span>
                </div>
              )}
              {employee.phone && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Phone:</span>
                  <span style={styles.detailValue}>{employee.phone}</span>
                </div>
              )}
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Joined:</span>
                <span style={styles.detailValue}>
                  {new Date(employee.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {employee._id !== user.id && (
              <div style={styles.employeeActions}>
                <button 
                  onClick={() => handleDelete(employee._id)}
                  style={styles.deleteButton}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
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
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
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
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    fontSize: '32px',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
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
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'rgba(255,255,255,0.6)',
  },
  ticketList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  ticketItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '16px',
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  ticketTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  ticketDescription: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '12px',
  },
  ticketMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  ticketDate: {},
  ticketPriority: {
    textTransform: 'capitalize',
  },
};