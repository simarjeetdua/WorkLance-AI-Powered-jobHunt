import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/shared/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ApplicationsPage from './pages/dashboard/ApplicationsPage'
import MyJobsPage from './pages/dashboard/MyJobsPage'
import RecommendationsPage from './pages/dashboard/RecommendationsPage'
import JobsPage from './pages/jobs/JobsPage'
import JobDetailPage from './pages/jobs/JobDetailPage'
import PostJobPage from './pages/jobs/PostJobPage'
import ProfilePage from './pages/profile/ProfilePage'
import FreelancersPage from './pages/FreelancersPage'
import EscrowPage from './pages/escrow/EscrowPage'
import ReviewsPage from './pages/reviews/ReviewsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f1724',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#25a36b', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              duration: 3500,
            }}
          />

          <AnimatePresence mode="wait">
            <Routes>
              {/* Public */}
              <Route path="/"          element={<LandingPage />} />
              <Route path="/login"     element={<LoginPage />} />
              <Route path="/register"  element={<RegisterPage />} />
              <Route path="/jobs"      element={<JobsPage />} />
              <Route path="/jobs/:id"  element={<JobDetailPage />} />
              <Route path="/freelancers" element={<FreelancersPage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />

              {/* Any auth */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
              <Route path="/dashboard/escrow"  element={<ProtectedRoute><EscrowPage /></ProtectedRoute>} />
              <Route path="/dashboard/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
              <Route path="/profile/me"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Freelancer */}
              <Route path="/dashboard/recommendations" element={<ProtectedRoute roles={['freelancer']}><RecommendationsPage /></ProtectedRoute>} />

              {/* Client */}
              <Route path="/dashboard/post-job" element={<ProtectedRoute roles={['client']}><PostJobPage /></ProtectedRoute>} />
              <Route path="/dashboard/my-jobs"  element={<ProtectedRoute roles={['client']}><MyJobsPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/dashboard/users"     element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute roles={['admin']}><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/dashboard/admin-jobs" element={<ProtectedRoute roles={['admin']}><JobsPage /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
