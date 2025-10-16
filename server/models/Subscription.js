import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripe_subscription_id: {
    type: String,
    required: true
  },
  stripe_customer_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'],
    required: true
  },
  current_period_start: {
    type: Date,
    required: true
  },
  current_period_end: {
    type: Date,
    required: true
  },
  cancel_at_period_end: {
    type: Boolean,
    default: false
  },
  canceled_at: {
    type: Date,
    default: null
  },
  trial_start: {
    type: Date,
    default: null
  },
  trial_end: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ user_id: 1 });
subscriptionSchema.index({ stripe_subscription_id: 1 }, { unique: true });
subscriptionSchema.index({ stripe_customer_id: 1 });

export default mongoose.model('Subscription', subscriptionSchema);