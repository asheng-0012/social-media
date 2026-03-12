import React, { useState } from 'react'
import { BadgeCheck, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const PostCard = ({ post, onDelete }) => {
    const postWithHashtags = post.content.replace(
        /(#\w+)/g,
        '<span class="text-google-blue font-medium">$1</span>'
    )
    const [likes, setLikes] = useState(post.likes_count)
    const [deleting, setDeleting] = useState(false)
    const currentUser = useSelector((state) => state.user.value)
    const { getToken } = useAuth()

    const isOwner = currentUser?._id === post.user._id

    const handleLike = async () => {
        try {
            const { data } = await api.post(
                `/api/post/like`,
                { postId: post._id },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            )

            if (data.success) {
                toast.success(data.message)
                setLikes((prev) => {
                    if (prev.includes(currentUser._id)) {
                        return prev.filter((id) => id !== currentUser._id)
                    } else {
                        return [...prev, currentUser._id]
                    }
                })
            } else {
                toast(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Delete this post? This cannot be undone.')) return
        setDeleting(true)
        try {
            const { data } = await api.delete(
                `/api/post/${post._id}`,
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            )
            if (data.success) {
                toast.success('Post deleted.')
                onDelete && onDelete(post._id)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setDeleting(false)
        }
    }

    const navigate = useNavigate()

    return (
        <div className='bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] border border-border-light p-5 space-y-4 w-full max-w-2xl hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200'>
            {/* User Info */}
            <div className='flex items-center justify-between'>
                <div
                    onClick={() => navigate('/profile/' + post.user._id)}
                    className='inline-flex items-center gap-3 cursor-pointer group'
                >
                    <img
                        src={post.user.profile_picture}
                        alt=''
                        className='w-10 h-10 rounded-full ring-2 ring-border-light'
                    />
                    <div>
                        <div className='flex items-center gap-1'>
                            <span className='font-medium text-text-primary group-hover:text-google-blue transition-colors duration-200'>
                                {post.user.full_name}
                            </span>
                            <BadgeCheck className='w-4 h-4 text-google-blue' />
                        </div>
                        <div className='text-text-tertiary text-sm'>
                            @{post.user.username} •{' '}
                            {moment(post.createdAt).fromNow()}
                        </div>
                    </div>
                </div>

                {/* Delete button — only for own posts */}
                {isOwner && onDelete && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        title='Delete post'
                        className='p-2 rounded-full text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors duration-200 cursor-pointer disabled:opacity-50'
                    >
                        <Trash2 className='w-4 h-4' />
                    </button>
                )}
            </div>

            {/* Content */}
            {post.content && (
                <div
                    className='text-text-primary text-sm leading-relaxed whitespace-pre-line'
                    dangerouslySetInnerHTML={{ __html: postWithHashtags }}
                />
            )}

            {/* Images */}
            <div className='grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden'>
                {post.image_urls.map((img, index) => (
                    <img
                        src={img}
                        key={index}
                        className={`w-full h-48 object-cover hover:opacity-90 transition-opacity duration-200 ${
                            post.image_urls.length === 1 && 'col-span-2 h-auto'
                        }`}
                        alt=''
                    />
                ))}
            </div>

            {/* Actions */}
            <div className='flex items-center gap-6 text-text-secondary text-sm pt-3 border-t border-border-light'>
                <div
                    onClick={handleLike}
                    className='flex items-center gap-1.5 cursor-pointer hover:text-google-red transition-colors duration-200 group'
                >
                    <Heart
                        className={`w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-200 ${
                            likes.includes(currentUser._id) &&
                            'text-google-red fill-google-red'
                        }`}
                    />
                    <span className='text-xs font-medium'>{likes.length}</span>
                </div>
                <div className='flex items-center gap-1.5 cursor-pointer hover:text-google-blue transition-colors duration-200 group'>
                    <MessageCircle className='w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-200' />
                    <span className='text-xs font-medium'>{12}</span>
                </div>
                <div className='flex items-center gap-1.5 cursor-pointer hover:text-google-green transition-colors duration-200 group'>
                    <Share2 className='w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-200' />
                    <span className='text-xs font-medium'>{7}</span>
                </div>
            </div>
        </div>
    )
}

export default PostCard