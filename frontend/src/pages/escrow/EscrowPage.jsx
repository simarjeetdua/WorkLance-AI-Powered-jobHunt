import { motion } from 'framer-motion'
import { useAsync, useMutation } from '../../hooks/useAsync'
import { escrowAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { PageHeader, EmptyState, Skeleton } from '../../components/ui/index'
import { formatCurrency, timeAgo, getStatusColor } from '../../utils/helpers'
import { DollarSign, CheckCircle, RotateCcw, Shield, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EscrowPage() {
  const { user } = useAuth()
  const { data: escrows, loading, refetch } = useAsync(() => escrowAPI.mine())
  const { mutate: release } = useMutation((id) => escrowAPI.release(id))
  const { mutate: refund } = useMutation((id) => escrowAPI.refund(id))

  const handleRelease = async (id) => {
    if (!confirm('Release funds to the freelancer?')) return
    await release(id, { successMsg: '✅ Funds released!', onSuccess: refetch })
  }

  const handleRefund = async (id) => {
    if (!confirm('Refund funds to yourself?')) return
    await refund(id, { successMsg: '↩️ Funds refunded!', onSuccess: refetch })
  }

  const total = escrows?.reduce((s, e) => s + (e.amount || 0), 0) || 0
  const held = escrows?.filter(e => e.status === 'held').reduce((s, e) => s + (e.amount || 0), 0) || 0

  return (
    <DashboardLayout>
      <PageHeader title="Escrow & Payments" subtitle="Track and manage your payment transactions" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Transacted', value: formatCurrency(total), icon: DollarSign, color: 'text-brand-400 bg-brand-500/10' },
          { label: 'Funds in Escrow', value: formatCurrency(held), icon: Lock, color: 'text-yellow-400 bg-yellow-500/10' },
          { label: 'Transactions', value: escrows?.length || 0, icon: Shield, color: 'text-blue-400 bg-blue-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-display font-bold text-white">{value}</p>
            <p className="text-sm text-white/40 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Transactions */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-display font-bold text-white">Transactions</h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : escrows?.length > 0 ? (
          <div className="divide-y divide-white/5">
            {escrows.map((escrow, i) => (
              <motion.div
                key={escrow._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-5 flex items-center justify-between gap-4 hover:bg-white/2 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    escrow.status === 'released' ? 'bg-brand-500/10 text-brand-400' :
                    escrow.status === 'refunded' ? 'bg-orange-500/10 text-orange-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {escrow.status === 'released' ? <CheckCircle size={18} /> :
                     escrow.status === 'refunded' ? <RotateCcw size={18} /> :
                     <Lock size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">
                      {escrow.job?.title || 'Project Payment'}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">{timeAgo(escrow.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-display font-bold text-white">{formatCurrency(escrow.amount)}</p>
                    <span className={`badge border text-xs ${getStatusColor(escrow.status)}`}>{escrow.status}</span>
                  </div>

                  {escrow.status === 'held' && user?.role === 'client' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleRelease(escrow._id)}
                        className="px-3 py-1.5 rounded-lg bg-brand-500/15 text-brand-400 border border-brand-500/30 text-xs font-semibold hover:bg-brand-500/25 transition-all">
                        Release
                      </button>
                      <button onClick={() => handleRefund(escrow._id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all">
                        Refund
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={DollarSign}
            title="No transactions yet"
            description="Escrow transactions will appear here when you start working on projects."
          />
        )}
      </div>
    </DashboardLayout>
  )
}
