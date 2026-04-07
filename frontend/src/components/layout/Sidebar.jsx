import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'
import {
  LayoutDashboard, Briefcase, FileText, User, DollarSign, Star,
  Sparkles, Users, BarChart2, Plus, ChevronLeft, ChevronRight, Zap, Settings, LogOut
} from 'lucide-react'

const freelancerLinks = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Sparkles, label: 'AI Recommendations', href: '/dashboard/recommendations' },
  { icon: Briefcase, label: 'Browse Jobs', href: '/jobs' },
  { icon: FileText, label: 'My Applications', href: '/dashboard/applications' },
  { icon: DollarSign, label: 'Escrow', href: '/dashboard/escrow' },
  { icon: Star, label: 'Reviews', href: '/dashboard/reviews' },
  { icon: User, label: 'Profile', href: '/profile/me' },
]

const clientLinks = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Plus, label: 'Post a Job', href: '/dashboard/post-job' },
  { icon: Briefcase, label: 'My Jobs', href: '/dashboard/my-jobs' },
  { icon: FileText, label: 'Applications', href: '/dashboard/applications' },
  { icon: DollarSign, label: 'Escrow', href: '/dashboard/escrow' },
  { icon: Star, label: 'Reviews', href: '/dashboard/reviews' },
  { icon: User, label: 'Profile', href: '/profile/me' },
]

const adminLinks = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Users, label: 'Users', href: '/dashboard/users' },
  { icon: Briefcase, label: 'Jobs', href: '/dashboard/admin-jobs' },
  { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'client' ? clientLinks :
    freelancerLinks

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-16 bottom-0 z-40 flex flex-col bg-surface-card border-r border-surface-border overflow-hidden"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full bg-surface-card border border-surface-border flex items-center justify-center text-white/40 hover:text-white hover:border-brand-500/40 transition-all"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* User mini-profile */}
      <div className={`p-4 border-b border-surface-border ${collapsed ? 'items-center' : ''} flex gap-3`}>
        <div className="w-9 h-9 min-w-[36px] rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(37,163,107,0.3)]">
          {getInitials(user?.name)}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden min-w-0"
            >
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/40 capitalize">{user?.role}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
        {links.map(({ icon: Icon, label, href }) => {
          const active = location.pathname === href
          return (
            <Link
              key={href}
              to={href}
              className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className={active ? 'text-brand-400' : ''} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden text-sm"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-400"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-surface-border space-y-1">
        <Link to="/settings" className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''}`}>
          <Settings size={18} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button onClick={logout} className={`sidebar-link w-full text-red-400 hover:bg-red-500/5 hover:text-red-300 ${collapsed ? 'justify-center px-0' : ''}`}>
          <LogOut size={18} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Branding */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-4 pb-4 flex items-center gap-1.5"
          >
            <Zap size={12} className="text-brand-500" />
            <span className="text-xs font-display font-bold text-brand-500">WorkLance</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
