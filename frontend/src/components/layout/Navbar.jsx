import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Avatar } from '../ui/index'
import {
  Sun, Moon, Menu, X, Zap, Bell, ChevronDown, LogOut, User,
  LayoutDashboard, CreditCard, Lock, FileText, Info, Check, Trash2
} from 'lucide-react'
import { notificationsAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifTab, setNotifTab] = useState('all')
  const [notifications, setNotifications] = useState([])

  const notifRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setNotifOpen(false)
    setDropdownOpen(false)
  }, [location])

  // Handle outside clicks to close notifications and user dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.mine()
      if (res?.success) {
        setNotifications(res.notifications)
      }
    } catch (err) {
      console.error('❌ Error fetching notifications:', err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
      // Poll notifications every 20 seconds
      const timer = setInterval(fetchNotifications, 20000)
      return () => clearInterval(timer)
    }
  }, [user])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationsAPI.markAllRead()
      if (res?.success) {
        setNotifications(prev => prev.map((n) => ({ ...n, isRead: true })))
        toast.success('All notifications marked as read')
      }
    } catch (err) {
      toast.error('Failed to mark notifications read')
    }
  }

  const handleMarkRead = async (id, link) => {
    try {
      await notificationsAPI.markRead(id)
      setNotifications(prev => prev.map((n) => n._id === id ? { ...n, isRead: true } : n))
      if (link) navigate(link)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteNotif = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationsAPI.delete(id)
      setNotifications(prev => prev.filter((n) => n._id !== id))
      toast.success('Notification cleared')
    } catch (err) {
      toast.error('Failed to delete notification')
    }
  }

  // Filter notifications by active tab
  const filteredNotifications = notifications.filter((n) => {
    if (notifTab === 'payments') return n.type === 'payment' || n.type === 'escrow'
    if (notifTab === 'applications') return n.type === 'application'
    return true // 'all'
  })

  const navLinks = [
    { label: 'Find Jobs', href: '/jobs' },
    { label: 'Freelancers', href: '/freelancers' },
    { label: 'How it Works', href: '/#how-it-works' },
  ]

  const isActive = (href) => location.pathname === href

  // Helper to choose notification icon
  const getNotifIcon = (type) => {
    switch (type) {
      case 'payment': return <CreditCard size={15} className="text-emerald-500" />
      case 'escrow': return <Lock size={15} className="text-yellow-500" />
      case 'application': return <FileText size={15} className="text-blue-500" />
      default: return <Info size={15} className="text-cyan-500" />
    }
  }

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border-color)] shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(37,163,107,0.4)] group-hover:shadow-[0_0_25px_rgba(37,163,107,0.6)] transition-all duration-300">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-[var(--text-color)]">
              Work<span className="gradient-text">Lance</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`nav-link px-4 py-2 rounded-lg text-sm ${
                  isActive(link.href) ? 'text-brand-600 dark:text-brand-400 font-semibold' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            
            {/* 🌗 Animated Toggle Switch */}
            <button
              onClick={toggle}
              aria-label="Toggle Theme"
              className="relative w-12 h-6 rounded-full bg-slate-300 dark:bg-slate-800 p-0.5 transition-colors duration-300 flex items-center shadow-inner cursor-pointer"
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white dark:bg-brand-500 flex items-center justify-center shadow-md"
                style={{ marginLeft: dark ? 'auto' : '0px' }}
              >
                {dark ? (
                  <Moon size={11} className="text-white" />
                ) : (
                  <Sun size={11} className="text-amber-500" />
                )}
              </motion.div>
            </button>

            {user ? (
              <>
                {/* 🔔 Notifications Dropdown Container */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg text-[var(--text-color)]/60 hover:text-[var(--text-color)] hover:bg-brand-500/10 transition-all duration-200"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center min-w-[14px]">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 glass-card shadow-2xl overflow-hidden z-50 max-h-[500px] flex flex-col"
                      >
                        {/* Dropdown Header */}
                        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-brand-500/5">
                          <h3 className="font-semibold text-sm text-[var(--text-color)]">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                            >
                              <Check size={12} /> Mark all read
                            </button>
                          )}
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[var(--border-color)] px-2 bg-brand-500/2">
                          {['all', 'payments', 'applications'].map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setNotifTab(tab)}
                              className={`flex-1 py-2 text-xs font-semibold capitalize border-b-2 transition-all ${
                                notifTab === tab
                                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                  : 'border-transparent text-[var(--text-color)]/50 hover:text-[var(--text-color)]'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-80 divide-y divide-[var(--border-color)] no-scrollbar">
                          {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notif) => (
                              <div
                                key={notif._id}
                                onClick={() => handleMarkRead(notif._id, notif.link)}
                                className={`p-4 flex gap-3 text-left transition-colors cursor-pointer hover:bg-brand-500/5 ${
                                  !notif.isRead ? 'bg-brand-500/2' : ''
                                }`}
                                style={{
                                  borderLeft: notif.priority === 'high' && !notif.isRead
                                    ? '3px solid #ef4444'
                                    : '3px solid transparent'
                                }}
                              >
                                <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {getNotifIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="font-semibold text-xs text-[var(--text-color)] truncate">
                                      {notif.title}
                                    </p>
                                    <span className="text-[10px] text-[var(--text-color)]/40 flex-shrink-0">
                                      {new Date(notif.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[var(--text-color)]/70 mt-1 leading-relaxed">
                                    {notif.message}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => handleDeleteNotif(notif._id, e)}
                                  className="self-center p-1 rounded hover:bg-red-500/10 text-[var(--text-color)]/30 hover:text-red-500 transition-colors"
                                  title="Clear"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-xs text-[var(--text-color)]/40">
                              No notifications in this category.
                            </div>
                          )}
                        </div>

                        {/* View all notifications (link) */}
                        <div className="p-2 border-t border-[var(--border-color)] text-center bg-brand-500/5">
                          <span className="text-xs text-[var(--text-color)]/40 font-medium">
                            Real-time alerts active 🟢
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dashboard */}
                <Link to="/dashboard" className="hidden md:block btn-ghost text-sm">
                  Dashboard
                </Link>

                {/* Avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 border border-[var(--border-color)] hover:border-brand-500/40 transition-all duration-200"
                  >
                    <Avatar name={user.name || user.username} src={user.avatar} size="sm" />
                    <span className="hidden md:block text-sm font-medium text-[var(--text-color)]/80">
                      {(user.name || user.username)?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-[var(--text-color)]/45 transition-transform" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 glass-card shadow-2xl py-1 z-50"
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-[var(--border-color)]">
                          <p className="text-sm font-semibold text-[var(--text-color)]">{user.name || user.username}</p>
                          <p className="text-xs text-[var(--text-color)]/45 capitalize">{user.role}</p>
                        </div>
                        <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-color)]/80 hover:bg-brand-500/10 transition-all">
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                        <Link to="/profile/me" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-color)]/80 hover:bg-brand-500/10 transition-all">
                          <User size={15} /> Profile
                        </Link>
                        <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-all">
                          <LogOut size={15} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm hidden md:block">Log in</Link>
                <Link to="/register" className="btn-primary text-sm px-5 py-2.5">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-[var(--text-color)]/60 hover:text-[var(--text-color)] hover:bg-brand-500/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-color)]/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} className="px-4 py-3 text-[var(--text-color)]/70 hover:text-[var(--text-color)] rounded-xl hover:bg-brand-500/10 font-medium transition-all">
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-[var(--border-color)]">
                  <Link to="/login" className="btn-secondary flex-1 text-center text-sm">Log in</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center text-sm">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
