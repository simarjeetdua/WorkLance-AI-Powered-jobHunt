import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { jobsAPI } from '../../services/api'
import { StatCard, CardSkeleton, EmptyState, PageHeader } from '../../components/ui/index'
import { Briefcase, Plus, Users, DollarSign, TrendingUp, ArrowRight, Clock } from 'lucide-react'
import { formatCurrency, timeAgo, getStatusColor } from '../../utils/helpers'

export default function ClientDashboard() {
  const { user } = useAuth()

  const { data, loading } = useAsync(() => jobsAPI.myJobs())

  // ✅ SAFETY FIX (MOST IMPORTANT)
  const jobs = Array.isArray(data) ? data : []

  // ✅ SAFE CALCULATIONS
  const openJobs = jobs.filter(j => j.status === 'open')
  const totalApps = jobs.reduce((s, j) => s + (j.applicants || 0), 0)

  const stats = [
    { label: 'Active Jobs', value: openJobs.length, icon: Briefcase, color: 'brand' },
    { label: 'Total Jobs', value: jobs.length || '—', icon: TrendingUp, color: 'blue' },
    { label: 'Applications', value: totalApps, icon: Users, color: 'purple' },
    { label: 'Total Spent', value: '$0', icon: DollarSign, color: 'yellow' },
  ]

  return (
    <div>
      <PageHeader
        // ✅ FIX username
        title={`Hello, ${user?.username?.split(' ')[0] || 'User'} 👋`}
        subtitle="Manage your jobs and find the best talent"
        action={
          <Link to="/dashboard/post-job" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Post a Job
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      {/* Jobs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-white">My Jobs</h2>
          <Link
            to="/dashboard/my-jobs"
            className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job, i) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="font-semibold text-white hover:text-brand-400 transition-colors truncate block"
                  >
                    {job.title}
                  </Link>

                  <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {job.applicants || 0} applicants
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {timeAgo(job.createdAt)}
                    </span>

                    <span>{formatCurrency(job.budget)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`badge border text-xs ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>

                  <Link
                    to={`/dashboard/applications?job=${job._id}`}
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    View Apps
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Post your first job to start receiving applications from top freelancers."
            action={
              <Link
                to="/dashboard/post-job"
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Plus size={14} /> Post a Job
              </Link>
            }
          />
        )}
      </section>
    </div>
  )
}