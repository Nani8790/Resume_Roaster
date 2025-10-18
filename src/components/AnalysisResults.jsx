import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FreeAnalysisResults from './FreeAnalysisResults';
import ProAnalysisResults from './ProAnalysisResults';
import AILoader from './ui/ai-loader';

const AnalysisResults = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scanId = searchParams.get('scanId');
  const { fileId, fileName, analysisType, jobDescription } = location.state || {};

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (scanId) {
      // Viewing existing scan results
      fetchScanData(scanId);
    } else if (fileId && analysisType) {
      // Performing new analysis
      performAnalysis();
    } else {
      // No valid data, redirect to upload
      navigate('/upload');
    }
  }, [scanId, fileId, analysisType]);

  const fetchScanData = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await fetch(`/api/resume/scans/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setScanData(data.scan);
      } else {
        console.error('Failed to fetch scan data:', response.status, response.statusText);
        setError('Failed to load scan results');
      }
    } catch (error) {
      console.error('Error fetching scan data:', error);
      setError('Failed to load scan results');
    } finally {
      setLoading(false);
    }
  };

  const performAnalysis = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/auth/login');
        return;
      }

      console.log('Starting analysis:', { fileId, analysisType, jobDescription: jobDescription ? 'provided' : 'none' });

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId,
          analysisType,
          jobDescription: jobDescription || undefined
        })
      });

      console.log('Analysis response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Analysis completed successfully');
        setScanData(data.scan);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Analysis failed:', response.status, errorData);

        if (response.status === 429) {
          setError(errorData.message || 'Analysis limit reached. Please upgrade to Pro for 15 analyses per month.');
        } else if (response.status === 403) {
          setError(errorData.message || 'Pro subscription required for this analysis type.');
        } else {
          setError(errorData.message || 'Analysis failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error performing analysis:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AILoader message={scanId ? "Loading" : "Analyzing"} className="mb-4" showMessage={false} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {scanId ? 'Loading Results...' : 'Analyzing Your Resume'}
          </h2>
          <p className="text-gray-600">
            {scanId ? 'Loading scan results...' : 'This may take a few moments...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
            {fileId && (
              <button
                onClick={() => navigate('/analysis-type', { state: { fileId, fileName } })}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If no scan data and no error, still loading or redirecting
  if (!scanData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AILoader message="Loading" className="mb-4" showMessage={false} />
          <p className="text-gray-600">Preparing analysis...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate results page based on analysis type or user tier
  const resultAnalysisType = scanData?.analysisResults?.analysisType || (user?.tier === 'pro' ? 'pro' : 'quick');

  if (resultAnalysisType === 'pro') {
    return <ProAnalysisResults scanData={scanData} />;
  }

  return <FreeAnalysisResults scanData={scanData} />;
};

export default AnalysisResults;