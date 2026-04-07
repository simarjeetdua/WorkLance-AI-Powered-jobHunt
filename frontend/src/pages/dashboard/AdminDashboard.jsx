import { motion } from 'framer-motion'
import { useAsync } from '../../hooks/useAsync'
import { analyticsAPI } from '../../services/api'
import { StatCard, PageHeader, Skeleton } from '../../components/ui/index'
import { Users, Briefcase, DollarSign, TrendingUp, Shield } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

// Mock analytics data for when API isn't available
const MOCK = {
  users: { total: 4820, freelancers: 3641, clients: 1179 },
  jobs: { total: 1247, open: 389, closed: 858 },
  revenue: '$124,500',
  growth: 18,
  monthlyJobs: [
    { month: 'Jul', jobs: 45 }, { month: 'Aug', jobs: 62 }, { month: 'Sep', jobs: 58 },
    { month: 'Oct', jobs: 80 }, { month: 'Nov', jobs: 95 }, { month: 'Dec', jobs: 112 },
  ],
  monthlyRevenue: [
    { month: 'Jul', revenue: 8400 }, { month: 'Aug', revenue: 12200 }, { month: 'Sep', revenue: 10800 },
    { month: 'Oct', revenue: 15600 }, { month: 'Nov', revenue: 18900 }, { month: 'Dec', revenue: 21300 },
  ],
}

const PIE_COLORS = ['#25a36b', '#0ea5e9', '#a855f7']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 shadow-xl border border-white/10">
      <p className="text-xs text-white/60 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {typeof p.value === 'number' && p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { data: analytics, loading } = useAsync(() => analyticsAPI.get())
  const data = analytics || MOCK

  const stats = [
    { label: 'Total Users', value: data.users?.total ?? '—', icon: Users, color: 'brand', delta: 12 },
    { label: 'Total Jobs', value: data.jobs?.total ?? '—', icon: Briefcase, color: 'blue', delta: 8 },
    { label: 'Revenue', value: data.revenue ?? '$0', icon: DollarSign, color: 'purple', delta: data.growth },
    { label: 'Growth', value: `${data.growth ?? 0}%`, icon: TrendingUp, color: 'yellow', delta: 5 },
  ]

  const pieData = [
    { name: 'Freelancers', value: data.users?.freelancers ?? 0 },
    { name: 'Clients', value: data.users?.clients ?? 0 },
    { name: 'Admins', value: data.users?.admins ?? 10 },
  ]

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform overview and analytics"
        action={
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-brand-500/20">
            <Shield size={14} className="text-brand-400" />
            <span className="text-xs text-brand-400 font-semibold">Admin Mode</span>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Jobs over time */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-display font-bold text-white mb-5">Jobs Posted Over Time</h3>
          {loading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.monthlyJobs || MOCK.monthlyJobs}>
                <defs>
                  <linearGradient id="jobGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25a36b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#25a36b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="jobs" stroke="#25a36b" strokeWidth={2} fill="url(#jobGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User distribution pie */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-5">User Distribution</h3>
          {loading ? <Skeleton className="h-52" /> : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 w-full mt-2">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-white/60">{item.name}</span>
                    </span>
                    <span className="font-semibold text-white">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue chart */}
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-white mb-5">Monthly Revenue</h3>
        {loading ? <Skeleton className="h-48" /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.monthlyRevenue || MOCK.monthlyRevenue}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#25a36b" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#25a36b" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
