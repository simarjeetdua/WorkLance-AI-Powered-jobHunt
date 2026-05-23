import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Clock, DollarSign, Users, Bookmark } from 'lucide-react'
import { formatCurrency, timeAgo, truncate, getSkillColor, getStatusColor } from '../../utils/helpers'
import { Avatar, Badge } from '../ui/index'

export default function JobCard({ job, index = 0, showStatus = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="glass-card-hover p-6 group relative overflow-hidden"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(37,163,107,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar name={job.client?.name || job.client?.username || 'Client'} src={job.client?.avatar} size="sm" className="mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <Link
                to={`/jobs/${job._id}`}
                className="font-semibold text-white hover:text-brand-400 transition-colors line-clamp-1 font-display"
              >
                {job.title}
              </Link>
              <p className="text-xs text-white/40 mt-0.5">{job.client?.name || job.client?.username || 'Anonymous'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {showStatus && (
              <span className={`badge border text-xs ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            )}
            <button className="p-1.5 rounded-lg text-white/20 hover:text-brand-400 hover:bg-brand-500/10 transition-all">
              <Bookmark size={14} />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">
          {truncate(job.description, 140)}
        </p>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map((skill, i) => (
              <span key={i} className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSkillColor(i)}`}>
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/30 border border-white/10">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <DollarSign size={12} className="text-brand-500" />
              <span className="font-semibold text-white">{formatCurrency(job.budget)}</span>
            </span>
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {job.location}
              </span>
            )}
            {job.applicants !== undefined && (
              <span className="flex items-center gap-1">
                <Users size={12} /> {job.applicants} applied
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-white/30">
            <Clock size={11} /> {timeAgo(job.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
