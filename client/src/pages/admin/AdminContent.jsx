import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { FileText, BookImage, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_ADMIN_BASEURL

const tabStyle = (active) => ({
  padding: '8px 20px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: active ? 600 : 400,
  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
  color: active ? '#a5b4fc' : '#64748b',
  transition: 'all 0.15s',
})

const PostCard = ({ post, onDelete, deleting }) => (
  <div style={{
    background: '#161b27', border: '1px solid #1e2535', borderRadius: '12px',
    padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
  }}>
    {/* Author */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {post.user?.profile_picture ? (
        <img src={post.user.profile_picture} alt='' style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700, color: '#fff',
        }}>{post.user?.full_name?.[0]?.toUpperCase() ?? '?'}</div>
      )}
      <div>
        <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{post.user?.full_name ?? 'Unknown'}</div>
        <div style={{ color: '#64748b', fontSize: '11px' }}>@{post.user?.username ?? 'unknown'}</div>
      </div>
      <div style={{ marginLeft: 'auto', color: '#475569', fontSize: '11px' }}>
        {new Date(post.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
    </div>

    {/* Content */}
    {post.content && (
      <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {post.content}
      </p>
    )}
    {post.image_urls?.length > 0 && (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {post.image_urls.slice(0, 3).map((url, i) => (
          <img key={i} src={url} alt='' style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
        ))}
        {post.image_urls.length > 3 && (
          <div style={{ width: '70px', height: '70px', borderRadius: '8px', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12px' }}>
            +{post.image_urls.length - 3}
          </div>
        )}
      </div>
    )}

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{
        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: '#818cf8',
      }}>{post.post_type}</span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b', fontSize: '12px' }}>
        ❤️ {post.likes_count?.length ?? 0}
        <button
          onClick={() => onDelete(post._id)}
          disabled={deleting === post._id}
          style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '6px', color: '#f87171', padding: '5px 10px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
            opacity: deleting === post._id ? 0.5 : 1,
          }}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  </div>
)

const StoryCard = ({ story, onDelete, deleting }) => (
  <div style={{
    background: '#161b27', border: '1px solid #1e2535', borderRadius: '12px',
    padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {story.user?.profile_picture ? (
        <img src={story.user.profile_picture} alt='' style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #f472b6, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700, color: '#fff',
        }}>{story.user?.full_name?.[0]?.toUpperCase() ?? '?'}</div>
      )}
      <div>
        <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{story.user?.full_name ?? 'Unknown'}</div>
        <div style={{ color: '#64748b', fontSize: '11px' }}>@{story.user?.username ?? 'unknown'}</div>
      </div>
      <div style={{ marginLeft: 'auto', color: '#475569', fontSize: '11px' }}>
        {new Date(story.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
    </div>

    {story.media_url && story.media_type === 'image' && (
      <img src={story.media_url} alt='' style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
    )}
    {story.content && (
      <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>{story.content}</p>
    )}

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <span style={{
          background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)',
          borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: '#f472b6',
        }}>{story.media_type}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b', fontSize: '12px' }}>
        👁 {story.views_count?.length ?? 0}
        <button
          onClick={() => onDelete(story._id)}
          disabled={deleting === story._id}
          style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '6px', color: '#f87171', padding: '5px 10px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
            opacity: deleting === story._id ? 0.5 : 1,
          }}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  </div>
)

const AdminContent = () => {
  const { getToken } = useAuth()
  const [tab, setTab] = useState('posts')

  const [posts, setPosts] = useState([])
  const [postTotal, setPostTotal] = useState(0)
  const [postPage, setPostPage] = useState(1)
  const [postPages, setPostPages] = useState(1)
  const [postLoading, setPostLoading] = useState(true)
  const [deletingPost, setDeletingPost] = useState(null)

  const [stories, setStories] = useState([])
  const [storyTotal, setStoryTotal] = useState(0)
  const [storyPage, setStoryPage] = useState(1)
  const [storyPages, setStoryPages] = useState(1)
  const [storyLoading, setStoryLoading] = useState(true)
  const [deletingStory, setDeletingStory] = useState(null)

  const fetchPosts = useCallback(async () => {
    setPostLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${BASE}/api/admin/posts?page=${postPage}&limit=12`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) { setPosts(data.posts); setPostTotal(data.total); setPostPages(data.pages) }
    } catch (e) { console.error(e) }
    finally { setPostLoading(false) }
  }, [getToken, postPage])

  const fetchStories = useCallback(async () => {
    setStoryLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${BASE}/api/admin/stories?page=${storyPage}&limit=12`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) { setStories(data.stories); setStoryTotal(data.total); setStoryPages(data.pages) }
    } catch (e) { console.error(e) }
    finally { setStoryLoading(false) }
  }, [getToken, storyPage])

  useEffect(() => { fetchPosts() }, [fetchPosts])
  useEffect(() => { fetchStories() }, [fetchStories])

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return
    setDeletingPost(id)
    try {
      const token = await getToken()
      const res = await fetch(`${BASE}/api/admin/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) { toast.success('Post deleted'); fetchPosts() } else toast.error(data.message)
    } catch (e) { toast.error('Failed') }
    finally { setDeletingPost(null) }
  }

  const handleDeleteStory = async (id) => {
    if (!window.confirm('Delete this story?')) return
    setDeletingStory(id)
    try {
      const token = await getToken()
      const res = await fetch(`${BASE}/api/admin/stories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) { toast.success('Story deleted'); fetchStories() } else toast.error(data.message)
    } catch (e) { toast.error('Failed') }
    finally { setDeletingStory(null) }
  }

  const Pagination = ({ page, pages, setPage }) => pages > 1 ? (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
        style={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: '8px', color: '#94a3b8', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', opacity: page === 1 ? 0.4 : 1 }}>
        <ChevronLeft size={14} /> Prev
      </button>
      <span style={{ color: '#64748b', fontSize: '13px' }}>Page {page} of {pages}</span>
      <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
        style={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: '8px', color: '#94a3b8', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', opacity: page === pages ? 0.4 : 1 }}>
        Next <ChevronRight size={14} />
      </button>
    </div>
  ) : null

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Posts & Stories</h1>
        <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Manage all platform content</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#0f1117', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid #1e2535' }}>
        <button style={tabStyle(tab === 'posts')} onClick={() => setTab('posts')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} /> Posts ({postTotal})</span>
        </button>
        <button style={tabStyle(tab === 'stories')} onClick={() => setTab('stories')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookImage size={14} /> Stories ({storyTotal})</span>
        </button>
      </div>

      {/* Posts Grid */}
      {tab === 'posts' && (
        <>
          {postLoading ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: '48px' }}>Loading…</div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: '48px' }}>No posts found</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {posts.map(p => <PostCard key={p._id} post={p} onDelete={handleDeletePost} deleting={deletingPost} />)}
            </div>
          )}
          <Pagination page={postPage} pages={postPages} setPage={setPostPage} />
        </>
      )}

      {/* Stories Grid */}
      {tab === 'stories' && (
        <>
          {storyLoading ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: '48px' }}>Loading…</div>
          ) : stories.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: '48px' }}>No stories found</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {stories.map(s => <StoryCard key={s._id} story={s} onDelete={handleDeleteStory} deleting={deletingStory} />)}
            </div>
          )}
          <Pagination page={storyPage} pages={storyPages} setPage={setStoryPage} />
        </>
      )}
    </div>
  )
}

export default AdminContent
