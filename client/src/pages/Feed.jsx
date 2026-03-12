import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import StoriesBar from '../components/StoriesBar'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Feed = () => {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/post/feed', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })

      if (data.success) {
        setFeeds(data.posts)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFeeds()
  }, [])

  return !loading ? (
    <div className='h-full overflow-y-scroll no-scrollbar py-8 xl:pr-6 flex items-start justify-center xl:gap-10'>
      {/* Stories and post list */}
      <div className='w-full max-w-xl'>
        <StoriesBar />
        <div className='p-4 space-y-5'>
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className='max-xl:hidden sticky top-8'>
        <div className='max-w-xs bg-white text-xs p-5 rounded-2xl inline-flex flex-col gap-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] border border-border-light'>
          <h3 className='text-text-primary font-semibold text-sm'>Sponsored</h3>
          <img
            src={assets.sponsored_img}
            className='w-75 h-50 rounded-xl object-cover'
            alt=''
          />
          <p className='text-text-secondary mt-1'>Email marketing</p>
          <p className='text-text-tertiary leading-relaxed'>
            This is a trial ad, and reserved this space for ads and promotions
          </p>
        </div>
        <RecentMessages />
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Feed