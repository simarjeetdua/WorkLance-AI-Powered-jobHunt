import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { applicationsAPI, aiAPI } from '../../services/api'
import { StatCard, CardSkeleton, EmptyState, PageHeader } from '../../components/ui/index'
import JobCard from '../../components/shared/JobCard'
import { Briefcase, FileText, DollarSign, Sparkles, TrendingUp, ArrowRight } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

export default function FreelancerDashboard() {
  const { user } = useAuth()

  const { data: appsData, loading: appsLoading } = useAsync(() => applicationsAPI.mine())
  const { data: recsData, loading: recsLoading } = useAsync(() => aiAPI.recommendations())

  // ✅ SAFETY FIX (MOST IMPORTANT)
  const applications = Array.isArray(appsData) ? appsData : []
  const recommendations = Array.isArray(recsData) ? recsData : []

  // ✅ SAFE STATS
  const stats = [
    { label: 'Applied Jobs', value: applications.length || '—', icon: FileText, color: 'brand' },
    {
      label: 'Active Projects',
      value: applications.filter(a => a.status === 'accepted').length,
      icon: Briefcase,
      color: 'blue'
    },
    { label: 'Total Earned', value: '$0', icon: DollarSign, color: 'purple' },
    { label: 'Success Rate', value: '—', icon: TrendingUp, color: 'yellow' },
  ]

  return (
    <div>
      <PageHeader
        // ✅ FIX username
        title={`Hello, ${user?.username?.split(' ')[0] || 'User'} 👋`}
        subtitle="Here's what's happening with your freelancing today"
        action={
          <Link to="/jobs" className="btn-primary flex items-center gap-2 text-sm">
            Find Jobs <ArrowRight size={16} />
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={appsLoading} />
        ))}
      </div>

      {/* AI Recommendations */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-brand-400" />
            <h2 className="font-display text-xl font-bold text-white">AI Recommendations</h2>
            <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20">
              Personalized
            </span>
          </div>
          <Link
            to="/dashboard/recommendations"
            className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            See all <ArrowRight size={14} />
          </Link>
        </div>

        {recsLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((job, i) => (
              <JobCard key={job._id} job={job} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No recommendations yet"
            description="Complete your profile to get AI-powered job recommendations tailored to your skills."
            action={
              <Link to="/profile/me" className="btn-primary text-sm">
                Complete Profile
              </Link>
            }
          />
        )}
      </section>

      {/* Recent Applications */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-white">Recent Applications</h2>
          <Link
            to="/dashboard/applications"
            className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {appsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : applications.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {applications.slice(0, 4).map((app, i) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <Link
                    to={`/jobs/${app.job?._id}`}
                    className="font-semibold text-white hover:text-brand-400 transition-colors text-sm"
                  >
                    {app.job?.title || 'Job Listing'}
                  </Link>

                  <span className={`badge border text-xs ${
                    app.status === 'accepted'
                      ? 'text-brand-400 bg-brand-500/10 border-brand-500/20'
                      : app.status === 'rejected'
                      ? 'text-red-400 bg-red-500/10 border-red-500/20'
                      : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <p className="text-xs text-white/40">
                  {app.job?.client?.username || 'Client'} · Bid: {formatCurrency(app.bidAmount || 0)}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Start applying to jobs that match your skills."
            action={
              <Link to="/jobs" className="btn-primary text-sm">
                Browse Jobs
              </Link>
            }
          />
        )}
      </section>
    </div>
  )
}