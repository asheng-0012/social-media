import { Calendar, MapPin, PenBox, Verified } from 'lucide-react'
import moment from 'moment'
import React from 'react'

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {
    return (
        <div className='relative py-5 px-6 md:px-8 bg-white'>
            <div className='flex flex-col md:flex-row items-start gap-6'>
                <div className='w-32 h-32 border-4 border-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] absolute -top-16 rounded-full'>
                    <img
                        src={user.profile_picture}
                        alt=''
                        className='absolute rounded-full z-2'
                    />
                </div>

                <div className='w-full pt-16 md:pt-0 md:pl-36'>
                    <div className='flex flex-col md:flex-row items-start justify-between'>
                        <div>
                            <div className='flex items-center gap-2.5'>
                                <h1 className='text-2xl font-bold text-text-primary'>
                                    {user.full_name}
                                </h1>
                                <Verified className='w-6 h-6 text-google-blue' />
                            </div>
                            <p className='text-text-tertiary mt-0.5'>
                                {user.username
                                    ? `@${user.username}`
                                    : 'Add a username'}
                            </p>
                        </div>

                        {!profileId && (
                            <button
                                onClick={() => setShowEdit(true)}
                                className='flex items-center gap-2 border border-border px-5 py-2 rounded-full font-medium text-sm text-text-primary hover:bg-surface-hover transition-colors duration-200 mt-4 md:mt-0 cursor-pointer'
                            >
                                <PenBox className='w-4 h-4' />
                                Edit
                            </button>
                        )}
                    </div>

                    <p className='text-text-secondary text-sm max-w-md mt-4 leading-relaxed'>
                        {user.bio}
                    </p>

                    <div className='flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-tertiary mt-4'>
                        <span className='flex items-center gap-1.5'>
                            <MapPin className='w-4 h-4' />
                            {user.location
                                ? user.location
                                : 'Add location'}
                        </span>
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='w-4 h-4' />
                            Joined{' '}
                            <span className='font-medium text-text-secondary'>
                                {moment(user.createdAt).fromNow()}
                            </span>
                        </span>
                    </div>

                    <div className='flex items-center gap-8 mt-6 border-t border-border-light pt-5'>
                        <div className='text-center'>
                            <span className='sm:text-xl font-bold text-text-primary'>
                                {posts.length}
                            </span>
                            <span className='text-xs sm:text-sm text-text-tertiary ml-1.5'>
                                Posts
                            </span>
                        </div>
                        <div className='text-center'>
                            <span className='sm:text-xl font-bold text-text-primary'>
                                {user?.followers?.length || 0}
                            </span>
                            <span className='text-xs sm:text-sm text-text-tertiary ml-1.5'>
                                Followers
                            </span>
                        </div>
                        <div className='text-center'>
                            <span className='sm:text-xl font-bold text-text-primary'>
                                {user?.following?.length || 0}
                            </span>
                            <span className='text-xs sm:text-sm text-text-tertiary ml-1.5'>
                                Following
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfileInfo