import React from 'react'
import { MapPin, MessageCircle, Plus, UserPlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { fetchUser } from '../features/user/userSlice'

const UserCard = ({ user }) => {
    const currentUser = useSelector((state) => state.user.value)
    const { getToken } = useAuth()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleFollow = async () => {
        try {
            const { data } = await api.post(
                '/api/user/follow',
                { id: user._id },
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            )
            if (data.success) {
                toast.success(data.message)
                dispatch(fetchUser(await getToken()))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleConnectionRequest = async () => {
        if (currentUser.connections.includes(user._id)) {
            return navigate('/messages/' + user._id)
        }

        try {
            const { data } = await api.post(
                '/api/user/connect',
                { id: user._id },
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            )
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const isFollowing = currentUser?.following.includes(user._id)
    const isConnected = currentUser?.connections.includes(user._id)

    return (
        <div
            key={user._id}
            className='p-5 pt-7 flex flex-col justify-between w-72 bg-white border border-border-light rounded-2xl hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200'
        >
            <div className='text-center'>
                <img
                    src={user.profile_picture}
                    alt=''
                    className='rounded-full w-16 h-16 ring-2 ring-border-light mx-auto object-cover'
                />
                <p className='mt-4 font-medium text-text-primary'>
                    {user.full_name}
                </p>
                {user.username && (
                    <p className='text-text-tertiary text-sm'>
                        @{user.username}
                    </p>
                )}
                {user.bio && (
                    <p className='text-text-secondary mt-2 text-center text-sm px-2 leading-relaxed'>
                        {user.bio}
                    </p>
                )}
            </div>

            <div className='flex items-center justify-center gap-2 mt-4 text-xs text-text-secondary'>
                <div className='flex items-center gap-1 border border-border-light rounded-full px-3 py-1.5 bg-surface-hover'>
                    <MapPin className='w-3.5 h-3.5 text-text-tertiary' />{' '}
                    {user.location}
                </div>
                <div className='flex items-center gap-1 border border-border-light rounded-full px-3 py-1.5 bg-surface-hover'>
                    <span className='font-medium text-text-primary'>
                        {user?.followers?.length || 0}
                    </span>{' '}
                    Followers
                </div>
            </div>

            <div className='flex mt-5 gap-2'>
                {/* Follow Button */}
                <button
                    onClick={handleFollow}
                    disabled={isFollowing}
                    className={`w-full py-2.5 rounded-full flex justify-center items-center gap-2 text-sm font-medium active:scale-[0.97] transition-all duration-200 cursor-pointer ${
                        isFollowing
                            ? 'bg-surface-active text-google-blue border border-google-blue/20'
                            : 'bg-google-blue hover:bg-google-blue/90 hover:shadow-lg hover:shadow-google-blue/25 text-white'
                    }`}
                >
                    <UserPlus className='w-4 h-4' />
                    {isFollowing ? 'Following' : 'Follow'}
                </button>

                {/* Connection Request / Message Button */}
                <button
                    onClick={handleConnectionRequest}
                    className={`flex items-center justify-center w-14 rounded-full cursor-pointer active:scale-[0.97] transition-all duration-200 ${
                        isConnected
                            ? 'bg-google-green/10 text-google-green hover:bg-google-green/20'
                            : 'bg-surface-hover text-text-tertiary hover:bg-border hover:text-text-secondary border border-border-light'
                    }`}
                >
                    {isConnected ? (
                        <MessageCircle className='w-[18px] h-[18px]' />
                    ) : (
                        <Plus className='w-5 h-5' />
                    )}
                </button>
            </div>
        </div>
    )
}

export default UserCard