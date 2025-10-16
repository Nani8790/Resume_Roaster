import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Zap } from 'lucide-react';
import AILoader from './ui/ai-loader';

const LoadingScreen = ({ analysisType, fileName }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = analysisType === 'pro' ? [
    { id: 0, message: "Parsing resume structure...", icon: FileText, duration: 4000 },
    { id: 1, message: "Checking formatting...", icon: CheckCircle, duration: 3000 },
    { id: 2, message: "Analyzing content quality...", icon: Zap, duration: 5000 },
    { id: 3, message: "Processing job description...", icon: FileText, duration: 4000 },
    { id: 4, message: "Matching skills and keywords...", icon: CheckCircle, duration: 6000 },
    { id: 5, message: "Calculating job match score...", icon: Clock, duration: 3000 }
  ] : [
    { id: 0, message: "Parsing resume structure...", icon: FileText, duration: 5000 },
    { id: 1, message: "Checking formatting...", icon: CheckCircle, duration: 4000 },
    { id: 2, message: "Analyzing content quality...", icon: Zap, duration: 8000 },
    { id: 3, message: "Calculating ATS score...", icon: Clock, duration: 8000 }
  ];

  const totalDuration = 25000; // 25 seconds total
  const stepDuration = totalDuration / steps.length;

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (totalDuration / 100));
        return Math.min(newProgress, 100);
      });
    }, 100);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep < steps.length) {
          setCompletedSteps(completed => [...completed, prev]);
          return nextStep;
        } else {
          setCompletedSteps(completed => [...completed, prev]);
          return prev;
        }
      });
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [steps.length, stepDuration, totalDuration]);

  const getCurrentStepIcon = () => {
    if (currentStep < steps.length) {
      const IconComponent = steps[currentStep].icon;
      return <IconComponent className="h-6 w-6" />;
    }
    return <CheckCircle className="h-6 w-6" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* AI Loader */}
          <div className="mb-8">
            <AILoader message="Processing" showMessage={false} />
          </div>

          {/* Header */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {analysisType === 'pro' ? 'Analyzing Job Match' : 'Analyzing Your Resume'}
          </h2>
          <p className="text-gray-600 mb-2">
            <span className="font-medium">{fileName}</span>
          </p>
          <p className="text-sm text-gray-500 mb-8">
            This usually takes 20-30 seconds
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isCurrent = currentStep === index;
              const isPending = index > currentStep;

              return (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    isCompleted ? 'bg-green-50 text-green-800' :
                    isCurrent ? 'bg-purple-50 text-purple-800' :
                    'bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className={`flex-shrink-0 ${
                    isCompleted ? 'text-green-600' :
                    isCurrent ? 'text-purple-600' :
                    'text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : isCurrent ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {isCompleted ? '✓ ' : isCurrent ? '⏳ ' : ''}
                    {step.message}
                  </span>
                </div>
              );
            })}
          </div>

          {/* AI Processing Note */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">
                AI-powered analysis in progress
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Using advanced algorithms to provide detailed insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;