import { Star, DollarSign, Award, SlidersHorizontal, RefreshCw } from 'lucide-react'

export default function FreelancerFilters({ filters, setFilters, onReset }) {
  const handleRateChange = (key, val) => {
    setFilters(prev => ({
      ...prev,
      [key]: val ? Number(val) : ''
    }))
  }

  const handleExperienceChange = (level) => {
    setFilters(prev => ({
      ...prev,
      experienceLevel: level
    }))
  }

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }))
  }

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <span className="font-semibold text-white flex items-center gap-2 text-sm uppercase tracking-wider font-display">
          <SlidersHorizontal size={16} className="text-brand-400" /> Filters
        </span>
        <button
          onClick={onReset}
          className="text-xs text-white/40 hover:text-brand-400 transition-colors flex items-center gap-1.5 font-medium"
        >
          <RefreshCw size={11} /> Reset
        </button>
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Sort Results</label>
        <div className="flex flex-col gap-1.5">
          {[
            { id: 'newest', label: 'Recently Active' },
            { id: 'highest_rated', label: 'Top Rated' },
            { id: 'lowest_rate', label: 'Lowest Price' },
            { id: 'highest_rate', label: 'Highest Price' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => handleSortChange(opt.id)}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                filters.sortBy === opt.id
                  ? 'bg-brand-500/15 border-brand-500/35 text-brand-400'
                  : 'bg-white/3 border-white/5 text-white/50 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1">
          <DollarSign size={13} className="text-brand-400" /> Hourly Rate ($)
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Min"
              value={filters.minRate}
              onChange={e => handleRateChange('minRate', e.target.value)}
              className="input-field py-2 px-3 text-xs w-full text-center"
              min={0}
            />
          </div>
          <span className="text-white/20 text-xs">—</span>
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Max"
              value={filters.maxRate}
              onChange={e => handleRateChange('maxRate', e.target.value)}
              className="input-field py-2 px-3 text-xs w-full text-center"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1">
          <Award size={13} className="text-brand-400" /> Experience Level
        </label>
        <div className="flex flex-col gap-1.5">
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'beginner', label: 'Beginner' },
            { id: 'intermediate', label: 'Intermediate' },
            { id: 'advanced', label: 'Advanced' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => handleExperienceChange(opt.id)}
              className={`w-full text-left px-3 py-2.5 text-xs font-medium rounded-lg border transition-all flex items-center justify-between ${
                filters.experienceLevel === opt.id
                  ? 'bg-brand-500/15 border-brand-500/35 text-brand-400'
                  : 'bg-white/3 border-white/5 text-white/50 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <span>{opt.label}</span>
              {filters.experienceLevel === opt.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Skills filter info banner */}
      <div className="p-4 rounded-xl bg-white/3 border border-white/5">
        <p className="text-[10px] text-white/40 leading-relaxed">
          Use the search bar at the top to filter by developer name or specific technical skills (e.g. React, Node).
        </p>
      </div>
    </div>
  )
}
