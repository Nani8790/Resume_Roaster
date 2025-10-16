import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Crown } from 'lucide-react';

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Subscription Canceled
        </h1>
        
        <p className="text-gray-600 mb-6">
          No worries! Your subscription wasn't processed. You can still enjoy our free tier or try upgrading again anytime.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Free Tier Includes:</h3>
          <div className="text-left space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-800">1 resume scan per week</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-800">Basic ATS compatibility check</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-800">Essential feedback and tips</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Crown className="h-4 w-4" />
            <span>Try Pro Again</span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancel;