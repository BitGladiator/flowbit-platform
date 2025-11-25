import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import RemoteAppPage from './pages/RemoteAppPage';

function AuthDebug() {
  const { user, loading } = useAuth();
  
  React.useEffect(() => {
    console.log('=== AUTH DEBUG ===');
    console.log('User:', user);
    console.log('Loading:', loading);
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('User exists in storage:', !!localStorage.getItem('user'));
    console.log('==================');
  }, [user, loading]);

  return null;
}

function DefaultRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === "Admin") {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/my-dashboard" replace />;
  }
}

export default function App() {
  console.log('App.jsx rendered');
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthDebug />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/app/:appId"
            element={
              <ProtectedRoute>
                <Layout>
                  <RemoteAppPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
       
          <Route path="/" element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}