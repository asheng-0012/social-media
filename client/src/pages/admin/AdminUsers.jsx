import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Search, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_ADMIN_BASEURL

const inputStyle = {
  background: '#0f1117',
  border: '1px solid #1e2535',
  borderRadius: '8px',
  color: '#e2e8f0',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
}

const AdminUsers = () => {
  const { getToken } = useAuth()
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const url = `${BASE}/api/admin/users?page=${page}&limit=15${search ? '&search=' + encodeURIComponent(search) : ''}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
        setTotal(data.total)
        setPages(data.pages)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [getToken, page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}" and all their content? This cannot be undone.`)) return
    setDeleting(userId)
    try {
      const token = await getToken()
      const res = await fetch(`${BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        toast.success('User deleted')
        fetchUsers()
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error('Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color='#818cf8' />
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Users</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{total} total users</p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color='#475569' style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder='Search name, email, username…'
              style={{ ...inputStyle, paddingLeft: '30px', width: '240px' }}
            />
          </div>
          <button type='submit' style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            border: 'none', borderRadius: '8px', color: '#fff',
            padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: 600,
          }}>Search</button>
        </form>
      </div>

      {/* Table */}
      <div style={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2535' }}>
              {['User', 'Username', 'Email', 'Followers', 'Following', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#475569' }}>Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#475569' }}>No users found</td></tr>
            ) : users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #1e2535' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {u.profile_picture ? (
                      <img src={u.profile_picture} alt='' style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>{u.full_name?.[0]?.toUpperCase()}</div>
                    )}
                    <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 500 }}>{u.full_name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px' }}>@{u.username}</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px' }}>{u.email}</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px' }}>{u.followers?.length ?? 0}</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px' }}>{u.following?.length ?? 0}</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => handleDelete(u._id, u.full_name)}
                    disabled={deleting === u._id}
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: '6px', color: '#f87171', padding: '6px 10px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px',
                      opacity: deleting === u._id ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default AdminUsers
