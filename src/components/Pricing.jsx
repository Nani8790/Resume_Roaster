import React, { useState } from 'react'
import { Check, Star, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStripe } from '../contexts/StripeContext'
import { useNavigate } from 'react-router-dom'

const Pricing = () => {
  const { user } = useAuth();
  const { createCheckout, loading } = useStripe();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (user.tier === 'pro') {
      navigate('/dashboard');
      return;
    }

    try {
      setUpgrading(true);
      // Use environment variable or default price ID
      await createCheckout(process.env.REACT_APP_STRIPE_PRICE_ID || 'price_1234567890');
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/auth/signup');
    } else {
      navigate('/dashboard');
    }
  };

  const plans = [
    {
      name: "FREE",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "1 scan per week",
        "Basic ATS score",
        "Formatting check",
        "Email support"
      ],
      buttonText: "Get Started Free",
      buttonStyle: "bg-gray-900 text-white hover:bg-gray-800",
      popular: false
    },
    {
      name: "PRO",
      price: "$15",
      period: "per month",
      description: "For serious job seekers",
      features: [
        "Unlimited scans",
        "Advanced job matching",
        "Keyword optimizer",
        "PDF reports",
        "Priority support",
        "Resume templates"
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "gradient-bg text-white hover:opacity-90",
      popular: true
    }
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your job search needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 animate-fade-in-up ${plan.popular ? 'border-purple-500' : 'border-gray-200'}`} style={{animationDelay: `${index * 0.2}s`}}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={plan.name === 'PRO' ? handleUpgrade : handleGetStarted}
                disabled={loading || upgrading}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonStyle} flex items-center justify-center space-x-2`}
              >
                {(loading || upgrading) && plan.name === 'PRO' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>
                    {user?.tier === 'pro' && plan.name === 'PRO' 
                      ? 'Current Plan' 
                      : plan.buttonText
                    }
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include a 7-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Pricing