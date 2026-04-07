import { motion } from 'framer-motion'
import { formatCurrency, timeAgo, getStatusColor } from '../../utils/helpers'
import { Avatar } from '../ui/index'
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react'
import { useState } from 'react'
import { escrowAPI } from '../../services/api'
import { useMutation } from '../../hooks/useAsync'
import toast from 'react-hot-toast'

export default function ApplicationCard({ application, isClient = false, onUpdateStatus }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [escrowId, setEscrowId] = useState(null) // ✅ track escrow

  const person = isClient ? application.freelancer : application.job

  // ✅ FUND ESCROW
  const { mutate: fundEscrow, loading: funding } = useMutation(
    (data) => escrowAPI.create(data)
  )

  // ✅ RELEASE ESCROW
  const { mutate: releaseEscrow, loading: releasing } = useMutation(
    (id) => escrowAPI.release(id)
  )

  // 💰 FUND HANDLER
  const handleFundEscrow = async () => {
    try {
      const escrow = await fundEscrow(
        {
          jobId: application.job._id,
          freelancerId: application.freelancer._id,
          amount: application.job.budget,
          applicationId: application._id,
        },
        {
          successMsg: 'Escrow funded 💰',
        }
      )

      // ✅ SAVE escrow ID
      setEscrowId(escrow._id)

    } catch (err) {
      toast.error(err.message || 'Funding failed')
    }
  }

  // 🚀 RELEASE HANDLER
  const handleRelease = async () => {
    if (!escrowId) {
      return toast.error('Escrow not found')
    }

    try {
      await releaseEscrow(escrowId, {
        successMsg: 'Payment released 🚀'
      })
    } catch (err) {
      toast.error(err.message || 'Release failed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-5 hover:border-brand-500/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={person?.name || person?.title || '?'} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">
              {isClient ? person?.name : person?.title}
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              {isClient ? person?.email : `Posted ${timeAgo(application.createdAt)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge border text-xs ${getStatusColor(application.status)}`}>
            {application.status}
          </span>

          {isClient && application.status === 'pending' && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
              >
                <MoreHorizontal size={16} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 glass-card py-1 w-40 z-10 shadow-xl">
                  <button
                    onClick={() => {
                      onUpdateStatus?.(application._id, 'accepted')
                      setMenuOpen(false)
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-brand-400 hover:bg-brand-500/10 w-full text-left"
                  >
                    <CheckCircle size={14} /> Accept
                  </button>

                  <button
                    onClick={() => {
                      onUpdateStatus?.(application._id, 'rejected')
                      setMenuOpen(false)
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full text-left"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* COVER LETTER */}
      {application.coverLetter && (
        <p className="text-sm text-white/50 mt-3 line-clamp-2 leading-relaxed">
          {application.coverLetter}
        </p>
      )}

      {/* META */}
      <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
        {application.bidAmount && (
          <span className="flex items-center gap-1">
            <DollarSign size={11} className="text-brand-500" />
            <span className="text-white font-semibold">
              {formatCurrency(application.bidAmount)}
            </span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={11} /> {timeAgo(application.createdAt)}
        </span>
      </div>

      {/* 💰 FUND BUTTON */}
      {isClient && application.status === 'accepted' && !escrowId && (
        <div className="mt-4">
          <button
            onClick={handleFundEscrow}
            disabled={funding}
            className="btn-primary w-full text-sm flex items-center justify-center gap-2"
          >
            <DollarSign size={14} />
            {funding ? 'Funding...' : 'Fund Escrow'}
          </button>
        </div>
      )}

      {/* 🚀 RELEASE BUTTON */}
      {isClient && escrowId && (
        <div className="mt-2">
          <button
            onClick={handleRelease}
            disabled={releasing}
            className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
          >
            🚀 {releasing ? 'Releasing...' : 'Release Payment'}
          </button>
        </div>
      )}
    </motion.div>
  )
}