import React, { useState, useEffect } from "react";

export default function TicketDetail({ ticket, onClose, onUpdate }) {
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    setCurrentTicket(ticket);
  }, [ticket]);

  if (!currentTicket) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const result = await onUpdate(currentTicket._id, { status: newStatus });

      if (result && result.success) {
        setCurrentTicket(result.ticket);
      } else {
        console.error("Failed to update ticket:", result?.error);
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      processing: "#3b82f6",
      resolved: "#10b981",
    };
    return colors[status] || "#6b7280";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "#10b981",
      medium: "#f59e0b",
      high: "#ef4444",
      urgent: "#dc2626",
    };
    return colors[priority] || "#6b7280";
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h2 style={styles.title}>
              <TicketIcon />
              {currentTicket.title}
            </h2>
            <div style={styles.ticketMeta}>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(currentTicket.status),
                }}
              >
                {currentTicket.status}
                {updating && <span style={styles.updatingDot}>...</span>}
              </span>
              <span
                style={{
                  ...styles.priorityBadge,
                  backgroundColor: getPriorityColor(currentTicket.priority),
                }}
              >
                {currentTicket.priority} priority
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={styles.closeButton}
            disabled={updating}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.grid}>
            <div style={styles.mainContent}>
              <div style={styles.section}>
                <label style={styles.label}>
                  <DescriptionIcon />
                  Description
                </label>
                <div style={styles.descriptionBox}>
                  <p style={styles.description}>{currentTicket.description}</p>
                </div>
              </div>

              <div style={styles.section}>
                <label style={styles.label}>
                  <ActivityIcon />
                  Activity
                </label>
                <div style={styles.activity}>
                  <div style={styles.activityItem}>
                    <div style={styles.activityDot}></div>
                    <div style={styles.activityContent}>
                      <span style={styles.activityText}>Ticket created</span>
                      <span style={styles.activityTime}>
                        {new Date(currentTicket.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div style={styles.activityItem}>
                    <div style={styles.activityDot}></div>
                    <div style={styles.activityContent}>
                      <span style={styles.activityText}>Last updated</span>
                      <span style={styles.activityTime}>
                        {new Date(currentTicket.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.sidebar}>
              <div style={styles.section}>
                <label style={styles.label}>
                  <StatusIcon />
                  Update Status
                </label>
                <div style={styles.statusButtons}>
                  {["pending", "processing", "resolved"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updating}
                      style={{
                        ...styles.statusButton,
                        ...(currentTicket.status === status
                          ? styles.statusButtonActive
                          : {}),
                        borderColor:
                          currentTicket.status === status
                            ? getStatusColor(status)
                            : "#333",
                        ...(updating ? styles.buttonDisabled : {}),
                      }}
                    >
                      <div
                        style={{
                          ...styles.statusIndicator,
                          backgroundColor: getStatusColor(status),
                        }}
                      ></div>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {updating && currentTicket.status === status && (
                        <span style={styles.loadingSpinner}>⟳</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <label style={styles.label}>
                  <InfoIcon />
                  Ticket Details
                </label>
                <div style={styles.detailList}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Priority</span>
                    <span
                      style={{
                        ...styles.detailValue,
                        color: getPriorityColor(currentTicket.priority),
                      }}
                    >
                      {currentTicket.priority.charAt(0).toUpperCase() +
                        currentTicket.priority.slice(1)}
                    </span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Created</span>
                    <span style={styles.detailValue}>
                      {new Date(currentTicket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Last Updated</span>
                    <span style={styles.detailValue}>
                      {new Date(currentTicket.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {currentTicket.assignee && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Assignee</span>
                      <span style={styles.detailValue}>
                        {currentTicket.assignee}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const TicketIcon = () => (
  <svg
    width="24"
    height="24"
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

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6 6L18 18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const DescriptionIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 21.7893 6 21.7893H18C18.5304 21.7893 19.0391 21.5786 19.4142 21.2035C19.7893 20.8285 20 20.3198 20 19.7893V8L14 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2V8H20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 13H8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M16 17H8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 9H9H8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ActivityIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 12H6L9 3L15 21L18 12H21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StatusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C7.02944 20 3 16.4183 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#1a1a1a",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "900px",
    maxHeight: "90vh",
    overflow: "auto",
    border: "1px solid #333",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "32px 32px 24px",
    borderBottom: "1px solid #333",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "0 0 16px 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    lineHeight: 1.4,
  },
  ticketMeta: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    textTransform: "capitalize",
    letterSpacing: "0.5px",
  },
  priorityBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    textTransform: "capitalize",
    backgroundColor: "#6b7280",
    letterSpacing: "0.5px",
  },
  closeButton: {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid #333",
    borderRadius: "10px",
    fontSize: "16px",
    color: "#999",
    cursor: "pointer",
    padding: "8px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  content: {
    padding: "32px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: "32px",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "20px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#00d4ff",
    marginBottom: "16px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  descriptionBox: {
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "16px",
  },
  description: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.9)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    margin: 0,
  },
  activity: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  activityItem: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  activityDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#00d4ff",
    borderRadius: "50%",
    marginTop: "6px",
    flexShrink: 0,
  },
  activityContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  activityText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  activityTime: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
  },
  statusButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statusButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid #333",
    borderRadius: "8px",
    fontSize: "14px",
    color: "rgba(255,255,255,0.8)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "capitalize",
    width: "100%",
  },
  statusButtonActive: {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    color: "#00d4ff",
  },
  statusIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  detailList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #333",
  },
  detailLabel: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  updatingDot: {
    marginLeft: "8px",
    fontWeight: "bold",
  },
  loadingSpinner: {
    marginLeft: "8px",
    animation: "spin 1s linear infinite",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

const spinAnimation = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = spinAnimation;
  document.head.append(style);
}
