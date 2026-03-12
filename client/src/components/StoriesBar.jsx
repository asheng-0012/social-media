import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import moment from 'moment'
import StoryModal from './StoryModal'
import StoryViewer from './StoryViewer'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const StoriesBar = () => {
    const { getToken } = useAuth()
    const currentUser = useSelector((state) => state.user.value)
    const [stories, setStories] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [viewStory, setViewStory] = useState(null)

    const fetchStories = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get('/api/story/get', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (data.success) {
                setStories(data.stories)
            } else {
                toast(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchStories()
    }, [])

    return (
        <div className='w-screen sm:w-[calc(100vw-256px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4'>
            <div className='flex gap-3 pb-5'>
                {/* Add Story Card */}
                <div
                    onClick={() => setShowModal(true)}
                    className='rounded-2xl min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-md transition-all duration-200 border-2 border-dashed border-google-blue/30 bg-google-blue/[0.03] hover:bg-google-blue/[0.06] hover:border-google-blue/50'
                >
                    <div className='h-full flex flex-col items-center justify-center p-4'>
                        <div className='size-10 bg-google-blue rounded-full flex items-center justify-center mb-3 shadow-sm'>
                            <Plus className='w-5 h-5 text-white' />
                        </div>
                        <p className='text-sm font-medium text-text-primary text-center'>
                            Create Story
                        </p>
                    </div>
                </div>

                {/* Story Cards */}
                {stories.map((story, index) => (
                    <div
                        onClick={() => setViewStory(story)}
                        key={index}
                        className='relative rounded-2xl shadow-sm min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-google-blue to-google-blue/80 hover:scale-[1.02] active:scale-[0.98] overflow-hidden'
                    >
                        <img
                            src={story.user.profile_picture}
                            alt=''
                            className='absolute size-8 top-3 left-3 z-10 rounded-full ring-2 ring-white shadow-sm'
                        />
                        <p className='absolute top-18 left-3 text-white/70 text-sm truncate max-w-24'>
                            {story.content}
                        </p>
                        <p className='text-white/80 absolute bottom-1.5 right-2.5 z-10 text-[10px] font-medium'>
                            {moment(story.createdAt).fromNow()}
                        </p>
                        {story.media_type !== 'text' && (
                            <div className='absolute inset-0 z-1 rounded-2xl bg-black overflow-hidden'>
                                {story.media_type === 'image' ? (
                                    <img
                                        src={story.media_url}
                                        alt=''
                                        className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80'
                                    />
                                ) : (
                                    <video
                                        src={story.media_url}
                                        className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80'
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Story Modal */}
            {showModal && (
                <StoryModal
                    setShowModal={setShowModal}
                    fetchStories={fetchStories}
                />
            )}
            {/* View Story Modal */}
            {viewStory && (
                <StoryViewer
                    viewStory={viewStory}
                    setViewStory={setViewStory}
                    currentUserId={currentUser?._id}
                    onStoryDeleted={(deletedId) => setStories((prev) => prev.filter((s) => s._id !== deletedId))}
                />
            )}
        </div>
    )
}

export default StoriesBar