import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Zap, Mail, Lock, User, Eye, EyeOff, Briefcase, Code, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { id: 'freelancer', label: 'Freelancer', desc: 'I want to find work', icon: Code, color: 'from-brand-500 to-cyan-500' },
  { id: 'client', label: 'Client', desc: 'I want to hire talent', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: params.get('role') || 'freelancer'
  })

  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})

  // ✅ VALIDATION
  const validate = () => {
    const e = {}

    if (!form.name.trim()) e.name = 'Name is required'

    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'

    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 5) e.password = 'Minimum 5 characters'

    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords don't match"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      // 🔥 IMPORTANT FIX (MATCH BACKEND)
      const payload = {
        username: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }

      await register(payload)

      toast.success('Account created successfully 🎉')
      navigate('/dashboard')

    } catch (err) {
      console.log("REGISTER ERROR:", err)

      // 🔥 FIXED ERROR HANDLING
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // INPUT FIELD COMPONENT
  const field = (key, label, type, icon, placeholder) => (
    <div>
      <label className="label">{label}</label>

      <div className="relative">
        {icon}

        <input
          type={(key === 'password' || key === 'confirmPassword') ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={`input-field pl-11 ${
            errors[key] ? 'border-red-500/50' : ''
          } ${(key === 'password' || key === 'confirmPassword') ? 'pr-11' : ''}`}
        />

        {(key === 'password' || key === 'confirmPassword') && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {errors[key] && (
        <p className="text-red-400 text-xs mt-1">{errors[key]}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Zap className="text-brand-400" />
            <span className="text-white font-bold text-xl">WorkLance</span>
          </Link>

          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-white/50 text-sm">Join and start your journey</p>
        </div>

        {/* CARD */}
        <div className="glass-card p-6">
          {/* ROLE */}
          <div className="mb-5">
            <label className="label">I am a...</label>

            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setForm({ ...form, role: role.id })}
                  className={`p-3 rounded-lg border ${
                    form.role === role.id
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-white/10'
                  }`}
                >
                  <p className="text-white text-sm font-semibold">{role.label}</p>
                  <p className="text-white/40 text-xs">{role.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {field('name', 'Full Name', 'text',
              <User className="absolute left-3 top-3 text-white/40" size={16} />,
              'John Doe')}

            {field('email', 'Email', 'email',
              <Mail className="absolute left-3 top-3 text-white/40" size={16} />,
              'you@example.com')}

            {field('password', 'Password', 'password',
              <Lock className="absolute left-3 top-3 text-white/40" size={16} />,
              'Enter password')}

            {field('confirmPassword', 'Confirm Password', 'password',
              <Shield className="absolute left-3 top-3 text-white/40" size={16} />,
              'Repeat password')}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-sm text-white/40 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}