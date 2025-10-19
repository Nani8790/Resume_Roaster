import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Activity,
  Search,
  Crown,
  Eye,
  UserPlus,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');

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
    <div className="bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black flex items-center">
                Dashboard Overview
              </h1>
              <p className="text-gray-700 mt-2">
                Monitor your Resume Roaster platform performance and analytics
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-300 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-black">{overview.users.total}</p>
                  <p className="text-xs text-green-600">+{overview.users.newThisMonth} this month</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pro Users</p>
                  <p className="text-2xl font-bold text-black">{overview.users.pro}</p>
                  <p className="text-xs text-blue-600">{overview.users.conversionRate}% conversion</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg shadow p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Scans</p>
                  <p className="text-2xl font-bold text-black">{overview.scans.total}</p>
                  <p className="text-xs text-green-600">+{overview.scans.thisMonth} this month</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-black">{formatCurrency(overview.revenue.monthly)}</p>
                  <p className="text-xs text-red-600">{formatCurrency(overview.revenue.averagePerUser)} per user</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Health */}
        {systemHealth && (
          <div className="bg-white border border-gray-300 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-red-600" />
              System Health Monitor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                {systemHealth.database === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <span className="text-sm text-black">Database: {systemHealth.database}</span>
              </div>
              <div className="flex items-center">
                {systemHealth.ai === 'configured' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                )}
                <span className="text-sm text-black">AI Service: {systemHealth.ai}</span>
              </div>
              <div className="flex items-center">
                {systemHealth.stripe === 'configured' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                )}
                <span className="text-sm text-black">Stripe: {systemHealth.stripe}</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              Uptime: {Math.floor(systemHealth.uptime / 3600)}h {Math.floor((systemHealth.uptime % 3600) / 60)}m
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white border border-gray-300 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
              User Growth (30 days)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="#374151"
                  />
                  <YAxis stroke="#374151" />
                  <Tooltip
                    labelFormatter={(date) => formatDate(date)}
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', color: '#000000' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="pro" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scan Analytics */}
          {overview && (
            <div className="bg-white border border-gray-300 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-black mb-4">Scan Analytics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quick Scans</span>
                  <span className="font-semibold text-black">{overview.scans.quick}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pro Scans</span>
                  <span className="font-semibold text-black">{overview.scans.pro}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Today</span>
                  <span className="font-semibold text-black">{overview.scans.today}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-semibold text-black">{overview.scans.thisWeek}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Search */}
        <div className="bg-white border border-gray-300 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center">
            <Search className="h-5 w-5 mr-2 text-red-600" />
            User Management
          </h2>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-gray-500"
              />
            </div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
            <button
              onClick={handleSearch}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Scans</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-300">
                  {searchResults.users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-black">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.tier === 'pro'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-gray-200 text-gray-800'
                          }`}>
                          {user.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {user.totalScans}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.tier === 'free' && (
                          <button
                            onClick={() => handleUserUpgrade(user.id)}
                            className="text-red-600 hover:text-red-700 mr-3"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white border border-gray-300 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-black mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Scans</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-black">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.tier === 'pro'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-gray-200 text-gray-800'
                        }`}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {user.totalScans}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;