import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, timeAgo } from '../../utils/helpers'
import { Avatar } from '../ui/index'
import {
  DollarSign, Clock, CheckCircle2, XCircle, Calendar, Star,
  Briefcase, ArrowRight, ShieldCheck, Mail
} from 'lucide-react'
import CheckoutModal from './CheckoutModal'
import toast from 'react-hot-toast'

export default function ApplicationCard({ application, isClient = false, onUpdateStatus }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const person = isClient ? application.freelancer : application.job?.client

  // Progress timeline mapping
  const timelineStages = [
    { id: 'applied', label: 'Applied' },
    { id: 'viewed', label: 'Viewed' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'interview', label: 'Interview' },
    { id: 'hired', label: 'Hired' }
  ]

  const getTimelineIndex = (status) => {
    if (status === 'pending' || status === 'applied') return 0
    if (status === 'viewed') return 1
    if (status === 'shortlisted') return 2
    if (status === 'interview') return 3
    if (status === 'hired' || status === 'accepted') return 4
    return -1 // rejected or other
  }

  const currentStageIndex = getTimelineIndex(application.status)

  // Quick message click helper
  const handleContact = () => {
    if (person?.email) {
      window.location.href = `mailto:${person.email}?subject=WorkLance Application: ${encodeURIComponent(application.job?.title || '')}`
    } else {
      toast.success('Chat interface loaded (Simulated)')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 flex flex-col justify-between hover:border-brand-500/20 transition-all duration-300 ${
        application.status === 'rejected' ? 'opacity-75' : ''
      }`}
    >
      <div className="space-y-4">
        {/* Card Top */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar name={person?.name || person?.username || '?'} src={person?.avatar} size="sm" />
            <div className="min-w-0">
              <p className="font-bold text-sm text-[var(--text-color)] truncate">
                {isClient ? person?.name : application.job?.title}
              </p>
              <p className="text-xs text-[var(--text-color)]/50 mt-0.5 truncate">
                {isClient
                  ? (person?.role === 'freelancer' ? 'Freelancer Applicant' : person?.email)
                  : `Hiring client: ${person?.name || 'Sponsor'}`}
              </p>
            </div>
          </div>

          <span className={`badge border text-[10px] uppercase font-bold ${
            application.status === 'hired' || application.status === 'accepted' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' :
            application.status === 'rejected' ? 'border-red-500 bg-red-500/5 text-red-500' :
            application.status === 'shortlisted' ? 'border-amber-500 bg-amber-500/5 text-amber-500' :
            application.status === 'interview' ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500' :
            'border-slate-500 bg-slate-500/5 text-[var(--text-color)]/70'
          }`}>
            {application.status}
          </span>
        </div>

        {/* PROPOSAL TEXT (proposal instead of coverLetter) */}
        {(application.proposal || application.coverLetter) && (
          <div className="glass p-3 rounded-xl text-xs text-[var(--text-color)]/75 leading-relaxed">
            <p className="font-bold text-[var(--text-color)]/50 mb-1">Proposal Pitch:</p>
            <p className="line-clamp-3">
              {application.proposal || application.coverLetter}
            </p>
          </div>
        )}

        {/* METRICS (Bid amount, time) */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--text-color)]/50">
          {application.bidAmount > 0 && (
            <span className="flex items-center gap-1.5 font-bold text-[var(--text-color)] bg-brand-500/10 px-2 py-0.5 rounded-lg border border-brand-500/20">
              <DollarSign size={12} className="text-brand-500" />
              {formatCurrency(application.bidAmount)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={12} /> Applied {timeAgo(application.createdAt)}
          </span>
        </div>

        {/* Progress Tracker (Only show if not rejected) */}
        {application.status !== 'rejected' ? (
          <div className="pt-2">
            <p className="text-[10px] font-semibold text-[var(--text-color)]/45 uppercase tracking-wider mb-2">Application Progress</p>
            <div className="flex items-center justify-between relative mt-1 select-none">
              {/* Progress Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
              <div
                className="absolute left-0 h-0.5 bg-brand-500 -z-10 transition-all duration-500"
                style={{ width: `${(currentStageIndex / (timelineStages.length - 1)) * 100}%` }}
              />

              {timelineStages.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex
                const isCurrent = idx === currentStageIndex

                return (
                  <div key={stage.id} className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all duration-300 ${
                      isPassed
                        ? 'bg-brand-500 text-white ring-4 ring-brand-500/10'
                        : 'bg-slate-200 dark:bg-slate-800 text-[var(--text-color)]/30'
                    }`}>
                      {isPassed && '✓'}
                    </div>
                    <span className={`text-[8px] font-bold mt-1.5 whitespace-nowrap hidden sm:block ${
                      isCurrent ? 'text-brand-500' : 'text-[var(--text-color)]/40'
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500 text-xs">
            <XCircle size={14} />
            <span>This job application was declined and archived.</span>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-2.5">
        
        {/* Contact info trigger */}
        <button
          onClick={handleContact}
          className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg-start)] text-[var(--text-color)]/60 hover:text-brand-500 hover:border-brand-500/30 transition-all text-xs flex items-center gap-1.5"
          title="Send email message"
        >
          <Mail size={14} /> Message
        </button>

        <div className="flex gap-2 flex-grow justify-end">
          {/* CLIENT-ONLY INTERACTION BUTTONS */}
          {isClient && application.status !== 'rejected' && application.status !== 'hired' && (
            <>
              {/* Shortlist action */}
              {['pending', 'applied', 'viewed'].includes(application.status) && (
                <button
                  onClick={() => onUpdateStatus?.(application._id, 'shortlisted')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1"
                >
                  <Star size={13} /> Shortlist
                </button>
              )}

              {/* Interview request */}
              {['pending', 'applied', 'viewed', 'shortlisted'].includes(application.status) && (
                <button
                  onClick={() => onUpdateStatus?.(application._id, 'interview')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-1"
                >
                  <Calendar size={13} /> Interview
                </button>
              )}

              {/* Hire button trigger modal */}
              {['shortlisted', 'interview', 'pending', 'applied', 'viewed'].includes(application.status) && (
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm flex items-center gap-1 text-glow"
                >
                  Hire & Pay <ArrowRight size={13} />
                </button>
              )}

              {/* Decline / Reject button */}
              <button
                onClick={() => onUpdateStatus?.(application._id, 'rejected')}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-all"
              >
                Reject
              </button>
            </>
          )}

          {/* Hired state links */}
          {application.status === 'hired' && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/20 select-none">
              <ShieldCheck size={14} className="animate-bounce" /> Hired & Active
            </span>
          )}
        </div>
      </div>

      {/* simulated checkout modal */}
      {isClient && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          jobId={application.job?._id}
          applicationId={application._id}
          freelancerId={application.freelancer?._id}
          amount={application.bidAmount || application.job?.budget || 0}
          jobTitle={application.job?.title}
          onSuccess={() => {
            setCheckoutOpen(false)
            onUpdateStatus?.(application._id, 'hired')
          }}
        />
      )}
    </motion.div>
  )
}