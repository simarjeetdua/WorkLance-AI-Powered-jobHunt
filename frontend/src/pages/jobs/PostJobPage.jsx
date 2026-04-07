import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { jobsAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout'
import { PageHeader } from '../../components/ui/index'
import { Plus, X, DollarSign, Briefcase, MapPin, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const COMMON_SKILLS = ['React', 'Node.js', 'Python', 'Vue.js', 'MongoDB', 'PostgreSQL', 'Flutter', 'UI/UX Design', 'WordPress', 'PHP', 'GraphQL', 'DevOps', 'AWS', 'Figma', 'TypeScript']
const EXPERIENCE_LEVELS = ['Entry Level', 'Intermediate', 'Expert', 'Any Level']
const JOB_TYPES = ['Remote', 'On-site', 'Hybrid']

export default function PostJobPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', budget: '',
    skills: [], location: '', experience: 'Any Level', type: 'Remote', duration: ''
  })
  const [errors, setErrors] = useState({})

  const addSkill = (skill) => {
    const trimmed = skill.trim()
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm({ ...form, skills: [...form.skills, trimmed] })
    }
    setSkillInput('')
  }

  const removeSkill = (skill) => setForm({ ...form, skills: form.skills.filter(s => s !== skill) })

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Job title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.budget || form.budget <= 0) e.budget = 'Valid budget is required'
    if (form.skills.length === 0) e.skills = 'Add at least one skill'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await jobsAPI.create(form)
      toast.success('🎉 Job posted successfully!')
      navigate('/dashboard/my-jobs')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  const inputField = (key, label, type = 'text', placeholder = '', icon) => (
    <div>
      <label className="label">{label}</label>
      <div className={icon ? 'relative' : ''}>
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          className={`input-field ${icon ? 'pl-11' : ''} ${errors[key] ? 'border-red-500/50' : ''}`}
        />
      </div>
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Post a New Job" subtitle="Fill in the details to attract the best freelancers" />

      <div className="max-w-3xl">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic info */}
          <div className="glass-card p-7 space-y-5">
            <h2 className="font-display font-bold text-white text-lg">Job Details</h2>
            {inputField('title', 'Job Title *', 'text', 'e.g. Senior React Developer needed', <Briefcase size={16} />)}

            <div>
              <label className="label">Description *</label>
              <textarea
                rows={6}
                placeholder="Describe the project, what needs to be done, and what you're looking for in a freelancer..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className={`input-field resize-none ${errors.description ? 'border-red-500/50' : ''}`}
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="label">Requirements (optional)</label>
              <textarea
                rows={3}
                placeholder="List specific requirements, qualifications, or deliverables..."
                value={form.requirements}
                onChange={e => setForm({ ...form, requirements: e.target.value })}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Budget & details */}
          <div className="glass-card p-7 space-y-5">
            <h2 className="font-display font-bold text-white text-lg">Budget & Requirements</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {inputField('budget', 'Budget (USD) *', 'number', '500', <DollarSign size={16} />)}
              {inputField('duration', 'Duration', 'text', 'e.g. 2 weeks, 1 month', <Clock size={16} />)}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Experience Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPERIENCE_LEVELS.map(level => (
                    <button key={level} type="button"
                      onClick={() => setForm({ ...form, experience: level })}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all text-center ${
                        form.experience === level
                          ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                          : 'bg-white/3 border-white/10 text-white/50 hover:border-white/20'
                      }`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Job Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {JOB_TYPES.map(type => (
                    <button key={type} type="button"
                      onClick={() => setForm({ ...form, type })}
                      className={`py-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                        form.type === type
                          ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                          : 'bg-white/3 border-white/10 text-white/50 hover:border-white/20'
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {inputField('location', 'Location (optional)', 'text', 'e.g. New York, Remote', <MapPin size={16} />)}
          </div>

          {/* Skills */}
          <div className="glass-card p-7">
            <h2 className="font-display font-bold text-white text-lg mb-5">Required Skills</h2>

            {/* Selected skills */}
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {form.skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/30 text-sm font-medium">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors ml-0.5">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add skill input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a skill..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
                className="input-field flex-1"
              />
              <button type="button" onClick={() => addSkill(skillInput)} className="btn-secondary px-4 flex items-center gap-1.5">
                <Plus size={16} /> Add
              </button>
            </div>

            {/* Suggested skills */}
            <div>
              <p className="text-xs text-white/30 mb-2">Popular skills:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.filter(s => !form.skills.includes(s)).map(skill => (
                  <button key={skill} type="button" onClick={() => addSkill(skill)}
                    className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/3 text-white/50 hover:border-brand-500/40 hover:text-brand-400 hover:bg-brand-500/10 transition-all">
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
            {errors.skills && <p className="text-red-400 text-xs mt-2">{errors.skills}</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center gap-2 flex-1 justify-center"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : <><Briefcase size={17} /> Post Job</>}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  )
}
