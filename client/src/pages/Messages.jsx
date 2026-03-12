import React from 'react'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Messages = () => {
    const { connections } = useSelector((state) => state.connections)
    const navigate = useNavigate()

    return (
        <div className='min-h-screen relative bg-surface-hover'>
            <div className='max-w-3xl mx-auto p-6 py-8'>
                {/* Title */}
                <div className='mb-8'>
                    <h1 className='text-2xl font-semibold text-text-primary mb-1'>
                        Messages
                    </h1>
                    <p className='text-text-tertiary text-sm'>
                        Talk to your friends and family
                    </p>
                </div>

                {/* Connected Users */}
                <div className='flex flex-col gap-2.5'>
                    {connections.map((user) => (
                        <div
                            key={user._id}
                            className='flex items-center gap-4 p-4 bg-white rounded-2xl border border-border-light hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 group'
                        >
                            <img
                                src={user.profile_picture}
                                alt=''
                                className='rounded-full size-12 ring-2 ring-border-light'
                            />
                            <div className='flex-1 min-w-0'>
                                <p className='font-medium text-text-primary'>
                                    {user.full_name}
                                </p>
                                <p className='text-text-tertiary text-sm'>
                                    @{user.username}
                                </p>
                                <p className='text-sm text-text-secondary mt-0.5 truncate'>
                                    {user.bio}
                                </p>
                            </div>

                            <div className='flex gap-2'>
                                <button
                                    onClick={() =>
                                        navigate(`/messages/${user._id}`)
                                    }
                                    className='size-10 flex items-center justify-center rounded-full bg-google-blue/10 hover:bg-google-blue/20 text-google-blue active:scale-95 transition-all duration-200 cursor-pointer'
                                >
                                    <MessageSquare className='w-4 h-4' />
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(`/profile/${user._id}`)
                                    }
                                    className='size-10 flex items-center justify-center rounded-full bg-surface-hover hover:bg-border text-text-secondary active:scale-95 transition-all duration-200 cursor-pointer'
                                >
                                    <Eye className='w-4 h-4' />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Messages