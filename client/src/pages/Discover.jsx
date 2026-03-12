import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import UserCard from '../components/UserCard'
import Loading from '../components/Loading'
import api from '../api/axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { fetchUser } from '../features/user/userSlice'

const Discover = () => {
    const dispatch = useDispatch()
    const [input, setInput] = useState('')
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const { getToken } = useAuth()

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            try {
                setUsers([])
                setLoading(true)
                const { data } = await api.post(
                    '/api/user/discover',
                    { input },
                    {
                        headers: {
                            Authorization: `Bearer ${await getToken()}`,
                        },
                    }
                )
                data.success
                    ? setUsers(data.users)
                    : toast.error(data.message)
                setLoading(false)
                setInput('')
            } catch (error) {
                toast.error(error.message)
            }
            setLoading(false)
        }
    }

    useEffect(() => {
        getToken().then((token) => {
            dispatch(fetchUser(token))
        })
    }, [])

    return (
        <div className='min-h-screen bg-surface-hover'>
            <div className='max-w-5xl mx-auto p-6 py-8'>
                {/* Title */}
                <div className='mb-8'>
                    <h1 className='text-2xl font-semibold text-text-primary mb-1'>
                        Discover People
                    </h1>
                    <p className='text-text-tertiary text-sm'>
                        Connect with amazing people and grow your network
                    </p>
                </div>

                {/* Search */}
                <div className='mb-8'>
                    <div className='relative max-w-2xl'>
                        <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-text-tertiary w-5 h-5' />
                        <input
                            type='text'
                            placeholder='Search people by name, username, bio, or location...'
                            className='pl-12 pr-5 py-3 w-full bg-white border border-border rounded-full text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200'
                            onChange={(e) => setInput(e.target.value)}
                            value={input}
                            onKeyUp={handleSearch}
                        />
                    </div>
                </div>

                {/* Results */}
                <div className='flex flex-wrap gap-4'>
                    {users.map((user) => (
                        <UserCard user={user} key={user._id} />
                    ))}
                </div>

                {loading && <Loading height='60vh' />}
            </div>
        </div>
    )
}

export default Discover