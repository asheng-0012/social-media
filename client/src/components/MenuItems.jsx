import React from 'react'
import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router-dom'

const MenuItems = ({ setSidebarOpen }) => {
    return (
        <div className='px-4 text-text-secondary space-y-0.5 font-medium text-[14.5px]'>
            {menuItemsData.map(({ to, label, Icon }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                        `px-4 py-2.5 flex items-center gap-3.5 rounded-full transition-all duration-200 ${
                            isActive
                                ? 'bg-surface-active text-google-blue font-semibold'
                                : 'hover:bg-surface-hover text-text-secondary'
                        }`
                    }
                >
                    <Icon className='w-5 h-5' />
                    {label}
                </NavLink>
            ))}
        </div>
    )
}

export default MenuItems