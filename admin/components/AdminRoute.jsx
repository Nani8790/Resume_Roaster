import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';
import AdminHeader from './AdminHeader';

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('🔍 AdminRoute: Checking admin access, token present:', !!token);
        
        if (!token) {
          console.log('❌ AdminRoute: No token found');
          setCheckingAdmin(false);
          return;
        }

        // Try to access admin endpoint to verify admin status
        const response = await fetch('/api/admin/7780488674/dashboard/health', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('🔍 AdminRoute: Health check response status:', response.status);
        
        if (response.ok) {
          console.log('✅ AdminRoute: Health check passed');
          // Create a mock admin user object for display purposes
          setAdminUser({
            email: 'admin@resumeroaster.com',
            name: 'Admin User',
            role: 'admin'
          });
          setIsAdmin(true);
          setAccessDenied(false);
        } else {
          console.log('❌ AdminRoute: Health check failed');
          setIsAdmin(false);
          setAccessDenied(true);
          // Log unauthorized access attempt
          console.warn('🚨 SECURITY ALERT: Unauthorized admin access attempt', {
            timestamp: new Date().toISOString(),
            ip: 'client-side',
            path: location.pathname
          });
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        setIsAdmin(false);
        setAccessDenied(true);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminAccess();
  }, [location.pathname]);

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Verifying administrative credentials...</p>
          <p className="text-xs text-gray-500 mt-2">Secure access validation in progress</p>
        </div>
      </div>
    );
  }

  if (!localStorage.getItem('token')) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin || accessDenied) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-6">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-2">ACCESS DENIED</h1>
            <p className="text-red-300 mb-4">
              You do not have administrative privileges to access this area.
            </p>
            <div className="bg-red-800 border border-red-600 rounded p-3 mb-4">
              <p className="text-xs text-red-200">
                🚨 This access attempt has been logged for security purposes.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            If you believe this is an error, please contact system administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-secure-area min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="bg-red-900 border-b border-red-700 px-4 py-1">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center text-red-200 text-xs">
            <Shield className="h-3 w-3 mr-2" />
            SECURE ADMINISTRATIVE AREA - ALL ACTIVITIES MONITORED
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AdminRoute;