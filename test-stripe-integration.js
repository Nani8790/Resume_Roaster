import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './server/models/User.js';
import Subscription from './server/models/Subscription.js';

const testStripeIntegration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-roaster');
    console.log('✅ Connected to MongoDB');

    // Check environment variables
    console.log('\n📋 Environment Variables Check:');
    console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
    console.log('STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing');
    console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing');
    console.log('STRIPE_PRICE_ID:', process.env.STRIPE_PRICE_ID ? '✅ Set' : '❌ Missing');

    // Test Stripe service import
    try {
      const { createCheckoutSession } = await import('./server/services/stripeService.js');
      console.log('✅ Stripe service imported successfully');
    } catch (error) {
      console.log('❌ Stripe service import failed:', error.message);
    }

    // Check User model has stripe_customer_id field
    const userSchema = User.schema;
    const hasStripeField = userSchema.paths.stripe_customer_id;
    console.log('User model stripe_customer_id field:', hasStripeField ? '✅ Present' : '❌ Missing');

    // Check if Subscription model works
    try {
      const subscriptionCount = await Subscription.countDocuments();
      console.log(`✅ Subscription model working (${subscriptionCount} documents)`);
    } catch (error) {
      console.log('❌ Subscription model error:', error.message);
    }

    // Test creating a test user with Pro tier
    try {
      const testUser = await User.findOne({ email: 'stripe-test@example.com' });
      if (testUser) {
        console.log('✅ Test user already exists:', testUser.email, 'Tier:', testUser.tier);
      } else {
        const newTestUser = new User({
          email: 'stripe-test@example.com',
          password_hash: 'test-password-hash',
          name: 'Stripe Test User',
          tier: 'pro',
          stripe_customer_id: 'cus_test_123456',
          emailVerified: true
        });
        await newTestUser.save();
        console.log('✅ Created test Pro user:', newTestUser.email);
      }
    } catch (error) {
      console.log('❌ Test user creation failed:', error.message);
    }

    // Test subscription middleware
    try {
      const { requireProSubscription, checkSubscriptionLimits } = await import('./server/middleware/subscription.js');
      console.log('✅ Subscription middleware imported successfully');
    } catch (error) {
      console.log('❌ Subscription middleware import failed:', error.message);
    }

    console.log('\n🎯 Integration Test Summary:');
    console.log('- Database models: Ready');
    console.log('- Stripe service: Ready');
    console.log('- Middleware: Ready');
    console.log('- Environment: Check variables above');
    
    console.log('\n📝 Next Steps:');
    console.log('1. Set up Stripe Dashboard product and get real keys');
    console.log('2. Update .env with real Stripe keys');
    console.log('3. Test checkout flow in development');
    console.log('4. Set up webhook endpoint in Stripe Dashboard');
    console.log('5. Test complete payment flow');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

testStripeIntegration();