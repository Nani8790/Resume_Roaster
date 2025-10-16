import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStripe } from '../contexts/StripeContext';
import { FileText, Target, CheckCircle, ArrowRight, Lock, Zap, Star, Loader2 } from 'lucide-react';
import AILoader from './ui/ai-loader';

const AnalysisType = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createCheckout, loading: stripeLoading } = useStripe();
  const [selectedType, setSelectedType] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  
  const { fileId, fileName } = location.state || {};

  // Redirect if no file data
  React.useEffect(() => {
    if (!fileId || !fileName) {
      navigate('/upload');
    }
  }, [fileId, fileName, navigate]);

  const isPro = user?.tier === 'pro';
  const characterCount = jobDescription.length;
  const maxCharacters = 10000;
  const minCharacters = 100;

  const handleQuickAnalysis = async () => {
    setIsAnalyzing(true);
    setSelectedType('quick');
    
    // Navigate immediately to show loading state
    navigate('/analysis-results', { 
      state: { 
        fileId, 
        fileName, 
        analysisType: 'quick'
      } 
    });
  };

  const handleProAnalysis = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    if (jobDescription.length < minCharacters) {
      alert(`Please enter at least ${minCharacters} characters in the job description.`);
      return;
    }

    setIsAnalyzing(true);
    setSelectedType('pro');
    
    // Navigate immediately to show loading state
    navigate('/analysis-results', { 
      state: { 
        fileId, 
        fileName, 
        analysisType: 'pro',
        jobDescription
      } 
    });
  };

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      // Use environment variable or default price ID
      await createCheckout(process.env.REACT_APP_STRIPE_PRICE_ID || 'price_1234567890');
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process. Please try again.');
      // Fallback to pricing page
      navigate('/pricing');
    } finally {
      setUpgrading(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AILoader message="Analyzing" className="mb-6" showMessage={false} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Resume</h2>
          <p className="text-gray-600">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with uploaded file confirmation */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <span className="text-gray-600">
              <span className="font-medium text-gray-900">{fileName}</span> uploaded successfully
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Analysis Type</h1>
        </div>

        {/* Analysis Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Quick Health Check - FREE */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 relative hover:shadow-xl transition-shadow">
            <div className="absolute -top-3 left-6">
              <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                FREE
              </span>
            </div>
            
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Health Check</h2>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span>General ATS score</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Formatting analysis</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Content quality check</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span>5 improvement tips</span>
              </div>
            </div>

            <p className="text-gray-600 mb-8">
              Perfect for a quick resume health check
            </p>

            <button
              onClick={handleQuickAnalysis}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <span>Analyze Now</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>

          {/* Job Match Analysis - PRO */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-8 relative hover:shadow-xl transition-shadow">
            <div className="absolute -top-3 left-6">
              <span className="bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center">
                <Star className="h-4 w-4 mr-1" />
                PRO - $15/month
              </span>
            </div>
            
            <div className="flex items-center mb-6">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Job Match Analysis</h2>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                <span>Everything in Quick Check</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                <span>Job keyword matching</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                <span>Skills gap analysis</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                <span>Tailored recommendations</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                <span>Priority ranking</span>
              </div>
            </div>

            {/* Job Description Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste the job description you're applying for:
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.slice(0, maxCharacters))}
                placeholder="Paste the full job description here to get tailored analysis..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={!isPro}
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-sm ${characterCount > maxCharacters * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                  {characterCount.toLocaleString()}/{maxCharacters.toLocaleString()} characters
                </span>
                {isPro && characterCount > 0 && characterCount < minCharacters && (
                  <span className="text-sm text-orange-500">
                    Minimum {minCharacters} characters required
                  </span>
                )}
              </div>
            </div>

            {!isPro ? (
              <button
                onClick={handleProAnalysis}
                className="w-full bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors"
              >
                <Lock className="h-5 w-5 mr-2" />
                <span>Upgrade to Unlock</span>
              </button>
            ) : (
              <button
                onClick={handleProAnalysis}
                disabled={characterCount < minCharacters}
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <span>Analyze Against Job</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Back to Upload
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Pro</h3>
              <p className="text-gray-600">
                Get detailed job-specific analysis and tailored recommendations
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Unlimited resume scans</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Job-specific keyword matching</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Skills gap analysis</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Priority improvement ranking</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgrade}
                disabled={stripeLoading || upgrading}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {(stripeLoading || upgrading) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Upgrade Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisType;