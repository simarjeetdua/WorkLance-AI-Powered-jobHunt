import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Star, DollarSign, Briefcase, ChevronRight, MessageSquare } from 'lucide-react'
import { Avatar } from '../ui/index'
import { getSkillColor } from '../../utils/helpers'

export default function FreelancerCard({ freelancer, index = 0, onHireClick }) {
  const {
    user,
    tagline,
    bio,
    skills = [],
    hourlyRate = 0,
    location = '',
    avgRating = 0,
    reviewsCount = 0,
    completedJobs = 0,
  } = freelancer

  const name = user?.name || user?.username || 'Freelancer'
  const isOnline = user?.isActive || false

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="glass-card-hover p-6 group relative overflow-hidden flex flex-col justify-between"
    >
      {/* Glow hover effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(37,163,107,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative">
        {/* Top Header Section */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar name={name} src={user?.avatar} size="lg" isOnline={isOnline} />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-white text-base leading-snug truncate font-display">
                {name}
              </h3>
            </div>
            
            {tagline && (
              <p className="text-sm text-brand-400 font-medium truncate mt-0.5">{tagline}</p>
            )}
            
            <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40">
              <MapPin size={12} className="text-white/30" />
              <span>{location || 'Remote'}</span>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-white/3 border border-white/5 mb-4 text-center">
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Hourly Rate</p>
            <p className="text-sm font-bold text-white mt-1 flex items-center justify-center gap-0.5">
              <DollarSign size={13} className="text-brand-500" />
              {hourlyRate}/hr
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Rating</p>
            <p className="text-sm font-bold text-white mt-1 flex items-center justify-center gap-1">
              <Star size={13} className="text-yellow-400 fill-yellow-400" />
              {avgRating > 0 ? avgRating : '—'} 
              <span className="text-[10px] font-normal text-white/40">({reviewsCount})</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Jobs Done</p>
            <p className="text-sm font-bold text-white mt-1 flex items-center justify-center gap-1">
              <Briefcase size={12} className="text-cyan-400" />
              {completedJobs}
            </p>
          </div>
        </div>

        {/* Bio Preview */}
        {bio && (
          <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">
            {bio}
          </p>
        )}

        {/* Skills list */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {skills.slice(0, 4).map((skill, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSkillColor(i)}`}>
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-white/30 border border-white/10">
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-white/5 relative z-10 mt-auto">
        <Link
          to={`/profile/${user?._id}`}
          className="btn-secondary flex-1 text-xs py-2 px-3 flex items-center justify-center gap-1.5"
        >
          View Profile <ChevronRight size={13} />
        </Link>
        <button
          onClick={() => onHireClick?.(freelancer)}
          className="btn-primary flex-1 text-xs py-2 px-3 flex items-center justify-center gap-1.5"
        >
          <MessageSquare size={13} /> Hire Me
        </button>
      </div>
    </motion.div>
  )
}
