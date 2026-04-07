import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Zap, ArrowRight, Sparkles, Shield, TrendingUp, Globe, Star, Users, Briefcase, CheckCircle } from 'lucide-react'
import PublicLayout from '../layouts/PublicLayout'

const STATS = [
  { label: 'Freelancers', value: '50K+', icon: Users },
  { label: 'Jobs Posted', value: '12K+', icon: Briefcase },
  { label: 'Avg. Rating', value: '4.9★', icon: Star },
  { label: 'Countries', value: '120+', icon: Globe },
]

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description: 'Our intelligent engine analyzes skills, history, and preferences to surface the perfect opportunities — before you even search.',
    color: 'brand',
  },
  {
    icon: Shield,
    title: 'Secure Escrow',
    description: 'Payments are held safely in escrow and released only when work is approved. Full protection for both clients and freelancers.',
    color: 'blue',
  },
  {
    icon: TrendingUp,
    title: 'Career Analytics',
    description: 'Track your earnings, success rates, and growth over time with a beautiful, real-time analytics dashboard.',
    color: 'purple',
  },
  {
    icon: Globe,
    title: 'Global Talent Pool',
    description: 'Access world-class freelancers across 120+ countries. Find the right person for any project, any timezone.',
    color: 'cyan',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Profile', desc: 'Sign up and build a compelling profile showcasing your skills and portfolio.' },
  { step: '02', title: 'Find Opportunities', desc: 'Let AI recommend jobs or search with powerful filters and smart matching.' },
  { step: '03', title: 'Collaborate & Earn', desc: 'Work with clients, deliver results, and get paid securely through escrow.' },
]

const iconColors = {
  brand: 'from-brand-500 to-brand-400 shadow-[0_0_20px_rgba(37,163,107,0.3)]',
  blue: 'from-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  purple: 'from-purple-500 to-pink-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
  cyan: 'from-cyan-500 to-blue-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
}

function FadeIn({ children, delay = 0, y = 20 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <PublicLayout>
      {/* ── HERO ─────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, rgba(37,163,107,0.25) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-[100px]"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand-500/30 mb-8"
          >
            <Sparkles size={14} className="text-brand-400" />
            <span className="text-sm font-medium text-brand-400">AI-Powered Freelancing Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Work Smarter
            <br />
            <span className="gradient-text">With AI</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            The world's most intelligent freelancing platform — powered by AI that connects the right talent with the right work, instantly.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4 rounded-2xl">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/jobs" className="btn-secondary flex items-center gap-2 text-base px-8 py-4 rounded-2xl">
              Browse Jobs
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-2xl mx-auto"
          >
            {STATS.map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="glass rounded-2xl p-4 text-center"
              >
                <Icon size={18} className="text-brand-400 mx-auto mb-2" />
                <p className="font-display text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20"
        >
          <span className="text-xs">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section id="features" className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-brand-400 text-sm font-semibold tracking-wider uppercase">Why WorkLance</span>
              <h2 className="section-title mt-3 mb-4">Built for the Future<br />of <span className="gradient-text">Work</span></h2>
              <p className="text-white/40 max-w-lg mx-auto">Every feature is crafted to make freelancing more intelligent, secure, and rewarding.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="glass-card p-8 group cursor-default relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: 'radial-gradient(circle at 20% 50%, rgba(37,163,107,0.05) 0%, transparent 70%)' }}
                  />
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconColors[f.color]} flex items-center justify-center mb-5`}>
                    <f.icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-white/50 leading-relaxed">{f.description}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section id="how-it-works" className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-brand-950/40 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-brand-400 text-sm font-semibold tracking-wider uppercase">Get Started</span>
              <h2 className="section-title mt-3">Simple. Fast. <span className="gradient-text">Smart.</span></h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent hidden md:block" />

            {HOW_IT_WORKS.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.15}>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass border border-brand-500/20 mb-6 group-hover:border-brand-500/50 group-hover:shadow-[0_0_20px_rgba(37,163,107,0.15)] transition-all duration-300">
                    <span className="font-display text-2xl font-bold gradient-text">{step.step}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/40 leading-relaxed text-sm">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS / SOCIAL PROOF ───────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="section-title mb-3">Trusted by <span className="gradient-text">Professionals</span></h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Sarah Chen', role: 'Full-Stack Developer', review: 'WorkLance\'s AI matched me with projects that perfectly fit my skills. Landed my first $10K contract within a week!', rating: 5 },
              { name: 'Marcus Rivera', role: 'Product Manager', review: 'As a client, the quality of freelancers I found here is unmatched. The escrow system gives me complete peace of mind.', rating: 5 },
              { name: 'Priya Patel', role: 'UI/UX Designer', review: 'The AI recommendations are scary accurate. It\'s like the platform truly understands what I\'m looking for.', rating: 5 },
            ].map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="glass-card p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">"{t.review}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-white/40">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="relative glass-card p-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-mesh opacity-40 pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(37,163,107,0.3) 0%, transparent 70%)' }} />
              <div className="relative">
                <Zap size={36} className="text-brand-400 mx-auto mb-4" />
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                  Ready to <span className="gradient-text">level up?</span>
                </h2>
                <p className="text-white/50 mb-8 max-w-md mx-auto">
                  Join 50,000+ professionals already building their careers on WorkLance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register?role=freelancer" className="btn-primary flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base">
                    I'm a Freelancer <ArrowRight size={18} />
                  </Link>
                  <Link to="/register?role=client" className="btn-secondary flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base">
                    I'm Hiring
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/30">
                  {['Free to join', 'No hidden fees', 'Cancel anytime'].map(t => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-brand-500" /> {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </PublicLayout>
  )
}
