import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAsync, useMutation } from '../../hooks/useAsync'
import { escrowAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { PageHeader, EmptyState, Skeleton } from '../../components/ui/index'
import { formatCurrency, timeAgo } from '../../utils/helpers'
import {
  DollarSign, CheckCircle2, RotateCcw, Shield, Lock, Wallet, ArrowUpRight,
  ArrowDownLeft, FileText, Download, Upload, MessageSquare, AlertCircle, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EscrowPage() {
  const { user } = useAuth()
  
  // States
  const [selectedEscrow, setSelectedEscrow] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [txLoading, setTxLoading] = useState(false)
  const [submitNotes, setSubmitNotes] = useState('')
  const [submitLink, setSubmitLink] = useState('')
  const [revisionNotes, setRevisionNotes] = useState('')
  const [disputeNotes, setDisputeNotes] = useState('')
  
  // Modals / Overlays
  const [activeAction, setActiveAction] = useState(null) // submit, revision, dispute

  // Escrow fetching
  const { data: escrows, loading: escrowsLoading, refetch: refetchEscrows } = useAsync(() => escrowAPI.mine())

  // Transactions fetching
  const fetchTransactions = async () => {
    try {
      setTxLoading(true)
      const res = await escrowAPI.transactions()
      if (res?.success) {
        setTransactions(res.transactions)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTxLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Action Mutations
  const { mutate: releaseMutate } = useMutation((id) => escrowAPI.release(id))
  const { mutate: refundMutate } = useMutation((id) => escrowAPI.refund(id))
  const { mutate: submitMutate } = useMutation(({ id, data }) => escrowAPI.submitWork(id, data))
  const { mutate: reviewMutate } = useMutation(({ id, data }) => escrowAPI.reviewWork(id, data))
  const { mutate: disputeMutate } = useMutation(({ id, data }) => escrowAPI.dispute(id, data))

  // Refresh page data
  const handleRefresh = async () => {
    await refetchEscrows()
    await fetchTransactions()
    setSelectedEscrow(null)
    toast.success('Fintech metrics updated')
  }

  // Handlers
  const handleRelease = async (id) => {
    if (!confirm('Are you sure you want to approve completed work and release funds to the freelancer?')) return
    await releaseMutate(id, {
      successMsg: '🚀 Payment released successfully!',
      onSuccess: () => {
        handleRefresh()
      }
    })
  }

  const handleRefund = async (id) => {
    if (!confirm('Are you sure you want to refund these funds? This will revert payment to your account.')) return
    await refundMutate(id, {
      successMsg: '↩️ Escrow funds refunded!',
      onSuccess: () => {
        handleRefresh()
      }
    })
  }

  const handleSubmitWorkSubmit = async (e) => {
    e.preventDefault()
    if (!submitLink) return toast.error('Please provide a link to the completed deliverables')
    await submitMutate({
      id: selectedEscrow._id,
      data: { workNotes: submitNotes, workAttachment: submitLink }
    }, {
      successMsg: '📂 Deliverables submitted for client review!',
      onSuccess: () => {
        setSubmitNotes('')
        setSubmitLink('')
        setActiveAction(null)
        handleRefresh()
      }
    })
  }

  const handleReviewWorkSubmit = async (e) => {
    e.preventDefault()
    if (!revisionNotes) return toast.error('Please specify feedback notes for the revisions')
    await reviewMutate({
      id: selectedEscrow._id,
      data: { action: 'revision', notes: revisionNotes }
    }, {
      successMsg: '🔁 Revision requested. Freelancer has been notified.',
      onSuccess: () => {
        setRevisionNotes('')
        setActiveAction(null)
        handleRefresh()
      }
    })
  }

  const handleDisputeSubmit = async (e) => {
    e.preventDefault()
    if (!disputeNotes) return toast.error('Please supply reasons for raising the dispute')
    await disputeMutate({
      id: selectedEscrow._id,
      data: { reason: disputeNotes }
    }, {
      successMsg: '⚠️ Dispute raised. Support will contact you shortly.',
      onSuccess: () => {
        setDisputeNotes('')
        setActiveAction(null)
        handleRefresh()
      }
    })
  }

  // Download receipt invoice helper
  const handleDownloadReceipt = (tx) => {
    const text = `
==================================================
           WORKLANCE TRANSACTION RECEIPT
==================================================
Receipt ID       : ${tx.transactionId}
Date/Time        : ${new Date(tx.createdAt).toLocaleString()}
Status           : SUCCESSFUL
--------------------------------------------------
Project Title    : ${tx.escrow?.job?.title || 'Contract Payment'}
Total Amount     : $${tx.amount.toFixed(2)}
Payment Method   : ${tx.paymentMethod.toUpperCase()}
Recipient User   : ${tx.escrow?.freelancer?.name || 'Freelancer'}
Client Sponsor   : ${tx.escrow?.client?.name || 'Client Sponsor'}
==================================================
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${tx.transactionId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice receipt downloaded!')
  }

  // Escrow Timeline Steps
  const getTimelineSteps = (escrow) => {
    const steps = [
      { id: 1, label: 'Payment Pending', active: true, done: true },
      { id: 2, label: 'Secured in Escrow', active: false, done: false },
      { id: 3, label: 'Work Submitted', active: false, done: false },
      { id: 4, label: 'Under Review', active: false, done: false },
      { id: 5, label: 'Completed / Released', active: false, done: false }
    ]

    const status = escrow.status
    if (['held_in_escrow', 'funded', 'work_submitted', 'client_review_pending', 'released', 'disputed'].includes(status)) {
      steps[1].active = true; steps[1].done = true
    }
    if (['work_submitted', 'released'].includes(status)) {
      steps[2].active = true; steps[2].done = true
    }
    if (['client_review_pending', 'work_submitted'].includes(status)) {
      steps[3].active = true
      if (status === 'work_submitted') steps[3].done = true
    }
    if (status === 'released') {
      steps[4].active = true; steps[4].done = true
    }
    if (status === 'refunded') {
      steps[4].label = 'Refunded'
      steps[4].active = true; steps[4].done = true
    }
    if (status === 'disputed') {
      steps[3].label = 'Disputed Case'
      steps[3].active = true
    }

    return steps
  }

  // Metrics calculation
  const totalTransacted = escrows?.reduce((s, e) => s + (e.amount || 0), 0) || 0
  const totalEscrowHeld = escrows?.filter(e => ['held_in_escrow', 'work_submitted', 'client_review_pending', 'disputed'].includes(e.status)).reduce((s, e) => s + (e.amount || 0), 0) || 0
  const completedEarnings = escrows?.filter(e => e.status === 'released').reduce((s, e) => s + (e.amount || 0), 0) || 0

  const walletDisplayBalance = user?.role === 'freelancer' ? completedEarnings : totalEscrowHeld

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Escrow & Wallet Payments" subtitle="Secured milestone billing for freelancing tasks." />
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-all duration-200"
        >
          <RefreshCw size={14} /> Refresh Ledger
        </button>
      </div>

      {/* 💳 Wallet Balance & Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-l-4 border-brand-500 md:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-[var(--text-color)]/50 uppercase tracking-wider">
                {user?.role === 'freelancer' ? 'Wallet Earnings (Released)' : 'Sponsor Secured in Escrow'}
              </p>
              <h2 className="text-4xl font-display font-bold text-[var(--text-color)] mt-2">{formatCurrency(walletDisplayBalance)}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center shadow-lg">
              <Wallet size={22} />
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-color)]/40 mt-4 leading-relaxed">
            {user?.role === 'freelancer'
              ? 'Earnings cleared and available for immediate bank transfer.'
              : 'Deposited funds protected in WorkLance smart contract escrow.'}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-3">
            <Lock size={18} />
          </div>
          <p className="text-2xl font-display font-bold text-[var(--text-color)]">{formatCurrency(totalEscrowHeld)}</p>
          <p className="text-xs text-[var(--text-color)]/55 mt-1">Pending Clearance</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
            <Shield size={18} />
          </div>
          <p className="text-2xl font-display font-bold text-[var(--text-color)]">{formatCurrency(totalTransacted)}</p>
          <p className="text-xs text-[var(--text-color)]/55 mt-1">Total Funded Volume</p>
        </motion.div>
      </div>

      {/* 📊 Interactive Fintech Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Escrow details and workflow */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Escrow List */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-sm text-[var(--text-color)]">Active Escrow Accounts</h3>
            </div>

            {escrowsLoading ? (
              <div className="p-5 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : escrows?.length > 0 ? (
              <div className="divide-y divide-[var(--border-color)]">
                {escrows.map((e) => (
                  <div
                    key={e._id}
                    onClick={() => setSelectedEscrow(selectedEscrow?._id === e._id ? null : e)}
                    className={`p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                      selectedEscrow?._id === e._id ? 'bg-brand-500/5' : 'hover:bg-brand-500/2'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[var(--text-color)] truncate">{e.job?.title || 'Contract Task'}</p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-[var(--text-color)]/50">
                        <span>{user?.role === 'client' ? `To: ${e.freelancer?.name}` : `From: ${e.client?.name}`}</span>
                        <span>•</span>
                        <span>Funded {timeAgo(e.fundedAt)}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-display font-bold text-sm text-[var(--text-color)]">{formatCurrency(e.amount)}</p>
                      <span className={`badge border text-[9px] mt-1 capitalize ${
                        e.status === 'released' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' :
                        e.status === 'refunded' ? 'border-red-500 bg-red-500/5 text-red-500' :
                        e.status === 'disputed' ? 'border-yellow-500 bg-yellow-500/5 text-yellow-500' :
                        e.status === 'work_submitted' ? 'border-blue-500 bg-blue-500/5 text-blue-500' :
                        'border-indigo-500 bg-indigo-500/5 text-indigo-500'
                      }`}>
                        {e.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12">
                <EmptyState
                  icon={Shield}
                  title="No active escrows"
                  description="Milestone escrows are generated automatically once a job application is approved and hired."
                />
              </div>
            )}
          </div>

          {/* Interactive timeline & actions on select */}
          <AnimatePresence>
            {selectedEscrow && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="glass-card p-6 border-glow"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-6">
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-color)]">Escrow Milestones Tracker</h3>
                    <p className="text-xs text-[var(--text-color)]/50 mt-1 truncate max-w-[280px]" title={selectedEscrow.job?.title}>
                      Contract: {selectedEscrow.job?.title}
                    </p>
                  </div>
                  <button onClick={() => setSelectedEscrow(null)} className="text-xs font-semibold text-[var(--text-color)]/40 hover:text-[var(--text-color)]">
                    Close
                  </button>
                </div>

                {/* Vertical Timeline Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6 relative">
                  {getTimelineSteps(selectedEscrow).map((s, idx) => (
                    <div key={s.id} className="flex flex-col items-center text-center relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        s.done ? 'bg-brand-500 text-white shadow-md' :
                        s.active ? 'bg-brand-500/20 text-brand-500 border-2 border-brand-500' :
                        'bg-slate-200 dark:bg-slate-800 text-[var(--text-color)]/30'
                      }`}>
                        {s.done ? <CheckCircle2 size={15} /> : s.id}
                      </div>
                      <p className={`text-[10px] font-semibold mt-2.5 ${s.active ? 'text-brand-500 font-bold' : 'text-[var(--text-color)]/50'}`}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Submissions view / Revision notes display */}
                {selectedEscrow.status === 'work_submitted' && (
                  <div className="glass p-4 rounded-xl mb-6 space-y-2 text-xs">
                    <p className="font-bold text-[var(--text-color)]">Freelancer Delivered Deliverables:</p>
                    <p className="text-[var(--text-color)]/70 italic mt-1 leading-relaxed">"{selectedEscrow.workNotes || 'No commentary notes.'}"</p>
                    {selectedEscrow.workAttachment && (
                      <p className="mt-2 text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                        <a href={selectedEscrow.workAttachment} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                          <Upload size={12} /> View Submission Attachment
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {selectedEscrow.note && (
                  <div className="glass p-4 rounded-xl mb-6 text-xs bg-yellow-500/5 border border-yellow-500/10">
                    <p className="font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1"><AlertCircle size={13} /> Last Client Feedback Note:</p>
                    <p className="text-[var(--text-color)]/70 italic mt-1">"{selectedEscrow.note}"</p>
                  </div>
                )}

                {/* Action forms inside tracker panel */}
                {activeAction === 'submit' && (
                  <form onSubmit={handleSubmitWorkSubmit} className="glass p-4 rounded-xl mb-6 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400">Submit Completed Deliverables</h4>
                    <div>
                      <label className="label text-[10px]">Deliverable Links / Proof URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/my-project-delivery"
                        value={submitLink}
                        onChange={(e) => setSubmitLink(e.target.value)}
                        required
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="label text-[10px]">Description & Comments</label>
                      <textarea
                        rows={3}
                        placeholder="Specify deliverables info, credentials, or instructions..."
                        value={submitNotes}
                        onChange={(e) => setSubmitNotes(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setActiveAction(null)} className="flex-1 btn-secondary py-2 text-xs">Cancel</button>
                      <button type="submit" className="flex-1 btn-primary py-2 text-xs">Submit Delivery</button>
                    </div>
                  </form>
                )}

                {activeAction === 'revision' && (
                  <form onSubmit={handleReviewWorkSubmit} className="glass p-4 rounded-xl mb-6 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-red-500">Request Revisions</h4>
                    <div>
                      <label className="label text-[10px]">Feedback Notes for Freelancer</label>
                      <textarea
                        rows={3}
                        placeholder="Describe what corrections or updates are required..."
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        required
                        className="input-field text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setActiveAction(null)} className="flex-1 btn-secondary py-2 text-xs">Cancel</button>
                      <button type="submit" className="flex-1 btn-primary py-2 text-xs bg-red-500 hover:from-red-600">Send Revision Request</button>
                    </div>
                  </form>
                )}

                {activeAction === 'dispute' && (
                  <form onSubmit={handleDisputeSubmit} className="glass p-4 rounded-xl mb-6 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-yellow-500">Raise Dispute</h4>
                    <div>
                      <label className="label text-[10px]">Dispute Reason</label>
                      <textarea
                        rows={3}
                        placeholder="State your reasons or arguments for opening this case..."
                        value={disputeNotes}
                        onChange={(e) => setDisputeNotes(e.target.value)}
                        required
                        className="input-field text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setActiveAction(null)} className="flex-1 btn-secondary py-2 text-xs">Cancel</button>
                      <button type="submit" className="flex-1 btn-primary py-2 text-xs bg-yellow-500 hover:from-yellow-600">Raise Dispute</button>
                    </div>
                  </form>
                )}

                {/* Row of buttons */}
                {!activeAction && (
                  <div className="flex flex-wrap gap-2 justify-end border-t border-[var(--border-color)] pt-4">
                    {/* FREELANCER BUTTONS */}
                    {user?.role === 'freelancer' && ['held_in_escrow', 'funded', 'client_review_pending'].includes(selectedEscrow.status) && (
                      <button
                        onClick={() => setActiveAction('submit')}
                        className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-all flex items-center gap-1.5"
                      >
                        <Upload size={14} /> Submit Deliverables
                      </button>
                    )}

                    {user?.role === 'freelancer' && ['held_in_escrow', 'work_submitted', 'client_review_pending'].includes(selectedEscrow.status) && (
                      <button
                        onClick={() => setActiveAction('dispute')}
                        className="px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 text-xs font-semibold hover:bg-yellow-500/20 transition-all flex items-center gap-1.5"
                      >
                        <AlertCircle size={14} /> Raise Dispute
                      </button>
                    )}

                    {/* CLIENT BUTTONS */}
                    {user?.role === 'client' && selectedEscrow.status === 'work_submitted' && (
                      <>
                        <button
                          onClick={() => handleRelease(selectedEscrow._id)}
                          className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} /> Approve & Release
                        </button>
                        <button
                          onClick={() => setActiveAction('revision')}
                          className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare size={14} /> Request Revision
                        </button>
                      </>
                    )}

                    {user?.role === 'client' && ['held_in_escrow', 'client_review_pending'].includes(selectedEscrow.status) && (
                      <>
                        <button
                          onClick={() => handleRelease(selectedEscrow._id)}
                          className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-all text-glow"
                        >
                          Release Payment
                        </button>
                        <button
                          onClick={() => handleRefund(selectedEscrow._id)}
                          className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all"
                        >
                          Refund Escrow
                        </button>
                      </>
                    )}

                    {user?.role === 'client' && ['held_in_escrow', 'work_submitted', 'client_review_pending'].includes(selectedEscrow.status) && (
                      <button
                        onClick={() => setActiveAction('dispute')}
                        className="px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 text-xs font-semibold hover:bg-yellow-500/20 transition-all"
                      >
                        Raise Dispute
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Earnings Trend Chart (Using responsive SVG curves) */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-color)]">Wallet Cash Flow Velocity</h3>
                <p className="text-xs text-[var(--text-color)]/50">Simulated monthly wallet activities volume</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-0.5"><ArrowUpRight size={14} /> +12.4%</span>
              </div>
            </div>

            {/* SVG line graph */}
            <div className="w-full h-44 mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#25a36b" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#25a36b" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(150,150,150,0.08)" strokeWidth="1" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="rgba(150,150,150,0.08)" strokeWidth="1" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="rgba(150,150,150,0.08)" strokeWidth="1" />
                
                {/* Curve path */}
                <path
                  d="M 0 130 C 50 120, 100 80, 150 90 C 200 100, 250 50, 300 45 C 350 40, 400 10, 500 20 L 500 150 L 0 150 Z"
                  fill="url(#chartGrad)"
                />
                
                <path
                  d="M 0 130 C 50 120, 100 80, 150 90 C 200 100, 250 50, 300 45 C 350 40, 400 10, 500 20"
                  fill="none"
                  stroke="#25a36b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Dynamic dots */}
                <circle cx="150" cy="90" r="5" fill="#25a36b" stroke="var(--bg-color)" strokeWidth="2" />
                <circle cx="300" cy="45" r="5" fill="#25a36b" stroke="var(--bg-color)" strokeWidth="2" />
                <circle cx="500" cy="20" r="5" fill="#25a36b" stroke="var(--bg-color)" strokeWidth="2" />
              </svg>
            </div>
            
            <div className="flex justify-between text-[9px] font-semibold text-[var(--text-color)]/40 mt-3.5 uppercase tracking-wider px-2">
              <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>

        {/* Transaction activity ledger list */}
        <div className="glass-card overflow-hidden h-fit">
          <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text-color)]">Transaction Activity</h3>
            <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2 py-0.5 rounded-full">
              CF Gateway Sandbox
            </span>
          </div>

          {txLoading ? (
            <div className="p-5 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : transactions.length > 0 ? (
            <div className="divide-y divide-[var(--border-color)]">
              {transactions.map((tx) => {
                const isEarning = user?.role === 'freelancer';
                return (
                  <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-brand-500/2 transition-colors gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isEarning ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {isEarning ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--text-color)] truncate">
                          {tx.escrow?.job?.title || 'Milestone Paid'}
                        </p>
                        <p className="text-[10px] text-[var(--text-color)]/40 mt-0.5 font-mono truncate">{tx.transactionId}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <div>
                        <p className="font-bold text-xs text-[var(--text-color)]">${tx.amount.toFixed(2)}</p>
                        <p className="text-[9px] text-[var(--text-color)]/40 mt-0.5 capitalize">{tx.paymentMethod}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadReceipt(tx)}
                        className="p-1.5 rounded-lg bg-brand-500/5 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 border border-brand-500/10 transition-colors"
                        title="Download Invoice receipt"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={FileText}
                title="No activities recorded"
                description="Payments activity ledgers appear here post gateway capture."
              />
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
