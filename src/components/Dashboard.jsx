import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Upload, 
  BarChart3, 
  Crown, 
  TrendingUp, 
  Eye,
  Calendar,
  Star,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch user stats
      const statsResponse = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Stats data:', statsData);
        setStats(statsData.stats);
      } else {
        console.error('Failed to fetch stats:', statsResponse.status, statsResponse.statusText);
      }

      // Fetch recent scans
      const scansResponse = await fetch('/api/scans/history?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (scansResponse.ok) {
        const scansData = await scansResponse.json();
        console.log('Scans data:', scansData);
        setRecentScans(scansData.scans);
      } else {
        console.error('Failed to fetch scans:', scansResponse.status, scansResponse.statusText);
      }

      // Fetch score trend data
      const trendResponse = await fetch('/api/user/score-trend', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (trendResponse.ok) {
        const trendDataResponse = await trendResponse.json();
        console.log('Trend data:', trendDataResponse);
        setTrendData(trendDataResponse.trendData);
      } else {
        console.error('Failed to fetch trend data:', trendResponse.status, trendResponse.statusText);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const truncateFilename = (filename, maxLength = 25) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
    return `${truncated}.${extension}`;
  };

  const handleViewReport = (scanId) => {
    navigate(`/analysis-results?scanId=${scanId}`);
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Track your resume optimization progress and improve your ATS scores.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalScans || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.avgScore ? `${stats.avgScore}/100` : '--'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Plan</p>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user?.tier === 'pro' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.tier === 'pro' ? 'Pro' : 'Free'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Free User Reminder */}
        {user?.tier === 'free' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  Free Scans Used This Week: {stats?.scansThisWeek || 0}/{stats?.freeLimit || 1}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Upgrade to Pro for unlimited scans and job match analysis
                </p>
              </div>
              <button 
                onClick={() => navigate('/pricing')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}

        {/* Score Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Score Progress
              </h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(date) => formatDate(date)}
                    formatter={(value, name) => [`${value}/100`, 'Score']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Analyze New Resume
              </h3>
              <p className="text-gray-600 mb-6">
                Upload and get instant ATS compatibility feedback
              </p>
              <button 
                onClick={() => navigate('/upload')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors w-full"
              >
                Upload Resume
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                View All History
              </h3>
              <p className="text-gray-600 mb-6">
                Browse all your previous resume scans and results
              </p>
              <button 
                onClick={() => navigate('/history')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full"
              >
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Scans</h2>
          </div>
          
          {recentScans.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scans yet!</h3>
              <p className="text-gray-600 mb-6">Upload your first resume to get started</p>
              <button 
                onClick={() => navigate('/upload')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Scan My First Resume
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Match Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(scan.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {truncateFilename(scan.filename)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {scan.overallScore ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(scan.overallScore)}`}>
                            {scan.overallScore}/100
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {scan.jobMatchScore ? (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(scan.jobMatchScore)}`}>
                              {scan.jobMatchScore}/100
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {scan.hasResults ? (
                          <button
                            onClick={() => handleViewReport(scan.id)}
                            className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Report
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">No analysis</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {recentScans.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 text-center">
              <button 
                onClick={() => navigate('/history')}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center justify-center mx-auto"
              >
                View All History
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;