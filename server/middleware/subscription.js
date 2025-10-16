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

export const checkSubscriptionLimits = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Pro users have unlimited access
    if (user.tier === 'pro') {
      return next();
    }

    // Check free tier limits (1 scan per week)
    const now = new Date();
    const startOfWeek = new Date(now);
    // Set to Monday 00:00 UTC
    const day = startOfWeek.getUTCDay();
    const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setUTCDate(diff);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const scansThisWeek = user.scanHistory?.filter(scan => 
      new Date(scan.createdAt) >= startOfWeek
    ).length || 0;

    if (scansThisWeek >= 1) {
      const nextWeek = new Date(startOfWeek);
      nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
      
      return res.status(429).json({
        success: false,
        message: 'Weekly scan limit reached',
        code: 'SCAN_LIMIT_REACHED',
        upgradeUrl: '/pricing',
        resetDate: nextWeek.toISOString(),
        scansUsed: scansThisWeek,
        scansRemaining: 0,
        tier: 'free'
      });
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