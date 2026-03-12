import { BadgeCheck, Trash2, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const StoryViewer = ({ viewStory, setViewStory, currentUserId, onStoryDeleted }) => {
    const [progress, setProgress] = useState(0)
    const [deleting, setDeleting] = useState(false)
    const { getToken } = useAuth()

    useEffect(() => {
        let timer, progressInterval

        if (viewStory && viewStory.media_type !== 'video') {
            setProgress(0)

            const duration = 10000
            const setTime = 100
            let elapsed = 0

            progressInterval = setInterval(() => {
                elapsed += setTime
                setProgress((elapsed / duration) * 100)
            }, setTime)

            timer = setTimeout(() => {
                setViewStory(null)
            }, duration)
        }

        return () => {
            clearTimeout(timer)
            clearInterval(progressInterval)
        }
    }, [viewStory, setViewStory])

    const handleClose = () => {
        setViewStory(null)
    }

    const handleDelete = async () => {
        if (!window.confirm('Delete this story? This cannot be undone.')) return
        setDeleting(true)
        try {
            const token = await getToken()
            const { data } = await api.delete(`/api/story/${viewStory._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success('Story deleted.')
                setViewStory(null)
                onStoryDeleted && onStoryDeleted(viewStory._id)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setDeleting(false)
        }
    }

    if (!viewStory) return null

    const isOwner = currentUserId && viewStory.user?._id === currentUserId

    const renderContent = () => {
        switch (viewStory.media_type) {
            case 'image':
                return (
                    <img
                        src={viewStory.media_url}
                        alt=''
                        className='max-w-full max-h-screen object-contain rounded-xl'
                    />
                )
            case 'video':
                return (
                    <video
                        onEnded={() => setViewStory(null)}
                        src={viewStory.media_url}
                        className='max-h-screen rounded-xl'
                        controls
                        autoPlay
                    />
                )
            case 'text':
                return (
                    <div className='w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center leading-relaxed'>
                        {viewStory.content}
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div
            className='fixed inset-0 h-screen bg-black/95 z-110 flex items-center justify-center'
            style={{
                backgroundColor:
                    viewStory.media_type === 'text'
                        ? viewStory.background_color
                        : '#000000',
            }}
        >
            {/* Progress Bar */}
            <div className='absolute top-0 left-0 w-full h-1 bg-white/20'>
                <div
                    className='h-full bg-white rounded-full transition-all duration-100 ease-linear'
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* User Info - Top Left */}
            <div className='absolute top-5 left-5 flex items-center gap-3 py-2 px-4 sm:py-3 sm:px-6 backdrop-blur-2xl rounded-full bg-black/40 border border-white/10'>
                <img
                    src={viewStory.user?.profile_picture}
                    alt=''
                    className='size-7 sm:size-8 rounded-full object-cover ring-2 ring-white/30'
                />
                <div className='text-white font-medium flex items-center gap-1.5 text-sm'>
                    <span>{viewStory.user?.full_name}</span>
                    <BadgeCheck size={16} className='text-google-blue' />
                </div>
            </div>

            {/* Top-right buttons */}
            <div className='absolute top-5 right-5 flex items-center gap-2'>
                {/* Delete — only for own story */}
                {isOwner && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        title='Delete story'
                        className='text-white/80 hover:text-red-400 p-2 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer disabled:opacity-50'
                    >
                        <Trash2 className='w-5 h-5' />
                    </button>
                )}
                <button
                    onClick={handleClose}
                    className='text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer'
                >
                    <X className='w-6 h-6' />
                </button>
            </div>

            {/* Content Wrapper */}
            <div className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'>
                {renderContent()}
            </div>
        </div>
    )
}

export default StoryViewer