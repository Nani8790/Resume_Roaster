import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import SimpleChart from '../../src/components/ui/SimpleChart';
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Activity,
  Search,
  Crown,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bot,
  Zap,
  BarChart3,
  Shield,
  Database,
  Download,
  Filter,
  SortAsc,
  MoreVertical,
  Edit,
  Plus,
  ExternalLink
} from 'lucide-react';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');

  const [aiProviderSettings, setAiProviderSettings] = useState(null);
  const [updatingAiProvider, setUpdatingAiProvider] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔍 AdminDashboard: Starting to fetch dashboard data...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ AdminDashboard: No token found');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch overview data
      console.log('🔍 AdminDashboard: Fetching overview data...');
      const overviewResponse = await fetch('/api/admin/7780488674/dashboard/overview', { headers });
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setOverview(overviewData.data);
      }

      // Fetch user growth data
      const growthResponse = await fetch('/api/admin/7780488674/dashboard/user-growth?days=30', { headers });
      if (growthResponse.ok) {
        const growthData = await growthResponse.json();
        setUserGrowth(growthData.data);
      }

      // Fetch recent users
      const usersResponse = await fetch('/api/admin/7780488674/dashboard/recent-users?limit=10', { headers });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setRecentUsers(usersData.data);
      }

      // Fetch system health
      const healthResponse = await fetch('/api/admin/7780488674/dashboard/health', { headers });
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData.data);
      }

      // Fetch AI provider settings
      const aiResponse = await fetch('/api/admin/7780488674/settings/ai-provider', { headers });
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        setAiProviderSettings(aiData.data);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        q: searchQuery,
        tier: selectedTier,
        limit: 20
      });

      const response = await fetch(`/api/admin/7780488674/dashboard/users/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleUserUpgrade = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/7780488674/dashboard/users/${userId}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh data
        fetchDashboardData();
        if (searchResults) {
          handleSearch();
        }
        alert('User upgraded to Pro successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to upgrade user: ${error.message}`);
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Failed to upgrade user');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleAiProviderChange = async (newProvider) => {
    if (updatingAiProvider) return;

    setUpdatingAiProvider(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/7780488674/settings/ai-provider', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider: newProvider })
      });

      if (response.ok) {
        const data = await response.json();
        setAiProviderSettings(data.data);
        alert(`AI provider successfully changed to ${newProvider.toUpperCase()}`);
      } else {
        const error = await response.json();
        alert(`Failed to change AI provider: ${error.message}`);
      }
    } catch (error) {
      console.error('AI provider change failed:', error);
      alert('Failed to change AI provider');
    } finally {
      setUpdatingAiProvider(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor your Resume Roaster platform performance and analytics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{overview.users.total}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{overview.users.newThisMonth} this month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pro Users</p>
                  <p className="text-3xl font-bold text-gray-900">{overview.users.pro}</p>
                  <div className="flex items-center mt-2">
                    <Crown className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-600">{overview.users.conversionRate}% conversion</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Crown className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scans</p>
                  <p className="text-3xl font-bold text-gray-900">{overview.scans.total}</p>
                  <div className="flex items-center mt-2">
                    <BarChart3 className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{overview.scans.thisMonth} this month</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(overview.revenue.monthly)}</p>
                  <div className="flex items-center mt-2">
                    <DollarSign className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">{formatCurrency(overview.revenue.averagePerUser)} per user</span>
                  </div>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Health & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          {systemHealth && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-red-600" />
                System Health Monitor
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Database</span>
                  </div>
                  {systemHealth.database === 'healthy' ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Healthy</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">Error</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Bot className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">AI Service</span>
                  </div>
                  {systemHealth.ai === 'configured' ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-sm text-yellow-600">Warning</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Payment System</span>
                  </div>
                  {systemHealth.stripe === 'configured' ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-sm text-yellow-600">Not Configured</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">System Uptime</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor(systemHealth.uptime / 3600)}h {Math.floor((systemHealth.uptime % 3600) / 60)}m
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <div className="text-sm font-medium text-blue-900">Manage Users</div>
                <div className="text-xs text-blue-600">View all users</div>
              </button>

              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                <FileText className="h-6 w-6 text-green-600 mb-2" />
                <div className="text-sm font-medium text-green-900">View Scans</div>
                <div className="text-xs text-green-600">Recent analyses</div>
              </button>

              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                <Bot className="h-6 w-6 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-purple-900">AI Settings</div>
                <div className="text-xs text-purple-600">Configure providers</div>
              </button>

              <button className="p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left">
                <BarChart3 className="h-6 w-6 text-red-600 mb-2" />
                <div className="text-sm font-medium text-red-900">Analytics</div>
                <div className="text-xs text-red-600">View reports</div>
              </button>
            </div>
          </div>
        </div>

        {/* AI Provider Settings */}
        {aiProviderSettings && (
          <div className="bg-white border border-gray-300 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <Bot className="h-5 w-5 mr-2 text-purple-600" />
              AI Provider Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Provider Status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-black">Current Provider:</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {aiProviderSettings.currentProvider.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">OpenAI (GPT-4)</span>
                    {aiProviderSettings.openaiConfigured ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gemini (2.0-Flash)</span>
                    {aiProviderSettings.geminiConfigured ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Provider Selection */}
              <div className="space-y-4">
                <h3 className="font-medium text-black">Switch AI Provider</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleAiProviderChange('openai')}
                    disabled={!aiProviderSettings.openaiConfigured || updatingAiProvider || aiProviderSettings.currentProvider === 'openai'}
                    className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center justify-between ${aiProviderSettings.currentProvider === 'openai'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : aiProviderSettings.openaiConfigured
                        ? 'border-gray-300 hover:border-blue-300 text-black'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">OpenAI GPT-4</span>
                    </div>
                    {aiProviderSettings.currentProvider === 'openai' && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleAiProviderChange('gemini')}
                    disabled={!aiProviderSettings.geminiConfigured || updatingAiProvider || aiProviderSettings.currentProvider === 'gemini'}
                    className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center justify-between ${aiProviderSettings.currentProvider === 'gemini'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : aiProviderSettings.geminiConfigured
                        ? 'border-gray-300 hover:border-purple-300 text-black'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium">Google Gemini 2.0-Flash</span>
                    </div>
                    {aiProviderSettings.currentProvider === 'gemini' && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {updatingAiProvider && (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Updating AI provider...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> Changing the AI provider will affect all new resume analyses.
                  Both providers offer high-quality analysis with slightly different strengths.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
                User Growth (30 days)
              </h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Total Users</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Pro Users</span>
                </div>
              </div>
            </div>
            {userGrowth.length > 0 ? (
              <SimpleChart 
                data={userGrowth.slice(-10).map(item => ({
                  date: formatDate(item.date),
                  total: item.total,
                  pro: item.pro
                }))}
                type="line"
                height={250}
                colors={['#EF4444', '#F59E0B']}
                showGrid={true}
                showLabels={true}
              />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No growth data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Scan Analytics */}
          {overview && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Scan Analytics</h2>
              <div className="space-y-6">
                {/* Scan Type Distribution */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Scan Type Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Quick Scans</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{overview.scans.quick}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(overview.scans.quick / overview.scans.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Pro Scans</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{overview.scans.pro}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${(overview.scans.pro / overview.scans.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time-based Analytics */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-900">{overview.scans.today}</div>
                      <div className="text-xs text-gray-600">Today</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-900">{overview.scans.thisWeek}</div>
                      <div className="text-xs text-gray-600">This Week</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Search className="h-5 w-5 mr-2 text-red-600" />
              User Management
            </h2>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free Users</option>
                <option value="pro">Pro Users</option>
              </select>
              <button
                onClick={handleSearch}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="overflow-x-auto">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Found {searchResults.users.length} users
                </p>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Filter className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <SortAsc className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scans</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.tier === 'pro'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {user.tier === 'pro' && <Crown className="h-3 w-3 mr-1" />}
                          {user.tier.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            ? 'bg-green-400'
                            : 'bg-gray-300'
                            }`}></div>
                          <span className="text-sm text-gray-500">
                            {user.lastLogin ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.totalScans}</div>
                        <div className="text-xs text-gray-500">total scans</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-700 p-1"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {user.tier === 'free' && (
                            <button
                              onClick={() => handleUserUpgrade(user.id)}
                              className="text-yellow-600 hover:text-yellow-700 p-1"
                              title="Upgrade to Pro"
                            >
                              <Crown className="h-4 w-4" />
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center">
              View All
              <ExternalLink className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scans</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.tier === 'pro'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.tier === 'pro' && <Crown className="h-3 w-3 mr-1" />}
                        {user.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{user.totalScans}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                          ? 'bg-green-400'
                          : 'bg-gray-300'
                          }`}></div>
                        <span className={`text-xs ${user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                          ? 'text-green-600'
                          : 'text-gray-500'
                          }`}>
                          {user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            ? 'Active'
                            : 'Inactive'
                          }
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;