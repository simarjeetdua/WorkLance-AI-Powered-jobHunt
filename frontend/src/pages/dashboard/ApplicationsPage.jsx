import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAsync, useMutation } from '../../hooks/useAsync'
import { applicationsAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout' // ✅ FIX
import { PageHeader, EmptyState, CardSkeleton } from '../../components/ui/index'
import ApplicationCard from '../../components/shared/ApplicationCard'
import { FileText, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth()
  const isClient = user?.role === 'client'

  // ✅ FIX: WAIT for user before calling API
  const { data, loading, refetch } = useAsync(
    () =>
      isClient
        ? applicationsAPI.getClientApps()
        : applicationsAPI.mine(),
    {
      enabled: !!user // 🔥 VERY IMPORTANT FIX
    }
  )

  // ✅ SAFETY
  const applications = Array.isArray(data) ? data : []

  // ✅ MUTATION FIX
  const { mutate: updateStatus } = useMutation(
    ({ id, status }) => applicationsAPI.update(id, { status })
  )

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatus(
        { id, status },
        {
          successMsg: `Application ${status}`,
          onSuccess: refetch,
        }
      )
    } catch {
      toast.error('Failed to update application')
    }
  }

  // ✅ FILTERS
  const pending = applications.filter(a => a.status === 'pending')
  const accepted = applications.filter(a => a.status === 'accepted')
  const rejected = applications.filter(a => a.status === 'rejected')

  // ✅ AUTH LOADING FIX
  if (authLoading) {
    return <div className="text-white p-6">Loading...</div>
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={isClient ? 'Received Applications' : 'My Applications'}
        subtitle={`${applications.length} total applications`}
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-8">

          {/* Pending */}
          {pending.length > 0 && (
            <section>
              <h2 className="font-semibold text-white/60 text-sm uppercase tracking-wider mb-3">
                Pending ({pending.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {pending.map(app => (
                  <ApplicationCard
                    key={app._id}
                    application={app}
                    isClient={isClient}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Accepted */}
          {accepted.length > 0 && (
            <section>
              <h2 className="font-semibold text-brand-400 text-sm uppercase tracking-wider mb-3">
                Accepted ({accepted.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {accepted.map(app => (
                  <ApplicationCard
                    key={app._id}
                    application={app}
                    isClient={isClient}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Rejected */}
          {rejected.length > 0 && (
            <section>
              <h2 className="font-semibold text-red-400/60 text-sm uppercase tracking-wider mb-3">
                Rejected ({rejected.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {rejected.map(app => (
                  <ApplicationCard
                    key={app._id}
                    application={app}
                    isClient={isClient}
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={isClient ? 'No applications received' : 'No applications yet'}
          description={
            isClient
              ? 'Post a job to start receiving applications.'
              : 'Start applying to jobs to see them here.'
          }
          action={
            isClient ? (
              <Link to="/dashboard/post-job" className="btn-primary text-sm">
                Post a Job
              </Link>
            ) : (
              <Link to="/jobs" className="btn-primary text-sm flex items-center gap-2">
                <Briefcase size={14} /> Browse Jobs
              </Link>
            )
          }
        />
      )}
    </DashboardLayout>
  )
}