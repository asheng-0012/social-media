import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { useAuth, useUser } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const RecentMessages = () => {
    const [messages, setMessages] = useState([])
    const { user } = useUser()
    const { getToken } = useAuth()

    const fetchRecentMessages = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get('/api/user/recent-messages', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (data.success) {
                const groupedMessages = data.messages.reduce((acc, message) => {
                    const senderId = message.from_user_id._id
                    if (
                        !acc[senderId] ||
                        new Date(message.createdAt) >
                            new Date(acc[senderId].createdAt)
                    ) {
                        acc[senderId] = message
                    }
                    return acc
                }, {})

                const sortedMessages = Object.values(groupedMessages).sort(
                    (a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                )

                setMessages(sortedMessages)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (user) {
            fetchRecentMessages()
            const interval = setInterval(fetchRecentMessages, 30000)
            return () => clearInterval(interval)
        }
    }, [user])

    return (
        <div className='bg-white max-w-xs mt-4 p-5 min-h-20 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] border border-border-light text-xs text-text-primary'>
            <h3 className='font-semibold text-sm text-text-primary mb-4'>
                Recent Messages
            </h3>
            <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
                {messages.map((message, index) => (
                    <Link
                        to={`/messages/${message.from_user_id._id}`}
                        key={index}
                        className='flex items-start gap-3 py-2.5 px-2 rounded-xl hover:bg-surface-hover transition-colors duration-200'
                    >
                        <img
                            src={message.from_user_id.profile_picture}
                            alt=''
                            className='w-8 h-8 rounded-full ring-2 ring-border-light'
                        />
                        <div className='w-full min-w-0'>
                            <div className='flex justify-between items-center'>
                                <p className='font-medium text-text-primary'>
                                    {message.from_user_id.full_name}
                                </p>
                                <p className='text-[10px] text-text-tertiary'>
                                    {moment(message.createdAt).fromNow()}
                                </p>
                            </div>
                            <div className='flex justify-between items-center mt-0.5'>
                                <p className='text-text-tertiary truncate pr-2'>
                                    {message.text ? message.text : 'Media'}
                                </p>
                                {!message.seen && (
                                    <span className='bg-google-blue text-white min-w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-medium'>
                                        1
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default RecentMessages