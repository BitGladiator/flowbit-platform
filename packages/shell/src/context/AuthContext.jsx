import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const isValid = await validateToken(token);
          if (mounted) {
            if (isValid) {
              setUser(JSON.parse(savedUser));
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
              logout();
            }
          }
        } catch (error) {
          console.error('Token validation error:', error);
          if (mounted) {
            logout();
          }
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await api.get('/auth/validate');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
    
      const safeUserData = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        ...(userData.role && { role: userData.role })
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(safeUserData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(safeUserData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.message || 
               'Login failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}