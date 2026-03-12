import React, { useState } from 'react'
import { Image, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

const CreatePost = () => {
    const navigate = useNavigate()
    const [content, setContent] = useState('')
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)

    const user = useSelector((state) => state.user.value)
    const { getToken } = useAuth()

    const handleSubmit = async () => {
        if (!images.length && !content) {
            return toast.error('Please add at least one image or text')
        }
        setLoading(true)

        const postType =
            images.length && content
                ? 'text_with_image'
                : images.length
                ? 'image'
                : 'text'

        try {
            const formData = new FormData()
            formData.append('content', content)
            formData.append('post_type', postType)
            images.map((image) => {
                formData.append('images', image)
            })

            const { data } = await api.post('/api/post/add', formData, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
            })

            if (data.success) {
                navigate('/')
            } else {
                console.log(data.message)
                throw new Error(data.message)
            }
        } catch (error) {
            console.log(error.message)
            throw new Error(error.message)
        }
        setLoading(false)
    }

    return (
        <div className='min-h-screen bg-surface-hover'>
            <div className='max-w-3xl mx-auto p-6 py-8'>
                {/* Title */}
                <div className='mb-8'>
                    <h1 className='text-2xl font-semibold text-text-primary mb-1'>
                        Create Post
                    </h1>
                    <p className='text-text-tertiary text-sm'>
                        Share your thoughts with the world
                    </p>
                </div>

                {/* Form */}
                <div className='max-w-xl bg-white p-5 sm:p-8 sm:pb-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] border border-border-light space-y-4'>
                    {/* Header */}
                    <div className='flex items-center gap-3'>
                        <img
                            src={user.profile_picture}
                            alt=''
                            className='w-11 h-11 rounded-full ring-2 ring-border-light'
                        />
                        <div>
                            <h2 className='font-medium text-text-primary'>
                                {user.full_name}
                            </h2>
                            <p className='text-sm text-text-tertiary'>
                                @{user.username}
                            </p>
                        </div>
                    </div>

                    {/* Text Area */}
                    <textarea
                        className='w-full resize-none max-h-28 mt-4 text-sm text-text-primary outline-none placeholder:text-text-tertiary leading-relaxed'
                        placeholder="What's happening?"
                        onChange={(e) => setContent(e.target.value)}
                        value={content}
                    />

                    {/* Images */}
                    {images.length > 0 && (
                        <div className='flex flex-wrap gap-2 mt-4'>
                            {images.map((image, i) => (
                                <div key={i} className='relative group'>
                                    <img
                                        src={URL.createObjectURL(image)}
                                        className='h-20 rounded-xl object-cover'
                                        alt=''
                                    />
                                    <div
                                        onClick={() =>
                                            setImages(
                                                images.filter(
                                                    (_, index) => index !== i
                                                )
                                            )
                                        }
                                        className='absolute hidden group-hover:flex justify-center items-center inset-0 bg-black/40 rounded-xl cursor-pointer transition-all duration-200'
                                    >
                                        <X className='w-5 h-5 text-white' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Bottom Bar */}
                    <div className='flex items-center justify-between pt-4 border-t border-border-light'>
                        <label
                            htmlFor='images'
                            className='flex items-center gap-2 text-text-tertiary hover:text-google-blue transition-colors duration-200 cursor-pointer p-2 rounded-full hover:bg-google-blue/5'
                        >
                            <Image className='size-5' />
                        </label>

                        <input
                            type='file'
                            id='images'
                            accept='image/*'
                            hidden
                            multiple
                            onChange={(e) =>
                                setImages([...images, ...e.target.files])
                            }
                        />

                        <button
                            disabled={loading}
                            onClick={() =>
                                toast.promise(handleSubmit(), {
                                    loading: 'Uploading...',
                                    success: <p>Post Added</p>,
                                    error: <p>Post Not Added</p>,
                                })
                            }
                            className='text-sm bg-google-blue hover:bg-google-blue/90 hover:shadow-lg hover:shadow-google-blue/25 active:scale-[0.97] transition-all duration-200 text-white font-medium px-8 py-2.5 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Publish Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreatePost