import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Flag, Trash2, ChevronLeft, ChevronRight, UserX } from 'lucide-react'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_ADMIN_BASEURL

const AdminReports = () => {
  const { getToken } = useAuth()
  const [reports, setReports] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const url = `${BASE}/api/admin/reports?page=${page}&limit=15`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) {
        setReports(data.reports)
        setTotal(data.total)
        setPages(data.pages)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [getToken, page])

  useEffect(() => { fetchReports() }, [fetchReports])

  const handleDeleteUser = async (userId, userName, reportId) => {
    if (!window.confirm(`Delete user "${userName}" and all their content? This cannot be undone.`)) return
    setActioning(reportId)
    try {
      const token = await getToken()
      // Delete the user (this will cascade through posts, stories, connections)
      const res = await fetch(`${BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        // Also dismiss all reports for this user
        await fetch(`${BASE}/api/admin/reports/${reportId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success(`User "${userName}" deleted successfully.`)
        fetchReports()
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error('Failed to delete user.')
    } finally {
      setActioning(null)
    }
  }

  const handleDismiss = async (reportId) => {
    if (!window.confirm('Dismiss this report?')) return
    setActioning(reportId)
    try {
      const token = await getToken()
      const res = await fetch(`${BASE}/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Report dismissed.')
        fetchReports()
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error('Failed to dismiss report.')
    } finally {
      setActioning(null)
    }
  }

  const Avatar = ({ user, size = 34 }) =>
    user?.profile_picture ? (
      <img src={user.profile_picture} alt='' style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0,
      }}>{user?.full_name?.[0]?.toUpperCase()}</div>
    )

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <Flag size={20} color='#f87171' />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Reports</h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{total} total report{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ color: '#475569', textAlign: 'center', padding: '48px' }}>Loading…</div>
        ) : reports.length === 0 ? (
          <div style={{
            background: '#161b27', border: '1px solid #1e2535', borderRadius: '12px',
            padding: '48px', textAlign: 'center', color: '#475569',
          }}>
            <Flag size={32} color='#1e2535' style={{ margin: '0 auto 12px' }} />
            <p>No reports yet. Great news!</p>
          </div>
        ) : reports.map((report) => (
          <div key={report._id} style={{
            background: '#161b27', border: '1px solid #1e2535', borderRadius: '12px',
            padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>

              {/* Reported User */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Reported User</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar user={report.reportedUser} />
                  <div>
                    <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, margin: 0 }}>{report.reportedUser?.full_name}</p>
                    <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>@{report.reportedUser?.username}</p>
                    <p style={{ color: '#475569', fontSize: '11px', margin: 0 }}>{report.reportedUser?.email}</p>
                  </div>
                </div>
              </div>

              {/* Reporter */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Reported By</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar user={report.reporter} size={28} />
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, margin: 0 }}>{report.reporter?.full_name}</p>
                    <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>@{report.reporter?.username}</p>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div style={{ minWidth: '100px' }}>
                <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Reported</p>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                  {new Date(report.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '12px 16px' }}>
              <p style={{ fontSize: '10px', color: '#f87171', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Reason</p>
              <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{report.reason}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleDismiss(report._id)}
                disabled={actioning === report._id}
                style={{
                  background: 'transparent', border: '1px solid #1e2535', borderRadius: '8px',
                  color: '#94a3b8', padding: '7px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500,
                  opacity: actioning === report._id ? 0.5 : 1,
                }}
              >
                <Trash2 size={13} /> Dismiss Report
              </button>
              <button
                onClick={() => handleDeleteUser(report.reportedUser?._id, report.reportedUser?.full_name, report._id)}
                disabled={actioning === report._id}
                style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px', color: '#f87171', padding: '7px 14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: 600,
                  opacity: actioning === report._id ? 0.5 : 1,
                }}
              >
                <UserX size={13} /> Delete User
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: '8px', color: '#94a3b8', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', opacity: page === 1 ? 0.4 : 1 }}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Page {page} of {pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: '8px', color: '#94a3b8', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', opacity: page === pages ? 0.4 : 1 }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminReports
