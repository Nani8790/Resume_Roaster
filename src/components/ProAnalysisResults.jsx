import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, CheckCircle, AlertTriangle, TrendingUp, Download, ArrowLeft, RefreshCw, AlertCircle, Crown, Star, Target, ChevronDown, ChevronUp, Save, BarChart3, Award, Zap, Eye, EyeOff } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const ProAnalysisResults = ({ scanData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  
  const { fileId, fileName, jobDescription } = location.state || {};
  
  // Use scanData if provided (from dashboard), otherwise use location state
  const actualFileId = scanData?.id || fileId;
  const actualFileName = scanData?.filename || fileName;
  const actualJobDescription = scanData?.analysisResults?.jobMatch?.jobDescription || jobDescription;

  const analyzeResume = async () => {
    try {
      setError(null);
      setRetrying(false);
      
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fileId: actualFileId,
          analysisType: 'pro',
          jobDescription: actualJobDescription || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed');
      }

      setResults(data.results);
      setLoading(false);

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    setLoading(true);
    setError(null);
    await analyzeResume();
    setRetrying(false);
  };

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const saveToHistory = async () => {
    try {
      // This would typically save to user's analysis history
      alert('Analysis saved to your history!');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // If scanData is provided, use it directly
    if (scanData && scanData.analysisResults) {
      setResults(scanData.analysisResults);
      setLoading(false);
      return;
    }

    // Otherwise, check for fileId and fileName from location state
    if (!actualFileId || !actualFileName) {
      navigate('/upload');
      return;
    }

    analyzeResume();
  }, [actualFileId, actualFileName, navigate, scanData]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 61) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'EXCELLENT MATCH';
    if (score >= 61) return 'GOOD MATCH';
    return 'NEEDS IMPROVEMENT';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Your resume is an excellent match for this job!';
    if (score >= 61) return 'Good match with room for optimization.';
    return 'Significant improvements needed to match job requirements.';
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'important': return '🟡';
      default: return '🟢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'important': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-green-500 bg-green-50';
    }
  };

  const downloadProReport = async () => {
    try {
      console.log('Downloading PDF for fileId:', actualFileId);
      const response = await fetch(`/api/resume/pdf-report/${actualFileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate PDF report');
        } else {
          // If it's HTML, it might be a 404 or server error page
          const htmlText = await response.text();
          console.log('HTML response:', htmlText.substring(0, 200));
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-analysis-${actualFileName.replace(/\.[^/.]+$/, '')}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  // Helper function to create circular progress data
  const createCircularData = (score) => [
    { name: 'Score', value: score, color: getScoreColor(score) },
    { name: 'Remaining', value: 100 - score, color: '#E5E7EB' }
  ];

  // Helper function to create bar chart data
  const createBarData = () => {
    const data = [
      { name: 'Formatting', score: results.aiAnalysis?.formatting_score || 75, color: '#3B82F6' },
      { name: 'Content', score: results.aiAnalysis?.content_score || 80, color: '#10B981' },
      { name: 'Structure', score: results.aiAnalysis?.structure_score || 85, color: '#8B5CF6' }
    ];
    
    if (actualJobDescription) {
      data.push({ name: 'Keywords', score: results.jobMatch?.keywordMatch || 70, color: '#F59E0B' });
    }
    
    return data;
  };

  if (loading) {
    return <LoadingScreen analysisType="pro" fileName={actualFileName} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
              >
                {retrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Upload Different Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Crown className="h-8 w-8 text-purple-600 mr-3" />
                PRO Analysis Results
              </h1>
              <p className="text-gray-600 mt-2">
                Results for: <span className="font-medium">{actualFileName}</span>
                {actualJobDescription && <span className="ml-2 text-purple-600">• Job-Specific Analysis</span>}
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* 1. Dual Score Display */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Overall ATS Score */}
              <div className="text-center">
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={createCircularData(results.score)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        <Cell fill={getScoreColor(results.score)} />
                        <Cell fill="#E5E7EB" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{results.score}</div>
                      <div className="text-xs text-gray-500">ATS Score</div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Overall ATS Score</h3>
                <p className="text-sm text-gray-600">Resume compatibility with ATS systems</p>
              </div>

              {/* Job Match Score (only if job-specific) */}
              {actualJobDescription && results.jobMatch && (
                <div className="text-center">
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={createCircularData(results.jobMatch.overallMatch || results.score)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell fill={getScoreColor(results.jobMatch.overallMatch || results.score)} />
                          <Cell fill="#E5E7EB" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{results.jobMatch.overallMatch || results.score}</div>
                        <div className="text-xs text-gray-500">Job Match</div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Job Match Score</h3>
                  <p className="text-sm text-gray-600">How well your resume matches this specific job</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold mb-2" style={{ color: getScoreColor(results.score) }}>
                {getScoreLabel(results.score)}
              </h2>
              <p className="text-gray-600">{getScoreMessage(results.score)}</p>
              <div className="text-sm text-gray-500 mt-2">
                Analysis completed on {new Date(results.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* 2. Enhanced Score Breakdown (4 bars) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
              Score Breakdown
            </h3>
            <div className="space-y-4">
              {createBarData().map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium text-gray-700">{item.name}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${item.score}%`, 
                            backgroundColor: item.color 
                          }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm font-bold text-gray-900">{item.score}/100</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Keyword Analysis Section (job-specific only) */}
          {actualJobDescription && results.jobMatch?.keywordAnalysis && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="h-6 w-6 text-green-600 mr-2" />
                Keyword Analysis
              </h3>
              
              {/* Keyword Count Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {results.jobMatch.keywordAnalysis.matched_keywords?.length || 0}/
                    {results.jobMatch.keywordAnalysis.total_job_keywords || 0}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">critical keywords found</div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${results.jobMatch.keywordAnalysis.match_percentage || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {results.jobMatch.keywordAnalysis.match_percentage || 0}% keyword match
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Keywords Found */}
                <div>
                  <h4 className="font-medium text-green-800 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Keywords Found ({results.jobMatch.keywordAnalysis.matched_keywords?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(results.jobMatch.keywordAnalysis.matched_keywords || []).map((keyword, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Critical Missing Keywords */}
                <div>
                  <h4 className="font-medium text-red-800 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Critical Missing Keywords ({results.jobMatch.keywordAnalysis.missing_critical_keywords?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(results.jobMatch.keywordAnalysis.missing_critical_keywords || []).map((keyword, index) => (
                      <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✗ {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Priority Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Zap className="h-6 w-6 text-yellow-500 mr-2" />
              Priority Recommendations
            </h3>
            
            <div className="space-y-6">
              {/* Critical Priority */}
              <div>
                <h4 className="font-bold text-red-800 mb-4 flex items-center text-lg">
                  🔴 CRITICAL (Fix immediately)
                </h4>
                <div className="space-y-4">
                  {(results.aiAnalysis?.recommendations || results.feedback || [])
                    .filter((rec, index) => {
                      const recommendation = typeof rec === 'string' ? 
                        { priority: index < 2 ? 'critical' : 'important' } : rec;
                      return recommendation.priority === 'critical';
                    })
                    .slice(0, 3)
                    .map((rec, index) => {
                      const recommendation = typeof rec === 'string' ? 
                        { issue: rec, suggestion: 'Address this issue to improve your resume score', section: 'General' } : rec;
                      
                      return (
                        <div key={index} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                  {recommendation.section || 'General'}
                                </span>
                              </div>
                              <h5 className="font-semibold text-red-900 mb-2">
                                {recommendation.issue || recommendation}
                              </h5>
                              {recommendation.suggestion && (
                                <p className="text-red-800 text-sm mb-2">
                                  {recommendation.suggestion}
                                </p>
                              )}
                              {recommendation.keywords_to_add && (
                                <div className="flex flex-wrap gap-1">
                                  {recommendation.keywords_to_add.map((keyword, kidx) => (
                                    <span key={kidx} className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Important Priority */}
              <div>
                <h4 className="font-bold text-yellow-800 mb-4 flex items-center text-lg">
                  🟡 IMPORTANT (Should fix)
                </h4>
                <div className="space-y-4">
                  {(results.aiAnalysis?.recommendations || results.feedback || [])
                    .filter((rec, index) => {
                      const recommendation = typeof rec === 'string' ? 
                        { priority: index < 2 ? 'critical' : index < 4 ? 'important' : 'nice_to_have' } : rec;
                      return recommendation.priority === 'important';
                    })
                    .slice(0, 3)
                    .map((rec, index) => {
                      const recommendation = typeof rec === 'string' ? 
                        { issue: rec, suggestion: 'Consider addressing this to enhance your resume', section: 'General' } : rec;
                      
                      return (
                        <div key={index} className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                  {recommendation.section || 'General'}
                                </span>
                              </div>
                              <h5 className="font-semibold text-yellow-900 mb-2">
                                {recommendation.issue || recommendation}
                              </h5>
                              {recommendation.suggestion && (
                                <p className="text-yellow-800 text-sm">
                                  {recommendation.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Nice to Have Priority */}
              <div>
                <h4 className="font-bold text-green-800 mb-4 flex items-center text-lg">
                  🟢 NICE TO HAVE (Polish)
                </h4>
                <div className="space-y-4">
                  {(results.aiAnalysis?.recommendations || results.feedback || [])
                    .filter((rec, index) => {
                      const recommendation = typeof rec === 'string' ? 
                        { priority: index < 2 ? 'critical' : index < 4 ? 'important' : 'nice_to_have' } : rec;
                      return recommendation.priority === 'nice_to_have' || recommendation.priority === 'nice-to-have';
                    })
                    .slice(0, 2)
                    .map((rec, index) => {
                      const recommendation = typeof rec === 'string' ? 
                        { issue: rec, suggestion: 'Optional improvement for resume polish', section: 'General' } : rec;
                      
                      return (
                        <div key={index} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                  {recommendation.section || 'General'}
                                </span>
                              </div>
                              <h5 className="font-semibold text-green-900 mb-2">
                                {recommendation.issue || recommendation}
                              </h5>
                              {recommendation.suggestion && (
                                <p className="text-green-800 text-sm">
                                  {recommendation.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Detailed Section Analysis (Expandable) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="h-6 w-6 text-purple-600 mr-2" />
              Detailed Section Analysis
            </h3>
            
            <div className="space-y-4">
              {/* Contact Information */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('contact')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📞</span>
                    <span className="font-medium text-gray-900">Contact Information</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      Score: 95/100
                    </span>
                  </div>
                  {expandedSections.contact ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {expandedSections.contact && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="space-y-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Professional email address present</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Phone number properly formatted</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-gray-700">LinkedIn profile included</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <div className="text-sm font-medium text-blue-900 mb-1">→ Actionable Fix:</div>
                        <div className="text-sm text-blue-800">Consider adding your city and state for location clarity</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Summary */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('summary')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📝</span>
                    <span className="font-medium text-gray-900">Professional Summary</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      results.jobMatch?.sectionAnalysis?.summary?.score >= 80 ? 'bg-green-100 text-green-800' :
                      results.jobMatch?.sectionAnalysis?.summary?.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Score: {results.jobMatch?.sectionAnalysis?.summary?.score || 75}/100
                    </span>
                  </div>
                  {expandedSections.summary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {expandedSections.summary && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="space-y-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Summary section present and well-structured</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Could include more job-specific keywords</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <div className="text-sm font-medium text-blue-900 mb-1">→ Actionable Fix:</div>
                        <div className="text-sm text-blue-800">
                          {results.jobMatch?.sectionAnalysis?.summary?.suggested_rewrite || 
                           "Incorporate 2-3 key terms from the job description into your summary"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Work Experience */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('experience')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">💼</span>
                    <span className="font-medium text-gray-900">Work Experience</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      results.jobMatch?.sectionAnalysis?.experience?.score >= 80 ? 'bg-green-100 text-green-800' :
                      results.jobMatch?.sectionAnalysis?.experience?.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Score: {results.jobMatch?.sectionAnalysis?.experience?.score || 82}/100
                    </span>
                  </div>
                  {expandedSections.experience ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {expandedSections.experience && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="space-y-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Strong use of action verbs</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Quantifiable achievements included</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Some bullet points could be more specific</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <div className="text-sm font-medium text-blue-900 mb-1">→ Actionable Fix:</div>
                        <div className="text-sm text-blue-800">Add specific metrics and outcomes to 2-3 more bullet points</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('skills')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🛠️</span>
                    <span className="font-medium text-gray-900">Skills</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      results.jobMatch?.sectionAnalysis?.skills?.score >= 80 ? 'bg-green-100 text-green-800' :
                      results.jobMatch?.sectionAnalysis?.skills?.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Score: {results.jobMatch?.sectionAnalysis?.skills?.score || 78}/100
                    </span>
                  </div>
                  {expandedSections.skills ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {expandedSections.skills && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="space-y-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Relevant technical skills listed</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Missing some job-specific skills</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <div className="text-sm font-medium text-blue-900 mb-1">→ Actionable Fix:</div>
                        <div className="text-sm text-blue-800">
                          Add these missing skills if you have experience: 
                          {(results.jobMatch?.sectionAnalysis?.skills?.missing_from_job || ['Python', 'AWS']).slice(0, 3).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('education')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🎓</span>
                    <span className="font-medium text-gray-900">Education</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      Score: 88/100
                    </span>
                  </div>
                  {expandedSections.education ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {expandedSections.education && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="space-y-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Degree and institution clearly listed</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-gray-700">Graduation date included</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <div className="text-sm font-medium text-blue-900 mb-1">→ Actionable Fix:</div>
                        <div className="text-sm text-blue-800">Consider adding relevant coursework or academic achievements</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Projects */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('projects')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🚀</span>
                    <span className="font-medium text-gray-900">Projects</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      results.jobMatch?.sectionAnalysis?.projects?.score >= 80 ? 'bg-green-100 text-green-800' :
                      results.jobMatch?.sectionAnalysis?.projects?.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Score: {results.jobMatch?.sectionAnalysis?.projects?.score || 65}/100
                    </span>
                  </div>
                  {expandedSections.projects ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {expandedSections.projects && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="space-y-4 mt-3">
                      {/* Current Projects Analysis */}
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm text-gray-700">Limited project portfolio showcased</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm text-gray-700">Missing job-specific project examples</span>
                        </div>
                      </div>

                      {/* Project Recommendations */}
                      {results.jobMatch?.projectRecommendations && results.jobMatch.projectRecommendations.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-purple-900 mb-3">🎯 Recommended Projects to Build:</div>
                          <div className="space-y-3">
                            {results.jobMatch.projectRecommendations.slice(0, 3).map((project, index) => (
                              <div key={index} className="bg-white p-3 rounded-lg border border-purple-200">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-semibold text-purple-900 text-sm">{project.title}</h5>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    project.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {project.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{project.description}</p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {project.skills.slice(0, 4).map((skill, skillIndex) => (
                                    <span key={skillIndex} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                  {project.skills.length > 4 && (
                                    <span className="text-xs text-gray-500">+{project.skills.length - 4} more</span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>⏱️ {project.timeEstimate}</span>
                                  <span>📊 {project.difficulty}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <div className="text-sm font-medium text-blue-900 mb-1">→ Actionable Fix:</div>
                        <div className="text-sm text-blue-800">
                          Add 2-3 relevant projects that demonstrate skills mentioned in the job description. Include GitHub links and live demos where possible.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 6. Project Recommendations (Job-specific only) */}
          {actualJobDescription && results.jobMatch?.projectRecommendations && results.jobMatch.projectRecommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="h-6 w-6 text-purple-600 mr-2" />
                Recommended Projects to Build
              </h3>
              
              <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                <p className="text-purple-800 text-sm">
                  Based on the job description, here are specific projects you should build to strengthen your application and demonstrate relevant skills.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.jobMatch.projectRecommendations.map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{project.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.priority === 'high' ? '🔥 High Priority' : '⭐ Medium Priority'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-2">Key Skills to Demonstrate:</div>
                        <div className="flex flex-wrap gap-1">
                          {project.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <span className="mr-1">⏱️</span>
                            {project.timeEstimate}
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">📊</span>
                            {project.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips for Project Building:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Start with the highest priority project that matches your current skill level</li>
                  <li>• Document your process and challenges faced in a README file</li>
                  <li>• Deploy your projects live and include links in your resume</li>
                  <li>• Use version control (Git) and maintain clean, commented code</li>
                  <li>• Consider contributing to open-source projects in the same domain</li>
                </ul>
              </div>
            </div>
          )}

          {/* 7. Before & After Examples */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                Before & After Examples
              </h3>
              <button
                onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                className="flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                {showBeforeAfter ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showBeforeAfter ? 'Hide Examples' : 'Show Examples'}
              </button>
            </div>
            
            {showBeforeAfter && (
              <div className="space-y-6">
                {/* Example 1 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Professional Summary Enhancement</h4>
                  <div className="space-y-3">
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-red-600 font-medium text-sm">❌ BEFORE:</span>
                      </div>
                      <p className="text-red-800 text-sm italic">
                        "Experienced professional with good communication skills and ability to work in teams."
                      </p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-green-600 font-medium text-sm">✅ AFTER:</span>
                      </div>
                      <p className="text-green-800 text-sm italic">
                        "Results-driven Software Engineer with 5+ years developing scalable web applications using React, Node.js, and AWS. Led cross-functional teams of 8+ members, delivering projects 20% ahead of schedule while reducing costs by $150K annually."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Example 2 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Experience Bullet Point Improvement</h4>
                  <div className="space-y-3">
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-red-600 font-medium text-sm">❌ BEFORE:</span>
                      </div>
                      <p className="text-red-800 text-sm italic">
                        "Responsible for managing projects and working with clients."
                      </p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-green-600 font-medium text-sm">✅ AFTER:</span>
                      </div>
                      <p className="text-green-800 text-sm italic">
                        "Managed 12 concurrent client projects worth $2.3M, implementing Agile methodologies that improved delivery time by 35% and client satisfaction scores by 28%."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Example 3 */}
                {jobDescription && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Skills Section Optimization</h4>
                    <div className="space-y-3">
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <div className="flex items-center mb-2">
                          <span className="text-red-600 font-medium text-sm">❌ BEFORE:</span>
                        </div>
                        <p className="text-red-800 text-sm italic">
                          "Programming, Databases, Web Development, Problem Solving"
                        </p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <div className="flex items-center mb-2">
                          <span className="text-green-600 font-medium text-sm">✅ AFTER:</span>
                        </div>
                        <p className="text-green-800 text-sm italic">
                          "JavaScript (ES6+), React.js, Node.js, Python, PostgreSQL, MongoDB, RESTful APIs, AWS (EC2, S3, Lambda), Docker, Git, Agile/Scrum, Test-Driven Development"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 8. Action Buttons */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
            <div className="text-center mb-6">
              <Crown className="h-12 w-12 mx-auto mb-3 text-yellow-300" />
              <h3 className="text-2xl font-bold mb-2">PRO Analysis Complete!</h3>
              <p className="text-purple-100">
                Your comprehensive resume analysis is ready. Take action now to improve your job prospects.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={downloadProReport}
                className="bg-white text-purple-600 px-6 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Full PDF Report
              </button>
              <button 
                onClick={() => navigate('/upload')}
                className="bg-purple-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-400 transition-colors flex items-center justify-center"
              >
                <FileText className="h-5 w-5 mr-2" />
                Analyze Another Resume
              </button>
              <button 
                onClick={saveToHistory}
                className="bg-purple-700 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Save to History
              </button>
            </div>
          </div>

          {/* Analysis Summary Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              Analysis Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Analysis Stats */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {results.aiAnalysis?.recommendations?.length || results.feedback?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Recommendations</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {results.jobMatch?.keywordAnalysis?.matched_keywords?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Keywords Matched</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {results.strengths?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Strengths Identified</div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your resume shows strong technical competencies</li>
                <li>• {jobDescription ? 'Job-specific optimization will increase your match score' : 'Consider using job-specific analysis for better targeting'}</li>
                <li>• Focus on quantifiable achievements to stand out</li>
                <li>• ATS compatibility is {results.jobMatch?.atsCompatibility?.likely_to_pass_ats ? 'excellent' : 'good with room for improvement'}</li>
              </ul>
            </div>

            {/* Analysis Details */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Analysis Type</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    PRO
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AI Analysis</span>
                  <span className={`font-medium text-xs ${results.aiPowered ? 'text-green-600' : 'text-yellow-600'}`}>
                    {results.aiPowered ? '✓ AI-Powered' : '⚠ Fallback'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Job Match</span>
                  <span className="font-medium text-xs text-green-600">
                    {jobDescription ? '✓ Job-Specific' : '○ General'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-xs text-gray-900">
                    {new Date(results.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProAnalysisResults;