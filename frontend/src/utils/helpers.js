export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))

export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export const truncate = (str, n = 120) =>
  str?.length > n ? str.slice(0, n) + '...' : str

export const getInitials = (name) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

export const getStatusColor = (status) => {
  const map = {
    open: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    closed: 'text-red-400 bg-red-500/10 border-red-500/20',
    pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    accepted: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
    completed: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    in_progress: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    released: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    refunded: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    held: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  }
  return map[status] || 'text-white/60 bg-white/5 border-white/10'
}

export const skillColors = [
  'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'bg-pink-500/15 text-pink-400 border-pink-500/20',
  'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'bg-brand-500/15 text-brand-400 border-brand-500/20',
  'bg-red-500/15 text-red-400 border-red-500/20',
  'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
]

export const getSkillColor = (index) => skillColors[index % skillColors.length]
