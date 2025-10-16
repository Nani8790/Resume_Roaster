import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const token = searchParams.get('token');
      console.log('AuthSuccess - Token received:', token ? `Yes (${token.substring(0, 20)}...)` : 'No');

      if (token) {
        try {
          // Store the token
          localStorage.setItem('token', token);
          console.log('Token stored in localStorage');

          // Refresh the user context and wait for user to be loaded
          const fetchedUser = await refreshUser();
          console.log('User context refreshed, user:', fetchedUser?.email || 'None');
          
          if (fetchedUser) {
            console.log('User loaded successfully, redirecting to dashboard...');
            navigate('/dashboard', { replace: true });
          } else {
            setError('Failed to load user information');
          }
        } catch (err) {
          console.error('Error handling OAuth success:', err);
          setError('Failed to complete authentication');
        }
      } else {
        console.log('No token found, redirecting to login');
        setError('Authentication failed - no token received');
        setTimeout(() => navigate('/auth/login'), 2000);
      }
    };

    handleOAuthSuccess();
  }, [searchParams, refreshUser, navigate]);



  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="mt-2 text-red-600">{error}</p>
          <p className="mt-1 text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
        <p className="mt-2 text-gray-600">Completing sign in...</p>
        <p className="mt-1 text-gray-500">Please wait...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;