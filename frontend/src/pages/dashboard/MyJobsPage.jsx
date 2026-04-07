import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAsync, useMutation } from '../../hooks/useAsync'
import { jobsAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout'
import { PageHeader, EmptyState, CardSkeleton } from '../../components/ui/index'
import JobCard from '../../components/shared/JobCard'
import { Briefcase, Plus, Trash2, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyJobsPage() {
  const { data, loading, refetch } = useAsync(() => jobsAPI.myJobs())
  const { mutate: deleteJob } = useMutation((id) => jobsAPI.delete(id))

  const [filter, setFilter] = useState('all')

  // ✅ SAFETY FIX (MOST IMPORTANT)
  const jobs = Array.isArray(data) ? data : []

  // ✅ SAFE FILTER
  const filtered = jobs.filter(j => filter === 'all' || j.status === filter)

  const handleDelete = async (id) => {
    if (!confirm('Delete this job? This cannot be undone.')) return

    try {
      await deleteJob(id, {
        successMsg: 'Job deleted',
        onSuccess: refetch,
      })
    } catch (err) {
      toast.error('Failed to delete job')
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="My Jobs"
        subtitle={`${jobs.length} jobs posted`}
        action={
          <Link to="/dashboard/post-job" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Post New Job
          </Link>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit mb-6">
        {['all', 'open', 'closed', 'in_progress'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-5">
          <AnimatePresence>
            {filtered.map((job, i) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative group"
              >
                <JobCard job={job} index={i} showStatus />

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Link
                    to={`/jobs/${job._id}/edit`}
                    className="p-2 rounded-lg bg-surface-dark/80 backdrop-blur border border-white/10 text-white/60 hover:text-white transition-all"
                  >
                    <Edit3 size={14} />
                  </Link>

                  <button
                    onClick={() => handleDelete(job._id)}
                    className="p-2 rounded-lg bg-surface-dark/80 backdrop-blur border border-white/10 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={
            filter === 'all'
              ? "You haven't posted any jobs yet."
              : `No ${filter} jobs found.`
          }
          action={
            <Link to="/dashboard/post-job" className="btn-primary text-sm flex items-center gap-2">
              <Plus size={14} /> Post a Job
            </Link>
          }
        />
      )}
    </DashboardLayout>
  )
}