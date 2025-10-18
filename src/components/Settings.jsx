import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStripe } from '../contexts/StripeContext';
import { ArrowLeft, User, Crown, Mail, Calendar, CreditCard, Loader2, ExternalLink, 
         Settings as SettingsIcon, Shield, Bell, Trash2, Check, X, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { subscription, openCustomerPortal, cancelSubscription, reactivateSubscription, loading } = useStripe();
  const [actionLoading, setActionLoading] = useState(false);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    emailTips: true,
    emailFeatures: true,
    emailJobs: false
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  
  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
      // Load preferences from user data or defaults
      setPreferences({
        emailTips: user.preferences?.emailTips ?? true,
        emailFeatures: user.preferences?.emailFeatures ?? true,
        emailJobs: user.preferences?.emailJobs ?? false
      });
    }
  }, [user]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };

  // API helper
  const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  };

  // Profile update handler
  const handleProfileUpdate = async () => {
    if (!profileData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      await apiCall('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: profileData.name.trim() })
      });
      
      await refreshUser();
      setIsEditingProfile(false);
      showToast('Profile updated successfully');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiCall('/api/user/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Preferences update handler
  const handlePreferenceToggle = async (key) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    
    setPreferencesLoading(true);
    try {
      await apiCall('/api/user/preferences', {
        method: 'PUT',
        body: JSON.stringify(newPreferences)
      });
      showToast('Preferences updated');
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
      showToast(error.message, 'error');
    } finally {
      setPreferencesLoading(false);
    }
  };

  // Account deletion handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error');
      return;
    }

    setDeleteLoading(true);
    try {
      await apiCall('/api/user/account', { method: 'DELETE' });
      
      // Clear local storage and redirect
      localStorage.removeItem('token');
      navigate('/');
      showToast('Account deleted successfully');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Edit
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  {isEditingProfile ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="email"
                            value={profileData.email}
                            disabled
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                          <span className="text-green-600 text-sm flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Verified
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleProfileUpdate}
                          disabled={profileLoading}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                        >
                          {profileLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileData({ name: user?.name || '', email: user?.email || '' });
                          }}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                      <p className="text-gray-600 flex items-center">
                        {user?.email}
                        <Check className="h-4 w-4 ml-2 text-green-600" />
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {!isEditingProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-600">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Password Management
            </h2>
            <p className="text-gray-600 mb-4">Keep your account secure with a strong password</p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Change Password
            </button>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Subscription
            </h2>
            
            {user?.tier === 'pro' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    <div>
                      <p className="font-medium text-gray-900">Pro Plan ($10/month)</p>
                      <p className="text-sm text-gray-600">15 Pro analyses per month + unlimited quick scans</p>
                    </div>
                  </div>
                </div>

                {subscription && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status</p>
                        <p className={`text-sm capitalize ${
                          subscription.status === 'active' ? 'text-green-600' : 
                          subscription.cancel_at_period_end ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {subscription.cancel_at_period_end ? 'Canceling' : subscription.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {subscription.cancel_at_period_end ? 'Ends' : 'Next Billing Date'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Payment Method</p>
                        <p className="text-sm text-gray-600">Visa •••• 4242</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t">
                      <button
                        onClick={async () => {
                          setActionLoading(true);
                          try {
                            await openCustomerPortal();
                          } catch (error) {
                            showToast('Failed to open customer portal', 'error');
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        disabled={loading || actionLoading}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        <span>Manage Subscription</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>

                      <button
                        onClick={async () => {
                          setActionLoading(true);
                          try {
                            await openCustomerPortal();
                          } catch (error) {
                            showToast('Failed to open billing history', 'error');
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        disabled={loading || actionLoading}
                        className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>View Billing History</span>
                      </button>

                      {subscription.cancel_at_period_end ? (
                        <button
                          onClick={async () => {
                            setActionLoading(true);
                            try {
                              await reactivateSubscription();
                              showToast('Subscription reactivated successfully!');
                            } catch (error) {
                              showToast('Failed to reactivate subscription', 'error');
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          disabled={loading || actionLoading}
                          className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Crown className="h-4 w-4" />
                          )}
                          <span>Reactivate</span>
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.')) {
                              setActionLoading(true);
                              try {
                                await cancelSubscription();
                                showToast('Subscription will be canceled at the end of the current period.');
                              } catch (error) {
                                showToast('Failed to cancel subscription', 'error');
                              } finally {
                                setActionLoading(false);
                              }
                            }
                          }}
                          disabled={loading || actionLoading}
                          className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span>Cancel Subscription</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Free Plan</p>
                      <p className="text-sm text-gray-600">3 quick scans + 2 Pro analyses per week</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-gray-900 mb-2">Upgrade to Pro - $10/month</h3>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• 15 Pro analyses per month + unlimited quick scans</li>
                    <li>• Job-specific analysis and optimization</li>
                    <li>• Advanced ATS compatibility checking</li>
                    <li>• Priority customer support</li>
                    <li>• Export detailed reports</li>
                  </ul>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Upgrade to Pro - $10/month
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Preferences
            </h2>
            <p className="text-gray-600 mb-4">Manage your email notifications and preferences</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email me weekly resume tips</p>
                  <p className="text-sm text-gray-600">Get expert advice to improve your resume</p>
                </div>
                <button
                  onClick={() => handlePreferenceToggle('emailTips')}
                  disabled={preferencesLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailTips ? 'bg-purple-600' : 'bg-gray-200'
                  } disabled:opacity-50`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailTips ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Notify me of new features</p>
                  <p className="text-sm text-gray-600">Be the first to know about updates</p>
                </div>
                <button
                  onClick={() => handlePreferenceToggle('emailFeatures')}
                  disabled={preferencesLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailFeatures ? 'bg-purple-600' : 'bg-gray-200'
                  } disabled:opacity-50`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailFeatures ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Send me job search resources</p>
                  <p className="text-sm text-gray-600">Career tips and job opportunities</p>
                </div>
                <button
                  onClick={() => handlePreferenceToggle('emailJobs')}
                  disabled={preferencesLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailJobs ? 'bg-purple-600' : 'bg-gray-200'
                  } disabled:opacity-50`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailJobs ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow border-2 border-red-200 p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Danger Zone
            </h2>
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter new password (min 8 chars)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handlePasswordChange}
                disabled={passwordLoading}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Password
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setShowPasswords({ current: false, new: false, confirm: false });
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 font-medium mb-2">⚠️ This action cannot be undone!</p>
                <p className="text-red-700 text-sm">
                  This will permanently delete your account, all your resume scans, analysis results, 
                  and cancel any active subscriptions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <strong>DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Type DELETE to confirm"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Permanently Delete Account
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;