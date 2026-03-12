import React from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Notification = ({ t, message }) => {
    const navigate = useNavigate()

    return (
        <div
            className={`max-w-md w-full bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl flex border border-border-light overflow-hidden hover:shadow-[0_6px_28px_rgba(0,0,0,0.15)] transition-all duration-200 ${
                t.visible ? 'animate-enter' : 'animate-leave'
            }`}
        >
            <div className='flex-1 p-4'>
                <div className='flex items-start gap-3'>
                    <img
                        src={message.from_user_id.profile_picture}
                        alt=''
                        className='h-10 w-10 rounded-full flex-shrink-0 ring-2 ring-border-light'
                    />
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-text-primary'>
                            {message.from_user_id.full_name}
                        </p>
                        <p className='text-sm text-text-tertiary truncate'>
                            {message.text.slice(0, 50)}
                        </p>
                    </div>
                </div>
            </div>
            <div className='flex border-l border-border-light'>
                <button
                    onClick={() => {
                        navigate(`/messages/${message.from_user_id._id}`)
                        toast.dismiss(t.id)
                    }}
                    className='px-5 text-google-blue text-sm font-semibold hover:bg-google-blue/5 transition-colors duration-200 cursor-pointer'
                >
                    Reply
                </button>
            </div>
        </div>
    )
}

export default Notification