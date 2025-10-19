import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { Shield, LogOut, User, ChevronDown } from 'lucide-react';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Admin Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 rounded-lg p-2">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Control Panel</h1>
              <p className="text-xs text-gray-600">Resume Roaster Management</p>
            </div>
          </div>

          {/* Admin Profile & Logout */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <div className="bg-purple-600 rounded-full p-2">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-600">Administrator</div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                {/* Admin Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-600 rounded-full p-2">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-600">{user?.email}</div>
                      <div className="text-xs text-purple-600 font-medium mt-1">
                        🛡️ System Administrator
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Info */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Session: Active</div>
                    <div>Login: {new Date().toLocaleTimeString()}</div>
                    <div>Access Level: Full Control</div>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 hover:text-red-700 transition-colors flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Secure Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;