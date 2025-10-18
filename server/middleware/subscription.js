import { getSubscriptionInfo } from '../services/stripeService.js';

export const requireProSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has pro tier
    if (user.tier !== 'pro') {
      return res.status(403).json({
        success: false,
        message: 'Pro subscription required',
        code: 'SUBSCRIPTION_REQUIRED',
        upgradeUrl: '/pricing'
      });
    }

    // Verify subscription is still active
    try {
      const subscriptionInfo = await getSubscriptionInfo(user._id);
      
      if (subscriptionInfo && !['active', 'trialing'].includes(subscriptionInfo.status)) {
        // Subscription is not active, downgrade user
        user.tier = 'free';
        await user.save();
        
        return res.status(403).json({
          success: false,
          message: 'Subscription is not active',
          code: 'SUBSCRIPTION_INACTIVE',
          upgradeUrl: '/pricing'
        });
      }
    } catch (subscriptionError) {
      console.error('Error checking subscription:', subscriptionError);
      // Continue with the request if we can't verify subscription
      // This prevents service disruption due to Stripe API issues
    }

    next();
  } catch (error) {
    console.error('Subscription middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to calculate unused Pro scans from free tier
const calculateUnusedFreeProScans = (user) => {
  if (!user.upgradeDate) return 0; // No upgrade date means no unused scans
  
  const upgradeDate = new Date(user.upgradeDate);
  const now = new Date();
  
  // Calculate weeks since upgrade in current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const upgradeInCurrentMonth = upgradeDate >= startOfMonth;
  
  if (!upgradeInCurrentMonth) return 0; // Upgrade was in previous month
  
  // Calculate how many weeks were left when user upgraded
  const weeksInMonth = Math.ceil((new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) / 7);
  const weekOfUpgrade = Math.ceil(upgradeDate.getDate() / 7);
  const remainingWeeks = weeksInMonth - weekOfUpgrade + 1;
  
  // Each week has 2 Pro scans for free users
  const potentialFreeProScans = remainingWeeks * 2;
  
  // Count Pro scans used as free user after upgrade date
  const proScansUsedAsFree = user.scanHistory?.filter(scan => {
    const scanDate = new Date(scan.createdAt);
    return scanDate >= upgradeDate && 
           scanDate >= startOfMonth &&
           scan.analysisResults?.analysisType === 'pro' &&
           scan.tierAtTime === 'free'; // We'll need to track this
  }).length || 0;
  
  return Math.max(0, potentialFreeProScans - proScansUsedAsFree);
};

export const checkSubscriptionLimits = async (req, res, next) => {
  try {
    const user = req.user;
    const { analysisType } = req.body; // Get analysis type from request
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const now = new Date();

    if (user.tier === 'pro') {
      // Pro users: Unlimited quick scans, 15 Pro scans/month + unused free Pro scans
      if (analysisType === 'quick') {
        // Quick scans are unlimited for Pro users
        req.scanInfo = {
          analysisType: 'quick',
          unlimited: true,
          tier: 'pro'
        };
        return next();
      }

      // For Pro analysis, check monthly limits
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const proScansThisMonth = user.scanHistory?.filter(scan => 
        new Date(scan.createdAt) >= startOfMonth && 
        scan.analysisResults?.analysisType === 'pro'
      ).length || 0;

      // Calculate bonus scans from unused free tier Pro scans
      const unusedFreeProScans = calculateUnusedFreeProScans(user);
      const totalProLimit = 15 + unusedFreeProScans;

      if (proScansThisMonth >= totalProLimit) {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        return res.status(429).json({
          success: false,
          message: `Monthly Pro analysis limit reached (${totalProLimit} Pro scans)`,
          code: 'SCAN_LIMIT_REACHED',
          resetDate: nextMonth.toISOString(),
          scansUsed: proScansThisMonth,
          scansRemaining: totalProLimit - proScansThisMonth,
          tier: 'pro',
          maxScans: totalProLimit,
          baseLimit: 15,
          bonusScans: unusedFreeProScans
        });
      }

      // Add scan count info to response for Pro users
      req.scanInfo = {
        scansUsed: proScansThisMonth,
        scansRemaining: totalProLimit - proScansThisMonth,
        tier: 'pro',
        maxScans: totalProLimit,
        baseLimit: 15,
        bonusScans: unusedFreeProScans,
        analysisType: 'pro'
      };

      return next();
    }

    // Free tier limits: 3 quick scans + 2 Pro scans per week
    const startOfWeek = new Date(now);
    // Set to Monday 00:00 UTC
    const day = startOfWeek.getUTCDay();
    const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setUTCDate(diff);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const quickScansThisWeek = user.scanHistory?.filter(scan => 
      new Date(scan.createdAt) >= startOfWeek && 
      scan.analysisResults?.analysisType === 'quick'
    ).length || 0;

    const proScansThisWeek = user.scanHistory?.filter(scan => 
      new Date(scan.createdAt) >= startOfWeek && 
      scan.analysisResults?.analysisType === 'pro'
    ).length || 0;

    // Check limits based on analysis type
    if (analysisType === 'quick') {
      if (quickScansThisWeek >= 3) {
        const nextWeek = new Date(startOfWeek);
        nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
        
        return res.status(429).json({
          success: false,
          message: 'Weekly quick scan limit reached (3 per week)',
          code: 'SCAN_LIMIT_REACHED',
          upgradeUrl: '/pricing',
          resetDate: nextWeek.toISOString(),
          scansUsed: quickScansThisWeek,
          scansRemaining: 3 - quickScansThisWeek,
          tier: 'free',
          maxScans: 3,
          analysisType: 'quick'
        });
      }

      req.scanInfo = {
        scansUsed: quickScansThisWeek,
        scansRemaining: 3 - quickScansThisWeek,
        tier: 'free',
        maxScans: 3,
        analysisType: 'quick'
      };
    } else if (analysisType === 'pro') {
      if (proScansThisWeek >= 2) {
        const nextWeek = new Date(startOfWeek);
        nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
        
        return res.status(429).json({
          success: false,
          message: 'Weekly Pro analysis limit reached (2 per week)',
          code: 'SCAN_LIMIT_REACHED',
          upgradeUrl: '/pricing',
          resetDate: nextWeek.toISOString(),
          scansUsed: proScansThisWeek,
          scansRemaining: 2 - proScansThisWeek,
          tier: 'free',
          maxScans: 2,
          analysisType: 'pro'
        });
      }

      req.scanInfo = {
        scansUsed: proScansThisWeek,
        scansRemaining: 2 - proScansThisWeek,
        tier: 'free',
        maxScans: 2,
        analysisType: 'pro'
      };
    }

    next();
  } catch (error) {
    console.error('Subscription limits middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};