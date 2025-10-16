import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const StripeContext = createContext();

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch subscription info
  const fetchSubscription = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch('/api/stripe/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  // Create checkout session
  const createCheckout = async (priceId) => {
    if (!user || !token) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price_id: priceId })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create customer portal session
  const openCustomerPortal = async () => {
    if (!user || !token) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to create customer portal session');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!user || !token) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      // Refresh subscription info
      await fetchSubscription();
      return data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reactivate subscription
  const reactivateSubscription = async () => {
    if (!user || !token) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to reactivate subscription');
      }

      // Refresh subscription info
      await fetchSubscription();
      return data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user, token]);

  const value = {
    subscription,
    loading,
    createCheckout,
    openCustomerPortal,
    cancelSubscription,
    reactivateSubscription,
    refreshSubscription: fetchSubscription
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};