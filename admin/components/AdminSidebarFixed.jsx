import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Database,
  BarChart3,
  Settings,
  Bot,
  Activity,
  FileText,
  DollarSign,
  TrendingUp,
  Crown,
  Edit,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Briefcase,
  Video,
  MessageSquare,
  Star,
  Mail,
  Eye,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Download,
  Archive
} from 'lucide-react';

const AdminSidebarFixed = ({ isOpen, setIsOpen, isMobile = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
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

  // Admin navigation items
  const adminNavItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: Shield,
      path: '/admin/7780488674',
      description: 'System overview'
    },
    {
      key: 'user-management',
      label: 'User Management',
      icon: Users,
      submenu: [
        { label: 'All Users', path: '/admin/users', icon: Users },
        { label: 'Pro Users', path: '/admin/users/pro', icon: Crown },
        { label: 'User Analytics', path: '/admin/users/analytics', icon: BarChart3 },
        { label: 'User Activity', path: '/admin/users/activity', icon: Activity },
        { label: 'User Roles', path: '/admin/users/roles', icon: UserCheck },
        { label: 'Bulk Actions', path: '/admin/users/bulk', icon: Edit }
      ]
    },
    {
      key: 'content-management',
      label: 'Content Management',
      icon: Edit,
      submenu: [
        { label: 'Resume Scans', path: '/admin/content/scans', icon: FileText },
        { label: 'Templates', path: '/admin/content/templates', icon: Layers },
        { label: 'Job Postings', path: '/admin/content/jobs', icon: Briefcase },
        { label: 'Notifications', path: '/admin/content/notifications', icon: Bell },
        { label: 'Help Content', path: '/admin/content/help', icon: HelpCircle },
        { label: 'Email Templates', path: '/admin/content/emails', icon: Mail }
      ]
    },
    {
      key: 'system-management',
      label: 'System Management',
      icon: Database,
      submenu: [
        { label: 'AI Providers', path: '/admin/system/ai', icon: Bot },
        { label: 'System Health', path: '/admin/system/health', icon: Activity },
        { label: 'Performance', path: '/admin/system/performance', icon: TrendingUp },
        { label: 'Database', path: '/admin/system/database', icon: Database },
        { label: 'Logs', path: '/admin/system/logs', icon: FileText },
        { label: 'Backups', path: '/admin/system/backups', icon: Archive }
      ]
    },
    {
      key: 'analytics',
      label: 'Analytics & Reports',
      icon: TrendingUp,
      submenu: [
        { label: 'Usage Analytics', path: '/admin/analytics/usage', icon: BarChart3 },
        { label: 'Revenue Analytics', path: '/admin/analytics/revenue', icon: DollarSign },
        { label: 'Performance Metrics', path: '/admin/analytics/performance', icon: TrendingUp },
        { label: 'User Behavior', path: '/admin/analytics/behavior', icon: Eye },
        { label: 'Custom Reports', path: '/admin/analytics/reports', icon: FileText },
        { label: 'Export Data', path: '/admin/analytics/export', icon: Download }
      ]
    },
    {
      key: 'support',
      label: 'Support & Help',
      icon: HelpCircle,
      submenu: [
        { label: 'Support Tickets', path: '/admin/support/tickets', icon: MessageSquare },
        { label: 'Live Chat', path: '/admin/support/chat', icon: MessageSquare },
        { label: 'Knowledge Base', path: '/admin/support/kb', icon: FileText },
        { label: 'FAQ Management', path: '/admin/support/faq', icon: HelpCircle },
        { label: 'Video Tutorials', path: '/admin/support/videos', icon: Video },
        { label: 'Contact Forms', path: '/admin/support/forms', icon: Mail }
      ]
    }
  ];

  const settingsItems = [
    {
      key: 'settings',
      label: 'System Settings',
      icon: Settings,
      submenu: [
        { label: 'General Settings', path: '/admin/settings/general', icon: Settings },
        { label: 'Email Settings', path: '/admin/settings/email', icon: Mail },
        { label: 'API Settings', path: '/admin/settings/api', icon: Database },
        { label: 'Integration Settings', path: '/admin/settings/integrations', icon: Layers },
        { label: 'Maintenance Mode', path: '/admin/settings/maintenance', icon: AlertTriangle },
        { label: 'Feature Flags', path: '/admin/settings/features', icon: Star }
      ]
    }
  ];

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  const sidebarClass = `
    fixed inset-y-0 left-0 z-50
    ${sidebarWidth} 
    bg-gray-900 text-white
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
                ? 'bg-red-600 text-white border-r-2 border-red-400' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
                    <p className="text-xs text-gray-400 truncate">{item.description}</p>
                  )}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronRight 
                className={`h-4 w-4 transition-transform duration-200 ${
                  isSubmenuOpen ? 'rotate-90' : ''
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
                ? 'bg-red-600 text-white border-r-2 border-red-400' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }
              ${isCollapsed ? 'justify-center px-4' : ''}
            `}
          >
            <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'} flex-shrink-0`} />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate">{item.label}</span>
                {item.description && (
                  <p className="text-xs text-gray-400 truncate">{item.description}</p>
                )}
              </div>
            )}
          </button>
        )}

        {/* Submenu */}
        {hasSubmenu && isSubmenuOpen && !isCollapsed && (
          <div className="bg-gray-800 border-l-2 border-red-500 ml-4">
            {item.submenu.map((subItem) => (
              <button
                key={subItem.path}
                onClick={() => handleNavigation(subItem.path)}
                className={`
                  w-full flex items-center pl-8 pr-4 py-2 text-left text-sm
                  transition-colors duration-200
                  ${isActivePath(subItem.path)
                    ? 'bg-red-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
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
          <Icon className="h-4 w-4 text-gray-500" />
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
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">Admin Panel</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {/* Collapse toggle (desktop only) */}
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            )}

            {/* Mobile close button */}
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Admin info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Administrator</p>
                <p className="text-xs text-gray-400 truncate">System Admin</p>
                <div className="text-xs flex items-center mt-1 text-red-400">
                  <Shield className="h-3 w-3 mr-1" />
                  Full Access
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Main Admin Navigation */}
          <SectionHeader title="Administration" icon={Shield} />
          {adminNavItems.map((item) => (
            <NavItem key={item.key} item={item} />
          ))}

          {/* Settings */}
          <SectionHeader title="Configuration" icon={Settings} />
          {settingsItems.map((item) => (
            <NavItem key={item.key} item={item} />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4">
          {/* System status */}
          {!isCollapsed && (
            <div className="mb-4 p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center mb-2">
                <Activity className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-sm font-medium text-white">System Status</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">All systems operational</span>
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center text-gray-300 hover:text-red-400 transition-colors
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

export default AdminSidebarFixed;