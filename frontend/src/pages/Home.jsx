import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {

  const navigate = useNavigate()

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>

      <h1 className='text-3xl font-bold'>ยินดีต้อนรับ 👋</h1>
      <p className='mt-2'>กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>

      <button
        onClick={() => navigate('/login')}
        className='mt-4 px-6 py-2 bg-blue-500 text-white rounded'
      >
        ไปหน้า Login
      </button>

    </div>
  )
}

export default Home
