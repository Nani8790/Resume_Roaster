import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Calendar, TrendingUp, ArrowLeft, Crown, Lock } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tierInfo, setTierInfo] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/scans/history?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.scans || []);
        setTierInfo({ tier: data.tier, total: data.total });
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = (scan) => {
    if (scan.hasResults) {
      navigate(`/analysis-results?scanId=${scan.id}`);
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scan History</h1>
              <p className="text-gray-600 mt-2">
                View your previous resume analyses
              </p>
            </div>
            {tierInfo && (
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  tierInfo.tier === 'pro' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tierInfo.tier === 'pro' ? (
                    <>
                      <Crown className="h-4 w-4 mr-1" />
                      Pro Plan - All History
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-1" />
                      Free Plan - Last 3 Scans
                    </>
                  )}
                </div>
                {tierInfo.tier === 'free' && tierInfo.total > 3 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {tierInfo.total - 3} older scans hidden
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Free tier upgrade prompt */}
        {tierInfo?.tier === 'free' && tierInfo.total > 3 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Upgrade to Pro to see your complete scan history
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Free users can only view their last 3 scans
                </p>
              </div>
              <button 
                onClick={() => navigate('/pricing')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No scans yet</h2>
            <p className="text-gray-600 mb-6">Upload your first resume to get started!</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Upload Resume
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((scan) => (
              <div key={scan.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{scan.filename}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(scan.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            scan.analysisType === 'pro' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {scan.analysisType === 'pro' ? 'Pro Analysis' : 'Quick Analysis'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {scan.overallScore && (
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {scan.overallScore}/100
                        </span>
                      </div>
                    )}
                    {scan.jobMatchScore && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Job Match:</span>
                        <span className="font-semibold text-blue-600">
                          {scan.jobMatchScore}/100
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => handleViewResults(scan)}
                      disabled={!scan.hasResults}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        scan.hasResults
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {scan.hasResults ? 'View Results' : 'Not Analyzed'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;