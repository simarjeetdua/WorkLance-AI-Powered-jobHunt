import { motion } from 'framer-motion'
import { useAsync } from '../../hooks/useAsync'
import { analyticsAPI } from '../../services/api'
import DashboardLayout from '../../layouts/DashboardLayout'
import { PageHeader, Skeleton } from '../../components/ui/index'
import { BarChart2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const MOCK_MONTHLY = [
  { month: 'Jan', jobs: 30, users: 120, revenue: 5400 },
  { month: 'Feb', jobs: 45, users: 180, revenue: 8100 },
  { month: 'Mar', jobs: 38, users: 140, revenue: 6840 },
  { month: 'Apr', jobs: 60, users: 220, revenue: 10800 },
  { month: 'May', jobs: 72, users: 290, revenue: 12960 },
  { month: 'Jun', jobs: 85, users: 340, revenue: 15300 },
  { month: 'Jul', jobs: 91, users: 380, revenue: 16380 },
  { month: 'Aug', jobs: 78, users: 310, revenue: 14040 },
  { month: 'Sep', jobs: 105, users: 420, revenue: 18900 },
  { month: 'Oct', jobs: 118, users: 490, revenue: 21240 },
  { month: 'Nov', jobs: 132, users: 560, revenue: 23760 },
  { month: 'Dec', jobs: 145, users: 610, revenue: 26100 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-4 py-3 shadow-2xl border border-white/10 text-sm">
      <p className="text-white/60 mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.name === 'revenue' ? '$' + p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data, loading } = useAsync(() => analyticsAPI.get())
  const monthly = data?.monthly || MOCK_MONTHLY

  const ChartCard = ({ title, children }) => (
    <div className="glass-card p-6">
      <h3 className="font-display font-bold text-white mb-5">{title}</h3>
      {loading ? <Skeleton className="h-52" /> : children}
    </div>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Platform Analytics" subtitle="Comprehensive platform performance insights" />
      <div className="space-y-6">
        <ChartCard title="Jobs and User Growth">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="jobsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#25a36b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#25a36b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }} />
              <Area type="monotone" dataKey="jobs" stroke="#25a36b" strokeWidth={2} fill="url(#jobsGrad)" name="jobs" />
              <Area type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={2} fill="url(#usersGrad)" name="users" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Monthly Revenue">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25a36b" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#25a36b" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="url(#revGrad)" radius={[5, 5, 0, 0]} name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Job Posting Trend">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="jobs" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: '#a855f7', r: 4 }} activeDot={{ r: 6 }} name="jobs" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-5">Yearly Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Month', 'Jobs Posted', 'New Users', 'Revenue'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {monthly.map((row, i) => (
                  <motion.tr key={row.month} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4 text-white font-medium text-sm">{row.month}</td>
                    <td className="py-3 px-4 text-white/70 text-sm">{row.jobs}</td>
                    <td className="py-3 px-4 text-white/70 text-sm">{row.users}</td>
                    <td className="py-3 px-4 text-brand-400 font-semibold text-sm">${row.revenue.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td className="py-3 px-4 font-bold text-white text-sm">Total</td>
                  <td className="py-3 px-4 font-bold text-white text-sm">{monthly.reduce((s, r) => s + r.jobs, 0)}</td>
                  <td className="py-3 px-4 font-bold text-white text-sm">{monthly.reduce((s, r) => s + r.users, 0)}</td>
                  <td className="py-3 px-4 font-bold text-brand-400 text-sm">${monthly.reduce((s, r) => s + r.revenue, 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
