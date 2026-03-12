import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { dummyUserData } from '../assets/assets'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'

const Layout = () => {

    const user = useSelector((state)=>state.user.value)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { isLoaded, isSignedIn, user: clerkUser } = useUser()
    const { signOut } = useClerk()

    // If clerk is loaded but we have no user in Redux despite being signed in, 
    // it likely means the user was deleted from the database.
    if (isLoaded && isSignedIn && user === null) {
      return (
        <div className='flex flex-col items-center justify-center h-screen bg-slate-50 p-4 text-center'>
          <h1 className='text-xl font-bold text-gray-800 mb-2'>Account Not Found</h1>
          <p className='text-gray-600 mb-6'>Your account may have been deleted or doesn't exist in our database.</p>
          <button 
            onClick={() => signOut()}
            className='px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition'
          >
            Sign Out & Return Home
          </button>
        </div>
      )
    }

  return user ? (
    <div className='w-full flex h-screen'>

        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>

        <div className='flex-1 bg-slate-50'>
            <Outlet />
        </div>
      {
        sidebarOpen ? 
        <X className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={()=> setSidebarOpen(false)}/>
        : 
        <Menu className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={()=> setSidebarOpen(true)}/>
      }
    </div>
  ) : (
    <Loading />
  )
}

export default Layout
