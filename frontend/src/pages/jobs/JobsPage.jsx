import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { jobsAPI } from '../../services/api'
import { useDebounce } from '../../hooks/useAsync'
import JobCard from '../../components/shared/JobCard'
import { CardSkeleton, EmptyState, PageHeader } from '../../components/ui/index'
import PublicLayout from '../../layouts/PublicLayout'
import { Search, SlidersHorizontal, X, Briefcase, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const SKILLS = ['React', 'Node.js', 'Python', 'UI/UX', 'WordPress', 'Flutter', 'Blockchain', 'DevOps', 'Data Science', 'GraphQL']

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'budget_high', label: 'Highest Budget' },
  { value: 'budget_low', label: 'Lowest Budget' },
]

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    keyword: '',
    skill: '',
    minBudget: '',
    maxBudget: '',
    sortBy: 'newest',
  })

  const debouncedKeyword = useDebounce(filters.keyword, 500)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = {}

      if (debouncedKeyword) params.keyword = debouncedKeyword
      if (filters.skill) params.skill = filters.skill
      if (filters.minBudget) params.minBudget = filters.minBudget
      if (filters.maxBudget) params.maxBudget = filters.maxBudget
      if (filters.sortBy) params.sortBy = filters.sortBy

      const hasSearch = Object.values(params).some(Boolean)

      // ✅ FIXED HERE
      const jobsData = hasSearch
        ? await jobsAPI.search(params)
        : await jobsAPI.getAll()

      setJobs(Array.isArray(jobsData) ? jobsData : [])

    } catch (err) {
      console.error(err)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [debouncedKeyword, filters.skill, filters.minBudget, filters.maxBudget, filters.sortBy])

  const clearFilters = () =>
    setFilters({
      keyword: '',
      skill: '',
      minBudget: '',
      maxBudget: '',
      sortBy: 'newest',
    })

  const hasActiveFilters =
    filters.skill || filters.minBudget || filters.maxBudget

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <PageHeader
          title="Find Your Next Project"
          subtitle={`${jobs.length} opportunities available`}
        />

        {/* Search + Filters */}
        <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.keyword}
              onChange={e =>
                setFilters({ ...filters, keyword: e.target.value })
              }
              className="input-field pl-11"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={e =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="input-field pr-10 text-sm"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
            </div>

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Jobs */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job, i) => (
              <JobCard key={job._id} job={job} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="Try adjusting filters"
            action={
              <button onClick={clearFilters} className="btn-secondary text-sm">
                Clear Filters
              </button>
            }
          />
        )}
      </div>
    </PublicLayout>
  )
}