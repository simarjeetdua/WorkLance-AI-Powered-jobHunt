import { motion } from 'framer-motion'
import { timeAgo } from '../../utils/helpers'
import { Avatar, StarRating } from '../ui/index'

export default function ReviewCard({ review, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card p-5"
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={review.reviewer?.name || review.reviewer?.username || 'User'} src={review.reviewer?.avatar} size="sm" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-white text-sm">{review.reviewer?.name || review.reviewer?.username || 'User'}</p>
            <span className="text-xs text-white/30">{timeAgo(review.createdAt)}</span>
          </div>
          <StarRating value={review.rating} size={14} />
        </div>
      </div>
      <p className="text-sm text-white/50 leading-relaxed">{review.comment}</p>
    </motion.div>
  )
}
