import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateAuthHeaders = useCallback((token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    updateAuthHeaders(null);
    setUser(null);
  }, [updateAuthHeaders]);

  const validateToken = useCallback(async (token) => {
    try {
      updateAuthHeaders(token);
      await api.get("/me/profile");
      return true;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearSession();
        return false;
      }
      return true;
    }
  }, [clearSession, updateAuthHeaders]);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);
        const isValid = await validateToken(token);
        
        if (isValid) {
          setUser(parsedUser);
        }
      } catch (error) {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [clearSession, validateToken]);

  const login = async (email, password) => {
    try {
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

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(safeUserData));
      updateAuthHeaders(token);
      setUser(safeUserData);

      return { success: true, user: safeUserData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed. Please try again.",
      };
    }
  };

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const refreshToken = async () => {
    try {
      const response = await api.post("/auth/refresh");
      const { token, user: userData } = response.data;
      
      localStorage.setItem("token", token);
      
      if (userData) {
        const safeUserData = {
          id: userData.id,
          email: userData.email,
          customerId: userData.customerId,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
        };
        localStorage.setItem("user", JSON.stringify(safeUserData));
        setUser(safeUserData);
      }
      
      updateAuthHeaders(token);
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
    isAuthenticated: !!user,
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