import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Update user profile
router.put('/profile', authenticateToken, [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name } = req.body;
    const user = req.user;

    user.name = name.trim();
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { emailTips, emailFeatures, emailJobs } = req.body;
    const user = req.user;

    // Initialize preferences if they don't exist
    if (!user.preferences) {
      user.preferences = {};
    }

    // Update preferences
    user.preferences.emailTips = Boolean(emailTips);
    user.preferences.emailFeatures = Boolean(emailFeatures);
    user.preferences.emailJobs = Boolean(emailJobs);

    // Mark the preferences field as modified for Mongoose
    user.markModified('preferences');
    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // If user has a Stripe subscription, cancel it
    if (user.stripe_customer_id) {
      try {
        const { cancelAllSubscriptions } = await import('../services/stripeService.js');
        await cancelAllSubscriptions(user.stripe_customer_id);
      } catch (stripeError) {
        console.error('Error canceling Stripe subscriptions:', stripeError);
        // Continue with account deletion even if Stripe cancellation fails
      }
    }

    // Delete user from database
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    // This would typically come from a notifications collection
    // For now, return mock notifications based on user activity
    const user = req.user;

    const notifications = [];

    // Add upgrade notification for free users
    if (user.tier === 'free') {
      notifications.push({
        id: 1,
        title: 'Upgrade to Pro',
        message: 'Unlock unlimited scans and advanced features',
        type: 'upgrade',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      });
    }

    // Add welcome notification for new users
    const daysSinceJoined = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    if (daysSinceJoined <= 7) {
      notifications.push({
        id: 2,
        title: 'Welcome to Resume Roaster!',
        message: 'Get started by uploading your first resume for analysis',
        type: 'welcome',
        read: false,
        createdAt: user.createdAt
      });
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      success: true,
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error('User notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get user analytics (Pro feature)
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Check if user has Pro access
    if (user.tier !== 'pro') {
      return res.status(403).json({
        success: false,
        message: 'Analytics are available for Pro users only'
      });
    }

    const { range = '30d' } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get user's scan history
    const scanHistory = user.scanHistory || [];
    const filteredScans = scanHistory.filter(scan =>
      new Date(scan.createdAt) >= startDate && scan.analysisResults
    );

    // Calculate analytics
    const totalScans = filteredScans.length;
    const scores = filteredScans
      .map(scan => scan.analysisResults?.score)
      .filter(score => score !== undefined);

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

    const topScore = scores.length > 0 ? Math.max(...scores) : 0;
    const firstScore = scores.length > 0 ? scores[0] : 0;
    const improvement = firstScore > 0 ? Math.round(((topScore - firstScore) / firstScore) * 100) : 0;

    // Generate score history (mock data for demonstration)
    const scoreHistory = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      scoreHistory.push({
        date: date.toISOString().split('T')[0],
        score: Math.min(100, avgScore + Math.random() * 20 - 10),
        jobMatch: Math.min(100, avgScore + Math.random() * 15 - 7)
      });
    }

    const analytics = {
      overview: {
        totalScans,
        avgScore,
        improvement,
        topScore
      },
      scoreHistory,
      skillsAnalysis: [
        { skill: 'JavaScript', score: 85, trend: 'up' },
        { skill: 'React', score: 80, trend: 'up' },
        { skill: 'Node.js', score: 75, trend: 'stable' },
        { skill: 'Python', score: 70, trend: 'down' },
        { skill: 'SQL', score: 65, trend: 'up' }
      ],
      industryComparison: [
        { industry: 'Technology', yourScore: avgScore, avgScore: 72 },
        { industry: 'Finance', yourScore: Math.max(0, avgScore - 3), avgScore: 70 },
        { industry: 'Healthcare', yourScore: Math.max(0, avgScore + 2), avgScore: 68 },
        { industry: 'Education', yourScore: Math.max(0, avgScore + 4), avgScore: 74 }
      ],
      scanTypes: [
        {
          name: 'Quick Scans',
          value: filteredScans.filter(s => s.analysisResults?.analysisType === 'quick').length,
          color: '#3B82F6'
        },
        {
          name: 'Pro Scans',
          value: filteredScans.filter(s => s.analysisResults?.analysisType === 'pro').length,
          color: '#8B5CF6'
        }
      ],
      weeklyActivity: [
        { day: 'Mon', scans: Math.floor(Math.random() * 5) + 1 },
        { day: 'Tue', scans: Math.floor(Math.random() * 5) + 1 },
        { day: 'Wed', scans: Math.floor(Math.random() * 5) + 1 },
        { day: 'Thu', scans: Math.floor(Math.random() * 5) + 1 },
        { day: 'Fri', scans: Math.floor(Math.random() * 5) + 1 },
        { day: 'Sat', scans: Math.floor(Math.random() * 3) + 1 },
        { day: 'Sun', scans: Math.floor(Math.random() * 3) + 1 }
      ]
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

export default router;