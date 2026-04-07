import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useAsync, useMutation } from '../../hooks/useAsync'
import { profileAPI, reviewsAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout'
import PublicLayout from '../../layouts/PublicLayout'
import { Avatar, StarRating, PageHeader, Skeleton, EmptyState } from '../../components/ui/index'
import ReviewCard from '../../components/shared/ReviewCard'
import { getSkillColor } from '../../utils/helpers'
import {
  Edit3, Save, X, Plus, Star, MapPin, Globe, Github, Linkedin,
  Briefcase, Award, User
} from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = ['Overview', 'Portfolio', 'Reviews']

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: me } = useAuth()
  const isMyProfile = !userId || userId === 'me' || userId === me?._id

  const { data: profile, loading: profileLoading, refetch } = useAsync(
    () => isMyProfile ? profileAPI.getMe() : profileAPI.getById(userId),
    [userId]
  )
  const { data: reviews, loading: reviewsLoading } = useAsync(
    () => isMyProfile ? reviewsAPI.getByUser(me?._id) : reviewsAPI.getByUser(userId),
    [userId]
  )

  const { mutate: saveProfile, loading: saving } = useMutation(profileAPI.create)

  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [form, setForm] = useState({ bio: '', skills: [], location: '', website: '', github: '', linkedin: '', hourlyRate: '' })
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio || '',
        skills: profile.skills || [],
        location: profile.location || '',
        website: profile.website || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        hourlyRate: profile.hourlyRate || '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    await saveProfile(form, {
      successMsg: 'Profile updated!',
      onSuccess: () => { setEditing(false); refetch() }
    })
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) setForm({ ...form, skills: [...form.skills, s] })
    setSkillInput('')
  }

  const Layout = isMyProfile ? DashboardLayout : PublicLayout

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <Layout>
      {isMyProfile && <PageHeader title="My Profile" subtitle="Manage your public freelancer profile" />}

      {profileLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : (
        <div className="max-w-4xl space-y-6">
          {/* Header card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-7">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-5">
                <Avatar name={me?.name || 'User'} size="xl" />
                <div>
                  <h1 className="font-display text-2xl font-bold text-white">{me?.name}</h1>
                  <p className="text-brand-400 font-medium capitalize mt-0.5">{me?.role}</p>
                  {avgRating && (
                    <div className="flex items-center gap-2 mt-2">
                      <StarRating value={Math.round(avgRating)} size={16} />
                      <span className="text-sm font-semibold text-white">{avgRating}</span>
                      <span className="text-sm text-white/40">({reviews?.length} reviews)</span>
                    </div>
                  )}
                  {(form.location || profile?.location) && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-white/40">
                      <MapPin size={14} /> {form.location || profile?.location}
                    </div>
                  )}
                </div>
              </div>

              {isMyProfile && (
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <button onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-1.5 text-sm px-4 py-2">
                        <X size={15} /> Cancel
                      </button>
                      <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
                        {saving ? '...' : <><Save size={15} /> Save</>}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1.5 text-sm px-4 py-2">
                      <Edit3 size={15} /> Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Hourly rate */}
            {(profile?.hourlyRate || editing) && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                <Award size={16} className="text-brand-400" />
                {editing ? (
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">Hourly Rate: $</span>
                    <input type="number" value={form.hourlyRate}
                      onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
                      className="input-field w-24 py-1.5 text-sm" placeholder="50" />
                    <span className="text-white/40 text-sm">/hr</span>
                  </div>
                ) : (
                  <span className="text-white font-semibold">${profile.hourlyRate}/hr</span>
                )}
              </div>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 glass rounded-xl w-fit">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-white/50 hover:text-white'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'Overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* Bio */}
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2"><User size={17} /> About</h3>
                {editing ? (
                  <textarea rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell clients about yourself, your experience, and what you can offer..."
                    className="input-field resize-none" />
                ) : (
                  <p className="text-white/60 leading-relaxed">{profile?.bio || 'No bio added yet.'}</p>
                )}
              </div>

              {/* Skills */}
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2"><Briefcase size={17} /> Skills</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.skills.map((skill, i) => (
                    <span key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getSkillColor(i)}`}>
                      {skill}
                      {editing && (
                        <button onClick={() => setForm({ ...form, skills: form.skills.filter(s => s !== skill) })}
                          className="hover:text-red-400 transition-colors"><X size={11} /></button>
                      )}
                    </span>
                  ))}
                  {form.skills.length === 0 && !editing && <p className="text-white/30 text-sm">No skills added yet.</p>}
                </div>
                {editing && (
                  <div className="flex gap-2">
                    <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Add a skill..." className="input-field flex-1 text-sm py-2" />
                    <button onClick={addSkill} className="btn-secondary px-3 py-2 text-sm flex items-center gap-1"><Plus size={14} /></button>
                  </div>
                )}
              </div>

              {/* Links */}
              {(editing || profile?.website || profile?.github || profile?.linkedin) && (
                <div className="glass-card p-6">
                  <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Globe size={17} /> Links</h3>
                  {editing ? (
                    <div className="space-y-3">
                      {[
                        { key: 'website', placeholder: 'https://yourwebsite.com', label: 'Website', icon: <Globe size={15} /> },
                        { key: 'github', placeholder: 'https://github.com/username', label: 'GitHub', icon: <Github size={15} /> },
                        { key: 'linkedin', placeholder: 'https://linkedin.com/in/username', label: 'LinkedIn', icon: <Linkedin size={15} /> },
                      ].map(({ key, placeholder, label, icon }) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-white/30 w-5">{icon}</span>
                          <input type="url" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                            placeholder={placeholder} className="input-field flex-1 py-2 text-sm" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-3 flex-wrap">
                      {profile?.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-1.5 text-sm"><Globe size={14} /> Website</a>}
                      {profile?.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-1.5 text-sm"><Github size={14} /> GitHub</a>}
                      {profile?.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-1.5 text-sm"><Linkedin size={14} /> LinkedIn</a>}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'Portfolio' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center">
              <Award size={36} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Portfolio section coming soon</p>
            </motion.div>
          )}

          {activeTab === 'Reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {reviewsLoading ? (
                <Skeleton className="h-32 rounded-2xl" />
              ) : reviews?.length > 0 ? (
                reviews.map((r, i) => <ReviewCard key={r._id} review={r} index={i} />)
              ) : (
                <EmptyState icon={Star} title="No reviews yet" description="Reviews will appear here after completing projects." />
              )}
            </motion.div>
          )}
        </div>
      )}
    </Layout>
  )
}
