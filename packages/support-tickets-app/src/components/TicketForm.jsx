import React, { useState } from 'react';

export default function TicketForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onSubmit({ title, description, priority });

    if (result.success) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      if (onCancel) onCancel();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <PlusIcon />
          Create New Ticket
        </h2>
        <p style={styles.subtitle}>Submit a new support request for your team</p>
      </div>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>
            <TitleIcon />
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            placeholder="Brief description of the issue"
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            <DescriptionIcon />
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            placeholder="Detailed description of the issue, steps to reproduce, and expected behavior..."
            rows={6}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            <PriorityIcon />
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              ...styles.select,
              ...(priority === 'high' ? styles.highPriority : {}),
              ...(priority === 'medium' ? styles.mediumPriority : {}),
              ...(priority === 'low' ? styles.lowPriority : {})
            }}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        {error && (
          <div style={styles.error}>
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        <div style={styles.actions}>
          <button 
            type="submit" 
            style={loading ? { ...styles.submitButton, ...styles.submitButtonLoading } : styles.submitButton} 
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Creating Ticket...
              </>
            ) : (
              <>
                <CreateIcon />
                Create Ticket
              </>
            )}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} style={styles.cancelButton}>
              <CloseIcon />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TitleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3H3V5H12V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 7H3V9H12V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 11H21V13H3V11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 15H21V17H3V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 19H21V21H3V19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const DescriptionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 21.7893 6 21.7893H18C18.5304 21.7893 19.0391 21.5786 19.4142 21.2035C19.7893 20.8285 20 20.3198 20 19.7893V8L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PriorityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 13.5L10 10.5L13 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10.5L10 13.5L13 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const CreateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 14.5V19.5C20 20.0523 19.5523 20.5 19 20.5H4.5C3.94772 20.5 3.5 20.0523 3.5 19.5V5C3.5 4.44772 3.94772 4 4.5 4H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 4.5V2M19 5.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 17H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const styles = {
  container: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px',
    backdropFilter: 'blur(10px)',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#00d4ff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '14px 16px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#ffffff',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  textarea: {
    padding: '14px 16px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#ffffff',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'all 0.3s ease',
    lineHeight: '1.5',
  },
  select: {
    padding: '14px 16px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#ffffff',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  highPriority: {
    borderColor: '#ef4444',
    color: '#ef4444',
  },
  mediumPriority: {
    borderColor: '#f59e0b',
    color: '#f59e0b',
  },
  lowPriority: {
    borderColor: '#10b981',
    color: '#10b981',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  submitButton: {
    padding: '14px 24px',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  submitButtonLoading: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  cancelButton: {
    padding: '14px 24px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

// Add hover effects
Object.assign(styles.input, {
  ':focus': {
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(255,255,255,0.08)',
    boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
  },
});

Object.assign(styles.textarea, {
  ':focus': {
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(255,255,255,0.08)',
    boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
  },
});

Object.assign(styles.select, {
  ':focus': {
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(255,255,255,0.08)',
    boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
  },
});

Object.assign(styles.submitButton, {
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 212, 255, 0.3)',
  },
  ':disabled': {
    transform: 'none',
    boxShadow: 'none',
  },
});

Object.assign(styles.cancelButton, {
  ':hover': {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.2)',
    transform: 'translateY(-1px)',
  },
});