import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle, X, Crown, Clock } from 'lucide-react';
import AILoader from './ui/ai-loader';

const ResumeUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Calculate free tier limits
  const getWeeklyLimits = () => {
    if (user?.tier === 'pro') {
      return { canScan: true, scansUsed: 0, scansRemaining: -1 };
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    // Set to Monday 00:00 UTC
    const day = startOfWeek.getUTCDay();
    const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setUTCDate(diff);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const scansThisWeek = user?.scanHistory?.filter(scan => 
      new Date(scan.createdAt) >= startOfWeek
    ).length || 0;

    const freeLimit = 1;
    const scansRemaining = Math.max(0, freeLimit - scansThisWeek);
    
    return {
      canScan: scansRemaining > 0,
      scansUsed: scansThisWeek,
      scansRemaining,
      resetDate: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    };
  };

  const limits = getWeeklyLimits();

  const validateFile = (file) => {
    // Check file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload only PDF or DOCX files.';
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 5MB.';
    }

    return null;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setError('');
    
    // Check scan limits
    if (!limits.canScan) {
      setShowLimitModal(true);
      return;
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check for duplicate (same filename)
    if (uploadedFile && uploadedFile.name === file.name) {
      setError('This file has already been uploaded. Please choose a different file.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      console.log('Starting upload for file:', file.name);
      
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', response.headers);

      // Get response text first to debug
      const responseText = await response.text();
      console.log('Upload response text:', responseText);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, use the raw text
          errorMessage = responseText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid server response: ${responseText}`);
      }
      
      setUploadedFile({
        name: file.name,
        size: file.size,
        id: result.fileId
      });

      // Small delay to show 100% progress
      setTimeout(() => {
        setUploading(false);
      }, 500);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadAnother = () => {
    setUploadedFile(null);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    if (uploadedFile) {
      navigate('/analysis-type', { state: { fileId: uploadedFile.id, fileName: uploadedFile.name } });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Your Resume</h1>
          <p className="text-gray-600 mt-2">
            Upload your resume to get instant ATS compatibility feedback
          </p>
        </div>

        {/* Free Tier Status */}
        {user?.tier === 'free' && (
          <div className={`border rounded-lg p-4 mb-6 ${
            limits.canScan ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {limits.canScan ? (
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                ) : (
                  <Clock className="h-5 w-5 text-red-600 mr-3" />
                )}
                <div>
                  <p className={`text-sm font-semibold ${
                    limits.canScan ? 'text-blue-900' : 'text-red-900'
                  }`}>
                    Free Scans Remaining This Week: {limits.scansRemaining}/1
                  </p>
                  {!limits.canScan && limits.resetDate && (
                    <p className="text-xs text-red-700 mt-1">
                      Resets on {limits.resetDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              </div>
              {!limits.canScan && (
                <button 
                  onClick={() => navigate('/pricing')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pro User Status */}
        {user?.tier === 'pro' && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Crown className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-semibold text-purple-900">
                  15 Scans/Month
                </p>
                <p className="text-xs text-purple-700">
                  Pro Plan Active
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive 
                  ? 'border-purple-400 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div className="space-y-4">
                  <AILoader message="Uploading" showMessage={false} />
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Uploading...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Drag and drop your resume here
                  </h3>
                  <p className="text-gray-600 mb-6">
                    or click to browse files
                  </p>
                  <button
                    onClick={() => {
                      if (limits.canScan) {
                        fileInputRef.current?.click();
                      } else {
                        setShowLimitModal(true);
                      }
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      limits.canScan
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                  >
                    Choose File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-4">
                    Supports PDF and DOCX files up to 5MB
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Successful!
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(uploadedFile.size)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleUploadAnother}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Upload Another
                </button>
                <button
                  onClick={handleContinue}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Continue to Analysis
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF files (.pdf)</li>
                <li>• Microsoft Word documents (.docx)</li>
                <li>• Maximum file size: 5MB</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Best Results</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use a clean, professional format</li>
                <li>• Ensure text is selectable (not scanned images)</li>
                <li>• Include relevant keywords for your target role</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scan Limit Modal */}
        {showLimitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowLimitModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  You've used your free scan this week
                </h3>

                <p className="text-sm text-gray-500 mb-6">
                  Free users get 1 scan per week. Your limit resets every Monday at 12:00 AM UTC.
                </p>

                {limits.resetDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-blue-800">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Next reset: <span className="font-semibold">
                        {limits.resetDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </p>
                  </div>
                )}

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-3">
                    <Crown className="h-6 w-6 text-purple-600 mr-2" />
                    <h4 className="text-lg font-semibold text-purple-900">Upgrade to Pro</h4>
                  </div>
                  
                  <div className="space-y-2 text-sm text-purple-800 mb-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>15 resume scans per month</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Job-specific analysis</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>PDF downloads</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Complete scan history</span>
                    </div>
                  </div>

                  <p className="text-lg font-bold text-purple-900">
                    Only $15/month
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowLimitModal(false);
                      navigate('/pricing');
                    }}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </button>
                  <button
                    onClick={() => setShowLimitModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Wait until Monday
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;