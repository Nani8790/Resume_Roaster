import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FileText, User, LogOut, History, Settings, Crown, ChevronDown, Menu, X, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActivePath = (path) => {
    return location.pathname === path
  }

  // Check admin status (only for authorized users)
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !isAuthenticated) {
        setIsAdmin(false)
        return
      }

      try {
        const token = localStorage.getItem('token')
        if (!token) return

        // The admin check is done on the server side
        // We just try to access the admin endpoint to see if user has access

        const response = await fetch('/api/admin/7780488674/dashboard/health', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        setIsAdmin(response.ok)
      } catch (error) {
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user, isAuthenticated])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold gradient-text">Resume Roaster</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard"
                  className={`transition-colors ${
                    isActivePath('/dashboard') 
                      ? 'text-purple-600 font-medium' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/history"
                  className={`flex items-center transition-colors ${
                    isActivePath('/history') 
                      ? 'text-purple-600 font-medium' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Link>
                <Link 
                  to="/settings"
                  className={`flex items-center transition-colors ${
                    isActivePath('/settings') 
                      ? 'text-purple-600 font-medium' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Link>
              </>
            ) : (
              <>
                <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</a>
                <a href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</a>
              </>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
            
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    user?.tier === 'pro' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                      : 'bg-purple-600'
                  }`}>
                    {user?.tier === 'pro' ? (
                      <Crown className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-gray-500">{user?.email}</div>
                      <div className={`text-xs flex items-center mt-1 ${
                        user?.tier === 'pro' ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        {user?.tier === 'pro' && <Crown className="h-3 w-3 mr-1" />}
                        {user?.tier === 'pro' ? 'PRO Plan' : 'FREE Plan'}
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setShowUserDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setShowUserDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <History className="h-4 w-4 inline mr-2" />
                      History
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 inline mr-2" />
                      Settings
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/7780488674"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                      >
                        <Shield className="h-4 w-4 inline mr-2" />
                        Admin Control
                      </Link>
                    )}
                    {user?.tier !== 'pro' && (
                      <Link
                        to="/pricing"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 border-t border-gray-100"
                      >
                        <Crown className="h-4 w-4 inline mr-2" />
                        Upgrade to Pro
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/auth/login"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth/signup"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        {isAuthenticated && showMobileMenu && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/dashboard')
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/history')
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Link>
              <Link
                to="/settings"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/settings')
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/7780488674"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/admin/7780488674')
                      ? 'text-red-600 bg-red-50'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Control
                </Link>
              )}
              {user?.tier !== 'pro' && (
                <Link
                  to="/pricing"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:bg-purple-50"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Link>
              )}
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header