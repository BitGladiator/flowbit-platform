import React, { useState } from "react";

export default function TicketList({
  tickets,
  onTicketClick,
  onDeleteTicket,
  loading = false,
  showDeleteButton = true, 
}) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteClick = async (ticket, e) => {
    e.stopPropagation(); 
    if (!onDeleteTicket) return;
    if (!window.confirm(`Are you sure you want to delete "${ticket.title}"?`)) {
      return;
    }

    setDeletingId(ticket._id);
    try {
      await onDeleteTicket(ticket._id);
    } catch (error) {
      console.error("Error deleting ticket:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div style={styles.loading}>
        <LoadingSpinner />
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (!loading && tickets.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>
          <TicketIcon />
        </div>
        <h3 style={styles.emptyTitle}>No Tickets Found</h3>
        <p style={styles.emptySubtext}>
          Create your first support ticket to get started
        </p>
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
          <div style={styles.ticketHeader}>
            <div style={styles.titleSection}>
              <h3 style={styles.title}>{ticket.title}</h3>
              <div style={styles.meta}>
                <span style={getPriorityStyle(ticket.priority)}>
                  <PriorityIcon priority={ticket.priority} />
                  {ticket.priority} priority
                </span>
                <span style={styles.date}>
                  <CalendarIcon />
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div style={styles.headerRight}>
              <span style={getStatusStyle(ticket.status)}>
                <StatusIcon status={ticket.status} />
                {ticket.status}
              </span>
              {showDeleteButton && onDeleteTicket && (
                <button
                  style={
                    deletingId === ticket._id
                      ? { ...styles.deleteButton, ...styles.deleteButtonLoading }
                      : styles.deleteButton
                  }
                  onClick={(e) => handleDeleteClick(ticket, e)}
                  disabled={deletingId === ticket._id}
                >
                  {deletingId === ticket._id ? (
                    <LoadingSpinnerSmall />
                  ) : (
                    <DeleteIcon />
                  )}
                  {deletingId === ticket._id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>

          <p style={styles.description}>
            {ticket.description.length > 120
              ? `${ticket.description.substring(0, 120)}...`
              : ticket.description}
          </p>

          <div style={styles.footer}>
            <div style={styles.footerLeft}>
              <span style={styles.id}>#{ticket._id?.slice(-6) || "N/A"}</span>
            </div>
            <div style={styles.footerRight}>
              <span style={styles.viewDetails}>
                View Detais
                <ArrowIcon />
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusStyle(status) {
  const baseStyle = {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    letterSpacing: "0.5px",
  };

  const colors = {
    pending: {
      backgroundColor: "rgba(245, 158, 11, 0.2)",
      color: "#f59e0b",
      border: "1px solid rgba(245, 158, 11, 0.3)",
    },
    processing: {
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      color: "#3b82f6",
      border: "1px solid rgba(59, 130, 246, 0.3)",
    },
    resolved: {
      backgroundColor: "rgba(16, 185, 129, 0.2)",
      color: "#10b981",
      border: "1px solid rgba(16, 185, 129, 0.3)",
    },
  };

  return { ...baseStyle, ...(colors[status] || colors.pending) };
}

function getPriorityStyle(priority) {
  const baseStyle = {
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "capitalize",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const colors = {
    low: { color: "#10b981" },
    medium: { color: "#f59e0b" },
    high: { color: "#ef4444" },
    urgent: { color: "#dc2626" },
  };

  return { ...baseStyle, ...(colors[priority] || colors.medium) };
}

const TicketIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 5V7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M15 11V13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M15 17V19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M5 5H19C20.1046 5 21 5.89543 21 7V10C19.8954 10 19 10.8954 19 12C19 13.1046 19.8954 14 21 14V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V14C4.10457 14 5 13.1046 5 12C5 10.8954 4.10457 10 3 10V7C3 5.89543 3.89543 5 5 5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M3 7H21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 10V17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 10V17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M8 7V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V7"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const LoadingSpinnerSmall = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2V6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 18V22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M4.93 4.93L7.76 7.76"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16.24 16.24L19.07 19.07"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M2 12H6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M18 12H22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M4.93 19.07L7.76 16.24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16.24 7.76L19.07 4.93"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const StatusIcon = ({ status }) => {
  const icons = {
    pending: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    processing: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2V6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 18V22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4.93 4.93L7.76 7.76"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16.24 16.24L19.07 19.07"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M2 12H6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18 12H22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4.93 19.07L7.76 16.24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16.24 7.76L19.07 4.93"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    resolved: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 6L9 17L4 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };
  return icons[status] || icons.pending;
};

const PriorityIcon = ({ priority }) => {
  const icons = {
    low: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 13.5L10 10.5L13 13.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 10.5L10 13.5L13 10.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    medium: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3V21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 8H16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 12H16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 16H14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    high: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 10.5L10 13.5L13 10.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 13.5L10 10.5L13 13.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    urgent: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 9V13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12 17H12.01"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7.31989 3.5L3.49989 7.32C2.24989 8.57 2.24989 10.57 3.49989 11.82L7.31989 15.64C8.06989 16.39 9.01989 16.83 9.99989 16.95V21C9.99989 21.55 10.4499 22 10.9999 22H12.9999C13.5499 22 13.9999 21.55 13.9999 21V16.95C14.9799 16.83 15.9299 16.39 16.6799 15.64L20.4999 11.82C21.7499 10.57 21.7499 8.57 20.4999 7.32L16.6799 3.5C15.4299 2.25 13.4299 2.25 12.1799 3.5L9.81989 5.86C9.33989 6.34 8.65989 6.34 8.17989 5.86L7.31989 3.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  };
  return icons[priority] || icons.medium;
};

const CalendarIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M16 2V6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M8 2V6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M3 10H21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12H19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M12 5L19 12L12 19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const LoadingSpinner = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2V6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M12 18V22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M4.93 4.93L7.76 7.76"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M16.24 16.24L19.07 19.07"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M2 12H6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M18 12H22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M4.93 19.07L7.76 16.24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M16.24 7.76L19.07 4.93"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  ticket: {
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    position: "relative",
  },
  ticketHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    gap: "16px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "0 0 8px 0",
    lineHeight: 1.4,
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  description: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.7)",
    lineHeight: "1.5",
    marginBottom: "16px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  footerRight: {
    display: "flex",
    alignItems: "center",
  },
  id: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    fontFamily: 'Monaco, "SF Mono", monospace',
    fontWeight: "500",
  },
  date: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  viewDetails: {
    fontSize: "12px",
    color: "#00d4ff",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.3s ease",
  },
  deleteButton: {
    padding: "6px 12px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#ef4444",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    whiteSpace: "nowrap",
  },
  deleteButtonLoading: {
    background: "rgba(239, 68, 68, 0.2)",
    color: "rgba(239, 68, 68, 0.7)",
    cursor: "not-allowed",
  },
  empty: {
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "60px 20px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },
  emptyIcon: {
    width: "80px",
    height: "80px",
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#00d4ff",
    margin: "0 auto 20px",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "0 0 8px 0",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    margin: 0,
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "16px",
    color: "rgba(255,255,255,0.7)",
    fontSize: "16px",
  },
};
Object.assign(styles.ticket, {
  ":hover": {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.2)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
  },
});

Object.assign(styles.viewDetails, {
  ":hover": {
    gap: "8px",
  },
});

Object.assign(styles.deleteButton, {
  ":hover": {
    background: "rgba(239, 68, 68, 0.2)",
    borderColor: "rgba(239, 68, 68, 0.5)",
    transform: "translateY(-1px)",
  },
});