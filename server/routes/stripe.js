import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  createCheckoutSession, 
  createCustomerPortalSession, 
  handleWebhookEvent,
  getSubscriptionInfo 
} from '../services/stripeService.js';
import stripe from '../services/stripeService.js';

const router = express.Router();

// Create checkout session
router.post('/create-checkout', authenticateToken, async (req, res) => {
  try {
    const { price_id } = req.body;
    const userId = req.user._id;

    if (!price_id) {
      return res.status(400).json({
        success: false,
        message: 'Price ID is required'
      });
    }

    // Use environment variable or provided price_id
    const priceId = price_id || process.env.STRIPE_PRICE_ID;

    const session = await createCheckoutSession(userId, priceId);

    res.json({
      success: true,
      url: session.url,
      session_id: session.id
    });

  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

// Create customer portal session
router.post('/customer-portal', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const session = await createCustomerPortalSession(userId);

    res.json({
      success: true,
      url: session.url
    });

  } catch (error) {
    console.error('Customer portal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer portal session',
      error: error.message
    });
  }
});

// Webhook is handled directly in server/index.js to ensure raw body parsing

// Get subscription info
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptionInfo = await getSubscriptionInfo(userId);

    if (!subscriptionInfo) {
      return res.json({
        success: true,
        subscription: null,
        tier: req.user.tier
      });
    }

    res.json({
      success: true,
      subscription: {
        status: subscriptionInfo.status,
        current_period_end: subscriptionInfo.current_period_end,
        cancel_at_period_end: subscriptionInfo.cancel_at_period_end,
        canceled_at: subscriptionInfo.canceled_at
      },
      tier: req.user.tier
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription info',
      error: error.message
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptionInfo = await getSubscriptionInfo(userId);

    if (!subscriptionInfo) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel at period end
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionInfo.stripe_subscription_id,
      {
        cancel_at_period_end: true
      }
    );

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period',
      cancel_at_period_end: updatedSubscription.cancel_at_period_end,
      current_period_end: new Date(updatedSubscription.current_period_end * 1000)
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

// Reactivate subscription
router.post('/reactivate-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptionInfo = await getSubscriptionInfo(userId);

    if (!subscriptionInfo) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    // Remove cancellation
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionInfo.stripe_subscription_id,
      {
        cancel_at_period_end: false
      }
    );

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      cancel_at_period_end: updatedSubscription.cancel_at_period_end
    });

  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription',
      error: error.message
    });
  }
});

export default router;