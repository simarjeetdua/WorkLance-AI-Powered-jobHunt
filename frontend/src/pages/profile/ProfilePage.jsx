import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useAsync, useMutation } from '../../hooks/useAsync'
import { profileAPI, reviewsAPI, portfolioAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout'
import PublicLayout from '../../layouts/PublicLayout'
import { Avatar, StarRating, PageHeader, Skeleton, EmptyState, Modal } from '../../components/ui/index'
import ReviewCard from '../../components/shared/ReviewCard'
import { getSkillColor } from '../../utils/helpers'
import {
  Edit3, Save, X, Plus, Star, MapPin, Globe, Github, Linkedin,
  Briefcase, Award, User, Trash2, Link as LinkIcon, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = ['Overview', 'Portfolio', 'Reviews']

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: me, refetch: refetchAuth } = useAuth()
  const isMyProfile = !userId || userId === 'me' || userId === me?._id

  const { data: profile, loading: profileLoading, refetch } = useAsync(
    () => isMyProfile ? profileAPI.getMe() : profileAPI.getById(userId),
    [userId]
  )
  const { data: reviews, loading: reviewsLoading } = useAsync(
    () => isMyProfile ? reviewsAPI.getByUser(me?._id) : reviewsAPI.getByUser(userId),
    [userId]
  )
  const { data: portfolioItems, loading: portfolioLoading, refetch: refetchPortfolio } = useAsync(
    () => portfolioAPI.getByUser(isMyProfile ? me?.id || me?._id : userId),
    [userId, me]
  )

  const { mutate: saveProfile, loading: saving } = useMutation(profileAPI.create)
  const { mutate: createPortfolioItem } = useMutation(portfolioAPI.create)
  const { mutate: deletePortfolioItem } = useMutation(portfolioAPI.delete)

  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [form, setForm] = useState({
    name: '',
    avatar: '',
    tagline: '',
    bio: '',
    skills: [],
    location: '',
    website: '',
    github: '',
    linkedin: '',
    hourlyRate: ''
  })
  const [skillInput, setSkillInput] = useState('')

  // Portfolio modal states
  const [addPortfolioModal, setAddPortfolioModal] = useState(false)
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', projectLink: '', skillsUsed: '' })

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.user?.name || me?.name || me?.username || '',
        avatar: profile.user?.avatar || me?.avatar || '',
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        location: profile.location || '',
        website: profile.website || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        hourlyRate: profile.hourlyRate || '',
      })
    } else if (isMyProfile && me) {
      setForm(prev => ({
        ...prev,
        name: me.name || me.username || '',
        avatar: me.avatar || '',
      }))
    }
  }, [profile, me, isMyProfile])

  const handleSave = async () => {
    await saveProfile(form, {
      successMsg: 'Profile updated!',
      onSuccess: () => {
        setEditing(false);
        refetch();
        refetchAuth();
      }
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setForm(prev => ({ ...prev, avatar: dataUrl }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAddPortfolio = async () => {
    if (!portfolioForm.title.trim() || !portfolioForm.description.trim()) {
      return toast.error("Title and description are required");
    }

    const payload = {
      title: portfolioForm.title,
      description: portfolioForm.description,
      projectLink: portfolioForm.projectLink,
      skillsUsed: portfolioForm.skillsUsed.split(',').map(s => s.trim()).filter(Boolean)
    };

    await createPortfolioItem(payload, {
      successMsg: "Project added to portfolio!",
      onSuccess: () => {
        setAddPortfolioModal(false);
        setPortfolioForm({ title: '', description: '', projectLink: '', skillsUsed: '' });
        refetchPortfolio();
      }
    });
  };

  const handleDeletePortfolio = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await deletePortfolioItem(id, {
      successMsg: "Project removed from portfolio",
      onSuccess: () => refetchPortfolio()
    });
  };

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) setForm({ ...form, skills: [...form.skills, s] })
    setSkillInput('')
  }

  const getProfileCompletion = () => {
    let pct = 0;
    const nameVal = form.name || profile?.user?.name || me?.name;
    const avatarVal = form.avatar || profile?.user?.avatar || me?.avatar;
    if (nameVal) pct += 15;
    if (avatarVal) pct += 20;
    if (profile?.bio) pct += 20;
    if (profile?.skills?.length > 0) pct += 15;
    if (profile?.location) pct += 10;
    if (profile?.hourlyRate) pct += 10;
    if (profile?.website || profile?.github || profile?.linkedin) pct += 10;
    return pct;
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
          {/* Completeness Bar */}
          {isMyProfile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-2 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white/80">Profile Completeness</span>
                <span className="text-sm font-bold text-brand-400">{getProfileCompletion()}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-brand-500 to-cyan-500 h-full transition-all duration-500" style={{ width: `${getProfileCompletion()}%` }} />
              </div>
              {getProfileCompletion() < 100 && (
                <p className="text-xs text-white/40 mt-1.5">
                  Complete your profile (Add name, photo, bio, skills, rate, links) to get more views and AI recommendations!
                </p>
              )}
            </motion.div>
          )}

          {/* Header card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-7 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-5">
                {/* Photo Upload with Preview */}
                <div className="relative group/avatar cursor-pointer">
                  <Avatar name={form.name || profile?.user?.name || me?.name || 'User'} src={form.avatar} size="xl" isOnline={!editing} />
                  {editing && (
                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-xs opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 cursor-pointer border border-white/20">
                      <Camera size={18} className="mb-1" />
                      <span>Upload</span>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  {editing ? (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/40">Full Name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="input-field py-1.5 px-3 text-sm font-semibold text-white bg-white/5 border border-white/10 rounded-lg w-full max-w-sm mt-0.5 focus:border-brand-500 focus:outline-none"
                          placeholder="Your Full Name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/40">Professional Title / Tagline</label>
                        <input
                          type="text"
                          value={form.tagline}
                          onChange={e => setForm({ ...form, tagline: e.target.value })}
                          className="input-field py-1.5 px-3 text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg w-full max-w-sm mt-0.5 focus:border-brand-500 focus:outline-none"
                          placeholder="e.g. Senior Full Stack Developer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
                        {profile?.user?.name || me?.name || me?.username || 'User'}
                        <span className="text-white/20 font-light text-xl">|</span>
                        <span className="text-brand-400 font-medium text-lg capitalize">{profile?.user?.role || me?.role}</span>
                      </h1>
                      {profile?.tagline && (
                        <p className="text-white/60 font-medium text-sm mt-1">{profile.tagline}</p>
                      )}
                    </div>
                  )}

                  {avgRating && (
                    <div className="flex items-center gap-2 mt-2">
                      <StarRating value={Math.round(avgRating)} size={16} />
                      <span className="text-sm font-semibold text-white">{avgRating}</span>
                      <span className="text-sm text-white/40">({reviews?.length} reviews)</span>
                    </div>
                  )}

                  {editing ? (
                    <div className="pt-1">
                      <label className="text-[10px] uppercase font-bold text-white/40">Location</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                        className="input-field py-1.5 px-3 text-sm text-white bg-white/5 border border-white/10 rounded-lg w-full max-w-sm mt-0.5 focus:border-brand-500 focus:outline-none"
                        placeholder="e.g. New York, USA"
                      />
                    </div>
                  ) : (
                    (form.location || profile?.location) && (
                      <div className="flex items-center gap-1.5 mt-2 text-sm text-white/40">
                        <MapPin size={14} className="text-brand-400" /> {form.location || profile?.location}
                      </div>
                    )
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {isMyProfile && (
                <div className="flex justify-end">
                  <button onClick={() => setAddPortfolioModal(true)} className="btn-primary text-sm flex items-center gap-1.5 px-4 py-2 font-display">
                    <Plus size={16} /> Add Project
                  </button>
                </div>
              )}

              {portfolioLoading ? (
                <Skeleton className="h-32 rounded-2xl" />
              ) : portfolioItems?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {portfolioItems.map((item, i) => (
                    <motion.div key={item._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 hover:border-brand-500/20 transition-all duration-300 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-semibold text-white text-base leading-snug font-display">{item.title}</h4>
                          {isMyProfile && (
                            <button onClick={() => handleDeletePortfolio(item._id)} className="p-1 rounded text-white/30 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed mb-4">{item.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5 mt-auto">
                        <div className="flex flex-wrap gap-1">
                          {item.skillsUsed?.map((sk, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSkillColor(idx)}`}>
                              {sk}
                            </span>
                          ))}
                        </div>
                        {item.projectLink && (
                          <a href={item.projectLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium transition-colors">
                            <LinkIcon size={12} /> View Project
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Award} title="No projects added yet" description="Showcase your best work by adding items to your portfolio." action={
                  isMyProfile && <button onClick={() => setAddPortfolioModal(true)} className="btn-primary text-sm">Add Your First Project</button>
                } />
              )}

              {/* Add Project Modal */}
              <AnimatePresence>
                {addPortfolioModal && (
                  <Modal open={addPortfolioModal} onClose={() => setAddPortfolioModal(false)} title="Add Portfolio Project">
                    <div className="space-y-4">
                      <div>
                        <label className="label">Project Title *</label>
                        <input type="text" value={portfolioForm.title} onChange={e => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                          placeholder="e.g. E-Commerce Website" className="input-field" />
                      </div>
                      <div>
                        <label className="label">Project Description *</label>
                        <textarea rows={4} value={portfolioForm.description} onChange={e => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                          placeholder="Describe the project, your role, and what you achieved..." className="input-field resize-none" />
                      </div>
                      <div>
                        <label className="label">Project URL (Optional)</label>
                        <input type="url" value={portfolioForm.projectLink} onChange={e => setPortfolioForm({ ...portfolioForm, projectLink: e.target.value })}
                          placeholder="https://myproject.com" className="input-field" />
                      </div>
                      <div>
                        <label className="label">Skills Used (Comma-separated, Optional)</label>
                        <input type="text" value={portfolioForm.skillsUsed} onChange={e => setPortfolioForm({ ...portfolioForm, skillsUsed: e.target.value })}
                          placeholder="React, Tailwind, Node.js" className="input-field" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setAddPortfolioModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button onClick={handleAddPortfolio} className="btn-primary flex-1">Add Project</button>
                      </div>
                    </div>
                  </Modal>
                )}
              </AnimatePresence>
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
