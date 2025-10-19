import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { Shield, Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use dedicated admin login endpoint
      const response = await fetch('/api/admin/7780488674/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      
      console.log('🔍 Admin login response:', result);
      
      if (result.success && result.user.role === 'admin') {
        // Store token
        localStorage.setItem('token', result.token);
        console.log('🔑 Token stored in localStorage');
        
        // Redirect to admin dashboard
        console.log('🚀 Redirecting to admin dashboard...');
        navigate('/admin/7780488674', { replace: true });
        
        // Log successful admin login
        console.log('✅ ADMIN LOGIN SUCCESS:', {
          admin: result.user.email,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('❌ Login failed:', result);
        setError(result.message || 'Invalid admin credentials');
        
        // Log security event
        console.warn('🚨 SECURITY: Failed admin login attempt', {
          email,
          timestamp: new Date().toISOString(),
          ip: 'client-side'
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Security Warning Banner */}
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-center text-red-200">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">RESTRICTED AREA</span>
          </div>
          <p className="text-xs text-red-300 mt-1">
            Authorized personnel only. All access attempts are logged and monitored.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-red-600 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Control Panel</h1>
            <p className="text-gray-400 text-sm">Resume Roaster Administrative Access</p>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Administrator Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="admin@resumeroaster.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Secure Login
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
              >
                ← Return to Main Site
              </button>
            </div>
          </div>

          {/* Security Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Secured with enterprise-grade encryption
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Session timeout: 30 minutes | All activities logged
            </p>
          </div>
        </div>


      </div>
    </div>
  );
};

export default AdminLogin;