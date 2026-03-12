import React from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut } from 'lucide-react'
import { UserButton, useClerk } from '@clerk/clerk-react'
import { useSelector } from 'react-redux'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate()
    const user = useSelector((state) => state.user.value)
    const { signOut } = useClerk()

    return (
        <div className={`w-64 xl:w-72 bg-white flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 border-r border-border-light ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
            
            <div className='w-full'>
                <div className='px-7 py-5'>
                    <img
                        onClick={() => navigate('/')}
                        src={assets.logo}
                        className='w-26 cursor-pointer'
                        alt=""
                    />
                </div>
                <hr className='border-border-light' />

                <div className='mt-6'>
                    <MenuItems setSidebarOpen={setSidebarOpen} />
                </div>

                <Link
                    to='/create-post'
                    className='flex items-center justify-center gap-2.5 py-2.5 mt-8 mx-6 rounded-full bg-google-blue hover:bg-google-blue/90 hover:shadow-lg hover:shadow-google-blue/25 active:scale-[0.97] transition-all duration-200 text-white text-sm font-medium cursor-pointer'
                >
                    <CirclePlus className='w-[18px] h-[18px]' />
                    Create Post
                </Link>
            </div>

            <div className='w-full border-t border-border-light p-4 px-6 flex items-center justify-between'>
                <div className='flex gap-3 items-center cursor-pointer'>
                    <UserButton />
                    <div>
                        <h1 className='text-sm font-medium text-text-primary'>{user.full_name}</h1>
                        <p className='text-xs text-text-tertiary'>@{user.username}</p>
                    </div>
                </div>
                <LogOut
                    onClick={signOut}
                    className='w-[18px] text-text-tertiary hover:text-google-red transition-colors duration-200 cursor-pointer'
                />
            </div>
        </div>
    )
}

export default Sidebar