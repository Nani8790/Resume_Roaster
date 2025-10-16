# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe for Resume Roaster's subscription payments.

## 1. Stripe Dashboard Setup

### Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or log in
3. Complete account verification

### Create Product and Price
1. Navigate to **Products** in the Stripe Dashboard
2. Click **+ Add product**
3. Fill in product details:
   - **Name**: Resume Roaster Pro
   - **Description**: Unlimited resume scans with job-specific analysis
   - **Image**: Upload your logo (optional)
4. Add pricing:
   - **Pricing model**: Standard pricing
   - **Price**: $15.00 USD
   - **Billing period**: Monthly
   - **Currency**: USD
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_`) - you'll need this for the environment variables

### Get API Keys
1. Navigate to **Developers** → **API keys**
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

## 2. Environment Variables Setup

Update your `.env` file with the Stripe credentials:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_ID=price_your_price_id_here
```

## 3. Webhook Setup

### Create Webhook Endpoint
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Set endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - For local development: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and add it to your `.env` file

### Local Development with ngrok
For local testing, you'll need to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 5000

# Use the HTTPS URL for your webhook endpoint
```

## 4. Frontend Environment Variables

Create a `.env.local` file in your project root for frontend variables:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
REACT_APP_STRIPE_PRICE_ID=price_your_price_id_here
```

## 5. Test the Integration

### Run Integration Test
```bash
npm run test-stripe
```

This will verify:
- Database models are set up correctly
- Stripe service can be imported
- Environment variables are configured
- Middleware is working

### Test Checkout Flow
1. Start your server: `npm run server`
2. Start your frontend: `npm run dev`
3. Navigate to `/pricing`
4. Click "Start Free Trial" on the Pro plan
5. Complete the test payment with Stripe test cards

### Stripe Test Cards
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

## 6. Webhook Testing

### Test Webhook Locally
1. Use Stripe CLI for local webhook testing:
```bash
# Install Stripe CLI
# Follow instructions at: https://stripe.com/docs/stripe-cli

# Forward events to your local server
stripe listen --forward-to localhost:5000/api/stripe/webhook

# This will give you a webhook signing secret for local testing
```

2. Trigger test events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

## 7. Production Deployment

### Update Environment Variables
1. Replace test keys with live keys in production
2. Update webhook endpoint URL to your production domain
3. Ensure HTTPS is enabled for webhook endpoint

### Security Checklist
- [ ] Use live API keys in production
- [ ] Webhook endpoint uses HTTPS
- [ ] Webhook signature verification is enabled
- [ ] Environment variables are secure
- [ ] Database backups are configured

## 8. Features Implemented

### ✅ Stripe Setup
- [x] Stripe npm package installed
- [x] Environment variables configured
- [x] Product created in Stripe Dashboard

### ✅ Checkout Endpoint
- [x] POST `/api/stripe/create-checkout`
- [x] Accepts user_id and price_id
- [x] Creates Stripe Checkout Session
- [x] Returns session.url for redirect
- [x] Success URL: `/subscription/success`
- [x] Cancel URL: `/subscription/cancel`

### ✅ Upgrade Flow
- [x] "Upgrade to Pro" buttons throughout app
- [x] Calls create-checkout endpoint
- [x] Redirects to Stripe Checkout page
- [x] Handles success/cancel redirects

### ✅ Webhook Handler
- [x] POST `/api/stripe/webhook`
- [x] Verifies webhook signature
- [x] Handles `checkout.session.completed`
- [x] Handles `customer.subscription.updated`
- [x] Handles `customer.subscription.deleted`
- [x] Updates Subscriptions table

### ✅ Customer Portal
- [x] POST `/api/stripe/customer-portal`
- [x] Creates Stripe Customer Portal session
- [x] Returns portal.url
- [x] Allows users to update payment method
- [x] Allows users to cancel subscription
- [x] Shows billing history

### ✅ Subscription Check Middleware
- [x] `requireProSubscription` middleware
- [x] `checkSubscriptionLimits` middleware
- [x] Protects Pro features
- [x] Returns 403 if not Pro user
- [x] Checks weekly limits for free users

### ✅ Frontend Integration
- [x] "Upgrade to Pro" buttons throughout app
- [x] Shows current plan in settings
- [x] "Manage Subscription" button
- [x] Handles success/cancel redirects
- [x] Stripe context for state management

### ✅ Database Updates
- [x] Subscriptions table created
- [x] Stores user_id, stripe_subscription_id, stripe_customer_id, status, current_period_end
- [x] Users table has stripe_customer_id and tier columns

### ✅ Subscription Status Display
- [x] Settings page shows current plan
- [x] Shows next billing date (if Pro)
- [x] Shows subscription status
- [x] Dashboard shows plan badge

### ✅ Error Handling
- [x] Handles payment failures
- [x] Handles webhook delivery failures
- [x] User-friendly error messages
- [x] Fallback to pricing page on errors

## 9. Testing Checklist

### End-to-End Payment Flow
- [ ] Free user can upgrade to Pro
- [ ] Checkout session creates successfully
- [ ] Payment completes in Stripe
- [ ] Webhook updates user to Pro tier
- [ ] User sees Pro features immediately
- [ ] Subscription shows in settings

### Subscription Management
- [ ] Pro user can access customer portal
- [ ] User can update payment method
- [ ] User can cancel subscription
- [ ] Canceled subscription shows correct status
- [ ] User can reactivate subscription

### Access Control
- [ ] Free users see upgrade prompts
- [ ] Pro features are protected
- [ ] Free users hit weekly limits
- [ ] Pro users have unlimited access

### Error Scenarios
- [ ] Failed payments are handled
- [ ] Webhook failures don't break the app
- [ ] Network errors show user-friendly messages
- [ ] Invalid subscriptions are handled

## 10. Monitoring and Analytics

### Stripe Dashboard
Monitor these metrics:
- Successful payments
- Failed payments
- Subscription churn
- Revenue trends

### Application Logs
Monitor these events:
- Successful upgrades
- Failed webhook deliveries
- Subscription status changes
- Access control violations

## Support

For issues with this integration:
1. Check the integration test: `npm run test-stripe`
2. Verify environment variables are set correctly
3. Check Stripe Dashboard for payment/webhook logs
4. Review server logs for error messages
5. Test with Stripe test cards first

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)