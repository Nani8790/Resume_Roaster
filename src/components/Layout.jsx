import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if current route should show sidebar
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname.startsWith('/auth');
  const isLandingPage = location.pathname === '/' || location.pathname === '/pricing';
  const shouldShowSidebar = isAuthenticated && !isAuthRoute && !isLandingPage;

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Don't show sidebar for admin routes (they have their own layout)
  if (isAdminRoute) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Landing page and auth pages - no sidebar
  if (!shouldShowSidebar) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        {children}
      </div>
    );
  }

  // Main app layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        isMobile={isMobile}
      />

      {/* Main content area */}
      <div className={`${isMobile ? 'ml-0' : 'ml-64'} transition-all duration-300 ease-in-out`}>
        {/* Top bar for mobile */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Resume Roaster</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        )}

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;