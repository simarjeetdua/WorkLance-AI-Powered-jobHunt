import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import FreelancerDashboard from './FreelancerDashboard'
import ClientDashboard from './ClientDashboard'
import AdminDashboard from './AdminDashboard'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  // ✅ Show loading (important)
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh] text-white/50">
          Loading dashboard...
        </div>
      </DashboardLayout>
    )
  }

  // ✅ Safety check
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh] text-red-400">
          User not found. Please login again.
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'client' && <ClientDashboard />}
      {user.role === 'freelancer' && <FreelancerDashboard />}

      {/* ✅ fallback (very important) */}
      {!['admin', 'client', 'freelancer'].includes(user.role) && (
        <div className="text-center text-red-400 py-10">
          Invalid role detected
        </div>
      )}
    </DashboardLayout>
  )
}