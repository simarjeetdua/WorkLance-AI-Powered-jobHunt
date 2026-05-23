import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAsync, useMutation } from '../../hooks/useAsync'
import { applicationsAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout'
import { PageHeader, EmptyState, CardSkeleton } from '../../components/ui/index'
import ApplicationCard from '../../components/shared/ApplicationCard'
import { FileText, Briefcase, Filter, ArrowUpDown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth()
  const isClient = user?.role === 'client'

  // Page States
  const [activeTab, setActiveTab] = useState('all') // all, pending, shortlisted, interview, hired, rejected
  const [sortBy, setSortBy] = useState('newest') // newest, bid_high, bid_low

  // Fetch applications
  const { data, loading, refetch } = useAsync(
    () => isClient ? applicationsAPI.getClientApps() : applicationsAPI.mine(),
    { enabled: !!user }
  )

  const applications = Array.isArray(data) ? data : []

  // Status updates
  const { mutate: updateStatus } = useMutation(
    ({ id, status }) => applicationsAPI.update(id, { status })
  )

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatus(
        { id, status },
        {
          successMsg: `Application ${status}!`,
          onSuccess: refetch,
        }
      )
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  // Filter logic
  const filteredApps = applications.filter((app) => {
    const status = app.status
    if (activeTab === 'pending') return status === 'pending' || status === 'applied' || status === 'viewed'
    if (activeTab === 'shortlisted') return status === 'shortlisted'
    if (activeTab === 'interview') return status === 'interview'
    if (activeTab === 'hired') return status === 'hired' || status === 'accepted'
    if (activeTab === 'rejected') return status === 'rejected'
    return true // 'all'
  })

  // Sort logic
  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    }
    if (sortBy === 'bid_high') {
      return (b.bidAmount || 0) - (a.bidAmount || 0)
    }
    if (sortBy === 'bid_low') {
      return (a.bidAmount || 0) - (b.bidAmount || 0)
    }
    return 0
  })

  // Tab counts helper
  const getCount = (tab) => {
    return applications.filter((app) => {
      const status = app.status
      if (tab === 'pending') return status === 'pending' || status === 'applied' || status === 'viewed'
      if (tab === 'shortlisted') return status === 'shortlisted'
      if (tab === 'interview') return status === 'interview'
      if (tab === 'hired') return status === 'hired' || status === 'accepted'
      if (tab === 'rejected') return status === 'rejected'
      return true
    }).length
  }

  if (authLoading) {
    return <div className="text-white p-6">Loading Auth Credentials...</div>
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={isClient ? 'Manage Job Applicants' : 'Application Status Panel'}
        subtitle={`Track submissions for your project contracts (${applications.length} total)`}
      />

      {/* 🛠️ Dashboard Controls Panel */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6 mb-6">
        
        {/* Tab Filters */}
        <div className="flex overflow-x-auto gap-1 p-1 bg-white/5 border border-[var(--border-color)] rounded-xl scrollbar-none no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'interview', label: 'Interviews' },
            { id: 'hired', label: 'Hired' },
            { id: 'rejected', label: 'Archived' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-[var(--text-color)]/60 hover:text-[var(--text-color)]'
              }`}
            >
              {tab.label} <span className="opacity-50 text-[10px] ml-1">({getCount(tab.id)})</span>
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ArrowUpDown size={14} className="text-[var(--text-color)]/50" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[var(--card-bg-start)] border border-[var(--border-color)] text-[var(--text-color)] focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="newest">Sort by Newest</option>
            <option value="bid_high">Sort: Bid (Highest)</option>
            <option value="bid_low">Sort: Bid (Lowest)</option>
          </select>
        </div>

      </div>

      {/* 📦 Applications Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : sortedApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedApps.map((app) => (
            <ApplicationCard
              key={app._id}
              application={app}
              isClient={isClient}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={isClient ? 'No applicants found' : 'No applications found'}
          description={
            isClient
              ? 'No applications match your active filter settings.'
              : 'Apply to contract jobs on the marketplace.'
          }
          action={
            isClient ? (
              <Link to="/dashboard/post-job" className="btn-primary text-xs py-2 px-4 shadow-sm">
                Post another Job
              </Link>
            ) : (
              <Link to="/jobs" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm">
                <Briefcase size={12} /> Browse Job Openings
              </Link>
            )
          }
        />
      )}
    </DashboardLayout>
  )
}