import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, FileX, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Hero = () => {
    const { isAuthenticated } = useAuth()

    return (
        <section className="gradient-bg text-white py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-fade-in-up">
                        <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                            Why Are You Getting{' '}
                            <span className="text-yellow-300">Ghosted</span>{' '}
                            by Employers?
                        </h1>
                        <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                            75% of resumes are rejected by AI before humans ever see them
                        </p>
                        <Link
                            to={isAuthenticated ? "/dashboard" : "/auth/signup"}
                            className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105 flex items-center space-x-2 inline-flex"
                        >
                            <span>Scan My Resume Free</span>
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>

                    <div className="animate-fade-in">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                            <h3 className="text-2xl font-semibold mb-6 text-center">Resume Funnel Reality</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Users className="h-8 w-8 text-yellow-300" />
                                        <span className="text-lg">Resumes Submitted</span>
                                    </div>
                                    <span className="text-3xl font-bold">100</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div className="bg-yellow-300 h-2 rounded-full w-full"></div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <FileX className="h-8 w-8 text-red-300" />
                                        <span className="text-lg">Pass ATS Screening</span>
                                    </div>
                                    <span className="text-3xl font-bold">25</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div className="bg-red-300 h-2 rounded-full w-1/4"></div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-8 w-8 text-green-300" />
                                        <span className="text-lg">Get Interviews</span>
                                    </div>
                                    <span className="text-3xl font-bold">5</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div className="bg-green-300 h-2 rounded-full w-1/12"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero