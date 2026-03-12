import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const StoryModal = ({ setShowModal, fetchStories }) => {
    const bgColors = [
        '#4285F4',
        '#EA4335',
        '#FBBC05',
        '#34A853',
        '#5F6368',
        '#202124',
    ]

    const [mode, setMode] = useState('text')
    const [background, setBackground] = useState(bgColors[0])
    const [text, setText] = useState('')
    const [media, setMedia] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)

    const { getToken } = useAuth()

    const MAX_VIDEO_DURATION = 60
    const MAX_VIDEO_SIZE_MB = 50

    const handleMediaUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type.startsWith('video')) {
                if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
                    toast.error(
                        `Video file size cannot exceed ${MAX_VIDEO_SIZE_MB}MB.`
                    )
                    setMedia(null)
                    setPreviewUrl(null)
                    return
                }
                const video = document.createElement('video')
                video.preload = 'metadata'
                video.onloadedmetadata = () => {
                    window.URL.revokeObjectURL(video.src)
                    if (video.duration > MAX_VIDEO_DURATION) {
                        toast.error('Video duration cannot exceed 1 minute.')
                        setMedia(null)
                        setPreviewUrl(null)
                    } else {
                        setMedia(file)
                        setPreviewUrl(URL.createObjectURL(file))
                        setText('')
                        setMode('media')
                    }
                }
                video.src = URL.createObjectURL(file)
            } else if (file.type.startsWith('image')) {
                setMedia(file)
                setPreviewUrl(URL.createObjectURL(file))
                setText('')
                setMode('media')
            }
        }
    }

    const handleCreateStory = async () => {
        const media_type =
            mode === 'media'
                ? media?.type.startsWith('image')
                    ? 'image'
                    : 'video'
                : 'text'

        if (media_type === 'text' && !text) {
            throw new Error('Please enter some text')
        }

        let formData = new FormData()
        formData.append('content', text)
        formData.append('media_type', media_type)
        formData.append('media', media)
        formData.append('background_color', background)

        const token = await getToken()
        try {
            const { data } = await api.post('/api/story/create', formData, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (data.success) {
                setShowModal(false)
                toast.success('Story created successfully')
                fetchStories()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur-md text-white flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                {/* Header */}
                <div className='text-center mb-5 flex items-center justify-between'>
                    <button
                        onClick={() => setShowModal(false)}
                        className='text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer'
                    >
                        <ArrowLeft className='w-5 h-5' />
                    </button>
                    <h2 className='text-lg font-semibold'>Create Story</h2>
                    <span className='w-10'></span>
                </div>

                {/* Preview Area */}
                <div
                    className='rounded-2xl h-96 flex items-center justify-center relative overflow-hidden'
                    style={{ backgroundColor: background }}
                >
                    {mode === 'text' && (
                        <textarea
                            className='bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none placeholder:text-white/40'
                            placeholder="What's on your mind?"
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                        />
                    )}
                    {mode === 'media' &&
                        previewUrl &&
                        (media?.type.startsWith('image') ? (
                            <img
                                src={previewUrl}
                                alt=''
                                className='object-contain max-h-full rounded-xl'
                            />
                        ) : (
                            <video
                                src={previewUrl}
                                className='object-contain max-h-full rounded-xl'
                            />
                        ))}
                </div>

                {/* Color Picker */}
                <div className='flex mt-4 gap-2.5'>
                    {bgColors.map((color) => (
                        <button
                            key={color}
                            className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-200 ${
                                background === color
                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                                    : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setBackground(color)}
                        />
                    ))}
                </div>

                {/* Mode Toggle */}
                <div className='flex gap-2.5 mt-4'>
                    <button
                        onClick={() => {
                            setMode('text')
                            setMedia(null)
                            setPreviewUrl(null)
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 ${
                            mode === 'text'
                                ? 'bg-white text-text-primary'
                                : 'bg-white/10 hover:bg-white/15 text-white/80'
                        }`}
                    >
                        <TextIcon size={18} /> Text
                    </button>
                    <label
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 ${
                            mode === 'media'
                                ? 'bg-white text-text-primary'
                                : 'bg-white/10 hover:bg-white/15 text-white/80'
                        }`}
                    >
                        <input
                            onChange={handleMediaUpload}
                            type='file'
                            accept='image/*, video/*'
                            className='hidden'
                        />
                        <Upload size={18} /> Photo/Video
                    </label>
                </div>

                {/* Create Button */}
                <button
                    onClick={() =>
                        toast.promise(handleCreateStory(), {
                            loading: 'Saving...',
                        })
                    }
                    className='flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded-full bg-google-blue hover:bg-google-blue/90 hover:shadow-lg hover:shadow-google-blue/30 active:scale-[0.97] transition-all duration-200 cursor-pointer text-sm font-medium'
                >
                    <Sparkle size={18} /> Create Story
                </button>
            </div>
        </div>
    )
}

export default StoryModal