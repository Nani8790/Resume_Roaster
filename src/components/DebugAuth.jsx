import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugAuth = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const token = localStorage.getItem('token');

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Auth Debug</h4>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>User:</strong> {user ? user.email : 'None'}</p>
      <p><strong>Token:</strong> {token ? 'Present' : 'None'}</p>
      <p><strong>Current URL:</strong> {window.location.pathname}</p>
    </div>
  );
};

export default DebugAuth;