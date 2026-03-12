import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Users, FileText, BookImage, TrendingUp } from 'lucide-react'

const BASE = import.meta.env.VITE_ADMIN_BASEURL

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div style={{
    background: '#161b27',
    border: '1px solid #1e2535',
    borderRadius: '14px',
    padding: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flex: 1,
    minWidth: '180px',
  }}>
    <div>
      <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', margin: 0 }}>
        {value ?? <span style={{ opacity: 0.3 }}>—</span>}
      </h2>
    </div>
    <div style={{
      width: '44px', height: '44px', borderRadius: '10px',
      background: color + '22',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={20} color={color} />
    </div>
  </div>
)

const AdminDashboard = () => {
  const { getToken } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${BASE}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) setStats(data.stats)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken])

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Overview of your platform</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <StatCard label='Total Users' value={loading ? null : stats?.userCount} icon={Users} color='#818cf8' />
        <StatCard label='Total Posts' value={loading ? null : stats?.postCount} icon={FileText} color='#34d399' />
        <StatCard label='Total Stories' value={loading ? null : stats?.storyCount} icon={BookImage} color='#f472b6' />
      </div>

      <div style={{
        marginTop: '40px',
        background: '#161b27',
        border: '1px solid #1e2535',
        borderRadius: '14px',
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '12px',
          background: 'rgba(99,102,241,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrendingUp size={22} color='#818cf8' />
        </div>
        <div>
          <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '15px', margin: 0 }}>Platform is live</h3>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>
            Use the sidebar to manage users and content.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
