import React from 'react'
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldCheck,
  Flag,
  Home,
} from 'lucide-react'

const AdminLayout = () => {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

  if (!isLoaded) return null

  const adminId = import.meta.env.VITE_ADMIN_USER_ID
  if (!adminId || user?.id !== adminId) {
    return <Navigate to='/' replace />
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/content', label: 'Posts & Stories', icon: FileText },
    { to: '/admin/reports', label: 'Reports', icon: Flag },
  ]


  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f1117', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: '230px',
        minWidth: '230px',
        background: '#161b27',
        borderRight: '1px solid #1e2535',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e2535' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldCheck size={18} color='white' />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>Comigo Admin</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Control Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 10px' }}>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                textDecoration: 'none',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#a5b4fc' : '#94a3b8',
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e2535', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#475569' }}>Logged in as admin</span>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#a5b4fc', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
          >
            <Home size={15} />
            Switch to User
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
