import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <BuildingIcon />
          </div>
          <h2 style={styles.logoText}>Flowbit</h2>
        </div>
        <div style={styles.divider}></div>
        <nav style={styles.nav}>
          <span style={styles.navItem}>Dashboard</span>
          <span style={styles.navItem}>Support Tickets</span>
          <span style={styles.navItem}>Analytics</span>
          <span style={styles.navItem}>Settings</span>
        </nav>
      </div>

      <div style={styles.userInfo}>
        <div style={styles.userBadge}>
          <div style={styles.userAvatar}>
            <UserCircleIcon />
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{user?.email}</span>
            <div style={styles.userMeta}>
              <span style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </span>
              <span style={styles.userTenant}>{user?.customerId}</span>
              <span style={styles.userRole}>{user?.role}</span>
            </div>
          </div>
        </div>
        <button onClick={logout} style={styles.logoutButton}>
          <LogoutIcon />
          Sign Out
        </button>
      </div>
    </header>
  );
}
const BuildingIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 21H5C4.44772 21 4 20.5523 4 20V11L10 7L16 11V20C16 20.5523 15.5523 21 15 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 21V17C10 16.4477 10.4477 16 11 16H13C13.5523 16 14 16.4477 14 17V21"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect x="7" y="10" width="2" height="2" rx="0.5" fill="currentColor" />
    <rect x="11" y="10" width="2" height="2" rx="0.5" fill="currentColor" />
    <rect x="15" y="10" width="2" height="2" rx="0.5" fill="currentColor" />
  </svg>
);

const UserCircleIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle
      cx="12"
      cy="9"
      r="3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 17L15 12L10 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M15 12H3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    background: "#1a1a1a",
    borderBottom: "1px solid #333",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
  },
  divider: {
    width: "1px",
    height: "32px",
    background: "#333",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
  },
  navItem: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#cccccc",
    cursor: "pointer",
    transition: "all 0.3s ease",
    padding: "8px 0",
    position: "relative",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 16px",
    background: "#2a2a2a",
    border: "1px solid #333",
    borderRadius: "12px",
    transition: "all 0.3s ease",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    background: "rgba(0, 212, 255, 0.1)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#00d4ff",
    border: "2px solid rgba(0, 212, 255, 0.3)",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    whiteSpace: "nowrap",
  },
  userMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userTenant: {
    fontSize: "12px",
    color: "#999",
    fontWeight: "500",
  },
  userRole: {
    fontSize: "11px",
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: "0.05em",
    background: "#333",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  logoutButton: {
    padding: "10px 16px",
    background: "#2a2a2a",
    border: "1px solid #333",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#cccccc",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};
Object.assign(styles.navItem, {
  ":hover": {
    color: "#ffffff",
  },
  "::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "0%",
    height: "2px",
    background: "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)",
    transition: "width 0.3s ease",
  },
  ":hover::after": {
    width: "100%",
  },
});

Object.assign(styles.userBadge, {
  ":hover": {
    background: "#333",
    borderColor: "#444",
    transform: "translateY(-1px)",
  },
});

Object.assign(styles.logoutButton, {
  ":hover": {
    background: "#dc2626",
    borderColor: "#dc2626",
    color: "#ffffff",
    transform: "translateY(-1px)",
  },
});
const activeNavItem = {
  ...styles.navItem,
  color: "#ffffff",
  "::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "2px",
    background: "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)",
  },
};
styles.navItem = activeNavItem;
