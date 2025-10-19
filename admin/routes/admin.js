import express from 'express';
import User from '../../server/models/User.js';
import { authenticateToken } from '../../server/middleware/auth.js';

const router = express.Router();

// Secret admin path - only accessible via specific URL
const ADMIN_SECRET_PATH = '7780488674';

// Enhanced admin authentication middleware with logging
const authenticateAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      console.warn('🚨 SECURITY: Unauthenticated admin access attempt', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        path: req.path
      });
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is admin (you can modify this logic)
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());
    
    if (!adminEmails.includes(req.user.email)) {
      // Log unauthorized access attempt
      console.warn('🚨 SECURITY ALERT: Unauthorized admin access attempt', {
        user: req.user.email,
        userId: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        path: req.path,
        adminEmails: adminEmails.length
      });
      
      return res.status(403).json({
        success: false,
        message: 'Administrative privileges required'
      });
    }

    // Log successful admin access
    console.log('✅ ADMIN ACCESS: Authorized admin login', {
      admin: req.user.email,
      timestamp: new Date().toISOString(),
      path: req.path
    });

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Dashboard overview stats
router.get(`/${ADMIN_SECRET_PATH}/dashboard/overview`, authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // User statistics
    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ tier: 'pro' });
    const freeUsers = totalUsers - proUsers;
    
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: startOfDay }
    });
    
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Active users (logged in within last 7 days)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) }
    });

    // Conversion rate
    const conversionRate = totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(2) : 0;

    // Scan statistics
    const allUsers = await User.find({}, { scanHistory: 1 });
    let totalScans = 0;
    let scansToday = 0;
    let scansThisWeek = 0;
    let scansThisMonth = 0;
    let quickScans = 0;
    let proScans = 0;

    allUsers.forEach(user => {
      if (user.scanHistory) {
        totalScans += user.scanHistory.length;
        
        user.scanHistory.forEach(scan => {
          const scanDate = new Date(scan.createdAt);
          
          if (scanDate >= startOfDay) scansToday++;
          if (scanDate >= startOfWeek) scansThisWeek++;
          if (scanDate >= startOfMonth) scansThisMonth++;
          
          if (scan.analysisResults?.analysisType === 'quick') quickScans++;
          if (scan.analysisResults?.analysisType === 'pro') proScans++;
        });
      }
    });

    // Revenue calculations (integrate with Stripe for real data)
    const monthlyRevenue = proUsers * 10; // Assuming $10/month
    const totalRevenue = monthlyRevenue; // Simplified for now

    // Log admin dashboard access
    console.log('📊 ADMIN DASHBOARD: Overview accessed', {
      admin: req.user.email,
      timestamp: new Date().toISOString(),
      metrics: {
        totalUsers,
        proUsers,
        totalScans,
        monthlyRevenue
      }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          pro: proUsers,
          free: freeUsers,
          active: activeUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          conversionRate: parseFloat(conversionRate)
        },
        scans: {
          total: totalScans,
          today: scansToday,
          thisWeek: scansThisWeek,
          thisMonth: scansThisMonth,
          quick: quickScans,
          pro: proScans
        },
        revenue: {
          monthly: monthlyRevenue,
          total: totalRevenue,
          averagePerUser: totalUsers > 0 ? (totalRevenue / totalUsers).toFixed(2) : 0
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// User growth chart data
router.get(`/${ADMIN_SECRET_PATH}/dashboard/user-growth`, authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            tier: "$tier"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Format data for chart
    const chartData = {};
    userGrowth.forEach(item => {
      const date = item._id.date;
      if (!chartData[date]) {
        chartData[date] = { date, free: 0, pro: 0, total: 0 };
      }
      chartData[date][item._id.tier] = item.count;
      chartData[date].total += item.count;
    });

    const formattedData = Object.values(chartData);

    res.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('User growth chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user growth data'
    });
  }
});

// Recent users list
router.get(`/${ADMIN_SECRET_PATH}/dashboard/recent-users`, authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email tier createdAt lastLogin scanHistory');

    const formattedUsers = recentUsers.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      totalScans: user.scanHistory ? user.scanHistory.length : 0
    }));

    res.json({
      success: true,
      data: formattedUsers
    });

  } catch (error) {
    console.error('Recent users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent users'
    });
  }
});

// User search
router.get(`/${ADMIN_SECRET_PATH}/dashboard/users/search`, authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { q, tier, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (tier && tier !== 'all') {
      query.tier = tier;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('name email tier createdAt lastLogin scanHistory upgradeDate');

    const total = await User.countDocuments(query);

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      upgradeDate: user.upgradeDate,
      totalScans: user.scanHistory ? user.scanHistory.length : 0,
      recentScans: user.scanHistory ? user.scanHistory.slice(-3).length : 0
    }));

    // Log admin search activity
    console.log('🔍 ADMIN SEARCH: User search performed', {
      admin: req.user.email,
      query: q,
      tier,
      resultsCount: formattedUsers.length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

// Get user details
router.get(`/${ADMIN_SECRET_PATH}/dashboard/users/:userId`, authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate user stats
    const scanHistory = user.scanHistory || [];
    const totalScans = scanHistory.length;
    const scansWithScores = scanHistory.filter(scan => 
      scan.analysisResults && scan.analysisResults.score
    );
    const avgScore = scansWithScores.length > 0 
      ? Math.round(scansWithScores.reduce((sum, scan) => sum + scan.analysisResults.score, 0) / scansWithScores.length)
      : 0;

    const recentScans = scanHistory
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(scan => ({
        id: scan.fileId,
        filename: scan.originalName,
        date: scan.createdAt,
        score: scan.analysisResults?.score || null,
        analysisType: scan.analysisResults?.analysisType || null
      }));

    // Log admin user view
    console.log('👤 ADMIN USER VIEW: User details accessed', {
      admin: req.user.email,
      viewedUser: user.email,
      userId: user._id,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          tier: user.tier,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          upgradeDate: user.upgradeDate,
          emailVerified: user.emailVerified,
          googleId: user.googleId,
          stripeCustomerId: user.stripe_customer_id
        },
        stats: {
          totalScans,
          avgScore,
          recentScans
        }
      }
    });

  } catch (error) {
    console.error('User details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
});

// Upgrade user to Pro
router.post(`/${ADMIN_SECRET_PATH}/dashboard/users/:userId/upgrade`, authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.tier === 'pro') {
      return res.status(400).json({
        success: false,
        message: 'User is already Pro'
      });
    }

    const previousTier = user.tier;
    user.tier = 'pro';
    user.upgradeDate = new Date();
    await user.save();

    // Log admin user upgrade
    console.log('⬆️ ADMIN ACTION: User upgraded to Pro', {
      admin: req.user.email,
      upgradedUser: user.email,
      userId: user._id,
      previousTier,
      newTier: 'pro',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'User upgraded to Pro successfully',
      data: {
        userId: user._id,
        tier: user.tier,
        upgradeDate: user.upgradeDate
      }
    });

  } catch (error) {
    console.error('User upgrade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade user'
    });
  }
});

// System health check
router.get(`/${ADMIN_SECRET_PATH}/dashboard/health`, authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const dbStatus = await User.countDocuments() >= 0 ? 'healthy' : 'error';
    const aiStatus = process.env.OPENAI_API_KEY ? 'configured' : 'not_configured';
    const stripeStatus = process.env.STRIPE_SECRET_KEY && 
                        process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here' 
                        ? 'configured' : 'not_configured';

    res.json({
      success: true,
      data: {
        database: dbStatus,
        ai: aiStatus,
        stripe: stripeStatus,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
});

// Admin activity log endpoint (for monitoring admin actions)
router.get(`/${ADMIN_SECRET_PATH}/dashboard/activity-log`, authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    // This would typically read from a dedicated logging system
    // For now, return a simple response
    res.json({
      success: true,
      data: {
        message: 'Activity logging is active',
        note: 'Admin actions are being logged to console and can be integrated with external logging services'
      }
    });
  } catch (error) {
    console.error('Activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log'
    });
  }
});

export default router;