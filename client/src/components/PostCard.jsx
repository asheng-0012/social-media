import React, { useState, useCallback } from 'react'
import { BadgeCheck, Heart, MessageCircle, Send, Share2, Trash2, X } from 'lucide-react'
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
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState([])
    const [commentsLoaded, setCommentsLoaded] = useState(false)
    const [commentInput, setCommentInput] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [warning, setWarning] = useState(null)      // { message, detectedBy }
    const [deletingComment, setDeletingComment] = useState(null)

    const currentUser = useSelector((state) => state.user.value)
    const { getToken } = useAuth()
    const navigate = useNavigate()

    const isOwner = currentUser?._id === post.user._id

    const fetchComments = useCallback(async () => {
        if (commentsLoaded) return
        try {
            const { data } = await api.get(`/api/post/${post._id}/comments`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                setComments(data.comments)
                setCommentsLoaded(true)
            }
        } catch (e) {
            console.error(e)
        }
    }, [post._id, getToken, commentsLoaded])

    const handleToggleComments = () => {
        if (!showComments) fetchComments()
        setShowComments(prev => !prev)
        setWarning(null)
    }

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

    const handleSubmitComment = async (e) => {
        e.preventDefault()
        if (!commentInput.trim()) return
        setWarning(null)
        setSubmitting(true)
        try {
            const { data } = await api.post(
                `/api/post/${post._id}/comments`,
                { content: commentInput.trim() },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            )
            if (data.success) {
                setComments(prev => [...prev, data.comment])
                setCommentInput('')
            } else if (data.flagged) {
                setWarning({ message: data.message, detectedBy: data.detectedBy })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        setDeletingComment(commentId)
        try {
            const { data } = await api.delete(`/api/post/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                setComments(prev => prev.filter(c => c._id !== commentId))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setDeletingComment(null)
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

                <div
                    onClick={handleToggleComments}
                    className={`flex items-center gap-1.5 cursor-pointer transition-colors duration-200 group ${showComments ? 'text-google-blue' : 'hover:text-google-blue'}`}
                >
                    <MessageCircle className={`w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-200 ${showComments ? 'fill-google-blue/20 text-google-blue' : ''}`} />
                    <span className='text-xs font-medium'>{comments.length || ''}</span>
                </div>

                <div className='flex items-center gap-1.5 cursor-pointer hover:text-google-green transition-colors duration-200 group'>
                    <Share2 className='w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-200' />
                </div>
            </div>

            {/* Comment Section */}
            {showComments && (
                <div className='border-t border-border-light pt-4 space-y-3'>

                    {/* AI Warning Banner */}
                    {warning && (
                        <div className='flex flex-col gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600'>
                            <div className='flex items-start gap-2'>
                                <span className='flex-1 leading-relaxed'>⚠️ {warning.message} Please keep the community respectful.</span>
                                <button onClick={() => setWarning(null)} className='text-red-400 hover:text-red-600 transition-colors mt-0.5 cursor-pointer flex-shrink-0'>
                                    <X className='w-4 h-4' />
                                </button>
                            </div>
                            <div className='flex items-center gap-1.5'>
                                {warning.detectedBy === 'gemini' ? (
                                    <span className='inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full'>
                                        🤖 Detected by Gemini AI
                                    </span>
                                ) : (
                                    <span className='inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full'>
                                        🛡️ Content Filter
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className='space-y-3 max-h-64 overflow-y-auto no-scrollbar'>
                        {comments.length === 0 ? (
                            <p className='text-text-tertiary text-xs text-center py-2'>No comments yet. Be the first!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment._id} className='flex items-start gap-3 group'>
                                    <img
                                        src={comment.user.profile_picture}
                                        alt=''
                                        className='w-8 h-8 rounded-full object-cover ring-1 ring-border-light flex-shrink-0'
                                    />
                                    <div className='flex-1 bg-surface-hover rounded-xl px-3 py-2'>
                                        <div className='flex items-center justify-between gap-2'>
                                            <div className='flex items-center gap-1.5'>
                                                <span className='text-xs font-semibold text-text-primary'>
                                                    {comment.user.full_name}
                                                </span>
                                                <span className='text-[10px] text-text-tertiary'>
                                                    {moment(comment.createdAt).fromNow()}
                                                </span>
                                            </div>
                                            {comment.user._id === currentUser._id && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    disabled={deletingComment === comment._id}
                                                    className='opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-500 transition-all duration-200 cursor-pointer disabled:opacity-30'
                                                >
                                                    <Trash2 className='w-3 h-3' />
                                                </button>
                                            )}
                                        </div>
                                        <p className='text-sm text-text-secondary mt-0.5 leading-relaxed'>
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Comment Input */}
                    <form onSubmit={handleSubmitComment} className='flex items-center gap-2 mt-2'>
                        <img
                            src={currentUser.profile_picture}
                            alt=''
                            className='w-8 h-8 rounded-full object-cover ring-1 ring-border-light flex-shrink-0'
                        />
                        <div className='flex-1 flex items-center gap-2 bg-surface-hover rounded-full px-4 py-2 border border-border-light focus-within:border-google-blue/40 focus-within:bg-white transition-all duration-200'>
                            <input
                                type='text'
                                value={commentInput}
                                onChange={(e) => { setCommentInput(e.target.value); setWarning(null) }}
                                placeholder='Write a comment…'
                                className='flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none'
                            />
                            <button
                                type='submit'
                                disabled={submitting || !commentInput.trim()}
                                className='text-google-blue disabled:text-text-tertiary transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed'
                            >
                                <Send className={`w-4 h-4 ${submitting ? 'animate-pulse' : ''}`} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default PostCard
