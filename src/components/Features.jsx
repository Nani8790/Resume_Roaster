import React from 'react'
import { Upload, Brain, BarChart3, Target, Zap, Shield, FileSearch, Award, TrendingUp } from 'lucide-react'

const Features = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload",
      description: "Drop your resume and we'll scan it instantly"
    },
    {
      icon: Brain,
      title: "AI Analyzes", 
      description: "Our AI examines your resume like real ATS systems"
    },
    {
      icon: BarChart3,
      title: "Get Score",
      description: "Receive detailed feedback and improvement suggestions"
    }
  ]

  const discoveries = [
    {
      icon: Target,
      title: "ATS Compatibility Score",
      description: "See exactly how well your resume performs against applicant tracking systems"
    },
    {
      icon: Zap,
      title: "Keyword Optimization",
      description: "Discover missing keywords that could get you past the initial screening"
    },
    {
      icon: Shield,
      title: "Format Analysis",
      description: "Ensure your formatting won't break ATS parsing algorithms"
    },
    {
      icon: FileSearch,
      title: "Content Gaps",
      description: "Identify missing sections and information that recruiters expect to see"
    },
    {
      icon: Award,
      title: "Industry Benchmarking",
      description: "Compare your resume against successful candidates in your field"
    },
    {
      icon: TrendingUp,
      title: "Improvement Roadmap",
      description: "Get a step-by-step plan to optimize your resume for better results"
    }
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get your resume analyzed in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="text-center animate-fade-in-up" style={{animationDelay: `${index * 0.2}s`}}>
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <step.icon className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* What You'll Discover */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What You'll Discover</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Uncover the hidden issues preventing your resume from reaching human recruiters
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {discoveries.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="bg-purple-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features