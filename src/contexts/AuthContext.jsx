import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Listen for token changes (useful for OAuth)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Handle both storage events and custom events
      if (e.type === 'storage' && e.key === 'token') {
        const newToken = e.newValue;
        if (newToken !== token) {
          setToken(newToken);
        }
      } else if (e.type === 'storage' && !e.key) {
        // Custom storage event (dispatched manually)
        const newToken = localStorage.getItem('token');
        if (newToken !== token) {
          setToken(newToken);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token]);

  const fetchUser = async () => {
    try {
      console.log('Fetching user with token:', token ? 'Present' : 'Missing');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('fetchUser response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('User fetched successfully:', data.user?.email);
        setUser(data.user);
      } else {
        console.log('Token invalid, logging out');
        // Token is invalid
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        // Try to get error message from response
        try {
          const errorData = await response.json();
          return { success: false, message: errorData.message || 'Login failed' };
        } catch {
          return { success: false, message: 'Network error. Please try again.' };
        }
      }

      const data = await response.json();
      console.log('Login response data:', { success: data.success, hasToken: !!data.token });

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('token');
    console.log('refreshUser called with token:', currentToken ? `Present (${currentToken.substring(0, 20)}...)` : 'Missing');
    if (currentToken) {
      return await fetchUserWithToken(currentToken);
    }
    return null;
  };

  const fetchUserWithToken = async (tokenToUse) => {
    try {
      console.log('Fetching user with specific token:', tokenToUse ? `Present (${tokenToUse.substring(0, 20)}...)` : 'Missing');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`
        }
      });

      console.log('fetchUserWithToken response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('User fetched successfully:', data.user?.email);
        setUser(data.user);
        // Update token state if it's different
        if (tokenToUse !== token) {
          console.log('Updating token state');
          setToken(tokenToUse);
        }
        return data.user;
      } else {
        console.log('Token invalid, response:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        // Token is invalid
        logout();
        return null;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    fetchUser,
    refreshUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};