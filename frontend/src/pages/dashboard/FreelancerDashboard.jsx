import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { applicationsAPI, aiAPI, escrowAPI } from '../../services/api'
import { StatCard, CardSkeleton, EmptyState, PageHeader, Skeleton } from '../../components/ui/index'
import JobCard from '../../components/shared/JobCard'
import {
  Briefcase, FileText, DollarSign, Sparkles, TrendingUp, ArrowRight,
  ShieldCheck, AlertCircle, Clock, CheckCircle2, Star
} from 'lucide-react'
import { formatCurrency, timeAgo } from '../../utils/helpers'

export default function FreelancerDashboard() {
  const { user } = useAuth()

  // Fetch dashboard data
  const { data: appsData, loading: appsLoading } = useAsync(() => applicationsAPI.mine())
  const { data: recsData, loading: recsLoading } = useAsync(() => aiAPI.recommendations())
  const { data: escrowsData, loading: escrowsLoading } = useAsync(() => escrowAPI.mine())

  const applications = Array.isArray(appsData) ? appsData : []
  const recommendations = Array.isArray(recsData) ? recsData : []
  const escrows = Array.isArray(escrowsData) ? escrowsData : []

  // Metrics
  const totalEarned = escrows.filter(e => e.status === 'released').reduce((s, e) => s + (e.amount || 0), 0)
  const activeProjects = escrows.filter(e => ['held_in_escrow', 'work_submitted', 'client_review_pending', 'disputed'].includes(e.status)).length

  const stats = [
    { label: 'Applied Jobs', value: applications.length || 0, icon: FileText, color: 'brand' },
    { label: 'Active Projects', value: activeProjects, icon: Briefcase, color: 'blue' },
    { label: 'Total Earned', value: formatCurrency(totalEarned), icon: DollarSign, color: 'purple' },
    { label: 'Success Rate', value: escrows.length > 0 ? `${Math.round((escrows.filter(e => e.status === 'released').length / escrows.length) * 100)}%` : '100%', icon: TrendingUp, color: 'yellow' },
  ]

  // Filter incoming proposals (invited by client)
  const incomingProposals = applications.filter(a => ['pending', 'shortlisted', 'interview'].includes(a.status))
  // Filter active escrows
  const activeEscrows = escrows.filter(e => ['held_in_escrow', 'work_submitted', 'client_review_pending', 'disputed'].includes(e.status))
  // Filter pending client reviews
  const pendingReviews = escrows.filter(e => e.status === 'work_submitted')

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hello, ${user?.name || user?.username?.split(' ')[0] || 'User'} 👋`}
        subtitle="Here's what's happening with your freelancing career today."
        action={
          <Link to="/jobs" className="btn-primary flex items-center gap-2 text-sm">
            Browse Marketplace <ArrowRight size={16} />
          </Link>
        }
      />

      {/* 📊 Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={appsLoading || escrowsLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 📩 Incoming Proposals / Hiring Invites */}
          <section className="glass-card p-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <FileText size={18} className="text-brand-500" /> Incoming Proposals & Invites ({incomingProposals.length})
              </h3>
              <Link to="/dashboard/applications" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                View all tracking
              </Link>
            </div>

            {appsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
              </div>
            ) : incomingProposals.length > 0 ? (
              <div className="space-y-3">
                {incomingProposals.map((app) => (
                  <div key={app._id} className="glass p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{app.job?.title || 'Project Offer'}</p>
                      <div className="flex items-center gap-2.5 mt-1 text-[11px] text-white/50">
                        <span className="text-brand-400 font-bold">${app.bidAmount || app.job?.budget}</span>
                        <span>•</span>
                        <span>Client Vetted</span>
                        <span>•</span>
                        <span>{timeAgo(app.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge border text-[9px] uppercase font-bold ${
                        app.status === 'interview' ? 'border-indigo-500 text-indigo-400' :
                        app.status === 'shortlisted' ? 'border-amber-500 text-amber-400' :
                        'border-slate-500 text-white/60'
                      }`}>
                        {app.status}
                      </span>
                      <Link to="/dashboard/applications" className="p-1 px-2.5 rounded bg-brand-500/10 hover:bg-brand-500/20 text-xs font-semibold text-brand-400">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-white/40">
                No active job invitations or client proposals pending review.
              </div>
            )}
          </section>

          {/* 💰 Escrow Payments & Active Milestones */}
          <section className="glass-card p-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" /> Escrow Milestone Wallets ({activeEscrows.length})
              </h3>
              <Link to="/dashboard/escrow" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Open Wallet
              </Link>
            </div>

            {escrowsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
              </div>
            ) : activeEscrows.length > 0 ? (
              <div className="space-y-3">
                {activeEscrows.map((e) => (
                  <div key={e._id} className="glass p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{e.job?.title || 'Contract Milestone'}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/50">
                        <span className="font-bold text-white">${e.amount} held</span>
                        <span>•</span>
                        <span className="capitalize text-yellow-500">{e.status.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <Link to="/dashboard/escrow" className="btn-secondary py-1.5 px-3.5 text-xs text-glow">
                      Deliver Work
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-white/40">
                No funded escrows active. Funds appear here when client contracts are funded.
              </div>
            )}
          </section>

          {/* AI Recommendations */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-brand-500" />
                <h2 className="font-display text-base font-bold text-white">AI Recommendations</h2>
                <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20 text-[10px]">
                  Match Rating
                </span>
              </div>
              <Link to="/dashboard/recommendations" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5">
                See all <ArrowRight size={12} />
              </Link>
            </div>

            {recsLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2].map(i => <CardSkeleton key={i} />)}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {recommendations.slice(0, 2).map((job, i) => (
                  <JobCard key={job._id} job={job} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="No recommendations"
                description="Populate your profile skills to view recommendations."
                action={<Link to="/profile/me" className="btn-primary text-xs py-1.5">Configure Profile</Link>}
              />
            )}
          </section>

        </div>

        {/* Sidebar Widgets Column */}
        <div className="space-y-8">
          
          {/* ⏱️ Pending Reviews Panel */}
          <section className="glass-card p-5">
            <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-1.5 border-b border-[var(--border-color)] pb-3">
              <Clock size={16} className="text-amber-500" /> Pending Payment Reviews ({pendingReviews.length})
            </h3>
            {pendingReviews.length > 0 ? (
              <div className="space-y-3">
                {pendingReviews.map((e) => (
                  <div key={e._id} className="p-3 bg-brand-500/5 rounded-xl border border-brand-500/10 space-y-1.5">
                    <p className="font-semibold text-xs text-white truncate">{e.job?.title}</p>
                    <div className="flex justify-between items-center text-[10px] text-white/50">
                      <span>Value: ${e.amount}</span>
                      <span className="text-brand-400 font-medium">Awaiting Client Approval</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-white/40">
                No submissions currently in review.
              </div>
            )}
          </section>

          {/* ⚡ Quick Dashboard Actions */}
          <section className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-sm text-white border-b border-[var(--border-color)] pb-3">
              Quick Resources
            </h3>
            <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
              <Link to="/profile/me" className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-brand-500/10 border border-[var(--border-color)] transition-all">
                <span>Update Freelancer Profile</span>
                <ArrowRight size={13} className="text-brand-400" />
              </Link>
              <Link to="/jobs" className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-brand-500/10 border border-[var(--border-color)] transition-all">
                <span>Search Contract Jobs</span>
                <ArrowRight size={13} className="text-brand-400" />
              </Link>
              <Link to="/dashboard/escrow" className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-brand-500/10 border border-[var(--border-color)] transition-all">
                <span>View Transaction Ledgers</span>
                <ArrowRight size={13} className="text-brand-400" />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}