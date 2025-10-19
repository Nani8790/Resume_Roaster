import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Star,
  Award,
  Crown
} from 'lucide-react';
// Recharts removed to avoid build issues - using simple chart representations

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');


  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockAnalytics = {
    overview: {
      totalScans: 24,
      avgScore: 78,
      improvement: 12,
      topScore: 92
    },
    scoreHistory: [
      { date: '2024-01-01', score: 65, jobMatch: 60 },
      { date: '2024-01-08', score: 70, jobMatch: 68 },
      { date: '2024-01-15', score: 75, jobMatch: 72 },
      { date: '2024-01-22', score: 78, jobMatch: 76 },
      { date: '2024-01-29', score: 82, jobMatch: 80 }
    ],
    skillsAnalysis: [
      { skill: 'JavaScript', score: 85, trend: 'up' },
      { skill: 'React', score: 80, trend: 'up' },
      { skill: 'Node.js', score: 75, trend: 'stable' },
      { skill: 'Python', score: 70, trend: 'down' },
      { skill: 'SQL', score: 65, trend: 'up' }
    ],
    industryComparison: [
      { industry: 'Technology', yourScore: 78, avgScore: 72 },
      { industry: 'Finance', yourScore: 75, avgScore: 70 },
      { industry: 'Healthcare', yourScore: 80, avgScore: 68 },
      { industry: 'Education', yourScore: 82, avgScore: 74 }
    ],
    scanTypes: [
      { name: 'Quick Scans', value: 18, color: '#3B82F6' },
      { name: 'Pro Scans', value: 6, color: '#8B5CF6' }
    ],
    weeklyActivity: [
      { day: 'Mon', scans: 3 },
      { day: 'Tue', scans: 5 },
      { day: 'Wed', scans: 2 },
      { day: 'Thu', scans: 4 },
      { day: 'Fri', scans: 6 },
      { day: 'Sat', scans: 1 },
      { day: 'Sun', scans: 3 }
    ]
  };

  const data = analytics || mockAnalytics;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Redirect free users
  if (user?.tier !== 'pro') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro Feature</h2>
          <p className="text-gray-600 mb-6">
            Advanced analytics are available for Pro users only. Upgrade to unlock detailed insights about your resume performance.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                Resume Analytics
                <Crown className="h-6 w-6 text-yellow-500 ml-2" />
              </h1>
              <p className="text-gray-600 mt-2">
                Track your resume performance and improvement over time
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={fetchAnalytics}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-3xl font-bold text-gray-900">{data.overview.totalScans}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{data.overview.improvement}% this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{data.overview.avgScore}</p>
                <div className="flex items-center mt-2">
                  <BarChart3 className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600">Out of 100</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Score</p>
                <p className="text-3xl font-bold text-gray-900">{data.overview.topScore}</p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">Personal best</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Improvement</p>
                <p className="text-3xl font-bold text-gray-900">+{data.overview.improvement}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Since first scan</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score History */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Score Progress</h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">ATS Score</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Job Match</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Score Progress Chart</p>
                <div className="space-y-2 text-sm">
                  {data.scoreHistory.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white px-4 py-2 rounded">
                      <span className="text-gray-600">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <div className="flex space-x-4">
                        <span className="text-purple-600 font-medium">Score: {Math.round(item.score)}</span>
                        <span className="text-blue-600 font-medium">Match: {Math.round(item.jobMatch)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Activity</h2>
            <div className="h-64">
              <div className="grid grid-cols-7 gap-2 h-full">
                {data.weeklyActivity.map((day, index) => (
                  <div key={index} className="flex flex-col items-center justify-end">
                    <div 
                      className="bg-purple-600 rounded-t w-full transition-all duration-300 hover:bg-purple-700"
                      style={{ height: `${(day.scans / Math.max(...data.weeklyActivity.map(d => d.scans))) * 80}%` }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2 font-medium">{day.day}</div>
                    <div className="text-xs text-purple-600 font-bold">{day.scans}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Analysis and Scan Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Skills Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Skills Performance</h2>
            <div className="space-y-4">
              {data.skillsAnalysis.map((skill, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-sm font-medium text-gray-900 w-20">{skill.skill}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${skill.score}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{skill.score}%</span>
                  </div>
                  <div className="ml-4">
                    {skill.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {skill.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                    {skill.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full"></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scan Types Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Scan Types</h2>
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Simple donut chart representation */}
                <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ borderWidth: '20px' }}></div>
                <div className="absolute inset-0 rounded-full border-8 border-purple-500" 
                     style={{ 
                       borderWidth: '20px',
                       clipPath: `polygon(50% 50%, 50% 0%, ${50 + (data.scanTypes[1].value / (data.scanTypes[0].value + data.scanTypes[1].value)) * 50}% 0%, 100% 50%, 50% 50%)`,
                       transform: 'rotate(0deg)'
                     }}>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{data.scanTypes[0].value + data.scanTypes[1].value}</div>
                    <div className="text-sm text-gray-600">Total Scans</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              {data.scanTypes.map((type, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{type.name}: {type.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Industry Comparison */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Industry Comparison</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Your Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry Average
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.industryComparison.map((industry, index) => {
                  const performance = industry.yourScore - industry.avgScore;
                  const isAboveAverage = performance > 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {industry.industry}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-2">{industry.yourScore}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${industry.yourScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">{industry.avgScore}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gray-400 h-2 rounded-full"
                              style={{ width: `${industry.avgScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center text-sm ${
                          isAboveAverage ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isAboveAverage ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                          )}
                          {isAboveAverage ? '+' : ''}{performance} points
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;