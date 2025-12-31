import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import socketService from "../services/socket";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        console.log("Restoring session...");
        console.log("Token exists:", !!token);
        console.log("Saved user exists:", !!savedUser);

        if (token && savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            console.log("Parsed user:", parsedUser);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            try {
              const response = await api.get("/me/profile");
              console.log("Token is valid, profile verified:", response.data);
              const verifiedUser = {
                id: response.data.userId || parsedUser.id,
                email: response.data.email || parsedUser.email,
                customerId: response.data.customerId || parsedUser.customerId,
                role: response.data.role || parsedUser.role,
                firstName: parsedUser.firstName,
                lastName: parsedUser.lastName,
              };
              
              setUser(verifiedUser);
              socketService.connect(token);
              
            } catch (verifyError) {
              console.error("Token verification failed:", verifyError.response?.status);
              
              if (verifyError.response?.status === 401 || verifyError.response?.status === 403) {
                console.log("Token expired or invalid, clearing session");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                delete api.defaults.headers.common["Authorization"];
                socketService.disconnect();
                setUser(null);
              } else {
                console.log("⚠️ Verification failed but setting user anyway");
                setUser(parsedUser);
                socketService.connect(token);
              }
            }
          } catch (parseError) {
            console.error("Failed to parse user data:", parseError);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            delete api.defaults.headers.common["Authorization"];
            socketService.disconnect();
            setUser(null);
          }
        } else {
          console.log("No saved session found");
        }
      } catch (error) {
        console.error("Session restoration error:", error);
        setUser(null);
      } finally {
        setLoading(false);
        console.log("Session restoration complete");
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      const response = await api.post("/auth/login", { email, password });
      const { token, user: userData } = response.data;

      const safeUserData = {
        id: userData.id,
        email: userData.email,
        customerId: userData.customerId,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };

      console.log("Login successful:", safeUserData);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(safeUserData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(safeUserData);
      socketService.connect(token);

      return { success: true, user: safeUserData };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Login failed. Please try again.",
      };
    }
  };

  const logout = () => {
    console.log("Logging out");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    socketService.disconnect();
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await api.post("/auth/refresh");
      const { token } = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}