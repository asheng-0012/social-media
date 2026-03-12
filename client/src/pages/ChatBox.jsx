import React, { useEffect, useRef, useState } from 'react'
import { ImageIcon, SendHorizonal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import {
    addMessage,
    fetchMessages,
    resetMessages,
} from '../features/messages/messagesSlice'
import toast from 'react-hot-toast'

const ChatBox = () => {
    const { messages } = useSelector((state) => state.messages)
    const { userId } = useParams()
    const { getToken } = useAuth()
    const dispatch = useDispatch()

    const [text, setText] = useState('')
    const [image, setImage] = useState(null)
    const [user, setUser] = useState(null)
    const messagesEndRef = useRef(null)

    const connections = useSelector(
        (state) => state.connections.connections
    )

    const fetchUserMessages = async () => {
        try {
            const token = await getToken()
            dispatch(fetchMessages({ token, userId }))
        } catch (error) {
            toast.error(error.message)
        }
    }

    const sendMessage = async () => {
        try {
            if (!text && !image) return

            const token = await getToken()
            const formData = new FormData()
            formData.append('to_user_id', userId)
            formData.append('text', text)
            image && formData.append('image', image)

            const { data } = await api.post('/api/message/send', formData, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (data.success) {
                setText('')
                setImage(null)
                dispatch(addMessage(data.message))
            } else {
                throw new Error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchUserMessages()
        return () => {
            dispatch(resetMessages())
        }
    }, [userId])

    useEffect(() => {
        if (connections.length > 0) {
            const user = connections.find(
                (connection) => connection._id === userId
            )
            setUser(user)
        }
    }, [connections, userId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        user && (
            <div className='flex flex-col h-screen bg-surface-hover'>
                {/* Chat Header */}
                <div className='flex items-center gap-3 px-5 py-3 md:px-10 bg-white border-b border-border-light'>
                    <img
                        src={user.profile_picture}
                        alt=''
                        className='size-9 rounded-full ring-2 ring-border-light'
                    />
                    <div>
                        <p className='font-medium text-text-primary text-sm'>
                            {user.full_name}
                        </p>
                        <p className='text-xs text-text-tertiary'>
                            @{user.username}
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className='flex-1 p-5 md:px-10 overflow-y-scroll no-scrollbar'>
                    <div className='space-y-3 max-w-4xl mx-auto'>
                        {messages
                            .toSorted(
                                (a, b) =>
                                    new Date(a.createdAt) -
                                    new Date(b.createdAt)
                            )
                            .map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-col ${
                                        message.to_user_id !== user._id
                                            ? 'items-start'
                                            : 'items-end'
                                    }`}
                                >
                                    <div
                                        className={`py-2 px-3.5 text-sm max-w-sm rounded-2xl ${
                                            message.to_user_id !== user._id
                                                ? 'bg-white text-text-primary border border-border-light rounded-bl-sm'
                                                : 'bg-google-blue text-white rounded-br-sm'
                                        }`}
                                    >
                                        {message.message_type === 'image' && (
                                            <img
                                                src={message.media_url}
                                                className='w-full max-w-sm rounded-xl mb-1.5'
                                                alt=''
                                            />
                                        )}
                                        <p>{message.text}</p>
                                    </div>
                                </div>
                            ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className='px-4 pb-5 bg-surface-hover'>
                    <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-border rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus-within:border-google-blue focus-within:shadow-[0_0_0_2px_rgba(66,133,244,0.15)] transition-all duration-200'>
                        <input
                            type='text'
                            className='flex-1 outline-none text-text-primary text-sm placeholder:text-text-tertiary'
                            placeholder='Type a message...'
                            onKeyDown={(e) =>
                                e.key === 'Enter' && sendMessage()
                            }
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                        />

                        <label htmlFor='image' className='cursor-pointer'>
                            {image ? (
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt=''
                                    className='h-8 rounded-lg'
                                />
                            ) : (
                                <ImageIcon className='size-6 text-text-tertiary hover:text-text-secondary transition-colors duration-200' />
                            )}
                            <input
                                type='file'
                                id='image'
                                accept='image/*'
                                hidden
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                        </label>

                        <button
                            onClick={sendMessage}
                            className='bg-google-blue hover:bg-google-blue/90 hover:shadow-md active:scale-95 cursor-pointer text-white p-2.5 rounded-full transition-all duration-200'
                        >
                            <SendHorizonal size={16} />
                        </button>
                    </div>
                </div>
            </div>
        )
    )
}

export default ChatBox