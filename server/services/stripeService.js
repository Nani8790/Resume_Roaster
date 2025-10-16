import Stripe from 'stripe';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

// Initialize Stripe only if secret key is provided and not a placeholder
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && 
    process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here' &&
    process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('Stripe initialized successfully');
} else {
  console.warn('Stripe not initialized - missing or invalid STRIPE_SECRET_KEY');
}

export const createCheckoutSession = async (userId, priceId) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      customerId = customer.id;
      user.stripe_customer_id = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/subscription/success`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
      metadata: {
        userId: user._id.toString()
      }
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createCustomerPortalSession = async (userId) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  
  try {
    const user = await User.findById(userId);
    if (!user || !user.stripe_customer_id) {
      throw new Error('User not found or no Stripe customer ID');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.CLIENT_URL}/settings`,
    });

    return session;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
};

export const handleWebhookEvent = async (event) => {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    throw error;
  }
};

const handleCheckoutCompleted = async (session) => {
  try {
    const userId = session.metadata.userId;
    const customerId = session.customer;
    
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Update user to pro tier
    const user = await User.findById(userId);
    if (user) {
      user.tier = 'pro';
      user.stripe_customer_id = customerId;
      await user.save();
    }

    // Create subscription record
    await Subscription.create({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
    });

    console.log(`User ${userId} upgraded to Pro successfully`);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
    throw error;
  }
};

const handleSubscriptionUpdated = async (subscription) => {
  try {
    // Update subscription record
    await Subscription.findOneAndUpdate(
      { stripe_subscription_id: subscription.id },
      {
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null
      }
    );

    // Update user tier based on subscription status
    const user = await User.findOne({ stripe_customer_id: subscription.customer });
    if (user) {
      if (['active', 'trialing'].includes(subscription.status)) {
        user.tier = 'pro';
      } else if (['canceled', 'incomplete_expired', 'unpaid'].includes(subscription.status)) {
        user.tier = 'free';
      }
      await user.save();
    }

    console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  try {
    // Update subscription record
    await Subscription.findOneAndUpdate(
      { stripe_subscription_id: subscription.id },
      {
        status: 'canceled',
        canceled_at: new Date()
      }
    );

    // Downgrade user to free tier
    const user = await User.findOne({ stripe_customer_id: subscription.customer });
    if (user) {
      user.tier = 'free';
      await user.save();
    }

    console.log(`User downgraded to free tier for subscription: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
};

const handlePaymentFailed = async (invoice) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const user = await User.findOne({ stripe_customer_id: subscription.customer });
    
    if (user) {
      // You could send an email notification here
      console.log(`Payment failed for user: ${user.email}`);
      
      // Optionally downgrade user if payment fails multiple times
      if (subscription.status === 'unpaid') {
        user.tier = 'free';
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
};

export const getSubscriptionInfo = async (userId) => {
  if (!stripe) {
    return null;
  }
  
  try {
    const subscription = await Subscription.findOne({ user_id: userId });
    if (!subscription) {
      return null;
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    
    return {
      ...subscription.toObject(),
      stripe_data: stripeSubscription
    };
  } catch (error) {
    console.error('Error getting subscription info:', error);
    throw error;
  }
};

export const cancelAllSubscriptions = async (customerId) => {
  if (!stripe) {
    console.warn('Stripe not configured - cannot cancel subscriptions');
    return { canceled: 0 };
  }
  
  try {
    // Get all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active'
    });

    // Cancel each active subscription
    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.cancel(subscription.id);
      console.log(`Canceled subscription: ${subscription.id}`);
    }

    return { canceled: subscriptions.data.length };
  } catch (error) {
    console.error('Error canceling subscriptions:', error);
    throw error;
  }
};

export default stripe;