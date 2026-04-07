import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAsync, useMutation } from '../../hooks/useAsync'
import { jobsAPI, applicationsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PublicLayout from '../../layouts/PublicLayout'
import { Avatar, Badge, Skeleton, Modal } from '../../components/ui/index'
import { formatCurrency, timeAgo, getSkillColor } from '../../utils/helpers'
import {
  MapPin, Clock, DollarSign, Users, ArrowLeft, Send, Bookmark,
  Star, CheckCircle, AlertCircle, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function JobDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: job, loading, error } = useAsync(() => jobsAPI.getById(id), [id])
  const { mutate: apply, loading: applying } = useMutation(applicationsAPI.apply)
  const [applyModal, setApplyModal] = useState(false)
  const [form, setForm] = useState({ coverLetter: '', bidAmount: '' })
  const [formErrors, setFormErrors] = useState({})

  const validateForm = () => {
    const e = {}
    if (!form.coverLetter.trim()) e.coverLetter = 'Cover letter is required'
    if (!form.bidAmount || form.bidAmount <= 0) e.bidAmount = 'Valid bid amount required'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleApply = async () => {
    if (!validateForm()) return

    try {
      await apply(
        {
          jobId: id,
          proposal: form.coverLetter,
          bidAmount: form.bidAmount
        },
        {
          successMsg: '🎉 Application submitted!',
          onSuccess: () => {
            setApplyModal(false)
            setForm({ coverLetter: '', bidAmount: '' })
          }
        }
      )
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    </PublicLayout>
  )

  if (error || !job) return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-white mb-2">Job Not Found</h2>
        <p className="text-white/40 mb-6">This job may have been removed or is no longer available.</p>
        <Link to="/jobs" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Browse Jobs
        </Link>
      </div>
    </PublicLayout>
  )

  const canApply = user && user.role === 'freelancer' && job.status === 'open'

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Jobs
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-7">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`badge border text-xs ${job.status === 'open' ? 'text-brand-400 bg-brand-500/10 border-brand-500/20' : 'text-white/40 bg-white/5 border-white/10'}`}>
                      {job.status === 'open' ? '● Open' : 'Closed'}
                    </span>
                    <span className="text-xs text-white/30">{timeAgo(job.createdAt)}</span>
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-snug">{job.title}</h1>
                </div>
                <button className="p-2.5 rounded-xl glass border border-white/10 text-white/40 hover:text-brand-400 hover:border-brand-500/30 transition-all flex-shrink-0">
                  <Bookmark size={18} />
                </button>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-white/50 mb-5">
                <span className="flex items-center gap-1.5">
                  <DollarSign size={15} className="text-brand-400" />
                  <span className="font-semibold text-white">{formatCurrency(job.budget)}</span>
                </span>
                {job.location && (
                  <span className="flex items-center gap-1.5"><MapPin size={15} />{job.location}</span>
                )}
                <span className="flex items-center gap-1.5"><Clock size={15} />{timeAgo(job.createdAt)}</span>
                {job.applicants !== undefined && (
                  <span className="flex items-center gap-1.5"><Users size={15} />{job.applicants} applicants</span>
                )}
              </div>

              {job.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSkillColor(i)}`}>{skill}</span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-7">
              <h2 className="font-display text-lg font-bold text-white mb-4">Job Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/60 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            </motion.div>

            {/* Requirements */}
            {job.requirements && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-7">
                <h2 className="font-display text-lg font-bold text-white mb-4">Requirements</h2>
                <p className="text-white/60 leading-relaxed whitespace-pre-line">{job.requirements}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Apply card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <div className="text-center mb-5">
                <p className="text-3xl font-display font-bold text-white">{formatCurrency(job.budget)}</p>
                <p className="text-sm text-white/40 mt-1">Project Budget</p>
              </div>

              {canApply ? (
                <button onClick={() => setApplyModal(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send size={16} /> Apply Now
                </button>
              ) : !user ? (
                <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send size={16} /> Login to Apply
                </Link>
              ) : user.role === 'client' ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 text-sm text-white/40">
                  <AlertCircle size={14} /> Clients cannot apply to jobs
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 text-sm text-yellow-400">
                  <AlertCircle size={14} /> This job is no longer accepting applications
                </div>
              )}

              <div className="mt-4 space-y-2.5 text-sm">
                {[
                  ['Experience', job.experience || 'Any level'],
                  ['Duration', job.duration || 'Not specified'],
                  ['Type', job.type || 'Remote'],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-white/40">{key}</span>
                    <span className="text-white font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Client card */}
            {job.client && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
                <h3 className="font-semibold text-white mb-4 text-sm">About the Client</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={job.client.name} size="md" />
                  <div>
                    <p className="font-semibold text-white text-sm">{job.client.name}</p>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs">
                      <Star size={11} fill="currentColor" />
                      <span className="font-semibold">4.8</span>
                      <span className="text-white/30">· Client</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/40">Member since</span>
                    <span className="text-white">{timeAgo(job.client.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Total spent</span>
                    <span className="text-white">$0</span>
                  </div>
                </div>
                <Link to={`/profile/${job.client._id}`} className="btn-ghost w-full text-center text-sm mt-4 flex items-center justify-center gap-1.5">
                  <ExternalLink size={13} /> View Profile
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyModal && (
          <Modal open={applyModal} onClose={() => setApplyModal(false)} title="Submit Your Application">
            <div className="space-y-4">
              <div>
                <label className="label">Cover Letter *</label>
                <textarea
                  rows={5}
                  placeholder="Tell the client why you're the perfect fit for this project..."
                  value={form.coverLetter}
                  onChange={e => setForm({ ...form, coverLetter: e.target.value })}
                  className={`input-field resize-none ${formErrors.coverLetter ? 'border-red-500/50' : ''}`}
                />
                {formErrors.coverLetter && <p className="text-red-400 text-xs mt-1">{formErrors.coverLetter}</p>}
              </div>
              <div>
                <label className="label">Your Bid (USD) *</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="number"
                    placeholder="Enter your bid amount"
                    value={form.bidAmount}
                    onChange={e => setForm({ ...form, bidAmount: e.target.value })}
                    className={`input-field pl-10 ${formErrors.bidAmount ? 'border-red-500/50' : ''}`}
                  />
                </div>
                {formErrors.bidAmount && <p className="text-red-400 text-xs mt-1">{formErrors.bidAmount}</p>}
                <p className="text-xs text-white/30 mt-1">Client's budget: {formatCurrency(job.budget)}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setApplyModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleApply} disabled={applying} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {applying ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : <><Send size={15} /> Submit Application</>}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </PublicLayout>
  )
}
