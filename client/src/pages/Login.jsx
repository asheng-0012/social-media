import React from 'react'
import { assets } from '../assets/assets'
import { Star } from 'lucide-react'
import { SignIn } from '@clerk/clerk-react'

const Login = () => {
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      {/* Background Image */}
      <img
        src={assets.bgImage}
        alt=''
        className='absolute top-0 left-0 -z-1 w-full h-full object-cover'
      />

      {/* Left side: Branding */}
      <div className='flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40'>
        <img src={assets.logo} alt='' className='h-12 object-contain' />
        <div>
          <div className='flex items-center gap-3 mb-5 max-md:mt-10'>
            <img src={assets.group_users} alt='' className='h-8 md:h-10' />
            <div>
              <div className='flex'>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className='size-4 md:size-4.5 text-transparent fill-google-yellow'
                    />
                  ))}
              </div>
              <p className='text-text-secondary text-sm mt-0.5'>Developed by ashish</p>
            </div>
          </div>
          <h1 className='text-3xl md:text-6xl md:pb-2 font-bold text-text-primary leading-tight'>
            More than just friends{' '}
            <span className='bg-gradient-to-r from-google-blue to-google-blue/70 bg-clip-text text-transparent'>
              truly connect
            </span>
          </h1>
          <p className='text-lg md:text-2xl text-text-secondary max-w-72 md:max-w-md mt-3 leading-relaxed'>
            Connect with a global community on comigo.
          </p>
        </div>
        <span className='md:h-10'></span>
      </div>

      {/* Right side: Login Form */}
      <div className='flex-1 flex items-center justify-center p-6 sm:p-10'>
        <SignIn />
      </div>
    </div>
  )
}

export default Login