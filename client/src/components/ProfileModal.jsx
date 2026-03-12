import React, { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../features/user/userSlice'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const ProfileModal = ({ setShowEdit }) => {
    const dispatch = useDispatch()
    const { getToken } = useAuth()

    const user = useSelector((state) => state.user.value)
    const [editForm, setEditForm] = useState({
        username: user.username,
        bio: user.bio,
        location: user.location,
        profile_picture: null,
        cover_photo: null,
        full_name: user.full_name,
    })

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        try {
            const userData = new FormData()
            const {
                full_name,
                username,
                bio,
                location,
                profile_picture,
                cover_photo,
            } = editForm

            userData.append('username', username)
            userData.append('bio', bio)
            userData.append('location', location)
            userData.append('full_name', full_name)
            profile_picture && userData.append('profile', profile_picture)
            cover_photo && userData.append('cover', cover_photo)

            const token = await getToken()
            dispatch(updateUser({ userData, token }))

            setShowEdit(false)
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='fixed inset-0 z-110 h-screen overflow-y-scroll bg-black/40 backdrop-blur-sm'>
            <div className='max-w-2xl sm:py-8 mx-auto px-4'>
                <div className='bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] p-6 sm:p-8'>
                    {/* Header */}
                    <div className='flex items-center justify-between mb-8'>
                        <h1 className='text-xl font-semibold text-text-primary'>
                            Edit Profile
                        </h1>
                        <button
                            onClick={() => setShowEdit(false)}
                            className='p-2 rounded-full hover:bg-surface-hover transition-colors duration-200 cursor-pointer'
                        >
                            <X className='w-5 h-5 text-text-tertiary' />
                        </button>
                    </div>

                    <form
                        className='space-y-5'
                        onSubmit={(e) =>
                            toast.promise(handleSaveProfile(e), {
                                loading: 'Saving...',
                            })
                        }
                    >
                        {/* Profile Picture */}
                        <div className='flex flex-col items-start gap-3'>
                            <label
                                htmlFor='profile_picture'
                                className='block text-sm font-medium text-text-secondary mb-1'
                            >
                                Profile Picture
                                <input
                                    hidden
                                    type='file'
                                    accept='image/*'
                                    id='profile_picture'
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            profile_picture: e.target.files[0],
                                        })
                                    }
                                />
                                <div className='group/profile relative mt-2 cursor-pointer'>
                                    <img
                                        src={
                                            editForm.profile_picture
                                                ? URL.createObjectURL(
                                                      editForm.profile_picture
                                                  )
                                                : user.profile_picture
                                        }
                                        alt=''
                                        className='w-24 h-24 rounded-full object-cover ring-2 ring-border-light'
                                    />
                                    <div className='absolute hidden group-hover/profile:flex inset-0 bg-black/30 rounded-full items-center justify-center transition-all duration-200'>
                                        <Pencil className='w-5 h-5 text-white' />
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Cover Photo */}
                        <div className='flex flex-col items-start gap-3'>
                            <label
                                htmlFor='cover_photo'
                                className='block text-sm font-medium text-text-secondary mb-1'
                            >
                                Cover Photo
                                <input
                                    hidden
                                    type='file'
                                    accept='image/*'
                                    id='cover_photo'
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            cover_photo: e.target.files[0],
                                        })
                                    }
                                />
                                <div className='group/cover relative mt-2 cursor-pointer'>
                                    <img
                                        src={
                                            editForm.cover_photo
                                                ? URL.createObjectURL(
                                                      editForm.cover_photo
                                                  )
                                                : user.cover_photo
                                        }
                                        alt=''
                                        className='w-80 h-40 rounded-2xl bg-gradient-to-br from-google-blue/20 via-google-red/10 to-google-yellow/20 object-cover'
                                    />
                                    <div className='absolute hidden group-hover/cover:flex inset-0 bg-black/30 rounded-2xl items-center justify-center transition-all duration-200'>
                                        <Pencil className='w-5 h-5 text-white' />
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Name */}
                        <div>
                            <label className='block text-sm font-medium text-text-secondary mb-1.5'>
                                Name
                            </label>
                            <input
                                type='text'
                                className='w-full px-4 py-2.5 border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all duration-200'
                                placeholder='Please enter your full name'
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        full_name: e.target.value,
                                    })
                                }
                                value={editForm.full_name}
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className='block text-sm font-medium text-text-secondary mb-1.5'>
                                Username
                            </label>
                            <input
                                type='text'
                                className='w-full px-4 py-2.5 border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all duration-200'
                                placeholder='Please enter a username'
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        username: e.target.value,
                                    })
                                }
                                value={editForm.username}
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className='block text-sm font-medium text-text-secondary mb-1.5'>
                                Bio
                            </label>
                            <textarea
                                rows={3}
                                className='w-full px-4 py-2.5 border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all duration-200 resize-none'
                                placeholder='Please enter a short bio'
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        bio: e.target.value,
                                    })
                                }
                                value={editForm.bio}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className='block text-sm font-medium text-text-secondary mb-1.5'>
                                Location
                            </label>
                            <input
                                type='text'
                                className='w-full px-4 py-2.5 border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all duration-200'
                                placeholder='Please enter your location'
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        location: e.target.value,
                                    })
                                }
                                value={editForm.location}
                            />
                        </div>

                        {/* Actions */}
                        <div className='flex justify-end gap-3 pt-6 border-t border-border-light'>
                            <button
                                onClick={() => setShowEdit(false)}
                                type='button'
                                className='px-6 py-2.5 border border-border rounded-full text-text-secondary text-sm font-medium hover:bg-surface-hover transition-colors duration-200 cursor-pointer'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                className='px-6 py-2.5 bg-google-blue text-white rounded-full text-sm font-medium hover:bg-google-blue/90 hover:shadow-lg hover:shadow-google-blue/25 transition-all duration-200 cursor-pointer'
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ProfileModal