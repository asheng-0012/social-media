import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useUser, useClerk } from '@clerk/clerk-react'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'

const Layout = () => {
    const { value: user, loading } = useSelector((state) => state.user)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { isLoaded, isSignedIn } = useUser()
    const { signOut } = useClerk()

    if (isLoaded && isSignedIn && user === null && !loading) {
        return (
            <div className='flex flex-col items-center justify-center h-screen bg-surface-hover p-4 text-center'>
                <div className='bg-white rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] p-10 max-w-md'>
                    <div className='w-14 h-14 bg-google-red/10 rounded-full flex items-center justify-center mx-auto mb-5'>
                        <X className='w-7 h-7 text-google-red' />
                    </div>
                    <h1 className='text-xl font-semibold text-text-primary mb-2'>Account Not Found</h1>
                    <p className='text-text-secondary text-sm mb-8 leading-relaxed'>
                        Your account may have been deleted or doesn't exist in our database.
                    </p>
                    <button
                        onClick={() => signOut()}
                        className='px-8 py-2.5 bg-google-blue text-white rounded-full hover:bg-google-blue/90 hover:shadow-lg hover:shadow-google-blue/25 transition-all duration-200 text-sm font-medium cursor-pointer'
                    >
                        Sign Out & Return Home
                    </button>
                </div>
            </div>
        )
    }

    return user ? (
        <div className='w-full flex h-screen bg-white'>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className='flex-1 bg-surface-hover overflow-auto'>
                <Outlet />
            </div>

            {sidebarOpen ? (
                <X
                    className='absolute top-4 right-4 p-2 z-100 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-10 h-10 text-text-secondary sm:hidden cursor-pointer hover:bg-surface-hover transition-colors duration-200'
                    onClick={() => setSidebarOpen(false)}
                />
            ) : (
                <Menu
                    className='absolute top-4 right-4 p-2 z-100 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-10 h-10 text-text-secondary sm:hidden cursor-pointer hover:bg-surface-hover transition-colors duration-200'
                    onClick={() => setSidebarOpen(true)}
                />
            )}
        </div>
    ) : (
        <Loading />
    )
}

export default Layout