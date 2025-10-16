import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Refresh user data to get updated tier
    const timer = setTimeout(() => {
      if (refreshUser) {
        refreshUser();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <Crown className="h-8 w-8 text-yellow-500 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Resume Roaster Pro!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your subscription has been activated successfully. You now have access to:
        </p>
        
        <div className="text-left space-y-2 mb-8">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-700">Unlimited resume scans</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-700">Job-specific analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-700">Advanced keyword optimization</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-700">PDF report downloads</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-700">Priority support</span>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          You can manage your subscription anytime in Settings
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;