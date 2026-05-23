import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAsync } from '../../hooks/useAsync'
import DashboardLayout from '../../layouts/DashboardLayout'
import { PageHeader, EmptyState, Skeleton, Avatar } from '../../components/ui/index'
import { Users, Search, Shield, Code, Briefcase, MoreHorizontal } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'
import API from '../../services/api'

export default function AdminUsersPage() {
  const { data: users, loading } = useAsync(() => API.get('/admin/users'))
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const usersList = Array.isArray(users) ? users : (users?.getUsers || [])
  const filtered = usersList.filter(u => {
    const nameToSearch = u.name || u.username || ''
    const matchSearch = nameToSearch.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const roleIcon = { admin: Shield, freelancer: Code, client: Briefcase }

  return (
    <DashboardLayout>
      <PageHeader title="User Management" subtitle={`${usersList.length} registered users`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'freelancer', 'client', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize border transition-all ${
                roleFilter === r
                  ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                  : 'bg-white/3 border-white/10 text-white/50 hover:border-white/20'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['User', 'Role', 'Joined', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td className="px-6 py-4" colSpan={5}><Skeleton className="h-10 w-full" /></td></tr>
                  ))
                : filtered.map((user, i) => {
                    const Icon = roleIcon[user.role] || Users
                    return (
                      <motion.tr key={user._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name || user.username} src={user.avatar} size="sm" />
                            <div>
                              <p className="font-semibold text-white text-sm">{user.name || user.username}</p>
                              <p className="text-xs text-white/40">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge border text-xs flex items-center gap-1.5 w-fit ${
                            user.role === 'admin' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                            user.role === 'freelancer' ? 'text-brand-400 bg-brand-500/10 border-brand-500/20' :
                            'text-blue-400 bg-blue-500/10 border-blue-500/20'
                          }`}>
                            <Icon size={11} /> {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4"><span className="text-sm text-white/50">{timeAgo(user.createdAt)}</span></td>
                        <td className="px-6 py-4">
                          <span className="badge text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20">Active</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="py-16">
              <EmptyState icon={Users} title="No users found" description="Try adjusting your search or filters." />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
