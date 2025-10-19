import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Upload,
  History,
  Settings,
  Users,
  BarChart3,
  Crown,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  FileCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, isMobile = false }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !isAuthenticated) {
        setIsAdmin(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/admin/7780488674/dashboard/health', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setIsAdmin(response.ok);
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, isAuthenticated]);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const toggleSubmenu = (menuKey) => {
    setActiveSubmenu(activeSubmenu === menuKey ? null : menuKey);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Main navigation items for regular users
  const userNavItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      description: 'Overview and analytics'
    },
    {
      key: 'upload',
      label: 'Upload Resume',
      icon: Upload,
      path: '/upload',
      description: 'Analyze new resume'
    },
    {
      key: 'history',
      label: 'Scan History',
      icon: History,
      path: '/history',
      description: 'Previous analyses',
      badge: user?.scanHistory?.length || 0
    },
    {
      key: 'results',
      label: 'Latest Results',
      icon: FileCheck,
      path: '/analysis-results',
      description: 'View recent analysis'
    }
  ];

  // Management section for Pro users
  const managementItems = [
    {
      key: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      description: 'View detailed analytics'
    }
  ];

  // Admin navigation items
  const adminNavItems = [
    {
      key: 'admin-dashboard',
      label: 'Admin Dashboard',
      icon: Shield,
      path: '/admin/7780488674',
      description: 'System overview'
    }
  ];

  // Settings and support items
  const settingsItems = [
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      description: 'Account preferences'
    }
  ];

  if (!isAuthenticated) {
    return null;
  }

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  const sidebarClass = `
    fixed inset-y-0 left-0 z-50
    ${sidebarWidth} 
    bg-white border-r border-gray-200 
    transition-all duration-300 ease-in-out
    ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
    flex flex-col
  `;

  const NavItem = ({ item, level = 0 }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = item.path ? isActivePath(item.path) : false;
    const isSubmenuOpen = activeSubmenu === item.key;
    const paddingLeft = level === 0 ? 'pl-4' : 'pl-8';

    return (
      <div className="relative">
        {hasSubmenu ? (
          <button
            onClick={() => toggleSubmenu(item.key)}
            className={`
              w-full flex items-center justify-between ${paddingLeft} pr-4 py-3 text-left
              transition-colors duration-200
              ${isSubmenuOpen
                ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
              }
              ${isCollapsed ? 'justify-center px-4' : ''}
            `}
          >
            <div className="flex items-center min-w-0">
              <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'} flex-shrink-0`} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <span className="font-medium truncate">{item.label}</span>
                  {item.description && (
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  )}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-90' : ''
                  }`}
              />
            )}
          </button>
        ) : (
          <button
            onClick={() => handleNavigation(item.path)}
            className={`
              w-full flex items-center ${paddingLeft} pr-4 py-3 text-left
              transition-colors duration-200
              ${isActive
                ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
              }
              ${isCollapsed ? 'justify-center px-4' : ''}
            `}
          >
            <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'} flex-shrink-0`} />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full ml-2">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                )}
              </div>
            )}
          </button>
        )}

        {/* Submenu */}
        {hasSubmenu && isSubmenuOpen && !isCollapsed && (
          <div className="bg-gray-50 border-l-2 border-purple-200 ml-4">
            {item.submenu.map((subItem) => (
              <button
                key={subItem.path}
                onClick={() => handleNavigation(subItem.path)}
                className={`
                  w-full flex items-center pl-8 pr-4 py-2 text-left text-sm
                  transition-colors duration-200
                  ${isActivePath(subItem.path)
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                  }
                `}
              >
                <subItem.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                <span className="truncate">{subItem.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({ title, icon: Icon }) => {
    if (isCollapsed) {
      return (
        <div className="px-4 py-2 flex justify-center">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      );
    }

    return (
      <div className="px-4 py-2 mt-6 first:mt-0">
        <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Icon className="h-4 w-4 mr-2" />
          {title}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClass}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold gradient-text">Resume Roaster</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {/* Notifications */}
            {!isCollapsed && (
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Collapse toggle (desktop only) */}
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            )}

            {/* Mobile close button */}
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* User info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user?.tier === 'pro'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-purple-600'
                }`}>
                {user?.tier === 'pro' ? (
                  <Crown className="h-5 w-5 text-white" />
                ) : (
                  <FileText className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <div className={`text-xs flex items-center mt-1 ${user?.tier === 'pro' ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                  {user?.tier === 'pro' && <Crown className="h-3 w-3 mr-1" />}
                  {user?.tier === 'pro' ? 'PRO Plan' : 'FREE Plan'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Main Navigation */}
          <SectionHeader title="Main" icon={LayoutDashboard} />
          {userNavItems.map((item) => (
            <NavItem key={item.key} item={item} />
          ))}

          {/* Pro Features */}
          {user?.tier === 'pro' && (
            <>
              <SectionHeader title="Pro Features" icon={Crown} />
              {managementItems.map((item) => (
                <NavItem key={item.key} item={item} />
              ))}
            </>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <SectionHeader title="Administration" icon={Shield} />
              {adminNavItems.map((item) => (
                <NavItem key={item.key} item={item} />
              ))}
            </>
          )}

          {/* Settings & Support */}
          <SectionHeader title="Support" icon={HelpCircle} />
          {settingsItems.map((item) => (
            <NavItem key={item.key} item={item} />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          {/* Upgrade prompt for free users */}
          {user?.tier !== 'pro' && !isCollapsed && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <Crown className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-900">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-purple-700 mb-3">
                Unlock unlimited scans, advanced analytics, and premium templates.
              </p>
              <button
                onClick={() => handleNavigation('/pricing')}
                className="w-full bg-purple-600 text-white text-xs py-2 px-3 rounded-md hover:bg-purple-700 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center text-gray-700 hover:text-red-600 transition-colors
              ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
            `}
          >
            <LogOut className={`${isCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;