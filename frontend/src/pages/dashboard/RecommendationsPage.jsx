import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { aiAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout'
import JobCard from '../../components/shared/JobCard'
import { CardSkeleton, EmptyState, PageHeader } from '../../components/ui/index'
import { Sparkles, Zap, Brain, ArrowRight } from 'lucide-react'

export default function RecommendationsPage() {
  const { data, loading } = useAsync(() => aiAPI.recommendations())

  // ✅ SAFETY FIX (MOST IMPORTANT)
  const jobs = Array.isArray(data) ? data : []

  return (
    <DashboardLayout>
      {/* AI Header */}
      <div className="relative glass-card p-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,163,107,0.3) 0%, transparent 70%)' }}
        />
        <div className="relative flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-[0_0_25px_rgba(37,163,107,0.4)] flex-shrink-0">
            <Brain size={26} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display text-2xl font-bold text-white">
                AI Recommendations
              </h1>
              <span className="badge bg-brand-500/20 text-brand-400 border border-brand-500/30">
                <Zap size={11} /> Powered by AI
              </span>
            </div>
            <p className="text-white/50">
              Jobs curated specifically for your skills and experience. Updated daily.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <PageHeader
        title={`${jobs.length} Jobs Matched for You`}
        subtitle="Based on your profile, skills, and activity"
      />

      {/* Loading */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <CardSkeleton />
            </motion.div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        // ✅ Safe rendering
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job, i) => (
            <div key={job._id} className="relative">
              {i < 3 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-bold shadow-lg">
                    <Sparkles size={9} /> Top Match
                  </span>
                </div>
              )}
              <JobCard job={job} index={i} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Brain}
          title="Complete your profile first"
          description="Add your skills, bio, and experience to get personalized AI recommendations."
          action={
            <Link
              to="/profile/me"
              className="btn-primary text-sm flex items-center gap-2"
            >
              Complete Profile <ArrowRight size={15} />
            </Link>
          }
        />
      )}
    </DashboardLayout>
  )
}