import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Zap, Brain, Target, Search, BarChart3, Crown, Sparkles } from 'lucide-react';
import AILoader from './ui/ai-loader';

const LoadingScreen = ({ analysisType, fileName, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const steps = analysisType === 'pro' ? [
    { 
      id: 0, 
      message: "Extracting resume content...", 
      icon: FileText, 
      duration: 2000,
      detail: "Parsing document structure and text"
    },
    { 
      id: 1, 
      message: "Analyzing formatting & ATS compatibility...", 
      icon: CheckCircle, 
      duration: 3000,
      detail: "Checking layout, fonts, and structure"
    },
    { 
      id: 2, 
      message: "Processing job description...", 
      icon: Target, 
      duration: 2500,
      detail: "Extracting key requirements and skills"
    },
    { 
      id: 3, 
      message: "AI content analysis in progress...", 
      icon: Brain, 
      duration: 4000,
      detail: "Evaluating content quality and relevance"
    },
    { 
      id: 4, 
      message: "Matching skills and keywords...", 
      icon: Search, 
      duration: 3500,
      detail: "Comparing resume against job requirements"
    },
    { 
      id: 5, 
      message: "Calculating job match score...", 
      icon: BarChart3, 
      duration: 2000,
      detail: "Generating comprehensive analysis"
    }
  ] : [
    { 
      id: 0, 
      message: "Extracting resume content...", 
      icon: FileText, 
      duration: 2000,
      detail: "Parsing document structure and text"
    },
    { 
      id: 1, 
      message: "Analyzing formatting & structure...", 
      icon: CheckCircle, 
      duration: 3000,
      detail: "Checking ATS compatibility"
    },
    { 
      id: 2, 
      message: "AI content analysis...", 
      icon: Brain, 
      duration: 4000,
      detail: "Evaluating content quality and completeness"
    },
    { 
      id: 3, 
      message: "Generating recommendations...", 
      icon: Sparkles, 
      duration: 3000,
      detail: "Creating personalized improvement suggestions"
    }
  ];

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
  const estimatedTime = Math.ceil(totalDuration / 1000);

  useEffect(() => {
    // Update elapsed time every second
    const timeInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Progress tracking based on actual step durations
    let cumulativeTime = 0;
    const stepTimeouts = [];

    steps.forEach((step, index) => {
      cumulativeTime += step.duration;
      
      const timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, index]);
        if (index < steps.length - 1) {
          setCurrentStep(index + 1);
        }
      }, cumulativeTime);
      
      stepTimeouts.push(timeout);
    });

    // Smooth progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const elapsed = Date.now() - startTime;
        const targetProgress = Math.min((elapsed / totalDuration) * 100, 95); // Cap at 95% until complete
        const increment = (targetProgress - prev) * 0.1; // Smooth easing
        return prev + increment;
      });
    }, 50);

    // Complete all steps after total duration
    const completeTimeout = setTimeout(() => {
      setIsCompleting(true);
      setProgress(100);
      setCompletedSteps(steps.map((_, index) => index));
      setCurrentStep(steps.length);
    }, totalDuration);

    return () => {
      clearInterval(timeInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
      stepTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [startTime, totalDuration, steps]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getProgressColor = () => {
    if (progress < 30) return 'from-blue-500 to-purple-500';
    if (progress < 70) return 'from-purple-500 to-pink-500';
    return 'from-pink-500 to-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          {/* AI Loader */}
          <div className="mb-8">
            <AILoader message="AI Analysis" showMessage={false} />
          </div>

          {/* Header */}
          <div className="mb-8">
            {analysisType === 'pro' && (
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                <Crown className="h-4 w-4 mr-1" />
                PRO Analysis
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {analysisType === 'pro' ? 'AI Job Match Analysis' : 'AI Resume Analysis'}
            </h2>
            <p className="text-gray-600 mb-2">
              <span className="font-medium text-gray-800">{fileName}</span>
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Estimated time: ~{estimatedTime}s</span>
              <span>•</span>
              <span>Elapsed: {formatTime(elapsedTime)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span className="font-medium">Analysis Progress</span>
              <span className="font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className={`bg-gradient-to-r ${getProgressColor()} h-4 rounded-full transition-all duration-500 ease-out relative`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-40 rounded-full"></div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
            </div>
          </div>

          {/* Current Step Highlight */}
          {currentStep < steps.length && !isCompleting && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                <span className="font-semibold text-purple-800">
                  {steps[currentStep].message}
                </span>
              </div>
              <p className="text-sm text-purple-600">
                {steps[currentStep].detail}
              </p>
            </div>
          )}

          {/* Completion State */}
          {isCompleting && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  Analysis Complete!
                </span>
              </div>
              <p className="text-sm text-green-600">
                Preparing your detailed results...
              </p>
            </div>
          )}

          {/* Steps List */}
          <div className="space-y-2">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isCurrent = currentStep === index;
              const isPending = index > currentStep;
              const IconComponent = step.icon;

              return (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                    isCompleted ? 'bg-green-50 border border-green-200' :
                    isCurrent ? 'bg-purple-50 border border-purple-200 shadow-sm' :
                    'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`flex-shrink-0 transition-all duration-300 ${
                    isCompleted ? 'text-green-600 scale-110' :
                    isCurrent ? 'text-purple-600' :
                    'text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : isCurrent ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isCompleted ? 'text-green-800' :
                      isCurrent ? 'text-purple-800' :
                      'text-gray-500'
                    }`}>
                      {step.message}
                    </span>
                    {(isCompleted || isCurrent) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {step.detail}
                      </div>
                    )}
                  </div>
                  {isCompleted && (
                    <div className="text-green-600 text-xs font-medium">
                      ✓ Done
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* AI Processing Note */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-center space-x-2 text-blue-800 mb-2">
              <Brain className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-semibold">
                {analysisType === 'pro' ? 'Advanced AI Analysis' : 'AI-Powered Analysis'}
              </span>
            </div>
            <p className="text-xs text-blue-600 leading-relaxed">
              {analysisType === 'pro' 
                ? 'Our AI is performing deep analysis including job matching, keyword optimization, and personalized recommendations'
                : 'Using machine learning algorithms to analyze your resume structure, content quality, and ATS compatibility'
              }
            </p>
          </div>

          {/* Tips */}
          <div className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-medium text-yellow-800 mb-1">
                  💡 Pro Tip
                </p>
                <p className="text-xs text-yellow-700">
                  {analysisType === 'pro' 
                    ? 'The more specific your job description, the better our AI can tailor recommendations to your target role.'
                    : 'Consider upgrading to PRO for job-specific analysis and detailed recommendations.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;