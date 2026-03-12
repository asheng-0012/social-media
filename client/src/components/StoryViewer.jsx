import { BadgeCheck, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const StoryViewer = ({ viewStory, setViewStory }) => {
    const [progress, setProgress] = useState(0)

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

    if (!viewStory) return null

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

            {/* Close Button */}
            <button
                onClick={handleClose}
                className='absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer'
            >
                <X className='w-6 h-6' />
            </button>

            {/* Content Wrapper */}
            <div className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'>
                {renderContent()}
            </div>
        </div>
    )
}

export default StoryViewer