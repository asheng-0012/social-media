import React from 'react'

const Loading = ({ height = '100vh' }) => {
    return (
        <div style={{ height }} className='flex flex-col items-center justify-center bg-white'>
            <div className='flex gap-1.5'>
                <div className='w-3 h-3 rounded-full bg-google-blue animate-bounce [animation-delay:-0.32s]'></div>
                <div className='w-3 h-3 rounded-full bg-google-red animate-bounce [animation-delay:-0.16s]'></div>
                <div className='w-3 h-3 rounded-full bg-google-yellow animate-bounce'></div>
                <div className='w-3 h-3 rounded-full bg-google-green animate-bounce [animation-delay:-0.32s]'></div>
            </div>
        </div>
    )
}

export default Loading