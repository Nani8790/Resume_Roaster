import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, CheckCircle, AlertTriangle, Download, ArrowLeft, RefreshCw, AlertCircle, Target, Crown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const FreeAnalysisResults = ({ scanData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  
  const { fileId, fileName } = location.state || {};
  
  // Use scanData if provided (from dashboard), otherwise use location state
  const actualFileId = scanData?.id || fileId;
  const actualFileName = scanData?.filename || fileName;

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
          analysisType: 'quick', // Force quick analysis for free users
          jobDescription: null // No job description for free users
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
    if (score >= 80) return 'EXCELLENT';
    if (score >= 61) return 'GOOD';
    return 'NEEDS IMPROVEMENT';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Your resume is well-optimized for ATS systems!';
    if (score >= 61) return 'Good foundation, but room to grow.';
    return 'Significant improvements needed for ATS compatibility.';
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

  const downloadBasicReport = () => {
    const reportData = {
      fileName: fileName,
      score: results.score,
      analysisDate: new Date(results.timestamp).toLocaleDateString(),
      scoreBreakdown: {
        formatting: results.aiAnalysis?.formatting_score || 85,
        content: results.aiAnalysis?.content_score || 65,
        structure: results.aiAnalysis?.structure_score || 75
      },
      recommendations: (results.aiAnalysis?.recommendations || results.feedback || []).slice(0, 5),
      strengths: results.strengths || [],
      criticalIssues: results.criticalIssues || []
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `resume-analysis-${actualFileName}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) {
    return <LoadingScreen analysisType="quick" fileName={actualFileName} />;
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Analysis Results</h1>
              <p className="text-gray-600 mt-2">
                Results for: <span className="font-medium">{actualFileName}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Score Display */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                {/* Circular Progress Indicator */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Score', value: results.score },
                          { name: 'Remaining', value: 100 - results.score }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
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
                      <div className="text-4xl font-bold text-gray-900">{results.score}</div>
                      <div className="text-sm text-gray-500">out of 100</div>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  ATS Score: <span style={{ color: getScoreColor(results.score) }}>
                    {getScoreLabel(results.score)}
                  </span>
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  {getScoreMessage(results.score)}
                </p>
                <div className="text-sm text-gray-500">
                  Analysis completed on {new Date(results.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Score Breakdown</h3>
              <div className="space-y-6">
                {/* Formatting Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Formatting</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">{results.aiAnalysis?.formatting_score || 85}/100</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Good</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${results.aiAnalysis?.formatting_score || 85}%` }}
                    ></div>
                  </div>
                </div>

                {/* Content Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Content</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">{results.aiAnalysis?.content_score || 65}/100</span>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-yellow-600 font-medium">Needs Work</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-yellow-500 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${results.aiAnalysis?.content_score || 65}%` }}
                    ></div>
                  </div>
                </div>

                {/* Structure Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Structure</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">{results.aiAnalysis?.structure_score || 75}/100</span>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-yellow-600 font-medium">Could Be Better</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-yellow-500 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${results.aiAnalysis?.structure_score || 75}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top 5 Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Top 5 Recommendations</h3>
              <div className="space-y-4">
                {(results.aiAnalysis?.recommendations || results.feedback || []).slice(0, 5).map((rec, index) => {
                  const recommendation = typeof rec === 'string' ? 
                    { issue: rec, suggestion: '', priority: index < 2 ? 'critical' : index < 4 ? 'important' : 'nice_to_have' } : 
                    rec;
                  
                  return (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(recommendation.priority)}`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{getPriorityIcon(recommendation.priority)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full font-bold">
                              {index + 1}
                            </span>
                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                              recommendation.priority === 'critical' ? 'bg-red-200 text-red-800' :
                              recommendation.priority === 'important' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-green-200 text-green-800'
                            }`}>
                              {recommendation.priority === 'critical' ? 'Critical' : 
                               recommendation.priority === 'important' ? 'Important' : 'Nice to have'}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {recommendation.issue || recommendation}
                          </h4>
                          {recommendation.suggestion && (
                            <p className="text-gray-700 text-sm mb-3">
                              {recommendation.suggestion}
                            </p>
                          )}
                          {recommendation.example && (
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                              <div className="font-medium text-gray-900 mb-1">Example:</div>
                              <div className="space-y-1">
                                <div className="text-red-700">
                                  <span className="font-medium">Before:</span> "Responsible for managing projects"
                                </div>
                                <div className="text-green-700">
                                  <span className="font-medium">After:</span> "Led 5 cross-functional projects, delivering $2M in cost savings"
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upgrade CTA Box */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white border-2 border-purple-300">
              <div className="text-center mb-4">
                <Target className="h-12 w-12 mx-auto mb-3 text-yellow-300" />
                <h3 className="text-xl font-bold mb-2">🎯 Want to see how you match a specific job?</h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-sm">Job-specific keyword analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-sm">ATS compatibility scoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-sm">Tailored improvement suggestions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-sm">15 resume scans per month</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-sm">Priority customer support</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/pricing')}
                className="w-full bg-yellow-400 text-gray-900 px-4 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors flex items-center justify-center"
              >
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Pro - $15/month
              </button>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/upload')}
                  className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Analyze Another Resume
                </button>
                <button 
                  onClick={downloadBasicReport}
                  className="w-full border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Basic Report
                </button>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Analysis Type</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    FREE Health Check
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AI Analysis</span>
                  <span className={`font-medium ${results.aiPowered ? 'text-green-600' : 'text-yellow-600'}`}>
                    {results.aiPowered ? '✓ AI-Powered' : '⚠ Fallback Mode'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Format Check</span>
                  <span className="font-medium text-green-600">✓ Passed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Content Quality</span>
                  <span className="font-medium">{results.improvements?.content || 'Good'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium text-purple-600 capitalize">FREE</span>
                </div>
                {results.fallback && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Using fallback analysis. AI service temporarily unavailable.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Data Display Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Analysis Complete</h4>
                  <p className="text-sm text-blue-700">
                    Your resume has been analyzed using our advanced ATS compatibility algorithms. 
                    Results are based on current industry standards and best practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeAnalysisResults;