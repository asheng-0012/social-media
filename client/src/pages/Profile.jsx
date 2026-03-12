import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import Loading from '../components/Loading'
import UserProfileInfo from '../components/UserProfileInfo'
import PostCard from '../components/PostCard'
import moment from 'moment'
import ProfileModal from '../components/ProfileModal'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const Profile = () => {
  const currentUser = useSelector((state) => state.user.value)
  const { getToken } = useAuth()
  const { profileId } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [showEdit, setShowEdit] = useState(false)

  // Report modal state
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reporting, setReporting] = useState(false)

  const fetchUser = async (profileId) => {
    const token = await getToken()
    try {
      const { data } = await api.post(
        `/api/user/profiles`,
        { profileId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        setUser(data.profile)
        setPosts(data.posts)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting.')
      return
    }
    setReporting(true)
    try {
      const token = await getToken()
      const { data } = await api.post(
        `/api/user/report`,
        { reportedUserId: user._id, reason: reportReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success(data.message)
        setShowReport(false)
        setReportReason('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setReporting(false)
    }
  }

  useEffect(() => {
    if (profileId) {
      fetchUser(profileId)
    } else {
      fetchUser(currentUser._id)
    }
  }, [profileId, currentUser])

  return user ? (
    <div className='relative h-full overflow-y-scroll no-scrollbar bg-surface-hover p-6'>
      <div className='max-w-3xl mx-auto'>
        {/* Profile Card */}
        <div className='bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden border border-border-light'>
          {/* Cover Photo */}
          <div className='h-40 md:h-56 bg-gradient-to-br from-google-blue/20 via-google-red/10 to-google-yellow/20'>
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt=''
                className='w-full h-full object-cover'
              />
            )}
          </div>
          {/* User Info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
            setShowReport={setShowReport}
          />
        </div>

        {/* Tabs */}
        <div className='mt-8'>
          <div className='bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-border-light p-1.5 flex max-w-md mx-auto'>
            {['posts', 'media', 'likes'].map((tab) => (
              <button
                onClick={() => setActiveTab(tab)}
                key={tab}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-google-blue text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts */}
          {activeTab === 'posts' && (
            <div className='mt-6 flex flex-col items-center gap-5'>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Media */}
          {activeTab === 'media' && (
            <div className='flex flex-wrap mt-6 gap-1 rounded-2xl overflow-hidden'>
              {posts
                .filter((post) => post.image_urls.length > 0)
                .map((post) => (
                  <>
                    {post.image_urls.map((image, index) => (
                      <Link
                        target='_blank'
                        to={image}
                        key={index}
                        className='relative group'
                      >
                        <img
                          src={image}
                          className='w-64 aspect-video object-cover hover:opacity-90 transition-opacity duration-200'
                          alt=''
                        />
                        <p className='absolute bottom-0 right-0 text-xs p-1.5 px-3 backdrop-blur-xl bg-black/30 text-white rounded-tl-lg opacity-0 group-hover:opacity-100 transition duration-300'>
                          Posted {moment(post.createdAt).fromNow()}
                        </p>
                      </Link>
                    ))}
                  </>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && <ProfileModal setShowEdit={setShowEdit} />}

      {/* Report Modal */}
      {showReport && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-border-light'>
            <h2 className='text-lg font-bold text-text-primary mb-1'>Report User</h2>
            <p className='text-sm text-text-secondary mb-4'>
              Tell us why you're reporting <span className='font-semibold text-text-primary'>{user.full_name}</span>. Our team will review it.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder='Describe the reason for reporting (e.g. harassment, spam, fake account)…'
              rows={4}
              className='w-full border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-google-blue/30 resize-none'
            />
            <div className='flex justify-end gap-3 mt-4'>
              <button
                onClick={() => { setShowReport(false); setReportReason('') }}
                className='px-5 py-2 text-sm font-medium rounded-full border border-border text-text-secondary hover:bg-surface-hover transition-colors duration-200 cursor-pointer'
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={reporting}
                className='px-5 py-2 text-sm font-semibold rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 cursor-pointer disabled:opacity-60'
              >
                {reporting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <Loading />
  )
}

export default Profile