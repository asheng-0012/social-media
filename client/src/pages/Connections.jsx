import React, { useEffect, useState } from 'react'
import {
    Users,
    UserPlus,
    UserCheck,
    UserRoundPen,
    MessageSquare,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import { fetchConnections } from '../features/connections/connectionsSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Connections = () => {
    const [currentTab, setCurrentTab] = useState('Followers')

    const navigate = useNavigate()
    const { getToken } = useAuth()
    const dispatch = useDispatch()

    const { connections, pendingConnections, followers, following } =
        useSelector((state) => state.connections)

    const dataArray = [
        { label: 'Followers', value: followers || [], icon: Users },
        { label: 'Following', value: following || [], icon: UserCheck },
        { label: 'Pending', value: pendingConnections || [], icon: UserRoundPen },
        { label: 'Connections', value: connections || [], icon: UserPlus },
    ]

    const handleUnfollow = async (userId) => {
        try {
            const { data } = await api.post(
                '/api/user/unfollow',
                { id: userId },
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            )
            if (data.success) {
                toast.success(data.message)
                dispatch(fetchConnections(await getToken()))
            } else {
                toast(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const acceptConnection = async (userId) => {
        try {
            const { data } = await api.post(
                '/api/user/accept',
                { id: userId },
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            )
            if (data.success) {
                toast.success(data.message)
                dispatch(fetchConnections(await getToken()))
            } else {
                toast(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getToken().then((token) => {
            dispatch(fetchConnections(token))
        })
    }, [])

    return (
        <div className='min-h-screen bg-surface-hover'>
            <div className='max-w-5xl mx-auto p-6 py-8'>
                {/* Title */}
                <div className='mb-8'>
                    <h1 className='text-2xl font-semibold text-text-primary mb-1'>
                        Connections
                    </h1>
                    <p className='text-text-tertiary text-sm'>
                        Manage your network and discover new connections
                    </p>
                </div>

                {/* Counts */}
                <div className='mb-8 flex flex-wrap gap-3'>
                    {dataArray.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => setCurrentTab(item.label)}
                            className={`flex flex-col items-center justify-center gap-0.5 h-20 w-40 rounded-2xl border cursor-pointer transition-all duration-200 ${
                                currentTab === item.label
                                    ? 'bg-google-blue/5 border-google-blue/20 shadow-sm'
                                    : 'bg-white border-border-light hover:shadow-sm'
                            }`}
                        >
                            <b
                                className={`text-lg ${
                                    currentTab === item.label
                                        ? 'text-google-blue'
                                        : 'text-text-primary'
                                }`}
                            >
                                {item.value.length}
                            </b>
                            <p className='text-text-tertiary text-sm'>
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className='inline-flex flex-wrap items-center border border-border-light rounded-full p-1 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
                    {dataArray.map((tab) => (
                        <button
                            onClick={() => setCurrentTab(tab.label)}
                            key={tab.label}
                            className={`cursor-pointer flex items-center px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                                currentTab === tab.label
                                    ? 'bg-google-blue text-white font-medium shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                            }`}
                        >
                            <tab.icon className='w-4 h-4' />
                            <span className='ml-1.5'>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Connection Cards */}
                <div className='flex flex-wrap gap-4 mt-6'>
                    {dataArray
                        .find((item) => item.label === currentTab)
                        ?.value?.map((user) => user && (
                            <div
                                key={user._id}
                                className='w-full max-w-sm flex gap-4 p-5 bg-white rounded-2xl border border-border-light hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200'
                            >
                                <img
                                    src={user.profile_picture}
                                    alt=''
                                    className='rounded-full w-12 h-12 ring-2 ring-border-light'
                                />
                                <div className='flex-1 min-w-0'>
                                    <p className='font-medium text-text-primary'>
                                        {user.full_name}
                                    </p>
                                    <p className='text-text-tertiary text-sm'>
                                        @{user.username}
                                    </p>
                                    <p className='text-sm text-text-secondary mt-0.5 truncate'>
                                        {user.bio ? `${user.bio.slice(0, 30)}...` : 'No bio available'}
                                    </p>
                                    <div className='flex max-sm:flex-col gap-2 mt-4'>
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/profile/${user._id}`
                                                )
                                            }
                                            className='w-full py-2 text-sm rounded-full bg-google-blue hover:bg-google-blue/90 hover:shadow-md active:scale-[0.97] transition-all duration-200 text-white cursor-pointer font-medium'
                                        >
                                            View Profile
                                        </button>

                                        {currentTab === 'Following' && (
                                            <button
                                                onClick={() =>
                                                    handleUnfollow(user._id)
                                                }
                                                className='w-full py-2 text-sm rounded-full border border-border hover:bg-surface-hover text-text-secondary active:scale-[0.97] transition-all duration-200 cursor-pointer font-medium'
                                            >
                                                Unfollow
                                            </button>
                                        )}

                                        {currentTab === 'Pending' && (
                                            <button
                                                onClick={() =>
                                                    acceptConnection(user._id)
                                                }
                                                className='w-full py-2 text-sm rounded-full bg-google-green hover:bg-google-green/90 text-white active:scale-[0.97] transition-all duration-200 cursor-pointer font-medium'
                                            >
                                                Accept
                                            </button>
                                        )}

                                        {currentTab === 'Connections' && (
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/messages/${user._id}`
                                                    )
                                                }
                                                className='w-full py-2 text-sm rounded-full border border-border hover:bg-surface-hover text-text-secondary active:scale-[0.97] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 font-medium'
                                            >
                                                <MessageSquare className='w-3.5 h-3.5' />
                                                Message
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}

export default Connections