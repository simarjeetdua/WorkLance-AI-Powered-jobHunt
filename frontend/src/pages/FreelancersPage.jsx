import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { profileAPI, applicationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PublicLayout from '../layouts/PublicLayout'
import { PageHeader, Skeleton, EmptyState, Modal } from '../components/ui/index'
import FreelancerCard from '../components/shared/FreelancerCard'
import FreelancerFilters from '../components/shared/FreelancerFilters'
import { Search, SlidersHorizontal, Users, X, Send, DollarSign, Calendar, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FreelancersPage() {
  const { user } = useAuth()
  
  // Filters & State
  const [filters, setFilters] = useState({
    search: '',
    skills: '',
    minRate: '',
    maxRate: '',
    experienceLevel: 'all',
    sortBy: 'newest',
    page: 1,
    limit: 8
  })

  const [searchInput, setSearchInput] = useState('')
  const [freelancers, setFreelancers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalCount: 0
  })

  // Collapsible filters for mobile
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Hire Modal State
  const [hireModalOpen, setHireModalOpen] = useState(false)
  const [selectedFreelancer, setSelectedFreelancer] = useState(null)
  const [proposalForm, setProposalForm] = useState({
    projectTitle: '',
    description: '',
    bidAmount: '',
    email: user?.email || ''
  })
  const [sendingProposal, setSendingProposal] = useState(false)

  const fetchFreelancers = async () => {
    setLoading(true)
    try {
      const res = await profileAPI.getAllFreelancers(filters)
      if (res.success) {
        setFreelancers(res.freelancers || [])
        setPagination({
          totalPages: res.totalPages || 1,
          currentPage: res.currentPage || 1,
          totalCount: res.totalCount || 0
        })
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load freelancers')
    } finally {
      setLoading(false)
    }
  }

  // Fetch when filters update (except search input, which requires submit or trigger)
  useEffect(() => {
    fetchFreelancers()
  }, [filters.skills, filters.minRate, filters.maxRate, filters.experienceLevel, filters.sortBy, filters.page])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Extract potential skills vs name search if needed, or search name directly
    // Let's check if the search starts with "skills:"
    let skillsQuery = ''
    let searchQuery = searchInput

    if (searchInput.toLowerCase().startsWith('skills:')) {
      skillsQuery = searchInput.slice(7).trim()
      searchQuery = ''
    }

    setFilters(prev => ({
      ...prev,
      search: searchQuery,
      skills: skillsQuery,
      page: 1
    }))
    // Trigger manual fetch if query didn't trigger hook
    if (filters.search === searchQuery && filters.skills === skillsQuery && filters.page === 1) {
      fetchFreelancers()
    }
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setFilters({
      search: '',
      skills: '',
      minRate: '',
      maxRate: '',
      experienceLevel: 'all',
      sortBy: 'newest',
      page: 1,
      limit: 8
    })
  }

  const handleHireClick = (freelancer) => {
    if (!user) {
      toast.error('Please log in to hire a freelancer')
      return
    }
    if (user.role !== 'client') {
      toast.error('Only clients can hire freelancers')
      return
    }
    setSelectedFreelancer(freelancer)
    setHireModalOpen(true)
  }

  const handleSendProposal = async (e) => {
    e.preventDefault()
    if (!proposalForm.projectTitle.trim() || !proposalForm.description.trim() || !proposalForm.bidAmount) {
      return toast.error('Please fill in all required fields')
    }

    setSendingProposal(true)
    try {
      const res = await applicationsAPI.hirePropose({
        freelancerId: selectedFreelancer.user._id,
        projectTitle: proposalForm.projectTitle,
        description: proposalForm.description,
        bidAmount: Number(proposalForm.bidAmount)
      })
      if (res.success) {
        toast.success(`Proposal sent successfully to ${selectedFreelancer?.user?.name || selectedFreelancer?.user?.username}! 🚀`)
        setHireModalOpen(false)
        setProposalForm({ projectTitle: '', description: '', bidAmount: '', email: user?.email || '' })
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send proposal')
    } finally {
      setSendingProposal(false)
    }
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Marketplace Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
            Find the Best <span className="gradient-text">Freelance Talent</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Access world-class freelancers and hire the perfect developer for your projects.
          </p>

          {/* Upwork-style Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2 w-full glass p-1.5 rounded-2xl border border-white/10 shadow-lg">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search by name, or type 'skills: React, Node'..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-white text-sm pl-12 pr-4 py-2 focus:ring-0 focus:outline-none"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-2.5 text-xs font-semibold rounded-xl">
              Search
            </button>
          </form>
        </div>

        {/* Mobile Filters Trigger */}
        <div className="flex lg:hidden justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Users size={14} /> {pagination.totalCount} freelancers found
          </div>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
          >
            <SlidersHorizontal size={14} /> Filter & Sort
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 items-start">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <FreelancerFilters
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
            />
          </div>

          {/* Main Grid Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Desktop Info Bar */}
            <div className="hidden lg:flex justify-between items-center text-sm text-white/40 pb-2 border-b border-white/5">
              <span>Showing {freelancers.length} of {pagination.totalCount} freelancers</span>
              <span>Sorted by <span className="text-white font-medium capitalize">{filters.sortBy.replace('_', ' ')}</span></span>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="glass-card p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 flex-1 rounded-lg" />
                      <Skeleton className="h-8 flex-1 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : freelancers.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  {freelancers.map((freelancer, i) => (
                    <FreelancerCard
                      key={freelancer._id}
                      freelancer={freelancer}
                      index={i}
                      onHireClick={handleHireClick}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-6">
                    <button
                      disabled={filters.page === 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      className="px-3 py-2 text-xs font-semibold rounded-lg glass border border-white/10 text-white/50 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/20 transition-all"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFilters(prev => ({ ...prev, page: idx + 1 }))}
                        className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                          filters.page === idx + 1
                            ? 'bg-brand-500 border-brand-500 text-white'
                            : 'glass border-white/10 text-white/50 hover:border-white/20'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      disabled={filters.page === pagination.totalPages}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      className="px-3 py-2 text-xs font-semibold rounded-lg glass border border-white/10 text-white/50 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/20 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Users}
                title="No freelancers found"
                description="Try broadening your search term or adjusting filters."
                action={
                  <button onClick={handleResetFilters} className="btn-primary text-sm px-5 py-2">
                    Reset Filters
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-surface-dark/95 border-l border-white/10 p-6 shadow-2xl h-full overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-white font-display">Filters & Sorting</span>
                <button onClick={() => setShowMobileFilters(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <FreelancerFilters
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hire/Proposal Modal */}
      <AnimatePresence>
        {hireModalOpen && selectedFreelancer && (
          <Modal open={hireModalOpen} onClose={() => setHireModalOpen(false)} title={`Hire ${selectedFreelancer?.user?.name || selectedFreelancer?.user?.username}`}>
            <form onSubmit={handleSendProposal} className="space-y-4">
              <div>
                <label className="label">Project Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Redesign Landing Page"
                  value={proposalForm.projectTitle}
                  onChange={e => setProposalForm({ ...proposalForm, projectTitle: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Project Description & Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your project, technologies, timelines, and deliverables..."
                  value={proposalForm.description}
                  onChange={e => setProposalForm({ ...proposalForm, description: e.target.value })}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center gap-1">
                    <DollarSign size={13} className="text-brand-400" /> Proposed Budget *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="500"
                    value={proposalForm.bidAmount}
                    onChange={e => setProposalForm({ ...proposalForm, bidAmount: e.target.value })}
                    className="input-field"
                    min={1}
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1">
                    <Mail size={13} className="text-brand-400" /> Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={proposalForm.email}
                    onChange={e => setProposalForm({ ...proposalForm, email: e.target.value })}
                    className="input-field text-white/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setHireModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingProposal}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {sendingProposal ? 'Sending...' : <><Send size={14} /> Send Proposal</>}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </PublicLayout>
  )
}
