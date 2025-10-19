import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { StripeProvider } from './contexts/StripeContext'
import Layout from './components/Layout'
import Hero from './components/Hero'
import Features from './components/Features'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import LoginPage from './components/auth/LoginPage'
import SignupPage from './components/auth/SignupPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import AuthSuccess from './components/auth/AuthSuccess'
import Dashboard from './components/Dashboard'
import AdminDashboard from '../admin/components/AdminDashboard'
import AdminLogin from '../admin/components/AdminLogin'
import UserManagement from '../admin/components/UserManagement'
import ResumeUpload from './components/ResumeUpload'
import AnalysisType from './components/AnalysisType'
import AnalysisResults from './components/AnalysisResults'
import History from './components/History'
import Settings from './components/Settings'
import Analytics from './components/Analytics'
import SubscriptionSuccess from './components/SubscriptionSuccess'
import SubscriptionCancel from './components/SubscriptionCancel'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from '../admin/components/AdminRoute'

import ScrollToTop from './components/ScrollToTop'
import FloatingScrollToTop from './components/FloatingScrollToTop'

const LandingPage = () => (
  <div className="min-h-screen bg-white">
    <Hero />
    <Features />
    <Pricing />
    <Footer />
    <FloatingScrollToTop />
  </div>
)

const AppContent = () => {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <ResumeUpload />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analysis-type" 
              element={
                <ProtectedRoute>
                  <AnalysisType />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analysis-results" 
              element={
                <ProtectedRoute>
                  <AnalysisResults />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/results" 
              element={
                <ProtectedRoute>
                  <AnalysisResults />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics/trends" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics/performance" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics/compare" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics/reports" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin/login" replace />} />
            <Route 
              path="/admin/7780488674" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users/pro" 
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users/analytics" 
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } 
            />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <StripeProvider>
          <AppContent />
        </StripeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App