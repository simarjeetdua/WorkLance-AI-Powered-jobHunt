import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAsync, useMutation } from '../../hooks/useAsync'
import { jobsAPI, escrowAPI, applicationsAPI } from '../../services/api'
import { StatCard, CardSkeleton, EmptyState, PageHeader, Skeleton } from '../../components/ui/index'
import {
  Briefcase, Plus, Users, DollarSign, TrendingUp, ArrowRight, Clock,
  ShieldAlert, CheckCircle2, AlertCircle, Sparkles, MessageSquare
} from 'lucide-react'
import { formatCurrency, timeAgo } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function ClientDashboard() {
  const { user } = useAuth()

  // Fetch client statistics
  const { data: jobsData, loading: jobsLoading } = useAsync(() => jobsAPI.myJobs())
  const { data: escrowsData, loading: escrowsLoading, refetch: refetchEscrows } = useAsync(() => escrowAPI.mine())
  const { data: appsData, loading: appsLoading } = useAsync(() => applicationsAPI.getClientApps())

  const jobs = Array.isArray(jobsData) ? jobsData : []
  const escrows = Array.isArray(escrowsData) ? escrowsData : []
  const applications = Array.isArray(appsData) ? appsData : []

  // Escrow mutations
  const { mutate: releaseMutate } = useMutation((id) => escrowAPI.release(id))

  // Calculations
  const openJobs = jobs.filter(j => j.status === 'open')
  const totalApps = jobs.reduce((s, j) => s + (j.applicants || 0), 0)
  const totalSpent = escrows.filter(e => e.status === 'released').reduce((s, e) => s + (e.amount || 0), 0)

  const stats = [
    { label: 'Active Jobs', value: openJobs.length, icon: Briefcase, color: 'brand' },
    { label: 'Total Jobs', value: jobs.length || 0, icon: TrendingUp, color: 'blue' },
    { label: 'Applications', value: totalApps, icon: Users, color: 'purple' },
    { label: 'Total Spent', value: formatCurrency(totalSpent), icon: DollarSign, color: 'yellow' },
  ]

  // Filter sent proposals & invitations
  const sentProposals = applications.filter(a => ['pending', 'shortlisted', 'interview'].includes(a.status))
  // Filter active escrows
  const activeEscrows = escrows.filter(e => ['held_in_escrow', 'work_submitted', 'client_review_pending', 'disputed'].includes(e.status))
  // Filter pending review deliverables
  const pendingReviews = escrows.filter(e => e.status === 'work_submitted')

  const handleQuickRelease = async (id) => {
    if (!confirm('Are you sure you want to release these funds to the freelancer?')) return
    await releaseMutate(id, {
      successMsg: '🚀 Payment released to freelancer!',
      onSuccess: refetchEscrows
    })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hello, ${user?.name || user?.username?.split(' ')[0] || 'User'} 👋`}
        subtitle="Manage your projects, fund escrows, and coordinate with freelancer hires."
        action={
          <div className="flex gap-2">
            <Link to="/dashboard/post-job" className="btn-primary flex items-center gap-1.5 text-xs py-2.5 px-5">
              <Plus size={15} /> Post a Job
            </Link>
            <Link to="/freelancers" className="btn-secondary flex items-center gap-1.5 text-xs py-2.5 px-5">
              Hire Talent
            </Link>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} loading={jobsLoading || escrowsLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ⏱️ Deliverables Pending Approval / Review */}
          <section className="glass-card p-5 border-l-4 border-amber-500">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Clock size={18} className="text-amber-500" /> Deliverables Awaiting Review ({pendingReviews.length})
              </h3>
              <Link to="/dashboard/escrow" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Go to Escrows
              </Link>
            </div>

            {escrowsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
              </div>
            ) : pendingReviews.length > 0 ? (
              <div className="space-y-3">
                {pendingReviews.map((e) => (
                  <div key={e._id} className="glass p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{e.job?.title}</p>
                      <p className="text-[11px] text-white/50 mt-1">Submitted by {e.freelancer?.name} • Held: ${e.amount}</p>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleQuickRelease(e._id)}
                        className="px-3.5 py-1.5 rounded-lg bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-all text-glow"
                      >
                        Approve & Release
                      </button>
                      <Link to="/dashboard/escrow" className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-white/5 text-[var(--text-color)]/70 hover:bg-white/10 text-xs font-semibold">
                        Review Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-white/40">
                No deliverables pending approval. Freelancer submissions appear here.
              </div>
            )}
          </section>

          {/* 📩 Sent Proposals & Job Invitations */}
          <section className="glass-card p-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Users size={18} className="text-brand-500" /> Sent Proposals & Invites ({sentProposals.length})
              </h3>
              <Link to="/dashboard/applications" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Manage Applicants
              </Link>
            </div>

            {appsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
              </div>
            ) : sentProposals.length > 0 ? (
              <div className="space-y-3">
                {sentProposals.slice(0, 3).map((app) => (
                  <div key={app._id} className="glass p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">Invite to {app.freelancer?.name || 'Freelancer'}</p>
                      <p className="text-[11px] text-white/50 mt-1">Project: {app.job?.title} • Budget: ${app.bidAmount || app.job?.budget}</p>
                    </div>
                    <span className={`badge border text-[9px] font-bold uppercase ${
                      app.status === 'interview' ? 'border-indigo-500 text-indigo-400' :
                      app.status === 'shortlisted' ? 'border-amber-500 text-amber-400' :
                      'border-slate-500 text-white/50'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-white/40">
                No active outgoing job proposals or invitations pending response.
              </div>
            )}
          </section>

          {/* Jobs Listing */}
          <section className="glass-card p-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Briefcase size={18} className="text-blue-500" /> My Posted Jobs ({jobs.length})
              </h3>
              <Link to="/dashboard/my-jobs" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                View all jobs
              </Link>
            </div>

            {jobsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <CardSkeleton key={i} />)}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.slice(0, 3).map((job) => (
                  <div key={job._id} className="glass p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link to={`/jobs/${job._id}`} className="font-semibold text-sm text-white hover:text-brand-400 transition-colors truncate block">
                        {job.title}
                      </Link>
                      <p className="text-[10px] text-white/40 mt-1">{job.applicants || 0} applicants • Budget: {formatCurrency(job.budget)}</p>
                    </div>
                    <span className={`badge border text-[9px] uppercase font-bold ${
                      job.status === 'open' ? 'border-emerald-500 text-emerald-400' : 'border-slate-500 text-white/60'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <EmptyState
                  icon={Briefcase}
                  title="No job postings"
                  description="Post a project contract opening to hire top developers."
                  action={<Link to="/dashboard/post-job" className="btn-primary text-xs py-1.5">Post Job</Link>}
                />
              </div>
            )}
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* 🛡️ Active Escrow Contracts & Hires */}
          <section className="glass-card p-5">
            <h3 className="font-display font-bold text-sm text-white border-b border-[var(--border-color)] pb-3 mb-4 flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-brand-500 animate-pulse" /> Active Hires & Escrows ({activeEscrows.length})
            </h3>

            {escrowsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
              </div>
            ) : activeEscrows.length > 0 ? (
              <div className="space-y-3">
                {activeEscrows.map((e) => (
                  <div key={e._id} className="p-3 bg-brand-500/5 rounded-xl border border-brand-500/10 space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <p className="font-semibold text-xs text-white truncate flex-1">{e.freelancer?.name || 'Freelancer'}</p>
                      <span className="text-[10px] font-bold text-brand-400 font-mono">${e.amount}</span>
                    </div>
                    <p className="text-[10px] text-white/40 truncate">{e.job?.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-white/40">
                No active hired freelancers or funded escrows.
              </div>
            )}
          </section>

          {/* ⚡ Quick controls */}
          <section className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-sm text-white border-b border-[var(--border-color)] pb-3">
              Escrow Controls & Ledgers
            </h3>
            <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
              <Link to="/dashboard/escrow" className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-brand-500/10 border border-[var(--border-color)] transition-all">
                <span>Manage Funded Escrows</span>
                <ArrowRight size={13} className="text-brand-400" />
              </Link>
              <Link to="/freelancers" className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-brand-500/10 border border-[var(--border-color)] transition-all">
                <span>Browse Marketplace Talent</span>
                <ArrowRight size={13} className="text-brand-400" />
              </Link>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}