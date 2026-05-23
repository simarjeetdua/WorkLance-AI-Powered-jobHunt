import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <Navbar />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`pt-16 ${collapsed ? 'pl-[72px]' : 'pl-64'} min-h-screen transition-all duration-300`}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </motion.main>
    </div>
  )
}
